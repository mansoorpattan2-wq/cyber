import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Timer, ChevronLeft, ChevronRight, RotateCcw,
  CheckCircle2, XCircle, Award, Loader2, AlertTriangle, Play,
} from 'lucide-react';
import { mockTests } from '@/lib/data';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { cn, formatTime, generateId } from '@/lib/utils';
import { ConfirmModal } from '@/components/Modal';
import type { MockTestResult } from '@/lib/types';

type Phase = 'intro' | 'taking' | 'results' | 'review';

export function MockTestsPage() {
  const navigate = useNavigate();
  const { mockTestResults } = useData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Mock Tests</h1>
        <p className="text-sm text-slate-400 mt-1">Timed tests simulating real cybersecurity exam conditions</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTests.map(mt => {
          const results = mockTestResults.filter(r => r.testId === mt.id);
          const bestScore = results.length > 0 ? Math.max(...results.map(r => r.percentage)) : null;
          return (
            <div key={mt.id} onClick={() => navigate(`/student/mock-tests/${mt.id}`)} className="card card-hover p-5 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-rose-500/20 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-rose-400" />
                </div>
                {bestScore !== null && (
                  <span className={cn('badge', bestScore >= 60 ? 'border-green-500/20 bg-green-500/10 text-green-400' : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400')}>
                    Best: {bestScore}%
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-slate-100 group-hover:text-rose-300 transition-colors">{mt.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{mt.description}</p>
              <div className="flex items-center gap-3 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {mt.duration} min</span>
                <span>{mt.questions.length} questions</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={cn('text-sm font-medium flex items-center gap-1', bestScore !== null ? 'text-green-400' : 'text-rose-400')}>
                  {bestScore !== null ? 'Retake' : 'Start'} <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MockTestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { saveMockTestResult } = useData();
  const { showToast } = useToast();

  const test = mockTests.find(t => t.id === id);

  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<MockTestResult | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === 'taking' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [phase]);

  if (!test) {
    return (
      <div className="card p-12 text-center">
        <Timer className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Mock test not found</p>
        <button onClick={() => navigate('/student/mock-tests')} className="btn-primary mt-4">Back to Mock Tests</button>
      </div>
    );
  }

  const totalQuestions = test.questions.length;
  const answeredCount = Object.keys(answers).length;

  const startTest = () => {
    setPhase('taking');
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
    setTimeLeft(test.duration * 60);
  };

  const selectAnswer = (questionId: string, optionIndex: number) => {
    if (phase !== 'taking') return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = (autoSubmit = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    setTimeout(() => {
      let correct = 0;
      const topicPerformance: Record<string, { correct: number; total: number }> = {};

      test.questions.forEach(q => {
        if (!topicPerformance[q.topic]) topicPerformance[q.topic] = { correct: 0, total: 0 };
        topicPerformance[q.topic].total++;
        if (answers[q.id] === q.correctAnswer) {
          correct++;
          topicPerformance[q.topic].correct++;
        }
      });

      const percentage = Math.round((correct / totalQuestions) * 100);
      const timeUsed = test.duration * 60 - timeLeft;
      const mtResult: MockTestResult = {
        testId: test.id,
        score: correct,
        total: totalQuestions,
        percentage,
        timeUsed,
        answers: { ...answers },
        completedAt: new Date().toISOString(),
      };

      (mtResult as MockTestResult & { topicPerformance: Record<string, { correct: number; total: number }> }).topicPerformance = topicPerformance;
      setResult(mtResult);
      saveMockTestResult(mtResult);
      setPhase('results');
      setSubmitting(false);
      showToast(autoSubmit ? 'Time is up! Test auto-submitted.' : `Test submitted! You scored ${percentage}%`, percentage >= 60 ? 'success' : 'warning');
    }, 500);
  };

  const retry = () => {
    setPhase('intro');
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
  };

  if (phase === 'intro') {
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <button onClick={() => navigate('/student/mock-tests')} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Back to Mock Tests
        </button>
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <Timer className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">{test.title}</h1>
          <p className="text-sm text-slate-400 mt-2">{test.description}</p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Timer className="w-4 h-4 text-rose-400" /> {test.duration} minutes</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-blue-400" /> {totalQuestions} Questions</span>
          </div>
          <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-left">
            <p className="text-xs text-yellow-400/80 flex items-start gap-2"><AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> The timer starts as soon as you begin. The test will auto-submit when time runs out. Read each question carefully before answering.</p>
          </div>
          <button onClick={startTest} className="btn-primary mt-6 w-full">
            <Play className="w-4 h-4" /> Start Test
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'results' && result) {
    const passed = result.percentage >= 60;
    const fullResult = result as MockTestResult & { topicPerformance: Record<string, { correct: number; total: number }> };
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4', passed ? 'bg-green-500/20' : 'bg-yellow-500/20')}>
            {passed ? <Award className="w-8 h-8 text-green-400" /> : <Timer className="w-8 h-8 text-yellow-400" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-100">{passed ? 'Well done!' : 'Keep practicing!'}</h1>
          <p className="text-sm text-slate-400 mt-2">{test.title}</p>
          <div className="grid grid-cols-4 gap-3 mt-8">
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <p className="text-2xl font-bold text-green-400">{result.score}</p>
              <p className="text-xs text-slate-500 mt-1">Correct</p>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <p className="text-2xl font-bold text-red-400">{result.total - result.score}</p>
              <p className="text-xs text-slate-500 mt-1">Incorrect</p>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <p className={cn('text-2xl font-bold', passed ? 'text-green-400' : 'text-yellow-400')}>{result.percentage}%</p>
              <p className="text-xs text-slate-500 mt-1">Score</p>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <p className="text-2xl font-bold text-blue-400">{formatTime(result.timeUsed)}</p>
              <p className="text-xs text-slate-500 mt-1">Time Used</p>
            </div>
          </div>
          {fullResult.topicPerformance && (
            <div className="mt-6 text-left">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Topic Performance</h3>
              <div className="space-y-2">
                {Object.entries(fullResult.topicPerformance).map(([topic, perf]) => (
                  <div key={topic} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-32 truncate">{topic}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-700/50 overflow-hidden">
                      <div className={cn('h-full rounded-full', perf.correct / perf.total >= 0.6 ? 'bg-green-500' : 'bg-red-500')} style={{ width: `${(perf.correct / perf.total) * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{perf.correct}/{perf.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-8">
            <button onClick={() => setPhase('review')} className="btn-secondary flex-1">Review Answers</button>
            <button onClick={retry} className="btn-secondary flex-1"><RotateCcw className="w-4 h-4" /> Retry</button>
            <button onClick={() => navigate('/student/mock-tests')} className="btn-primary flex-1">Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'review' && result) {
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-100">Review Answers</h1>
          <button onClick={() => setPhase('results')} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back to Results</button>
        </div>
        {test.questions.map((q, i) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          return (
            <div key={q.id} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold', isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                  {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>
                <p className="text-sm font-medium text-slate-200">{i + 1}. {q.question}</p>
              </div>
              <div className="space-y-2 ml-9">
                {q.options.map((opt, idx) => (
                  <div key={idx} className={cn(
                    'rounded-lg px-3 py-2 text-sm border',
                    q.correctAnswer === idx ? 'border-green-500/30 bg-green-500/10 text-green-300' : userAnswer === idx ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-slate-700/50 text-slate-400'
                  )}>
                    {opt}
                    {q.correctAnswer === idx && <span className="ml-2 text-xs">✓ Correct</span>}
                    {userAnswer === idx && !isCorrect && <span className="ml-2 text-xs">✗ Your answer</span>}
                    {userAnswer === undefined && <span className="ml-2 text-xs text-slate-500">Not answered</span>}
                  </div>
                ))}
              </div>
              <div className="mt-3 ml-9 rounded-lg bg-blue-500/5 border border-blue-500/20 px-3 py-2">
                <p className="text-xs text-blue-300"><strong>Explanation:</strong> {q.explanation}</p>
              </div>
            </div>
          );
        })}
        <button onClick={retry} className="btn-primary w-full"><RotateCcw className="w-4 h-4" /> Retry Test</button>
      </div>
    );
  }

  // TAKING PHASE
  const question = test.questions[currentQ];
  const userAnswer = answers[question.id];
  const timeWarning = timeLeft <= 60;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Timer bar */}
      <div className={cn('card p-4 flex items-center justify-between', timeWarning && 'border-rose-500/30')}>
        <button onClick={() => navigate('/student/mock-tests')} className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <div className={cn('flex items-center gap-2 font-mono text-lg font-bold', timeWarning ? 'text-rose-400 animate-pulse' : 'text-slate-200')}>
          <Timer className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question navigation */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          {test.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQ(i)}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-medium transition-all',
                i === currentQ ? 'bg-rose-500 text-white' : answers[q.id] !== undefined ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400">Question {currentQ + 1} of {totalQuestions}</span>
          <span className="text-xs text-slate-500">{question.topic}</span>
        </div>
        <h2 className="text-lg font-semibold text-slate-100 mb-6">{question.question}</h2>
        <div className="space-y-3">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => selectAnswer(question.id, idx)}
              className={cn(
                'w-full text-left rounded-xl border px-4 py-3 text-sm transition-all',
                userAnswer === idx ? 'border-rose-500/50 bg-rose-500/10 text-rose-200' : 'border-slate-700/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800/40'
              )}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))} disabled={currentQ === 0} className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        {currentQ < totalQuestions - 1 ? (
          <button onClick={() => setCurrentQ(prev => Math.min(totalQuestions - 1, prev + 1))} className="btn-primary">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => setShowSubmitConfirm(true)} disabled={submitting} className="btn-primary">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Test</>}
          </button>
        )}
      </div>

      <ConfirmModal
        open={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={() => handleSubmit(false)}
        title="Submit Test?"
        message={`You have answered ${answeredCount} of ${totalQuestions} questions. ${answeredCount < totalQuestions ? 'Unanswered questions will be marked as incorrect.' : 'Ready to see your results?'}`}
        confirmLabel="Submit"
      />
    </div>
  );
}
