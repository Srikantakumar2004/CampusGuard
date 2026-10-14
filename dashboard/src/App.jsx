import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import IncidentFeed from './components/IncidentFeed';
import CampusMap from './components/CampusMap';
import AnalyticsCharts from './components/AnalyticsCharts';
import ResponderDispatch from './components/ResponderDispatch';
import IncidentDetailModal from './components/IncidentDetailModal';
import SosSimulatorModal from './components/SosSimulatorModal';
import CampusBroadcastModal from './components/CampusBroadcastModal';
import CommandPaletteModal from './components/CommandPaletteModal';
import InstallAppModal from './components/InstallAppModal';
import MobileBottomNav from './components/MobileBottomNav';

import { INITIAL_INCIDENTS, INITIAL_RESPONDERS } from './data/mockData';
import { soundManager } from './utils/audioAlerts';
import {
  getPlatformInfo,
  triggerHaptic,
  getOfflineQueue,
  enqueueOfflineAction,
  clearOfflineQueue,
} from './utils/platform';

import {
  LayoutDashboard,
  MapPin,
  BarChart3,
  Users,
  AlertTriangle,
  X,
  Radio,
  Wifi,
  WifiOff,
  Sparkles,
  Command,
} from 'lucide-react';

export default function App() {
  const platform = getPlatformInfo();

  // Local storage persisted state
  const [incidents, setIncidents] = useState(() => {
    try {
      const saved = localStorage.getItem('campusguard_incidents_v2');
      return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
    } catch {
      return INITIAL_INCIDENTS;
    }
  });

  const [responders, setResponders] = useState(() => {
    try {
      const saved = localStorage.getItem('campusguard_responders_v2');
      return saved ? JSON.parse(saved) : INITIAL_RESPONDERS;
    } catch {
      return INITIAL_RESPONDERS;
    }
  });

  // App Navigation & Filters
  const [activeTab, setActiveTab] = useState('command'); // 'command', 'map', 'analytics', 'responders'
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all_active');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState('realtime');

  // Modals
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // System & Platform
  const [theme, setTheme] = useState('dark');
  const [soundMuted, setSoundMuted] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState(getOfflineQueue);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const [broadcastAlert, setBroadcastAlert] = useState({
    active: true,
    text: 'CAMPUS ADVISORY: Heightened patrol active across Science & Residence Quads. Blue light stations operational.',
    urgency: 'warning',
  });

  // Save state
  useEffect(() => {
    localStorage.setItem('campusguard_incidents_v2', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('campusguard_responders_v2', JSON.stringify(responders));
  }, [responders]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync sound
  useEffect(() => {
    soundManager.setMuted(soundMuted);
  }, [soundMuted]);

  // Native Online / Offline Event Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      handleSyncQueue();
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capture PWA beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Global Keyboard Shortcuts (⌘K, 1, 2, 3, 4, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ⌘K or Ctrl+K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      // Ignore single key shortcuts if typing in input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      if (e.key === '1') {
        setActiveTab('command');
        triggerHaptic('light');
      } else if (e.key === '2') {
        setActiveTab('map');
        triggerHaptic('light');
      } else if (e.key === '3') {
        setActiveTab('analytics');
        triggerHaptic('light');
      } else if (e.key === '4') {
        setActiveTab('responders');
        triggerHaptic('light');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle Offline mode manually for testing
  const handleToggleOffline = () => {
    triggerHaptic('light');
    setIsOffline(prev => !prev);
  };

  // Sync Queue Flush
  const handleSyncQueue = () => {
    const queue = getOfflineQueue();
    if (queue.length > 0) {
      soundManager.playResolvedChime();
      triggerHaptic('heavy');
      clearOfflineQueue();
      setOfflineQueue([]);

      // Mark any pending incidents as transmitted
      setIncidents(prev =>
        prev.map(inc => {
          if (inc.status === 'pending') {
            return {
              ...inc,
              status: 'sent',
              updatedAt: new Date().toISOString(),
              timeline: [
                ...(inc.timeline || []),
                { time: 'Just now', text: 'Flushed from offline Hive storage → Transmitted to central dispatch' },
              ],
            };
          }
          return inc;
        })
      );
    }
  };

  // Handlers
  const handleToggleSound = () => {
    setSoundMuted(prev => !prev);
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleAcknowledge = (incidentId) => {
    soundManager.playAckChime();
    triggerHaptic('light');

    if (isOffline) {
      enqueueOfflineAction({ type: 'ACKNOWLEDGE', incidentId });
      setOfflineQueue(getOfflineQueue());
    }

    setIncidents(prev =>
      prev.map(item => {
        if (item.id === incidentId) {
          const updatedTimeline = [
            ...(item.timeline || []),
            {
              time: 'Just now',
              text: isOffline
                ? 'Acknowledged locally (queued for offline sync)'
                : 'Alert acknowledged by Central Dispatch — Units en route',
            },
          ];
          return {
            ...item,
            status: 'acknowledged',
            updatedAt: new Date().toISOString(),
            acknowledgedBy: 'Central Command',
            timeline: updatedTimeline,
          };
        }
        return item;
      })
    );
  };

  const handleResolve = (incidentId) => {
    soundManager.playResolvedChime();
    triggerHaptic('heavy');

    if (isOffline) {
      enqueueOfflineAction({ type: 'RESOLVE', incidentId });
      setOfflineQueue(getOfflineQueue());
    }

    setIncidents(prev =>
      prev.map(item => {
        if (item.id === incidentId) {
          const updatedTimeline = [
            ...(item.timeline || []),
            {
              time: 'Just now',
              text: isOffline
                ? 'Resolved locally (queued for offline sync)'
                : 'Incident resolved & verified by lead on scene',
            },
          ];
          return {
            ...item,
            status: 'resolved',
            updatedAt: new Date().toISOString(),
            timeline: updatedTimeline,
          };
        }
        return item;
      })
    );
  };

  const handleAssignResponder = (incidentId, responderName) => {
    triggerHaptic('light');

    if (isOffline) {
      enqueueOfflineAction({ type: 'ASSIGN_RESPONDER', incidentId, responderName });
      setOfflineQueue(getOfflineQueue());
    }

    setIncidents(prev =>
      prev.map(item => {
        if (item.id === incidentId) {
          const updatedTimeline = [
            ...(item.timeline || []),
            { time: 'Just now', text: `Assigned responder unit: ${responderName}` },
          ];
          return {
            ...item,
            assignedResponder: responderName,
            status: item.status === 'sent' ? 'acknowledged' : item.status,
            timeline: updatedTimeline,
          };
        }
        return item;
      })
    );

    setResponders(prev =>
      prev.map(r => {
        if (r.name === responderName) {
          return { ...r, status: 'en_route', assignedIncidentId: incidentId };
        }
        return r;
      })
    );
  };

  const handleAddTimelineNote = (incidentId, noteText) => {
    triggerHaptic('light');
    setIncidents(prev =>
      prev.map(item => {
        if (item.id === incidentId) {
          const updatedTimeline = [
            ...(item.timeline || []),
            { time: 'Just now', text: noteText },
          ];
          return { ...item, timeline: updatedTimeline };
        }
        return item;
      })
    );
  };

  const handleTriggerSos = (newSos) => {
    soundManager.playEmergencyAlert();
    triggerHaptic('heavy');

    const newId = `inc-${String(incidents.length + 1).padStart(3, '0')}`;
    const initialStatus = isOffline || newSos.status === 'pending' ? 'pending' : 'sent';

    if (initialStatus === 'pending') {
      enqueueOfflineAction({ type: 'CREATE_SOS', id: newId, ...newSos });
      setOfflineQueue(getOfflineQueue());
    }

    const newIncident = {
      id: newId,
      reporterId: `stu-${Math.floor(1000 + Math.random() * 9000)}`,
      reporterName: newSos.reporterName || 'Anonymous Student',
      reporterPhone: '+1 (555) 019-8822',
      type: newSos.type,
      severity: newSos.severity,
      description: newSos.description,
      locationLabel: newSos.locationLabel,
      mapCoords: newSos.mapCoords || { x: 50, y: 50 },
      status: initialStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      acknowledgedBy: null,
      assignedResponder: null,
      timeline: [
        {
          time: 'Just now',
          text: initialStatus === 'pending'
            ? 'Emergency SOS saved offline via Hive local storage (Pending Uplink)'
            : 'Emergency SOS activated and transmitted via CampusGuard',
        },
      ],
    };

    setIncidents(prev => [newIncident, ...prev]);
    setSelectedIncident(newIncident);
  };

  const handlePublishBroadcast = ({ text, urgency }) => {
    soundManager.playEmergencyAlert();
    triggerHaptic('warning');
    setBroadcastAlert({
      active: true,
      text,
      urgency,
    });
  };

  const pendingCount = incidents.filter(i => i.status === 'pending').length;
  const activeCount = incidents.filter(i => i.status !== 'resolved').length;

  return (
    <div className="app-container">
      {/* Premium Multiplatform Command Header */}
      <Header
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSosModal={() => setIsSosModalOpen(true)}
        onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleOffline={handleToggleOffline}
        isOffline={isOffline}
        offlineQueueCount={offlineQueue.length}
        onSyncOfflineQueue={handleSyncQueue}
        pendingCount={pendingCount}
        activeIncidentsCount={activeCount}
      />

      {/* Emergency Broadcast Alert Banner */}
      {broadcastAlert.active && (
        <div className="broadcast-alert-banner">
          <div className="broadcast-alert-content">
            <span className="badge-live">CAMPUS ALERT</span>
            <span className="broadcast-message">{broadcastAlert.text}</span>
          </div>
          <button
            className="broadcast-dismiss"
            onClick={() => setBroadcastAlert(prev => ({ ...prev, active: false }))}
            title="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {/* Desktop Segmented Navigation & Timeframe */}
        <nav className="dashboard-nav" aria-label="Desktop Navigation Bar">
          <div className="nav-tabs">
            <button
              className={`nav-tab-btn ${activeTab === 'command' ? 'active' : ''}`}
              onClick={() => { triggerHaptic('light'); setActiveTab('command'); }}
            >
              <LayoutDashboard size={15} />
              <span>Command Center</span>
              <span className="nav-tab-badge">{activeCount}</span>
              <kbd className="nav-kbd">1</kbd>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => { triggerHaptic('light'); setActiveTab('map'); }}
            >
              <MapPin size={15} />
              <span>Tactical Radar</span>
              <kbd className="nav-kbd">2</kbd>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => { triggerHaptic('light'); setActiveTab('analytics'); }}
            >
              <BarChart3 size={15} />
              <span>Analytics & Metrics</span>
              <kbd className="nav-kbd">3</kbd>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'responders' ? 'active' : ''}`}
              onClick={() => { triggerHaptic('light'); setActiveTab('responders'); }}
            >
              <Users size={15} />
              <span>Response Roster</span>
              <span className="nav-tab-badge">{responders.length}</span>
              <kbd className="nav-kbd">4</kbd>
            </button>
          </div>

          <div className="nav-time-filter">
            <span>Window:</span>
            <select
              className="filter-select"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="realtime">Live Telemetry (Real-Time)</option>
              <option value="today">Today's Shift</option>
              <option value="24h">Past 24 Hours</option>
              <option value="7d">Past 7 Days</option>
            </select>
          </div>
        </nav>

        {/* Top KPI Metrics Overview */}
        <StatsOverview
          incidents={incidents}
          responders={responders}
          onFilterByStatus={(st) => {
            setSelectedStatusFilter(st);
            setActiveTab('command');
          }}
        />

        {/* Tab View 1: Command Center (Split Stream + Radar) */}
        {activeTab === 'command' && (
          <div className="command-grid-layout">
            <IncidentFeed
              incidents={incidents}
              selectedStatusFilter={selectedStatusFilter}
              onSelectStatusFilter={setSelectedStatusFilter}
              selectedTypeFilter={selectedTypeFilter}
              onSelectTypeFilter={setSelectedTypeFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectIncident={setSelectedIncident}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
            />

            <CampusMap
              incidents={incidents}
              responders={responders}
              onSelectIncident={setSelectedIncident}
              selectedIncident={selectedIncident}
            />
          </div>
        )}

        {/* Tab View 2: Full Tactical Radar Map */}
        {activeTab === 'map' && (
          <CampusMap
            incidents={incidents}
            responders={responders}
            onSelectIncident={setSelectedIncident}
            selectedIncident={selectedIncident}
          />
        )}

        {/* Tab View 3: Analytics & Data Visualization */}
        {activeTab === 'analytics' && (
          <AnalyticsCharts incidents={incidents} />
        )}

        {/* Tab View 4: Response Personnel Roster */}
        {activeTab === 'responders' && (
          <ResponderDispatch
            responders={responders}
            onSelectResponder={(resp) => {
              if (resp.assignedIncidentId) {
                const found = incidents.find(i => i.id === resp.assignedIncidentId);
                if (found) setSelectedIncident(found);
              }
            }}
          />
        )}
      </main>

      {/* Mobile Native Bottom Navigation Dock (iOS / Android) */}
      <MobileBottomNav
        activeTab={activeTab}
        onNavigateTab={setActiveTab}
        onOpenSosModal={() => setIsSosModalOpen(true)}
        activeCount={activeCount}
      />

      {/* Modals */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          responders={responders}
          onClose={() => setSelectedIncident(null)}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
          onAssignResponder={handleAssignResponder}
          onAddTimelineNote={handleAddTimelineNote}
        />
      )}

      {isSosModalOpen && (
        <SosSimulatorModal
          onClose={() => setIsSosModalOpen(false)}
          onTriggerSos={handleTriggerSos}
        />
      )}

      {isBroadcastModalOpen && (
        <CampusBroadcastModal
          onClose={() => setIsBroadcastModalOpen(false)}
          onSendBroadcast={handlePublishBroadcast}
        />
      )}

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={setActiveTab}
        onOpenSos={() => setIsSosModalOpen(true)}
        onOpenBroadcast={() => setIsBroadcastModalOpen(true)}
        onToggleSound={handleToggleSound}
        onToggleOffline={handleToggleOffline}
        soundMuted={soundMuted}
        isOffline={isOffline}
        incidents={incidents}
        onSelectIncident={setSelectedIncident}
      />

      {isInstallModalOpen && (
        <InstallAppModal
          onClose={() => setIsInstallModalOpen(false)}
          deferredPrompt={deferredPrompt}
          onInstallSuccess={() => setDeferredPrompt(null)}
        />
      )}
    </div>
  );
}
