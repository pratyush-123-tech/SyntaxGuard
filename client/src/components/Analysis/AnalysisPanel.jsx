import React from 'react';
import IssueCard from './IssueCard';
import ScoreRing from './ScoreRing';
import StreamingIndicator from './StreamingIndicator';

const CATEGORY_ICONS = { security: '🔒', performance: '⚡', style: '🎨' };

const AnalysisPanel = ({ result, isStreaming, streamBuffer, servedFromCache }) => {
  // Empty state
  if (!result && !isStreaming) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100%', gap: '16px', padding: '40px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem' }}>🔍</div>
        <h3 style={{ margin: 0, color: '#e6edf3', fontWeight: 600 }}>
          Your Analysis Will Appear Here
        </h3>
        <p style={{ margin: 0, color: '#8b949e', fontSize: '0.88rem', maxWidth: '280px', lineHeight: 1.6 }}>
          Paste your code in the editor, select a language, and click <strong style={{ color: '#58a6ff' }}>Analyze Code</strong> to get started.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          {['Security vulnerabilities', 'Performance bottlenecks', 'Style violations'].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: '#8b949e', fontSize: '0.82rem',
            }}>
              <span style={{ color: '#22c55e' }}>✓</span> {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Streaming state
  if (isStreaming) {
    return <StreamingIndicator buffer={streamBuffer} />;
  }

  // Results state
  const issuesBySeverity = {
    critical: result.issues?.filter(i => i.severity === 'critical') || [],
    high:     result.issues?.filter(i => i.severity === 'high') || [],
    medium:   result.issues?.filter(i => i.severity === 'medium') || [],
    low:      result.issues?.filter(i => i.severity === 'low') || [],
    info:     result.issues?.filter(i => i.severity === 'info') || [],
  };

  const totalIssues = result.issues?.length || 0;
  const byCategory = {
    security:    result.issues?.filter(i => i.category === 'security').length || 0,
    performance: result.issues?.filter(i => i.category === 'performance').length || 0,
    style:       result.issues?.filter(i => i.category === 'style').length || 0,
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #30363d',
        background: '#0d1117',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#e6edf3' }}>
              Analysis Results
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#8b949e' }}>
              {totalIssues} issue{totalIssues !== 1 ? 's' : ''} found
              {servedFromCache && (
                <span style={{
                  marginLeft: '8px', color: '#58a6ff',
                  background: 'rgba(88,166,255,0.1)',
                  padding: '1px 7px', borderRadius: '10px',
                  fontSize: '0.7rem', border: '1px solid rgba(88,166,255,0.2)',
                }}>
                  ⚡ Cached
                </span>
              )}
            </p>
          </div>
          <ScoreRing score={result.score || 0} />
        </div>

        {/* Summary */}
        {result.summary && (
          <p style={{
            margin: '12px 0 0', fontSize: '0.82rem', color: '#8b949e',
            lineHeight: 1.6, padding: '10px 12px',
            background: '#161b22', borderRadius: '6px',
            border: '1px solid #30363d',
          }}>
            {result.summary}
          </p>
        )}

        {/* Category counts */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          {Object.entries(byCategory).map(([cat, count]) => (
            <div key={cat} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: '#161b22', border: '1px solid #30363d',
              borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', color: '#8b949e',
            }}>
              <span>{CATEGORY_ICONS[cat]}</span>
              <span style={{ color: count > 0 ? '#e6edf3' : '#8b949e', fontWeight: count > 0 ? 600 : 400 }}>
                {count}
              </span>
              <span style={{ textTransform: 'capitalize' }}>{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {totalIssues === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎉</div>
            <h4 style={{ margin: 0, color: '#22c55e', fontWeight: 600 }}>No Issues Found!</h4>
            <p style={{ margin: '8px 0 0', color: '#8b949e', fontSize: '0.85rem' }}>
              Your code looks clean and well-written.
            </p>
          </div>
        ) : (
          <>
            {/* Render issues sorted by severity */}
            {['critical', 'high', 'medium', 'low', 'info'].map(severity =>
              issuesBySeverity[severity].map((issue, idx) => (
                <IssueCard key={`${severity}-${idx}`} issue={issue} index={idx} />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;
