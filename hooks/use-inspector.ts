import { create } from "zustand";
import type { ResponseMessage } from "@/types/messages";
import type { InspectorResult } from "@/types/inspector";

type InspectorMode = "idle" | "active";

interface InspectorState {
  mode: InspectorMode;
  result: InspectorResult | null;

  toggle: () => void;
  reset: () => void;
}

export const useInspectorStore = create<InspectorState>((set, get) => ({
  mode: "idle",
  result: null,

  toggle: () => {
    const { mode } = get();

    if (mode === "active") {
      chrome.runtime.sendMessage({ type: "DISABLE_INSPECTOR" }, (response: ResponseMessage) => {
        if (chrome.runtime.lastError) {
          set({ mode: "idle" });
          return;
        }
        if (response.type === "INSPECTOR_DISABLED") {
          set({ mode: "idle", result: null });
        }
      });
      return;
    }

    set({ mode: "active", result: null });
    chrome.runtime.sendMessage({ type: "ENABLE_INSPECTOR" }, (response: ResponseMessage) => {
      if (chrome.runtime.lastError) {
        set({ mode: "idle" });
        return;
      }
      if (response.type === "SCAN_ERROR") {
        set({ mode: "idle" });
      }
    });
  },

  reset: () => {
    const { mode } = get();
    if (mode === "active") {
      chrome.runtime.sendMessage({ type: "DISABLE_INSPECTOR" }).catch(() => {});
    }
    set({ mode: "idle", result: null });
  },
}));

// Module-level listener for unsolicited messages from content script
chrome.runtime.onMessage.addListener((message: ResponseMessage) => {
  if (message.type === "INSPECTOR_RESULT") {
    useInspectorStore.setState({ result: message.result });
  }
  if (message.type === "INSPECTOR_DISABLED") {
    useInspectorStore.setState({ mode: "idle" });
  }
});
