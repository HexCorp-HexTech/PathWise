/* ============================================
   VIDYA AI — Zustand Auth Store
   ============================================ */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, StudentProfile, TeacherProfile, UserRole } from '../types';

interface AuthState {
  user: User | null;
  studentProfile: StudentProfile | null;
  teacherProfile: TeacherProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  loginStudent: (user: User, profile: StudentProfile) => void;
  loginTeacher: (user: User, profile: TeacherProfile) => void;
  loginParent: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateStudentProfile: (updates: Partial<StudentProfile>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      studentProfile: null,
      teacherProfile: null,
      isAuthenticated: false,
      isLoading: false,

      loginStudent: (user, profile) =>
        set({
          user,
          studentProfile: profile,
          teacherProfile: null,
          isAuthenticated: true,
          isLoading: false,
        }),

      loginTeacher: (user, profile) =>
        set({
          user,
          studentProfile: null,
          teacherProfile: profile,
          isAuthenticated: true,
          isLoading: false,
        }),

      loginParent: (user) =>
        set({
          user,
          studentProfile: null,
          teacherProfile: null,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          studentProfile: null,
          teacherProfile: null,
          isAuthenticated: false,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates, updatedAt: Date.now() } : null,
        })),

      updateStudentProfile: (updates) =>
        set((state) => ({
          studentProfile: state.studentProfile
            ? { ...state.studentProfile, ...updates }
            : null,
        })),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'pathwise-auth',
    }
  )
);

// Helper to get current role
export function useCurrentRole(): UserRole | null {
  return useAuthStore((s) => s.user?.role ?? null);
}
