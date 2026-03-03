import { create } from "zustand";
import type { ResponseMessage } from "@/types/messages";
import type { ContrastAuditResult, ContrastPickerResult, AppliedFix } from "@/types/contrast";
import { useColorPickerStore } from "./use-color-picker";
import { useInspectorStore } from "./use-inspector";

type ContrastMode = "idle" | "audit-loading" | "audit-complete" | "picker-active" | "error";

interface ContrastState {
  mode: ContrastMode;
  auditResult: ContrastAuditResult | null;
  pickerResult: ContrastPickerResult | null;
  highlightedSelector: string | null;
  error: string | null;
  appliedFixes: AppliedFix[];

  runAudit: () => void;
  togglePicker: () => void;
  highlightElement: (selector: string | null) => void;
  applyFix: (selector: string, originalHex: string, newHex: string, achievedRatio: number) => void;
  revertFix: (selector: string) => void;
  clearAllFixes: () => void;
  reset: () => void;
}

export const useContrastStore = create<ContrastState>((set, get) => ({
  mode: "idle",
  auditResult: null,
  pickerResult: null,
  highlightedSelector: null,
  error: null,
  appliedFixes: [],

  runAudit: () => {
    const { mode, appliedFixes } = get();
    // Disable picker if active
    if (mode === "picker-active") {
      chrome.runtime.sendMessage({ type: "DISABLE_CONTRAST_PICKER" }).catch(() => {});
    }

    // Clear applied fixes so audit sees original styles
    if (appliedFixes.length > 0) {
      chrome.runtime.sendMessage({ type: "CLEAR_CONTRAST_FIXES" }).catch(() => {});
      set({ appliedFixes: [] });
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

    // Disable pixel picker if active
    const pixelState = useColorPickerStore.getState();
    if (pixelState.pickerMode === "active") {
      pixelState.stopPixelPicker();
    }

    // Disable inspector if active
    const inspectorState = useInspectorStore.getState();
    if (inspectorState.mode === "active") {
      inspectorState.reset();
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

  applyFix: (selector, originalHex, newHex, achievedRatio) => {
    chrome.runtime.sendMessage({ type: "APPLY_CONTRAST_FIX", selector, property: "color", hex: newHex }).catch(() => {});
    const { appliedFixes } = get();
    const existing = appliedFixes.findIndex((f) => f.selector === selector);
    const fix: AppliedFix = { selector, property: "color", originalHex, newHex, achievedRatio };
    if (existing >= 0) {
      const updated = [...appliedFixes];
      updated[existing] = fix;
      set({ appliedFixes: updated });
    } else {
      set({ appliedFixes: [...appliedFixes, fix] });
    }
  },

  revertFix: (selector) => {
    chrome.runtime.sendMessage({ type: "REVERT_CONTRAST_FIX", selector }).catch(() => {});
    set({ appliedFixes: get().appliedFixes.filter((f) => f.selector !== selector) });
  },

  clearAllFixes: () => {
    if (get().appliedFixes.length > 0) {
      chrome.runtime.sendMessage({ type: "CLEAR_CONTRAST_FIXES" }).catch(() => {});
      set({ appliedFixes: [] });
    }
  },

  reset: () => {
    const { mode, highlightedSelector, appliedFixes } = get();
    if (mode === "picker-active") {
      chrome.runtime.sendMessage({ type: "DISABLE_CONTRAST_PICKER" }).catch(() => {});
    }
    if (highlightedSelector) {
      chrome.runtime.sendMessage({ type: "CLEAR_CONTRAST_HIGHLIGHT" }).catch(() => {});
    }
    if (appliedFixes.length > 0) {
      chrome.runtime.sendMessage({ type: "CLEAR_CONTRAST_FIXES" }).catch(() => {});
    }
    set({
      mode: "idle",
      auditResult: null,
      pickerResult: null,
      highlightedSelector: null,
      error: null,
      appliedFixes: [],
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
