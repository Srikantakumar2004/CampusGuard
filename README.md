# CampusGuard (package: campus_sos)

Campus emergency response MVP — student → responder → admin flow.
Flutter + Material 3 + Riverpod, GoRouter navigation, Hive-backed offline
queue with honest pending/sent/acknowledged states.

## Run in the browser (Chrome)

1. Install / locate the Flutter SDK (3.47.x) and add it to PATH:
   `C:\android\flutter\bin`
2. From this folder:
   ```bat
   flutter pub get
   flutter create --platforms=web .
   flutter run -d chrome
   ```
   Or build a static web bundle and serve it:
   ```bat
   flutter build web --release
   cd build\web
   python -m http.server 8000
   ```
   Then open http://localhost:8000

## Demo flow

1. Pick a role on the launch screen (Student / Responder / Admin).
2. As Student: hit **SEND SOS NOW** (big red button), optionally add type,
   description, GPS location and a photo. Offline saves stay **Pending**.
3. As Responder: open the inbox, acknowledge the newest alert, open details.
4. As Admin: view counts across pending/sent/acknowledged/resolved.

## Web Dashboard (React + CSS)

A sleek, modern, mission-critical incident command and dispatch dashboard located in [`dashboard/`](file:///c:/Users/srika/Downloads/CampusGuard/dashboard):

```bat
cd dashboard
npm install
npm run dev
```

Then open **http://localhost:5173/**

### Multiplatform App & PWA Features (iOS, Android, Windows, macOS)
- **Installable Native PWA**: One-click install to Windows Taskbar, macOS Dock, Android Home Screen, and iOS Safari ("Add to Home Screen") with standalone window mode.
- **100% Offline Mode Support**: Powered by a Service Worker (`sw.js`) that pre-caches app assets and dynamic offline queue that holds SOS triggers, triage acknowledgments, and field notes locally when disconnected, auto-syncing when back online.
- **Adaptive Platform Ergonomics**:
  - **Desktop (Windows / macOS)**: Spotlight Command Palette (`⌘K` / `Ctrl+K`), keyboard navigation (`1-4`, `Esc`), and wide tactical multi-pane display.
  - **Mobile (iOS / Android)**: Native bottom tab dock with safe-area insets (`env(safe-area-inset-bottom)`), touch targets, haptic feedback (`navigator.vibrate`), and prominent center SOS action button.
- **Command Center**: Real-time incident triage stream, search & category filtering, and live dispatching.
- **Campus Tactical Radar (GIS)**: Blueprint map with building polygons, danger zones, emergency blue light phone stations, responder patrol GPS markers, and pulsing beacon pings.
- **Data Visualization**: Category distribution donut chart and 24-hour response time trend curves.
- **Personnel & Roster**: Responder unit deployment, status management (Available, En Route, On Scene), and battery telemetry.
- **Honest Offline Queue**: Integrated with CampusGuard's Hive architecture decisions with honest pending transmission states.
- **Emergency SOS & Broadcast Simulators**: Test incoming student SOS alerts and issue campus-wide push notifications.
- **Audio Synthesizer**: Realistic emergency klaxons and resolution chimes generated purely via browser Web Audio API (with quick mute toggle).

## Firebase (optional next step)

The UI talks only to `IncidentRepository` (`lib/data/incident_repository.dart`),
which is currently Hive-backed so the web demo runs with zero config.
Swap its internals for `firebase_auth` + `cloud_firestore` +
`firebase_storage` + `firebase_messaging` without touching screens.

