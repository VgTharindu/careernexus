import { useState, useEffect, useRef } from 'react';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  User, GraduationCap, Globe,
  Link2, GitBranch, Camera, Save, Plus, X,
  CheckCircle, Code
} from 'lucide-react';
import api from '../../utils/api';

// ── Profile completion calculator ───────────────────────
const getCompletion = (profile, userName) => {
  const fields = [
    userName,
    profile?.degree,
    profile?.university,
    profile?.bio,
    profile?.skills,
    profile?.linkedin,
    profile?.github,
    profile?.cvUrl,
    profile?.profileImage,
    profile?.jobPosition,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
};

export default function StudentProfile() {
  const { addToast }         = useToast();
  const { updateProfileImage } = useAuth();
  const fileInputRef                    = useRef();
  const [profile,   setProfile        ] = useState(null);
  const [userName,  setUserName       ] = useState('');
  const [loading,   setLoading        ] = useState(true);
  const [saving,    setSaving         ] = useState(false);
  const [uploading, setUploading      ] = useState(false);
  const [skillInput,setSkillInput     ] = useState('');
  const [skillsList,setSkillsList     ] = useState([]);

  const [form, setForm] = useState({
    degree:      '',
    university:  '',
    bio:         '',
    linkedin:    '',
    github:      '',
    jobPosition: '',
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res     = await api.get('/student/profile');
      const p       = res.data.profile;
      const uName   = p?.user?.name || '';
      setProfile(p);
      setUserName(uName);
      if (p) {
        setForm({
          degree:      p.degree      || '',
          university:  p.university  || '',
          bio:         p.bio         || '',
          linkedin:    p.linkedin    || '',
          github:      p.github      || '',
          jobPosition: p.jobPosition || '',
        });
        setSkillsList(p.skills ? p.skills.split(',').map(s => s.trim()).filter(Boolean) : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/student/profile', {
        ...form,
        skills: skillsList.join(', ')
      });
      addToast('Profile updated successfully!', 'success');
      fetchProfile();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      const res = await api.post('/student/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Update global auth context so topbar and sidebar refresh immediately
      updateProfileImage(res.data.imageUrl);
      addToast('Profile photo updated!', 'success');
      fetchProfile();
    } catch (err) {
      addToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

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

  const completion = getCompletion(profile, userName);

  const positions = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Mobile Developer', 'DevOps Engineer', 'Data Scientist',
    'UI/UX Designer', 'Software Engineer', 'QA Engineer'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">

      {/* Profile header card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start gap-6">

          {/* Avatar with upload button */}
          <div className="relative flex-shrink-0">
            {profile?.profileImage ? (
              <img
                src={`http://localhost:5000${profile.profileImage}`}
                alt="Profile"
                className="w-24 h-24 rounded-2xl object-cover ring-2 ring-blue-500/30"
              />
            ) : (
              <Avatar name={userName} size="xl" />
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}
              title="Change photo"
            >
              <Camera size={14} className="text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Name + completion */}
          <div className="flex-1 w-full">
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              {userName}
            </h2>
            <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
              {form.jobPosition || 'No position set'}
            </p>
            {profile?.user?.email && (
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
                {profile.user.email}
              </p>
            )}

            {/* Completion bar */}
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Profile Completion
                </span>
                <span className="text-xs font-bold" style={{ color: completion >= 80 ? '#10B981' : '#3B82F6' }}>
                  {completion}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-hover)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width:      `${completion}%`,
                    background: completion >= 80
                      ? 'linear-gradient(90deg, #10B981, #06B6D4)'
                      : 'linear-gradient(90deg, #3B82F6, #06B6D4)'
                  }}
                />
              </div>
              {completion < 100 && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Complete your profile to improve your AI match scores
                </p>
              )}
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-3">
              {form.linkedin && (
                <a href={form.linkedin} target="_blank" rel="noreferrer"
                   className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                   style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <Link2 size={13} /> LinkedIn
                </a>
              )}
              {form.github && (
                <a href={form.github} target="_blank" rel="noreferrer"
                   className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                   style={{ background: 'rgba(139,92,246,0.1)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <GitBranch size={13} /> GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Academic info */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <GraduationCap size={18} style={{ color: '#3B82F6' }} />
            Academic Information
          </h3>
          <div className="space-y-4">
            <Input
              label="Degree / Programme"
              value={form.degree}
              onChange={e => setForm({ ...form, degree: e.target.value })}
              placeholder="e.g. HND in Information Technology"
              icon={GraduationCap}
            />
            <Input
              label="University / Institute"
              value={form.university}
              onChange={e => setForm({ ...form, university: e.target.value })}
              placeholder="e.g. SLIATE Labuduwa"
              icon={Globe}
            />
            <div>
              <label className="block text-sm font-medium mb-1.5"
                     style={{ color: 'var(--color-text-secondary)' }}>
                Desired Job Position
              </label>
              <select
                value={form.jobPosition}
                onChange={e => setForm({ ...form, jobPosition: e.target.value })}
                className="w-full rounded-lg border px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
              >
                <option value="">Select position</option>
                {positions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </Card>

        {/* Professional links */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Globe size={18} style={{ color: '#06B6D4' }} />
            Professional Links
          </h3>
          <div className="space-y-4">
            <Input
              label="LinkedIn URL"
              value={form.linkedin}
              onChange={e => setForm({ ...form, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/yourname"
              icon={Link2}
            />
            <Input
              label="GitHub URL"
              value={form.github}
              onChange={e => setForm({ ...form, github: e.target.value })}
              placeholder="https://github.com/yourname"
              icon={GitBranch}
            />
            <div>
              <label className="block text-sm font-medium mb-1.5"
                     style={{ color: 'var(--color-text-secondary)' }}>
                Bio / About Me
              </label>
              <textarea
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                placeholder="Write a short professional bio about yourself..."
                rows={4}
                className="w-full rounded-lg border px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                style={{
                  background:   'var(--color-bg-secondary)',
                  color:        'var(--color-text-primary)',
                  borderColor:  'var(--color-border)',
                }}
              />
            </div>
          </div>
        </Card>

      </div>

      {/* Skills section */}
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <Code size={18} style={{ color: '#8B5CF6' }} />
          Skills & Technologies
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Add your programming languages, frameworks, and tools. These are used by the AI to match you with relevant jobs.
        </p>

        {/* Skill tags */}
        <div className="flex flex-wrap gap-2 mb-4 min-h-10">
          {skillsList.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No skills added yet</p>
          ) : (
            skillsList.map(skill => (
              <div
                key={skill}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Quick add buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['React', 'Node.js', 'Python', 'JavaScript', 'Java', 'C#', 'Flutter', 'MySQL', 'MongoDB', 'PHP'].map(s => (
            !skillsList.includes(s) && (
              <button
                key={s}
                onClick={() => setSkillsList(prev => [...prev, s])}
                className="text-xs px-2.5 py-1 rounded-full transition-colors"
                style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              >
                + {s}
              </button>
            )
          ))}
        </div>

        {/* Custom skill input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
            placeholder="Type a skill and press Enter..."
            className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
          />
          <Button variant="outline" size="md" icon={Plus} onClick={addSkill}>
            Add
          </Button>
        </div>
      </Card>

      {/* Save button */}
      <div className="flex justify-end pb-6">
        <Button
          variant="primary"
          size="lg"
          icon={Save}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

    </div>
  );
}