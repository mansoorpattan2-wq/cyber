import type { UserStats, ModuleProgress, QuizResult, MockTestResult, User, Notification } from './types';
import { achievements } from './data';

const PREFIX = 'cybersafe_';

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function remove(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

export const storage = {
  // Session
  getSession: (): { userId: string } | null => get('session', null as { userId: string } | null),
  setSession: (s: { userId: string } | null) => (s ? set('session', s) : remove('session')),

  // Users (demo account store)
  getUsers: (): User[] => get('users', [] as User[]),
  setUsers: (u: User[]) => set('users', u),

  // Passwords (demo only — stored as base64, NOT secure, clearly demo)
  getPasswords: (): Record<string, string> => get('passwords', {} as Record<string, string>),
  setPasswords: (p: Record<string, string>) => set('passwords', p),

  // Theme
  getTheme: (): 'dark' | 'light' => get('theme', 'dark' as 'dark' | 'light'),
  setTheme: (t: 'dark' | 'light') => set('theme', t),

  // Module progress
  getModuleProgress: (userId: string): ModuleProgress[] => get(`progress_${userId}`, [] as ModuleProgress[]),
  setModuleProgress: (userId: string, p: ModuleProgress[]) => set(`progress_${userId}`, p),

  // Quiz results
  getQuizResults: (userId: string): QuizResult[] => get(`quizResults_${userId}`, [] as QuizResult[]),
  setQuizResults: (userId: string, r: QuizResult[]) => set(`quizResults_${userId}`, r),

  // Mock test results
  getMockTestResults: (userId: string): MockTestResult[] => get(`mockTestResults_${userId}`, [] as MockTestResult[]),
  setMockTestResults: (userId: string, r: MockTestResult[]) => set(`mockTestResults_${userId}`, r),

  // Bookmarks
  getBookmarks: (userId: string): { modules: string[]; notes: string[]; tips: string[] } =>
    get(`bookmarks_${userId}`, { modules: [] as string[], notes: [] as string[], tips: [] as string[] }),
  setBookmarks: (userId: string, b: { modules: string[]; notes: string[]; tips: string[] }) => set(`bookmarks_${userId}`, b),

  // Scenario progress
  getScenarioProgress: (userId: string): string[] => get(`scenarios_${userId}`, [] as string[]),
  setScenarioProgress: (userId: string, s: string[]) => set(`scenarios_${userId}`, s),

  // Phishing detective score
  getPhishingScore: (userId: string): number => get(`phishingScore_${userId}`, 0),
  setPhishingScore: (userId: string, s: number) => set(`phishingScore_${userId}`, s),

  // Notifications
  getNotifications: (userId: string): Notification[] => get(`notifications_${userId}`, [] as Notification[]),
  setNotifications: (userId: string, n: Notification[]) => set(`notifications_${userId}`, n),

  // Video progress
  getVideoProgress: (userId: string): string[] => get(`videos_${userId}`, [] as string[]),
  setVideoProgress: (userId: string, v: string[]) => set(`videos_${userId}`, v),

  // Settings
  getSettings: (userId: string): { emailNotifications: boolean; pushNotifications: boolean; weeklyDigest: boolean; autoPlayVideos: boolean } =>
    get(`settings_${userId}`, { emailNotifications: true, pushNotifications: true, weeklyDigest: false, autoPlayVideos: true }),
  setSettings: (userId: string, s: { emailNotifications: boolean; pushNotifications: boolean; weeklyDigest: boolean; autoPlayVideos: boolean }) => set(`settings_${userId}`, s),
};

export function calculateStats(userId: string): UserStats {
  const progress = storage.getModuleProgress(userId);
  const quizResults = storage.getQuizResults(userId);
  const mockResults = storage.getMockTestResults(userId);
  const bookmarks = storage.getBookmarks(userId);
  const scenarios = storage.getScenarioProgress(userId);
  const phishingScore = storage.getPhishingScore(userId);

  const completedModules = progress.filter(p => p.completed).length;
  const completedQuizzes = quizResults.length;

  const quizBestScores: Record<string, number> = {};
  for (const r of quizResults) {
    if (!quizBestScores[r.quizId] || r.percentage > quizBestScores[r.quizId]) {
      quizBestScores[r.quizId] = r.percentage;
    }
  }

  const bookmarksCount = bookmarks.modules.length + bookmarks.notes.length + bookmarks.tips.length;
  const totalScore = quizResults.reduce((sum, r) => sum + r.percentage, 0) + mockResults.reduce((sum, r) => sum + r.percentage, 0);

  return {
    completedModules,
    completedQuizzes,
    quizBestScores,
    completedScenarios: scenarios.length,
    phishingDetectiveScore: phishingScore,
    bookmarksCount,
    mockTestsCompleted: mockResults.length,
    loginStreak: 1,
    totalScore,
  };
}

export function getUnlockedAchievements(stats: UserStats): string[] {
  return achievements.filter(a => a.condition(stats)).map(a => a.id);
}
