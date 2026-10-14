// Straightforward Riverpod state (Architecture Decision 1).
// Uses the flutter_riverpod 3.x Notifier API.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/incident_repository.dart';
import '../models/app_user.dart';
import '../models/incident.dart';

final incidentRepositoryProvider =
    NotifierProvider<IncidentRepository, IncidentRepoState>(
  IncidentRepository.new,
);

class RoleNotifier extends Notifier<UserRole> {
  @override
  UserRole build() => UserRole.student;

  void setRole(UserRole role) => state = role;
}

final currentRoleProvider =
    NotifierProvider<RoleNotifier, UserRole>(RoleNotifier.new);

final currentUserProvider = Provider<AppUser>((ref) {
  final role = ref.watch(currentRoleProvider);
  switch (role) {
    case UserRole.student:
      return const AppUser(
          id: 'student-1', name: 'Student', role: UserRole.student);
    case UserRole.responder:
      return const AppUser(
          id: 'responder-1',
          name: 'Campus Responder',
          role: UserRole.responder);
    case UserRole.admin:
      return const AppUser(
          id: 'admin-1', name: 'Campus Admin', role: UserRole.admin);
  }
});

final incidentListProvider = Provider<List<Incident>>((ref) {
  return ref.watch(incidentRepositoryProvider).incidents;
});

final activeIncidentsProvider = Provider<List<Incident>>((ref) {
  return ref.watch(incidentListProvider).where((i) =>
      i.status == IncidentStatus.sent ||
      i.status == IncidentStatus.acknowledged).toList();
});

final pendingIncidentsProvider = Provider<List<Incident>>((ref) {
  return ref.watch(incidentListProvider)
      .where((i) => i.status == IncidentStatus.pending).toList();
});

Incident? incidentById(List<Incident> list, String id) {
  try {
    return list.firstWhere((e) => e.id == id);
  } catch (_) {
    return null;
  }
}
