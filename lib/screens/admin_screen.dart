import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../models/incident.dart';
import '../providers/providers.dart';
import '../widgets/connectivity_banner.dart';
import '../widgets/status_badge.dart';

class AdminScreen extends ConsumerWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final repo = ref.read(incidentRepositoryProvider.notifier);
    final all = ref.watch(incidentListProvider);
    final counts = {
      for (final s in IncidentStatus.values)
        s: all.where((i) => i.status == s).length,
    };

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin overview'),
        leading: IconButton(
          icon: const Icon(Icons.switch_account_outlined),
          tooltip: 'Switch role',
          onPressed: () => context.go('/'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_sweep_outlined),
            tooltip: 'Clear resolved',
            onPressed: () => repo.deleteAllResolved(),
          ),
        ],
      ),
      body: Column(
        children: [
          const ConnectivityBanner(),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              alignment: WrapAlignment.center,
              children: [
                _StatCard(
                    label: 'Total', value: all.length, color: Colors.black87),
                _StatCard(
                    label: 'Pending',
                    value: counts[IncidentStatus.pending] ?? 0,
                    color: Colors.orange.shade800),
                _StatCard(
                    label: 'Sent',
                    value: counts[IncidentStatus.sent] ?? 0,
                    color: Colors.blue.shade800),
                _StatCard(
                    label: 'Acknowledged',
                    value: counts[IncidentStatus.acknowledged] ?? 0,
                    color: Colors.green.shade800),
                _StatCard(
                    label: 'Resolved',
                    value: counts[IncidentStatus.resolved] ?? 0,
                    color: Colors.grey.shade700),
              ],
            ),
          ),
          Expanded(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 760),
                child: all.isEmpty
                    ? const Center(child: Text('No incidents recorded.'))
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        itemCount: all.length,
                        itemBuilder: (context, index) {
                          final incident = all[index];
                          return Card(
                            child: ListTile(
                              title: Text(
                                  '${incident.type.label} — ${incident.reporterName}'),
                              subtitle: Text(
                                '${incident.description}\n${DateFormat('dd MMM HH:mm').format(incident.createdAt)}',
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
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final int value;
  final Color color;
  const _StatCard(
      {required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Column(
          children: [
            Text('$value',
                style: Theme.of(context)
                    .textTheme
                    .headlineMedium
                    ?.copyWith(color: color)),
            Text(label),
          ],
        ),
      ),
    );
  }
}
