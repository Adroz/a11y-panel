import { create } from "zustand";

interface SettingsState {
  plainLanguage: boolean;
  showInspector: boolean;
  setPlainLanguage: (enabled: boolean) => void;
  setShowInspector: (enabled: boolean) => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = "userSettings";

function persistSettings(patch: Partial<{ plainLanguage: boolean; showInspector: boolean }>) {
  chrome.storage.local.get(STORAGE_KEY).then((data) => {
    const current = (data[STORAGE_KEY] as Record<string, unknown>) ?? {};
    chrome.storage.local.set({ [STORAGE_KEY]: { ...current, ...patch } });
  });
}

export const useSettingsStore = create<SettingsState>((set) => ({
  plainLanguage: true,
  showInspector: false,

  setPlainLanguage: (enabled) => {
    set({ plainLanguage: enabled });
    persistSettings({ plainLanguage: enabled });
  },

  setShowInspector: (enabled) => {
    set({ showInspector: enabled });
    persistSettings({ showInspector: enabled });
  },

  loadFromStorage: () => {
    chrome.storage.local.get(STORAGE_KEY).then((data) => {
      const saved = data[STORAGE_KEY] as { plainLanguage?: boolean; showInspector?: boolean } | undefined;
      if (saved) {
        const patch: Partial<SettingsState> = {};
        if (saved.plainLanguage !== undefined) patch.plainLanguage = saved.plainLanguage;
        if (saved.showInspector !== undefined) patch.showInspector = saved.showInspector;
        set(patch);
      }
    });
  },
}));
