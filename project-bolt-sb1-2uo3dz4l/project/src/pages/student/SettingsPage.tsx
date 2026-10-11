import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon, Moon, Sun, Bell, Shield, LogOut, User,
  Mail, Lock, Eye, EyeOff, Check, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { ConfirmModal } from '@/components/Modal';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleSetting = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
    showToast(`${key} updated`, 'success');
  };

  const handleDeleteAccount = () => {
    // Demo: just logout and redirect
    logout();
    showToast('Account deleted (demo). Your session has been cleared.', 'info');
    navigate('/login');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Appearance */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-slate-400" /> Appearance
        </h2>
        <div className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
            <div>
              <p className="text-sm font-medium text-slate-200">Theme</p>
              <p className="text-xs text-slate-500">Switch between dark and light mode</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors',
              theme === 'dark' ? 'bg-blue-500' : 'bg-slate-600'
            )}
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label="Toggle dark mode"
          >
            <span className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
              theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
            )} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-slate-400" /> Notification Preferences
        </h2>
        <div className="space-y-3">
          <ToggleRow label="Email Notifications" desc="Receive notifications via email" checked={settings.emailNotifications} onToggle={() => handleToggleSetting('emailNotifications')} />
          <ToggleRow label="Push Notifications" desc="In-app notification alerts" checked={settings.pushNotifications} onToggle={() => handleToggleSetting('pushNotifications')} />
          <ToggleRow label="Weekly Digest" desc="Summary of your weekly progress" checked={settings.weeklyDigest} onToggle={() => handleToggleSetting('weeklyDigest')} />
          <ToggleRow label="Auto-play Videos" desc="Automatically play video content" checked={settings.autoPlayVideos} onToggle={() => handleToggleSetting('autoPlayVideos')} />
        </div>
      </div>

      {/* Security */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-400" /> Security
        </h2>
        <div className="space-y-3">
          <InfoRow icon={User} label="Account Type" value="Student" />
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={Lock} label="Password" value="••••••••" />
          <InfoRow icon={Shield} label="Account Status" value="Active" />
          <InfoRow icon={Check} label="Email Verified" value="Demo (Not required)" />
        </div>
        <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
          <p className="text-xs text-yellow-400/80 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            This is a frontend demo. No real authentication backend is connected. Security settings shown here reflect the current demo state.
          </p>
        </div>
      </div>

      {/* Account */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-slate-400" /> Account
        </h2>
        <div className="space-y-3">
          <button onClick={() => navigate('/student/profile')} className="w-full flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-3 hover:bg-slate-800/60 transition-colors text-left">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-200">Edit Profile</span>
            </div>
            <span className="text-xs text-slate-500">→</span>
          </button>
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-3 hover:bg-slate-800/60 transition-colors text-left">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-slate-200">Logout</span>
            </div>
            <span className="text-xs text-slate-500">→</span>
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 hover:bg-red-500/10 transition-colors text-left">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-red-400" />
              <span className="text-sm text-red-400">Delete Account</span>
            </div>
            <span className="text-xs text-red-400/50">→</span>
          </button>
        </div>
      </div>

      <ConfirmModal open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} onConfirm={handleLogout} title="Logout" message="Are you sure you want to log out? Your progress is saved." confirmLabel="Logout" variant="danger" />
      <ConfirmModal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDeleteAccount} title="Delete Account" message="This will permanently delete your demo account and all associated data. This action cannot be undone." confirmLabel="Delete" variant="danger" />
    </div>
  );
}

function ToggleRow({ label, desc, checked, onToggle }: { label: string; desc: string; checked: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={cn('relative w-12 h-6 rounded-full transition-colors', checked ? 'bg-blue-500' : 'bg-slate-600')}
        role="switch"
        aria-checked={checked}
        aria-label={`Toggle ${label}`}
      >
        <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform', checked ? 'translate-x-6' : 'translate-x-0')} />
      </button>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-slate-500" />
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      <span className="text-sm text-slate-400">{value}</span>
    </div>
  );
}
