import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Radio,
  PlusCircle,
  Clock,
  Database,
  Wifi,
  WifiOff,
  Download,
  Search,
  Command,
  Smartphone,
  Monitor,
  RefreshCw,
} from 'lucide-react';
import { getPlatformInfo, triggerHaptic } from '../utils/platform';

export default function Header({
  soundMuted,
  onToggleSound,
  theme,
  onToggleTheme,
  onOpenSosModal,
  onOpenBroadcastModal,
  onOpenInstallModal,
  onOpenCommandPalette,
  onToggleOffline,
  isOffline,
  offlineQueueCount,
  onSyncOfflineQueue,
  pendingCount,
  activeIncidentsCount,
}) {
  const [currentTime, setCurrentTime] = useState('');
  const platform = getPlatformInfo();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="app-header">
      {/* Offline Status Warning Bar if offline or simulated */}
      {isOffline && (
        <div className="offline-network-banner">
          <div className="offline-banner-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WifiOff size={15} color="#fbbf24" />
              <span>
                <strong>OFFLINE MODE ACTIVE:</strong> CampusGuard is running in local Hive cache mode. Changes are saved locally and will auto-sync when back online.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {offlineQueueCount > 0 && (
                <span className="badge-offline-queue">
                  {offlineQueueCount} queued for sync
                </span>
              )}
              <button
                className="btn btn-xs btn-secondary"
                onClick={onSyncOfflineQueue}
                style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
              >
                <RefreshCw size={12} />
                <span>Sync Now</span>
              </button>
              <button
                className="btn btn-xs btn-secondary"
                onClick={onToggleOffline}
              >
                Restore Online
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="header-inner">
        {/* Brand & Platform */}
        <div className="brand-section">
          <div className="brand-logo-badge">
            <ShieldAlert size={26} strokeWidth={2.4} />
            <div className="pulse-indicator">
              <div className="pulse-ring"></div>
            </div>
          </div>
          <div className="brand-titles">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1>CampusGuard</h1>
              <span className="platform-os-tag">
                {platform.os === 'ios' || platform.os === 'android' ? (
                  <Smartphone size={10} style={{ marginRight: '2px' }} />
                ) : (
                  <Monitor size={10} style={{ marginRight: '2px' }} />
                )}
                {platform.osLabel}
              </span>
            </div>
            <div className="tagline">
              Incident Command & Tactical Response Hub
            </div>
          </div>
        </div>

        {/* Center: Command Palette Search Bar (Spotlight) */}
        <div className="header-center-search" onClick={onOpenCommandPalette} title="Press ⌘K or Ctrl+K to search">
          <Search size={14} color="var(--text-muted)" />
          <span className="search-placeholder">Quick search incidents, units, actions...</span>
          <div className="cmd-shortcut-tag">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>

        {/* Right Telemetry Capsule & Actions */}
        <div className="header-actions">
          {/* Online / Offline Network Capsule */}
          <button
            onClick={onToggleOffline}
            className={`telemetry-capsule ${isOffline ? 'offline' : 'online'}`}
            title={isOffline ? 'Click to restore online network mode' : 'Click to simulate offline / Hive mode'}
          >
            {isOffline ? <WifiOff size={13} color="#f59e0b" /> : <Wifi size={13} color="#10b981" />}
            <span className="capsule-label font-mono">
              {isOffline ? 'OFFLINE' : 'ONLINE'}
            </span>
          </button>

          {/* Clock Capsule */}
          <div className="telemetry-capsule clock-capsule">
            <Clock size={12} color="var(--text-muted)" />
            <span className="font-mono">{currentTime || '00:00:00'}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onToggleSound();
            }}
            className={`btn-icon-only ${!soundMuted ? 'active' : ''}`}
            title={soundMuted ? 'Unmute siren & audio alerts' : 'Mute audio alerts'}
            aria-label="Toggle Sound"
          >
            {soundMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onToggleTheme();
            }}
            className="btn-icon-only"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Install App Button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenInstallModal();
            }}
            className="btn btn-secondary install-app-btn"
            title="Install as native Desktop or Mobile app"
          >
            <Download size={15} color="var(--brand-primary-light)" />
            <span>Install App</span>
          </button>

          {/* Broadcast Alert */}
          <button
            onClick={() => {
              triggerHaptic('warning');
              onOpenBroadcastModal();
            }}
            className="btn btn-secondary broadcast-btn"
            title="Publish emergency push alert to campus devices"
          >
            <Radio size={15} color="#ef4444" />
            <span>Broadcast</span>
          </button>

          {/* Trigger SOS Quick Action */}
          <button
            onClick={() => {
              triggerHaptic('heavy');
              onOpenSosModal();
            }}
            className="btn btn-emergency trigger-sos-btn"
            title="Simulate incoming Student SOS trigger"
          >
            <PlusCircle size={16} />
            <span>Trigger SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
}
