import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/providers.dart';

/// Honest connectivity banner (Architecture Decision 6).
/// Never implies an emergency was transmitted when it was not.
class ConnectivityBanner extends ConsumerWidget {
  const ConnectivityBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final repoState = ref.watch(incidentRepositoryProvider);
    if (repoState.online && repoState.pendingCount == 0) {
      return const SizedBox.shrink();
    }
    final message = !repoState.online
        ? 'Offline — new SOS alerts will be queued as Pending.'
        : '${repoState.pendingCount} pending alert(s) not yet transmitted.';
    return MaterialBanner(
      backgroundColor:
          !repoState.online ? Colors.orange.shade100 : Colors.blue.shade50,
      leading: Icon(
        repoState.online
            ? Icons.cloud_upload_outlined
            : Icons.wifi_off_outlined,
        color: Colors.black87,
      ),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () =>
              ref.read(incidentRepositoryProvider.notifier).retryPending(),
          child: const Text('Retry now'),
        ),
      ],
    );
  }
}
