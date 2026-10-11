import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video as VideoIcon, Clock, Search, Filter, Play, CheckCircle2, X } from 'lucide-react';
import { videos, modules } from '@/lib/data';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/Modal';

export function VideosPage() {
  const navigate = useNavigate();
  const { isVideoCompleted, completeVideo } = useData();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<typeof videos[0] | null>(null);

  const categories = ['all', ...Array.from(new Set(videos.map(v => v.category)))];

  const filtered = videos.filter(v => {
    const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase()) || v.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || v.category === category;
    return matchSearch && matchCat;
  });

  const handleComplete = (videoId: string) => {
    completeVideo(videoId);
    showToast('Video marked as completed!', 'success');
    setSelectedVideo(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Educational Videos</h1>
        <p className="text-sm text-slate-400 mt-1">Watch and learn from curated cybersecurity educational content</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search videos..." className="input-field pl-10" aria-label="Search videos" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field pl-9 pr-8 appearance-none cursor-pointer" aria-label="Filter by category">
            {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(v => {
            const completed = isVideoCompleted(v.id);
            const mod = modules.find(m => m.id === v.moduleId);
            return (
              <div key={v.id} className="card card-hover overflow-hidden cursor-pointer group" onClick={() => setSelectedVideo(v)}>
                <div className="relative aspect-video bg-slate-800 overflow-hidden">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-blue-500/90 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" fill="white" />
                    </div>
                  </div>
                  {completed && (
                    <div className="absolute top-2 right-2 bg-green-500/90 rounded-full p-1.5">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {v.duration}
                  </span>
                </div>
                <div className="p-4">
                  <span className="text-xs text-blue-400">{v.category}</span>
                  <h3 className="font-semibold text-slate-100 mt-1 group-hover:text-blue-300 transition-colors">{v.title}</h3>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{v.description}</p>
                  {mod && (
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/student/modules/${mod.id}`); }} className="text-xs text-slate-500 hover:text-blue-400 mt-2 transition-colors">
                      Module: {mod.title}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <VideoIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No videos found</p>
        </div>
      )}

      {/* Video Player Modal */}
      <Modal open={!!selectedVideo} onClose={() => setSelectedVideo(null)} title={selectedVideo?.title} size="lg" showClose={true}>
        {selectedVideo && (
          <div className="space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={selectedVideo.url}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-sm text-slate-300">{selectedVideo.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedVideo.duration}</span>
              <button
                onClick={() => handleComplete(selectedVideo.id)}
                disabled={isVideoCompleted(selectedVideo.id)}
                className={isVideoCompleted(selectedVideo.id) ? 'btn-secondary cursor-default' : 'btn-primary'}
              >
                <CheckCircle2 className="w-4 h-4" /> {isVideoCompleted(selectedVideo.id) ? 'Completed' : 'Mark as Completed'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
