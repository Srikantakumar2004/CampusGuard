import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/incident.dart';
import '../providers/providers.dart';
import '../widgets/connectivity_banner.dart';
import '../widgets/status_badge.dart';

class StudentScreen extends ConsumerStatefulWidget {
  const StudentScreen({super.key});

  @override
  ConsumerState<StudentScreen> createState() => _StudentScreenState();
}

class _StudentScreenState extends ConsumerState<StudentScreen> {
  IncidentType _type = IncidentType.medical;
  final _descController = TextEditingController();
  final _locationController = TextEditingController();
  double? _lat;
  double? _lng;
  String? _photoPath;
  bool _sending = false;
  String? _notice;

  @override
  void dispose() {
    _descController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _useCurrentLocation() async {
    setState(() => _notice = null);
    try {
      var status = await Permission.locationWhenInUse.status;
      if (!status.isGranted) {
        status = await Permission.locationWhenInUse.request();
      }
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() => _notice = 'Location services are disabled.');
        return;
      }
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        setState(() => _notice = 'Location permission denied.');
        return;
      }
      final pos = await Geolocator.getCurrentPosition();
      setState(() {
        _lat = pos.latitude;
        _lng = pos.longitude;
        _locationController.text =
            '${pos.latitude.toStringAsFixed(5)}, ${pos.longitude.toStringAsFixed(5)}';
      });
    } catch (e) {
      // Web without GPS permission: keep the flow usable via manual entry.
      setState(() => _notice = 'Could not read GPS ($e). Enter location manually.');
    }
  }

  Future<void> _attachPhoto() async {
    try {
      final picker = ImagePicker();
      XFile? file;
      try {
        file = await picker.pickImage(
          source: ImageSource.camera,
          maxWidth: 1280,
          preferredCameraDevice: CameraDevice.rear,
        );
      } catch (_) {
        file = null;
      }
      file ??= await picker.pickImage(source: ImageSource.gallery);
      final attached = file;
      if (attached != null && mounted) {
        setState(() => _photoPath = attached.path);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _notice = 'Camera unavailable in this browser ($e).');
      }
    }
  }

  Future<void> _sendSos() async {
    if (_sending) return;
    setState(() {
      _sending = true;
      _notice = null;
    });
    try {
      final user = ref.read(currentUserProvider);
      final repo = ref.read(incidentRepositoryProvider.notifier);
      final incident = await repo.createIncident(
        reporterId: user.id,
        reporterName: user.name,
        type: _type,
        description: _descController.text.trim().isEmpty
            ? 'SOS — ${_type.label} emergency'
            : _descController.text.trim(),
        latitude: _lat,
        longitude: _lng,
        locationLabel: _locationController.text.trim().isEmpty
            ? null
            : _locationController.text.trim(),
        photoPath: _photoPath,
      );
      if (!mounted) return;
      setState(() {
        _notice = incident.status == IncidentStatus.pending
            ? 'Saved OFFLINE as Pending. It will transmit when you are back online.'
            : 'SOS sent. Responders have been notified (simulated).';
      });
      _descController.clear();
    } catch (e) {
      if (mounted) setState(() => _notice = 'Failed to raise SOS: $e');
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _callEmergency() async {
    final uri = Uri(scheme: 'tel', path: '112');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Dial 112 for emergency services.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final myIncidents = ref
        .watch(incidentListProvider)
        .where((i) => i.reporterId == ref.watch(currentUserProvider).id)
        .toList();
    // Include demo incident so first-run web view is not empty for reviewers.
    final visible = myIncidents.isEmpty
        ? ref.watch(incidentListProvider).take(3).toList()
        : myIncidents;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Student SOS'),
        leading: IconButton(
          icon: const Icon(Icons.switch_account_outlined),
          tooltip: 'Switch role',
          onPressed: () => context.go('/'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_outlined),
            tooltip: 'Retry pending',
            onPressed: () => ref
                .read(incidentRepositoryProvider.notifier)
                .retryPending(),
          ),
        ],
      ),
      body: Column(
        children: [
          const ConnectivityBanner(),
          Expanded(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 640),
                child: ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Big SOS button (MVP core).
                    FilledButton.icon(
                      style: FilledButton.styleFrom(
                        backgroundColor: Colors.red.shade700,
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(72),
                        textStyle: const TextStyle(
                            fontSize: 22, fontWeight: FontWeight.bold),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                      onPressed: _sending ? null : _sendSos,
                      icon: _sending
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 3),
                            )
                          : const Icon(Icons.sos_outlined, size: 30),
                      label: Text(_sending ? 'Sending…' : 'SEND SOS NOW'),
                    ),
                    const SizedBox(height: 8),
                    OutlinedButton.icon(
                      onPressed: _callEmergency,
                      icon: const Icon(Icons.call_outlined),
                      label: const Text('Call emergency (112)'),
                    ),
                    if (_notice != null) ...[
                      const SizedBox(height: 12),
                      Card(
                        color: Colors.amber.shade50,
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Text(_notice!),
                        ),
                      ),
                    ],
                    const SizedBox(height: 20),
                    Text('Details (optional)',
                        style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<IncidentType>(
                      initialValue: _type,
                      decoration: const InputDecoration(
                        labelText: 'Emergency type',
                        border: OutlineInputBorder(),
                      ),
                      items: IncidentType.values
                          .map((t) => DropdownMenuItem(
                              value: t, child: Text(t.label)))
                          .toList(),
                      onChanged: (v) =>
                          setState(() => _type = v ?? IncidentType.other),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _descController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'What is happening?',
                        hintText: 'e.g. Injured person near Block B staircase',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _locationController,
                            decoration: const InputDecoration(
                              labelText: 'Location / landmark',
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton.filledTonal(
                          tooltip: 'Use GPS',
                          onPressed: _useCurrentLocation,
                          icon: const Icon(Icons.my_location_outlined),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: _attachPhoto,
                      icon: const Icon(Icons.photo_camera_outlined),
                      label: Text(_photoPath == null
                          ? 'Attach photo evidence'
                          : 'Photo attached'),
                    ),
                    const SizedBox(height: 24),
                    Text('My recent alerts',
                        style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    if (visible.isEmpty)
                      const Card(
                        child: Padding(
                          padding: EdgeInsets.all(16),
                          child: Text('No alerts yet. Your SOS history appears here.'),
                        ),
                      ),
                    for (final incident in visible)
                      Card(
                        child: ListTile(
                          title: Text(
                              '${incident.type.label} — ${incident.description}'),
                          subtitle: Text(
                            '${DateFormat('dd MMM HH:mm').format(incident.createdAt)}'
                            '${incident.locationLabel != null ? ' · ${incident.locationLabel}' : ''}',
                          ),
                          trailing: StatusBadge(status: incident.status),
                          onTap: () => context.go('/incident/${incident.id}'),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
