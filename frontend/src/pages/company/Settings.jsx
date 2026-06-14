import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { Lock, Shield } from 'lucide-react';
import api from '../../utils/api';

export default function CompanySettings() {
  const { addToast }                          = useToast();
  const [passwords,    setPasswords         ] = useState({ current: '', newPass: '', confirm: '' });
  const [savingPass,   setSavingPass        ] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      addToast('New passwords do not match', 'error');
      return;
    }
    if (passwords.newPass.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setSavingPass(true);
    try {
      await api.put('/company/change-password', {
        currentPassword: passwords.current,
        newPassword:     passwords.newPass,
      });
      addToast('Password changed successfully!', 'success');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Settings
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Manage your account security
        </p>
      </div>

      <Card>
        <h3 className="font-semibold mb-1 flex items-center gap-2"
            style={{ color: 'var(--color-text-primary)' }}>
          <Lock size={18} style={{ color: '#3B82F6' }} />
          Change Password
        </h3>
        <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>
          Choose a strong password with at least 6 characters
        </p>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input label="Current Password"   type="password" value={passwords.current}
                 onChange={e => setPasswords({ ...passwords, current:  e.target.value })}
                 placeholder="Enter current password" icon={Lock}    required />
          <Input label="New Password"       type="password" value={passwords.newPass}
                 onChange={e => setPasswords({ ...passwords, newPass:  e.target.value })}
                 placeholder="Enter new password"     icon={Shield}  required />
          <Input label="Confirm New Password" type="password" value={passwords.confirm}
                 onChange={e => setPasswords({ ...passwords, confirm:  e.target.value })}
                 placeholder="Confirm new password"   icon={Shield}  required />
          <Button type="submit" variant="primary" disabled={savingPass} icon={Lock}>
            {savingPass ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}