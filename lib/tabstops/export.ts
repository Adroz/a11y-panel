import type { SerializedTabStop, FocusTrapInfo } from "@/types/messages";

interface TabStopExportData {
  url: string;
  timestamp: number;
  tabStops: {
    order: number;
    originalOrder: number;
    reordered: boolean;
    selector: string;
    role: string;
    accessibleName: string;
    trapSelector: string | null;
  }[];
  focusTraps: {
    selector: string;
    stopOrders: number[];
  }[];
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportTabStopsJSON(
  stops: SerializedTabStop[],
  traps: FocusTrapInfo[],
  originalOrder: string[],
): void {
  const originalIndexMap = new Map(originalOrder.map((sel, i) => [sel, i + 1]));

  const data: TabStopExportData = {
    url: window.location.href,
    timestamp: Date.now(),
    tabStops: stops.map((s, i) => {
      const origIdx = originalIndexMap.get(s.selector) ?? i + 1;
      return {
        order: i + 1,
        originalOrder: origIdx,
        reordered: origIdx !== i + 1,
        selector: s.selector,
        role: s.role || s.tagName,
        accessibleName: s.accessibleName,
        trapSelector: s.trapSelector,
      };
    }),
    focusTraps: traps.map((t) => ({
      selector: t.selector,
      stopOrders: t.tabStopIndices,
    })),
  };

  let hostname: string;
  try {
    hostname = new URL(data.url).hostname;
  } catch {
    hostname = "unknown";
  }
  const date = new Date(data.timestamp).toISOString().slice(0, 10);
  const filename = `tab-order-${hostname}-${date}.json`;

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  downloadBlob(blob, filename);
}
