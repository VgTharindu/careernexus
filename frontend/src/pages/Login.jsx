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
      className="min-h-screen flex"
      style={{ background: 'var(--color-bg-primary)' }}
    >

      {/* ── Left branding panel ───────────────────────── */}
      <div
        className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #001F3F 0%, #002D5A 50%, #003366 100%)',
        }}
      >
        {/* Background glow orbs */}
        <div
          className="absolute top-20 left-20 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,123,255,0.15) 0%, transparent 70%)',
            filter:     'blur(40px)',
          }}
        />
        <div
          className="absolute bottom-20 right-20 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%)',
            filter:     'blur(40px)',
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,123,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,123,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-md">

          {/* Logo */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse"
            style={{
              background: 'linear-gradient(135deg, #007BFF, #00FFFF)',
              boxShadow:  '0 0 30px rgba(0,123,255,0.4), 0 0 60px rgba(0,255,255,0.15)',
            }}
          >
            <Briefcase size={40} className="text-white" />
          </div>

          {/* Name */}
          <h1 className="text-4xl font-black mb-2 gradient-text">
            CareerNexus
          </h1>
          <p
            className="text-base mb-10 tracking-widest uppercase font-medium"
            style={{ color: '#00FFFF', letterSpacing: '0.12em' }}
          >
            Smarter Hiring. Better Futures.
          </p>

          {/* Feature list */}
          <div className="space-y-4 mb-10 text-left">
            {features.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: 'rgba(0,123,255,0.08)',
                  border:     '1px solid rgba(0,123,255,0.2)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,123,255,0.2)' }}
                >
                  <Icon size={16} style={{ color: '#00FFFF' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: '#B0D4FF' }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-4 p-4 rounded-2xl"
            style={{
              background: 'rgba(0,123,255,0.06)',
              border:     '1px solid rgba(0,123,255,0.15)',
            }}
          >
            {[
              { value: '200+', label: 'Students'  },
              { value: '50+',  label: 'Companies' },
              { value: '85%',  label: 'Placement' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-black gradient-text">{stat.value}</p>
                <p className="text-xs" style={{ color: '#6699CC' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────── */}
      <div
        className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative"
        style={{ background: 'var(--color-bg-primary)' }}
      >

        {/* Theme toggle */}
        <div className="absolute top-6 right-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl transition-colors"
            style={{
              background: 'var(--color-bg-card)',
              color:      'var(--color-text-secondary)',
              border:     '1px solid var(--color-border)',
            }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Back to home */}
        <div className="absolute top-6 left-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Briefcase size={16} style={{ color: '#007BFF' }} />
            <span className="gradient-text font-bold">CareerNexus</span>
          </Link>
        </div>

        <div className="w-full max-w-md fade-in">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg, #007BFF, #00FFFF)' }}
            >
              <Briefcase size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-black gradient-text">CareerNexus</h1>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2
              className="text-3xl font-black mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Sign in to your CareerNexus account to continue
            </p>
          </div>

          {/* Form */}
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
                placeholder="••••••••"
                icon={Lock}
                required
              />
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs hover:underline transition-colors"
                  style={{ color: '#007BFF' }}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-base transition-all hover:scale-[1.02] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{
                background: loading
                  ? 'rgba(0,123,255,0.5)'
                  : 'linear-gradient(135deg, #007BFF, #00CCCC)',
                color:     'white',
                boxShadow: loading ? 'none' : '0 8px 25px rgba(0,123,255,0.35)',
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          </div>

          {/* Register link */}
          <div
            className="p-4 rounded-xl text-center"
            style={{
              background: 'var(--color-bg-card)',
              border:     '1px solid var(--color-border)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold hover:underline transition-colors"
                style={{ color: '#007BFF' }}
              >
                Create one free →
              </Link>
            </p>
          </div>

          {/* Role hint */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: 'Student',  desc: 'Find internships',    color: '#007BFF' },
              { label: 'Company',  desc: 'Post jobs',           color: '#00CCCC' },
              { label: 'Admin',    desc: 'Manage platform',     color: '#007BFF' },
            ].map(role => (
              <div
                key={role.label}
                className="p-2.5 rounded-xl text-center"
                style={{
                  background: `${role.color}08`,
                  border:     `1px solid ${role.color}20`,
                }}
              >
                <p
                  className="text-xs font-bold"
                  style={{ color: role.color }}
                >
                  {role.label}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {role.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}