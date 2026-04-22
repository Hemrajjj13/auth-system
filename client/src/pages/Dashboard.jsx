import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9,12 11,14 15,10"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const authMethodBadge = {
  password: { label: 'Password', color: 'var(--color-steel)' },
  google:   { label: 'Google OAuth', color: '#4285F4' },
  github:   { label: 'GitHub OAuth', color: '#8b949e' },
  magic:    { label: 'Magic Link', color: '#a78bfa' },
  otp:      { label: 'OTP', color: '#34d399' },
};

const routes = [
  { method: 'POST', path: '/api/auth/register',         auth: false, desc: 'Create account + issue tokens' },
  { method: 'POST', path: '/api/auth/login',            auth: false, desc: 'Bcrypt verify, lockout, issue tokens' },
  { method: 'POST', path: '/api/auth/refresh',          auth: 'Cookie', desc: 'Token rotation — old hash invalidated' },
  { method: 'POST', path: '/api/auth/logout',           auth: false, desc: 'Clears refresh token cookie + DB hash' },
  { method: 'GET',  path: '/api/auth/me',               auth: 'Bearer', desc: 'Protected — returns current user' },
  { method: 'GET',  path: '/api/auth/google',           auth: false, desc: 'Redirects to Google OAuth consent' },
  { method: 'GET',  path: '/api/auth/github',           auth: false, desc: 'Redirects to GitHub OAuth consent' },
  { method: 'POST', path: '/api/auth/magic-link/send',  auth: false, desc: 'Sends signed JWT link via email' },
  { method: 'POST', path: '/api/auth/magic-link/verify',auth: false, desc: 'Verifies token, creates session' },
  { method: 'POST', path: '/api/auth/otp/send',         auth: false, desc: '6-digit code, bcrypt stored, 10 min' },
  { method: 'POST', path: '/api/auth/otp/verify',       auth: false, desc: 'Max 3 attempts, consumed on success' },
  { method: 'GET',  path: '/api/protected/profile',     auth: 'Bearer', desc: 'Any authenticated user' },
  { method: 'GET',  path: '/api/protected/users',       auth: 'mod+', desc: 'Moderator + Admin only' },
  { method: 'PATCH',path: '/api/protected/users/:id/role', auth: 'admin', desc: 'Admin only — RBAC role update' },
];

const methodColor = { GET: '#34d399', POST: '#60a5fa', PATCH: '#f59e0b', DELETE: '#f87171' };
const authColor = { Bearer: 'var(--color-steel)', Cookie: '#a78bfa', 'mod+': '#60a5fa', admin: 'var(--color-ember)' };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login', { replace: true });
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  const providers = user?.providers?.length ? user.providers : ['password'];

  return (
    <div style={{ minHeight: '100svh', background: 'var(--color-void)', position: 'relative', zIndex: 1 }}>
      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ color: 'var(--color-ember)' }}><ShieldIcon /></div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-frost)', letterSpacing: '-0.01em' }}>
            SecureAuth
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', marginLeft: 4 }}>
            dashboard
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Role badge */}
          <span className={`tag tag-${user?.role}`}>{user?.role}</span>

          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #a8303a, var(--color-ember))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-sans)',
              boxShadow: '0 4px 12px rgba(211,63,73,0.3)',
            }}>
              {initials}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-steel)', display: 'none' /* hide on small */ }}>
              {user?.name}
            </span>
          </div>

          <button className="btn-ghost btn-sm" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <LogoutIcon /> Sign out
          </button>
        </div>
      </nav>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '44px 32px' }}>

        {/* Welcome header */}
        <div style={{ marginBottom: 36, animation: 'fadeUp .35s ease both' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            authenticated
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--color-frost)', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 8 }}>
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
            Your JWT access token is active in <code className="code-block">sessionStorage</code>. Refresh tokens rotate on every use.
          </p>
        </div>

        {/* Status banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)',
          borderRadius: 10, padding: '12px 18px', marginBottom: 28,
          fontSize: '0.85rem', color: '#6ee7b7',
        }}>
          <div className="pulse-dot" />
          Session active — access token valid · refresh token in HttpOnly cookie
        </div>

        {/* Info cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 16, marginBottom: 28 }}>

          {/* Account card */}
          <div className="info-card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(133,189,191,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Account
              </span>
            </div>
            {[
              ['Name', user?.name],
              ['Email', user?.email],
              ['Role', <span className={`tag tag-${user?.role}`}>{user?.role}</span>],
              ['Verified', user?.isEmailVerified ? 'Yes' : 'No'],
              ['Joined', joinDate],
            ].map(([label, val]) => (
              <div key={label} className="info-row">
                <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-frost)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Security card */}
          <div className="info-card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(133,189,191,0.08)' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Security
              </span>
            </div>
            {[
              ['Password hash', 'bcrypt 12 rounds'],
              ['Access token', '15 min · in memory'],
              ['Refresh token', '7 days · HttpOnly cookie'],
              ['Rotation', 'one-time use · hash stored'],
              ['Lockout', '5 fails → 15 min block'],
            ].map(([label, val]) => (
              <div key={label} className="info-row">
                <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-steel)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Auth methods card */}
          <div className="info-card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(133,189,191,0.08)' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Your linked providers
              </span>
            </div>
            <div style={{ padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {providers.map((p) => {
                const badge = authMethodBadge[p] || { label: p, color: 'var(--color-steel)' };
                return (
                  <span key={p} style={{
                    padding: '4px 12px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    background: `${badge.color}18`,
                    border: `1px solid ${badge.color}30`,
                    color: badge.color,
                  }}>
                    {badge.label}
                  </span>
                );
              })}
            </div>
            <div style={{ padding: '0 20px 16px', fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
              Same email + different provider? They merge automatically into one account.
            </div>
          </div>
        </div>

        {/* API Routes table */}
        <div className="info-card" style={{ marginBottom: 28 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(133,189,191,0.08)' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              API Reference
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(133,189,191,0.08)' }}>
                  {['Method', 'Endpoint', 'Auth', 'Description'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routes.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(133,189,191,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(133,189,191,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '9px 16px' }}>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: methodColor[r.method] || '#fff' }}>{r.method}</span>
                    </td>
                    <td style={{ padding: '9px 16px' }}>
                      <code style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--color-frost)' }}>{r.path}</code>
                    </td>
                    <td style={{ padding: '9px 16px' }}>
                      {r.auth ? (
                        <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: authColor[r.auth] || 'var(--color-steel)' }}>{r.auth}</span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'rgba(87,115,122,0.4)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '9px 16px', fontSize: '0.8rem', color: 'var(--color-muted)' }}>{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Protected route explainer */}
        <div style={{
          background: 'var(--color-abyss)',
          border: '1px solid rgba(133,189,191,0.1)',
          borderRadius: 14,
          padding: '24px 28px',
        }}>
          <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-ember)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Protected route
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.75, marginBottom: 10 }}>
            <code className="code-block">/dashboard</code> is wrapped in <code className="code-block">{'<ProtectedRoute>'}</code>. Without a valid JWT, React Router redirects you to <code className="code-block">/login</code>, saving your intended destination — so you land back here after authenticating.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.75 }}>
            When your 15-minute access token expires, the Axios interceptor silently POSTs to <code className="code-block">/api/auth/refresh</code> using the HttpOnly cookie. The old refresh token hash is <strong style={{ color: 'var(--color-frost)' }}>invalidated immediately</strong> (rotation), a new pair is issued, and your original request retries — all invisible to you.
          </p>
        </div>
      </main>
    </div>
  );
}
