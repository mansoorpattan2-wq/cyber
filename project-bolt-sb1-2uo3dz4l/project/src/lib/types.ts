export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'student';
  createdAt: string;
  bio?: string;
  university?: string;
  major?: string;
  year?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  content: string;
  videoId: string;
  quizId: string;
  order: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  url: string;
  duration: string;
  thumbnail: string;
  category: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  moduleId: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  category: string;
  questions: QuizQuestion[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  situation: string;
  choices: {
    text: string;
    isSafe: boolean;
    explanation: string;
    warningSigns: string[];
  }[];
  category: string;
}

export interface PhishingMessage {
  id: string;
  title: string;
  type: 'email' | 'sms' | 'website' | 'social';
  content: string;
  warningSigns: {
    id: string;
    text: string;
    isReal: boolean;
    explanation: string;
  }[];
  explanation: string;
}

export interface SecurityTip {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: string;
  source?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  moduleId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed';
  color: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'achievement';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: UserStats) => boolean;
  tier: 'bronze' | 'silver' | 'gold';
}

export interface UserStats {
  completedModules: number;
  completedQuizzes: number;
  quizBestScores: Record<string, number>;
  completedScenarios: number;
  phishingDetectiveScore: number;
  bookmarksCount: number;
  mockTestsCompleted: number;
  loginStreak: number;
  totalScore: number;
}

export interface QuizResult {
  quizId: string;
  score: number;
  total: number;
  percentage: number;
  answers: Record<string, number>;
  completedAt: string;
  topicPerformance: Record<string, { correct: number; total: number }>;
}

export interface MockTestResult {
  testId: string;
  score: number;
  total: number;
  percentage: number;
  timeUsed: number;
  answers: Record<string, number>;
  completedAt: string;
}

export interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  completedAt?: string;
  lastAccessed: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
