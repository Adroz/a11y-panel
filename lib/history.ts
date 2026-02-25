import type { ScanResult, ScanViolation } from "@/types/scan";

export const MAX_HISTORY_ENTRIES = 20;

const STORAGE_KEY = "scanHistory";

export interface HistoryEntry {
  violations: ScanViolation[];
  url: string;
  timestamp: number;
  totalNodes: number;
}

export interface ScanDelta {
  newViolations: ScanViolation[];
  fixedViolations: ScanViolation[];
  unchangedViolations: ScanViolation[];
  newNodeCount: number;
  fixedNodeCount: number;
}

/**
 * Compares two sets of violations by rule ID to determine what changed.
 * "New" means the rule ID exists in current but not previous.
 * "Fixed" means the rule ID exists in previous but not current.
 * "Unchanged" means the rule ID exists in both.
 */
export function computeDelta(
  current: ScanViolation[],
  previous: ScanViolation[],
): ScanDelta {
  const currentMap = new Map<string, ScanViolation>();
  for (const v of current) {
    currentMap.set(v.id, v);
  }

  const previousMap = new Map<string, ScanViolation>();
  for (const v of previous) {
    previousMap.set(v.id, v);
  }

  const newViolations: ScanViolation[] = [];
  const unchangedViolations: ScanViolation[] = [];

  for (const [id, violation] of currentMap) {
    if (previousMap.has(id)) {
      unchangedViolations.push(violation);
    } else {
      newViolations.push(violation);
    }
  }

  const fixedViolations: ScanViolation[] = [];
  for (const [id, violation] of previousMap) {
    if (!currentMap.has(id)) {
      fixedViolations.push(violation);
    }
  }

  const newNodeCount = newViolations.reduce(
    (sum, v) => sum + v.nodes.length,
    0,
  );
  const fixedNodeCount = fixedViolations.reduce(
    (sum, v) => sum + v.nodes.length,
    0,
  );

  return {
    newViolations,
    fixedViolations,
    unchangedViolations,
    newNodeCount,
    fixedNodeCount,
  };
}

/**
 * Saves a scan result to chrome.storage.local under the scanHistory key.
 * Keeps a maximum of MAX_HISTORY_ENTRIES entries, discarding oldest first.
 */
export async function saveToHistory(result: ScanResult): Promise<void> {
  const history = await loadHistory();

  const entry: HistoryEntry = {
    violations: result.violations,
    url: result.url,
    timestamp: result.timestamp,
    totalNodes: result.violations.reduce(
      (sum, v) => sum + v.nodes.length,
      0,
    ),
  };

  history.push(entry);

  // Discard oldest entries if over the limit
  while (history.length > MAX_HISTORY_ENTRIES) {
    history.shift();
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: history });
}

/**
 * Loads scan history from chrome.storage.local.
 * Returns an empty array if no history exists.
 */
export async function loadHistory(): Promise<HistoryEntry[]> {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return (data[STORAGE_KEY] as HistoryEntry[] | undefined) ?? [];
}

/**
 * Clears all scan history from chrome.storage.local.
 */
export async function clearHistory(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY);
}
