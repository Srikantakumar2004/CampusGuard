import React from 'react';
import {
  AlertCircle,
  Timer,
  Users,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  HardDriveDownload,
} from 'lucide-react';

export default function StatsOverview({ incidents, responders, onFilterByStatus }) {
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const criticalCount = activeIncidents.filter(i => i.severity === 'critical').length;
  const pendingCount = incidents.filter(i => i.status === 'pending').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;
  
  const deployedResponders = responders.filter(r => r.status === 'en_route' || r.status === 'on_scene').length;
  const totalResponders = responders.length;

  const resolutionRate = incidents.length > 0
    ? Math.round((resolvedCount / incidents.length) * 100)
    : 100;

  return (
    <section className="stats-grid" aria-label="Incident metrics and key performance indicators">
      {/* 1. Active Emergencies */}
      <div 
        className="stat-card" 
        style={{ cursor: 'pointer' }}
        onClick={() => onFilterByStatus('all_active')}
        title="Click to view all active emergency incidents"
      >
        <div className="stat-glow-bar" style={{ background: 'var(--color-emergency)' }}></div>
        <div className="stat-card-header">
          <span className="stat-title">Active Emergencies</span>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--color-emergency)' }}>
            <AlertCircle size={20} />
          </div>
        </div>
        <div className="stat-main-number">
          {activeIncidents.length}
          <span className="stat-unit">incidents</span>
        </div>
        <div className="stat-footer">
          <span style={{ color: criticalCount > 0 ? 'var(--color-emergency)' : 'var(--text-muted)', fontWeight: 600 }}>
            {criticalCount} Critical Priority
          </span>
          <span className="stat-delta negative">
            <TrendingUp size={13} /> +2 in 10m
          </span>
        </div>
      </div>

      {/* 2. Mean Response Time */}
      <div className="stat-card">
        <div className="stat-glow-bar" style={{ background: 'var(--color-info)' }}></div>
        <div className="stat-card-header">
          <span className="stat-title">Mean Response Time</span>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--color-info)' }}>
            <Timer size={20} />
          </div>
        </div>
        <div className="stat-main-number">
          2.1
          <span className="stat-unit">mins</span>
        </div>
        <div className="stat-footer">
          <span>Target: &lt; 4.0 mins</span>
          <span className="stat-delta positive">
            <TrendingDown size={13} /> -18% vs avg
          </span>
        </div>
      </div>

      {/* 3. Units Deployed */}
      <div className="stat-card">
        <div className="stat-glow-bar" style={{ background: 'var(--brand-primary)' }}></div>
        <div className="stat-card-header">
          <span className="stat-title">Responders Deployed</span>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--brand-primary)' }}>
            <Users size={20} />
          </div>
        </div>
        <div className="stat-main-number">
          {deployedResponders}
          <span className="stat-unit">/ {totalResponders} units</span>
        </div>
        <div className="stat-footer">
          <span style={{ color: 'var(--text-secondary)' }}>
            {totalResponders - deployedResponders} available on standby
          </span>
          <span className="stat-delta neutral">80% capacity</span>
        </div>
      </div>

      {/* 4. Incident Resolution Rate */}
      <div 
        className="stat-card"
        style={{ cursor: 'pointer' }}
        onClick={() => onFilterByStatus('resolved')}
        title="Click to view resolved incident history"
      >
        <div className="stat-glow-bar" style={{ background: 'var(--color-success)' }}></div>
        <div className="stat-card-header">
          <span className="stat-title">Resolution Rate</span>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div className="stat-main-number">
          {resolutionRate}%
          <span className="stat-unit">({resolvedCount} closed)</span>
        </div>
        <div className="stat-footer">
          <span>99.2% SLA compliance</span>
          <span className="stat-delta positive">
            <TrendingUp size={13} /> High efficiency
          </span>
        </div>
      </div>

      {/* 5. Honest Hive Offline Queue */}
      <div 
        className="stat-card"
        style={{ cursor: 'pointer' }}
        onClick={() => onFilterByStatus('pending')}
        title="Click to view incidents waiting in local Hive queue"
      >
        <div className="stat-glow-bar" style={{ background: pendingCount > 0 ? 'var(--color-warning)' : 'var(--text-muted)' }}></div>
        <div className="stat-card-header">
          <span className="stat-title">Offline Queue State</span>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' }}>
            <HardDriveDownload size={20} />
          </div>
        </div>
        <div className="stat-main-number">
          {pendingCount}
          <span className="stat-unit">pending</span>
        </div>
        <div className="stat-footer">
          <span style={{ color: pendingCount > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
            {pendingCount > 0 ? 'Awaiting uplink confirmation' : 'Local storage fully flushed'}
          </span>
          <span className="stat-delta neutral">Hive DB v1.4</span>
        </div>
      </div>
    </section>
  );
}
