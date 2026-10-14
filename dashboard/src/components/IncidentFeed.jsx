import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Clock,
  HeartPulse,
  Flame,
  ShieldAlert,
  CloudLightning,
  AlertTriangle,
  User,
  ArrowRight,
  CheckCircle,
  Radio,
  Send,
} from 'lucide-react';
import { INCIDENT_TYPES, INCIDENT_STATUS } from '../data/mockData';

const TYPE_ICONS = {
  HeartPulse: HeartPulse,
  Flame: Flame,
  ShieldAlert: ShieldAlert,
  CloudLightning: CloudLightning,
  AlertTriangle: AlertTriangle,
};

export default function IncidentFeed({
  incidents,
  selectedStatusFilter,
  onSelectStatusFilter,
  selectedTypeFilter,
  onSelectTypeFilter,
  searchQuery,
  onSearchChange,
  onSelectIncident,
  onAcknowledge,
  onResolve,
  onDispatchQuick,
}) {
  const filteredIncidents = incidents.filter(incident => {
    // Status Filter
    if (selectedStatusFilter === 'all_active') {
      if (incident.status === 'resolved') return false;
    } else if (selectedStatusFilter !== 'all') {
      if (incident.status !== selectedStatusFilter) return false;
    }

    // Category Type Filter
    if (selectedTypeFilter !== 'all' && incident.type !== selectedTypeFilter) {
      return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = incident.reporterName.toLowerCase().includes(q);
      const matchLoc = (incident.locationLabel || '').toLowerCase().includes(q);
      const matchDesc = incident.description.toLowerCase().includes(q);
      const matchId = incident.id.toLowerCase().includes(q);
      if (!matchName && !matchLoc && !matchDesc && !matchId) return false;
    }

    return true;
  });

  const getElapsedTime = (isoString) => {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  return (
    <div className="feed-container">
      {/* Feed Header */}
      <div className="feed-header">
        <div className="feed-title-wrap">
          <h2 className="feed-title">Incident Command Stream</h2>
          <span className="count-pill">{filteredIncidents.length} Showing</span>
        </div>

        {/* Search */}
        <div className="feed-search-bar">
          <Search size={16} />
          <input
            type="text"
            className="feed-search-input"
            placeholder="Search student, location, incident ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="filter-chips-row">
        <button
          className={`filter-chip ${selectedTypeFilter === 'all' ? 'active' : ''}`}
          onClick={() => onSelectTypeFilter('all')}
        >
          All Types
        </button>
        {Object.entries(INCIDENT_TYPES).map(([key, config]) => {
          const IconComp = TYPE_ICONS[config.icon] || AlertTriangle;
          return (
            <button
              key={key}
              className={`filter-chip ${selectedTypeFilter === key ? 'active' : ''}`}
              onClick={() => onSelectTypeFilter(key)}
            >
              <IconComp size={13} color={selectedTypeFilter === key ? 'white' : config.color} />
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status Filter Sub-Bar */}
      <div className="filter-chips-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <button
          className={`filter-chip ${selectedStatusFilter === 'all' ? 'active' : ''}`}
          onClick={() => onSelectStatusFilter('all')}
        >
          All Statuses
        </button>
        <button
          className={`filter-chip ${selectedStatusFilter === 'all_active' ? 'active' : ''}`}
          onClick={() => onSelectStatusFilter('all_active')}
        >
          Active Only ({incidents.filter(i => i.status !== 'resolved').length})
        </button>
        <button
          className={`filter-chip ${selectedStatusFilter === 'sent' ? 'active' : ''}`}
          onClick={() => onSelectStatusFilter('sent')}
        >
          Sent / Awaiting
        </button>
        <button
          className={`filter-chip ${selectedStatusFilter === 'acknowledged' ? 'active' : ''}`}
          onClick={() => onSelectStatusFilter('acknowledged')}
        >
          Acknowledged
        </button>
        <button
          className={`filter-chip ${selectedStatusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => onSelectStatusFilter('pending')}
        >
          Offline Pending
        </button>
        <button
          className={`filter-chip ${selectedStatusFilter === 'resolved' ? 'active' : ''}`}
          onClick={() => onSelectStatusFilter('resolved')}
        >
          Resolved
        </button>
      </div>

      {/* Incident Cards List */}
      <div className="incident-card-list">
        {filteredIncidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <AlertTriangle size={36} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>No incidents match your current filter</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>Try resetting search or category filters</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const typeConfig = INCIDENT_TYPES[incident.type] || INCIDENT_TYPES.other;
            const statusConfig = INCIDENT_STATUS[incident.status] || INCIDENT_STATUS.pending;
            const IconComp = TYPE_ICONS[typeConfig.icon] || AlertTriangle;

            return (
              <div
                key={incident.id}
                className={`incident-card ${incident.severity || 'moderate'}-border`}
                onClick={() => onSelectIncident(incident)}
              >
                <div className="incident-card-top">
                  <div className="incident-badges">
                    <span
                      className="type-pill"
                      style={{ background: typeConfig.bg, color: typeConfig.color }}
                    >
                      <IconComp size={13} />
                      <span>{typeConfig.label}</span>
                    </span>

                    <span className={`severity-pill severity-${incident.severity || 'moderate'}`}>
                      {incident.severity || 'MODERATE'}
                    </span>

                    <span className={`type-pill ${statusConfig.badge}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <span className="incident-time">
                    <Clock size={12} />
                    {getElapsedTime(incident.createdAt)}
                  </span>
                </div>

                <div className="incident-description">
                  {incident.description}
                </div>

                <div className="incident-meta-row">
                  <div className="incident-meta-item">
                    <MapPin size={13} color="var(--brand-primary-light)" />
                    <span style={{ fontWeight: 600 }}>{incident.locationLabel || 'Campus Location'}</span>
                  </div>

                  <div className="incident-meta-item">
                    <User size={13} color="var(--text-muted)" />
                    <span>Reported by: <strong>{incident.reporterName}</strong></span>
                  </div>

                  {incident.assignedResponder && (
                    <div className="incident-meta-item" style={{ color: 'var(--color-info)' }}>
                      <Radio size={13} />
                      <span>Assigned: <strong>{incident.assignedResponder}</strong></span>
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  <div className="incident-actions-quick" onClick={(e) => e.stopPropagation()}>
                    {incident.status === 'sent' && (
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() => onAcknowledge(incident.id)}
                        title="Accept & acknowledge this incident"
                      >
                        <Radio size={12} />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {incident.status === 'pending' && (
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => onAcknowledge(incident.id)}
                        title="Force sync transmission from offline storage"
                      >
                        <Send size={12} />
                        <span>Force Send</span>
                      </button>
                    )}

                    {incident.status === 'acknowledged' && (
                      <button
                        className="btn btn-secondary btn-xs"
                        style={{ color: 'var(--color-success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                        onClick={() => onResolve(incident.id)}
                        title="Mark incident as resolved"
                      >
                        <CheckCircle size={12} />
                        <span>Resolve</span>
                      </button>
                    )}

                    <button
                      className="btn btn-secondary btn-xs"
                      onClick={() => onSelectIncident(incident)}
                      title="View full tactical logs and responder dispatch"
                    >
                      <span>Details</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
