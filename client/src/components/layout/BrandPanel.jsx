const ShieldCheck = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9,12 11,14 15,10"/>
  </svg>
);

const methods = [
  { label: 'Email + Password', desc: 'Bcrypt 12-round hashing, account lockout' },
  { label: 'Google OAuth 2.0', desc: 'Passport.js, provider merging' },
  { label: 'GitHub OAuth 2.0', desc: 'Scope: user:email, upsert logic' },
  { label: 'Magic Link',       desc: 'Signed JWT, 15-min expiry, one-time use' },
  { label: 'OTP (6-digit)',    desc: '10-min expiry, max 3 attempts' },
  { label: 'RBAC',             desc: 'user → moderator → admin roles' },
];

export const BrandPanel = () => (
  <div className="auth-panel-left">
    {/* Logo */}
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
        <div style={{
          width: 48, height: 48,
          background: 'var(--color-ember)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 6px 20px rgba(211,63,73,0.35)',
        }}>
          <ShieldCheck />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--color-frost)', letterSpacing: '-0.01em' }}>
            SecureAuth
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            7-day build
          </div>
        </div>
      </div>

      {/* Headline */}
      <h2 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '2.1rem',
        lineHeight: 1.15,
        color: 'var(--color-frost)',
        marginBottom: 16,
        letterSpacing: '-0.02em',
      }}>
        Every auth method,<br />
        <span style={{ color: 'var(--color-ember)', fontStyle: 'italic' }}>built from scratch.</span>
      </h2>

      <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.7, marginBottom: 36, maxWidth: 320 }}>
        No auth library hiding the logic. JWT rotation, OAuth merging, OTP lockout — all visible, all explained.
      </p>

      {/* Method list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {methods.map(({ label, desc }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--color-ember)',
              marginTop: 7, flexShrink: 0,
            }} />
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-steel)', marginBottom: 1 }}>{label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Bottom footnote */}
    <div style={{ fontSize: '0.75rem', color: 'rgba(87,115,122,0.5)', fontFamily: 'var(--font-mono)' }}>
      MERN · Vite · Tailwind v4 · Passport.js
    </div>
  </div>
);
