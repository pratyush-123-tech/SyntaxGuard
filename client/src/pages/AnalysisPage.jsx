import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysisById } from '../services/analysisService';
import CodeEditor from '../components/Editor/CodeEditor';
import AnalysisPanel from '../components/Analysis/AnalysisPanel';

const AnalysisPage = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await getAnalysisById(id);
        // getAnalysisById returns raw axios response: { data: { success: true, data: {...} } }
        setAnalysis(response.data?.data || null);
      } catch (err) {
        setError('Failed to load analysis. It may not exist or you do not have permission.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', color: '#8b949e', textAlign: 'center' }}>Loading analysis...</div>;
  if (error) return <div style={{ padding: '40px', color: '#ff4c4c', textAlign: 'center' }}>{error}</div>;
  if (!analysis) return <div style={{ padding: '40px', color: '#8b949e', textAlign: 'center' }}>Analysis not found.</div>;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 61px)',
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
            Analysis Report
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#8b949e' }}>
            Date: {new Date(analysis.createdAt).toLocaleString()} | Language: <span style={{ textTransform: 'capitalize' }}>{analysis.language}</span>
          </p>
        </div>
        
        <Link to="/dashboard" style={{
          color: '#58a6ff', textDecoration: 'none', fontSize: '0.85rem',
          padding: '6px 12px', border: '1px solid #30363d', borderRadius: '6px',
          background: '#21262d'
        }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* Main split layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Code Viewer */}
        <div style={{ flex: 1, borderRight: '1px solid #30363d', overflow: 'hidden' }}>
          <CodeEditor
            code={analysis.originalCode}
            language={analysis.language}
            onCodeChange={() => {}} // Read-only conceptually for this view
            onLanguageChange={() => {}}
            // You can optionally pass a readOnly prop if CodeEditor supports it, 
            // but ignoring changes here works as a quick mock.
          />
        </div>

        {/* Right: Analysis Results */}
        <div style={{ width: '420px', flexShrink: 0, background: '#0d1117', display: 'flex', flexDirection: 'column' }}>
          <AnalysisPanel
            result={{ issues: analysis.issues, score: analysis.score }}
            isStreaming={false}
            streamBuffer=""
            servedFromCache={analysis.servedFromCache}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
