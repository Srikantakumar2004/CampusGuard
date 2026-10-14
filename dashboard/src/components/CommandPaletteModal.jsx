import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  MapPin,
  BarChart3,
  Users,
  ShieldAlert,
  Radio,
  PlusCircle,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function CommandPaletteModal({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenSos,
  onOpenBroadcast,
  onToggleSound,
  onToggleOffline,
  soundMuted,
  isOffline,
  incidents,
  onSelectIncident,
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Actions list
  const staticActions = [
    {
      id: 'tab_command',
      category: 'Navigation',
      label: 'Switch to Command Center',
      shortcut: '1',
      icon: LayoutDashboard,
      action: () => { onNavigateTab('command'); onClose(); },
    },
    {
      id: 'tab_radar',
      category: 'Navigation',
      label: 'Open Tactical Radar (GIS Map)',
      shortcut: '2',
      icon: MapPin,
      action: () => { onNavigateTab('map'); onClose(); },
    },
    {
      id: 'tab_analytics',
      category: 'Navigation',
      label: 'Open Analytics & Response Telemetry',
      shortcut: '3',
      icon: BarChart3,
      action: () => { onNavigateTab('analytics'); onClose(); },
    },
    {
      id: 'tab_responders',
      category: 'Navigation',
      label: 'Open Personnel & Response Roster',
      shortcut: '4',
      icon: Users,
      action: () => { onNavigateTab('responders'); onClose(); },
    },
    {
      id: 'action_sos',
      category: 'Emergency Dispatch',
      label: 'Trigger Student SOS Simulator',
      shortcut: 'S',
      icon: PlusCircle,
      badge: 'Urgent',
      action: () => { onClose(); onOpenSos(); },
    },
    {
      id: 'action_broadcast',
      category: 'Emergency Dispatch',
      label: 'Issue Campus-Wide Emergency Broadcast',
      shortcut: 'B',
      icon: Radio,
      badge: 'All Units',
      action: () => { onClose(); onOpenBroadcast(); },
    },
    {
      id: 'action_offline',
      category: 'System Controls',
      label: isOffline ? 'Go Online (Restore Live Cloud Sync)' : 'Go Offline (Simulate Honest Hive Mode)',
      shortcut: 'O',
      icon: isOffline ? Wifi : WifiOff,
      action: () => { onToggleOffline(); onClose(); },
    },
    {
      id: 'action_sound',
      category: 'System Controls',
      label: soundMuted ? 'Unmute Emergency Siren & Chimes' : 'Mute Audio Alerts',
      shortcut: 'M',
      icon: soundMuted ? Volume2 : VolumeX,
      action: () => { onToggleSound(); onClose(); },
    },
  ];

  // Dynamic incidents search
  const incidentActions = incidents.slice(0, 4).map(inc => ({
    id: `inc_${inc.id}`,
    category: 'Active Incidents',
    label: `${inc.id.toUpperCase()}: ${inc.description.slice(0, 55)}...`,
    sublabel: `${inc.locationLabel} • ${inc.severity.toUpperCase()}`,
    icon: ShieldAlert,
    action: () => { onSelectIncident(inc); onClose(); },
  }));

  const allItems = [...staticActions, ...incidentActions];

  const filteredItems = allItems.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const matchLabel = item.label.toLowerCase().includes(q);
    const matchCat = item.category.toLowerCase().includes(q);
    const matchSub = (item.sublabel || '').toLowerCase().includes(q);
    return matchLabel || matchCat || matchSub;
  });

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card command-palette-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px', borderRadius: '16px', overflow: 'hidden' }}
      >
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
          <Search size={18} color="var(--brand-primary-light)" style={{ marginRight: '10px' }} />
          <input
            ref={inputRef}
            type="text"
            className="command-search-input"
            placeholder="Type a command, jump to incident, or search..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
            }}
          />
          <kbd style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '0.5rem' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No matching commands or incidents found.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    background: isSelected ? 'var(--brand-glow)' : 'transparent',
                    border: isSelected ? '1px solid var(--brand-primary)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: isSelected ? 'var(--brand-primary)' : 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      }}
                    >
                      <Icon size={15} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </div>
                      {item.sublabel && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {item.sublabel}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.badge && (
                      <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(244,63,94,0.2)', color: '#f87171', fontWeight: 700 }}>
                        {item.badge}
                      </span>
                    )}
                    {item.shortcut && (
                      <kbd style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.6rem 1rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-primary)',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>Navigate with <kbd>↑</kbd> <kbd>↓</kbd></span>
          <span>Select with <kbd>↵ Enter</kbd></span>
          <span>Close with <kbd>Esc</kbd></span>
        </div>
      </div>
    </div>
  );
}
