import { useNavigate } from 'react-router-dom';
import {
  BookOpen, ClipboardList, Trophy, TrendingUp, Play, ChevronRight,
  Search, HelpCircle, Lightbulb, Shield, Award, Clock, Target,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { modules, achievements } from '@/lib/data';
import { getDifficultyColor, cn } from '@/lib/utils';

export function DashboardPage() {
  const { user } = useAuth();
  const { stats, unlockedAchievements, moduleProgress, isModuleComplete, isModuleBookmarked } = useData();
  const navigate = useNavigate();

  if (!user || !stats) return null;

  const totalModules = modules.length;
  const completionRate = Math.round((stats.completedModules / totalModules) * 100);
  const avgQuizScore = stats.completedQuizzes > 0
    ? Math.round(Object.values(stats.quizBestScores).reduce((a, b) => a + b, 0) / Object.values(stats.quizBestScores).length)
    : 0;

  // Find current module (first incomplete)
  const currentModule = modules.find(m => !isModuleComplete(m.id));

  const recentAchievements = achievements
    .filter(a => unlockedAchievements.includes(a.id))
    .slice(-3);

  const continueLearning = currentModule || modules[0];

  const quickActions = [
    { label: 'Phishing Detective', desc: 'Spot the scams', icon: Search, path: '/student/phishing-detective', color: 'from-blue-500 to-cyan-500' },
    { label: 'What Would You Do?', desc: 'Real scenarios', icon: HelpCircle, path: '/student/scenarios', color: 'from-emerald-500 to-teal-500' },
    { label: 'Security Tips', desc: 'Stay protected', icon: Lightbulb, path: '/student/security-tips', color: 'from-amber-500 to-orange-500' },
    { label: 'Mock Tests', desc: 'Test yourself', icon: Target, path: '/student/mock-tests', color: 'from-rose-500 to-pink-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-sm text-slate-400 mt-1">Continue building your cybersecurity skills</p>
        </div>
        <button onClick={() => navigate('/student/modules')} className="btn-primary">
          <BookOpen className="w-4 h-4" /> Browse Modules
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Modules Completed" value={`${stats.completedModules}/${totalModules}`} sub={`${completionRate}% complete`} color="blue" onClick={() => navigate('/student/modules')} />
        <StatCard icon={ClipboardList} label="Quizzes Passed" value={String(stats.completedQuizzes)} sub={`Avg: ${avgQuizScore}%`} color="emerald" onClick={() => navigate('/student/quizzes')} />
        <StatCard icon={Trophy} label="Achievements" value={String(unlockedAchievements.length)} sub={`of ${achievements.length}`} color="amber" onClick={() => navigate('/student/achievements')} />
        <StatCard icon={TrendingUp} label="Total Score" value={String(stats.totalScore)} sub="Points earned" color="rose" onClick={() => navigate('/student/progress')} />
      </div>

      {/* Continue Learning + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Continue Learning</h2>
            <button onClick={() => navigate('/student/modules')} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div
            onClick={() => navigate(`/student/modules/${continueLearning.id}`)}
            className="group cursor-pointer rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('badge', getDifficultyColor(continueLearning.difficulty))}>{continueLearning.difficulty}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {continueLearning.duration}</span>
                </div>
                <h3 className="font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">{continueLearning.title}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{continueLearning.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${isModuleComplete(continueLearning.id) ? 100 : 0}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{isModuleComplete(continueLearning.id) ? 'Completed' : 'Not started'}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
            </div>
          </div>

          {/* Module progress list */}
          <div className="mt-4 space-y-2">
            {modules.slice(0, 4).map(m => {
              const completed = isModuleComplete(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => navigate(`/student/modules/${m.id}`)}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                    completed ? 'bg-green-500/20 text-green-400' : 'bg-slate-700/50 text-slate-500'
                  )}>
                    {completed ? <BookOpen className="w-4 h-4" /> : <span className="text-xs font-semibold">{m.order}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium truncate', completed ? 'text-slate-300' : 'text-slate-400')}>{m.title}</p>
                  </div>
                  {isModuleBookmarked(m.id) && <BookOpen className="w-3.5 h-3.5 text-blue-400" />}
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 hover:border-slate-600/60 hover:bg-slate-800/60 transition-all text-left group"
                >
                  <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0', action.color)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{action.label}</p>
                    <p className="text-xs text-slate-500">{action.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent achievements + progress overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Recent Achievements</h2>
            <button onClick={() => navigate('/student/achievements')} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {recentAchievements.length > 0 ? (
            <div className="space-y-3">
              {recentAchievements.map(ach => {
                const Icon = (achievements as unknown as Record<string, unknown>)[ach.icon] as typeof Award || Award;
                return (
                  <div key={ach.id} className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/40 p-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{ach.title}</p>
                      <p className="text-xs text-slate-500">{ach.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No achievements yet</p>
              <p className="text-xs text-slate-500 mt-1">Complete modules and quizzes to earn badges</p>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Progress Overview</h2>
          <div className="space-y-4">
            <ProgressBar label="Modules" value={stats.completedModules} max={totalModules} color="from-blue-500 to-cyan-500" />
            <ProgressBar label="Quizzes" value={stats.completedQuizzes} max={totalModules} color="from-emerald-500 to-teal-500" />
            <ProgressBar label="Scenarios" value={stats.completedScenarios} max={6} color="from-amber-500 to-orange-500" />
            <ProgressBar label="Phishing Detective" value={stats.phishingDetectiveScore} max={100} suffix="%" color="from-rose-500 to-pink-500" />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Cybersecurity awareness level: {completionRate >= 75 ? 'Advanced' : completionRate >= 50 ? 'Intermediate' : completionRate >= 25 ? 'Beginner' : 'Novice'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, onClick }: {
  icon: typeof BookOpen; label: string; value: string; sub: string; color: 'blue' | 'emerald' | 'amber' | 'rose'; onClick: () => void;
}) {
  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    emerald: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
    rose: 'from-rose-500 to-pink-500',
  };
  return (
    <button onClick={onClick} className="card card-hover p-5 text-left">
      <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', colors[color])}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </button>
  );
}

function ProgressBar({ label, value, max, color, suffix = '' }: { label: string; value: number; max: number; color: string; suffix?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm font-medium text-slate-400">{value}/{max}{suffix}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
        <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
