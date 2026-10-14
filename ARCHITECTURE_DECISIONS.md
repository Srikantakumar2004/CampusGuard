# CampusGuard Architecture Decisions

## Decision 1: Flutter + Material 3 + Riverpod
The app uses Flutter with Material 3, a mobile-first design language, and a straightforward state approach grounded in Riverpod. This keeps the app clear, scalable, and aligned with the emergency-response workflow without adding unnecessary complexity.

## Decision 2: Go Router for navigation
The app uses Go Router for declarative navigation and deep-link-safe screen flow. This supports predictable role-based routing while remaining flexible for future auth and role checks.

## Decision 3: Model-first incident state management
Incident state and user role are represented in core models to keep UI and backend logic consistent. This reduces drift between the student, responder, and admin views.

## Decision 4: Firebase-first backend target
The project is designed around Firebase Auth, Firestore, Firebase Storage, and Cloud Messaging to match the requirement set and reduce deployment complexity for a campus emergency workflow.

## Decision 5: Minimal MVP first
The project prioritizes a working student → responder → admin emergency flow before adding optional enhancements like AI, geofencing, or advanced analytics.

## Decision 6: Honest offline and pending states
The app intentionally distinguishes between pending transmission, sent, and acknowledged so the user is never misled about whether an emergency was actually transmitted.
