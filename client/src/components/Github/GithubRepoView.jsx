import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GithubReviewDetail from './GithubReviewDetail';

const GithubRepoView = ({ repoName, reviews, onSelect }) => {
  if (reviews.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#8b949e', textAlign: 'center' }}>
        <div style={{ marginBottom: 16 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6e7681" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line>
          </svg>
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>No AI Reviews Yet</div>
        <div style={{ fontSize: '0.85rem', maxWidth: 300, lineHeight: 1.6 }}>
          When you open a Pull Request on GitHub for {repoName}, the AI review will appear here.
        </div>
      </div>
    );
  }

  const avgScore = Math.round(reviews.reduce((a, c) => a + c.score, 0) / reviews.length);
  
  const chartData = [...reviews].reverse().map(h => ({
    date: new Date(h.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    score: h.score,
  }));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Total PRs Reviewed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#2ea043' }}>{reviews.length}</div>
        </div>
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Average Score</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: avgScore >= 75 ? '#3fb950' : avgScore >= 50 ? '#d29922' : '#f85149' }}>
            {avgScore}/100
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '20px 24px', marginBottom: 28 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>Code Quality Trend</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="date" stroke="#6e7681" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6e7681" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, fontSize: '0.82rem' }} itemStyle={{ color: '#58a6ff' }} />
                <Line type="monotone" dataKey="score" stroke="#58a6ff" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0d1117', stroke: '#58a6ff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#58a6ff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {reviews.map((item, i) => (
          <div
            key={item._id}
            onClick={() => onSelect(item)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', background: '#161b22', border: '1px solid #21262d',
              borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.background = '#1c2128'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#21262d'; e.currentTarget.style.background = '#161b22'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'rgba(139, 148, 158, 0.1)', borderRadius: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line>
                </svg>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e6edf3' }}>{item.pullRequestTitle}</span>
                  <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>#{item.pullRequestNumber}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                  {new Date(item.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>{item.issues?.length || 0} issues</span>
              </div>
              <span style={{
                fontSize: '0.8rem', fontWeight: 700,
                color: item.score >= 75 ? '#22c55e' : item.score >= 50 ? '#eab308' : '#f85149',
                background: `rgba(${item.score >= 75 ? '34,197,94' : item.score >= 50 ? '234,179,8' : '248,81,73'},0.15)`,
                border: `1px solid ${item.score >= 75 ? '#22c55e' : item.score >= 50 ? '#eab308' : '#f85149'}40`,
                borderRadius: '4px', padding: '4px 10px'
              }}>
                {item.score}/100
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GithubRepoView;
