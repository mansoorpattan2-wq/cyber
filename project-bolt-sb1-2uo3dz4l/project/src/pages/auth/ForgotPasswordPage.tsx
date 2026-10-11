import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { AuthLayout } from './AuthLayout';

export function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!email.trim()) { setError('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return false; }
    setError('');
    return true;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      showToast('Password reset instructions would be sent to your email.', 'info');
    }, 800);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
          <h2 className="text-2xl font-bold text-slate-100">Reset Password</h2>
          <p className="text-sm text-slate-400 mt-1">Enter your email to receive reset instructions</p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-sm text-slate-200 font-medium">Reset request received</p>
              <p className="text-xs text-slate-400 mt-2">
                In a production environment with a backend, a password reset link would be sent to <span className="text-slate-300 font-medium">{email}</span>.
                Actual email delivery requires a configured backend email service.
              </p>
            </div>
            <Link to="/login" className="btn-secondary w-full">Return to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className={`input-field pl-10 ${error ? 'border-red-500/50' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={!!error}
                />
              </div>
              {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            </div>

            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
              <p className="text-xs text-yellow-400/80">
                This is a frontend demo. No actual email will be sent. A backend email service is required for real password resets.
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Instructions'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-400">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
