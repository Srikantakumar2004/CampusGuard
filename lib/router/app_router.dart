// GoRouter declarative navigation (Architecture Decision 2).
// Deep-link-safe: /student, /responder, /admin, /incident/:id.

import 'package:go_router/go_router.dart';

import '../screens/admin_screen.dart';
import '../screens/incident_detail_screen.dart';
import '../screens/responder_screen.dart';
import '../screens/role_gate_screen.dart';
import '../screens/student_screen.dart';

GoRouter buildRouter() {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        name: 'role-gate',
        builder: (context, state) => const RoleGateScreen(),
      ),
      GoRoute(
        path: '/student',
        name: 'student',
        builder: (context, state) => const StudentScreen(),
      ),
      GoRoute(
        path: '/responder',
        name: 'responder',
        builder: (context, state) => const ResponderScreen(),
      ),
      GoRoute(
        path: '/admin',
        name: 'admin',
        builder: (context, state) => const AdminScreen(),
      ),
      GoRoute(
        path: '/incident/:id',
        name: 'incident-detail',
        builder: (context, state) =>
            IncidentDetailScreen(incidentId: state.pathParameters['id']!),
      ),
    ],
  );
}
