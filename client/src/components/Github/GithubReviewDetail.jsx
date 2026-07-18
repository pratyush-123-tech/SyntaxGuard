import React from 'react';

const GithubReviewDetail = ({ item, onBack }) => {
  if (!item) return null;

  return (
    <div>
      {/* Back button / breadcrumb */}
      <button
        onClick={onBack}
        style={{ background: 'none', border: 'none', color: '#58a6ff', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 20, padding: 0 }}
      >
        ← Back to list
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, background: '#161b22', padding: 24, borderRadius: 8, border: '1px solid #21262d' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line>
            </svg>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#e6edf3' }}>
              {item.pullRequestTitle}
            </h2>
            <a href={item.pullRequestUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#58a6ff', textDecoration: 'none', background: 'rgba(88,166,255,0.1)', padding: '4px 8px', borderRadius: 4, marginLeft: 8 }}>
              View on GitHub ↗
            </a>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#8b949e', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>{item.repositoryName}</span>
            <span>•</span>
            <span>PR #{item.pullRequestNumber}</span>
            <span>•</span>
            <span>{new Date(item.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Overall Health</div>
          <div style={{
            fontSize: '1.5rem', fontWeight: 700,
            color: item.score >= 75 ? '#22c55e' : item.score >= 50 ? '#eab308' : '#f85149',
          }}>
            {item.score}/100
          </div>
        </div>
      </div>

      {/* Summary */}
      {item.summary && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>AI Summary</div>
          <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: '16px 20px', color: '#c9d1d9', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {item.summary}
          </div>
        </div>
      )}

      {/* Issues */}
      {item.issues?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Issues Detected ({item.issues.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {item.issues.map((issue, i) => {
              const sev = issue.severity?.toLowerCase();
              const sevColor = sev === 'critical' ? '#f85149' : sev === 'high' ? '#ff7b72' : sev === 'medium' ? '#d29922' : '#3fb950';
              return (
                <div key={i} style={{ background: '#161b22', border: `1px solid ${sevColor}30`, borderLeft: `3px solid ${sevColor}`, borderRadius: 8, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: sevColor, background: `${sevColor}20`, padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {issue.severity || 'info'}
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e6edf3' }}>{issue.title || issue.type}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#c9d1d9', lineHeight: 1.6 }}>{issue.description || issue.message}</p>
                  
                  {issue.suggestion && (
                    <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(63,185,80,0.05)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 6 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3fb950', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>💡 Suggestion</div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#e6edf3', lineHeight: 1.5 }}>{issue.suggestion}</p>
                    </div>
                  )}
                  
                  {issue.refactoredCode && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#58a6ff', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>⚡ Fix</div>
                      <pre style={{ margin: 0, padding: '12px 16px', background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, fontSize: '0.8rem', color: '#e6edf3', overflowX: 'auto', fontFamily: "'JetBrains Mono','Fira Code',monospace", lineHeight: 1.5 }}>
                        {issue.refactoredCode}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GithubReviewDetail;
