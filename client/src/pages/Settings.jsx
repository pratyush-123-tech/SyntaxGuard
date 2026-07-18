import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile, changePassword, deleteAccount } from '../services/userService';

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password change form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null); // { type: 'success'|'error', text }

  // Delete account form
  const [deletePw, setDeletePw] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState(null);

  useEffect(() => {
    getProfile()
      .then(res => setUser(res.data.data))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      setPwMsg({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update password.' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteMsg(null);
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePw);
      localStorage.clear();
      navigate('/login');
    } catch (err) {
      setDeleteMsg({ type: 'error', text: err.response?.data?.error || 'Failed to delete account.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #21262d', borderTopColor: '#58a6ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#e6edf3' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Navbar */}
      <nav style={{ height: 56, borderBottom: '1px solid #21262d', background: '#0d1117', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#e6edf3' }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#58a6ff,#388bfd)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M9 11H3v10h6V11zm12-4H15v14h6V7zm-6-4H9v18h6V3z"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>SyntaxGuard</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link to="/dashboard" style={{ fontSize: '0.85rem', color: '#8b949e', textDecoration: 'none' }}>← Back to Dashboard</Link>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: '48px auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Settings</h1>
        <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: 40 }}>Manage your account preferences and security.</p>

        {/* Profile Card */}
        <Section title="Profile">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#58a6ff,#388bfd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 4 }}>{user?.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#8b949e' }}>{user?.email}</div>
              <div style={{ fontSize: '0.75rem', color: '#6e7681', marginTop: 4 }}>
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—'}
              </div>
            </div>
          </div>
        </Section>

        {/* Change Password */}
        <Section title="Change Password">
          <form onSubmit={handlePasswordChange}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <InputField label="Current Password" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Enter current password" required />
              <InputField label="New Password" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 6 characters" required />
              <InputField label="Confirm New Password" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" required />
            </div>

            {pwMsg && (
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 6, fontSize: '0.85rem', background: pwMsg.type === 'success' ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', border: `1px solid ${pwMsg.type === 'success' ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`, color: pwMsg.type === 'success' ? '#3fb950' : '#f85149' }}>
                {pwMsg.text}
              </div>
            )}

            <button type="submit" disabled={pwLoading} style={{ marginTop: 16, padding: '10px 20px', background: '#238636', border: '1px solid rgba(240,246,252,0.1)', borderRadius: 6, color: '#fff', fontWeight: 600, fontSize: '0.88rem', cursor: pwLoading ? 'not-allowed' : 'pointer', opacity: pwLoading ? 0.7 : 1 }}>
              {pwLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </Section>

        {/* Danger Zone */}
        <Section title="Danger Zone" danger>
          <p style={{ fontSize: '0.88rem', color: '#8b949e', marginBottom: 16, lineHeight: 1.6 }}>
            Permanently delete your account and all associated data — projects, analyses, and sessions. <strong style={{ color: '#f85149' }}>This action cannot be undone.</strong>
          </p>

          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)} style={{ padding: '9px 18px', background: 'transparent', border: '1px solid #f85149', borderRadius: 6, color: '#f85149', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
              Delete My Account
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.25)', borderRadius: 8, padding: 16 }}>
              <p style={{ fontSize: '0.85rem', color: '#f85149', marginBottom: 14, fontWeight: 600 }}>⚠ Please enter your password to confirm account deletion:</p>
              <InputField label="Password" type="password" value={deletePw} onChange={e => setDeletePw(e.target.value)} placeholder="Your current password" required />

              {deleteMsg && (
                <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, fontSize: '0.83rem', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', color: '#f85149' }}>
                  {deleteMsg.text}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button type="button" onClick={() => { setDeleteConfirm(false); setDeletePw(''); setDeleteMsg(null); }} style={{ padding: '8px 16px', background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={deleteLoading} style={{ padding: '8px 16px', background: '#da3633', border: '1px solid #f85149', borderRadius: 6, color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: deleteLoading ? 'not-allowed' : 'pointer', opacity: deleteLoading ? 0.7 : 1 }}>
                  {deleteLoading ? 'Deleting…' : 'Yes, Delete My Account'}
                </button>
              </div>
            </form>
          )}
        </Section>
      </div>
    </div>
  );
};

// ─── Reusable sub-components ──────────────────────────────────────────────────
const Section = ({ title, children, danger }) => (
  <div style={{ marginBottom: 28, background: '#161b22', border: `1px solid ${danger ? 'rgba(248,81,73,0.4)' : '#21262d'}`, borderRadius: 10, overflow: 'hidden' }}>
    <div style={{ padding: '14px 20px', borderBottom: `1px solid ${danger ? 'rgba(248,81,73,0.2)' : '#21262d'}`, background: danger ? 'rgba(248,81,73,0.05)' : 'transparent' }}>
      <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: danger ? '#f85149' : '#e6edf3' }}>{title}</h2>
    </div>
    <div style={{ padding: 20 }}>{children}</div>
  </div>
);

const InputField = ({ label, type, value, onChange, placeholder, required }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      style={{ width: '100%', padding: '9px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
      onFocus={e => e.target.style.borderColor = '#58a6ff'}
      onBlur={e => e.target.style.borderColor = '#30363d'}
    />
  </div>
);

export default Settings;
