import React from 'react';

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', color: '#ff4c4c', bg: 'rgba(255,76,76,0.12)', border: 'rgba(255,76,76,0.3)' },
  high:     { label: 'High',     color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' },
  medium:   { label: 'Medium',   color: '#eab308', bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.3)' },
  low:      { label: 'Low',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)' },
  info:     { label: 'Info',     color: '#58a6ff', bg: 'rgba(88,166,255,0.12)', border: 'rgba(88,166,255,0.3)' },
};

const CATEGORY_ICONS = {
  security:    '🔒',
  performance: '⚡',
  style:       '🎨',
};

const SeverityBadge = ({ severity }) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '0.68rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: config.color,
      background: config.bg,
      border: `1px solid ${config.border}`,
    }}>
      {config.label}
    </span>
  );
};

export { SeverityBadge, SEVERITY_CONFIG, CATEGORY_ICONS };
