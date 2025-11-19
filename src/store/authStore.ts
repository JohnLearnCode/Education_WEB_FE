import { create } from 'zustand';
interface User {
  name: string;
  email: string;
  avatar?: string;
}
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (user) => set({ isAuthenticated: true, user: { ...user, avatar: 'https://i.pravatar.cc/150?img=7' } }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));