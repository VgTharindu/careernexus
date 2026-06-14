import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ui/Toast';
import Input from '../components/ui/Input';
import {
  Mail, Lock, User, Sun, Moon, Briefcase,
  GraduationCap, Building2, ArrowRight,
  CheckCircle, Shield, Brain, Users
} from 'lucide-react';
import api from '../utils/api';

export default function Register() {
  const [form,    setForm   ] = useState({
    name: '', email: '', password: '', role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { addToast }          = useToast();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      const res  = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);
      addToast('Account created successfully!', 'success');
      const role = res.data.user.role;
      if      (role === 'student') navigate('/student/dashboard');
      else if (role === 'company') navigate('/company/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      value:   'student',
      label:   'Student',
      sub:     'Find internships & jobs',
      icon:    GraduationCap,
      color:   '#007BFF',
      benefit: 'AI CV scoring + job matching',
    },
    {
      value:   'company',
      label:   'Company',
      sub:     'Post jobs & hire talent',
      icon:    Building2,
      color:   '#00CCCC',
      benefit: 'Smart applicant pipeline',
    },
  ];

  const perks = [
    '100% free — no credit card needed',
    'AI-powered CV scoring on every application',
    'Real-time notifications and status updates',
    'Verified companies only — safe and trusted',
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
          className="absolute top-16 right-16 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%)',
            filter:     'blur(40px)',
          }}
        />
        <div
          className="absolute bottom-16 left-16 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,123,255,0.12) 0%, transparent 70%)',
            filter:     'blur(40px)',
          }}
        />

        {/* Grid pattern */}
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

          <h1 className="text-4xl font-black mb-2 gradient-text">
            CareerNexus
          </h1>
          <p
            className="text-base mb-10 tracking-widest uppercase font-medium"
            style={{ color: '#00FFFF', letterSpacing: '0.12em' }}
          >
            Smarter Hiring. Better Futures.
          </p>

          {/* Stats grid */}
          <div
            className="grid grid-cols-2 gap-4 mb-8"
          >
            {[
              { value: '200+', label: 'Students Registered', color: '#007BFF' },
              { value: '50+',  label: 'Verified Companies',  color: '#00CCCC' },
              { value: '300+', label: 'Jobs Posted',         color: '#007BFF' },
              { value: '85%',  label: 'Placement Rate',      color: '#00CCCC' },
            ].map(stat => (
              <div
                key={stat.label}
                className="p-4 rounded-xl text-center"
                style={{
                  background: 'rgba(0,123,255,0.08)',
                  border:     '1px solid rgba(0,123,255,0.15)',
                }}
              >
                <p
                  className="text-2xl font-black"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: '#6699CC' }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Perks list */}
          <div className="space-y-3 text-left">
            {perks.map(perk => (
              <div
                key={perk}
                className="flex items-center gap-3"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,255,255,0.15)' }}
                >
                  <CheckCircle size={12} style={{ color: '#00FFFF' }} />
                </div>
                <span
                  className="text-sm"
                  style={{ color: '#B0D4FF' }}
                >
                  {perk}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────── */}
      <div
        className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative overflow-y-auto"
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
            className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
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
          <div className="mb-6">
            <h2
              className="text-3xl font-black mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Create your account
            </h2>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Free forever. No credit card required.
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <p
              className="text-sm font-medium mb-3"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              I am joining as a
            </p>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(role => {
                const Icon      = role.icon;
                const isSelected = form.role === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: role.value })}
                    className="p-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background:  isSelected
                        ? `linear-gradient(135deg, ${role.color}18, ${role.color}08)`
                        : 'var(--color-bg-card)',
                      border:      `2px solid ${isSelected ? role.color : 'var(--color-border)'}`,
                      boxShadow:   isSelected ? `0 0 15px ${role.color}20` : 'none',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                      style={{
                        background: isSelected ? `${role.color}25` : 'var(--color-bg-hover)',
                      }}
                    >
                      <Icon
                        size={18}
                        style={{ color: isSelected ? role.color : 'var(--color-text-muted)' }}
                      />
                    </div>
                    <p
                      className="font-bold text-sm"
                      style={{
                        color: isSelected ? role.color : 'var(--color-text-primary)',
                      }}
                    >
                      {role.label}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {role.sub}
                    </p>
                    {isSelected && (
                      <div
                        className="flex items-center gap-1 mt-2"
                        style={{ color: role.color }}
                      >
                        <CheckCircle size={11} />
                        <span className="text-xs font-medium">{role.benefit}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
              icon={User}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              icon={Mail}
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Min 6 characters"
              icon={Lock}
              required
            />

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
                  Creating account...
                </>
              ) : (
                <>
                  Create{' '}
                  {form.role === 'student' ? 'Student' : 'Company'}{' '}
                  Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Terms note */}
            <p
              className="text-xs text-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              By creating an account you agree to our{' '}
              <span style={{ color: '#007BFF' }}>Terms of Service</span>
              {' '}and{' '}
              <span style={{ color: '#007BFF' }}>Privacy Policy</span>
            </p>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          </div>

          {/* Login link */}
          <div
            className="p-4 rounded-xl text-center"
            style={{
              background: 'var(--color-bg-card)',
              border:     '1px solid var(--color-border)',
            }}
          >
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold hover:underline transition-colors"
                style={{ color: '#007BFF' }}
              >
                Sign in →
              </Link>
            </p>
          </div>

          {/* Security note */}
          <div
            className="flex items-center gap-2 mt-4 p-3 rounded-xl"
            style={{
              background: 'rgba(0,255,255,0.04)',
              border:     '1px solid rgba(0,255,255,0.1)',
            }}
          >
            <Shield size={14} style={{ color: '#00CCCC', flexShrink: 0 }} />
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Your data is protected with bcrypt encryption and JWT authentication
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}