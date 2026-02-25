import type { SerializedTabStop, FocusTrapInfo } from "@/types/messages";

interface TabStopExportData {
  url: string;
  timestamp: number;
  tabStops: {
    order: number;
    selector: string;
    tagName: string;
    accessibleName: string;
    role: string;
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
): void {
  const data: TabStopExportData = {
    url: window.location.href,
    timestamp: Date.now(),
    tabStops: stops.map((s, i) => ({
      order: i + 1,
      selector: s.selector,
      tagName: s.tagName,
      accessibleName: s.accessibleName,
      role: s.role,
      trapSelector: s.trapSelector,
    })),
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
