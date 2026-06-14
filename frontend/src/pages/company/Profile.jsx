import { useState, useEffect, useRef } from 'react';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import {
  Building2, Globe, MapPin, Users, Camera,
  Save, Plus, X, Image, Briefcase
} from 'lucide-react';
import api from '../../utils/api';

const COMPANY_SIZES = [
  '1-10 employees', '11-50 employees', '51-200 employees',
  '201-500 employees', '501-1000 employees', '1000+ employees'
];

const INDUSTRIES = [
  'Software Development', 'Information Technology', 'Fintech',
  'E-Commerce', 'Healthcare Technology', 'Education Technology',
  'Telecommunications', 'Cybersecurity', 'Cloud Computing',
  'Artificial Intelligence', 'Digital Marketing', 'Other'
];

export default function CompanyProfile() {
  const { addToast }                    = useToast();
  const { updateProfileImage } = useAuth();
  const logoInputRef                    = useRef();
  const photoInputRef                   = useRef();
  const [profile,   setProfile        ] = useState(null);
  const [loading,   setLoading        ] = useState(true);
  const [saving,    setSaving         ] = useState(false);
  const [uploading, setUploading      ] = useState(false);
  const [photos,    setPhotos         ] = useState([]);

  const [form, setForm] = useState({
    companyName: '',
    industry:    '',
    website:     '',
    description: '',
    location:    '',
    size:        '',
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/company/profile');
      const p   = res.data.profile;
      setProfile(p);
      if (p) {
        setForm({
          companyName: p.companyName  || '',
          industry:    p.industry     || '',
          website:     p.website      || '',
          description: p.description  || '',
          location:    p.location     || '',
          size:        p.size         || '',
        });
        setPhotos(p.photos ? JSON.parse(p.photos) : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.companyName.trim()) {
      addToast('Company name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.put('/company/profile', form);
      addToast('Profile updated successfully!', 'success');
      fetchProfile();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await api.post('/company/profile/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Update global auth context so topbar and sidebar refresh immediately
      updateProfileImage(res.data.logoUrl);
      addToast('Logo updated!', 'success');
      fetchProfile();
    } catch (err) {
      addToast('Failed to upload logo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (photos.length + files.length > 5) {
      addToast('Maximum 5 photos allowed', 'error');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('photos', f));
      const res = await api.post('/company/profile/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPhotos(res.data.photos || []);
      addToast('Photos uploaded!', 'success');
    } catch (err) {
      addToast('Failed to upload photos', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoUrl) => {
    try {
      const res = await api.delete('/company/profile/photos', {
        data: { photoUrl }
      });
      setPhotos(res.data.photos || []);
      addToast('Photo removed', 'info');
    } catch (err) {
      addToast('Failed to remove photo', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">

      {/* Profile header */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start gap-6">

          {/* Logo upload */}
          <div className="relative flex-shrink-0">
            {profile?.logoUrl ? (
              <img
                src={`http://localhost:5000${profile.logoUrl}`}
                alt="Company logo"
                className="w-24 h-24 rounded-2xl object-cover ring-2 ring-blue-500/30"
              />
            ) : (
              <Avatar name={form.companyName || 'Company'} size="xl" />
            )}
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}
              title="Change logo"
            >
              <Camera size={14} className="text-white" />
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1"
                style={{ color: 'var(--color-text-primary)' }}>
              {form.companyName || 'Your Company'}
            </h2>
            <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
              {form.industry || 'No industry set'}
            </p>
            {form.location && (
              <p className="text-sm flex items-center gap-1"
                 style={{ color: 'var(--color-text-muted)' }}>
                <MapPin size={13} /> {form.location}
              </p>
            )}
            <div className="mt-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                profile?.isApproved
                  ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                  : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
              }`}>
                {profile?.isApproved ? '✓ Verified Company' : '⏳ Pending Verification'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Company details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-text-primary)' }}>
            <Building2 size={18} style={{ color: '#3B82F6' }} />
            Company Information
          </h3>
          <div className="space-y-4">
            <Input
              label="Company Name"
              value={form.companyName}
              onChange={e => setForm({ ...form, companyName: e.target.value })}
              placeholder="Your company name"
              icon={Building2}
              required
            />
            <div>
              <label className="block text-sm font-medium mb-1.5"
                     style={{ color: 'var(--color-text-secondary)' }}>
                Industry
              </label>
              <select
                value={form.industry}
                onChange={e => setForm({ ...form, industry: e.target.value })}
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <Input
              label="Website"
              value={form.website}
              onChange={e => setForm({ ...form, website: e.target.value })}
              placeholder="https://yourcompany.com"
              icon={Globe}
            />
            <Input
              label="Location"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Colombo, Sri Lanka"
              icon={MapPin}
            />
            <div>
              <label className="block text-sm font-medium mb-1.5"
                     style={{ color: 'var(--color-text-secondary)' }}>
                Company Size
              </label>
              <select
                value={form.size}
                onChange={e => setForm({ ...form, size: e.target.value })}
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
              >
                <option value="">Select size</option>
                {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-text-primary)' }}>
            <Globe size={18} style={{ color: '#06B6D4' }} />
            About the Company
          </h3>
          <div>
            <label className="block text-sm font-medium mb-1.5"
                   style={{ color: 'var(--color-text-secondary)' }}>
              Company Description
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Tell students about your company, culture, mission and what makes you a great place to work..."
              rows={12}
              className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              This description is visible to students when they click your company name
            </p>
          </div>
        </Card>
      </div>

      {/* Photo gallery */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2"
                style={{ color: 'var(--color-text-primary)' }}>
              <Image size={18} style={{ color: '#8B5CF6' }} />
              Company Photos
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Upload up to 5 photos of your office, team, or culture — {5 - photos.length} remaining
            </p>
          </div>
          {photos.length < 5 && (
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => photoInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Add Photos'}
            </Button>
          )}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        {photos.length === 0 ? (
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}
            onClick={() => photoInputRef.current?.click()}
          >
            <Image size={32} className="mx-auto mb-3 opacity-30"
                   style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Click to upload company photos
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              JPEG, PNG or WebP — max 3MB each
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square">
                <img
                  src={`http://localhost:5000${photo}`}
                  alt={`Company photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDeletePhoto(photo)}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              </div>
            ))}
            {photos.length < 5 && (
              <div
                className="border-2 border-dashed rounded-xl aspect-square flex items-center justify-center cursor-pointer transition-colors"
                style={{ borderColor: 'var(--color-border)' }}
                onClick={() => photoInputRef.current?.click()}
              >
                <Plus size={24} style={{ color: 'var(--color-text-muted)' }} />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Save button */}
      <div className="flex justify-end pb-6">
        <Button variant="primary" size="lg" icon={Save}
                onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

    </div>
  );
}