import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, BookOpen, ClipboardList, Video, Search, HelpCircle,
  Award, Trophy, Clock, Target, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { modules, quizzes, scenarios, phishingMessages, videos } from '@/lib/data';
import { cn, formatDate, formatTime } from '@/lib/utils';

export function ProgressPage() {
  const { user } = useAuth();
  const {
    stats, unlockedAchievements, moduleProgress, quizResults, mockTestResults,
    isModuleComplete, isVideoCompleted, isScenarioCompleted, videoProgress, scenarioProgress,
  } = useData();
  const navigate = useNavigate();

  if (!user || !stats) return null;

  const totalModules = modules.length;
  const moduleCompletionRate = Math.round((stats.completedModules / totalModules) * 100);
  const avgQuizScore = stats.completedQuizzes > 0
    ? Math.round(Object.values(stats.quizBestScores).reduce((a, b) => a + b, 0) / Object.values(stats.quizBestScores).length)
    : 0;
  const avgMockScore = mockTestResults.length > 0
    ? Math.round(mockTestResults.reduce((a, r) => a + r.percentage, 0) / mockTestResults.length)
    : 0;
  const videoCompletionRate = Math.round((videoProgress.length / videos.length) * 100);
  const scenarioCompletionRate = Math.round((scenarioProgress.length / scenarios.length) * 100);

  // Topic performance from quiz results
  const topicPerf: Record<string, { correct: number; total: number }> = {};
  quizResults.forEach(r => {
    if (r.topicPerformance) {
      Object.entries(r.topicPerformance).forEach(([topic, perf]) => {
        if (!topicPerf[topic]) topicPerf[topic] = { correct: 0, total: 0 };
        topicPerf[topic].correct += perf.correct;
        topicPerf[topic].total += perf.total;
      });
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Your Progress</h1>
        <p className="text-sm text-slate-400 mt-1">Track your cybersecurity learning journey</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ProgressCard icon={BookOpen} label="Modules" value={`${moduleCompletionRate}%`} sub={`${stats.completedModules}/${totalModules} done`} color="blue" onClick={() => navigate('/student/modules')} />
        <ProgressCard icon={ClipboardList} label="Quizzes" value={`${avgQuizScore}%`} sub={`${stats.completedQuizzes} taken`} color="emerald" onClick={() => navigate('/student/quizzes')} />
        <ProgressCard icon={Target} label="Mock Tests" value={`${avgMockScore}%`} sub={`${mockTestResults.length} taken`} color="rose" onClick={() => navigate('/student/mock-tests')} />
        <ProgressCard icon={Video} label="Videos" value={`${videoCompletionRate}%`} sub={`${videoProgress.length}/${videos.length} watched`} color="amber" onClick={() => navigate('/student/videos')} />
      </div>

      {/* Progress bars */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Completion Progress</h2>
        <div className="space-y-4">
          <ProgressBar label="Learning Modules" value={stats.completedModules} max={totalModules} color="from-blue-500 to-cyan-500" onClick={() => navigate('/student/modules')} />
          <ProgressBar label="Videos Watched" value={videoProgress.length} max={videos.length} color="from-amber-500 to-orange-500" onClick={() => navigate('/student/videos')} />
          <ProgressBar label="Quizzes Completed" value={stats.completedQuizzes} max={quizzes.length} color="from-emerald-500 to-teal-500" onClick={() => navigate('/student/quizzes')} />
          <ProgressBar label="Scenarios Completed" value={scenarioProgress.length} max={scenarios.length} color="from-purple-500 to-pink-500" onClick={() => navigate('/student/scenarios')} />
          <ProgressBar label="Phishing Challenges" value={stats.phishingDetectiveScore} max={100} suffix="%" color="from-rose-500 to-pink-500" onClick={() => navigate('/student/phishing-detective')} />
        </div>
      </div>

      {/* Topic performance */}
      {Object.keys(topicPerf).length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Topic Performance</h2>
          <div className="space-y-3">
            {Object.entries(topicPerf).map(([topic, perf]) => {
              const pct = Math.round((perf.correct / perf.total) * 100);
              return (
                <div key={topic} className="flex items-center gap-3">
                  <span className="text-sm text-slate-300 w-32 truncate">{topic}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-700/50 overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500')} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm text-slate-400 w-16 text-right">{perf.correct}/{perf.total} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent quiz results */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Recent Quiz Results</h2>
            <button onClick={() => navigate('/student/quizzes')} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {quizResults.length > 0 ? (
            <div className="space-y-2">
              {quizResults.slice(-5).reverse().map((r, i) => {
                const quiz = quizzes.find(q => q.id === r.quizId);
                return (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{quiz?.title || 'Quiz'}</p>
                      <p className="text-xs text-slate-500">{formatDate(r.completedAt)}</p>
                    </div>
                    <span className={cn('text-sm font-bold', r.percentage >= 80 ? 'text-green-400' : r.percentage >= 50 ? 'text-yellow-400' : 'text-red-400')}>{r.percentage}%</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-6">No quizzes taken yet</p>
          )}
        </div>

        {/* Recent mock test results */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Recent Mock Tests</h2>
            <button onClick={() => navigate('/student/mock-tests')} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {mockTestResults.length > 0 ? (
            <div className="space-y-2">
              {mockTestResults.slice(-5).reverse().map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">Mock Test</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(r.timeUsed)} • {formatDate(r.completedAt)}</p>
                  </div>
                  <span className={cn('text-sm font-bold', r.percentage >= 60 ? 'text-green-400' : 'text-yellow-400')}>{r.percentage}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-6">No mock tests taken yet</p>
          )}
        </div>
      </div>

      {/* Achievements summary */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" /> Achievements Earned</h2>
          <button onClick={() => navigate('/student/achievements')} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-slate-400">{unlockedAchievements.length} of {modules.length + quizzes.length} possible achievements unlocked</p>
        <div className="mt-3 h-2 rounded-full bg-slate-700/50 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400" style={{ width: `${(unlockedAchievements.length / 14) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ icon: Icon, label, value, sub, color, onClick }: {
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

function ProgressBar({ label, value, max, color, suffix = '', onClick }: { label: string; value: number; max: number; color: string; suffix?: string; onClick: () => void }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <button onClick={onClick} className="w-full text-left">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm font-medium text-slate-400">{value}/{max}{suffix}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
        <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
    </button>
  );
}
