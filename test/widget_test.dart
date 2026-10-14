import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive/hive.dart';

import 'package:campus_sos/main.dart';

void main() {
  setUpAll(() async {
    final dir = await Directory.systemTemp.createTemp('campus_sos_test');
    Hive.init(dir.path);
  });

  tearDownAll(() async {
    // Hive.close() can hang under the test binding if a box still has
    // pending backend work; never fail a green suite on teardown.
    try {
      await Hive.close().timeout(const Duration(seconds: 5));
    } catch (_) {}
  });

  testWidgets('CampusGuard boots to role gate', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: CampusGuardApp()));
    // Repository boot does real file I/O (Hive), which stalls under the
    // FakeAsync clock used by pump(). Alternate short real-time waits
    // (I/O progresses) with pumps (frames render), exiting early.
    for (var i = 0; i < 20; i++) {
      await tester.runAsync(
        () => Future<void>.delayed(const Duration(milliseconds: 300)),
      );
      await tester.pump(const Duration(milliseconds: 100));
      if (find.text('CampusGuard').evaluate().isNotEmpty) break;
    }
    expect(find.text('CampusGuard'), findsWidgets);
    expect(find.text('Continue as Student'), findsOneWidget);
  });
}
