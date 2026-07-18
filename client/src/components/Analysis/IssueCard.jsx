import React, { useState } from 'react';
import { SeverityBadge, CATEGORY_ICONS } from './SeverityBadge';

const IssueCard = ({ issue, index }) => {
  const [expanded, setExpanded] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const categoryIcon = CATEGORY_ICONS[issue.category] || '📌';

  return (
    <div
      className="issue-card fade-in"
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '10px',
        marginBottom: '10px',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        animationDelay: `${index * 0.05}s`,
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#58a6ff'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#30363d'}
    >
      {/* Card Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 16px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: '1rem' }}>{categoryIcon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <SeverityBadge severity={issue.severity} />
            <span style={{
              fontSize: '0.7rem',
              color: '#8b949e',
              background: '#21262d',
              padding: '1px 7px',
              borderRadius: '4px',
              border: '1px solid #30363d',
            }}>
              Line {issue.line}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'capitalize' }}>
              {issue.category}
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.88rem', fontWeight: 600, color: '#e6edf3' }}>
            {issue.title}
          </p>
        </div>
        <span style={{
          color: '#8b949e',
          fontSize: '0.8rem',
          transition: 'transform 0.2s',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>▼</span>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid #21262d' }}>
          {/* Description */}
          <p style={{ margin: '12px 0 8px', fontSize: '0.85rem', color: '#8b949e', lineHeight: 1.6 }}>
            {issue.description}
          </p>

          {/* Suggestion */}
          <div style={{
            background: 'rgba(34,197,94,0.07)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '6px',
            padding: '10px 12px',
            marginBottom: '10px',
          }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#22c55e', fontWeight: 600, marginBottom: '4px' }}>
              💡 Suggestion
            </p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#8b949e', lineHeight: 1.6 }}>
              {issue.suggestion}
            </p>
          </div>

          {/* Refactored Code Toggle */}
          {issue.refactoredCode && (
            <>
              <button
                onClick={() => setShowCode(!showCode)}
                style={{
                  background: '#21262d',
                  border: '1px solid #30363d',
                  color: '#58a6ff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.target.background = '#30363d'; e.target.style.background = '#30363d'; }}
                onMouseLeave={e => { e.target.style.background = '#21262d'; }}
              >
                {showCode ? '▲ Hide Fixed Code' : '▼ Show Fixed Code'}
              </button>
              {showCode && (
                <pre style={{
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '0.78rem',
                  color: '#e6edf3',
                  fontFamily: "'JetBrains Mono', monospace",
                  overflowX: 'auto',
                  margin: 0,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {issue.refactoredCode}
                </pre>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default IssueCard;
