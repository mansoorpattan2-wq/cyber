export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Beginner': return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'Intermediate': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'Advanced': return 'text-red-400 bg-red-500/10 border-red-500/20';
    default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  }
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case 'bronze': return 'from-amber-700 to-amber-500';
    case 'silver': return 'from-slate-400 to-slate-300';
    case 'gold': return 'from-yellow-500 to-yellow-300';
    default: return 'from-slate-600 to-slate-400';
  }
}
