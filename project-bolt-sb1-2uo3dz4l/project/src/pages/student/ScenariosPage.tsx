import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2,
  XCircle, AlertTriangle, Lightbulb, Shield, ArrowRight,
} from 'lucide-react';
import { scenarios } from '@/lib/data';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

export function ScenariosPage() {
  const navigate = useNavigate();
  const { completeScenario, isScenarioCompleted } = useData();
  const { showToast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const scenario = scenarios[currentIndex];
  const isLast = currentIndex === scenarios.length - 1;
  const completedCount = scenarios.filter(s => isScenarioCompleted(s.id)).length;

  const handleSelect = (choiceIndex: number) => {
    if (showResult) return;
    setSelectedChoice(choiceIndex);
  };

  const handleCheckResult = () => {
    if (selectedChoice === null) {
      showToast('Please select an answer first', 'warning');
      return;
    }
    setShowResult(true);
    completeScenario(scenario.id);
    const choice = scenario.choices[selectedChoice];
    showToast(choice.isSafe ? 'Good choice! That was the safe action.' : 'That was an unsafe action. Learn from this!', choice.isSafe ? 'success' : 'warning');
  };

  const handleNext = () => {
    if (!isLast) {
      setCurrentIndex(prev => prev + 1);
      setSelectedChoice(null);
      setShowResult(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSelectedChoice(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedChoice(null);
    setShowResult(false);
    showToast('Scenarios restarted', 'info');
  };

  const selectedChoiceData = selectedChoice !== null ? scenario.choices[selectedChoice] : null;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">What Would You Do?</h1>
          <p className="text-sm text-slate-400 mt-1">Real-world cybersecurity decision scenarios</p>
        </div>
        <span className="text-sm text-slate-400">{completedCount}/{scenarios.length} completed</span>
      </div>

      {/* Scenario navigation */}
      <div className="card p-3">
        <div className="flex flex-wrap gap-2">
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { setCurrentIndex(i); setSelectedChoice(null); setShowResult(false); }}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center',
                i === currentIndex ? 'bg-emerald-500 text-white' : isScenarioCompleted(s.id) ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
              )}
              aria-label={`Scenario ${i + 1}: ${s.title}`}
            >
              {isScenarioCompleted(s.id) && i !== currentIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario card */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="badge border-emerald-500/20 bg-emerald-500/10 text-emerald-400">{scenario.category}</span>
          <span className="text-xs text-slate-500">Scenario {currentIndex + 1} of {scenarios.length}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">{scenario.title}</h2>
        <p className="text-sm text-slate-400 mt-1">{scenario.description}</p>

        {/* Situation */}
        <div className="mt-6 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300 leading-relaxed">{scenario.situation}</p>
          </div>
        </div>

        {/* Choices */}
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-slate-200">What would you do?</p>
          {scenario.choices.map((choice, idx) => {
            const isSelected = selectedChoice === idx;
            const showCorrectness = showResult && isSelected;
            const showCorrect = showResult && choice.isSafe;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className={cn(
                  'w-full text-left rounded-xl border px-4 py-3 text-sm transition-all flex items-start gap-3',
                  showResult
                    ? showCorrect
                      ? 'border-green-500/40 bg-green-500/10'
                      : showCorrectness
                        ? 'border-red-500/40 bg-red-500/10'
                        : 'border-slate-700/50 opacity-60'
                    : isSelected
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                      : 'border-slate-700/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800/40'
                )}
              >
                <span className="font-medium flex-shrink-0">{String.fromCharCode(65 + idx)}.</span>
                <span className="flex-1">{choice.text}</span>
                {showResult && choice.isSafe && <Shield className="w-4 h-4 text-green-400 flex-shrink-0" />}
                {showResult && !choice.isSafe && isSelected && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Result */}
        {showResult && selectedChoiceData && (
          <div className="mt-6 space-y-4 animate-slide-up">
            <div className={cn(
              'rounded-xl border p-4',
              selectedChoiceData.isSafe ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
            )}>
              <div className="flex items-center gap-2 mb-2">
                {selectedChoiceData.isSafe ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
                <h3 className={cn('font-semibold', selectedChoiceData.isSafe ? 'text-green-300' : 'text-red-300')}>
                  {selectedChoiceData.isSafe ? 'Safe Choice!' : 'Unsafe Choice'}
                </h3>
              </div>
              <p className="text-sm text-slate-300">{selectedChoiceData.explanation}</p>
            </div>

            {/* Warning signs */}
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold text-yellow-300">Warning Signs to Watch For</h3>
              </div>
              <ul className="space-y-2">
                {selectedChoiceData.warningSigns.map((sign, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span> {sign}
                  </li>
                ))}
              </ul>
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
          <button onClick={handleCheckResult} disabled={selectedChoice === null} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            Check Result <ArrowRight className="w-4 h-4" />
          </button>
        ) : !isLast ? (
          <button onClick={handleNext} className="btn-primary">
            Next Scenario <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleRestart} className="btn-primary">
            <RotateCcw className="w-4 h-4" /> Restart
          </button>
        )}
      </div>
    </div>
  );
}
