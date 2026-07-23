import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CodeEditor from '../components/Editor/CodeEditor';
import AnalysisPanel from '../components/Analysis/AnalysisPanel';
import { streamAnalysis } from '../services/analysisService';
import { getRepositories } from '../services/repositoryService';

const DEFAULT_CODE = `// Paste your code here or start typing...
// Example: This function has a security vulnerability!

function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return db.execute(query);
}

function processItems(items) {
  let result = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      result.push(items[i] + items[j]);
    }
  }
  return result;
}

const API_KEY = "sk-1234567890abcdef";
`;

const Home = () => {
  const [code, setCode]           = useState(DEFAULT_CODE);
  const [language, setLanguage]   = useState('javascript');
  const [result, setResult]       = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [servedFromCache, setServedFromCache] = useState(false);
  const [error, setError]         = useState(null);

  const [repos, setRepos]         = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState('');

  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [freeAttempts, setFreeAttempts] = useState(() => {
    const saved = localStorage.getItem('freeAttempts');
    return saved !== null ? parseInt(saved, 10) : 3;
  });

  // Fetch repos if user is logged in
  useEffect(() => {
    const fetchRepos = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await getRepositories();
          setRepos(res.data);
        } catch (err) {
          console.error('Failed to load repositories', err);
        }
      }
    };
    fetchRepos();
  }, []);

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    if (!isAuthenticated && freeAttempts <= 0) {
      setError('You have used all 3 free attempts. Please sign up to continue analyzing code!');
      return;
    }

    setError(null);
    setResult(null);
    setStreamBuffer('');
    setIsStreaming(true);

    try {
      await streamAnalysis(
        code,
        language,
        selectedRepoId || null,
        (chunk) => {
          setStreamBuffer(prev => prev + chunk);
        },
        (finalResult) => {
          setResult(finalResult);
          setServedFromCache(finalResult.servedFromCache || false);
          setIsStreaming(false);
          setStreamBuffer('');

          if (!isAuthenticated) {
            const newAttempts = freeAttempts - 1;
            setFreeAttempts(newAttempts);
            localStorage.setItem('freeAttempts', newAttempts.toString());
          }
        }
      );
    } catch (err) {
      setError(err.message || 'Something went wrong. Is the server running?');
      setIsStreaming(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setResult(null);
    setStreamBuffer('');
    setError(null);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 61px)', // subtract navbar height
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        borderBottom: '1px solid #30363d',
        background: '#0d1117',
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#e6edf3' }}>
            Code Reviewer
          </h1>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#8b949e' }}>
            Paste your code and get an instant AI-powered security & quality audit
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          
          {!isAuthenticated && (
             <div style={{ marginRight: '16px', fontSize: '0.8rem', color: '#8b949e', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Free attempts left: <strong style={{ color: freeAttempts > 0 ? '#3fb950' : '#f85149' }}>{freeAttempts}/3</strong></span>
                <Link to="/register" style={{ color: '#58a6ff', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
             </div>
          )}

          {isAuthenticated && repos.length > 0 && (
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              style={{
                background: '#0d1117',
                border: '1px solid #30363d',
                color: '#e6edf3',
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Link to Project (Optional)</option>
              {repos.map(repo => (
                <option key={repo._id} value={repo._id}>{repo.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={handleClear}
            disabled={isStreaming}
            style={{
              background: '#21262d',
              border: '1px solid #30363d',
              color: '#8b949e',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              cursor: isStreaming ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!isStreaming) e.target.style.color = '#e6edf3'; }}
            onMouseLeave={e => { e.target.style.color = '#8b949e'; }}
          >
            Clear
          </button>

          <button
            onClick={handleAnalyze}
            disabled={isStreaming || !code.trim()}
            style={{
              background: isStreaming ? '#21262d' : 'linear-gradient(135deg, #58a6ff, #1f6feb)',
              border: 'none',
              color: isStreaming ? '#8b949e' : '#ffffff',
              padding: '8px 20px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isStreaming || !code.trim() ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isStreaming ? 'none' : '0 0 20px rgba(88,166,255,0.3)',
            }}
          >
            {isStreaming ? (
              <>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  border: '2px solid #8b949e',
                  borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Analyzing...
              </>
            ) : (
              <> 🔍 Analyze Code </>
            )}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          padding: '10px 20px',
          background: 'rgba(255,76,76,0.1)',
          borderBottom: '1px solid rgba(255,76,76,0.3)',
          color: '#ff4c4c',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          ❌ {error}
        </div>
      )}

      {/* Main split layout */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Left: Monaco Editor */}
        <div style={{
          flex: 1,
          borderRight: '1px solid #30363d',
          overflow: 'hidden',
          minWidth: 0,
        }}>
          <CodeEditor
            code={code}
            language={language}
            onCodeChange={setCode}
            onLanguageChange={setLanguage}
          />
        </div>

        {/* Right: Analysis Results */}
        <div style={{
          width: '420px',
          flexShrink: 0,
          background: '#0d1117',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <AnalysisPanel
            result={result}
            isStreaming={isStreaming}
            streamBuffer={streamBuffer}
            servedFromCache={servedFromCache}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Home;
