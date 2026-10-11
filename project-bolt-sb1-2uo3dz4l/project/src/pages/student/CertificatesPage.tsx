import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Printer, Download, Shield, Lock, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { modules, quizzes } from '@/lib/data';

export function CertificatesPage() {
  const { user } = useAuth();
  const { stats, quizResults } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const certRef = useRef<HTMLDivElement>(null);

  if (!user || !stats) return null;

  const totalModules = modules.length;
  const completionRate = (stats.completedModules / totalModules) * 100;
  const eligible = completionRate >= 50 && stats.completedQuizzes >= 4;
  const avgScore = stats.completedQuizzes > 0
    ? Math.round(Object.values(stats.quizBestScores).reduce((a, b) => a + b, 0) / Object.values(stats.quizBestScores).length)
    : 0;

  const certId = `CSC-${user.id.slice(-8).toUpperCase()}`;
  const verificationCode = `VC-${Date.now().toString(36).toUpperCase()}-${user.id.slice(-4)}`;
  const completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const certContent = `CYBERSAFE CAMPUS - CERTIFICATE OF COMPLETION\n\nThis certifies that\n${user.name}\nhas successfully completed the Cybersecurity Awareness Program\n\nFinal Score: ${avgScore}%\nModules Completed: ${stats.completedModules}/${totalModules}\nQuizzes Completed: ${stats.completedQuizzes}\nCompletion Date: ${completionDate}\n\nCertificate ID: ${certId}\nVerification Code: ${verificationCode}\n\nLearn Smart. Stay Safe. Be Cyber Aware.`;

    const blob = new Blob([certContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberSafe_Certificate_${user.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Certificate downloaded', 'success');
  };

  if (!eligible) {
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Certificates</h1>
          <p className="text-sm text-slate-400 mt-1">Complete requirements to earn your certificate</p>
        </div>
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-slate-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Certificate Locked</h2>
          <p className="text-sm text-slate-400 mt-2">Complete the requirements below to unlock your certificate:</p>
          <div className="mt-6 space-y-3 text-left max-w-sm mx-auto">
            <Requirement label="Complete at least 50% of modules" current={stats.completedModules} required={Math.ceil(totalModules * 0.5)} />
            <Requirement label="Complete at least 4 quizzes" current={stats.completedQuizzes} required={4} />
          </div>
          <button onClick={() => navigate('/student/modules')} className="btn-primary mt-6">
            Continue Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Your Certificate</h1>
          <p className="text-sm text-slate-400 mt-1">Congratulations on your achievement!</p>
        </div>
      </div>

      {/* Certificate */}
      <div ref={certRef} className="print-certificate card p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-40 h-40 border-4 border-blue-400 rounded-full" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-4 border-cyan-400 rounded-full" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <p className="text-sm text-slate-400 uppercase tracking-widest">CyberSafe Campus</p>
          <h2 className="text-3xl font-bold text-slate-100 mt-4">Certificate of Completion</h2>
          <p className="text-sm text-slate-500 mt-2">This certifies that</p>
          <p className="text-2xl font-bold text-blue-400 mt-3">{user.name}</p>
          <p className="text-sm text-slate-400 mt-3">has successfully completed the</p>
          <p className="text-lg font-semibold text-slate-200 mt-1">Cybersecurity Awareness Program</p>
          <div className="flex items-center justify-center gap-8 mt-6">
            <div>
              <p className="text-2xl font-bold text-slate-100">{avgScore}%</p>
              <p className="text-xs text-slate-500">Final Score</p>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div>
              <p className="text-2xl font-bold text-slate-100">{stats.completedModules}/{totalModules}</p>
              <p className="text-xs text-slate-500">Modules</p>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div>
              <p className="text-2xl font-bold text-slate-100">{stats.completedQuizzes}</p>
              <p className="text-xs text-slate-500">Quizzes</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-6">Completed on {completionDate}</p>
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/50">
            <div className="text-left">
              <p className="text-xs text-slate-500">Certificate ID</p>
              <p className="text-sm font-mono text-slate-300">{certId}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Verification</p>
              <p className="text-sm font-mono text-slate-300">{verificationCode}</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-4">Learn Smart. Stay Safe. Be Cyber Aware.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="no-print flex flex-wrap gap-3">
        <button onClick={handlePrint} className="btn-primary flex-1">
          <Printer className="w-4 h-4" /> Print
        </button>
        <button onClick={handleDownload} className="btn-secondary flex-1">
          <Download className="w-4 h-4" /> Download
        </button>
      </div>
    </div>
  );
}

function Requirement({ label, current, required }: { label: string; current: number; required: number }) {
  const met = current >= required;
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <span className={`text-sm font-medium ${met ? 'text-green-400' : 'text-yellow-400'}`}>
        {current}/{required} {met && '✓'}
      </span>
    </div>
  );
}
