import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/layout/RouteGuards';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import OAuthCallback from './pages/OAuthCallback';
import MagicVerify from './pages/MagicVerify';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0a1e1e',
              color: '#b8d8d8',
              border: '1px solid rgba(133,189,191,0.18)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#34d399', secondary: '#040f0f' } },
            error:   { iconTheme: { primary: '#d33f49', secondary: '#040f0f' } },
          }}
        />

        <Routes>
          {/* Public only */}
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* OAuth + passwordless callbacks — no auth guard, they handle themselves */}
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/auth/magic"    element={<MagicVerify />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Admin example route */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
