import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { BrandPanel } from '../components/layout/BrandPanel';
import { InputField } from '../components/ui/InputField';
import { PasswordStrength } from '../components/ui/PasswordStrength';
import { OAuthButtons } from '../components/auth/OAuthButtons';

export default function RegisterPage() {
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate('/dashboard', { replace: true }); }, [isAuthenticated]);

  const field = (name) => (e) => {
    setForm(p => ({ ...p, [name]: e.target.value }));
    setErrs(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'At least 2 characters';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    else if (!/\d/.test(form.password)) e.password = 'Must contain a number';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) return setErrs(errors);
    setBusy(true);
    const res = await register(form.name, form.email, form.password);
    if (!res.ok) toast.error(res.msg);
    setBusy(false);
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="auth-shell">
      <BrandPanel />

      <div className="auth-panel-right">
        <div className="auth-card">
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-frost)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Create account
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Get started — free forever</p>
          </div>

          {/* OAuth first */}
          <OAuthButtons />
          <div className="divider" style={{ margin: '20px 0' }}>or register with email</div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InputField label="Full name" name="name" value={form.name} onChange={field('name')}
              error={errs.name} placeholder="Jayesh Sharma" autoComplete="name" />

            <InputField label="Email" name="email" type="email" value={form.email} onChange={field('email')}
              error={errs.email} placeholder="you@example.com" autoComplete="email" />

            <div>
              <InputField label="Password" name="password" type="password" value={form.password} onChange={field('password')}
                error={errs.password} placeholder="Min 6 chars, include a number" autoComplete="new-password" />
              <PasswordStrength password={form.password} />
            </div>

            <InputField label="Confirm password" name="confirm" type="password" value={form.confirm} onChange={field('confirm')}
              error={errs.confirm} placeholder="Repeat password" autoComplete="new-password" />

            <button type="submit" className="btn-primary" disabled={busy} style={{ marginTop: 4 }}>
              {busy ? <><div className="spinner" /> Creating account…</> : 'Create account'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-ember)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
