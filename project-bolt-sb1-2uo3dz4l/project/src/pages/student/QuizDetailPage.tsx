import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ClipboardList, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  RotateCcw, Eye, Award, Loader2, Clock,
} from 'lucide-react';
import { quizzes } from '@/lib/data';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { cn, generateId } from '@/lib/utils';
import { ConfirmModal } from '@/components/Modal';
import type { QuizResult } from '@/lib/types';

type Phase = 'intro' | 'taking' | 'results' | 'review';

export function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { saveQuizResult } = useData();
  const { showToast } = useToast();

  const quiz = quizzes.find(q => q.id === id);

  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!quiz) {
    return (
      <div className="card p-12 text-center">
        <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Quiz not found</p>
        <button onClick={() => navigate('/student/quizzes')} className="btn-primary mt-4">Back to Quizzes</button>
      </div>
    );
  }

  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  const startQuiz = () => {
    setPhase('taking');
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
  };

  const selectAnswer = (questionId: string, optionIndex: number) => {
    if (phase !== 'taking') return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      let correct = 0;
      const topicPerformance: Record<string, { correct: number; total: number }> = {};

      quiz.questions.forEach(q => {
        if (!topicPerformance[q.topic]) topicPerformance[q.topic] = { correct: 0, total: 0 };
        topicPerformance[q.topic].total++;
        if (answers[q.id] === q.correctAnswer) {
          correct++;
          topicPerformance[q.topic].correct++;
        }
      });

      const percentage = Math.round((correct / totalQuestions) * 100);
      const quizResult: QuizResult = {
        quizId: quiz.id,
        score: correct,
        total: totalQuestions,
        percentage,
        answers: { ...answers },
        completedAt: new Date().toISOString(),
        topicPerformance,
      };

      setResult(quizResult);
      saveQuizResult(quizResult);
      setPhase('results');
      setSubmitting(false);
      showToast(`Quiz submitted! You scored ${percentage}%`, percentage >= 80 ? 'success' : 'warning');
    }, 500);
  };

  const retry = () => {
    setPhase('intro');
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
  };

  // INTRO PHASE
  if (phase === 'intro') {
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <button onClick={() => navigate('/student/quizzes')} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes
        </button>
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">{quiz.title}</h1>
          <p className="text-sm text-slate-400 mt-2">{quiz.description}</p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><ClipboardList className="w-4 h-4 text-amber-400" /> {totalQuestions} Questions</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-400" /> No time limit</span>
          </div>
          <button onClick={startQuiz} className="btn-primary mt-8 w-full">
            <ClipboardList className="w-4 h-4" /> Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // RESULTS PHASE
  if (phase === 'results' && result) {
    const passed = result.percentage >= 80;
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4', passed ? 'bg-green-500/20' : 'bg-yellow-500/20')}>
            {passed ? <Award className="w-8 h-8 text-green-400" /> : <ClipboardList className="w-8 h-8 text-yellow-400" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-100">{passed ? 'Great job!' : 'Keep practicing!'}</h1>
          <p className="text-sm text-slate-400 mt-2">{quiz.title}</p>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <p className="text-3xl font-bold text-green-400">{result.score}</p>
              <p className="text-xs text-slate-500 mt-1">Correct</p>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <p className="text-3xl font-bold text-red-400">{result.total - result.score}</p>
              <p className="text-xs text-slate-500 mt-1">Incorrect</p>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <p className={cn('text-3xl font-bold', passed ? 'text-green-400' : 'text-yellow-400')}>{result.percentage}%</p>
              <p className="text-xs text-slate-500 mt-1">Score</p>
            </div>
          </div>

          {/* Topic performance */}
          <div className="mt-6 text-left">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Topic Performance</h3>
            <div className="space-y-2">
              {Object.entries(result.topicPerformance).map(([topic, perf]) => (
                <div key={topic} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-32 truncate">{topic}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-700/50 overflow-hidden">
                    <div className={cn('h-full rounded-full', perf.correct / perf.total >= 0.8 ? 'bg-green-500' : perf.correct / perf.total >= 0.5 ? 'bg-yellow-500' : 'bg-red-500')} style={{ width: `${(perf.correct / perf.total) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{perf.correct}/{perf.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={() => setPhase('review')} className="btn-secondary flex-1">
              <Eye className="w-4 h-4" /> Review Answers
            </button>
            <button onClick={retry} className="btn-secondary flex-1">
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
            <button onClick={() => navigate('/student/quizzes')} className="btn-primary flex-1">
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // REVIEW PHASE
  if (phase === 'review' && result) {
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-100">Review Answers</h1>
          <button onClick={() => setPhase('results')} className="btn-ghost">
            <ArrowLeft className="w-4 h-4" /> Back to Results
          </button>
        </div>
        {quiz.questions.map((q, i) => {
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
                {q.options.map((opt, idx) => {
                  const isUserAnswer = userAnswer === idx;
                  const isCorrectAnswer = q.correctAnswer === idx;
                  return (
                    <div key={idx} className={cn(
                      'rounded-lg px-3 py-2 text-sm border',
                      isCorrectAnswer ? 'border-green-500/30 bg-green-500/10 text-green-300' : isUserAnswer ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-slate-700/50 text-slate-400'
                    )}>
                      {opt}
                      {isCorrectAnswer && <span className="ml-2 text-xs">✓ Correct</span>}
                      {isUserAnswer && !isCorrectAnswer && <span className="ml-2 text-xs">✗ Your answer</span>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 ml-9 rounded-lg bg-blue-500/5 border border-blue-500/20 px-3 py-2">
                <p className="text-xs text-blue-300"><strong>Explanation:</strong> {q.explanation}</p>
              </div>
            </div>
          );
        })}
        <div className="flex gap-3">
          <button onClick={() => setPhase('results')} className="btn-secondary flex-1">Back to Results</button>
          <button onClick={retry} className="btn-primary flex-1"><RotateCcw className="w-4 h-4" /> Retry Quiz</button>
        </div>
      </div>
    );
  }

  // TAKING PHASE
  const question = quiz.questions[currentQ];
  const userAnswer = answers[question.id];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/student/quizzes')} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Exit Quiz
        </button>
        <span className="text-sm text-slate-400">{answeredCount} of {totalQuestions} answered</span>
      </div>

      {/* Question navigation */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQ(i)}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-medium transition-all',
                i === currentQ ? 'bg-blue-500 text-white' : answers[q.id] !== undefined ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
              )}
              aria-label={`Go to question ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400">Question {currentQ + 1} of {totalQuestions}</span>
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
                userAnswer === idx
                  ? 'border-blue-500/50 bg-blue-500/10 text-blue-200'
                  : 'border-slate-700/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800/40'
              )}
              aria-pressed={userAnswer === idx}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
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
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Quiz</>}
          </button>
        )}
      </div>

      {/* Quick submit if on last question */}
      {currentQ === totalQuestions - 1 && !allAnswered && (
        <p className="text-center text-xs text-yellow-400/80">You have {totalQuestions - answeredCount} unanswered question(s)</p>
      )}

      <ConfirmModal
        open={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={handleSubmit}
        title="Submit Quiz?"
        message={`You have answered ${answeredCount} of ${totalQuestions} questions. ${!allAnswered ? 'Unanswered questions will be marked as incorrect.' : 'Ready to see your results?'}`}
        confirmLabel="Submit"
      />
    </div>
  );
}
