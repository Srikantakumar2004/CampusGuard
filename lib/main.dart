import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'providers/providers.dart';
import 'router/app_router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Hive.initFlutter();
  } catch (_) {
    // Web storage unavailable: repository falls back to in-memory mode.
  }
  runApp(const ProviderScope(child: CampusGuardApp()));
}

class CampusGuardApp extends ConsumerStatefulWidget {
  const CampusGuardApp({super.key});

  @override
  ConsumerState<CampusGuardApp> createState() => _CampusGuardAppState();
}

class _CampusGuardAppState extends ConsumerState<CampusGuardApp> {
  late final GoRouter _router = buildRouter();

  @override
  Widget build(BuildContext context) {
    final ready = ref.watch(
      incidentRepositoryProvider.select((s) => s.ready),
    );
    return MaterialApp.router(
      title: 'CampusGuard',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.red.shade700),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.red.shade700,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      routerConfig: _router,
      builder: (context, child) {
        if (!ready) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        return child ?? const SizedBox.shrink();
      },
    );
  }
}
