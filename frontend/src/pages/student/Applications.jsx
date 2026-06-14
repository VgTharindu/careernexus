import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { FileText, Clock, CheckCircle, XCircle, TrendingUp, Building2, Calendar } from 'lucide-react';
import api from '../../utils/api';

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading     ] = useState(true);
  const [filter,       setFilter      ] = useState('all');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    pending:     { color: 'yellow', icon: Clock,       label: 'Pending Review'  },
    shortlisted: { color: 'green',  icon: TrendingUp,  label: 'Shortlisted'     },
    hired:       { color: 'blue',   icon: CheckCircle, label: 'Hired'           },
    rejected:    { color: 'red',    icon: XCircle,     label: 'Not Selected'    },
  };

  const filters = ['all', 'pending', 'shortlisted', 'hired', 'rejected'];

  const filtered = filter === 'all'
    ? applications
    : applications.filter(a => a.status === filter);

  const stats = {
    total:       applications.length,
    pending:     applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    hired:       applications.filter(a => a.status === 'hired').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applied',  value: stats.total,       color: '#3B82F6' },
          { label: 'Under Review',   value: stats.pending,     color: '#F59E0B' },
          { label: 'Shortlisted',    value: stats.shortlisted, color: '#10B981' },
          { label: 'Hired',          value: stats.hired,       color: '#06B6D4' },
        ].map(s => (
          <Card key={s.label}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize"
            style={{
              background: filter === f ? '#3B82F6' : 'var(--color-bg-card)',
              color:      filter === f ? 'white' : 'var(--color-text-secondary)',
              border:     `1px solid ${filter === f ? '#3B82F6' : 'var(--color-border)'}`,
            }}
          >
            {f === 'all' ? `All (${stats.total})` : f}
          </button>
        ))}
      </div>

      {/* Applications list */}
      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <FileText size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--color-text-muted)' }} />
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              No applications yet
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {filter === 'all' ? 'Browse jobs and start applying!' : `No ${filter} applications`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(app => {
            const config = statusConfig[app.status] || statusConfig.pending;
            const Icon   = config.icon;

            return (
              <Card key={app.id} hover>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Status icon */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: `rgba(59,130,246,0.1)` }}>
                      <Icon size={20} style={{ color: '#3B82F6' }} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {app.job?.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 size={13} style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          {app.job?.company?.companyName}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                          <Calendar size={12} />
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                        {app.aiScore !== null && app.aiScore !== undefined && (
                          <span className="text-xs font-bold flex items-center gap-1"
                                style={{ color: '#06B6D4' }}>
                            🤖 AI Score: {app.aiScore}/100
                          </span>
                        )}
                        <Badge variant="blue" className="text-xs">
                          {app.job?.jobType}
                        </Badge>
                      </div>

                      {/* AI Feedback */}
                      {app.aiFeedback && (() => {
                        try {
                          const fb = typeof app.aiFeedback === 'string'
                            ? JSON.parse(app.aiFeedback)
                            : app.aiFeedback;
                          return fb?.feedback?.length > 0 ? (
                            <div className="mt-3 p-3 rounded-lg"
                                 style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                              <p className="text-xs font-medium mb-1.5" style={{ color: '#60A5FA' }}>
                                AI Feedback
                              </p>
                              <ul className="space-y-1">
                                {fb.feedback.slice(0, 2).map((f, i) => (
                                  <li key={i} className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                    • {f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null;
                        } catch { return null; }
                      })()}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex-shrink-0">
                    <Badge variant={config.color}>
                      {config.label}
                    </Badge>
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