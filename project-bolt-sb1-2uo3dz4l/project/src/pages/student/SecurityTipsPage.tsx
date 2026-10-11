import { useState } from 'react';
import {
  Lightbulb, ChevronLeft, ChevronRight, Bookmark, Share2, Search,
  KeyRound, ShieldCheck, MousePointerClick, RefreshCw, Lock, Smartphone,
  HardDrive, Wifi, Users, Brain, MessageSquare, Tag,
} from 'lucide-react';
import { securityTips } from '@/lib/data';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

const iconMap: Record<string, typeof Lightbulb> = {
  KeyRound, ShieldCheck, MousePointerClick, RefreshCw, Lock, Smartphone,
  HardDrive, Wifi, Users, Brain, MessageSquare, Search, Lightbulb,
};

export function SecurityTipsPage() {
  const { isTipBookmarked, toggleTipBookmark } = useData();
  const { showToast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [filterBookmarked, setFilterBookmarked] = useState(false);

  const filtered = securityTips.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.content.toLowerCase().includes(search.toLowerCase());
    const matchBookmark = !filterBookmarked || isTipBookmarked(t.id);
    return matchSearch && matchBookmark;
  });

  const tip = securityTips[currentIndex];
  const TipIcon = iconMap[tip.icon] || Lightbulb;

  const handleBookmark = () => {
    const has = isTipBookmarked(tip.id);
    toggleTipBookmark(tip.id);
    showToast(has ? 'Bookmark removed' : 'Bookmark saved', has ? 'info' : 'success');
  };

  const handleShare = async () => {
    const text = `Security Tip: ${tip.title}\n\n${tip.content}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Security Tip: ${tip.title}`, text });
        showToast('Shared successfully', 'success');
      } catch {
        // cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showToast('Tip copied to clipboard', 'success');
      } catch {
        showToast('Unable to copy', 'error');
      }
    }
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? securityTips.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === securityTips.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Security Tips</h1>
          <p className="text-sm text-slate-400 mt-1">Practical cybersecurity tips you can apply today</p>
        </div>
        <span className="text-sm text-slate-400">{currentIndex + 1} of {securityTips.length}</span>
      </div>

      {/* Search and filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tips..." className="input-field pl-10" aria-label="Search tips" />
        </div>
        <button onClick={() => setFilterBookmarked(!filterBookmarked)} className={cn('btn-secondary', filterBookmarked && 'text-blue-400 border-blue-500/30')} aria-pressed={filterBookmarked}>
          <Bookmark className="w-4 h-4" fill={filterBookmarked ? 'currentColor' : 'none'} /> Saved
        </button>
      </div>

      {/* Current tip card */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <TipIcon className="w-7 h-7 text-amber-400" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleShare} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors" aria-label="Share tip">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={handleBookmark} className={cn('p-2 rounded-lg transition-colors', isTipBookmarked(tip.id) ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800')} aria-label={isTipBookmarked(tip.id) ? 'Remove bookmark' : 'Add bookmark'}>
              <Bookmark className="w-5 h-5" fill={isTipBookmarked(tip.id) ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        <span className="badge border-amber-500/20 bg-amber-500/10 text-amber-400">{tip.category}</span>
        <h2 className="text-xl font-bold text-slate-100 mt-3">{tip.title}</h2>
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">{tip.content}</p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={handlePrev} className="btn-secondary">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <div className="flex flex-wrap gap-1.5 max-w-md justify-center">
          {securityTips.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all',
                i === currentIndex ? 'bg-amber-400 w-6' : 'bg-slate-700 hover:bg-slate-600'
              )}
              aria-label={`Go to tip ${i + 1}`}
            />
          ))}
        </div>
        <button onClick={handleNext} className="btn-secondary">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* All tips grid */}
      {search || filterBookmarked ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">Search Results</h3>
          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {filtered.map(t => {
                const Icon = iconMap[t.icon] || Lightbulb;
                return (
                  <button key={t.id} onClick={() => { setCurrentIndex(securityTips.findIndex(s => s.id === t.id)); setSearch(''); setFilterBookmarked(false); }} className="card card-hover p-4 text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-5 h-5 text-amber-400" />
                      <span className="text-xs text-slate-500">{t.category}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-200">{t.title}</p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{t.content}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Lightbulb className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400">No tips found</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
