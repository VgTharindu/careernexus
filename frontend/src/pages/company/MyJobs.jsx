import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  Briefcase, PlusCircle, Users, Clock,
  Edit, Trash2, Eye, CheckCircle, AlertCircle
} from 'lucide-react';
import api from '../../utils/api';

export default function MyJobs() {
  const navigate          = useNavigate();
  const { addToast }      = useToast();
  const [jobs,    setJobs   ] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/company/mine');
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    setDeleting(jobId);
    try {
      await api.delete(`/jobs/${jobId}`);
      addToast('Job listing deleted', 'success');
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete job', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (job) => {
    const isExpired = new Date(job.deadline) < new Date();
    if (isExpired)       return { variant: 'red',    label: 'Expired'  };
    if (!job.isApproved) return { variant: 'yellow', label: 'Pending'  };
    return                      { variant: 'green',  label: 'Active'   };
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 fade-in">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            My Job Listings
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {jobs.length} listing{jobs.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button variant="primary" icon={PlusCircle}
                onClick={() => navigate('/company/post-job')}>
          Post New Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <Briefcase size={48} className="mx-auto mb-4 opacity-20"
                       style={{ color: 'var(--color-text-muted)' }} />
            <h3 className="font-semibold mb-2"
                style={{ color: 'var(--color-text-primary)' }}>
              No jobs posted yet
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Post your first job to start receiving applications
            </p>
            <Button variant="primary" icon={PlusCircle}
                    onClick={() => navigate('/company/post-job')}>
              Post a Job
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => {
            const status    = getStatusBadge(job);
            const isExpired = new Date(job.deadline) < new Date();
            const daysLeft  = Math.ceil((new Date(job.deadline) - new Date()) / 86400000);

            return (
              <Card key={job.id} hover>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-base"
                          style={{ color: 'var(--color-text-primary)' }}>
                        {job.title}
                      </h3>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Badge variant="blue">{job.jobType}</Badge>
                    </div>

                    <p className="text-sm line-clamp-2 mb-3"
                       style={{ color: 'var(--color-text-secondary)' }}>
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs"
                         style={{ color: 'var(--color-text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <Users size={13} />
                        {job._count?.applications || 0} applicants
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {isExpired
                          ? 'Expired'
                          : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                      </span>
                      {job.stipend && (
                        <span>💰 {job.stipend}</span>
                      )}
                    </div>

                    {job.skills && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 4).map(skill => (
                          <span key={skill}
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA' }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => navigate('/company/applicants', { state: { jobId: job.id } })}
                    >
                      Applicants
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDelete(job.id)}
                      disabled={deleting === job.id}
                    >
                      {deleting === job.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}