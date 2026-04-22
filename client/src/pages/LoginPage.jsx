import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { BrandPanel } from '../components/layout/BrandPanel';
import { InputField } from '../components/ui/InputField';
import { OTPInput } from '../components/ui/OTPInput';
import { OAuthButtons } from '../components/auth/OAuthButtons';
import api from '../lib/api';

const TABS = ['Password', 'Magic Link', 'OTP'];

export default function LoginPage() {
  const { login, isAuthenticated, loading, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from?.pathname || '/dashboard';

  const [tab, setTab] = useState('Password');

  // Password form
  const [form, setForm] = useState({ email: '', password: '' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  // Magic link
  const [mlEmail, setMlEmail] = useState('');
  const [mlSent, setMlSent] = useState(false);
  const [mlBusy, setMlBusy] = useState(false);

  // OTP
  const [otpEmail, setOtpEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('      ');
  const [otpBusy, setOtpBusy] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate(dest, { replace: true }); }, [isAuthenticated]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    const newErrs = {};
    if (!form.email.trim()) newErrs.email = 'Required';
    if (!form.password) newErrs.password = 'Required';
    if (Object.keys(newErrs).length) return setErrs(newErrs);

    setBusy(true);
    const res = await login(form.email, form.password);
    if (!res.ok) toast.error(res.msg);
    setBusy(false);
  };

  const handleMagicSend = async (e) => {
    e.preventDefault();
    if (!mlEmail.trim()) return toast.error('Enter your email');
    setMlBusy(true);
    try {
      await api.post('/auth/magic-link/send', { email: mlEmail });
      setMlSent(true);
      toast.success('Magic link sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
    setMlBusy(false);
  };

  const handleOtpSend = async (e) => {
    e.preventDefault();
    if (!otpEmail.trim()) return toast.error('Enter your email');
    setOtpBusy(true);
    try {
      await api.post('/auth/otp/send', { email: otpEmail });
      setOtpSent(true);
      toast.success('OTP sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
    setOtpBusy(false);
  };

  const handleOtpVerify = async () => {
    const code = otpCode.replace(/\s/g, '');
    if (code.length < 6) return toast.error('Enter all 6 digits');
    setOtpBusy(true);
    try {
      const { data } = await api.post('/auth/otp/verify', { email: otpEmail, otp: code });
      sessionStorage.setItem('accessToken', data.accessToken);
      window.location.href = dest;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtpCode('      ');
    }
    setOtpBusy(false);
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="auth-shell">
      <BrandPanel />

      <div className="auth-panel-right">
        <div className="auth-card">
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-frost)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
              Choose how you want to sign in
            </p>
          </div>

          {/* Method tabs */}
          <div className="method-tabs" style={{ marginBottom: 24 }}>
            {TABS.map((t) => (
              <button key={t} className={`method-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>

          {/* ── Password tab ────────────────────────────────────────────────── */}
          {tab === 'Password' && (
            <>
              <OAuthButtons />
              <div className="divider" style={{ margin: '20px 0' }}>or continue with email</div>

              <form onSubmit={handlePasswordLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <InputField label="Email" name="email" type="email" value={form.email}
                  onChange={e => { setForm(p => ({ ...p, email: e.target.value })); clearError(); setErrs(p => ({ ...p, email: '' })); }}
                  error={errs.email} placeholder="you@example.com" autoComplete="email" />

                <InputField label="Password" name="password" type="password" value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); clearError(); setErrs(p => ({ ...p, password: '' })); }}
                  error={errs.password} placeholder="Your password" autoComplete="current-password" />

                <button type="submit" className="btn-primary" disabled={busy} style={{ marginTop: 4 }}>
                  {busy ? <><div className="spinner" /> Signing in…</> : 'Sign in'}
                </button>
              </form>
            </>
          )}

          {/* ── Magic Link tab ───────────────────────────────────────────────── */}
          {tab === 'Magic Link' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {mlSent ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: 'var(--color-steel)' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <p style={{ color: 'var(--color-steel)', fontWeight: 600, marginBottom: 6 }}>Check your email</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                    We sent a magic link to <strong style={{ color: 'var(--color-frost)' }}>{mlEmail}</strong>.<br />
                    It expires in 15 minutes.
                  </p>
                  <button onClick={() => setMlSent(false)} style={{ marginTop: 20, background: 'none', border: 'none', color: 'var(--color-ember)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                    ← Try a different email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMagicSend} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                    Enter your email and we'll send a one-click sign-in link. No password needed.
                  </p>
                  <InputField label="Email" name="ml-email" type="email" value={mlEmail}
                    onChange={e => setMlEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                  <button type="submit" className="btn-primary" disabled={mlBusy}>
                    {mlBusy ? <><div className="spinner" /> Sending…</> : 'Send magic link'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── OTP tab ──────────────────────────────────────────────────────── */}
          {tab === 'OTP' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!otpSent ? (
                <form onSubmit={handleOtpSend} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                    We'll send a 6-digit code to your email. Valid for 10 minutes, 3 attempts max.
                  </p>
                  <InputField label="Email" name="otp-email" type="email" value={otpEmail}
                    onChange={e => setOtpEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                  <button type="submit" className="btn-primary" disabled={otpBusy}>
                    {otpBusy ? <><div className="spinner" /> Sending…</> : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-steel)', marginBottom: 4 }}>
                      Code sent to <strong style={{ color: 'var(--color-frost)' }}>{otpEmail}</strong>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Enter the 6-digit code below</p>
                  </div>
                  <OTPInput value={otpCode} onChange={setOtpCode} disabled={otpBusy} />
                  <button className="btn-primary" onClick={handleOtpVerify} disabled={otpBusy || otpCode.replace(/\s/g, '').length < 6}>
                    {otpBusy ? <><div className="spinner" /> Verifying…</> : 'Verify code'}
                  </button>
                  <button onClick={() => { setOtpSent(false); setOtpCode('      '); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                    ← Different email
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--color-ember)', fontWeight: 600, textDecoration: 'none' }}>
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
