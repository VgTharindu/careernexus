import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, ArrowLeft, Sun, Moon, Briefcase, CheckCircle } from 'lucide-react';
import api from '../utils/api';

export default function ForgotPassword() {
  const { isDark, toggleTheme } = useTheme();
  const [email,   setEmail    ] = useState('');
  const [loading, setLoading  ] = useState(false);
  const [sent,    setSent     ] = useState(false);
  const [error,   setError    ] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ background: 'var(--color-bg-primary)' }}>

      {/* Theme toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors"
          style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="w-full max-w-md fade-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4 mx-auto"
               style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
            <Briefcase size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">CareerNexus</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Smarter Hiring. Better Futures.
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div className="text-center p-8 rounded-2xl"
               style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                 style={{ background: 'rgba(16,185,129,0.15)' }}>
              <CheckCircle size={32} style={{ color: '#10B981' }} />
            </div>
            <h2 className="text-xl font-bold mb-2"
                style={{ color: 'var(--color-text-primary)' }}>
              Check Your Email
            </h2>
            <p className="text-sm mb-6"
               style={{ color: 'var(--color-text-secondary)' }}>
              If an account exists for <strong>{email}</strong>, we have sent a password reset link. Check your inbox and spam folder.
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
              The link expires in 1 hour.
            </p>
            <Link to="/login">
              <Button variant="primary" fullWidth icon={ArrowLeft}>
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          /* Form state */
          <div className="rounded-2xl p-8"
               style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-bold mb-2"
                style={{ color: 'var(--color-text-primary)' }}>
              Forgot Password?
            </h2>
            <p className="text-sm mb-6"
               style={{ color: 'var(--color-text-secondary)' }}>
              Enter your email address and we will send you a link to reset your password.
            </p>

            {error && (
              <div className="p-3 rounded-xl mb-4 text-sm"
                   style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                icon={Mail}
                required
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
                icon={Mail}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="text-center mt-4">
              <Link
                to="/login"
                className="text-sm flex items-center justify-center gap-1 hover:underline"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}