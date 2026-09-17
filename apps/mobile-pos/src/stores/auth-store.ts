import { create } from 'zustand';

export interface StaffSession {
  staffId: string;
  name: string;
  email: string;
  role: string;
  branchId: string;
  branchName: string;
  merchantId: string;
  token: string;
}

interface AuthState {
  session: StaffSession | null;
  isAuthenticated: boolean;
  login: (session: StaffSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAuthenticated: false,
  login: (session) => set({ session, isAuthenticated: true }),
  logout: () => set({ session: null, isAuthenticated: false }),
}));
