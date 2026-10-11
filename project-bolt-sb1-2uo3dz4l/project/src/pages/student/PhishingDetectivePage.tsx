import { useState } from 'react';
import {
  Search, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2,
  XCircle, Mail, MessageSquare, Globe, Share2, AlertTriangle,
  Eye, Lightbulb, Shield, ArrowRight,
} from 'lucide-react';
import { phishingMessages } from '@/lib/data';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

const typeIcons = {
  email: Mail,
  sms: MessageSquare,
  website: Globe,
  social: Share2,
};

export function PhishingDetectivePage() {
  const { setPhishingScore, phishingScore } = useData();
  const { showToast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSigns, setSelectedSigns] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const message = phishingMessages[currentIndex];
  const isLast = currentIndex === phishingMessages.length - 1;
  const totalRealSigns = message.warningSigns.filter(s => s.isReal).length;

  const toggleSign = (signId: string) => {
    if (showResult) return;
    setSelectedSigns(prev => {
      const next = new Set(prev);
      if (next.has(signId)) next.delete(signId);
      else next.add(signId);
      return next;
    });
  };

  const handleSubmit = () => {
    if (selectedSigns.size === 0) {
      showToast('Please select at least one warning sign', 'warning');
      return;
    }
    setShowResult(true);

    let correct = 0;
    let missedReal = 0;
    let falsePositives = 0;

    message.warningSigns.forEach(sign => {
      const selected = selectedSigns.has(sign.id);
      if (sign.isReal && selected) correct++;
      if (sign.isReal && !selected) missedReal++;
      if (!sign.isReal && selected) falsePositives++;
    });

    const score = Math.round((correct / totalRealSigns) * 100);
    setLastScore(score);
    setPhishingScore(Math.max(phishingScore, score));
    showToast(`You identified ${correct} of ${totalRealSigns} real warning signs. Score: ${score}%`, score >= 80 ? 'success' : 'warning');
  };

  const handleNext = () => {
    if (!isLast) {
      setCurrentIndex(prev => prev + 1);
      setSelectedSigns(new Set());
      setShowResult(false);
      setLastScore(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSelectedSigns(new Set());
      setShowResult(false);
      setLastScore(null);
    }
  };

  const handleRetry = () => {
    setSelectedSigns(new Set());
    setShowResult(false);
    setLastScore(null);
    showToast('Try again!', 'info');
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedSigns(new Set());
    setShowResult(false);
    setLastScore(null);
  };

  const TypeIcon = typeIcons[message.type];

  const handleShare = async () => {
    const text = `Phishing Detective Challenge: Can you spot the warning signs? Try CyberSafe Campus!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'CyberSafe Campus - Phishing Detective', text });
        showToast('Shared successfully', 'success');
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'success');
      } catch {
        showToast('Unable to share or copy', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Phishing Detective</h1>
          <p className="text-sm text-slate-400 mt-1">Identify warning signs in simulated phishing messages</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Best: {phishingScore}%</span>
          <button onClick={handleShare} className="btn-ghost" aria-label="Share">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Educational disclaimer */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
        <p className="text-xs text-blue-300/80 flex items-center gap-2">
          <Shield className="w-4 h-4 flex-shrink-0" /> Educational Simulation - All messages are fictional and created for learning purposes.
        </p>
      </div>

      {/* Navigation */}
      <div className="card p-3">
        <div className="flex flex-wrap gap-2">
          {phishingMessages.map((m, i) => (
            <button
              key={m.id}
              onClick={() => { setCurrentIndex(i); setSelectedSigns(new Set()); setShowResult(false); setLastScore(null); }}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center',
                i === currentIndex ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <TypeIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100">{message.title}</h2>
            <span className="text-xs text-slate-500 capitalize">{message.type} - Case {currentIndex + 1} of {phishingMessages.length}</span>
          </div>
        </div>

        {/* Simulated message content */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 font-mono text-sm text-slate-300 whitespace-pre-line">
          {message.content}
        </div>

        <p className="text-sm text-slate-300 mt-6 mb-3">Select all the warning signs you can identify in this message:</p>

        {/* Warning signs */}
        <div className="space-y-2">
          {message.warningSigns.map(sign => {
            const isSelected = selectedSigns.has(sign.id);
            const showResultClass = showResult && (sign.isReal ? isSelected ? 'border-green-500/40 bg-green-500/10' : 'border-yellow-500/30 bg-yellow-500/5' : isSelected ? 'border-red-500/40 bg-red-500/10' : 'border-slate-700/50');
            return (
              <button
                key={sign.id}
                onClick={() => toggleSign(sign.id)}
                disabled={showResult}
                className={cn(
                  'w-full text-left rounded-xl border px-4 py-3 text-sm transition-all flex items-start gap-3',
                  showResult ? showResultClass : isSelected ? 'border-blue-500/50 bg-blue-500/10 text-blue-200' : 'border-slate-700/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800/40'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5',
                  isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-600'
                )}>
                  {isSelected && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <span className="flex-1">{sign.text}</span>
                {showResult && sign.isReal && !isSelected && <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                {showResult && sign.isReal && isSelected && <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />}
                {showResult && !sign.isReal && isSelected && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Results */}
        {showResult && (
          <div className="mt-6 space-y-4 animate-slide-up">
            {/* Score */}
            <div className={cn(
              'rounded-xl border p-4 text-center',
              (lastScore ?? 0) >= 80 ? 'border-green-500/30 bg-green-500/10' : (lastScore ?? 0) >= 50 ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-red-500/30 bg-red-500/10'
            )}>
              <p className="text-3xl font-bold text-slate-100">{lastScore}%</p>
              <p className="text-sm text-slate-400 mt-1">Detection Score</p>
            </div>

            {/* Explanation */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-blue-300">Full Analysis</h3>
              </div>
              <p className="text-sm text-slate-300">{message.explanation}</p>
            </div>

            {/* Detailed breakdown */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-200">Warning Sign Breakdown</h3>
              {message.warningSigns.filter(s => s.isReal).map(sign => {
                const wasSelected = selectedSigns.has(sign.id);
                return (
                  <div key={sign.id} className={cn(
                    'rounded-lg border p-3',
                    wasSelected ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      {wasSelected ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                      <span className="text-sm font-medium text-slate-200">{wasSelected ? 'Identified' : 'Missed'}</span>
                    </div>
                    <p className="text-xs text-slate-400">{sign.text}</p>
                    <p className="text-xs text-slate-500 mt-1">{sign.explanation}</p>
                  </div>
                );
              })}
              {message.warningSigns.filter(s => !s.isReal && selectedSigns.has(s.id)).map(sign => (
                <div key={sign.id} className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-slate-200">False Positive</span>
                  </div>
                  <p className="text-xs text-slate-400">{sign.text}</p>
                  <p className="text-xs text-slate-500 mt-1">{sign.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <button onClick={handlePrev} disabled={currentIndex === 0} className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        {!showResult ? (
          <button onClick={handleSubmit} disabled={selectedSigns.size === 0} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            Submit Analysis <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleRetry} className="btn-secondary">
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
            {!isLast ? (
              <button onClick={handleNext} className="btn-primary">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleRestart} className="btn-primary">
                <RotateCcw className="w-4 h-4" /> Restart
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
