import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronRight, CheckCircle2, Award, Clock } from 'lucide-react';
import { quizzes, modules } from '@/lib/data';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';

export function QuizzesPage() {
  const navigate = useNavigate();
  const { quizResults } = useData();

  const getBestScore = (quizId: string) => {
    const results = quizResults.filter(r => r.quizId === quizId);
    if (results.length === 0) return null;
    return Math.max(...results.map(r => r.percentage));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Quizzes</h1>
        <p className="text-sm text-slate-400 mt-1">Test your knowledge with interactive cybersecurity quizzes</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {quizzes.map(q => {
          const bestScore = getBestScore(q.id);
          const mod = modules.find(m => m.id === q.moduleId);
          return (
            <div key={q.id} onClick={() => navigate(`/student/quizzes/${q.id}`)} className="card card-hover p-5 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-amber-400" />
                </div>
                {bestScore !== null && (
                  <div className={cn(
                    'badge',
                    bestScore >= 80 ? 'border-green-500/20 bg-green-500/10 text-green-400' : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                  )}>
                    <Award className="w-3 h-3" /> Best: {bestScore}%
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">{q.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{q.description}</p>
              <div className="flex items-center gap-3 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {q.questions.length} questions</span>
                <span>{q.category}</span>
                {mod && <span>Module: {mod.title}</span>}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={cn('text-sm font-medium flex items-center gap-1', bestScore !== null ? 'text-green-400' : 'text-amber-400')}>
                  {bestScore !== null ? 'Retake' : 'Start'} <ChevronRight className="w-4 h-4" />
                </span>
                {bestScore !== null && bestScore >= 80 && (
                  <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle2 className="w-3 h-3" /> Passed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
