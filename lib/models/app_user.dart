// App-wide user / role model.
// Keeps UI and backend logic consistent (Architecture Decision 3).

enum UserRole { student, responder, admin }

extension UserRoleX on UserRole {
  String get label {
    switch (this) {
      case UserRole.student:
        return 'Student';
      case UserRole.responder:
        return 'Responder';
      case UserRole.admin:
        return 'Admin';
    }
  }

  String get description {
    switch (this) {
      case UserRole.student:
        return 'Raise SOS alerts with location and photo evidence.';
      case UserRole.responder:
        return 'View incoming alerts, acknowledge and respond.';
      case UserRole.admin:
        return 'Oversee all incidents, analytics and resolution.';
    }
  }
}

class AppUser {
  final String id;
  final String name;
  final UserRole role;

  const AppUser({required this.id, required this.name, required this.role});

  AppUser copyWith({String? id, String? name, UserRole? role}) {
    return AppUser(
      id: id ?? this.id,
      name: name ?? this.name,
      role: role ?? this.role,
    );
  }
}
