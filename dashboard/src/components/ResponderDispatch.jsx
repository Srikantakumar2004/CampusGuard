import React from 'react';
import {
  Shield,
  Phone,
  Battery,
  MapPin,
  Clock,
  Radio,
  UserCheck,
} from 'lucide-react';

export default function ResponderDispatch({ responders, onSelectResponder }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'on_scene':
        return { label: 'On Scene', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'en_route':
        return { label: 'En Route', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'available':
        return { label: 'Available', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' };
      default:
        return { label: 'Off Duty', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' };
    }
  };

  return (
    <div className="feed-container">
      <div className="feed-header">
        <div>
          <h2 className="feed-title">Active Response Units & Officers</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Real-time personnel readiness, assigned emergency vectors & battery telemetry
          </p>
        </div>
        <span className="count-pill">{responders.length} On Duty</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {responders.map((resp) => {
          const badge = getStatusBadge(resp.status);

          return (
            <div
              key={resp.id}
              className="incident-card"
              style={{ cursor: 'default' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                    }}
                  >
                    {resp.avatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{resp.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {resp.role} • <strong>{resp.unit}</strong>
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '999px',
                    background: badge.bg,
                    color: badge.color,
                  }}
                >
                  {badge.label}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.75rem',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={13} color="var(--brand-primary-light)" />
                  <span>{resp.location}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={13} color="var(--color-info)" />
                  <span>ETA: <strong>{resp.eta}</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'monospace' }}>
                  <Battery size={13} color={resp.battery < 30 ? '#ef4444' : '#10b981'} />
                  <span>{resp.battery}%</span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginTop: '0.25rem',
                }}
              >
                <a
                  href={`tel:${resp.phone}`}
                  className="btn btn-secondary btn-xs"
                  style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}
                >
                  <Phone size={12} />
                  <span>Call Direct</span>
                </a>

                <button
                  className="btn btn-primary btn-xs"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => onSelectResponder && onSelectResponder(resp)}
                >
                  <Radio size={12} />
                  <span>Radio Ping</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
