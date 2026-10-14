import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/incident.dart';
import '../providers/providers.dart';
import '../widgets/status_badge.dart';

class IncidentDetailScreen extends ConsumerWidget {
  final String incidentId;
  const IncidentDetailScreen({super.key, required this.incidentId});

  Future<void> _openMaps(BuildContext context, Incident incident) async {
    if (incident.latitude == null || incident.longitude == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No GPS coordinates for this alert.')),
      );
      return;
    }
    final uri = Uri.parse(
        'https://www.google.com/maps/search/?api=1&query=${incident.latitude},${incident.longitude}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final all = ref.watch(incidentListProvider);
    final incident = incidentById(all, incidentId);
    final repo = ref.read(incidentRepositoryProvider.notifier);
    final user = ref.watch(currentUserProvider);

    if (incident == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Incident')),
        body: const Center(child: Text('Incident not found.')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('${incident.type.label} incident'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 640),
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              StatusBadge(status: incident.status),
              const SizedBox(height: 12),
              Text(incident.description,
                  style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              Text(
                'Reported by ${incident.reporterName} · '
                '${DateFormat('dd MMM yyyy, HH:mm').format(incident.createdAt)}',
              ),
              const Divider(height: 32),
              _Row(
                  label: 'Type',
                  value: incident.type.label),
              _Row(
                  label: 'Location',
                  value: incident.locationLabel ??
                      (incident.latitude != null
                          ? '${incident.latitude}, ${incident.longitude}'
                          : 'Not provided')),
              _Row(label: 'Status', value: incident.status.label),
              if (incident.acknowledgedBy != null)
                _Row(label: 'Acknowledged by', value: incident.acknowledgedBy!),
              if (incident.photoPath != null)
                _Row(label: 'Photo ref', value: incident.photoPath!),
              const SizedBox(height: 24),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  OutlinedButton.icon(
                    onPressed: () => _openMaps(context, incident),
                    icon: const Icon(Icons.map_outlined),
                    label: const Text('Open in Maps'),
                  ),
                  if (incident.status == IncidentStatus.sent)
                    FilledButton.icon(
                      onPressed: () =>
                          repo.acknowledge(incident.id, by: user.name),
                      icon: const Icon(Icons.verified_outlined),
                      label: const Text('Acknowledge'),
                    ),
                  if (incident.status == IncidentStatus.acknowledged ||
                      incident.status == IncidentStatus.sent)
                    FilledButton.tonalIcon(
                      onPressed: () => repo.resolve(incident.id),
                      icon: const Icon(Icons.check_circle_outline),
                      label: const Text('Mark resolved'),
                    ),
                  if (incident.status == IncidentStatus.pending)
                    FilledButton.icon(
                      onPressed: () => repo.retryPending(),
                      icon: const Icon(Icons.cloud_upload_outlined),
                      label: const Text('Retry transmission'),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  const _Row({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(label,
                style: const TextStyle(fontWeight: FontWeight.w600)),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
