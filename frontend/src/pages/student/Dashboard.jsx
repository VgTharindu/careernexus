import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import {
  Briefcase, FileText, Clock, CheckCircle,
  TrendingUp, Search, Bell, User
} from 'lucide-react';
import api from '../../utils/api';
import StudentProfile      from './Profile';
import StudentSettings     from './Settings';
import StudentJobs         from './Jobs';
import StudentApplications from './Applications';
import StudentNotifications from './Notifications';

// ── Student Home page ────────────────────────────────────
function StudentHome() {
  const { user, profileImage } = useAuth();
  const [stats,        setStats         ] = useState({ total: 0, shortlisted: 0, hired: 0, pending: 0 });
  const [recentApps,   setRecentApps    ] = useState([]);
  const [recentJobs,   setRecentJobs    ] = useState([]);
  const [notifications,setNotifications ] = useState([]);
  const [loading,      setLoading       ] = useState(true);
  const navigate                          = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [appsRes, jobsRes, notifsRes] = await Promise.all([
        api.get('/applications/my-applications'),
        api.get('/jobs'),
        api.get('/notifications').catch(() => ({ data: { notifications: [] } }))
      ]);

      const apps = appsRes.data.applications || [];
      setRecentApps(apps.slice(0, 3));
      setStats({
        total:       apps.length,
        shortlisted: apps.filter(a => a.status === 'shortlisted').length,
        hired:       apps.filter(a => a.status === 'hired').length,
        pending:     apps.filter(a => a.status === 'pending').length,
      });
      setRecentJobs((jobsRes.data.jobs || []).slice(0, 4));
      setNotifications((notifsRes.data.notifications || []).filter(n => !n.isRead).slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    pending:     { color: 'yellow', label: 'Pending'     },
    shortlisted: { color: 'green',  label: 'Shortlisted' },
    hired:       { color: 'blue',   label: 'Hired'       },
    rejected:    { color: 'red',    label: 'Rejected'    },
  };

  const statCards = [
    { label: 'Total Applied',  value: stats.total,       icon: FileText,    color: '#007BFF', bg: 'rgba(0,123,255,0.12)'  },
    { label: 'Shortlisted',    value: stats.shortlisted, icon: TrendingUp,  color: '#00C853', bg: 'rgba(0,200,83,0.12)'   },
    { label: 'Hired',          value: stats.hired,       icon: CheckCircle, color: '#00CCCC', bg: 'rgba(0,204,204,0.12)'  },
    { label: 'Pending Review', value: stats.pending,     icon: Clock,       color: '#FFD600', bg: 'rgba(255,214,0,0.12)'  },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 fade-in">

      {/* Welcome banner */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #001F3F 0%, #002D5A 60%, #003366 100%)',
          border:     '1px solid rgba(0,123,255,0.2)',
        }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.08) 0%, transparent 70%)',
            transform:  'translate(30%,-30%)',
            filter:     'blur(30px)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,123,255,0.08) 0%, transparent 70%)',
            transform:  'translate(-30%,30%)',
            filter:     'blur(30px)',
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} src={profileImage} size="lg" />
            <div>
              <p className="text-sm" style={{ color: '#94A3B8' }}>Welcome back 👋</p>
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <p className="text-sm mt-1" style={{ color: '#60A5FA' }}>
                {stats.total === 0
                  ? 'Start your journey — browse jobs and apply today'
                  : `You have ${stats.total} application${stats.total !== 1 ? 's' : ''} in progress`}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-3 flex-wrap">
            <Button variant="cyan"    size="sm" icon={Search}   onClick={() => navigate('/student/jobs')}>
              Browse Jobs
            </Button>
            <Button variant="outline" size="sm" icon={FileText} onClick={() => navigate('/student/applications')}>
              My Applications
            </Button>
            <Button variant="outline" size="sm" icon={User}     onClick={() => navigate('/student/profile')}>
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, color, bg, icon: Icon }) => (
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

      {/* Unread notifications alert */}
      {notifications.length > 0 && (
        <div className="rounded-xl p-4"
             style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold flex items-center gap-2"
               style={{ color: '#60A5FA' }}>
              <Bell size={16} /> {notifications.length} unread notification{notifications.length !== 1 ? 's' : ''}
            </p>
            <Button variant="ghost" size="sm"
                    onClick={() => navigate('/student/notifications')}>
              View all
            </Button>
          </div>
          <div className="space-y-2">
            {notifications.map(n => (
              <p key={n.id} className="text-xs"
                 style={{ color: 'var(--color-text-secondary)' }}>
                • {n.message}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent applications */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Recent Applications
            </h3>
            <Button variant="ghost" size="sm"
                    onClick={() => navigate('/student/applications')}>
              View all
            </Button>
          </div>
          {recentApps.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={32} className="mx-auto mb-2 opacity-20"
                        style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
                No applications yet
              </p>
              <Button variant="outline" size="sm"
                      onClick={() => navigate('/student/jobs')}>
                Browse Jobs
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApps.map(app => {
                const config = statusConfig[app.status] || { color: 'gray', label: app.status };
                return (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-xl"
                       style={{ background: 'var(--color-bg-hover)' }}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate"
                         style={{ color: 'var(--color-text-primary)' }}>
                        {app.job?.title}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {app.job?.company?.companyName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      {app.aiScore !== null && app.aiScore !== undefined && (
                        <span className="text-xs font-bold" style={{ color: '#06B6D4' }}>
                          {app.aiScore}%
                        </span>
                      )}
                      <Badge variant={config.color}>{config.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Latest jobs */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Latest Opportunities
            </h3>
            <Button variant="ghost" size="sm"
                    onClick={() => navigate('/student/jobs')}>
              View all
            </Button>
          </div>
          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase size={32} className="mx-auto mb-2 opacity-20"
                         style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                No jobs available
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map(job => (
                <div key={job.id}
                     className="p-3 rounded-xl cursor-pointer transition-colors"
                     style={{ background: 'var(--color-bg-hover)' }}
                     onClick={() => navigate('/student/jobs')}>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate"
                         style={{ color: 'var(--color-text-primary)' }}>
                        {job.title}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {job.company?.companyName}
                      </p>
                    </div>
                    <Badge variant="blue" className="ml-2 flex-shrink-0">
                      {job.jobType}
                    </Badge>
                  </div>
                  {job.skills && (
                    <p className="text-xs mt-1 truncate"
                       style={{ color: 'var(--color-text-muted)' }}>
                      {job.skills}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}

// ── Placeholder pages for other student routes ───────────
function ComingSoon({ title }) {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
             style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
          <Briefcase size={32} className="text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          This page is being built — coming in the next session
        </p>
      </div>
    </div>
  );
}

// ── Main Student Dashboard with nested routes ────────────
export default function StudentDashboard() {
  return (
    <DashboardLayout title="Student Dashboard">
      <Routes>
        <Route path="dashboard"    element={<StudentHome />} />
        <Route path="jobs"         element={<StudentJobs />} />
        <Route path="applications" element={<StudentApplications />} />
        <Route path="profile"   element={<StudentProfile />} />
        <Route path="settings"  element={<StudentSettings />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="*"            element={<StudentHome />} />
      </Routes>
    </DashboardLayout>
  );
}