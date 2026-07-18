import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python',     label: 'Python' },
  { value: 'java',       label: 'Java' },
  { value: 'cpp',        label: 'C++' },
  { value: 'go',         label: 'Go' },
  { value: 'rust',       label: 'Rust' },
  { value: 'php',        label: 'PHP' },
  { value: 'ruby',       label: 'Ruby' },
  { value: 'sql',        label: 'SQL' },
];

const CodeEditor = ({ code, language, onCodeChange, onLanguageChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 16px',
        background: '#161b22',
        borderBottom: '1px solid #30363d',
      }}>
        {/* Traffic lights (decorative, VS Code style) */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
          ))}
        </div>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#8b949e', fontFamily: "'JetBrains Mono', monospace" }}>
            code-review.{language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'typescript' ? 'ts' : language === 'cpp' ? 'cpp' : 'js'}
          </span>
        </div>

        {/* Custom Language Selector */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              background: '#21262d',
              border: '1px solid #30363d',
              color: '#e6edf3',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              userSelect: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#30363d'}
            onMouseLeave={e => e.currentTarget.style.background = '#21262d'}
          >
            {LANGUAGES.find(l => l.value === language)?.label || 'Select'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {isDropdownOpen && (
            <>
              {/* Invisible overlay to close dropdown when clicking outside */}
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 9 }} 
                onClick={() => setIsDropdownOpen(false)}
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 10,
                minWidth: '140px',
                maxHeight: '300px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                padding: '4px'
              }}>
                {LANGUAGES.map(lang => (
                  <div
                    key={lang.value}
                    onClick={() => {
                      onLanguageChange(lang.value);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      color: language === lang.value ? '#58a6ff' : '#c9d1d9',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      background: language === lang.value ? 'rgba(88,166,255,0.1)' : 'transparent',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onMouseEnter={e => {
                      if (language !== lang.value) e.currentTarget.style.background = '#21262d';
                    }}
                    onMouseLeave={e => {
                      if (language !== lang.value) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {lang.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={onCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'gutter',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            padding: { top: 16, bottom: 16 },
            bracketPairColorization: { enabled: true },
            wordWrap: 'on',
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
