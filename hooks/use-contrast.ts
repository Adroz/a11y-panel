import { create } from "zustand";
import type { ResponseMessage } from "@/types/messages";
import type { ContrastAuditResult, ContrastPickerResult } from "@/types/contrast";

type ContrastMode = "idle" | "audit-loading" | "audit-complete" | "picker-active" | "error";

interface ContrastState {
  mode: ContrastMode;
  auditResult: ContrastAuditResult | null;
  pickerResult: ContrastPickerResult | null;
  highlightedSelector: string | null;
  error: string | null;

  runAudit: () => void;
  togglePicker: () => void;
  highlightElement: (selector: string | null) => void;
  reset: () => void;
}

export const useContrastStore = create<ContrastState>((set, get) => ({
  mode: "idle",
  auditResult: null,
  pickerResult: null,
  highlightedSelector: null,
  error: null,

  runAudit: () => {
    const { mode } = get();
    // Disable picker if active
    if (mode === "picker-active") {
      chrome.runtime.sendMessage({ type: "DISABLE_CONTRAST_PICKER" }).catch(() => {});
    }

    set({ mode: "audit-loading", error: null, pickerResult: null });

    chrome.runtime.sendMessage({ type: "RUN_CONTRAST_AUDIT" }, (response: ResponseMessage) => {
      if (chrome.runtime.lastError) {
        set({
          mode: "error",
          error: chrome.runtime.lastError.message ?? "Connection failed",
        });
        return;
      }

      switch (response.type) {
        case "CONTRAST_AUDIT_COMPLETE":
          set({
            mode: "audit-complete",
            auditResult: response.result,
            error: null,
          });
          break;
        case "CONTRAST_AUDIT_ERROR":
        case "SCAN_ERROR":
          set({ mode: "error", error: response.error });
          break;
      }
    });
  },

  togglePicker: () => {
    const { mode } = get();

    if (mode === "picker-active") {
      // Disable picker
      chrome.runtime.sendMessage({ type: "DISABLE_CONTRAST_PICKER" }, (response: ResponseMessage) => {
        if (chrome.runtime.lastError) {
          set({ mode: "idle" });
          return;
        }
        if (response.type === "CONTRAST_PICKER_DISABLED") {
          set({ mode: "idle", pickerResult: null });
        }
      });
      return;
    }

    // Enable picker
    set({ mode: "picker-active", pickerResult: null, error: null });
    chrome.runtime.sendMessage({ type: "ENABLE_CONTRAST_PICKER" }, (response: ResponseMessage) => {
      if (chrome.runtime.lastError) {
        set({
          mode: "error",
          error: chrome.runtime.lastError.message ?? "Connection failed",
        });
        return;
      }
      if (response.type === "SCAN_ERROR") {
        set({ mode: "error", error: response.error });
      }
    });
  },

  highlightElement: (selector: string | null) => {
    const { highlightedSelector } = get();

    // Clear previous highlight
    if (highlightedSelector) {
      chrome.runtime.sendMessage({ type: "CLEAR_CONTRAST_HIGHLIGHT" }).catch(() => {});
    }

    if (selector) {
      chrome.runtime.sendMessage({ type: "HIGHLIGHT_CONTRAST_ELEMENT", selector }).catch(() => {});
    }

    set({ highlightedSelector: selector });
  },

  reset: () => {
    const { mode, highlightedSelector } = get();
    if (mode === "picker-active") {
      chrome.runtime.sendMessage({ type: "DISABLE_CONTRAST_PICKER" }).catch(() => {});
    }
    if (highlightedSelector) {
      chrome.runtime.sendMessage({ type: "CLEAR_CONTRAST_HIGHLIGHT" }).catch(() => {});
    }
    set({
      mode: "idle",
      auditResult: null,
      pickerResult: null,
      highlightedSelector: null,
      error: null,
    });
  },
}));

// Module-level listener for unsolicited messages from content script
chrome.runtime.onMessage.addListener((message: ResponseMessage) => {
  if (message.type === "CONTRAST_PICKER_RESULT") {
    useContrastStore.setState({ pickerResult: message.result });
  }
  if (message.type === "CONTRAST_PICKER_DISABLED") {
    useContrastStore.setState({ mode: "idle" });
  }
});
