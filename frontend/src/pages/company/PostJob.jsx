import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  Briefcase, FileText, Code, Clock,
  DollarSign, Send, ArrowLeft
} from 'lucide-react';
import api from '../../utils/api';

const JOB_TYPES = ['internship', 'part-time', 'full-time'];

const SKILL_SUGGESTIONS = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
  'Java', 'C#', 'PHP', 'Flutter', 'MySQL', 'MongoDB',
  'PostgreSQL', 'Docker', 'AWS', 'Git', 'REST API'
];

export default function PostJob() {
  const navigate          = useNavigate();
  const { addToast }      = useToast();
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skillsList, setSkillsList] = useState([]);

  const [form, setForm] = useState({
    title:       '',
    description: '',
    jobType:     'internship',
    stipend:     '',
    deadline:    '',
  });

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList(prev => [...prev, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setSkillsList(prev => prev.filter(s => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.deadline) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/jobs', {
        ...form,
        skills: skillsList.join(', ')
      });
      addToast('Job posted successfully! Waiting for admin approval.', 'success');
      navigate('/company/jobs');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to post job', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft}
                onClick={() => navigate('/company/jobs')}>
          Back to Jobs
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Post a New Job
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Your listing will be reviewed by admin before going live
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-text-primary)' }}>
            <Briefcase size={18} style={{ color: '#3B82F6' }} />
            Job Details
          </h3>
          <div className="space-y-4">
            <Input
              label="Job Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. React Developer Intern"
              icon={Briefcase}
              required
            />

            <div>
              <label className="block text-sm font-medium mb-1.5"
                     style={{ color: 'var(--color-text-secondary)' }}>
                Job Type <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3">
                {JOB_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, jobType: type })}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize"
                    style={{
                      background:  form.jobType === type ? '#3B82F6' : 'var(--color-bg-secondary)',
                      color:       form.jobType === type ? 'white' : 'var(--color-text-secondary)',
                      border:      `1px solid ${form.jobType === type ? '#3B82F6' : 'var(--color-border)'}`,
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5"
                     style={{ color: 'var(--color-text-secondary)' }}>
                Job Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the role, responsibilities, requirements and what the candidate will learn or achieve..."
                rows={8}
                required
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Stipend / Salary"
                value={form.stipend}
                onChange={e => setForm({ ...form, stipend: e.target.value })}
                placeholder="e.g. 15,000 LKR/month"
                icon={DollarSign}
              />
              <Input
                label="Application Deadline"
                type="date"
                value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
                icon={Clock}
                required
              />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--color-text-primary)' }}>
            <Code size={18} style={{ color: '#8B5CF6' }} />
            Required Skills
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
            These are used by the AI to match and score candidates accurately
          </p>

          {/* Skill tags */}
          <div className="flex flex-wrap gap-2 mb-4 min-h-8">
            {skillsList.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                No skills added yet
              </p>
            ) : (
              skillsList.map(skill => (
                <div key={skill}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                     style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
                  {skill}
                  <button onClick={() => removeSkill(skill)}
                          type="button"
                          className="hover:text-red-400 transition-colors">
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Quick add */}
          <div className="flex flex-wrap gap-2 mb-4">
            {SKILL_SUGGESTIONS.filter(s => !skillsList.includes(s)).slice(0, 8).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSkillsList(prev => [...prev, s])}
                className="text-xs px-2.5 py-1 rounded-full transition-colors"
                style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              >
                + {s}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Type a skill and press Enter..."
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
            <Button variant="outline" type="button" onClick={addSkill}>Add</Button>
          </div>
        </Card>

        {/* Info box */}
        <div className="p-4 rounded-xl"
             style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <p className="text-sm" style={{ color: '#60A5FA' }}>
            ℹ️ Your job listing will be reviewed by the CareerNexus admin team before appearing to students. This usually takes less than 24 hours.
          </p>
        </div>

        <div className="flex gap-3 pb-6">
          <Button variant="secondary" fullWidth onClick={() => navigate('/company/jobs')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth icon={Send} disabled={saving}>
            {saving ? 'Posting...' : 'Post Job Listing'}
          </Button>
        </div>

      </form>
    </div>
  );
}