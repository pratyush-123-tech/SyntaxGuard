import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// ─── Animated typing effect ───────────────────────────────────────────────────
const DEMO_CODE_LINES = [
  { text: 'const stripe_key = "sk-live-9xKpQ...";', type: 'critical' },
  { text: 'function getUser(id) {', type: 'normal' },
  { text: '  const q = "SELECT * FROM users WHERE id=" + id;', type: 'critical' },
  { text: '  return db.query(q);', type: 'high' },
  { text: '}', type: 'normal' },
  { text: '', type: 'normal' },
  { text: 'async function processAll(items) {', type: 'normal' },
  { text: '  for (let i=0; i<items.length; i++) {', type: 'medium' },
  { text: '    for (let j=0; j<items.length; j++) {', type: 'medium' },
  { text: '      await save(items[i] + items[j]);', type: 'normal' },
  { text: '    }', type: 'normal' },
  { text: '  }', type: 'normal' },
  { text: '}', type: 'normal' },
];

const DEMO_ISSUES = [
  { sev: 'CRITICAL', color: '#f85149', bg: 'rgba(248,81,73,0.1)', title: 'Hardcoded Secret Key', desc: 'Stripe API key exposed in source code. Use environment variables immediately.', fix: 'const stripe_key = process.env.STRIPE_SECRET_KEY;' },
  { sev: 'CRITICAL', color: '#f85149', bg: 'rgba(248,81,73,0.1)', title: 'SQL Injection Vulnerability', desc: 'User input is directly concatenated into SQL query — attackers can dump your database.', fix: 'db.query("SELECT * FROM users WHERE id = ?", [id])' },
  { sev: 'HIGH', color: '#ff7b72', bg: 'rgba(255,123,114,0.08)', title: 'Missing Error Handling', desc: 'Async function has no try/catch block. Unhandled promise rejections crash your server.' },
  { sev: 'MEDIUM', color: '#d29922', bg: 'rgba(210,153,34,0.1)', title: 'O(n²) Complexity', desc: 'Nested loop over same array creates quadratic time complexity. Use a Map instead.' },
];

const FEATURES = [
  { icon: '🔐', title: 'Security Scanning', desc: 'Detects SQL injection, XSS, exposed secrets, insecure dependencies, and 50+ vulnerability patterns in seconds.' },
  { icon: '⚡', title: 'Instant Results', desc: 'Powered by Groq LLaMA 3.3 70B — the world\'s fastest AI inference. Get detailed reviews in under 3 seconds.' },
  { icon: '🐙', title: 'GitHub Integration', desc: 'Install once, protect forever. Automatically reviews every Pull Request and posts inline comments directly on GitHub.' },
  { icon: '📊', title: 'Quality Dashboard', desc: 'Track your code health over time with scores, charts, and analytics across all your projects.' },
  { icon: '💡', title: 'Auto-Fix Suggestions', desc: 'Don\'t just see what\'s wrong — get exact, copy-paste ready code fixes for every single issue found.' },
  { icon: '🗃️', title: 'Smart Caching', desc: 'Redis-powered caching means identical code is never analyzed twice, keeping costs low and speed high.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Paste your code', desc: 'Drop any code snippet into the editor, or connect your GitHub repository to automate everything.' },
  { step: '02', title: 'AI analyzes it', desc: 'Our LLaMA-powered engine scans for bugs, security flaws, performance issues, and bad patterns.' },
  { step: '03', title: 'Get actionable fixes', desc: 'Receive severity-tagged issues with exact line numbers, explanations, and copy-paste code fixes.' },
];

// ─── Main Landing Page ─────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const [visibleIssue, setVisibleIssue] = useState(0);
  const [score, setScore] = useState(0);
  const [codeLineIndex, setCodeLineIndex] = useState(0);
  const [demoRunning, setDemoRunning] = useState(false);
  const demoRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    // Hero entrance animation
    setTimeout(() => setHeroVisible(true), 100);
  }, []);

  // Rotating issue cards
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIssue(p => (p + 1) % DEMO_ISSUES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Score counter animation
  useEffect(() => {
    let n = 0;
    const target = 42;
    const interval = setInterval(() => {
      n += 2;
      if (n >= target) { setScore(target); clearInterval(interval); }
      else setScore(n);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Auto-run demo animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCodeLineIndex(p => (p + 1) % DEMO_CODE_LINES.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div style={{ background: '#0d1117', color: '#e6edf3', fontFamily: "'Inter', 'Segoe UI', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 20px rgba(88,166,255,0.3); } 50% { box-shadow: 0 0 40px rgba(88,166,255,0.6); } }
        @keyframes slide-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes scan-line { 0% { top: 0%; } 100% { top: 100%; } }
        .hero-btn { transition: all 0.2s ease !important; }
        .hero-btn:hover { transform: translateY(-2px) !important; }
        .feature-card { transition: all 0.25s ease !important; }
        .feature-card:hover { transform: translateY(-6px) !important; border-color: #388bfd !important; }
        .nav-link { transition: color 0.15s; }
        .nav-link:hover { color: #e6edf3 !important; }
        ::selection { background: rgba(88,166,255,0.3); }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(33,38,45,0.8)', background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(12px)', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #58a6ff, #388bfd)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M9 11H3v10h6V11zm12-4H15v14h6V7zm-6-4H9v18h6V3z"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>SyntaxGuard</span>
          <span style={{ fontSize: '0.65rem', background: 'rgba(88,166,255,0.15)', color: '#58a6ff', border: '1px solid rgba(88,166,255,0.3)', borderRadius: 4, padding: '2px 7px', fontWeight: 700, letterSpacing: '0.04em' }}>BETA</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <button onClick={scrollToDemo} className="nav-link" style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Live Demo</button>
          <a href="#features" className="nav-link" style={{ color: '#8b949e', fontSize: '0.88rem', textDecoration: 'none' }}>Features</a>
          <a href="#how-it-works" className="nav-link" style={{ color: '#8b949e', fontSize: '0.88rem', textDecoration: 'none' }}>How it works</a>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isAuthenticated ? (
            <Link to="/" style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #58a6ff, #388bfd)', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
              Open Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ color: '#8b949e', fontSize: '0.88rem', textDecoration: 'none' }}>Sign in</Link>
              <Link to="/register" style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #58a6ff, #388bfd)', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', animation: 'pulse-glow 3s ease-in-out infinite' }}>
                Get started free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 40px 80px', textAlign: 'center', opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 32, fontSize: '0.82rem', color: '#58a6ff' }}>
          <span style={{ width: 6, height: 6, background: '#3fb950', borderRadius: '50%', animation: 'blink 2s ease-in-out infinite' }} />
          Powered by Groq LLaMA 3.3 70B — Results in &lt;3 seconds
        </div>

        {/* Headline */}
        <h1 style={{ margin: '0 0 24px', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #ffffff 0%, #a0b3c8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Your AI syntax guard<br />
          that never sleeps.
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#8b949e', maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.7, fontWeight: 400 }}>
          Paste any code and get a full security audit, bug report, and auto-fix suggestions in seconds. Connects to GitHub to review Pull Requests automatically.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <Link to={isAuthenticated ? '/' : '/register'} className="hero-btn" style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #58a6ff, #388bfd)', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 4px 24px rgba(88,166,255,0.4)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Start reviewing for free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
          <button onClick={scrollToDemo} className="hero-btn" style={{ padding: '14px 32px', background: 'transparent', border: '1px solid #30363d', borderRadius: 10, color: '#e6edf3', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Watch demo
          </button>
        </div>

        {/* Hero stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[['< 3s', 'Analysis time'], ['50+', 'Vulnerability patterns'], ['100%', 'Free to start']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #58a6ff, #3fb950)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
              <div style={{ fontSize: '0.8rem', color: '#6e7681', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE DEMO ───────────────────────────────────────────────────────── */}
      <section ref={demoRef} style={{ maxWidth: 1200, margin: '0 auto 120px', padding: '0 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#58a6ff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Live Preview</div>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>See it in action</h2>
        </div>

        {/* Demo window */}
        <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(88,166,255,0.05)', position: 'relative' }}>
          {/* Window chrome */}
          <div style={{ height: 44, background: '#161b22', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f85149' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#d29922' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3fb950' }} />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: '#0d1117', borderRadius: 6, padding: '3px 16px', fontSize: '0.75rem', color: '#6e7681', border: '1px solid #21262d' }}>
                ai-code-reviewer.app
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#3fb950' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3fb950', animation: 'blink 2s ease-in-out infinite' }} />
              AI Analyzing…
            </div>
          </div>

          {/* Split layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 420 }}>
            {/* Code panel */}
            <div style={{ borderRight: '1px solid #21262d', padding: '0' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #21262d', background: '#161b22', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6e7681" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>vulnerable_code.js</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', background: 'rgba(248,81,73,0.15)', color: '#f85149', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 4, padding: '2px 8px', fontWeight: 700 }}>4 issues</span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.82rem', lineHeight: 1.8, padding: '16px 0', position: 'relative', overflow: 'hidden' }}>
                {/* Animated scan line */}
                <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(88,166,255,0.4), transparent)', animation: 'scan-line 3s linear infinite', zIndex: 1 }} />
                {DEMO_CODE_LINES.map((line, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', paddingLeft: 16, paddingRight: 16, background: i === codeLineIndex ? 'rgba(88,166,255,0.04)' : line.type === 'critical' ? 'rgba(248,81,73,0.06)' : line.type === 'high' ? 'rgba(255,123,114,0.04)' : line.type === 'medium' ? 'rgba(210,153,34,0.04)' : 'transparent', transition: 'background 0.3s' }}>
                    <span style={{ width: 28, color: '#3d444d', fontSize: '0.72rem', flexShrink: 0, userSelect: 'none' }}>{i + 1}</span>
                    {line.type !== 'normal' && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: line.type === 'critical' ? '#f85149' : line.type === 'high' ? '#ff7b72' : '#d29922', flexShrink: 0, marginRight: 8 }} />
                    )}
                    <span style={{ color: line.type === 'critical' ? '#ffa198' : line.type === 'high' ? '#ff7b72' : line.type === 'medium' ? '#e3b341' : '#c9d1d9' }}>{line.text || '\u00a0'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Results panel */}
            <div style={{ padding: 20, background: '#0d1117', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Score */}
              <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Health Score</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f85149' }}>{score}<span style={{ fontSize: '1rem', color: '#6e7681' }}>/100</span></div>
                </div>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'conic-gradient(#f85149 ' + (score * 3.6) + 'deg, #21262d 0deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(248,81,73,0.3)' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#161b22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#f85149' }}>
                    {score}
                  </div>
                </div>
              </div>

              {/* Issue cards with rotation */}
              {DEMO_ISSUES.map((issue, i) => (
                <div key={i} style={{ background: '#161b22', border: `1px solid ${issue.color}30`, borderLeft: `3px solid ${issue.color}`, borderRadius: 8, padding: '12px 14px', transition: 'all 0.4s ease', opacity: i === visibleIssue ? 1 : 0.35, transform: i === visibleIssue ? 'scale(1.01)' : 'scale(0.98)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: issue.color, background: issue.bg, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.06em' }}>{issue.sev}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e6edf3' }}>{issue.title}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#8b949e', lineHeight: 1.5 }}>{issue.desc}</p>
                  {issue.fix && i === visibleIssue && (
                    <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#3fb950', animation: 'slide-in 0.3s ease' }}>
                      ✓ {issue.fix}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Try it CTA bar */}
          <div style={{ borderTop: '1px solid #21262d', background: 'linear-gradient(90deg, rgba(88,166,255,0.05), rgba(63,185,80,0.05))', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>Ready to review your own code?</div>
              <div style={{ fontSize: '0.82rem', color: '#8b949e' }}>Paste any snippet and get results in &lt;3 seconds — no account needed.</div>
            </div>
            <Link to={isAuthenticated ? '/' : '/register'} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #58a6ff, #388bfd)', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(88,166,255,0.35)' }}>
              Try it free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto 120px', padding: '0 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#58a6ff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Features</div>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>Everything you need to ship<br />safer code, faster</h2>
          <p style={{ margin: 0, color: '#8b949e', fontSize: '1rem', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>Not just a linter. A full AI engineering partner that spots what static analysis misses.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: '28px 24px', cursor: 'default' }}>
              <div style={{ fontSize: '2rem', marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700 }}>{f.title}</h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#8b949e', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ maxWidth: 1200, margin: '0 auto 120px', padding: '0 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#58a6ff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>How it works</div>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>Up and running in 30 seconds</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 0, position: 'relative' }}>
          {/* Connecting line */}
          <div style={{ position: 'absolute', top: 28, left: '16.6%', right: '16.6%', height: 1, background: 'linear-gradient(90deg, #21262d, #388bfd, #21262d)', display: 'none' }} />

          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 32px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #1c2e4a, #162032)', border: '1px solid #388bfd40', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '0.9rem', fontWeight: 800, color: '#58a6ff', position: 'relative' }}>
                {step.step}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)', width: 40, height: 1, background: 'rgba(56,139,253,0.3)', marginLeft: 8 }} />
                )}
              </div>
              <h3 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700 }}>{step.title}</h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#8b949e', lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── GITHUB INTEGRATION HIGHLIGHT ────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto 120px', padding: '0 40px' }}>
        <div style={{ background: 'linear-gradient(135deg, #0d1117, #161b22)', border: '1px solid #21262d', borderRadius: 20, padding: '60px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* BG decoration */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,139,253,0.08) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(63,185,80,0.06) 0%, transparent 70%)' }} />

          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.25)', borderRadius: 100, padding: '4px 12px', marginBottom: 20, fontSize: '0.78rem', color: '#3fb950', fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>
              GitHub Native
            </div>
            <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em' }}>Every Pull Request.<br />Reviewed automatically.</h2>
            <p style={{ margin: '0 0 28px', color: '#8b949e', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Install our GitHub App once and your team gets instant AI reviews on every PR — right inside GitHub, as inline comments with suggested fixes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['AI posts inline comments with exact line numbers', 'Severity labels: Critical → Low', 'Copy-paste code fix in every comment', 'Score tracked over time on your dashboard'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', color: '#c9d1d9' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(63,185,80,0.15)', border: '1px solid rgba(63,185,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Mock GitHub comment */}
          <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', animation: 'float 6s ease-in-out infinite' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #21262d', background: '#161b22', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#58a6ff,#388bfd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>AI</div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>ai-code-reviewer[bot]</div>
                <div style={{ fontSize: '0.7rem', color: '#6e7681' }}>commented on line 12</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '0.65rem', background: 'rgba(248,81,73,0.15)', color: '#f85149', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 4, padding: '2px 8px', fontWeight: 800 }}>CRITICAL</div>
            </div>
            <div style={{ padding: '16px 16px 12px' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 6, padding: '8px 12px', marginBottom: 10, color: '#ffa198' }}>
                - const q = "SELECT * FROM users WHERE id=" + id;
              </div>
              <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: '#c9d1d9', lineHeight: 1.6 }}>
                🚨 <strong>SQL Injection Vulnerability</strong><br/>
                User input concatenated directly into SQL. An attacker can bypass authentication or dump your entire database.
              </p>
              <div style={{ background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 6, padding: '8px 12px' }}>
                <div style={{ fontSize: '0.7rem', color: '#3fb950', fontWeight: 700, marginBottom: 4 }}>💡 Suggested fix</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', color: '#3fb950' }}>+ db.query("SELECT * FROM users WHERE id = ?", [id])</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 800, margin: '0 auto 100px', padding: '0 40px', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, #161b22, #0d1117)', border: '1px solid #21262d', borderRadius: 20, padding: '72px 40px', position: 'relative', overflow: 'hidden' }}>
          {/* Glow effects */}
          <div style={{ position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(88,166,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #ffffff, #a0b3c8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Start shipping<br />safer code today.
          </h2>
          <p style={{ margin: '0 0 36px', color: '#8b949e', fontSize: '1rem', lineHeight: 1.7 }}>
            No credit card required. No install needed.<br />Just paste your code and let AI do the rest.
          </p>
          <Link to={isAuthenticated ? '/' : '/register'} style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #58a6ff, #388bfd)', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(88,166,255,0.4)', animation: 'pulse-glow 3s ease-in-out infinite' }}>
            Get started — it's free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #21262d', padding: '32px 40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg, #58a6ff, #388bfd)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 11H3v10h6V11zm12-4H15v14h6V7zm-6-4H9v18h6V3z"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>SyntaxGuard</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#6e7681' }}>
          Built with Groq LLaMA 3.3 70B · React · Node.js · MongoDB
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
