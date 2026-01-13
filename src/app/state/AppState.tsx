import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { container } from '../../di/container';

type Role = 'organization' | 'collaborator' | undefined;

type AppState = {
  role: Role;
  accessCode?: string;
  setRole: (r: Role) => void;
  setAccessCode: (c?: string) => void;
  loadInitialData: () => Promise<void>;
};

export const useAppState = create<AppState>()(
  persist(
    (set, get) => ({
      role: undefined,
      accessCode: undefined,
      setRole: (r: Role) => set({ role: r }),
      setAccessCode: (c?: string) => set({ accessCode: c }),
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
    }
  )
);

// Carrega os dados iniciais uma vez quando o app é iniciado
useAppState.getState().loadInitialData();
