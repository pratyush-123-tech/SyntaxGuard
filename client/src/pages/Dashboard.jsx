import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getRepositories, createRepository, deleteRepository, renameRepository } from '../services/repositoryService';
import { getAnalysisHistory, deleteAnalysis } from '../services/analysisService';
import { getGithubReviews } from '../services/githubService';
import GithubRepoView from '../components/Github/GithubRepoView';
import GithubReviewDetail from '../components/Github/GithubReviewDetail';
// ─── Icons ────────────────────────────────────────────────────────────────────
const FolderIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={open ? '#58a6ff' : '#6e7681'} style={{ flexShrink: 0, marginTop: 1 }}>
    {open
      ? <path d="M2 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v1H2V6zm0 3h20l-1.5 9A2 2 0 0118.5 20h-13A2 2 0 013.5 18L2 9z" />
      : <path d="M2 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />}
  </svg>
);

const FileIcon = ({ lang }) => {
  const color = lang === 'python' ? '#3b82f6' : lang === 'javascript' ? '#f59e0b' : lang === 'typescript' ? '#2563eb' : '#8b949e';
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" style={{ flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  );
};

const ScoreBadge = ({ score }) => {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#f85149';
  const label = score >= 75 ? 'Good' : score >= 50 ? 'Fair' : 'Poor';
  return (
    <span style={{
      fontSize: '0.72rem', fontWeight: 700, color,
      background: `rgba(${score >= 75 ? '34,197,94' : score >= 50 ? '234,179,8' : '248,81,73'},0.15)`,
      border: `1px solid ${color}40`, borderRadius: '4px', padding: '2px 7px', letterSpacing: '0.02em'
    }}>{score} · {label}</span>
  );
};

// ─── Language extension map ────────────────────────────────────────────────────
const langExt = { javascript: 'js', typescript: 'ts', python: 'py', java: 'java', cpp: 'cpp', go: 'go', rust: 'rs', php: 'php', ruby: 'rb', sql: 'sql' };

// ─── Main Component ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [history, setHistory] = useState([]);
  const [githubReviews, setGithubReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRepoName, setNewRepoName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [repoSearch, setRepoSearch] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({ all: true });
  const [showNewRepo, setShowNewRepo] = useState(false);
  // Rename state
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async (pageNum = 1, append = false) => {
    try {
      const [repoRes, historyRes, githubRes] = await Promise.all([
        getRepositories(),
        getAnalysisHistory(pageNum, 20),
        getGithubReviews().catch(() => ({ data: { data: [] } }))
      ]);
      const reposArray = repoRes.data || [];
      const historyArray = historyRes.data?.data || [];
      const githubArray = githubRes.data?.data || [];
      setRepos(reposArray);
      setHistory(prev => append ? [...prev, ...historyArray] : historyArray);
      setGithubReviews(githubArray);
      setHasMore(historyRes.data?.pagination?.hasMore || false);
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleCreateRepo = async (e) => {
    e.preventDefault();
    if (!newRepoName.trim()) return;
    setIsCreating(true);
    try {
      await createRepository(newRepoName);
      setNewRepoName('');
      setShowNewRepo(false);
      await fetchData();
    } catch (e) {
      console.error('Failed to create repo:', e);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleFolder = (id) => setExpandedFolders(p => ({ ...p, [id]: !p[id] }));
  const selectFolder = (id) => {
    setSelectedFolder(id);
    setSelectedAnalysis(null);
    setExpandedFolders(p => ({ ...p, [id]: true }));
    setSidebarOpen(false); // close sidebar on mobile after selection
  };

  const handleDeleteRepo = async (id) => {
    if (!window.confirm('Delete this project and all its analyses? This cannot be undone.')) return;
    try {
      await deleteRepository(id);
      if (selectedFolder === id) selectFolder('all');
      await fetchData();
    } catch (e) { console.error(e); }
  };

  const handleStartRename = (repo) => {
    setRenamingId(repo._id);
    setRenameValue(repo.name);
  };

  const handleRename = async (id) => {
    if (!renameValue.trim()) return;
    try {
      await renameRepository(id, renameValue);
      setRenamingId(null);
      await fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (!window.confirm('Delete this analysis? This cannot be undone.')) return;
    try {
      await deleteAnalysis(analysisId);
      if (selectedAnalysis?._id === analysisId) setSelectedAnalysis(null);
      setHistory(prev => prev.filter(h => h._id !== analysisId));
    } catch (e) { console.error(e); }
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    await fetchData(nextPage, true);
  };

  // filtered history for selected folder
  const folderHistory = history.filter(item => {
    if (selectedFolder === 'all') return true;
    if (selectedFolder === 'general') return !item.repositoryId;
    return item.repositoryId === selectedFolder;
  });

  const filteredReposList = repos.filter(r => r.name.toLowerCase().includes(repoSearch.toLowerCase()));

  const generalCount = history.filter(h => !h.repositoryId).length;
  const avgScore = folderHistory.length
    ? Math.round(folderHistory.reduce((a, c) => a + c.score, 0) / folderHistory.length)
    : 0;

  const chartData = [...folderHistory].reverse().map(h => ({
    date: new Date(h.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    score: h.score,
  }));

  const selectedRepo = repos.find(r => r._id === selectedFolder);
  const isGithubFolder = typeof selectedFolder === 'string' && selectedFolder.startsWith('github_');
  
  let panelTitle = '';
  if (selectedFolder === 'all') panelTitle = 'All Analyses';
  else if (selectedFolder === 'general') panelTitle = 'General / Unlinked';
  else if (isGithubFolder) panelTitle = selectedFolder.replace('github_', '');
  else panelTitle = selectedRepo?.name;

  // GitHub unique repos
  const githubRepoNames = [...new Set(githubReviews.map(r => r.repositoryName))];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 61px)', color: '#8b949e', gap: 12 }}>
        <div style={{ width: 20, height: 20, border: '2px solid #30363d', borderTopColor: '#58a6ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        Loading dashboard...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 61px)', overflow: 'hidden', fontFamily: 'Inter, sans-serif', background: '#0d1117', position: 'relative' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .sidebar-mobile { position: absolute !important; left: 0; top: 0; height: 100%; z-index: 100; transform: translateX(-100%); transition: transform 0.25s ease; }
          .sidebar-mobile.open { transform: translateX(0) !important; }
          .sidebar-overlay { display: block !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>

      {/* Mobile overlay */}
      <div
        className="sidebar-overlay"
        onClick={() => setSidebarOpen(false)}
        style={{ display: 'none', position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
      />

      {/* Hamburger button (mobile only) */}
      <button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(p => !p)}
        style={{ display: 'none', position: 'absolute', top: 10, left: 10, zIndex: 101, background: '#161b22', border: '1px solid #21262d', borderRadius: 6, padding: '6px 8px', color: '#e6edf3', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}
        title="Toggle sidebar"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────────── */}
      <div className={`sidebar-mobile ${sidebarOpen ? 'open' : ''}`} style={{
        width: 260, flexShrink: 0, borderRight: '1px solid #21262d', background: '#0d1117',
        display: 'flex', flexDirection: 'column', overflowY: 'auto'
      }}>
        {/* Sidebar header */}
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #21262d' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>EXPLORER</span>
            <button
              onClick={() => setShowNewRepo(p => !p)}
              title="New Project"
              style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: 2, lineHeight: 1, fontSize: 18, fontWeight: 300 }}
            >＋</button>
          </div>

          {/* New repo form */}
          {showNewRepo && (
            <form onSubmit={handleCreateRepo} style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input
                autoFocus
                value={newRepoName}
                onChange={e => setNewRepoName(e.target.value)}
                placeholder="Project name…"
                style={{ flex: 1, padding: '6px 8px', background: '#161b22', border: '1px solid #388bfd', color: '#e6edf3', borderRadius: 5, fontSize: '0.8rem', outline: 'none' }}
              />
              <button type="submit" disabled={isCreating || !newRepoName.trim()}
                style={{ padding: '6px 10px', background: '#238636', border: 'none', color: '#fff', borderRadius: 5, fontSize: '0.8rem', cursor: 'pointer' }}>
                Add
              </button>
            </form>
          )}

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#6e7681', fontSize: 13 }}>⌕</span>
            <input
              value={repoSearch}
              onChange={e => setRepoSearch(e.target.value)}
              placeholder="Search projects…"
              style={{ width: '100%', padding: '6px 8px 6px 24px', background: '#161b22', border: '1px solid #21262d', color: '#e6edf3', borderRadius: 5, fontSize: '0.8rem', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
        </div>

        {/* Tree items */}
        <div style={{ flex: 1, paddingTop: 6 }}>

          {/* All Analyses */}
          <SidebarFolder
            id="all"
            label="All Analyses"
            count={history.length}
            isSelected={selectedFolder === 'all'}
            isExpanded={!!expandedFolders['all']}
            onSelect={() => selectFolder('all')}
            onToggle={() => toggleFolder('all')}
            color="#58a6ff"
          />

          {/* General / Unlinked */}
          <SidebarFolder
            id="general"
            label="General / Unlinked"
            count={generalCount}
            isSelected={selectedFolder === 'general'}
            isExpanded={!!expandedFolders['general']}
            onSelect={() => selectFolder('general')}
            onToggle={() => toggleFolder('general')}
            color="#8b949e"
          />

          {/* Separator */}
          {filteredReposList.length > 0 && (
            <div style={{ padding: '8px 16px 4px', fontSize: '0.65rem', color: '#6e7681', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
              Projects
            </div>
          )}

          {filteredReposList.map(repo => {
            const repoHistory = history.filter(h => h.repositoryId === repo._id);
            const isRenaming = renamingId === repo._id;
            return (
              <SidebarFolder
                key={repo._id}
                id={repo._id}
                label={repo.name}
                count={repoHistory.length}
                isSelected={selectedFolder === repo._id}
                isExpanded={!!expandedFolders[repo._id]}
                onSelect={() => selectFolder(repo._id)}
                onToggle={() => toggleFolder(repo._id)}
                color="#e8c44a"
                analyses={repoHistory}
                selectedAnalysis={selectedAnalysis}
                onSelectAnalysis={setSelectedAnalysis}
                onDelete={() => handleDeleteRepo(repo._id)}
                onRename={() => handleStartRename(repo)}
                isRenaming={isRenaming}
                renameValue={renameValue}
                onRenameChange={setRenameValue}
                onRenameSubmit={() => handleRename(repo._id)}
                onRenameCancel={() => setRenamingId(null)}
              />
            );
          })}

          {filteredReposList.length === 0 && repoSearch && (
            <div style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#8b949e' }}>No projects found.</div>
          )}

          {/* GitHub Integrations Separator */}
          {githubRepoNames.length > 0 && (
            <div style={{ padding: '16px 16px 4px', fontSize: '0.65rem', color: '#6e7681', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
              GitHub Integrations
            </div>
          )}

          {githubRepoNames.map(repoName => {
            const prs = githubReviews.filter(r => r.repositoryName === repoName);
            const folderId = `github_${repoName}`;
            return (
              <SidebarFolder
                key={folderId}
                id={folderId}
                label={repoName.split('/')[1] || repoName}
                count={prs.length}
                isSelected={selectedFolder === folderId}
                isExpanded={!!expandedFolders[folderId]}
                onSelect={() => selectFolder(folderId)}
                onToggle={() => toggleFolder(folderId)}
                color="#2ea043"
                analyses={prs}
                selectedAnalysis={selectedAnalysis}
                onSelectAnalysis={setSelectedAnalysis}
                isGithub={true}
              />
            );
          })}
        </div>
      </div>

      {/* ── MAIN PANEL ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Tab bar */}
        <div style={{ height: 40, borderBottom: '1px solid #21262d', background: '#0d1117', display: 'flex', alignItems: 'center', paddingLeft: 16, gap: 2 }}>
          <div style={{
            padding: '0 16px', height: '100%', display: 'flex', alignItems: 'center', gap: 8,
            borderRight: '1px solid #21262d', borderBottom: '2px solid #58a6ff',
            background: '#161b22', fontSize: '0.82rem', color: '#e6edf3', cursor: 'default'
          }}>
            <FolderIcon open />
            <span>{panelTitle}</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {selectedAnalysis && !isGithubFolder ? (
              <AnalysisDetail item={selectedAnalysis} onBack={() => setSelectedAnalysis(null)} />
            ) : selectedAnalysis && isGithubFolder ? (
              <GithubReviewDetail item={selectedAnalysis} onBack={() => setSelectedAnalysis(null)} />
            ) : isGithubFolder ? (
              <GithubRepoView repoName={panelTitle} reviews={githubReviews.filter(r => r.repositoryName === selectedRepo?.name || r.repositoryName === panelTitle)} onSelect={setSelectedAnalysis} />
            ) : folderHistory.length === 0 ? (
              <EmptyState folder={selectedFolder} />
            ) : (
              <>
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                  <StatCard label="Analyses" value={folderHistory.length} color="#58a6ff" />
                  <StatCard label="Projects" value={repos.length} color="#3fb950" />
                  <StatCard label="Avg Score" value={avgScore ? `${avgScore}/100` : '—'}
                    color={avgScore >= 75 ? '#3fb950' : avgScore >= 50 ? '#d29922' : '#f85149'} />
                </div>

                {/* Chart */}
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

                {/* Analysis list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {folderHistory.map((item, i) => (
                    <AnalysisRow
                      key={item._id}
                      item={item}
                      index={i}
                      onSelect={() => setSelectedAnalysis(item)}
                      onDelete={() => handleDeleteAnalysis(item._id)}
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      style={{ padding: '9px 24px', background: '#161b22', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', fontSize: '0.85rem', cursor: loadingMore ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    >
                      {loadingMore ? <><div style={{ width: 14, height: 14, border: '2px solid #30363d', borderTopColor: '#58a6ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Loading…</> : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sidebar Folder Item ───────────────────────────────────────────────────────
const SidebarFolder = ({ id, label, count, isSelected, isExpanded, onSelect, onToggle, color, analyses = [], selectedAnalysis, onSelectAnalysis, isGithub, onDelete, onRename, isRenaming, renameValue, onRenameChange, onRenameSubmit, onRenameCancel }) => {
  const isEditable = onDelete || onRename;
  const hasAnalyses = analyses.length > 0;
  const [hovered, setHovered] = React.useState(false);

  return (
    <div>
      {isRenaming ? (
        // Inline rename input
        <form onSubmit={e => { e.preventDefault(); onRenameSubmit(); }} style={{ display: 'flex', gap: 4, margin: '1px 4px', padding: '3px 8px' }}>
          <input
            autoFocus
            value={renameValue}
            onChange={e => onRenameChange(e.target.value)}
            style={{ flex: 1, padding: '4px 8px', background: '#161b22', border: '1px solid #388bfd', color: '#e6edf3', borderRadius: 4, fontSize: '0.8rem', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '4px 8px', background: '#238636', border: 'none', color: '#fff', borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer' }}>✓</button>
          <button type="button" onClick={onRenameCancel} style={{ padding: '4px 8px', background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer' }}>✕</button>
        </form>
      ) : (
        <div
          onClick={onSelect}
          onMouseEnter={() => { setHovered(true); }}
          onMouseLeave={() => { setHovered(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 6px 5px 14px',
            cursor: 'pointer', borderRadius: 4, margin: '1px 4px',
            background: isSelected ? 'rgba(88,166,255,0.12)' : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
            color: isSelected ? '#e6edf3' : '#c9d1d9',
          }}
        >
          {/* Chevron */}
          <span
            onClick={e => { e.stopPropagation(); onToggle(); }}
            style={{ color: '#6e7681', fontSize: 10, width: 14, textAlign: 'center', flexShrink: 0, userSelect: 'none' }}
          >
            {hasAnalyses || ['all', 'general'].includes(id) ? (isExpanded ? '▾' : '▸') : ' '}
          </span>
          <FolderIcon open={isExpanded && isSelected} />
          <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: isSelected ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label}
          </span>

          {/* Hover action icons for project folders */}
          {isEditable && hovered ? (
            <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
              {onRename && (
                <button onClick={onRename} title="Rename" style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: '2px 4px', borderRadius: 3, lineHeight: 1 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e6edf3'}
                  onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              )}
              {onDelete && (
                <button onClick={onDelete} title="Delete" style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: '2px 4px', borderRadius: 3, lineHeight: 1 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f85149'}
                  onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              )}
            </div>
          ) : (
            <span style={{ fontSize: '0.68rem', color: '#6e7681', background: '#21262d', padding: '1px 6px', borderRadius: 10, flexShrink: 0 }}>
              {count}
            </span>
          )}
        </div>
      )}

      {/* Child analyses (only for project folders) */}
      {isExpanded && hasAnalyses && (
        <div>
          {analyses.map((a, i) => {
            const ext = langExt[a.language] || 'txt';
            const isSelAna = selectedAnalysis?._id === a._id;
            return (
              <div
                key={a._id}
                onClick={() => onSelectAnalysis && onSelectAnalysis(a)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px 4px 42px',
                  cursor: 'pointer', borderRadius: 4, margin: '1px 4px',
                  background: isSelAna ? 'rgba(88,166,255,0.12)' : 'transparent',
                  color: isSelAna ? '#58a6ff' : '#8b949e',
                  fontSize: '0.78rem',
                }}
                onMouseEnter={e => { if (!isSelAna) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#c9d1d9'; }}
                onMouseLeave={e => { if (!isSelAna) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isSelAna ? '#58a6ff' : '#8b949e'; }}
              >
                {isGithub ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="18" cy="18" r="3"></circle>
                    <circle cx="6" cy="6" r="3"></circle>
                    <path d="M13 6h3a2 2 0 0 1 2 2v7"></path>
                    <line x1="6" y1="9" x2="6" y2="21"></line>
                  </svg>
                ) : (
                  <FileIcon lang={a.language} />
                )}
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isGithub ? `PR #${a.pullRequestNumber}` : `review_${i + 1}.${ext}`}
                </span>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700,
                  color: a.score >= 75 ? '#3fb950' : a.score >= 50 ? '#d29922' : '#f85149'
                }}>{a.score}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color }) => (
  <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '16px 20px' }}>
    <div style={{ fontSize: '0.75rem', color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: '1.9rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
  </div>
);

// ─── Analysis Row ──────────────────────────────────────────────────────────────
const AnalysisRow = ({ item, index, onSelect, onDelete }) => {
  const ext = langExt[item.language] || 'txt';
  const scoreColor = item.score >= 75 ? '#3fb950' : item.score >= 50 ? '#d29922' : '#f85149';
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#161b22', border: '1px solid #21262d', borderRadius: 8,
        padding: '14px 18px', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
        display: 'flex', alignItems: 'center', gap: 14,
        borderColor: hovered ? '#388bfd' : '#21262d',
        backgroundColor: hovered ? '#1c2128' : '#161b22',
      }}
    >
      <FileIcon lang={item.language} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>
          review_{index + 1}.{ext}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
          {new Date(item.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          &nbsp;·&nbsp;{item.issues?.length || 0} issues
        </div>
      </div>
      <ScoreBadge score={item.score} />
      {hovered && onDelete ? (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          title="Delete analysis"
          style={{ background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', padding: '4px', borderRadius: 4, lineHeight: 1, flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#f85149'}
          onMouseLeave={e => e.currentTarget.style.color = '#6e7681'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6e7681" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </div>
  );
};

// ─── Highlighted Code Viewer ──────────────────────────────────────────────────
const HighlightedCode = ({ code, issues, language }) => {
  if (!code) return <div style={{ padding: 20, color: '#8b949e', fontSize: '0.85rem' }}>No code stored for this analysis.</div>;

  const sevOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  const lines = code.split('\n');

  // ── Smart line finder ──────────────────────────────────────────────────────
  // The AI sometimes points to a blank/comment line. If so, look ±3 lines for
  // the first non-blank, non-pure-comment line and use that instead.
  const findBestLine = (reportedLine) => {
    const idx = reportedLine - 1; // 0-based
    const isSubstantive = (i) => {
      if (i < 0 || i >= lines.length) return false;
      const t = lines[i].trim();
      return t.length > 0 && !t.startsWith('//') && !t.startsWith('#') && t !== '*' && t !== '*/';
    };
    if (isSubstantive(idx)) return reportedLine;
    // Search outward ±3
    for (let d = 1; d <= 3; d++) {
      if (isSubstantive(idx + d)) return reportedLine + d;
      if (isSubstantive(idx - d)) return reportedLine - d;
    }
    return reportedLine; // fall back to original even if blank
  };

  // Build lineMap: lineNum → worst-severity issue
  const lineMap = {};
  (issues || []).forEach(issue => {
    if (!issue.line) return;
    const best = findBestLine(issue.line);
    const existing = lineMap[best];
    if (!existing || sevOrder[issue.severity] < sevOrder[existing.severity]) {
      lineMap[best] = { ...issue, adjustedLine: best };
    }
  });

  const sevStyle = (sev) => {
    if (sev === 'critical') return { bg: 'rgba(248,81,73,0.14)', gutter: '#f85149', badge: 'rgba(248,81,73,0.25)' };
    if (sev === 'high')     return { bg: 'rgba(255,123,114,0.10)', gutter: '#ff7b72', badge: 'rgba(255,123,114,0.22)' };
    if (sev === 'medium')   return { bg: 'rgba(210,153,34,0.12)', gutter: '#d29922', badge: 'rgba(210,153,34,0.22)' };
    return                         { bg: 'rgba(63,185,80,0.10)',  gutter: '#3fb950', badge: 'rgba(63,185,80,0.2)' };
  };

  const ext = langExt[language] || 'txt';

  return (
    <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, overflow: 'hidden', fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>
      {/* Toolbar */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', gap: 10, background: '#161b22' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ff5f57','#febc2e','#28c840'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </div>
        <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>review.{ext}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, fontSize: '0.7rem' }}>
          {[['critical','#f85149'],['high','#ff7b72'],['medium','#d29922'],['low / info','#3fb950']].map(([lbl, clr]) => (
            <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, background: clr, borderRadius: 2, display: 'inline-block' }} />
              <span style={{ color: '#8b949e' }}>{lbl}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Code table */}
      <div style={{ overflowX: 'auto', maxHeight: 520, overflowY: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.78rem', lineHeight: '1.65' }}>
          <tbody>
            {lines.map((line, idx) => {
              const ln = idx + 1;
              const issue = lineMap[ln];
              const s = issue ? sevStyle(issue.severity) : null;

              return (
                <tr
                  key={ln}
                  style={{
                    background: s ? s.bg : 'transparent',
                    borderLeft: s ? `3px solid ${s.gutter}` : '3px solid transparent',
                  }}
                >
                  {/* Line number */}
                  <td style={{
                    padding: '0 12px', color: s ? s.gutter : '#4d5566',
                    textAlign: 'right', userSelect: 'none', minWidth: 44,
                    borderRight: '1px solid #21262d', fontWeight: s ? 700 : 400,
                    fontSize: '0.72rem'
                  }}>
                    {ln}
                  </td>

                  {/* Code content */}
                  <td style={{ padding: '0 16px', whiteSpace: 'pre', color: '#e6edf3', width: '100%' }}>
                    {line || ' '}
                  </td>

                  {/* Inline issue badge */}
                  {issue ? (
                    <td style={{ padding: '0 14px 0 6px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: '0.65rem', fontWeight: 700,
                        padding: '2px 8px', borderRadius: 4,
                        background: s.badge, color: s.gutter,
                        border: `1px solid ${s.gutter}40`,
                        textTransform: 'uppercase', letterSpacing: '0.04em'
                      }}>
                        {issue.severity} · {issue.title?.slice(0, 30)}{issue.title?.length > 30 ? '…' : ''}
                      </span>
                    </td>
                  ) : <td />}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Analysis Detail (inline) ──────────────────────────────────────────────────
const AnalysisDetail = ({ item, onBack }) => {
  const [showCode, setShowCode] = useState(false);
  if (!item) return null;
  const ext = langExt[item.language] || 'txt';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FileIcon lang={item.language} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#e6edf3' }}>
              {item.language?.charAt(0).toUpperCase() + item.language?.slice(1)} Review
            </h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#8b949e' }}>
              {new Date(item.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Show Code toggle */}
          <button
            onClick={() => setShowCode(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              background: showCode ? 'rgba(88,166,255,0.15)' : '#21262d',
              border: `1px solid ${showCode ? '#388bfd' : '#30363d'}`,
              color: showCode ? '#58a6ff' : '#c9d1d9', transition: 'all 0.2s'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
            {showCode ? 'Hide Code' : 'Show Code'}
          </button>
          <ScoreBadge score={item.score} />
        </div>
      </div>

      {/* Highlighted Code Viewer */}
      {showCode && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Source Code — highlighted issues
          </div>
          <HighlightedCode code={item.originalCode || item.code} issues={item.issues} language={item.language} />
        </div>
      )}

      {/* Issues */}
      {item.issues?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Issues Detected ({item.issues.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {item.issues.map((issue, i) => {
              const sev = issue.severity?.toLowerCase();
              const sevColor = sev === 'critical' ? '#f85149' : sev === 'high' ? '#ff7b72' : sev === 'medium' ? '#d29922' : '#3fb950';
              return (
                <div key={i} style={{ background: '#161b22', border: `1px solid ${sevColor}30`, borderLeft: `3px solid ${sevColor}`, borderRadius: 8, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: sevColor, background: `${sevColor}20`, padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {issue.severity || 'info'}
                    </span>
                    {issue.line && (
                      <span style={{ fontSize: '0.68rem', color: '#8b949e', background: '#21262d', padding: '2px 7px', borderRadius: 4 }}>Line {issue.line}</span>
                    )}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e6edf3' }}>{issue.title || issue.type}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#8b949e', lineHeight: 1.6 }}>{issue.description || issue.message}</p>
                  {issue.suggestion && (
                    <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 6 }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#3fb950', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>💡 Suggestion</div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#c9d1d9', lineHeight: 1.6 }}>{issue.suggestion}</p>
                    </div>
                  )}
                  {issue.refactoredCode && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#58a6ff', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>⚡ Refactored Code</div>
                      <pre style={{ margin: 0, padding: '10px 12px', background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, fontSize: '0.78rem', color: '#e6edf3', overflowX: 'auto', fontFamily: "'JetBrains Mono','Fira Code',monospace", lineHeight: 1.6 }}>
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

      {/* Summary */}
      {item.summary && (
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, padding: '16px 18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Summary</div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#c9d1d9', lineHeight: 1.7 }}>{item.summary}</p>
        </div>
      )}
    </div>
  );
};

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ folder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#8b949e', textAlign: 'center' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>No analyses yet</div>
    <div style={{ fontSize: '0.85rem', maxWidth: 300, lineHeight: 1.6 }}>
      {folder === 'general'
        ? 'Run an analysis without linking it to a project to see it here.'
        : 'Run an analysis and link it to this project to see it here.'}
    </div>
  </div>
);

export default Dashboard;
