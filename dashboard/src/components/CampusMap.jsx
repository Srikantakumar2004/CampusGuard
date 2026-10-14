import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  Shield,
  PhoneCall,
  Flame,
  HeartPulse,
  ShieldAlert,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
} from 'lucide-react';
import {
  CAMPUS_ZONES,
  CAMPUS_BUILDINGS_RENDER,
  EMERGENCY_PHONES,
  INCIDENT_TYPES,
} from '../data/mockData';

export default function CampusMap({
  incidents,
  responders,
  onSelectIncident,
  selectedIncident,
}) {
  const [showCallBoxes, setShowCallBoxes] = useState(true);
  const [showResponders, setShowResponders] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [hoveredEntity, setHoveredEntity] = useState(null);

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  return (
    <div className="tactical-map-card">
      <div className="map-header">
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Crosshair size={18} color="var(--color-info)" />
            <span>Campus Tactical Radar & GIS</span>
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Live spatial telemetry — {activeIncidents.length} active beacons, {responders.length} units tracked
          </p>
        </div>

        {/* Map Layer Controls */}
        <div className="map-controls-row">
          <button
            className={`btn btn-secondary btn-xs ${showCallBoxes ? 'active' : ''}`}
            onClick={() => setShowCallBoxes(!showCallBoxes)}
            title="Toggle Blue Light Emergency Phones layer"
          >
            <PhoneCall size={12} color="var(--color-info)" />
            <span>Call Boxes</span>
          </button>

          <button
            className={`btn btn-secondary btn-xs ${showResponders ? 'active' : ''}`}
            onClick={() => setShowResponders(!showResponders)}
            title="Toggle Responder Units GPS layer"
          >
            <Shield size={12} color="var(--brand-primary-light)" />
            <span>Patrols</span>
          </button>

          <button
            className={`btn btn-secondary btn-xs ${showHeatmap ? 'active' : ''}`}
            onClick={() => setShowHeatmap(!showHeatmap)}
            title="Toggle Zone Alert Heatmap layer"
          >
            <Layers size={12} color="var(--color-warning)" />
            <span>Zones</span>
          </button>
        </div>
      </div>

      {/* Viewport Canvas */}
      <div className="map-viewport-container">
        {/* Grid Background & Radar Sweep */}
        <div className="map-grid-bg"></div>
        <div className="map-radar-sweep"></div>

        {/* Campus Danger Zones Heatmap Layer */}
        {showHeatmap &&
          CAMPUS_ZONES.map((zone) => {
            const dangerBg =
              zone.danger === 'high'
                ? 'rgba(239, 68, 68, 0.12)'
                : zone.danger === 'medium'
                ? 'rgba(245, 158, 11, 0.08)'
                : 'rgba(59, 130, 246, 0.05)';
            const dangerBorder =
              zone.danger === 'high'
                ? 'rgba(239, 68, 68, 0.4)'
                : zone.danger === 'medium'
                ? 'rgba(245, 158, 11, 0.3)'
                : 'rgba(59, 130, 246, 0.2)';

            return (
              <div
                key={zone.id}
                style={{
                  position: 'absolute',
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                  background: dangerBg,
                  border: `1px dashed ${dangerBorder}`,
                  borderRadius: '12px',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    left: '8px',
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    color: zone.danger === 'high' ? '#f87171' : '#94a3b8',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {zone.code} — {zone.name}
                </span>
              </div>
            );
          })}

        {/* Campus Buildings */}
        {CAMPUS_BUILDINGS_RENDER.map((bld) => (
          <div
            key={bld.id}
            className="map-building"
            style={{
              left: `${bld.x}%`,
              top: `${bld.y}%`,
              width: `${bld.w}%`,
              height: `${bld.h}%`,
              zIndex: 5,
            }}
            onMouseEnter={() => setHoveredEntity({ type: 'building', name: bld.name })}
            onMouseLeave={() => setHoveredEntity(null)}
          >
            <span>{bld.label}</span>
          </div>
        ))}

        {/* Blue Light Emergency Call Boxes */}
        {showCallBoxes &&
          EMERGENCY_PHONES.map((phone) => (
            <div
              key={phone.id}
              style={{
                position: 'absolute',
                left: `${phone.x}%`,
                top: `${phone.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 8,
                cursor: 'pointer',
              }}
              title={`${phone.name} (Online - Operational)`}
              onMouseEnter={() => setHoveredEntity({ type: 'callbox', name: phone.name })}
              onMouseLeave={() => setHoveredEntity(null)}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#0284c7',
                  border: '2px solid #bae6fd',
                  boxShadow: '0 0 10px #0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'white' }}></div>
              </div>
            </div>
          ))}

        {/* Active Incident Radar Beacons */}
        {activeIncidents.map((incident) => {
          const coords = incident.mapCoords || { x: 50, y: 50 };
          const isSelected = selectedIncident && selectedIncident.id === incident.id;
          const typeColor = INCIDENT_TYPES[incident.type]?.color || '#ef4444';

          return (
            <div
              key={incident.id}
              className="map-incident-beacon"
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
                zIndex: isSelected ? 30 : 20,
              }}
              onClick={() => onSelectIncident(incident)}
              onMouseEnter={() => setHoveredEntity({ type: 'incident', item: incident })}
              onMouseLeave={() => setHoveredEntity(null)}
              title={`${incident.id}: ${incident.description}`}
            >
              <div className="beacon-ping" style={{ background: `${typeColor}44` }}></div>
              <div
                className="beacon-core"
                style={{
                  background: typeColor,
                  boxShadow: `0 0 16px ${typeColor}`,
                  border: isSelected ? '2px solid white' : 'none',
                }}
              >
                {incident.type === 'medical' && <HeartPulse size={12} />}
                {incident.type === 'fire' && <Flame size={12} />}
                {incident.type === 'security' && <ShieldAlert size={12} />}
                {incident.type === 'naturalDisaster' && <AlertTriangle size={12} />}
                {incident.type === 'other' && <MapPin size={12} />}
              </div>
            </div>
          );
        })}

        {/* Responders on Patrol */}
        {showResponders &&
          responders.map((resp, index) => {
            // Simulated positions
            const positions = [
              { x: 62, y: 35 },
              { x: 30, y: 34 },
              { x: 50, y: 20 },
              { x: 44, y: 58 },
              { x: 22, y: 68 },
            ];
            const pos = positions[index % positions.length];

            return (
              <div
                key={resp.id}
                className="map-responder-marker"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onMouseEnter={() => setHoveredEntity({ type: 'responder', item: resp })}
                onMouseLeave={() => setHoveredEntity(null)}
                title={`${resp.name} (${resp.unit}) - ${resp.status}`}
              >
                <div className="responder-dot">
                  <Shield size={10} />
                </div>
                <span className="responder-label">{resp.unit}</span>
              </div>
            );
          })}

        {/* Hover Tactical Tooltip Card */}
        {hoveredEntity && (
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '14px',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              padding: '8px 14px',
              color: 'white',
              fontSize: '0.78rem',
              zIndex: 40,
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none',
              maxWidth: '320px',
            }}
          >
            {hoveredEntity.type === 'building' && (
              <div>
                <strong style={{ color: 'var(--brand-primary-light)' }}>{hoveredEntity.name}</strong>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Campus Facility / Academic Complex</p>
              </div>
            )}
            {hoveredEntity.type === 'callbox' && (
              <div>
                <strong style={{ color: 'var(--color-info)' }}>{hoveredEntity.name}</strong>
                <p style={{ fontSize: '0.72rem', color: '#10b981' }}>● Direct 911/Dispatch Uplink Verified</p>
              </div>
            )}
            {hoveredEntity.type === 'incident' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontWeight: 700 }}>
                  <AlertTriangle size={13} />
                  <span>{hoveredEntity.item.id.toUpperCase()} — {hoveredEntity.item.severity.toUpperCase()}</span>
                </div>
                <div style={{ color: '#e2e8f0', marginTop: '2px' }}>{hoveredEntity.item.locationLabel}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                  {hoveredEntity.item.description.slice(0, 70)}...
                </div>
              </div>
            )}
            {hoveredEntity.type === 'responder' && (
              <div>
                <strong style={{ color: '#93c5fd' }}>{hoveredEntity.item.name}</strong>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                  {hoveredEntity.item.role} • {hoveredEntity.item.unit}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#34d399', marginTop: '2px' }}>
                  Status: {hoveredEntity.item.status.toUpperCase()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.74rem',
          color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
            <span>Critical Emergency</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
            <span>High Severity</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
            <span>Responder Unit</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7', display: 'inline-block' }}></span>
            <span>Blue Light Phone</span>
          </div>
        </div>

        <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
          Click any beacon to view incident telemetry
        </div>
      </div>
    </div>
  );
}
