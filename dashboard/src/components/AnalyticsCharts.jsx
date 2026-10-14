import React, { useState } from 'react';
import {
  PieChart,
  TrendingUp,
  BarChart3,
  Activity,
  Calendar,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { INCIDENT_TYPES, RESPONSE_TIME_HOURLY } from '../data/mockData';

export default function AnalyticsCharts({ incidents }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Compute category counts
  const categoryCounts = Object.keys(INCIDENT_TYPES).reduce((acc, typeKey) => {
    acc[typeKey] = incidents.filter(i => i.type === typeKey).length;
    return acc;
  }, {});

  const totalIncidents = incidents.length || 1;

  // Donut chart math
  let currentCumulativeAngle = 0;
  const radius = 60;
  const cx = 90;
  const cy = 90;
  const circumference = 2 * Math.PI * radius;

  const donutSlices = Object.entries(INCIDENT_TYPES).map(([typeKey, config]) => {
    const count = categoryCounts[typeKey] || 0;
    const percentage = count / totalIncidents;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -currentCumulativeAngle * circumference;
    currentCumulativeAngle += percentage;

    return {
      typeKey,
      label: config.label,
      color: config.color,
      count,
      pctString: Math.round(percentage * 100) + '%',
      strokeDasharray,
      strokeDashoffset,
    };
  });

  // Response time curve coordinates for SVG
  const graphWidth = 420;
  const graphHeight = 140;
  const maxMins = 3.5;
  const points = RESPONSE_TIME_HOURLY.map((item, idx) => {
    const x = (idx / (RESPONSE_TIME_HOURLY.length - 1)) * (graphWidth - 40) + 20;
    const y = graphHeight - 20 - (item.avgMins / maxMins) * (graphHeight - 40);
    return { ...item, x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${graphHeight - 10} L ${points[0].x} ${graphHeight - 10} Z`;

  return (
    <div className="analytics-container">
      {/* 1. Category Distribution Donut */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Incident Category Distribution</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Breakdown across emergency response types
            </p>
          </div>
          <PieChart size={18} color="var(--brand-primary-light)" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* SVG Donut */}
          <div style={{ position: 'relative', width: '180px', height: '180px' }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke="var(--bg-tertiary)"
                strokeWidth="24"
              />
              {donutSlices.map((slice) => (
                <circle
                  key={slice.typeKey}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="24"
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    opacity: hoveredSlice && hoveredSlice !== slice.typeKey ? 0.4 : 1,
                  }}
                  transform={`rotate(-90 ${cx} ${cy})`}
                  onMouseEnter={() => setHoveredSlice(slice.typeKey)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              ))}
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {hoveredSlice ? categoryCounts[hoveredSlice] : incidents.length}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                {hoveredSlice ? INCIDENT_TYPES[hoveredSlice].label : 'Total'}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '170px' }}>
            {donutSlices.map((slice) => (
              <div
                key={slice.typeKey}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  fontSize: '0.8rem',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: hoveredSlice === slice.typeKey ? 'var(--bg-tertiary)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={() => setHoveredSlice(slice.typeKey)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: slice.color,
                      display: 'inline-block',
                    }}
                  ></span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{slice.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace' }}>
                  <span style={{ fontWeight: 700 }}>{slice.count}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>({slice.pctString})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Response Time Telemetry Trend Line */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Dispatch Response Time Trend</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Minutes to acknowledge & dispatch over 24-hr window
            </p>
          </div>
          <TrendingUp size={18} color="var(--color-info)" />
        </div>

        <div style={{ position: 'relative', width: '100%', height: '170px' }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${graphWidth} ${graphHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Target Line (4.0 mins benchmark) */}
            <line
              x1="20"
              y1={graphHeight - 20 - (4.0 / maxMins) * (graphHeight - 40)}
              x2={graphWidth - 20}
              y2={graphHeight - 20 - (4.0 / maxMins) * (graphHeight - 40)}
              stroke="rgba(239, 68, 68, 0.3)"
              strokeDasharray="4 4"
            />

            {/* Area Fill */}
            <path d={areaD} fill="url(#areaGradient)" />

            {/* Line Curve */}
            <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />

            {/* Points */}
            {points.map((pt, idx) => (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint === idx ? 6 : 4}
                  fill="#ffffff"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}
          </svg>

          {/* Time Labels */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 20px',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              fontFamily: 'monospace',
              marginTop: '4px',
            }}
          >
            {RESPONSE_TIME_HOURLY.map((h, i) => (
              <span key={i}>{h.hour}</span>
            ))}
          </div>

          {/* Hover Tooltip */}
          {hoveredPoint !== null && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'var(--bg-tertiary)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <strong>{RESPONSE_TIME_HOURLY[hoveredPoint].hour}</strong>:{' '}
              <span style={{ color: '#06b6d4', fontWeight: 700 }}>
                {RESPONSE_TIME_HOURLY[hoveredPoint].avgMins} mins
              </span>{' '}
              ({RESPONSE_TIME_HOURLY[hoveredPoint].count} calls)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
