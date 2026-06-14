import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import CVPreview from '../../components/ui/CVPreview';
import {
  Users, ChevronDown, X, Briefcase,
  GitBranch, Link2, Globe, Mail,
  Download, Eye, CheckCircle, XCircle,
  TrendingUp, Clock, FileText
} from 'lucide-react';
import api from '../../utils/api';

// ── Student profile modal ────────────────────────────────
function StudentModal({ application, onClose }) {
  if (!application) return null;
  const p     = application.studentProfile;
  const user  = application.user;

  const imageBase = 'http://localhost:5000';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.75)' }}
         onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden fade-in"
           style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--color-border)', background: 'linear-gradient(135deg, #1E3A5F, #0F2942)' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {p?.profileImage ? (
                <img src={`${imageBase}${p.profileImage}`} alt={user?.name}
                     className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/40" />
              ) : (
                <Avatar name={user?.name} size="lg" />
              )}
              <div>
                <h3 className="font-bold text-lg text-white">{user?.name}</h3>
                <p className="text-sm" style={{ color: '#94A3B8' }}>{user?.email}</p>
                {p?.jobPosition && (
                  <p className="text-xs mt-1" style={{ color: '#60A5FA' }}>{p.jobPosition}</p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* AI Score */}
          {application.aiScore !== null && application.aiScore !== undefined && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full overflow-hidden"
                   style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full transition-all"
                     style={{ width: `${application.aiScore}%`, background: 'linear-gradient(90deg, #3B82F6, #06B6D4)' }} />
              </div>
              <span className="text-sm font-bold text-white">
                {application.aiScore}/100
              </span>
              <span className="text-xs" style={{ color: '#94A3B8' }}>AI Match</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-96 overflow-y-auto">

          {/* Academic info */}
          {(p?.degree || p?.university) && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-text-muted)' }}>Education</h4>
              {p?.degree     && <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{p.degree}</p>}
              {p?.university && <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{p.university}</p>}
            </div>
          )}

          {/* Bio */}
          {p?.bio && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-text-muted)' }}>About</h4>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {p.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {p?.skills && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-text-muted)' }}>Skills</h4>
              <div className="flex flex-wrap gap-2">
                {p.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                  <span key={skill}
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Feedback */}
          {application.aiFeedback?.feedback && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-text-muted)' }}>AI Assessment</h4>
              <div className="p-3 rounded-xl space-y-1.5"
                   style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                {application.aiFeedback.feedback.map((f, i) => (
                  <p key={i} className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    • {f}
                  </p>
                ))}
                {application.aiFeedback.summary && (
                  <p className="text-xs mt-2 pt-2 border-t italic"
                     style={{ color: '#60A5FA', borderColor: 'rgba(59,130,246,0.2)' }}>
                    {application.aiFeedback.summary}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Cover letter */}
          {application.coverLetter && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-text-muted)' }}>Cover Letter</h4>
              <p className="text-sm leading-relaxed"
                 style={{ color: 'var(--color-text-secondary)' }}>
                {application.coverLetter}
              </p>
            </div>
          )}

          {/* Links */}
          {(p?.linkedin || p?.github) && (
            <div className="flex gap-3">
              {p?.linkedin && (
                <a href={p.linkedin} target="_blank" rel="noreferrer"
                   className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                   style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <Link2 size={13} /> LinkedIn
                </a>
              )}
              {p?.github && (
                <a href={p.github} target="_blank" rel="noreferrer"
                   className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                   style={{ background: 'rgba(139,92,246,0.1)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <GitBranch size={13} /> GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Application card ─────────────────────────────────────
function AppCard({ app, onStatusUpdate, onViewProfile, onViewCV }) {
  const imageBase = 'http://localhost:5000';
  const p         = app.studentProfile;

  const scoreColor = app.aiScore >= 70 ? '#10B981' : app.aiScore >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="rounded-xl p-4 mb-3 transition-all"
         style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>

      {/* Student info */}
      <div className="flex items-center gap-3 mb-3">
        {p?.profileImage ? (
          <img src={p.profileImage.startsWith('http') ? p.profileImage : `http://localhost:5000${p.profileImage}`}
            alt="Profile"
            className="w-24 h-24 rounded-2xl object-cover"
            style={{ border: '2px solid rgba(0,123,255,0.3)' }} />
        ) : (
          <Avatar name={app.user?.name} size="sm" />
        )}
        <div className="min-w-0 flex-1">
          <button
            onClick={() => onViewProfile(app)}
            className="text-sm font-semibold hover:underline block truncate text-left"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {app.user?.name}
          </button>
          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
            {p?.degree || app.user?.email}
          </p>
        </div>
        {app.aiScore !== null && app.aiScore !== undefined && (
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold" style={{ color: scoreColor }}>
              {app.aiScore}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>AI score</p>
          </div>
        )}
      </div>

      {/* Skills preview */}
      {p?.skills && (
        <div className="flex flex-wrap gap-1 mb-3">
          {p.skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3).map(skill => (
            <span key={skill} className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(59,130,246,0.08)', color: '#60A5FA' }}>
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Applied date */}
      <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
        Applied {new Date(app.createdAt).toLocaleDateString()}
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={Eye} fullWidth
                  onClick={() => onViewProfile(app)}>
            Profile
          </Button>
          {app.cvUrl && (
            <Button variant="ghost" size="sm" icon={FileText} fullWidth
                    onClick={() => onViewCV(app)}>
              CV
            </Button>
          )}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onStatusUpdate(app.id, 'shortlisted')}
            disabled={app.status === 'shortlisted'}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: app.status === 'shortlisted' ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            Shortlist
          </button>
          <button
            onClick={() => onStatusUpdate(app.id, 'hired')}
            disabled={app.status === 'hired'}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: app.status === 'hired' ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            Hire
          </button>
          <button
            onClick={() => onStatusUpdate(app.id, 'rejected')}
            disabled={app.status === 'rejected'}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: app.status === 'rejected' ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Applicants page ─────────────────────────────────
export default function Applicants() {
  const location              = useLocation();
  const { addToast }          = useToast();
  const [jobs,         setJobs        ] = useState([]);
  const [selectedJob,  setSelectedJob ] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading     ] = useState(true);
  const [loadingApps,  setLoadingApps ] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [viewingCV,    setViewingCV   ] = useState(null);

  const columns = [
    { key: 'pending',     label: 'Pending',     color: '#F59E0B', icon: Clock       },
    { key: 'shortlisted', label: 'Shortlisted', color: '#10B981', icon: TrendingUp  },
    { key: 'hired',       label: 'Hired',       color: '#3B82F6', icon: CheckCircle },
    { key: 'rejected',    label: 'Rejected',    color: '#EF4444', icon: XCircle     },
  ];

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res  = await api.get('/jobs/company/mine');
      const list = res.data.jobs || [];
      setJobs(list);
      // Auto-select job from navigation state or first job
      const targetId = location.state?.jobId;
      const target   = targetId ? list.find(j => j.id === targetId) : list[0];
      if (target) selectJob(target);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectJob = async (job) => {
    setSelectedJob(job);
    setLoadingApps(true);
    try {
      const res = await api.get(`/applications/job/${job.id}`);
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      setApplications(prev =>
        prev.map(a => a.id === applicationId ? { ...a, status } : a)
      );
      addToast(`Application marked as ${status}`, 'success');
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 fade-in">

      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Applicants
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Select a job to view its applicants
        </p>
      </div>

      {/* Job selector */}
      <div className="flex gap-2 flex-wrap">
        {jobs.map(job => (
          <button
            key={job.id}
            onClick={() => selectJob(job)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background:  selectedJob?.id === job.id ? 'rgba(59,130,246,0.15)' : 'var(--color-bg-card)',
              color:       selectedJob?.id === job.id ? '#60A5FA' : 'var(--color-text-secondary)',
              border:      `1px solid ${selectedJob?.id === job.id ? '#3B82F6' : 'var(--color-border)'}`,
            }}
          >
            {job.title}
            <span className="ml-2 text-xs opacity-60">
              ({job._count?.applications || 0})
            </span>
          </button>
        ))}
      </div>

      {!selectedJob ? (
        <Card>
          <div className="text-center py-16">
            <Users size={48} className="mx-auto mb-4 opacity-20"
                   style={{ color: 'var(--color-text-muted)' }} />
            <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Select a job above to view applicants
            </p>
          </div>
        </Card>
      ) : loadingApps ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {columns.map(col => {
              const count = applications.filter(a => a.status === col.key).length;
              const Icon  = col.icon;
              return (
                <div key={col.key} className="rounded-xl p-3 text-center"
                     style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                  <Icon size={18} className="mx-auto mb-1" style={{ color: col.color }} />
                  <p className="text-2xl font-bold" style={{ color: col.color }}>{count}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{col.label}</p>
                </div>
              );
            })}
          </div>

          {/* Kanban columns */}
          {applications.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Users size={40} className="mx-auto mb-3 opacity-20"
                       style={{ color: 'var(--color-text-muted)' }} />
                <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  No applications yet for this job
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {columns.map(col => {
                const colApps = applications.filter(a => a.status === col.key);
                return (
                  <div key={col.key}>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                           style={{ background: col.color }} />
                      <h4 className="text-sm font-semibold"
                          style={{ color: 'var(--color-text-secondary)' }}>
                        {col.label}
                      </h4>
                      <span className="text-xs px-1.5 py-0.5 rounded-full ml-auto"
                            style={{ background: `${col.color}22`, color: col.color }}>
                        {colApps.length}
                      </span>
                    </div>

                    <div className="space-y-0 min-h-32">
                      {colApps.length === 0 ? (
                        <div className="rounded-xl p-4 text-center border-2 border-dashed"
                             style={{ borderColor: 'var(--color-border)' }}>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            No {col.label.toLowerCase()}
                          </p>
                        </div>
                      ) : (
                        colApps.map(app => (
                          <AppCard
                            key={app.id}
                            app={app}
                            onStatusUpdate={handleStatusUpdate}
                            onViewProfile={setViewingProfile}
                            onViewCV={setViewingCV}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {viewingProfile && (
        <StudentModal
          application={viewingProfile}
          onClose={() => setViewingProfile(null)}
        />
      )}
      {viewingCV && (
        <CVPreview
          cvUrl={viewingCV.cvUrl}
          studentName={viewingCV.user?.name}
          onClose={() => setViewingCV(null)}
        />
      )}
    </div>
  );
}