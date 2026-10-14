// Firebase-first backend target (Architecture Decision 4).
//
// This repository exposes a Firebase-shaped API (create / stream / update
// status) but is backed by Hive locally so the web MVP runs with zero
// Firebase configuration. Swap the internals here with firebase_auth +
// cloud_firestore + firebase_storage + firebase_messaging without touching
// UI code.
//
// Offline contract (Architecture Decision 6):
// - No connectivity  -> new incidents stay `pending`
// - Connectivity OK  -> simulated transmit flips `pending` -> `sent`
// - `retryPending()` lets the student explicitly re-transmit.
//
// Implemented as a Riverpod [Notifier] (flutter_riverpod 3.x API).

import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:uuid/uuid.dart';

import '../models/incident.dart';

class IncidentRepoState {
  final List<Incident> incidents;
  final bool online;
  final bool ready;

  const IncidentRepoState({
    this.incidents = const [],
    this.online = true,
    this.ready = false,
  });

  IncidentRepoState copyWith({
    List<Incident>? incidents,
    bool? online,
    bool? ready,
  }) {
    return IncidentRepoState(
      incidents: incidents ?? this.incidents,
      online: online ?? this.online,
      ready: ready ?? this.ready,
    );
  }

  int get pendingCount =>
      incidents.where((i) => i.status == IncidentStatus.pending).length;

  int get activeCount => incidents
      .where((i) =>
          i.status == IncidentStatus.sent ||
          i.status == IncidentStatus.acknowledged)
      .length;

  Incident? byId(String id) {
    try {
      return incidents.firstWhere((e) => e.id == id);
    } catch (_) {
      return null;
    }
  }
}

class IncidentRepository extends Notifier<IncidentRepoState> {
  static const String boxName = 'incidents_box';
  static const _uuid = Uuid();

  Box? _box;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySub;

  @override
  IncidentRepoState build() {
    ref.onDispose(() {
      // cancel() can complete with platform-channel errors (e.g. in tests);
      // never let dispose crash.
      _connectivitySub?.cancel().ignore();
    });
    // Async boot; UI gates on `ready`.
    Future(_boot);
    return const IncidentRepoState();
  }

  Future<void> _boot() async {
    try {
      await _bootInner();
    } catch (_) {
      // Storage or connectivity unavailable: fall back to in-memory state.
    } finally {
      // Never leave the UI stuck on the boot spinner.
      if (ref.mounted && !state.ready) {
        _emit(ready: true);
      }
    }
  }

  Future<void> _bootInner() async {
    final loaded = <Incident>[];
    try {
      _box = await Hive.openBox(boxName);
      for (final value in _box!.values) {
        try {
          if (value is Map) {
            loaded.add(Incident.fromMap(Map<String, dynamic>.from(value)));
          }
        } catch (_) {
          // Skip corrupt rows, keep the rest.
        }
      }
      // Seed a demo incident on first run so responder/admin views are alive.
      if (loaded.isEmpty) {
        final now = DateTime.now();
        loaded.add(Incident(
          id: _uuid.v4(),
          reporterId: 'demo-student',
          reporterName: 'Demo Student',
          type: IncidentType.medical,
          description: 'Demo: student fainted near central library.',
          latitude: 17.3850,
          longitude: 78.4867,
          locationLabel: 'Central Library, Ground Floor',
          status: IncidentStatus.sent,
          createdAt: now.subtract(const Duration(minutes: 12)),
          updatedAt: now.subtract(const Duration(minutes: 12)),
        ));
        await _persist(loaded);
      }
    } catch (_) {
      // Hive unavailable (e.g. restricted web context): run in-memory only.
      _box = null;
    }

    bool online = true;
    try {
      online = await _checkOnline();
      _connectivitySub =
          Connectivity().onConnectivityChanged.listen((results) async {
        final nowOnline =
            results.any((r) => r != ConnectivityResult.none);
        final wasOnline = state.online;
        _emit(online: nowOnline);
        if (!wasOnline && nowOnline) {
          await retryPending();
        }
      });
    } catch (_) {
      online = true;
    }
    _emit(incidents: loaded, online: online, ready: true);
  }

  Future<bool> _checkOnline() async {
    try {
      final results = await Connectivity().checkConnectivity();
      return results.any((r) => r != ConnectivityResult.none);
    } catch (_) {
      return true;
    }
  }

  void _emit({
    List<Incident>? incidents,
    bool? online,
    bool? ready,
  }) {
    if (!ref.mounted) return;
    final list = List<Incident>.of(incidents ?? state.incidents);
    list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    state = state.copyWith(
      incidents: List.unmodifiable(list),
      online: online,
      ready: ready,
    );
  }

  Future<void> refreshConnectivity() async {
    final online = await _checkOnline();
    _emit(online: online);
    if (online) await retryPending();
  }

  Future<Incident> createIncident({
    required String reporterId,
    required String reporterName,
    required IncidentType type,
    required String description,
    double? latitude,
    double? longitude,
    String? locationLabel,
    String? photoPath,
  }) async {
    final online = await _checkOnline();
    final now = DateTime.now();
    final incident = Incident(
      id: _uuid.v4(),
      reporterId: reporterId,
      reporterName: reporterName,
      type: type,
      description: description,
      latitude: latitude,
      longitude: longitude,
      locationLabel: locationLabel,
      photoPath: photoPath,
      // Honest state: pending when offline, sent when transmitted.
      status: online ? IncidentStatus.sent : IncidentStatus.pending,
      createdAt: now,
      updatedAt: now,
    );
    final next = List<Incident>.of(state.incidents)..add(incident);
    await _persist(next);
    _emit(incidents: next, online: online);

    // Simulate network transmit latency for the online path.
    if (online) {
      await Future<void>.delayed(const Duration(milliseconds: 600));
    }
    return incident;
  }

  /// Re-attempt transmission of everything stuck in `pending`.
  Future<int> retryPending() async {
    final online = await _checkOnline();
    if (!online) {
      _emit(online: false);
      return 0;
    }
    var flushed = 0;
    final next = <Incident>[];
    for (final incident in state.incidents) {
      if (incident.status == IncidentStatus.pending) {
        flushed++;
        next.add(incident.copyWith(status: IncidentStatus.sent));
      } else {
        next.add(incident);
      }
    }
    if (flushed > 0) {
      await Future<void>.delayed(const Duration(milliseconds: 500));
      await _persist(next);
    }
    _emit(incidents: next, online: true);
    return flushed;
  }

  Future<void> acknowledge(String id, {required String by}) async {
    final next = [
      for (final incident in state.incidents)
        if (incident.id == id)
          incident.copyWith(
            status: IncidentStatus.acknowledged,
            acknowledgedBy: by,
          )
        else
          incident,
    ];
    await _persist(next);
    _emit(incidents: next);
  }

  Future<void> resolve(String id) async {
    final next = [
      for (final incident in state.incidents)
        if (incident.id == id)
          incident.copyWith(status: IncidentStatus.resolved)
        else
          incident,
    ];
    await _persist(next);
    _emit(incidents: next);
  }

  Future<void> deleteAllResolved() async {
    final next = state.incidents
        .where((e) => e.status != IncidentStatus.resolved)
        .toList();
    await _persist(next);
    _emit(incidents: next);
  }

  Future<void> _persist(List<Incident> incidents) async {
    try {
      final box = _box;
      if (box == null) return;
      await box.clear();
      for (final incident in incidents) {
        await box.add(incident.toMap());
      }
    } catch (_) {
      // Persistence is best-effort; in-memory state still works.
    }
  }
}
