import React from 'react';

const ScoreRing = ({ score, size = 96, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 75) return '#22c55e';
    if (s >= 50) return '#eab308';
    return '#ff4c4c';
  };

  const color = getColor(score);
  const label = score >= 75 ? 'Good' : score >= 50 ? 'Fair' : 'Poor';

  // Scale fonts based on size
  const numSize = size > 60 ? '1.4rem' : '0.85rem';
  const outOfSize = size > 60 ? '0.6rem' : '0.45rem';
  const showLabel = size > 60;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#21262d" strokeWidth={strokeWidth} />
          {/* Score ring */}
          <circle
            cx={center} cy={center} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        {/* Score number in center */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: numSize, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
          {size > 60 && <span style={{ fontSize: outOfSize, color: '#8b949e', marginTop: '2px' }}>/100</span>}
        </div>
      </div>
      {showLabel && (
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color,
          background: `rgba(${score >= 75 ? '34,197,94' : score >= 50 ? '234,179,8' : '255,76,76'},0.12)`,
          padding: '2px 8px',
          borderRadius: '10px',
          border: `1px solid ${color}30`,
        }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default ScoreRing;
