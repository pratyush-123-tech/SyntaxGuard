import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import { loginSuccess, setAuthLoading, setAuthError } from '../store/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector(state => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setAuthLoading(true));
    try {
      const data = await login(email, password);
      dispatch(loginSuccess(data));
      navigate('/'); // Redirect to Code Review page as requested
    } catch (err) {
      dispatch(setAuthError(err.response?.data?.error || 'Failed to login'));
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 61px)', background: '#0d1117'
    }}>
      <div style={{
        background: '#161b22', padding: '40px', borderRadius: '12px',
        border: '1px solid #30363d', width: '100%', maxWidth: '400px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: 48, height: 48, background: 'linear-gradient(135deg, #58a6ff, #1f6feb)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', margin: '0 auto 16px'
          }}>🔍</div>
          <h2 style={{ margin: 0, color: '#e6edf3', fontSize: '1.4rem' }}>Welcome Back</h2>
          <p style={{ margin: '8px 0 0', color: '#8b949e', fontSize: '0.9rem' }}>
            Sign in to track your code health
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 12px', background: 'rgba(255,76,76,0.1)',
            border: '1px solid rgba(255,76,76,0.3)', color: '#ff4c4c',
            borderRadius: '6px', fontSize: '0.85rem', marginBottom: '20px',
            textAlign: 'center'
          }}>
            {typeof error === 'string' ? error : error.message || JSON.stringify(error)}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#e6edf3', fontSize: '0.85rem', marginBottom: '6px' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px 12px', background: '#0d1117',
                border: '1px solid #30363d', color: '#e6edf3', borderRadius: '6px',
                fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#58a6ff'}
              onBlur={e => e.target.style.borderColor = '#30363d'}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#e6edf3', fontSize: '0.85rem', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px 12px', background: '#0d1117',
                border: '1px solid #30363d', color: '#e6edf3', borderRadius: '6px',
                fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#58a6ff'}
              onBlur={e => e.target.style.borderColor = '#30363d'}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: isLoading ? '#21262d' : 'linear-gradient(135deg, #58a6ff, #1f6feb)',
              border: 'none', color: isLoading ? '#8b949e' : '#ffffff',
              padding: '12px', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => { if (!isLoading) e.target.style.opacity = 0.9; }}
            onMouseLeave={e => { if (!isLoading) e.target.style.opacity = 1; }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: '#8b949e' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#58a6ff', textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
