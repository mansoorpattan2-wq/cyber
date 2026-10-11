import { useNavigate } from 'react-router-dom';
import { Megaphone, ChevronRight, Calendar, BookOpen, Info } from 'lucide-react';
import { campaigns, modules } from '@/lib/data';
import { useToast } from '@/context/ToastContext';
import { cn, formatDate } from '@/lib/utils';
import { Modal } from '@/components/Modal';
import { useState } from 'react';

const colorMap: Record<string, string> = {
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-emerald-500 to-teal-500',
  purple: 'from-purple-500 to-pink-500',
  orange: 'from-amber-500 to-orange-500',
};

const statusColors: Record<string, string> = {
  active: 'border-green-500/20 bg-green-500/10 text-green-400',
  upcoming: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  completed: 'border-slate-500/20 bg-slate-500/10 text-slate-400',
};

export function CampaignsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedCampaign, setSelectedCampaign] = useState<typeof campaigns[0] | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Awareness Campaigns</h1>
        <p className="text-sm text-slate-400 mt-1">Join campus-wide cybersecurity awareness initiatives</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {campaigns.map(c => {
          const mod = modules.find(m => m.id === c.moduleId);
          return (
            <div key={c.id} className="card card-hover overflow-hidden">
              <div className={cn('h-2 bg-gradient-to-r', colorMap[c.color])} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center', colorMap[c.color])}>
                    <Megaphone className="w-6 h-6 text-white" />
                  </div>
                  <span className={cn('badge capitalize', statusColors[c.status])}>{c.status}</span>
                </div>
                <h3 className="font-semibold text-slate-100">{c.title}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                <div className="flex items-center gap-3 mt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(c.startDate)} - {formatDate(c.endDate)}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setSelectedCampaign(c)} className="btn-secondary flex-1 text-xs">
                    <Info className="w-3.5 h-3.5" /> Learn More
                  </button>
                  <button onClick={() => { navigate(`/student/modules/${c.moduleId}`); showToast(`Opening ${mod?.title}`, 'info'); }} className="btn-secondary flex-1 text-xs">
                    <BookOpen className="w-3.5 h-3.5" /> View Module
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!selectedCampaign} onClose={() => setSelectedCampaign(null)} title={selectedCampaign?.title} size="lg">
        {selectedCampaign && (
          <div className="space-y-4">
            <div className={cn('h-1.5 rounded-full bg-gradient-to-r', colorMap[selectedCampaign.color])} />
            <span className={cn('badge capitalize', statusColors[selectedCampaign.status])}>{selectedCampaign.status}</span>
            <p className="text-sm text-slate-300 leading-relaxed">{selectedCampaign.longDescription}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(selectedCampaign.startDate)} - {formatDate(selectedCampaign.endDate)}</span>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
              <button
                onClick={() => { navigate(`/student/modules/${selectedCampaign.moduleId}`); setSelectedCampaign(null); }}
                className="btn-primary flex-1"
              >
                <BookOpen className="w-4 h-4" /> View Related Module <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
