import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { logout as logoutService } from '../../services/authService';
import { getGithubStatus, getGithubInstallUrl, saveGithubInstallation } from '../../services/githubService';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [githubConnected, setGithubConnected] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (isAuthenticated) {
      // 1. Check if we just returned from a GitHub installation redirect
      const queryParams = new URLSearchParams(window.location.search);
      const installationId = queryParams.get('installation_id');

      if (installationId) {
        // Save it using our authenticated token
        saveGithubInstallation(installationId)
          .then(() => {
            setGithubConnected(true);
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
          })
          .catch(err => console.error('Failed to save github install:', err));
      } else {
        // 2. Normal check
        getGithubStatus()
          .then(res => setGithubConnected(res.data?.connected || false))
          .catch(() => {});
      }
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logoutService();
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      height: '61px',
      background: '#161b22',
      borderBottom: '1px solid #30363d',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand */}
      <Link to="/" style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        textDecoration: 'none',
      }}>
        <div style={{
          width: 28, height: 28,
          background: 'linear-gradient(135deg, #58a6ff, #1f6feb)',
          borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.9rem',
        }}>🔍</div>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e6edf3' }}>SyntaxGuard</span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {[
          { to: '/', label: 'Review' },
          { to: '/dashboard', label: 'Dashboard' },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: isActive(to) ? 600 : 400,
              color: isActive(to) ? '#e6edf3' : '#8b949e',
              background: isActive(to) ? '#21262d' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </Link>
        ))}

        <div style={{ width: '1px', height: '20px', background: '#30363d', margin: '0 8px' }} />

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* GitHub Connect Button */}
            {githubConnected ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: '6px',
                border: '1px solid rgba(63,185,80,0.4)',
                background: 'rgba(63,185,80,0.08)',
                fontSize: '0.8rem', color: '#3fb950', fontWeight: 500,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3fb950', display: 'inline-block' }} />
                GitHub Connected
              </div>
            ) : (
              <a
                href={getGithubInstallUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: '6px',
                  border: '1px solid #30363d',
                  background: '#21262d',
                  fontSize: '0.8rem', color: '#8b949e',
                  textDecoration: 'none', fontWeight: 500,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#58a6ff'; e.currentTarget.style.color = '#58a6ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.color = '#8b949e'; }}
              >
                {/* GitHub SVG icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
                </svg>
                Connect GitHub
              </a>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: '#2ea043', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 600,
              }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span style={{ color: '#e6edf3', fontSize: '0.85rem', fontWeight: 500 }}>
                {user?.name?.split(' ')[0]}
              </span>
            </div>
            
            <Link
              to="/settings"
              style={{
                padding: '4px 10px', borderRadius: '6px', border: '1px solid #30363d',
                background: 'transparent', color: '#8b949e', fontSize: '0.75rem',
                cursor: 'pointer', transition: 'all 0.15s', textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e6edf3'; e.currentTarget.style.borderColor = '#8b949e'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#8b949e'; e.currentTarget.style.borderColor = '#30363d'; }}
            >
              Settings
            </Link>

            <button
              onClick={handleLogout}
              style={{
                padding: '4px 10px', borderRadius: '6px', border: '1px solid #30363d',
                background: 'transparent', color: '#8b949e', fontSize: '0.75rem',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.target.style.color = '#e6edf3'; e.target.style.borderColor = '#8b949e'; }}
              onMouseLeave={e => { e.target.style.color = '#8b949e'; e.target.style.borderColor = '#30363d'; }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link to="/login" style={{
            padding: '6px 14px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.85rem',
            color: '#8b949e',
            background: 'transparent',
            border: '1px solid #30363d',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.target.style.color = '#e6edf3'; e.target.style.borderColor = '#58a6ff'; }}
            onMouseLeave={e => { e.target.style.color = '#8b949e'; e.target.style.borderColor = '#30363d'; }}
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
