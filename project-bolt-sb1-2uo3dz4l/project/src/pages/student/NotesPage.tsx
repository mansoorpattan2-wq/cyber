import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Filter, Bookmark, ChevronRight, Tag, X } from 'lucide-react';
import { notes, modules } from '@/lib/data';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/Modal';

export function NotesPage() {
  const navigate = useNavigate();
  const { isNoteBookmarked, toggleNoteBookmark } = useData();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [filterBookmarked, setFilterBookmarked] = useState(false);
  const [selectedNote, setSelectedNote] = useState<typeof notes[0] | null>(null);

  const categories = ['all', ...Array.from(new Set(notes.map(n => n.category)))];

  const filtered = notes.filter(n => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()) || n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === 'all' || n.category === category;
    const matchBookmark = !filterBookmarked || isNoteBookmarked(n.id);
    return matchSearch && matchCat && matchBookmark;
  });

  const handleBookmark = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    const has = isNoteBookmarked(noteId);
    toggleNoteBookmark(noteId);
    showToast(has ? 'Bookmark removed' : 'Bookmark saved', has ? 'info' : 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Study Notes</h1>
        <p className="text-sm text-slate-400 mt-1">Quick reference notes on key cybersecurity concepts</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..." className="input-field pl-10" aria-label="Search notes" />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field pl-9 pr-8 appearance-none cursor-pointer" aria-label="Filter by category">
              {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
            </select>
          </div>
          <button
            onClick={() => setFilterBookmarked(!filterBookmarked)}
            className={cn('btn-secondary', filterBookmarked && 'text-blue-400 border-blue-500/30')}
            aria-pressed={filterBookmarked}
          >
            <Bookmark className="w-4 h-4" fill={filterBookmarked ? 'currentColor' : 'none'} /> Bookmarked
          </button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(n => {
            const bookmarked = isNoteBookmarked(n.id);
            const mod = modules.find(m => m.id === n.moduleId);
            return (
              <div key={n.id} onClick={() => setSelectedNote(n)} className="card card-hover p-5 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <button onClick={(e) => handleBookmark(e, n.id)} className={cn('p-1.5 rounded-lg transition-colors', bookmarked ? 'text-blue-400 hover:bg-blue-500/10' : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800')} aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}>
                    <Bookmark className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <span className="text-xs text-emerald-400">{n.category}</span>
                <h3 className="font-semibold text-slate-100 mt-1 group-hover:text-emerald-300 transition-colors">{n.title}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-3">{n.content}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {n.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 flex items-center gap-1"><Tag className="w-2.5 h-2.5" /> {tag}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No notes found</p>
        </div>
      )}

      <Modal open={!!selectedNote} onClose={() => setSelectedNote(null)} title={selectedNote?.title} size="lg">
        {selectedNote && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="badge border-emerald-500/20 bg-emerald-500/10 text-emerald-400">{selectedNote.category}</span>
              {modules.find(m => m.id === selectedNote.moduleId) && (
                <button onClick={() => { setSelectedNote(null); navigate(`/student/modules/${selectedNote.moduleId}`); }} className="text-xs text-blue-400 hover:text-blue-300">
                  View related module
                </button>
              )}
            </div>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{selectedNote.content}</div>
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-700/50">
              {selectedNote.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 flex items-center gap-1"><Tag className="w-2.5 h-2.5" /> {tag}</span>
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleBookmark(e as unknown as React.MouseEvent, selectedNote.id); }}
              className={cn('btn-secondary w-full', isNoteBookmarked(selectedNote.id) && 'text-blue-400')}
            >
              <Bookmark className="w-4 h-4" fill={isNoteBookmarked(selectedNote.id) ? 'currentColor' : 'none'} />
              {isNoteBookmarked(selectedNote.id) ? 'Bookmarked' : 'Bookmark this note'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
