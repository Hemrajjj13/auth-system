import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function OAuthCallback() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const hash = window.location.hash;
    const token = new URLSearchParams(hash.slice(1)).get('token');

    if (!token) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    window.history.replaceState(null, '', window.location.pathname);

    sessionStorage.setItem('accessToken', token);
    api.get('/auth/me')
      .then(({ data }) => {
        loginWithToken(token, data.user);
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        sessionStorage.removeItem('accessToken');
        navigate('/login?error=oauth_failed', { replace: true });
      });
  }, []);

  return (
    <div className="loading-screen" style={{ flexDirection: 'column', gap: 16 }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
      <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Completing sign-in…</p>
    </div>
  );
}
