import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { container } from '../../di/container';

type Role = 'organization' | 'collaborator' | undefined;

type AppState = {
  isAuthenticated: boolean;
  user?: { uid: string; email?: string };
  role: Role;
  accessCode?: string;
  hydrated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  setUser: (u?: { uid: string; email?: string }) => void;
  setRole: (r: Role) => void;
  setAccessCode: (c?: string) => void;
  loadInitialData: () => Promise<void>;
};

export const useAppState = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: undefined,
      role: undefined,
      accessCode: undefined,
      hydrated: false,
      setIsAuthenticated: (v: boolean) => set({ isAuthenticated: v }),
      setUser: (u?: { uid: string; email?: string }) => set({ user: u }),
      setRole: (r: Role) => set({ role: r }),
      setAccessCode: (c?: string) => {
        const sanitized = c?.trim();
        const valid = sanitized && /^\d{9}$/.test(sanitized) ? sanitized : undefined;
        set({ accessCode: valid });
      },
      loadInitialData: async () => {
        try {
          const profile = await container.getCurrentUserProfileUseCase().execute();
          if (profile) {
            if (profile.role && !get().role) {
              set({ role: profile.role });
            }
            if (profile.organizationId && !get().accessCode) {
              set({ accessCode: profile.organizationId });
            }
          }
        } catch (error) {
          console.error("Failed to load initial user data:", error);
        }
      },
    }),
    {
      name: 'app-storage', 
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ role: state.role, accessCode: state.accessCode }),
      onRehydrateStorage: () => (state) => {
        // Marca como hidratado após reidratação do persist
        useAppState.setState({ hydrated: true });
      },
    }
  )
);

// Carrega os dados iniciais uma vez quando o app é iniciado
useAppState.getState().loadInitialData();
