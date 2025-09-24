import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, AuthTokens, UserRole } from '@/types';

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (user: AuthUser, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (user: AuthUser, tokens: AuthTokens) => {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        // Clear tokens from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (userData: Partial<AuthUser>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      checkAuth: () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (accessToken && refreshToken) {
          // You could validate the token here
          return true;
        }
        
        return false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useUserRole = () => useAuthStore((state) => state.user?.role);
export const useSchoolId = () => useAuthStore((state) => state.user?.schoolId);

// Helper functions
export const hasRole = (role: UserRole): boolean => {
  const userRole = useAuthStore.getState().user?.role;
  return userRole === role;
};

export const hasAnyRole = (roles: UserRole[]): boolean => {
  const userRole = useAuthStore.getState().user?.role;
  return roles.includes(userRole as UserRole);
};

export const isAdmin = (): boolean => hasRole(UserRole.ADMIN);
export const isTeacher = (): boolean => hasAnyRole([UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER]);
export const isParent = (): boolean => hasRole(UserRole.PARENT);
export const isStudent = (): boolean => hasRole(UserRole.STUDENT);
