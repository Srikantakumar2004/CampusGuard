import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Phone,
  User,
  Shield,
  CheckCircle,
  Radio,
  AlertTriangle,
  Send,
  FileText,
} from 'lucide-react';
import { INCIDENT_TYPES, INCIDENT_STATUS } from '../data/mockData';

export default function IncidentDetailModal({
  incident,
  responders,
  onClose,
  onAcknowledge,
  onResolve,
  onAssignResponder,
  onAddTimelineNote,
}) {
  if (!incident) return null;

  const [noteText, setNoteText] = useState('');
  const [selectedResponder, setSelectedResponder] = useState(incident.assignedResponder || '');

  const typeConfig = INCIDENT_TYPES[incident.type] || INCIDENT_TYPES.other;
  const statusConfig = INCIDENT_STATUS[incident.status] || INCIDENT_STATUS.pending;

  const handleAssign = (e) => {
    const respName = e.target.value;
    setSelectedResponder(respName);
    if (onAssignResponder) {
      onAssignResponder(incident.id, respName);
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    if (onAddTimelineNote) {
      onAddTimelineNote(incident.id, noteText.trim());
    }
    setNoteText('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: typeConfig.color,
                display: 'inline-block',
              }}
            ></span>
            <span>{incident.id.toUpperCase()} — {typeConfig.label} Emergency</span>
          </div>

          <button onClick={onClose} className="btn-icon-only" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Status & Severity Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`type-pill ${statusConfig.badge}`}>
                {statusConfig.label}
              </span>
              <span className={`severity-pill severity-${incident.severity || 'moderate'}`}>
                {incident.severity || 'MODERATE'} PRIORITY
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} />
              <span>Reported: {new Date(incident.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Incident Summary</label>
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                border: '1px solid var(--border-subtle)',
              }}
            >
              {incident.description}
            </div>
          </div>

          {/* Location & Reporter Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Location Telemetry</label>
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <MapPin size={14} color="var(--brand-primary-light)" />
                  <span>{incident.locationLabel}</span>
                </div>
                {incident.latitude && incident.longitude && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    GPS: {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reporting Student</label>
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <User size={14} color="var(--color-info)" />
                  <span>{incident.reporterName}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  ID: {incident.reporterId} • Phone: {incident.reporterPhone || '+1 (555) 234-8901'}
                </div>
              </div>
            </div>
          </div>

          {/* Responder Assignment */}
          <div className="form-group">
            <label className="form-label">Assigned Dispatch Unit</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                className="form-select"
                style={{ flex: 1 }}
                value={selectedResponder}
                onChange={handleAssign}
              >
                <option value="">-- Select Available Responder --</option>
                {responders.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.role} - {r.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div className="form-group">
            <label className="form-label">Tactical Incident Timeline</label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxHeight: '180px',
                overflowY: 'auto',
                background: 'var(--bg-primary)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {(incident.timeline || []).map((event, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    fontSize: '0.78rem',
                    borderLeft: '2px solid var(--brand-primary)',
                    paddingLeft: '8px',
                  }}
                >
                  <span style={{ color: 'var(--color-info)', fontWeight: 700, fontFamily: 'monospace', minWidth: '55px' }}>
                    {event.time}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{event.text}</span>
                </div>
              ))}
            </div>

            {/* Quick Add Note */}
            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, fontSize: '0.8rem' }}
                placeholder="Log field update or responder notes..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-xs">
                <FileText size={13} />
                <span>Add Note</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          {incident.status === 'sent' && (
            <button
              className="btn btn-primary"
              onClick={() => {
                onAcknowledge(incident.id);
                onClose();
              }}
            >
              <Radio size={14} />
              <span>Acknowledge & Dispatch</span>
            </button>
          )}

          {incident.status === 'pending' && (
            <button
              className="btn btn-primary"
              onClick={() => {
                onAcknowledge(incident.id);
                onClose();
              }}
            >
              <Send size={14} />
              <span>Sync & Broadcast Now</span>
            </button>
          )}

          {incident.status !== 'resolved' && (
            <button
              className="btn btn-secondary"
              style={{ color: 'var(--color-success)', borderColor: 'rgba(16, 185, 129, 0.4)' }}
              onClick={() => {
                onResolve(incident.id);
                onClose();
              }}
            >
              <CheckCircle size={14} />
              <span>Mark as Resolved</span>
            </button>
          )}

          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
