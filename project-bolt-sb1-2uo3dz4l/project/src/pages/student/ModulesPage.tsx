import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Bookmark, ChevronRight, CheckCircle2, Search, Filter } from 'lucide-react';
import { modules } from '@/lib/data';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { getDifficultyColor, cn } from '@/lib/utils';

export function ModulesPage() {
  const navigate = useNavigate();
  const { isModuleComplete, isModuleBookmarked, toggleModuleBookmark, accessModule } = useData();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(modules.map(m => m.category)))];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filtered = modules.filter(m => {
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filter === 'all' || m.category === filter;
    const matchDiff = difficulty === 'all' || m.difficulty === difficulty;
    return matchSearch && matchCat && matchDiff;
  });

  const handleOpen = (id: string) => {
    accessModule(id);
    navigate(`/student/modules/${id}`);
  };

  const handleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const has = isModuleBookmarked(id);
    toggleModuleBookmark(id);
    showToast(has ? 'Bookmark removed' : 'Bookmark saved', has ? 'info' : 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Learning Modules</h1>
        <p className="text-sm text-slate-400 mt-1">Master cybersecurity through structured learning paths</p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules..."
            className="input-field pl-10"
            aria-label="Search modules"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field pl-9 pr-8 appearance-none cursor-pointer"
              aria-label="Filter by category"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
            </select>
          </div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="input-field appearance-none cursor-pointer"
            aria-label="Filter by difficulty"
          >
            {difficulties.map(d => <option key={d} value={d}>{d === 'all' ? 'All Levels' : d}</option>)}
          </select>
        </div>
      </div>

      {/* Module grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(m => {
            const completed = isModuleComplete(m.id);
            const bookmarked = isModuleBookmarked(m.id);
            return (
              <div
                key={m.id}
                onClick={() => handleOpen(m.id)}
                className="card card-hover p-5 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center',
                    completed ? 'bg-green-500/20' : 'bg-blue-500/20'
                  )}>
                    {completed ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <BookOpen className="w-6 h-6 text-blue-400" />}
                  </div>
                  <button
                    onClick={(e) => handleBookmark(e, m.id)}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      bookmarked ? 'text-blue-400 hover:bg-blue-500/10' : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800'
                    )}
                    aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    <Bookmark className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn('badge', getDifficultyColor(m.difficulty))}>{m.difficulty}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {m.duration}</span>
                </div>
                <h3 className="font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">{m.title}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{m.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{m.category}</span>
                  <span className={cn(
                    'text-sm font-medium flex items-center gap-1',
                    completed ? 'text-green-400' : 'text-blue-400'
                  )}>
                    {completed ? 'Review' : 'Open'} <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No modules found matching your filters</p>
        </div>
      )}
    </div>
  );
}
