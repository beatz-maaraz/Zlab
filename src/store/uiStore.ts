import { create } from 'zustand';
import { SettingsTab, UserSettings } from '../types';
import { INITIAL_SETTINGS } from '../mockData';

const SETTINGS_STORAGE_KEY = 'zlab_user_settings';

const loadStoredSettings = (): UserSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load user settings from localStorage:', e);
  }
  return INITIAL_SETTINGS;
};

interface UIStoreState {
  activeModal: 'settings' | 'export' | 'prototype' | 'shortcuts' | 'newDesign' | null;
  openModal: (modal: 'settings' | 'export' | 'prototype' | 'shortcuts' | 'newDesign') => void;
  closeModal: () => void;

  settingsTab: SettingsTab;
  setSettingsTab: (tab: SettingsTab) => void;

  userSettings: UserSettings;
  updateUserSettings: (updates: Partial<UserSettings>) => void;

  leftSidebarWidth: number;
  setLeftSidebarWidth: (width: number) => void;
  isLeftSidebarCollapsed: boolean;
  toggleLeftSidebar: () => void;

  inspectorWidth: number;
  setInspectorWidth: (width: number) => void;
  isInspectorCollapsed: boolean;
  toggleInspector: () => void;

  toast: { message: string; type?: 'info' | 'success' | 'warning' } | null;
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  hideToast: () => void;

  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  activeModal: null,
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),

  settingsTab: 'general',
  setSettingsTab: (settingsTab) => set({ settingsTab }),

  userSettings: loadStoredSettings(),
  updateUserSettings: (updates) =>
    set((state) => {
      const next = { ...state.userSettings, ...updates };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return { userSettings: next };
    }),

  leftSidebarWidth: 300,
  setLeftSidebarWidth: (leftSidebarWidth) => set({ leftSidebarWidth }),
  isLeftSidebarCollapsed: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  toggleLeftSidebar: () =>
    set((state) => ({ isLeftSidebarCollapsed: !state.isLeftSidebarCollapsed })),

  inspectorWidth: 288,
  setInspectorWidth: (inspectorWidth) => set({ inspectorWidth }),
  isInspectorCollapsed: typeof window !== 'undefined' ? window.innerWidth < 1024 : false,
  toggleInspector: () =>
    set((state) => ({ isInspectorCollapsed: !state.isInspectorCollapsed })),

  toast: null,
  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      set((s) => (s.toast?.message === message ? { toast: null } : s));
    }, 3000);
  },
  hideToast: () => set({ toast: null }),

  isAuthenticated: false,
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
}));
