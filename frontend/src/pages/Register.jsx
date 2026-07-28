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
  const [error,   setError  ] = useState('');
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
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      addToast(msg, 'error');
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
    className="h-screen flex items-center justify-center p-4"
    style={{ background: 'var(--color-bg-primary)', overflow: 'hidden' }}
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

    {/* Register card */}
    <div
      className="w-full max-w-md rounded-2xl fade-in"
      style={{
        background: 'var(--color-bg-secondary)',
        border:     '1px solid var(--color-border)',
        boxShadow:  '0 20px 60px rgba(0,0,0,0.3)',
        padding:    '28px 32px',
        maxHeight:  'calc(100vh - 40px)',
        overflowY:  'auto',
      }}
    >
      {/* Logo */}
      <div className="text-center mb-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'linear-gradient(135deg, #007BFF, #00CCCC)' }}
        >
          <Briefcase size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold gradient-text">CareerNexus</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Smarter Hiring. Better Futures.
        </p>
      </div>

      <h2
        className="text-xl font-bold mb-1"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Create your account
      </h2>
      <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
        Free forever. No credit card required.
      </p>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { value: 'student', label: 'Student', desc: 'Find internships & jobs',    icon: GraduationCap },
          { value: 'company', label: 'Company', desc: 'Post jobs & hire talent',    icon: Building2     },
        ].map(({ value, label, desc, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setForm({ ...form, role: value })}
            className="p-3 rounded-xl text-left transition-all"
            style={{
              border:     form.role === value ? '2px solid #007BFF' : '1px solid var(--color-border)',
              background: form.role === value ? 'rgba(0,123,255,0.08)' : 'var(--color-bg-primary)',
            }}
          >
            <Icon size={18} style={{ color: form.role === value ? '#007BFF' : 'var(--color-text-muted)' }} />
            <p className="text-sm font-bold mt-1"
               style={{ color: form.role === value ? '#007BFF' : 'var(--color-text-primary)' }}>
              {label}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
          </button>
        ))}
      </div>

      {error && (
        <div
          className="p-3 rounded-xl mb-3 text-sm"
          style={{
            background: 'rgba(239,68,68,0.1)',
            color:      '#EF4444',
            border:     '1px solid rgba(239,68,68,0.2)',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={loading}
          icon={ArrowRight}
        >
          {loading ? 'Creating account...' : `Create ${form.role === 'company' ? 'Company' : 'Student'} Account`}
        </Button>
      </form>

      <p className="text-center text-sm mt-4" style={{ color: 'var(--color-text-muted)' }}>
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold hover:underline"
          style={{ color: '#007BFF' }}
        >
          Sign in →
        </Link>
      </p>
    </div>
  </div>
);
}