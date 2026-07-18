import React from 'react';

const StreamingIndicator = ({ buffer }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '24px',
      padding: '40px',
    }}>
      {/* Animated dots */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 10, height: 10,
            borderRadius: '50%',
            background: '#58a6ff',
            animation: 'pulse 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>

      {/* Status text */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#e6edf3', fontWeight: 600, fontSize: '1rem' }}>
          AI is reviewing your code...
        </p>
        <p style={{ margin: '6px 0 0', color: '#8b949e', fontSize: '0.82rem' }}>
          Checking for security, performance & style issues
        </p>
      </div>

      {/* Streaming text buffer */}
      {buffer && (
        <div style={{
          width: '100%',
          maxHeight: '200px',
          overflow: 'hidden',
          background: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '12px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '60px',
            background: 'linear-gradient(to bottom, #0d1117, transparent)',
            zIndex: 1,
          }} />
          <pre style={{
            margin: 0,
            fontSize: '0.72rem',
            color: '#8b949e',
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.5,
          }}>
            {buffer}
          </pre>
        </div>
      )}

      {/* Progress bar */}
      <div style={{
        width: '200px', height: '3px',
        background: '#21262d',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #58a6ff, #79c0ff)',
          borderRadius: '2px',
          animation: 'progressBar 2s ease-in-out infinite',
        }} />
      </div>

      <style>{`
        @keyframes progressBar {
          0%   { width: 0%; margin-left: 0%; }
          50%  { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default StreamingIndicator;
