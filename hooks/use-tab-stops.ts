import { create } from "zustand";
import type { FocusTrapInfo, ResponseMessage } from "@/types/messages";

type TabStopsStatus = "off" | "loading" | "on" | "error";

interface TabStopsState {
  status: TabStopsStatus;
  count: number;
  traps: FocusTrapInfo[];
  error: string | null;

  toggle: () => void;
  reset: () => void;
}

export const useTabStopsStore = create<TabStopsState>((set, get) => ({
  status: "off",
  count: 0,
  traps: [],
  error: null,

  toggle: () => {
    const { status } = get();

    if (status === "on") {
      chrome.runtime.sendMessage({ type: "DISABLE_TAB_STOPS" }, (response: ResponseMessage) => {
        if (chrome.runtime.lastError) {
          set({ status: "off", count: 0, traps: [] });
          return;
        }
        if (response.type === "TAB_STOPS_DISABLED") {
          set({ status: "off", count: 0, traps: [] });
        }
      });
      return;
    }

    set({ status: "loading", error: null });
    chrome.runtime.sendMessage({ type: "ENABLE_TAB_STOPS" }, (response: ResponseMessage) => {
      if (chrome.runtime.lastError) {
        set({
          status: "error",
          error: chrome.runtime.lastError.message ?? "Connection failed",
        });
        return;
      }

      switch (response.type) {
        case "TAB_STOPS_ENABLED":
          set({
            status: "on",
            count: response.count,
            traps: response.traps,
            error: null,
          });
          break;
        case "TAB_STOPS_ERROR":
          set({ status: "error", error: response.error });
          break;
      }
    });
  },

  reset: () => {
    chrome.runtime.sendMessage({ type: "DISABLE_TAB_STOPS" }).catch(() => {});
    set({ status: "off", count: 0, traps: [], error: null });
  },
}));
