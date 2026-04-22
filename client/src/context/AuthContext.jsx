import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../lib/api';

const Ctx = createContext(null);

const init = {
  user: null,
  accessToken: sessionStorage.getItem('accessToken') || null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const reducer = (s, a) => {
  switch (a.type) {
    case 'OK':
      return { ...s, user: a.user, accessToken: a.token, isAuthenticated: true, loading: false, error: null };
    case 'FAIL':
      return { ...s, user: null, accessToken: null, isAuthenticated: false, loading: false, error: a.error };
    case 'LOGOUT':
      return { ...s, user: null, accessToken: null, isAuthenticated: false, loading: false, error: null };
    case 'LOADING':
      return { ...s, loading: a.val };
    case 'CLEAR_ERR':
      return { ...s, error: null };
    default:
      return s;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, init);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        sessionStorage.setItem('accessToken', data.accessToken);
        dispatch({ type: 'OK', user: data.user, token: data.accessToken });
      } catch {
        sessionStorage.removeItem('accessToken');
        dispatch({ type: 'FAIL', error: null });
      }
    })();
  }, []);

  const setAuth = (data) => {
    sessionStorage.setItem('accessToken', data.accessToken);
    dispatch({ type: 'OK', user: data.user, token: data.accessToken });
  };

  const register = useCallback(async (name, email, password) => {
    dispatch({ type: 'LOADING', val: true });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      setAuth(data);
      return { ok: true };
    } catch (e) {
      const msg = e.response?.data?.message || 'Registration failed';
      dispatch({ type: 'FAIL', error: msg });
      return { ok: false, msg };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'LOADING', val: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data);
      return { ok: true };
    } catch (e) {
      const msg = e.response?.data?.message || 'Login failed';
      dispatch({ type: 'FAIL', error: msg });
      return { ok: false, msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* best-effort */ }
    sessionStorage.removeItem('accessToken');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const loginWithToken = useCallback((token, user) => {
    sessionStorage.setItem('accessToken', token);
    dispatch({ type: 'OK', user, token });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERR' }), []);

  return (
    <Ctx.Provider value={{ ...state, register, login, logout, loginWithToken, clearError }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
