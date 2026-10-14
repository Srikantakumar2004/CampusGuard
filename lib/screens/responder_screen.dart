import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../models/incident.dart';
import '../providers/providers.dart';
import '../widgets/connectivity_banner.dart';
import '../widgets/status_badge.dart';

class ResponderScreen extends ConsumerWidget {
  const ResponderScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final repo = ref.read(incidentRepositoryProvider.notifier);
    final incidents = ref.watch(activeIncidentsProvider);
    final pending = ref.watch(pendingIncidentsProvider);
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('Responder inbox (${incidents.length} active)'),
        leading: IconButton(
          icon: const Icon(Icons.switch_account_outlined),
          tooltip: 'Switch role',
          onPressed: () => context.go('/'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_outlined),
            onPressed: () => repo.refreshConnectivity(),
          ),
        ],
      ),
      body: Column(
        children: [
          const ConnectivityBanner(),
          if (pending.isNotEmpty)
            ListTile(
              leading: const Icon(Icons.cloud_off_outlined),
              title: Text('${pending.length} device-pending alert(s)'),
              subtitle:
                  const Text('Still on student devices, not yet transmitted.'),
            ),
          Expanded(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 720),
                child: incidents.isEmpty
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32),
                          child: Text(
                            'No active incidents.\nNew SOS alerts appear here in real time (simulated stream).',
                            textAlign: TextAlign.center,
                          ),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: incidents.length,
                        itemBuilder: (context, index) {
                          final incident = incidents[index];
                          return Card(
                            child: ListTile(
                              leading: Icon(
                                switch (incident.type) {
                                  IncidentType.medical =>
                                    Icons.medical_services_outlined,
                                  IncidentType.fire =>
                                    Icons.local_fire_department_outlined,
                                  IncidentType.security =>
                                    Icons.security_outlined,
                                  IncidentType.naturalDisaster =>
                                    Icons.flood_outlined,
                                  IncidentType.other => Icons.report_outlined,
                                },
                                size: 32,
                              ),
                              title: Text(
                                  '${incident.type.label} — ${incident.reporterName}'),
                              subtitle: Text(
                                '${incident.description}\n'
                                '${DateFormat('dd MMM HH:mm').format(incident.createdAt)}'
                                '${incident.locationLabel != null ? ' · ${incident.locationLabel}' : ''}',
                              ),
                              isThreeLine: true,
                              trailing: StatusBadge(status: incident.status),
                              onTap: () =>
                                  context.go('/incident/${incident.id}'),
                            ),
                          );
                        },
                      ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (incidents.isNotEmpty)
                  FilledButton.icon(
                    onPressed: () =>
                        repo.acknowledge(incidents.first.id, by: user.name),
                    icon: const Icon(Icons.verified_outlined),
                    label: const Text('Acknowledge newest'),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
