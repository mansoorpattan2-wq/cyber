import { useState } from 'react';
import { User, Mail, Phone, GraduationCap, BookOpen, Building, Calendar, Edit, Save, X, Shield, Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/utils';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { stats, unlockedAchievements } = useData();
  const { showToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [university, setUniversity] = useState(user?.university ?? '');
  const [major, setMajor] = useState(user?.major ?? '');
  const [year, setYear] = useState(user?.year ?? '');
  const [errors, setErrors] = useState<{ name?: string }>({});

  if (!user) return null;

  const handleSave = () => {
    if (!name.trim()) { setErrors({ name: 'Name is required' }); return; }
    if (name.trim().length < 2) { setErrors({ name: 'Name must be at least 2 characters' }); return; }
    updateUser({ name: name.trim(), bio, university, major, year });
    setEditing(false);
    showToast('Profile updated successfully', 'success');
  };

  const handleCancel = () => {
    setName(user.name);
    setBio(user.bio ?? '');
    setUniversity(user.university ?? '');
    setMajor(user.major ?? '');
    setYear(user.year ?? '');
    setErrors({});
    setEditing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Profile</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account information</p>
      </div>

      {/* Profile header */}
      <div className="card p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-100">{user.name}</h2>
            <p className="text-sm text-slate-400">{user.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-blue-400" /> Student</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {formatDate(user.createdAt)}</span>
              <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-amber-400" /> {unlockedAchievements.length} achievements</span>
            </div>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary">
              <Edit className="w-4 h-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary">
                <Save className="w-4 h-4" /> Save
              </button>
              <button onClick={handleCancel} className="btn-secondary">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile details */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Personal Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field icon={User} label="Full Name" value={user.name} editing={editing} editValue={name} onEdit={setName} error={errors.name} />
          <Field icon={Mail} label="Email" value={user.email} editing={false} />
          <Field icon={Building} label="University" value={user.university || 'Not set'} editing={editing} editValue={university} onEdit={setUniversity} placeholder="Your university" />
          <Field icon={BookOpen} label="Major/Course" value={user.major || 'Not set'} editing={editing} editValue={major} onEdit={setMajor} placeholder="Your major" />
          <Field icon={GraduationCap} label="Year" value={user.year || 'Not set'} editing={editing} editValue={year} onEdit={setYear} placeholder="e.g. 2nd Year" />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="input-field resize-none"
            />
          ) : (
            <p className="text-sm text-slate-400">{user.bio || 'No bio set yet.'}</p>
          )}
        </div>
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Learning Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Modules" value={stats.completedModules} />
            <Stat label="Quizzes" value={stats.completedQuizzes} />
            <Stat label="Scenarios" value={stats.completedScenarios} />
            <Stat label="Achievements" value={unlockedAchievements.length} />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ icon: Icon, label, value, editing, editValue, onEdit, error, placeholder }: {
  icon: typeof User; label: string; value: string; editing: boolean; editValue?: string; onEdit?: (v: string) => void; error?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      {editing && onEdit ? (
        <>
          <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={editValue}
              onChange={(e) => onEdit(e.target.value)}
              placeholder={placeholder}
              className={`input-field pl-10 ${error ? 'border-red-500/50' : ''}`}
            />
          </div>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5">
          <Icon className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-300">{value}</span>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
