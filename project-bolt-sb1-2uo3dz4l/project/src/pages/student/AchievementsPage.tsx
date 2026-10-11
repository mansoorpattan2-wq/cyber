import {
  Trophy, BookOpen, GraduationCap, Library, Award, ClipboardCheck, Brain,
  Star, Compass, Scale, Search, Eye, Timer, Bookmark, Lock,
} from 'lucide-react';
import { achievements } from '@/lib/data';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { cn, getTierColor } from '@/lib/utils';

const iconMap: Record<string, typeof Trophy> = {
  BookOpen, GraduationCap, Library, Award, ClipboardCheck, Brain,
  Star, Compass, Scale, Search, Eye, Timer, Bookmark, Trophy,
};

export function AchievementsPage() {
  const { unlockedAchievements, stats } = useData();
  const { user } = useAuth();

  if (!user) return null;

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Achievements</h1>
          <p className="text-sm text-slate-400 mt-1">Earn badges by completing cybersecurity activities</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-100">{unlockedCount}/{totalCount}</p>
          <p className="text-xs text-slate-500">Unlocked</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-200">Overall Progress</span>
          <span className="text-sm text-slate-400">{Math.round((unlockedCount / totalCount) * 100)}%</span>
        </div>
        <div className="h-3 rounded-full bg-slate-700/50 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500" style={{ width: `${(unlockedCount / totalCount) * 100}%` }} />
        </div>
      </div>

      {/* Achievement grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map(ach => {
          const unlocked = unlockedAchievements.includes(ach.id);
          const Icon = iconMap[ach.icon] || Trophy;
          return (
            <div
              key={ach.id}
              className={cn(
                'card p-5 text-center transition-all',
                unlocked ? 'card-hover' : 'opacity-60'
              )}
            >
              <div className={cn(
                'w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-all',
                unlocked
                  ? `bg-gradient-to-br ${getTierColor(ach.tier)} shadow-lg`
                  : 'bg-slate-800'
              )}>
                {unlocked ? <Icon className="w-8 h-8 text-white" /> : <Lock className="w-7 h-7 text-slate-600" />}
              </div>
              <h3 className={cn('font-semibold', unlocked ? 'text-slate-100' : 'text-slate-500')}>{ach.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{ach.description}</p>
              <div className="mt-3">
                <span className={cn(
                  'text-xs font-medium uppercase tracking-wide',
                  ach.tier === 'gold' ? 'text-yellow-400' : ach.tier === 'silver' ? 'text-slate-300' : 'text-amber-600'
                )}>
                  {ach.tier}
                </span>
              </div>
              {unlocked && (
                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-green-400">
                  <Award className="w-3 h-3" /> Unlocked
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Your Activity Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.completedModules}</p>
              <p className="text-xs text-slate-500">Modules Done</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{stats.completedQuizzes}</p>
              <p className="text-xs text-slate-500">Quizzes Done</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">{stats.completedScenarios}</p>
              <p className="text-xs text-slate-500">Scenarios</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-400">{stats.phishingDetectiveScore}%</p>
              <p className="text-xs text-slate-500">Phishing Score</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
