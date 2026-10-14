import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../models/app_user.dart';
import '../providers/providers.dart';

class RoleGateScreen extends ConsumerWidget {
  const RoleGateScreen({super.key});

  void _pick(BuildContext context, WidgetRef ref, UserRole role) {
    ref.read(currentRoleProvider.notifier).setRole(role);
    switch (role) {
      case UserRole.student:
        context.go('/student');
        break;
      case UserRole.responder:
        context.go('/responder');
        break;
      case UserRole.admin:
        context.go('/admin');
        break;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('CampusGuard')),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 560),
          child: ListView(
            padding: const EdgeInsets.all(24),
            shrinkWrap: true,
            children: [
              Icon(Icons.shield_outlined,
                  size: 72, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 16),
              Text(
                'Campus emergency response',
                style: Theme.of(context).textTheme.headlineSmall,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'Minimal MVP: student raises SOS, responder acknowledges, '
                'admin oversees. Works offline with honest pending states.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              for (final role in UserRole.values)
                Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: Icon(
                      switch (role) {
                        UserRole.student => Icons.person_outline,
                        UserRole.responder => Icons.medical_services_outlined,
                        UserRole.admin => Icons.admin_panel_settings_outlined,
                      },
                      size: 32,
                    ),
                    title: Text('Continue as ${role.label}'),
                    subtitle: Text(role.description),
                    trailing: const Icon(Icons.arrow_forward),
                    onTap: () => _pick(context, ref, role),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
