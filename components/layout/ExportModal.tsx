import { useMemo, useState } from "react";
import { useScanStore } from "@/hooks/use-scan";
import { useChecklistStore, useChecklistProgress } from "@/hooks/use-checklist";
import { useTabStopsStore } from "@/hooks/use-tab-stops";
import { useContrastStore } from "@/hooks/use-contrast";
import { buildCriterionHighlightMap } from "@/lib/checklist";
import { exportHTML, exportJSON, type ExportData, type ChecklistExportEntry } from "@/lib/export";

type Format = "html" | "json";

export function ExportModal({ onClose }: { onClose: () => void }) {
  const violations = useScanStore((s) => s.violations);
  const customChecks = useScanStore((s) => s.customChecks);
  const scanStatus = useScanStore((s) => s.status);
  const url = useScanStore((s) => s.url);
  const timestamp = useScanStore((s) => s.timestamp);
  const checklistStatuses = useChecklistStore((s) => s.statuses);
  const autoDetails = useChecklistStore((s) => s.autoDetails);
  const checklistProgress = useChecklistProgress();
  const tabStops = useTabStopsStore((s) => s.stops);
  const tabStopsOrder = useTabStopsStore((s) => s.order);
  const tabStopsOriginalOrder = useTabStopsStore((s) => s.originalOrder);
  const tabStopsTraps = useTabStopsStore((s) => s.traps);
  const contrastAudit = useContrastStore((s) => s.auditResult);
  const contrastFixes = useContrastStore((s) => s.appliedFixes);

  const highlightMap = useMemo(
    () => buildCriterionHighlightMap(violations, customChecks),
    [violations, customChecks],
  );

  const hasScan = scanStatus === "complete";
  const hasChecklist = checklistProgress.tested > 0;
  const hasTabStops = tabStops.length > 0;
  const hasContrast = contrastAudit !== null;

  const [includeScan, setIncludeScan] = useState(hasScan);
  const [includeChecklist, setIncludeChecklist] = useState(hasChecklist);
  const [includeTabStops, setIncludeTabStops] = useState(hasTabStops);
  const [includeContrast, setIncludeContrast] = useState(hasContrast);
  const [format, setFormat] = useState<Format>("html");

  const canExport = includeScan || includeChecklist || includeTabStops || includeContrast;

  function handleExport() {
    // Build enriched checklist with details and element selectors
    const checklist: Record<string, ChecklistExportEntry> = {};
    if (includeChecklist) {
      for (const [id, status] of Object.entries(checklistStatuses)) {
        const entry: ChecklistExportEntry = { status };
        if (autoDetails[id]) {
          entry.detail = autoDetails[id];
        }
        const targets = highlightMap.get(id);
        if (targets && targets.length > 0) {
          entry.elements = targets.map((t) => t.selector);
        }
        checklist[id] = entry;
      }
    }

    const data: ExportData = {
      url: url ?? window.location.href,
      timestamp: timestamp ?? Date.now(),
      violations: includeScan ? violations : [],
      checklist,
      tabStops: includeTabStops
        ? { stops: tabStops, order: tabStopsOrder, originalOrder: tabStopsOriginalOrder, traps: tabStopsTraps }
        : undefined,
      contrastAudit: includeContrast ? contrastAudit! : undefined,
      contrastFixes: includeContrast && contrastFixes.length > 0 ? contrastFixes : undefined,
    };

    if (format === "html") {
      exportHTML(data);
    } else {
      exportJSON(data);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16" onClick={onClose}>
      <div
        className="w-72 rounded-lg border border-zinc-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">Export Report</h2>
        </div>

        <div className="space-y-4 px-4 py-3">
          {/* Data sources */}
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-zinc-500">Include</legend>

            <label className={`flex cursor-pointer items-center gap-2 ${!hasScan ? "opacity-40" : ""}`}>
              <input
                type="checkbox"
                checked={includeScan}
                disabled={!hasScan}
                onChange={(e) => setIncludeScan(e.target.checked)}
                className="accent-zinc-900"
              />
              <span className="text-sm text-zinc-700">Scan results</span>
              <span className="ml-auto text-xs text-zinc-400">
                {hasScan ? `${violations.length} rule${violations.length !== 1 ? "s" : ""}` : "no data"}
              </span>
            </label>

            <label className={`flex cursor-pointer items-center gap-2 ${!hasChecklist ? "opacity-40" : ""}`}>
              <input
                type="checkbox"
                checked={includeChecklist}
                disabled={!hasChecklist}
                onChange={(e) => setIncludeChecklist(e.target.checked)}
                className="accent-zinc-900"
              />
              <span className="text-sm text-zinc-700">Checklist</span>
              <span className="ml-auto text-xs text-zinc-400">
                {hasChecklist ? `${checklistProgress.tested}/${checklistProgress.total}` : "no data"}
              </span>
            </label>

            <label className={`flex cursor-pointer items-center gap-2 ${!hasContrast ? "opacity-40" : ""}`}>
              <input
                type="checkbox"
                checked={includeContrast}
                disabled={!hasContrast}
                onChange={(e) => setIncludeContrast(e.target.checked)}
                className="accent-zinc-900"
              />
              <span className="text-sm text-zinc-700">Contrast audit</span>
              <span className="ml-auto text-xs text-zinc-400">
                {hasContrast ? `${contrastAudit!.failures.length} failure${contrastAudit!.failures.length !== 1 ? "s" : ""}` : "no data"}
              </span>
            </label>

            <label className={`flex cursor-pointer items-center gap-2 ${!hasTabStops ? "opacity-40" : ""}`}>
              <input
                type="checkbox"
                checked={includeTabStops}
                disabled={!hasTabStops}
                onChange={(e) => setIncludeTabStops(e.target.checked)}
                className="accent-zinc-900"
              />
              <span className="text-sm text-zinc-700">Tab stops</span>
              <span className="ml-auto text-xs text-zinc-400">
                {hasTabStops ? `${tabStops.length} stop${tabStops.length !== 1 ? "s" : ""}` : "no data"}
              </span>
            </label>
          </fieldset>

          {/* Format */}
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-zinc-500">Format</legend>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="radio"
                  name="format"
                  checked={format === "html"}
                  onChange={() => setFormat("html")}
                  className="accent-zinc-900"
                />
                <span className="text-sm text-zinc-700">HTML</span>
              </label>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="radio"
                  name="format"
                  checked={format === "json"}
                  onChange={() => setFormat("json")}
                  className="accent-zinc-900"
                />
                <span className="text-sm text-zinc-700">JSON</span>
              </label>
            </div>
          </fieldset>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-zinc-100 px-4 py-3">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={!canExport}
            className="cursor-pointer rounded-lg border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
