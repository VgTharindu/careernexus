import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import {
  Briefcase, Users, CheckCircle, TrendingUp,
  PlusCircle, Eye, Clock, Building2
} from 'lucide-react';
import api from '../../utils/api';
import CompanyProfile  from './Profile';
import CompanySettings from './Settings';
import PostJob    from './PostJob';
import MyJobs     from './MyJobs';
import Applicants from './Applicants';

// ── Company Home ─────────────────────────────────────────
function CompanyHome() {
  const { user, profileImage } = useAuth();
  const navigate                      = useNavigate();
  const [stats,      setStats       ] = useState({ jobs: 0, applicants: 0, shortlisted: 0, hired: 0 });
  const [recentJobs, setRecentJobs  ] = useState([]);
  const [loading,    setLoading     ] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        api.get('/company/stats'),
        api.get('/jobs/company/mine'),
      ]);
      setStats(statsRes.data.stats || { jobs: 0, applicants: 0, shortlisted: 0, hired: 0 });
      setRecentJobs((jobsRes.data.jobs || []).slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Jobs Posted',      value: stats.jobs,        icon: Briefcase,   color: '#007BFF', bg: 'rgba(0,123,255,0.12)'  },
    { label: 'Total Applicants', value: stats.applicants,  icon: Users,       color: '#00CCCC', bg: 'rgba(0,204,204,0.12)'  },
    { label: 'Shortlisted',      value: stats.shortlisted, icon: TrendingUp,  color: '#00C853', bg: 'rgba(0,200,83,0.12)'   },
    { label: 'Hired',            value: stats.hired,       icon: CheckCircle, color: '#007BFF', bg: 'rgba(0,123,255,0.12)'  },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 fade-in">

      {/* Welcome banner */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
           style={{background: 'linear-gradient(135deg, #001F3F 0%, #002040 60%, #001830 100%)',border:'1px solid rgba(0,204,204,0.2)',}}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)', transform: 'translate(30%,-30%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} src={profileImage} size="lg" />
            <div>
              <p className="text-sm" style={{ color: '#94A3B8' }}>Company Portal 🏢</p>
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <p className="text-sm mt-1" style={{ color: '#A78BFA' }}>
                {stats.applicants === 0
                  ? 'Post your first job to start receiving applications'
                  : `${stats.applicants} applicant${stats.applicants !== 1 ? 's' : ''} across ${stats.jobs} job${stats.jobs !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-3 flex-wrap">
            <Button variant="cyan"    size="sm" icon={PlusCircle} onClick={() => navigate('/company/post-job')}>
              Post New Job
            </Button>
            <Button variant="outline" size="sm" icon={Users}      onClick={() => navigate('/company/applicants')}>
              View Applicants
            </Button>
            <Button variant="outline" size="sm" icon={Building2}  onClick={() => navigate('/company/profile')}>
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                <p className="text-3xl font-bold" style={{ color }}>{value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={20} style={{ color }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent jobs */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Recent Job Listings
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/company/jobs')}>
            View all
          </Button>
        </div>
        {recentJobs.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase size={32} className="mx-auto mb-2 opacity-20"
                       style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
              No jobs posted yet
            </p>
            <Button variant="primary" size="sm" icon={PlusCircle}
                    onClick={() => navigate('/company/post-job')}>
              Post Your First Job
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentJobs.map(job => (
              <div key={job.id}
                   className="flex items-center justify-between p-3 rounded-xl"
                   style={{ background: 'var(--color-bg-hover)' }}>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate"
                     style={{ color: 'var(--color-text-primary)' }}>{job.title}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <Badge variant={job.isApproved ? 'green' : 'yellow'}>
                    {job.isApproved ? 'Active' : 'Pending'}
                  </Badge>
                  <Button variant="ghost" size="sm" icon={Eye}
                          onClick={() => navigate('/company/applicants')}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ComingSoon({ title }) {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
             style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
          <Briefcase size={32} className="text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2"
            style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Coming in the next session
        </p>
      </div>
    </div>
  );
}

export default function CompanyDashboard() {
  return (
    <DashboardLayout title="Company Dashboard">
      <Routes>
        <Route path="dashboard"  element={<CompanyHome />} />
        <Route path="post-job"   element={<PostJob />} />
        <Route path="jobs"       element={<MyJobs />} />
        <Route path="applicants" element={<Applicants />} />
        <Route path="profile"    element={<CompanyProfile />} />
        <Route path="settings"   element={<CompanySettings />} />
        <Route path="*"          element={<CompanyHome />} />
      </Routes>
    </DashboardLayout>
  );
}