import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  Users, Briefcase, FileText, CheckCircle,
  Building2, TrendingUp, ShieldCheck, BarChart3,
  Clock, AlertCircle
} from 'lucide-react';
import api from '../../utils/api';
import AdminAnalytics from './Analytics';
import AdminUsers     from './Users';
import AdminCompanies from './Companies';
import AdminJobs      from './Jobs';
import AdminReports   from './Reports';
import AdminStudents  from './Students';

// ── Admin Home ───────────────────────────────────────────
function AdminHome() {
  const navigate              = useNavigate();
  const [stats,   setStats  ] = useState(null);
  const [pending, setPending] = useState({ companies: [], jobs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, companiesRes, jobsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/pending-companies'),
        api.get('/admin/pending-jobs'),
      ]);
      setStats(statsRes.data.stats);
      setPending({
        companies: (companiesRes.data.companies || []).slice(0, 3),
        jobs:      (jobsRes.data.jobs || []).slice(0, 3),
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const approveCompany = async (id) => {
    try {
      await api.patch(`/admin/companies/${id}/approve`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const approveJob = async (id) => {
    try {
      await api.patch(`/admin/jobs/${id}/approve`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const statCards = stats ? [
    { label: 'Total Students',    value: stats.totalStudents,     icon: Users,       color: '#007BFF', bg: 'rgba(0,123,255,0.12)'  },
    { label: 'Total Companies',   value: stats.totalCompanies,    icon: Building2,   color: '#00CCCC', bg: 'rgba(0,204,204,0.12)'  },
    { label: 'Jobs Posted',       value: stats.totalJobs,         icon: Briefcase,   color: '#007BFF', bg: 'rgba(0,123,255,0.12)'  },
    { label: 'Applications',      value: stats.totalApplications, icon: FileText,    color: '#FFD600', bg: 'rgba(255,214,0,0.12)'  },
    { label: 'Active Jobs',       value: stats.approvedJobs,      icon: CheckCircle, color: '#00C853', bg: 'rgba(0,200,83,0.12)'   },
    { label: 'Pending Jobs',      value: stats.pendingJobs,       icon: Clock,       color: '#FF4444', bg: 'rgba(255,68,68,0.12)'  },
    { label: 'Successful Hires',  value: stats.hiredCount,        icon: TrendingUp,  color: '#00CCCC', bg: 'rgba(0,204,204,0.12)'  },
    { label: 'Pending Companies', value: stats.pendingCompanies,  icon: AlertCircle, color: '#FFD600', bg: 'rgba(255,214,0,0.12)'  },
  ] : [];

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 fade-in">

      {/* Banner */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
           style={{background: 'linear-gradient(135deg, #001F3F 0%, #001030 60%, #000820 100%)',border:'1px solid rgba(120,80,255,0.2)',}}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, #A78BFA, transparent)', transform: 'translate(30%,-30%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Admin Control Panel</h2>
              <p className="text-sm" style={{ color: '#A78BFA' }}>
                CareerNexus — SLIATE Labuduwa
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button variant="cyan"    size="sm" icon={Building2}  onClick={() => navigate('/admin/companies')}>Companies</Button>
            <Button variant="outline" size="sm" icon={Briefcase}  onClick={() => navigate('/admin/jobs')}>Jobs</Button>
            <Button variant="outline" size="sm" icon={BarChart3}  onClick={() => navigate('/admin/analytics')}>Analytics</Button>
            <Button variant="outline" size="sm" icon={Users}      onClick={() => navigate('/admin/users')}>Users</Button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium mb-1"
                     style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                  <p className="text-3xl font-bold" style={{ color }}>{value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ background: bg }}>
                  <Icon size={20} style={{ color }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending companies */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Pending Companies
              {pending.companies.length > 0 && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                  {pending.companies.length}
                </span>
              )}
            </h3>
            <Button variant="ghost" size="sm"
                    onClick={() => navigate('/admin/companies')}>
              View all
            </Button>
          </div>
          {pending.companies.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle size={28} className="mx-auto mb-2"
                           style={{ color: '#10B981', opacity: 0.5 }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                All companies approved
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.companies.map(company => (
                <div key={company.id}
                     className="flex items-center justify-between p-3 rounded-xl"
                     style={{ background: 'var(--color-bg-hover)' }}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate"
                       style={{ color: 'var(--color-text-primary)' }}>
                      {company.companyName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {company.user?.email}
                    </p>
                  </div>
                  <Button variant="success" size="sm"
                          onClick={() => approveCompany(company.id)}>
                    Approve
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending jobs */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Pending Jobs
              {pending.jobs.length > 0 && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                  {pending.jobs.length}
                </span>
              )}
            </h3>
            <Button variant="ghost" size="sm"
                    onClick={() => navigate('/admin/jobs')}>
              View all
            </Button>
          </div>
          {pending.jobs.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle size={28} className="mx-auto mb-2"
                           style={{ color: '#10B981', opacity: 0.5 }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                All jobs approved
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.jobs.map(job => (
                <div key={job.id}
                     className="flex items-center justify-between p-3 rounded-xl"
                     style={{ background: 'var(--color-bg-hover)' }}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate"
                       style={{ color: 'var(--color-text-primary)' }}>
                      {job.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {job.company?.companyName}
                    </p>
                  </div>
                  <Button variant="success" size="sm"
                          onClick={() => approveJob(job.id)}>
                    Approve
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ── Main Admin Dashboard ─────────────────────────────────
export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard">
      <Routes>
        <Route path="dashboard"  element={<AdminHome />} />
        <Route path="companies"  element={<AdminCompanies />} />
        <Route path="jobs"       element={<AdminJobs />} />
        <Route path="students"   element={<AdminStudents />} />
        <Route path="analytics"  element={<AdminAnalytics />} />
        <Route path="reports"    element={<AdminReports />} />
        <Route path="users"      element={<AdminUsers />} />
        <Route path="*"          element={<AdminHome />} />
      </Routes>
    </DashboardLayout>
  );
}