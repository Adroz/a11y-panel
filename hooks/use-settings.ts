import { create } from "zustand";

interface SettingsState {
  plainLanguage: boolean;
  setPlainLanguage: (enabled: boolean) => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = "userSettings";

export const useSettingsStore = create<SettingsState>((set) => ({
  plainLanguage: false,

  setPlainLanguage: (enabled) => {
    set({ plainLanguage: enabled });
    chrome.storage.local.set({ [STORAGE_KEY]: { plainLanguage: enabled } });
  },

  loadFromStorage: () => {
    chrome.storage.local.get(STORAGE_KEY).then((data) => {
      const saved = data[STORAGE_KEY] as { plainLanguage?: boolean } | undefined;
      if (saved?.plainLanguage !== undefined) {
        set({ plainLanguage: saved.plainLanguage });
      }
    });
  },
}));
