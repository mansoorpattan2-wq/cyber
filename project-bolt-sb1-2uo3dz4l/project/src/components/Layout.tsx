import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Video, FileText, ClipboardList, Timer,
  HelpCircle, Search, Lightbulb, Megaphone, Trophy, Award, TrendingUp,
  User, Settings, LifeBuoy, LogOut, Bell, Menu, X, Moon, Sun, ChevronDown,
  Shield, Bookmark,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { modules, notes, videos, securityTips, scenarios, quizzes } from '@/lib/data';
import { timeAgo } from '@/lib/utils';
import { ConfirmModal } from './Modal';

const navItems = [
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Learning Modules', path: '/student/modules', icon: BookOpen },
  { label: 'Videos', path: '/student/videos', icon: Video },
  { label: 'Notes', path: '/student/notes', icon: FileText },
  { label: 'Quizzes', path: '/student/quizzes', icon: ClipboardList },
  { label: 'Mock Tests', path: '/student/mock-tests', icon: Timer },
  { label: 'What Would You Do?', path: '/student/scenarios', icon: HelpCircle },
  { label: 'Phishing Detective', path: '/student/phishing-detective', icon: Search },
  { label: 'Security Tips', path: '/student/security-tips', icon: Lightbulb },
  { label: 'Campaigns', path: '/student/campaigns', icon: Megaphone },
  { label: 'Achievements', path: '/student/achievements', icon: Trophy },
  { label: 'Certificates', path: '/student/certificates', icon: Award },
  { label: 'Progress', path: '/student/progress', icon: TrendingUp },
  { label: 'Profile', path: '/student/profile', icon: User },
  { label: 'Settings', path: '/student/settings', icon: Settings },
  { label: 'Help', path: '/student/help', icon: LifeBuoy },
];

interface SearchResult {
  category: string;
  title: string;
  description: string;
  path: string;
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen w-72 flex-shrink-0
        border-r border-slate-700/50 bg-slate-900/95 backdrop-blur-xl
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 leading-tight">CyberSafe</h1>
              <p className="text-xs text-slate-400">Campus</p>
            </div>
            <button onClick={onClose} className="ml-auto lg:hidden text-slate-400 hover:text-slate-200" aria-label="Close menu">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-thin">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} icon={Icon} label={item.label} onClick={onClose} />
              );
            })}
          </nav>

          <div className="border-t border-slate-700/50 p-3">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2 bg-slate-800/50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">Stay Safe</p>
                <p className="text-xs text-slate-500">Learn. Practice. Protect.</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavLink({ to, icon: Icon, label, onClick }: { to: string; icon: typeof Shield; label: string; onClick: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <a
      href={to}
      onClick={(e) => { e.preventDefault(); onClick(); navigate(to); }}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
        isActive
          ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-400'
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
      data-nav={to}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </a>
  );
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, deleteNotification } = useData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); return; }
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    modules.forEach(m => {
      if (m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.category.toLowerCase().includes(q))
        results.push({ category: 'Module', title: m.title, description: m.description, path: `/student/modules/${m.id}` });
    });
    videos.forEach(v => {
      if (v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q))
        results.push({ category: 'Video', title: v.title, description: v.description, path: '/student/videos' });
    });
    notes.forEach(n => {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.includes(q)))
        results.push({ category: 'Note', title: n.title, description: n.content.slice(0, 80) + '...', path: '/student/notes' });
    });
    securityTips.forEach(t => {
      if (t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q))
        results.push({ category: 'Security Tip', title: t.title, description: t.content.slice(0, 80) + '...', path: '/student/security-tips' });
    });
    scenarios.forEach(s => {
      if (s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
        results.push({ category: 'Scenario', title: s.title, description: s.description, path: '/student/scenarios' });
    });
    quizzes.forEach(qz => {
      if (qz.title.toLowerCase().includes(q) || qz.description.toLowerCase().includes(q))
        results.push({ category: 'Quiz', title: qz.title, description: qz.description, path: '/student/quizzes' });
    });

    setSearchResults(results.slice(0, 10));
  };

  const handleResultClick = (path: string) => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notifIcons: Record<string, typeof Bell> = {
    info: Bell,
    success: Shield,
    warning: Lightbulb,
    achievement: Trophy,
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl px-4 py-3">
        <button onClick={onMenuClick} className="lg:hidden text-slate-400 hover:text-slate-200" aria-label="Open menu">
          <Menu className="w-6 h-6" />
        </button>

        <div ref={searchRef} className="relative flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { handleSearch(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              placeholder="Search modules, videos, notes, tips..."
              className="w-full rounded-xl bg-slate-800/60 border border-slate-700/50 pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              aria-label="Search content"
            />
          </div>
          {showSearch && searchQuery.trim() && (
            <div className="absolute top-full mt-2 w-full rounded-xl border border-slate-700/50 bg-slate-900 shadow-2xl max-h-96 overflow-y-auto z-50">
              {searchResults.length > 0 ? (
                searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleResultClick(r.path)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-800/60 transition-colors border-b border-slate-800 last:border-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{r.category}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-200">{r.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{r.description}</p>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-slate-400">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-700/50 bg-slate-900 shadow-2xl z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                  <h3 className="text-sm font-semibold text-slate-200">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllNotificationsRead} className="text-xs text-blue-400 hover:text-blue-300">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(n => {
                      const NIcon = notifIcons[n.type] || Bell;
                      return (
                        <div key={n.id} className={`px-4 py-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors ${!n.read ? 'bg-blue-500/5' : ''}`}>
                          <div className="flex gap-3">
                            <NIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-200">{n.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                              <p className="text-xs text-slate-600 mt-1">{timeAgo(n.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2 ml-8">
                            {!n.read && (
                              <button onClick={() => markNotificationRead(n.id)} className="text-xs text-blue-400 hover:text-blue-300">Mark read</button>
                            )}
                            {n.link && (
                              <button onClick={() => { setShowNotifs(false); navigate(n.link!); }} className="text-xs text-slate-400 hover:text-slate-200">Open</button>
                            )}
                            <button onClick={() => deleteNotification(n.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No notifications yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-800/60 transition-colors"
              aria-label="Profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-700/50 bg-slate-900 shadow-2xl z-50">
                <div className="px-4 py-3 border-b border-slate-700/50">
                  <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button onClick={() => { setShowProfile(false); navigate('/student/profile'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800/60 transition-colors">
                    <User className="w-4 h-4" /> Profile
                  </button>
                  <button onClick={() => { setShowProfile(false); navigate('/student/settings'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800/60 transition-colors">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button onClick={() => { setShowProfile(false); navigate('/student/achievements'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800/60 transition-colors">
                    <Trophy className="w-4 h-4" /> Achievements
                  </button>
                  <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to log out? Your progress is saved and will be here when you return."
        confirmLabel="Logout"
        variant="danger"
      />
    </>
  );
}
