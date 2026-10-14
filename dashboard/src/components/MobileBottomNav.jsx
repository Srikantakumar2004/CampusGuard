import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  BarChart3,
  Users,
  AlertOctagon,
} from 'lucide-react';
import { triggerHaptic } from '../utils/platform';

export default function MobileBottomNav({
  activeTab,
  onNavigateTab,
  onOpenSosModal,
  activeCount,
}) {
  const handleTabClick = (tab) => {
    triggerHaptic('light');
    onNavigateTab(tab);
  };

  const handleSosClick = () => {
    triggerHaptic('heavy');
    onOpenSosModal();
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation Dock">
      <button
        className={`mobile-nav-item ${activeTab === 'command' ? 'active' : ''}`}
        onClick={() => handleTabClick('command')}
      >
        <div className="mobile-nav-icon-wrap">
          <LayoutDashboard size={20} />
          {activeCount > 0 && <span className="mobile-nav-badge">{activeCount}</span>}
        </div>
        <span>Command</span>
      </button>

      <button
        className={`mobile-nav-item ${activeTab === 'map' ? 'active' : ''}`}
        onClick={() => handleTabClick('map')}
      >
        <div className="mobile-nav-icon-wrap">
          <MapPin size={20} />
        </div>
        <span>Radar</span>
      </button>

      {/* Floating Center SOS Button */}
      <button
        className="mobile-sos-center-fab"
        onClick={handleSosClick}
        title="Immediate Emergency SOS"
        aria-label="Emergency SOS"
      >
        <div className="sos-fab-glow"></div>
        <AlertOctagon size={24} strokeWidth={2.5} />
        <span className="sos-fab-text">SOS</span>
      </button>

      <button
        className={`mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => handleTabClick('analytics')}
      >
        <div className="mobile-nav-icon-wrap">
          <BarChart3 size={20} />
        </div>
        <span>Metrics</span>
      </button>

      <button
        className={`mobile-nav-item ${activeTab === 'responders' ? 'active' : ''}`}
        onClick={() => handleTabClick('responders')}
      >
        <div className="mobile-nav-icon-wrap">
          <Users size={20} />
        </div>
        <span>Units</span>
      </button>
    </nav>
  );
}
