import type { ReactNode } from 'react';
import { Shield } from 'lucide-react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-900 to-cyan-900/30" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(6,182,212,0.2) 0%, transparent 50%)'
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">CyberSafe Campus</h1>
              <p className="text-sm text-slate-400">Learn. Practice. Protect.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-100 leading-tight">
              Master cybersecurity through interactive learning
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Engage with real-world scenarios, phishing simulations, quizzes, and achievements designed to make you cyber-aware.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { label: '8 Learning Modules', value: 'Comprehensive' },
                { label: 'Phishing Detective', value: 'Interactive' },
                { label: '6 Real Scenarios', value: 'Practical' },
                { label: '14 Achievements', value: 'Earnable' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
                  <p className="text-sm font-semibold text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500">© 2026 CyberSafe Campus. Educational demo platform.</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-100">CyberSafe Campus</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
