import { create } from "zustand";
import type { FocusTrapInfo, ResponseMessage, SerializedTabStop } from "@/types/messages";

type TabStopsStatus = "off" | "loading" | "on" | "error";

interface TabStopsState {
  status: TabStopsStatus;
  count: number;
  traps: FocusTrapInfo[];
  error: string | null;
  stops: SerializedTabStop[];
  order: string[];
  activeStopIndex: number | null;

  toggle: () => void;
  reset: () => void;
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
  activeStopIndex: null,

  toggle: () => {
    const { status } = get();

    if (status === "on") {
      chrome.runtime.sendMessage({ type: "DISABLE_TAB_STOPS" }, (response: ResponseMessage) => {
        if (chrome.runtime.lastError) {
          set({ status: "off", count: 0, traps: [], stops: [], order: [], activeStopIndex: null });
          return;
        }
        if (response.type === "TAB_STOPS_DISABLED") {
          set({ status: "off", count: 0, traps: [], stops: [], order: [], activeStopIndex: null });
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
            stops: response.stops,
            order: response.stops.map((s) => s.selector),
            activeStopIndex: null,
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
    set({ status: "off", count: 0, traps: [], error: null, stops: [], order: [], activeStopIndex: null });
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
