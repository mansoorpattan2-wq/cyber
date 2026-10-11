import { useNavigate } from 'react-router-dom';
import { Shield, Home, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Shield className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-slate-100">404</h1>
        <p className="text-lg text-slate-400 mt-2">Page not found</p>
        <p className="text-sm text-slate-500 mt-3">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <button onClick={() => navigate(user ? '/student/dashboard' : '/login')} className="btn-primary">
            <Home className="w-4 h-4" /> {user ? 'Go to Dashboard' : 'Go to Login'}
          </button>
          {user && (
            <button onClick={() => navigate('/login')} className="btn-secondary">
              <LogIn className="w-4 h-4" /> Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ErrorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-9 h-9 text-red-400" />
        </div>
        <h1 className="text-5xl font-bold text-slate-100">500</h1>
        <p className="text-lg text-slate-400 mt-2">Something went wrong</p>
        <p className="text-sm text-slate-500 mt-3">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
          <button onClick={() => navigate(user ? '/student/dashboard' : '/login')} className="btn-secondary">
            <Home className="w-4 h-4" /> {user ? 'Dashboard' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
