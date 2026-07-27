import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ui/Toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import {
  Mail, Lock, Sun, Moon, Briefcase,
  ArrowRight, Shield, Users, Brain
} from 'lucide-react';
import api from '../utils/api';

export default function Login() {
  const [form,    setForm   ] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { addToast }          = useToast();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      addToast(`Welcome back, ${res.data.user.name}!`, 'success');
      const role = res.data.user.role;
      if      (role === 'student') navigate('/student/dashboard');
      else if (role === 'company') navigate('/company/dashboard');
      else if (role === 'admin')   navigate('/admin/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Brain,  text: 'AI-powered CV scoring'           },
    { icon: Users,  text: 'Connect with verified companies' },
    { icon: Shield, text: 'Secure role-based access'        },
  ];

  return (
  <div
    className="min-h-screen flex items-center justify-center p-4"
    style={{ background: 'var(--color-bg-primary)' }}
  >
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

    {/* Login card */}
    <div
      className="w-full max-w-md rounded-2xl p-8 fade-in"
      style={{
        background: 'var(--color-bg-secondary)',
        border:     '1px solid var(--color-border)',
        boxShadow:  '0 20px 60px rgba(0,0,0,0.3)',
      }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #007BFF, #00CCCC)' }}
        >
          <Briefcase size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold gradient-text">CareerNexus</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Smarter Hiring. Better Futures.
        </p>
      </div>

      <h2
        className="text-2xl font-bold mb-1"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Welcome back
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
        Sign in to your CareerNexus account to continue
      </p>

      {error && (
        <div
          className="p-3 rounded-xl mb-4 text-sm"
          style={{
            background: 'rgba(239,68,68,0.1)',
            color:      '#EF4444',
            border:     '1px solid rgba(239,68,68,0.2)',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="your@email.com"
          icon={Mail}
          required
        />
        <div>
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Enter your password"
            icon={Lock}
            required
          />
          <div className="flex justify-end mt-1">
            <Link
              to="/forgot-password"
              className="text-xs hover:underline"
              style={{ color: 'var(--color-blue-light, #60A5FA)' }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={loading}
          icon={ArrowRight}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }} />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>
            or
          </span>
        </div>
      </div>

      <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-semibold hover:underline"
          style={{ color: '#007BFF' }}
        >
          Create one free →
        </Link>
      </p>

      {/* Role hint badges */}
      <div className="grid grid-cols-3 gap-2 mt-6">
        {[
          { role: 'Student',  desc: 'Find internships',   color: '#007BFF' },
          { role: 'Company',  desc: 'Post jobs',          color: '#00CCCC' },
          { role: 'Admin',    desc: 'Manage platform',    color: '#7850FF' },
        ].map(({ role, desc, color }) => (
          <div
            key={role}
            className="text-center p-2 rounded-xl"
            style={{
              background: `${color}11`,
              border:     `1px solid ${color}33`,
            }}
          >
            <p className="text-xs font-bold" style={{ color }}>{role}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}