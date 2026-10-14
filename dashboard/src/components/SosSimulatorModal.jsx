import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  AlertOctagon,
  HeartPulse,
  Flame,
  ShieldAlert,
  CloudLightning,
  AlertTriangle,
  HardDriveDownload,
  Send,
} from 'lucide-react';
import { INCIDENT_TYPES, CAMPUS_BUILDINGS_RENDER } from '../data/mockData';

export default function SosSimulatorModal({ onClose, onTriggerSos }) {
  const [type, setType] = useState('medical');
  const [severity, setSeverity] = useState('critical');
  const [locationLabel, setLocationLabel] = useState('Science Hall — 2nd Floor Hallway');
  const [description, setDescription] = useState('Student suffering severe chest pains and difficulty breathing near Room 204.');
  const [reporterName, setReporterName] = useState('Jordan Rivera');
  const [isOfflineQueue, setIsOfflineQueue] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    // Pick reasonable map coordinates based on location
    const building = CAMPUS_BUILDINGS_RENDER.find(b => locationLabel.includes(b.label)) || CAMPUS_BUILDINGS_RENDER[0];
    const mapCoords = {
      x: building.x + Math.floor(Math.random() * 6),
      y: building.y + Math.floor(Math.random() * 6),
    };

    onTriggerSos({
      type,
      severity,
      locationLabel,
      description,
      reporterName,
      status: isOfflineQueue ? 'pending' : 'sent',
      mapCoords,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ color: 'var(--color-emergency)' }}>
            <AlertOctagon size={20} />
            <span>Simulate Student Emergency SOS</span>
          </div>
          <button onClick={onClose} className="btn-icon-only">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Emulate an immediate SOS dispatch triggered by a student via the CampusGuard mobile application.
            </p>

            {/* Type selector */}
            <div className="form-group">
              <label className="form-label">Incident Emergency Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                {Object.entries(INCIDENT_TYPES).map(([k, cfg]) => (
                  <button
                    type="button"
                    key={k}
                    className={`btn ${type === k ? 'btn-primary' : 'btn-secondary'} btn-xs`}
                    style={{
                      justifyContent: 'center',
                      borderColor: type === k ? cfg.color : undefined,
                      background: type === k ? cfg.color : undefined,
                      color: 'white',
                    }}
                    onClick={() => setType(k)}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity selector */}
            <div className="form-group">
              <label className="form-label">Triage Priority / Severity</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['critical', 'high', 'moderate', 'low'].map((sev) => (
                  <button
                    type="button"
                    key={sev}
                    className={`btn ${severity === sev ? 'btn-primary' : 'btn-secondary'} btn-xs`}
                    style={{ flex: 1, textTransform: 'uppercase' }}
                    onClick={() => setSeverity(sev)}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label">Campus Location & Zone</label>
              <select
                className="form-select"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
              >
                <option value="Science Hall — 2nd Floor Hallway">Science Hall — 2nd Floor Hallway</option>
                <option value="Oak Tower — North Residence Entrance">Oak Tower — North Residence Entrance</option>
                <option value="Main Library — 3rd Floor East Wing">Main Library — 3rd Floor East Wing</option>
                <option value="Athletics Gym & Stadium Field">Athletics Gym & Stadium Field</option>
                <option value="Parking Deck B — Level 2 Charging Stalls">Parking Deck B — Level 2 Charging Stalls</option>
                <option value="BioTech Lab Wing — Basement A">BioTech Lab Wing — Basement A</option>
                <option value="Student Union — Dining Quad">Student Union — Dining Quad</option>
              </select>
            </div>

            {/* Student Name */}
            <div className="form-group">
              <label className="form-label">Reporter Name</label>
              <input
                type="text"
                className="form-input"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Emergency Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Offline mode toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <input
                type="checkbox"
                id="offlineCheck"
                checked={isOfflineQueue}
                onChange={(e) => setIsOfflineQueue(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="offlineCheck" style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <HardDriveDownload size={14} color="var(--color-warning)" />
                <span>Simulate Offline creation (Save to local Hive queue as <strong>Pending</strong>)</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-emergency">
              <AlertTriangle size={15} />
              <span>Broadcast SOS Alert</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
