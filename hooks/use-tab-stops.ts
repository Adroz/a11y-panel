import { create } from "zustand";
import type { FocusTrapInfo, ResponseMessage, SerializedTabStop } from "@/types/messages";

type TabStopsStatus = "off" | "loading" | "on" | "hidden" | "error";

const STORAGE_KEY = "tabStopsAutoShow";

interface TabStopsState {
  status: TabStopsStatus;
  count: number;
  traps: FocusTrapInfo[];
  error: string | null;
  stops: SerializedTabStop[];
  order: string[];
  originalOrder: string[];
  activeStopIndex: number | null;
  autoShowPreference: boolean;

  enable: () => void;
  toggle: () => void;
  hide: () => void;
  show: () => void;
  reset: () => void;
  loadPreference: () => void;
  selectStop: (index: number | null) => void;
  nextStop: () => void;
  prevStop: () => void;
  reorder: (fromIndex: number, toIndex: number) => void;
}

export const useTabStopsStore = create<TabStopsState>((set, get) => ({
  status: "off",
  count: 0,
  traps: [],
  error: null,
  stops: [],
  order: [],
  originalOrder: [],
  activeStopIndex: null,
  autoShowPreference: false,

  enable: () => {
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
        case "TAB_STOPS_ENABLED": {
          const domOrder = response.stops.map((s) => s.selector);
          set({
            status: "on",
            count: response.count,
            traps: response.traps,
            stops: response.stops,
            order: domOrder,
            originalOrder: domOrder,
            activeStopIndex: null,
            error: null,
            autoShowPreference: true,
          });
          chrome.storage.local.set({ [STORAGE_KEY]: true });
          break;
        }
        case "TAB_STOPS_ERROR":
        case "SCAN_ERROR":
          set({ status: "error", error: response.error });
          break;
      }
    });
  },

  toggle: () => {
    const { status, enable } = get();

    if (status === "on" || status === "hidden") {
      // Full disable — wipe everything
      chrome.runtime.sendMessage({ type: "DISABLE_TAB_STOPS" }, (response: ResponseMessage) => {
        if (chrome.runtime.lastError) {
          set({ status: "off", count: 0, traps: [], stops: [], order: [], originalOrder: [], activeStopIndex: null, autoShowPreference: false });
          chrome.storage.local.set({ [STORAGE_KEY]: false });
          return;
        }
        if (response.type === "TAB_STOPS_DISABLED") {
          set({ status: "off", count: 0, traps: [], stops: [], order: [], originalOrder: [], activeStopIndex: null, autoShowPreference: false });
          chrome.storage.local.set({ [STORAGE_KEY]: false });
        }
      });
      return;
    }

    enable();
  },

  hide: () => {
    const { status } = get();
    if (status !== "on") return;

    chrome.runtime.sendMessage({ type: "HIDE_TAB_STOPS_OVERLAY" }).catch(() => {});
    set({ status: "hidden", activeStopIndex: null });
  },

  show: () => {
    const { status, enable } = get();
    if (status !== "hidden") return;

    chrome.runtime.sendMessage({ type: "SHOW_TAB_STOPS_OVERLAY" }, (response: ResponseMessage) => {
      if (chrome.runtime.lastError) {
        // Content script lost — fall back to full enable
        enable();
        return;
      }

      if (response.type === "TAB_STOPS_OVERLAY_SHOWN") {
        set({ status: "on" });
      } else if (response.type === "TAB_STOPS_ERROR") {
        // Stored data lost (page navigated) — fall back to full enable
        enable();
      }
    });
  },

  reset: () => {
    chrome.runtime.sendMessage({ type: "DISABLE_TAB_STOPS" }).catch(() => {});
    set({ status: "off", count: 0, traps: [], error: null, stops: [], order: [], originalOrder: [], activeStopIndex: null });
  },

  loadPreference: () => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      if (result[STORAGE_KEY] === true) {
        set({ autoShowPreference: true });
      }
    });
  },

  selectStop: (index: number | null) => {
    set({ activeStopIndex: index });

    if (index === null) {
      chrome.runtime.sendMessage({ type: "CLEAR_TAB_STOP_HIGHLIGHT" }).catch(() => {});
      return;
    }

    const { order } = get();
    const selector = order[index];
    if (selector) {
      chrome.runtime.sendMessage({ type: "HIGHLIGHT_TAB_STOP", selector }).catch(() => {});
    }
  },

  nextStop: () => {
    const { order, activeStopIndex } = get();
    if (order.length === 0) return;

    const next = activeStopIndex === null ? 0 : (activeStopIndex + 1) % order.length;
    get().selectStop(next);
  },

  prevStop: () => {
    const { order, activeStopIndex } = get();
    if (order.length === 0) return;

    const prev = activeStopIndex === null ? order.length - 1 : (activeStopIndex - 1 + order.length) % order.length;
    get().selectStop(prev);
  },

  reorder: (fromIndex: number, toIndex: number) => {
    const { order, stops } = get();
    if (fromIndex === toIndex) return;

    const newOrder = [...order];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);

    // Rebuild stops with new indices matching new order
    const selectorToStop = new Map(stops.map((s) => [s.selector, s]));
    const newStops = newOrder.map((selector, i) => {
      const original = selectorToStop.get(selector)!;
      return { ...original, index: i + 1 };
    });

    set({ order: newOrder, stops: newStops, activeStopIndex: null });

    chrome.runtime.sendMessage({ type: "REORDER_TAB_STOPS", order: newOrder }).catch(() => {});
  },
}));
