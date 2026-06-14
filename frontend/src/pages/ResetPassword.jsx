import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import {
  Lock, Shield, Sun, Moon,
  Briefcase, CheckCircle, ArrowLeft
} from 'lucide-react';
import api from '../utils/api';

export default function ResetPassword() {
  const { isDark, toggleTheme }   = useTheme();
  const { addToast }              = useToast();
  const navigate                  = useNavigate();
  const [searchParams]            = useSearchParams();
  const token                     = searchParams.get('token');

  const [form,    setForm   ] = useState({ newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [done,    setDone   ] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirm) {
      addToast('Passwords do not match', 'error');
      return;
    }

    if (form.newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: form.newPassword
      });
      setDone(true);
      addToast('Password reset successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Reset failed — link may have expired', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}>
            Invalid Reset Link
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            This password reset link is invalid or has expired.
          </p>
          <Link to="/forgot-password">
            <Button variant="primary">Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ background: 'var(--color-bg-primary)' }}>

      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg"
          style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="w-full max-w-md fade-in">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4 mx-auto"
               style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
            <Briefcase size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">CareerNexus</h1>
        </div>

        {done ? (
          <div className="text-center p-8 rounded-2xl"
               style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                 style={{ background: 'rgba(16,185,129,0.15)' }}>
              <CheckCircle size={32} style={{ color: '#10B981' }} />
            </div>
            <h2 className="text-xl font-bold mb-2"
                style={{ color: 'var(--color-text-primary)' }}>
              Password Reset!
            </h2>
            <p className="text-sm mb-6"
               style={{ color: 'var(--color-text-secondary)' }}>
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl p-8"
               style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-bold mb-2"
                style={{ color: 'var(--color-text-primary)' }}>
              Create New Password
            </h2>
            <p className="text-sm mb-6"
               style={{ color: 'var(--color-text-secondary)' }}>
              Choose a strong password with at least 6 characters.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                value={form.newPassword}
                onChange={e => setForm({ ...form, newPassword: e.target.value })}
                placeholder="Enter new password"
                icon={Lock}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                placeholder="Confirm new password"
                icon={Shield}
                required
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
                icon={Lock}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>

            <div className="text-center mt-4">
              <Link to="/login"
                    className="text-sm flex items-center justify-center gap-1 hover:underline"
                    style={{ color: 'var(--color-text-muted)' }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}