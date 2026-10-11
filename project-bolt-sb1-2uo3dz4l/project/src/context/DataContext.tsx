import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ModuleProgress, QuizResult, MockTestResult, Notification, UserStats } from '@/lib/types';
import { storage, calculateStats, getUnlockedAchievements } from '@/lib/storage';
import { useAuth } from './AuthContext';
import { generateId } from '@/lib/utils';
import { achievements } from '@/lib/data';

interface DataContextValue {
  stats: UserStats | null;
  unlockedAchievements: string[];
  moduleProgress: ModuleProgress[];
  quizResults: QuizResult[];
  mockTestResults: MockTestResult[];
  bookmarks: { modules: string[]; notes: string[]; tips: string[] };
  scenarioProgress: string[];
  phishingScore: number;
  videoProgress: string[];
  notifications: Notification[];
  settings: { emailNotifications: boolean; pushNotifications: boolean; weeklyDigest: boolean; autoPlayVideos: boolean };
  // Module progress
  markModuleComplete: (moduleId: string) => void;
  isModuleComplete: (moduleId: string) => boolean;
  accessModule: (moduleId: string) => void;
  // Bookmarks
  toggleModuleBookmark: (moduleId: string) => void;
  toggleNoteBookmark: (noteId: string) => void;
  toggleTipBookmark: (tipId: string) => void;
  isModuleBookmarked: (moduleId: string) => boolean;
  isNoteBookmarked: (noteId: string) => boolean;
  isTipBookmarked: (tipId: string) => boolean;
  // Quiz
  saveQuizResult: (result: QuizResult) => void;
  // Mock test
  saveMockTestResult: (result: MockTestResult) => void;
  // Scenarios
  completeScenario: (scenarioId: string) => void;
  isScenarioCompleted: (scenarioId: string) => boolean;
  // Phishing
  setPhishingScore: (score: number) => void;
  // Videos
  completeVideo: (videoId: string) => void;
  isVideoCompleted: (videoId: string) => boolean;
  // Notifications
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  unreadCount: number;
  // Settings
  updateSettings: (s: Partial<{ emailNotifications: boolean; pushNotifications: boolean; weeklyDigest: boolean; autoPlayVideos: boolean }>) => void;
  // Refresh
  refresh: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id ?? '';

  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [mockTestResults, setMockTestResults] = useState<MockTestResult[]>([]);
  const [bookmarks, setBookmarks] = useState({ modules: [] as string[], notes: [] as string[], tips: [] as string[] });
  const [scenarioProgress, setScenarioProgress] = useState<string[]>([]);
  const [phishingScore, setPhishingScoreState] = useState(0);
  const [videoProgress, setVideoProgress] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState({ emailNotifications: true, pushNotifications: true, weeklyDigest: false, autoPlayVideos: true });
  const [stats, setStats] = useState<UserStats | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [prevUnlocked, setPrevUnlocked] = useState<string[]>([]);

  const refresh = useCallback(() => {
    if (!uid) return;
    const mp = storage.getModuleProgress(uid);
    setModuleProgress(mp);
    setQuizResults(storage.getQuizResults(uid));
    setMockTestResults(storage.getMockTestResults(uid));
    setBookmarks(storage.getBookmarks(uid));
    setScenarioProgress(storage.getScenarioProgress(uid));
    setPhishingScoreState(storage.getPhishingScore(uid));
    setVideoProgress(storage.getVideoProgress(uid));
    setNotifications(storage.getNotifications(uid));
    setSettings(storage.getSettings(uid));
    const s = calculateStats(uid);
    setStats(s);
    setUnlockedAchievements(getUnlockedAchievements(s));
  }, [uid]);

  useEffect(() => {
    if (uid) {
      refresh();
      setPrevUnlocked(getUnlockedAchievements(calculateStats(uid)));
    } else {
      setModuleProgress([]);
      setQuizResults([]);
      setMockTestResults([]);
      setBookmarks({ modules: [], notes: [], tips: [] });
      setScenarioProgress([]);
      setPhishingScoreState(0);
      setVideoProgress([]);
      setNotifications([]);
      setStats(null);
      setUnlockedAchievements([]);
    }
  }, [uid, refresh]);

  // Check for new achievements
  useEffect(() => {
    if (!uid || !stats) return;
    const newUnlocked = unlockedAchievements.filter(id => !prevUnlocked.includes(id));
    if (newUnlocked.length > 0) {
      for (const achId of newUnlocked) {
        const ach = achievements.find(a => a.id === achId);
        if (ach) {
          const newNotifs = storage.getNotifications(uid);
          newNotifs.unshift({
            id: generateId('notif'),
            title: 'Achievement Unlocked!',
            message: `You earned "${ach.title}" - ${ach.description}`,
            type: 'achievement',
            read: false,
            createdAt: new Date().toISOString(),
            link: '/student/achievements',
          });
          storage.setNotifications(uid, newNotifs);
          setNotifications(newNotifs);
        }
      }
      setPrevUnlocked(unlockedAchievements);
    }
  }, [unlockedAchievements, uid, stats, prevUnlocked]);

  const markModuleComplete = useCallback((moduleId: string) => {
    if (!uid) return;
    const mp = storage.getModuleProgress(uid);
    const existing = mp.find(p => p.moduleId === moduleId);
    if (existing?.completed) return;
    const updated = existing
      ? mp.map(p => p.moduleId === moduleId ? { ...p, completed: true, completedAt: new Date().toISOString() } : p)
      : [...mp, { moduleId, completed: true, completedAt: new Date().toISOString(), lastAccessed: new Date().toISOString() }];
    storage.setModuleProgress(uid, updated);
    setModuleProgress(updated);
    const s = calculateStats(uid);
    setStats(s);
    setUnlockedAchievements(getUnlockedAchievements(s));
  }, [uid]);

  const accessModule = useCallback((moduleId: string) => {
    if (!uid) return;
    const mp = storage.getModuleProgress(uid);
    const existing = mp.find(p => p.moduleId === moduleId);
    if (!existing) {
      const updated = [...mp, { moduleId, completed: false, lastAccessed: new Date().toISOString() }];
      storage.setModuleProgress(uid, updated);
      setModuleProgress(updated);
    }
  }, [uid]);

  const isModuleComplete = useCallback((moduleId: string) => {
    return moduleProgress.some(p => p.moduleId === moduleId && p.completed);
  }, [moduleProgress]);

  const toggleModuleBookmark = useCallback((moduleId: string) => {
    if (!uid) return;
    const b = storage.getBookmarks(uid);
    const has = b.modules.includes(moduleId);
    b.modules = has ? b.modules.filter((m: string) => m !== moduleId) : [...b.modules, moduleId];
    storage.setBookmarks(uid, b);
    setBookmarks(b);
    const s = calculateStats(uid);
    setStats(s);
    setUnlockedAchievements(getUnlockedAchievements(s));
  }, [uid]);

  const toggleNoteBookmark = useCallback((noteId: string) => {
    if (!uid) return;
    const b = storage.getBookmarks(uid);
    const has = b.notes.includes(noteId);
    b.notes = has ? b.notes.filter((n: string) => n !== noteId) : [...b.notes, noteId];
    storage.setBookmarks(uid, b);
    setBookmarks(b);
    const s = calculateStats(uid);
    setStats(s);
    setUnlockedAchievements(getUnlockedAchievements(s));
  }, [uid]);

  const toggleTipBookmark = useCallback((tipId: string) => {
    if (!uid) return;
    const b = storage.getBookmarks(uid);
    const has = b.tips.includes(tipId);
    b.tips = has ? b.tips.filter((t: string) => t !== tipId) : [...b.tips, tipId];
    storage.setBookmarks(uid, b);
    setBookmarks(b);
    const s = calculateStats(uid);
    setStats(s);
    setUnlockedAchievements(getUnlockedAchievements(s));
  }, [uid]);

  const isModuleBookmarked = useCallback((moduleId: string) => bookmarks.modules.includes(moduleId), [bookmarks]);
  const isNoteBookmarked = useCallback((noteId: string) => bookmarks.notes.includes(noteId), [bookmarks]);
  const isTipBookmarked = useCallback((tipId: string) => bookmarks.tips.includes(tipId), [bookmarks]);

  const saveQuizResult = useCallback((result: QuizResult) => {
    if (!uid) return;
    const results = storage.getQuizResults(uid);
    results.push(result);
    storage.setQuizResults(uid, results);
    setQuizResults(results);
    const s = calculateStats(uid);
    setStats(s);
    setUnlockedAchievements(getUnlockedAchievements(s));
  }, [uid]);

  const saveMockTestResult = useCallback((result: MockTestResult) => {
    if (!uid) return;
    const results = storage.getMockTestResults(uid);
    results.push(result);
    storage.setMockTestResults(uid, results);
    setMockTestResults(results);
    const s = calculateStats(uid);
    setStats(s);
    setUnlockedAchievements(getUnlockedAchievements(s));
  }, [uid]);

  const completeScenario = useCallback((scenarioId: string) => {
    if (!uid) return;
    const sp = storage.getScenarioProgress(uid);
    if (!sp.includes(scenarioId)) {
      sp.push(scenarioId);
      storage.setScenarioProgress(uid, sp);
      setScenarioProgress(sp);
      const s = calculateStats(uid);
      setStats(s);
      setUnlockedAchievements(getUnlockedAchievements(s));
    }
  }, [uid]);

  const isScenarioCompleted = useCallback((scenarioId: string) => scenarioProgress.includes(scenarioId), [scenarioProgress]);

  const setPhishingScore = useCallback((score: number) => {
    if (!uid) return;
    const prev = storage.getPhishingScore(uid);
    if (score > prev) {
      storage.setPhishingScore(uid, score);
      setPhishingScoreState(score);
      const s = calculateStats(uid);
      setStats(s);
      setUnlockedAchievements(getUnlockedAchievements(s));
    }
  }, [uid]);

  const completeVideo = useCallback((videoId: string) => {
    if (!uid) return;
    const vp = storage.getVideoProgress(uid);
    if (!vp.includes(videoId)) {
      vp.push(videoId);
      storage.setVideoProgress(uid, vp);
      setVideoProgress(vp);
    }
  }, [uid]);

  const isVideoCompleted = useCallback((videoId: string) => videoProgress.includes(videoId), [videoProgress]);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    if (!uid) return;
    const notifs = storage.getNotifications(uid);
    notifs.unshift({ ...n, id: generateId('notif'), createdAt: new Date().toISOString(), read: false });
    storage.setNotifications(uid, notifs);
    setNotifications(notifs);
  }, [uid]);

  const markNotificationRead = useCallback((id: string) => {
    if (!uid) return;
    const notifs = storage.getNotifications(uid).map(n => n.id === id ? { ...n, read: true } : n);
    storage.setNotifications(uid, notifs);
    setNotifications(notifs);
  }, [uid]);

  const markAllNotificationsRead = useCallback(() => {
    if (!uid) return;
    const notifs = storage.getNotifications(uid).map(n => ({ ...n, read: true }));
    storage.setNotifications(uid, notifs);
    setNotifications(notifs);
  }, [uid]);

  const deleteNotification = useCallback((id: string) => {
    if (!uid) return;
    const notifs = storage.getNotifications(uid).filter(n => n.id !== id);
    storage.setNotifications(uid, notifs);
    setNotifications(notifs);
  }, [uid]);

  const updateSettings = useCallback((s: Partial<typeof settings>) => {
    if (!uid) return;
    const updated = { ...storage.getSettings(uid), ...s };
    storage.setSettings(uid, updated);
    setSettings(updated);
  }, [uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DataContext.Provider value={{
      stats, unlockedAchievements, moduleProgress, quizResults, mockTestResults, bookmarks,
      scenarioProgress, phishingScore, videoProgress, notifications, settings,
      markModuleComplete, isModuleComplete, accessModule,
      toggleModuleBookmark, toggleNoteBookmark, toggleTipBookmark,
      isModuleBookmarked, isNoteBookmarked, isTipBookmarked,
      saveQuizResult, saveMockTestResult, completeScenario, isScenarioCompleted,
      setPhishingScore, completeVideo, isVideoCompleted,
      addNotification, markNotificationRead, markAllNotificationsRead, deleteNotification, unreadCount,
      updateSettings, refresh,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
