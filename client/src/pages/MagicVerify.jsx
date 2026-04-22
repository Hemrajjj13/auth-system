import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';

export default function MagicVerify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ran = useRef(false);
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get('token');
    if (!token) { setStatus('error'); return; }

    api.post('/auth/magic-link/verify', { token })
      .then(({ data }) => {
        sessionStorage.setItem('accessToken', data.accessToken);
        navigate('/dashboard', { replace: true });
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="loading-screen" style={{ flexDirection: 'column', gap: 20 }}>
      {status === 'verifying' ? (
        <>
          <div className="spinner" style={{ width: 36, height: 36 }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Verifying magic link…</p>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: 'var(--color-ember)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p style={{ color: 'var(--color-ember)', fontWeight: 600, marginBottom: 8 }}>Link invalid or expired</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: 24 }}>Magic links expire in 15 minutes and can only be used once.</p>
          <button onClick={() => navigate('/login')} className="btn-primary btn-sm" style={{ width: 'auto', margin: '0 auto' }}>
            Back to login
          </button>
        </div>
      )}
    </div>
  );
}
