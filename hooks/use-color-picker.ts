import { create } from "zustand";
import type { ResponseMessage } from "@/types/messages";
import type {
  SwatchRole,
  ColorSwatchEntry,
  SwatchContrastPair,
  ColorSuggestion,
} from "@/types/contrast";
import { useContrastStore } from "./use-contrast";
import { hexToRgba, isValidHex, normalizeHex } from "@/lib/contrast/hex";
import { contrastRatio } from "@/lib/contrast/wcag";

export type PixelPickerMode = "idle" | "capturing" | "active" | "error";

interface ColorPickerState {
  pickerMode: PixelPickerMode;
  pickerError: string | null;
  swatches: ColorSwatchEntry[];
  comparisonPairs: SwatchContrastPair[];

  startPixelPicker: () => void;
  stopPixelPicker: () => void;
  addSwatch: (hex: string) => void;
  removeSwatch: (id: string) => void;
  updateSwatchRole: (id: string, role: SwatchRole) => void;
  updateSwatchHex: (id: string, hex: string) => void;
  toggleSwatchSelected: (id: string) => void;
  selectAllSwatches: () => void;
  clearAllSwatches: () => void;
  reset: () => void;
}

function computePairs(swatches: ColorSwatchEntry[]): SwatchContrastPair[] {
  const selected = swatches.filter((s) => s.selected);
  if (selected.length < 2) return [];

  const bgSwatches = selected.filter((s) => s.role === "background");
  const fgSwatches = selected.filter((s) => s.role !== "background");

  const pairs: SwatchContrastPair[] = [];

  if (bgSwatches.length > 0 && fgSwatches.length > 0) {
    // Role-aware pairing: every foreground against every background
    for (const fg of fgSwatches) {
      for (const bg of bgSwatches) {
        const fgColor = hexToRgba(fg.hex);
        const bgColor = hexToRgba(bg.hex);
        const ratio = contrastRatio(fgColor, bgColor);

        let requiredAA: number;
        let requiredAAA: number | null;
        switch (fg.role) {
          case "large-text":
            requiredAA = 3;
            requiredAAA = 4.5;
            break;
          case "ui-component":
            requiredAA = 3;
            requiredAAA = null;
            break;
          default: // normal-text
            requiredAA = 4.5;
            requiredAAA = 7;
            break;
        }

        pairs.push({
          fgId: fg.id,
          bgId: bg.id,
          fgHex: fg.hex,
          bgHex: bg.hex,
          fgRole: fg.role,
          bgRole: bg.role,
          contrastRatio: ratio,
          requiredRatio: requiredAA,
          aaPass: ratio >= requiredAA,
          aaaPass: requiredAAA !== null ? ratio >= requiredAAA : true,
        });
      }
    }
  } else {
    // No background assigned — compare all pairs with 4.5:1 default
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const a = selected[i];
        const b = selected[j];
        const aColor = hexToRgba(a.hex);
        const bColor = hexToRgba(b.hex);
        const ratio = contrastRatio(aColor, bColor);

        pairs.push({
          fgId: a.id,
          bgId: b.id,
          fgHex: a.hex,
          bgHex: b.hex,
          fgRole: a.role,
          bgRole: b.role,
          contrastRatio: ratio,
          requiredRatio: 4.5,
          aaPass: ratio >= 4.5,
          aaaPass: ratio >= 7,
        });
      }
    }
  }

  return pairs;
}

export const useColorPickerStore = create<ColorPickerState>((set, get) => ({
  pickerMode: "idle",
  pickerError: null,
  swatches: [],
  comparisonPairs: [],

  startPixelPicker: () => {
    // Disable element picker if active
    const contrastState = useContrastStore.getState();
    if (contrastState.mode === "picker-active") {
      contrastState.togglePicker();
    }

    set({ pickerMode: "capturing", pickerError: null });

    chrome.runtime.sendMessage(
      { type: "CAPTURE_TAB_SCREENSHOT" },
      (response: ResponseMessage) => {
        if (chrome.runtime.lastError) {
          set({
            pickerMode: "error",
            pickerError: chrome.runtime.lastError.message ?? "Connection failed",
          });
          return;
        }

        if (response.type === "TAB_SCREENSHOT_ERROR") {
          set({ pickerMode: "error", pickerError: response.error });
          return;
        }

        if (response.type === "TAB_SCREENSHOT_CAPTURED") {
          chrome.runtime.sendMessage(
            { type: "ENABLE_PIXEL_PICKER", screenshotDataUrl: response.dataUrl },
            (enableResponse: ResponseMessage) => {
              if (chrome.runtime.lastError) {
                set({
                  pickerMode: "error",
                  pickerError: chrome.runtime.lastError.message ?? "Connection failed",
                });
                return;
              }
              if (enableResponse.type === "PIXEL_PICKER_ENABLED") {
                set({ pickerMode: "active" });
              } else if (enableResponse.type === "SCAN_ERROR") {
                set({ pickerMode: "error", pickerError: enableResponse.error });
              }
            },
          );
        }
      },
    );
  },

  stopPixelPicker: () => {
    chrome.runtime.sendMessage(
      { type: "DISABLE_PIXEL_PICKER" },
      (response: ResponseMessage) => {
        if (chrome.runtime.lastError || response?.type === "PIXEL_PICKER_DISABLED") {
          set({ pickerMode: "idle" });
        }
      },
    );
  },

  addSwatch: (hex: string) => {
    const normalized = normalizeHex(hex);
    if (!normalized) return;
    const { swatches } = get();
    const entry: ColorSwatchEntry = {
      id: crypto.randomUUID(),
      hex: normalized,
      role: "normal-text",
      selected: true,
    };
    const updated = [...swatches, entry];
    set({ swatches: updated, comparisonPairs: computePairs(updated) });
  },

  removeSwatch: (id: string) => {
    const { swatches } = get();
    const updated = swatches.filter((s) => s.id !== id);
    set({ swatches: updated, comparisonPairs: computePairs(updated) });
  },

  updateSwatchRole: (id: string, role: SwatchRole) => {
    const { swatches } = get();
    const updated = swatches.map((s) => (s.id === id ? { ...s, role } : s));
    set({ swatches: updated, comparisonPairs: computePairs(updated) });
  },

  updateSwatchHex: (id: string, hex: string) => {
    const normalized = normalizeHex(hex);
    if (!normalized) return;
    const { swatches } = get();
    const updated = swatches.map((s) => (s.id === id ? { ...s, hex: normalized } : s));
    set({ swatches: updated, comparisonPairs: computePairs(updated) });
  },

  toggleSwatchSelected: (id: string) => {
    const { swatches } = get();
    const updated = swatches.map((s) =>
      s.id === id ? { ...s, selected: !s.selected } : s,
    );
    set({ swatches: updated, comparisonPairs: computePairs(updated) });
  },

  selectAllSwatches: () => {
    const { swatches } = get();
    const allSelected = swatches.every((s) => s.selected);
    const updated = swatches.map((s) => ({ ...s, selected: !allSelected }));
    set({ swatches: updated, comparisonPairs: computePairs(updated) });
  },

  clearAllSwatches: () => {
    set({ swatches: [], comparisonPairs: [] });
  },

  reset: () => {
    const { pickerMode } = get();
    if (pickerMode === "active") {
      chrome.runtime.sendMessage({ type: "DISABLE_PIXEL_PICKER" }).catch(() => {});
    }
    set({ pickerMode: "idle", pickerError: null });
  },
}));

// Module-level listener for unsolicited messages from content script
chrome.runtime.onMessage.addListener((message: ResponseMessage) => {
  if (message.type === "PIXEL_PICKED") {
    useColorPickerStore.getState().addSwatch(message.hex);
  }
  if (message.type === "PIXEL_PICKER_DISABLED") {
    useColorPickerStore.setState({ pickerMode: "idle" });
  }
});
