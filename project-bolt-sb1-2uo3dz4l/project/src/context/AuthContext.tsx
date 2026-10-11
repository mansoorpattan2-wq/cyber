import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/lib/types';
import { storage, calculateStats, getUnlockedAchievements } from '@/lib/storage';
import { generateId } from '@/lib/utils';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = storage.getSession();
    if (session) {
      const users = storage.getUsers();
      const found = users.find(u => u.id === session.userId);
      if (found) setUser(found);
    }
    setLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const users = storage.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { success: false, error: 'No account found with this email address.' };

    const passwords = storage.getPasswords();
    const stored = passwords[found.id];
    if (stored !== btoa(password)) return { success: false, error: 'Incorrect password. Please try again.' };

    setUser(found);
    storage.setSession({ userId: found.id });
    return { success: true };
  };

  const register = (name: string, email: string, password: string) => {
    const users = storage.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: generateId('user'),
      name,
      email,
      avatar: '',
      role: 'student',
      createdAt: new Date().toISOString(),
      bio: '',
      university: '',
      major: '',
      year: '',
    };

    users.push(newUser);
    storage.setUsers(users);

    const passwords = storage.getPasswords();
    passwords[newUser.id] = btoa(password);
    storage.setPasswords(passwords);

    // Seed welcome notification
    const notifications = storage.getNotifications(newUser.id);
    notifications.unshift({
      id: generateId('notif'),
      title: 'Welcome to CyberSafe Campus!',
      message: 'Start your cybersecurity journey by completing your first module.',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
      link: '/student/modules',
    });
    storage.setNotifications(newUser.id, notifications);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    storage.setSession(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    const users = storage.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = updated;
      storage.setUsers(users);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useUserStats() {
  const { user } = useAuth();
  if (!user) return null;
  const stats = calculateStats(user.id);
  return { stats, unlocked: getUnlockedAchievements(stats) };
}
