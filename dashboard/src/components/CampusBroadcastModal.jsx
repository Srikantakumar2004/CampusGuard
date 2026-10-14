import React, { useState } from 'react';
import {
  X,
  Radio,
  Send,
  Bell,
  AlertTriangle,
  Info,
  ShieldAlert,
} from 'lucide-react';

export default function CampusBroadcastModal({ onClose, onSendBroadcast }) {
  const [headline, setHeadline] = useState('CAMPUS ADVISORY: Power Surge in Science Hall');
  const [urgency, setUrgency] = useState('warning'); // critical, warning, info
  const presetAlerts = [
    { title: 'Severe Storm Warning', text: 'Tornado / High Wind Watch in effect until 23:00. Shelter in lowest building levels.', type: 'critical' },
    { title: 'Electrical Hazard in Science Complex', text: 'Facilities responding to transformer issue in Science Wing A. Avoid area.', type: 'warning' },
    { title: 'Campus All-Clear Issued', text: 'All previous advisories for North Residence have been safely resolved. Normal operations resume.', type: 'info' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!headline.trim()) return;
    onSendBroadcast({ text: headline.trim(), urgency });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Radio size={20} color="var(--color-emergency)" />
            <span>Issue Campus-Wide Emergency Broadcast</span>
          </div>
          <button onClick={onClose} className="btn-icon-only">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Broadcast immediate push notification alerts to all student devices, responder terminals, and campus display monitors.
            </p>

            {/* Quick Presets */}
            <div className="form-group">
              <label className="form-label">Fast Emergency Templates</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {presetAlerts.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '0.5rem 0.85rem' }}
                    onClick={() => {
                      setHeadline(`${preset.title}: ${preset.text}`);
                      setUrgency(preset.type);
                    }}
                  >
                    {preset.type === 'critical' ? (
                      <ShieldAlert size={15} color="#ef4444" />
                    ) : preset.type === 'warning' ? (
                      <AlertTriangle size={15} color="#f59e0b" />
                    ) : (
                      <Info size={15} color="#10b981" />
                    )}
                    <span style={{ fontSize: '0.8rem' }}><strong>{preset.title}</strong> — {preset.text.slice(0, 50)}...</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Headline */}
            <div className="form-group">
              <label className="form-label">Broadcast Announcement Text</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Type emergency alert headline..."
                required
              />
            </div>

            {/* Urgency Level */}
            <div className="form-group">
              <label className="form-label">Broadcast Urgency Level</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn ${urgency === 'critical' ? 'btn-emergency' : 'btn-secondary'} btn-xs`}
                  style={{ flex: 1 }}
                  onClick={() => setUrgency('critical')}
                >
                  Critical (Siren)
                </button>
                <button
                  type="button"
                  className={`btn ${urgency === 'warning' ? 'btn-primary' : 'btn-secondary'} btn-xs`}
                  style={{ flex: 1 }}
                  onClick={() => setUrgency('warning')}
                >
                  Warning (Advisory)
                </button>
                <button
                  type="button"
                  className={`btn ${urgency === 'info' ? 'btn-primary' : 'btn-secondary'} btn-xs`}
                  style={{ flex: 1, background: urgency === 'info' ? '#10b981' : undefined }}
                  onClick={() => setUrgency('info')}
                >
                  Informational
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-emergency">
              <Send size={14} />
              <span>Publish Broadcast Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
