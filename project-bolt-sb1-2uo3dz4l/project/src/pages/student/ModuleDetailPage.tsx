import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Clock, CheckCircle2, Bookmark,
  ClipboardList, Video, FileText, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { modules, videos, notes, quizzes } from '@/lib/data';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { getDifficultyColor, cn } from '@/lib/utils';
import { ConfirmModal } from '@/components/Modal';

export function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isModuleComplete, isModuleBookmarked, toggleModuleBookmark, markModuleComplete, accessModule } = useData();
  const { showToast } = useToast();

  const module = modules.find(m => m.id === id);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  // Hooks must be called unconditionally
  const moduleIndex = module ? modules.findIndex(m => m.id === module.id) : -1;
  const prevModule = moduleIndex > 0 ? modules[moduleIndex - 1] : null;
  const nextModule = moduleIndex >= 0 && moduleIndex < modules.length - 1 ? modules[moduleIndex + 1] : null;

  if (!id) return null;
  if (!module) {
    return (
      <div className="card p-12 text-center">
        <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Module not found</p>
        <button onClick={() => navigate('/student/modules')} className="btn-primary mt-4">Back to Modules</button>
      </div>
    );
  }

  accessModule(module.id);

  const completed = isModuleComplete(module.id);
  const bookmarked = isModuleBookmarked(module.id);
  const video = videos.find(v => v.moduleId === module.id);
  const note = notes.find(n => n.moduleId === module.id);
  const quiz = quizzes.find(q => q.id === module.quizId);

  const handleComplete = () => {
    if (completed) {
      showToast('This module is already completed', 'info');
      return;
    }
    markModuleComplete(module.id);
    showToast('Module completed! Great work.', 'success');
  };

  const handleBookmark = () => {
    toggleModuleBookmark(module.id);
    showToast(bookmarked ? 'Bookmark removed' : 'Bookmark saved', bookmarked ? 'info' : 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <button onClick={() => navigate('/student/modules')} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="w-4 h-4" /> Back to Modules
      </button>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className={cn('badge', getDifficultyColor(module.difficulty))}>{module.difficulty}</span>
              <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {module.duration}</span>
              <span className="text-xs text-slate-500">{module.category}</span>
              {completed && <span className="badge border-green-500/20 bg-green-500/10 text-green-400"><CheckCircle2 className="w-3 h-3" /> Completed</span>}
            </div>
            <h1 className="text-2xl font-bold text-slate-100">{module.title}</h1>
            <p className="text-sm text-slate-400 mt-2">{module.description}</p>
          </div>
          <button
            onClick={handleBookmark}
            className={cn(
              'p-2.5 rounded-xl transition-colors flex-shrink-0',
              bookmarked ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            )}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Bookmark className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => completed ? showToast('Module already completed', 'info') : setShowCompleteConfirm(true)}
            disabled={completed}
            className={completed ? 'btn-secondary cursor-default' : 'btn-primary'}
          >
            <CheckCircle2 className="w-4 h-4" /> {completed ? 'Completed' : 'Mark Complete'}
          </button>
          {quiz && (
            <button onClick={() => navigate(`/student/quizzes/${quiz.id}`)} className="btn-secondary">
              <ClipboardList className="w-4 h-4" /> Take Quiz
            </button>
          )}
          {video && (
            <button onClick={() => navigate('/student/videos')} className="btn-secondary">
              <Video className="w-4 h-4" /> Watch Video
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" /> Module Content
        </h2>
        <div className="prose prose-invert max-w-none">
          {module.content.split('\n').map((line, i) => {
            if (line.startsWith('• ')) {
              return <div key={i} className="flex items-start gap-2 text-sm text-slate-300 my-1.5 ml-2"><span className="text-blue-400 mt-0.5">•</span><span>{line.slice(2)}</span></div>;
            }
            if (line.trim() === '') return <div key={i} className="h-3" />;
            return <p key={i} className="text-sm text-slate-300 leading-relaxed">{line}</p>;
          })}
        </div>
      </div>

      {/* Related resources */}
      <div className="grid sm:grid-cols-3 gap-4">
        {video && (
          <button onClick={() => navigate('/student/videos')} className="card card-hover p-4 text-left">
            <Video className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-sm font-medium text-slate-200">Video Lesson</p>
            <p className="text-xs text-slate-500 mt-1 truncate">{video.title}</p>
          </button>
        )}
        {note && (
          <button onClick={() => navigate('/student/notes')} className="card card-hover p-4 text-left">
            <FileText className="w-6 h-6 text-emerald-400 mb-2" />
            <p className="text-sm font-medium text-slate-200">Study Notes</p>
            <p className="text-xs text-slate-500 mt-1 truncate">{note.title}</p>
          </button>
        )}
        {quiz && (
          <button onClick={() => navigate(`/student/quizzes/${quiz.id}`)} className="card card-hover p-4 text-left">
            <ClipboardList className="w-6 h-6 text-amber-400 mb-2" />
            <p className="text-sm font-medium text-slate-200">Quiz</p>
            <p className="text-xs text-slate-500 mt-1">{quiz.questions.length} questions</p>
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => prevModule && navigate(`/student/modules/${prevModule.id}`)}
          disabled={!prevModule}
          className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-sm text-slate-500">{moduleIndex + 1} of {modules.length}</span>
        <button
          onClick={() => nextModule && navigate(`/student/modules/${nextModule.id}`)}
          disabled={!nextModule}
          className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <ConfirmModal
        open={showCompleteConfirm}
        onClose={() => setShowCompleteConfirm(false)}
        onConfirm={handleComplete}
        title="Mark Module Complete"
        message={`Have you finished reading "${module.title}"? Your progress and achievements will be updated.`}
        confirmLabel="Mark Complete"
      />
    </div>
  );
}
