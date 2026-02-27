import { useEffect, useMemo, useRef, useState } from "react";
import { WCAG_CRITERIA, ASSESSMENT_CATEGORIES, type WcagCriterion } from "@/lib/checklist";
import { buildCriterionHighlightMap } from "@/lib/checklist";
import {
  useChecklistStore,
  useChecklistProgress,
  useCategoryProgress,
  type CheckStatus,
} from "@/hooks/use-checklist";
import { useScanStore } from "@/hooks/use-scan";
import { useSettingsStore } from "@/hooks/use-settings";
import { getChecklistText, getChecklistSteps } from "@/lib/plain-language";
import { TabStopSummary } from "@/components/checklist/TabStopSummary";
import type { HighlightTarget } from "@/types/messages";

interface ChecklistViewProps {
  onNavigateToTabStops: () => void;
}

export function ChecklistView({ onNavigateToTabStops }: ChecklistViewProps) {
  const loadFromStorage = useChecklistStore((s) => s.loadFromStorage);
  const resetAll = useChecklistStore((s) => s.resetAll);
  const activeCategoryKey = useChecklistStore((s) => s.activeCategoryKey);
  const violations = useScanStore((s) => s.violations);
  const progress = useChecklistProgress();
  const [gettingStartedOpen, setGettingStartedOpen] = useState(true);

  const highlightMap = useMemo(
    () => buildCriterionHighlightMap(violations),
    [violations],
  );

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="rounded-lg border border-zinc-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700">
            {progress.tested} of {progress.total} tested
          </span>
          <div className="flex gap-3 text-xs text-zinc-500">
            {progress.pass > 0 && <span className="text-emerald-600">{progress.pass} pass</span>}
            {progress.fail > 0 && <span className="text-red-600">{progress.fail} fail</span>}
            {progress.na > 0 && <span className="text-zinc-500">{progress.na} N/A</span>}
          </div>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-zinc-100">
          {progress.pass > 0 && (
            <div
              className="bg-emerald-500"
              style={{ width: `${(progress.pass / progress.total) * 100}%` }}
            />
          )}
          {progress.fail > 0 && (
            <div
              className="bg-red-500"
              style={{ width: `${(progress.fail / progress.total) * 100}%` }}
            />
          )}
          {progress.na > 0 && (
            <div
              className="bg-zinc-300"
              style={{ width: `${(progress.na / progress.total) * 100}%` }}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <ScanAutoPopulateButton />
        <button
          onClick={resetAll}
          className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
        >
          Reset all
        </button>
      </div>

      {/* Category rows */}
      <div className="space-y-1">
        {ASSESSMENT_CATEGORIES.map((category) => (
          <CategoryRow
            key={category.key}
            categoryKey={category.key}
            label={category.label}
            gettingStarted={category.gettingStarted}
            criteriaIds={category.criteriaIds}
            isExpanded={activeCategoryKey === category.key}
            highlightMap={highlightMap}
            gettingStartedOpen={gettingStartedOpen}
            onToggleGettingStarted={setGettingStartedOpen}
            onNavigateToTabStops={onNavigateToTabStops}
          />
        ))}
      </div>
    </div>
  );
}

function ScanAutoPopulateButton() {
  const scanStatus = useScanStore((s) => s.status);
  const startScan = useScanStore((s) => s.startScan);
  const violations = useScanStore((s) => s.violations);
  const autoPopulate = useChecklistStore((s) => s.autoPopulateFromScan);
  const prevStatusRef = useRef(scanStatus);

  useEffect(() => {
    if (prevStatusRef.current === "scanning" && scanStatus === "complete") {
      autoPopulate(violations);
    }
    prevStatusRef.current = scanStatus;
  }, [scanStatus, violations, autoPopulate]);

  return (
    <button
      onClick={startScan}
      disabled={scanStatus === "scanning"}
      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {scanStatus === "scanning" ? (
        <>
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Scanning…
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          Scan & auto-populate
        </>
      )}
    </button>
  );
}

function CategoryRow({
  categoryKey,
  label,
  gettingStarted,
  criteriaIds,
  isExpanded,
  highlightMap,
  gettingStartedOpen,
  onToggleGettingStarted,
  onNavigateToTabStops,
}: {
  categoryKey: string;
  label: string;
  gettingStarted: string;
  criteriaIds: string[];
  isExpanded: boolean;
  highlightMap: Map<string, HighlightTarget[]>;
  gettingStartedOpen: boolean;
  onToggleGettingStarted: (open: boolean) => void;
  onNavigateToTabStops: () => void;
}) {
  const enterCategory = useChecklistStore((s) => s.enterCategory);
  const progress = useCategoryProgress(criteriaIds);
  const tested = progress.pass + progress.fail + progress.na;
  const statusIcon = getStatusIcon(progress);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => enterCategory(categoryKey)}
        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-zinc-50"
      >
        <span className={`shrink-0 text-sm ${statusIcon.color}`}>{statusIcon.icon}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800">{label}</span>
        <span className="shrink-0 text-xs text-zinc-500">{tested}/{progress.total}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <ExpandedCategory
          categoryKey={categoryKey}
          gettingStarted={gettingStarted}
          criteriaIds={criteriaIds}
          highlightMap={highlightMap}
          gettingStartedOpen={gettingStartedOpen}
          onToggleGettingStarted={onToggleGettingStarted}
          onNavigateToTabStops={onNavigateToTabStops}
        />
      )}
    </div>
  );
}

function ExpandedCategory({
  categoryKey,
  gettingStarted,
  criteriaIds,
  highlightMap,
  gettingStartedOpen,
  onToggleGettingStarted,
  onNavigateToTabStops,
}: {
  categoryKey: string;
  gettingStarted: string;
  criteriaIds: string[];
  highlightMap: Map<string, HighlightTarget[]>;
  gettingStartedOpen: boolean;
  onToggleGettingStarted: (open: boolean) => void;
  onNavigateToTabStops: () => void;
}) {
  const activeCriterionIndex = useChecklistStore((s) => s.activeCriterionIndex);
  const nextCriterion = useChecklistStore((s) => s.nextCriterion);
  const prevCriterion = useChecklistStore((s) => s.prevCriterion);
  const goToCriterion = useChecklistStore((s) => s.goToCriterion);
  const statuses = useChecklistStore((s) => s.statuses);

  const criteria = useMemo(
    () => criteriaIds.map((id) => WCAG_CRITERIA.find((c) => c.id === id)!),
    [criteriaIds],
  );

  const currentCriterion = criteria[activeCriterionIndex];
  const isFirst = activeCriterionIndex === 0;
  const isLast = activeCriterionIndex === criteria.length - 1;

  // Highlight elements for current criterion
  useEffect(() => {
    const targets = highlightMap.get(currentCriterion.id);
    if (targets && targets.length > 0) {
      chrome.runtime.sendMessage({ type: "HIGHLIGHT_ALL", targets }).catch(() => {});
    }

    return () => {
      chrome.runtime.sendMessage({ type: "CLEAR_HIGHLIGHTS" }).catch(() => {});
    };
  }, [currentCriterion.id, highlightMap]);

  return (
    <div className="space-y-3 border-t border-zinc-100 px-3 py-3">
      {/* Progress dots */}
      <ProgressDots
        criteria={criteria}
        statuses={statuses}
        activeIndex={activeCriterionIndex}
        onDotClick={goToCriterion}
      />

      {/* Getting started */}
      <GettingStarted
        text={gettingStarted}
        isOpen={gettingStartedOpen}
        onToggle={onToggleGettingStarted}
      />

      {/* Tab stop summary — Focus category only */}
      {categoryKey === "focus" && (
        <TabStopSummary onNavigateToTabStops={onNavigateToTabStops} />
      )}

      {/* Criterion card */}
      <CriterionCard
        criterion={currentCriterion}
        highlightCount={highlightMap.get(currentCriterion.id)?.length ?? 0}
      />

      {/* Navigation */}
      <StepperNav
        isFirst={isFirst}
        isLast={isLast}
        onPrev={prevCriterion}
        onNext={nextCriterion}
      />
    </div>
  );
}

function ProgressDots({
  criteria,
  statuses,
  activeIndex,
  onDotClick,
}: {
  criteria: WcagCriterion[];
  statuses: Record<string, CheckStatus>;
  activeIndex: number;
  onDotClick: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 px-3">
      {criteria.map((c, i) => {
        const status = statuses[c.id];
        const isActive = i === activeIndex;

        let bgColor: string;
        switch (status) {
          case "pass": bgColor = "bg-emerald-500"; break;
          case "fail": bgColor = "bg-red-500"; break;
          case "not-applicable": bgColor = "bg-zinc-400"; break;
          default: bgColor = "bg-zinc-200"; break;
        }

        return (
          <button
            key={c.id}
            onClick={() => onDotClick(i)}
            title={`${c.id} ${c.name}`}
            className={`h-2.5 w-2.5 cursor-pointer rounded-full transition-all ${bgColor} ${
              isActive ? "ring-2 ring-blue-500 ring-offset-1" : "hover:ring-1 hover:ring-zinc-300 hover:ring-offset-1"
            }`}
          />
        );
      })}
    </div>
  );
}

function GettingStarted({
  text,
  isOpen,
  onToggle,
}: {
  text: string;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50">
      <button
        onClick={() => onToggle(!isOpen)}
        className="flex w-full cursor-pointer items-center gap-1 px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-800"
      >
        <svg
          className={`h-3 w-3 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        Getting started
      </button>
      {isOpen && (
        <div className="border-t border-zinc-200 px-3 py-2">
          <p className="text-xs leading-relaxed text-zinc-500">{text}</p>
        </div>
      )}
    </div>
  );
}

function CriterionCard({
  criterion,
  highlightCount,
}: {
  criterion: WcagCriterion;
  highlightCount: number;
}) {
  const status = useChecklistStore((s) => s.statuses[criterion.id]);
  const autoPopulated = useChecklistStore((s) => s.autoPopulated);
  const advanceOnStatus = useChecklistStore((s) => s.advanceOnStatus);
  const plain = useSettingsStore((s) => s.plainLanguage);
  const isAuto = autoPopulated.has(criterion.id);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white">
      {/* Criterion header */}
      <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2.5">
        <span className="shrink-0 font-mono text-xs text-zinc-400">{criterion.id}</span>
        <span className="min-w-0 flex-1 text-sm font-medium text-zinc-800">{criterion.name}</span>
        <span className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
          {criterion.level}
        </span>
        {criterion.canAutoDetect && (
          <span className="shrink-0 text-[10px] text-blue-500" title="Can be partially auto-detected by scan">
            auto
          </span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3 px-3 py-3">
        <p className="text-xs leading-relaxed text-zinc-600">
          {getChecklistText(criterion, "description", plain)}
        </p>

        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-500">Testing steps:</p>
          <ol className="list-inside list-decimal space-y-1">
            {getChecklistSteps(criterion, plain).map((step, i) => (
              <li key={i} className="text-xs text-zinc-600">{step}</li>
            ))}
          </ol>
        </div>

        {highlightCount > 0 && (
          <div className="flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1.5">
            <svg className="h-3.5 w-3.5 shrink-0 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
            </svg>
            <span className="text-xs font-medium text-amber-700">
              {highlightCount} element{highlightCount !== 1 ? "s" : ""} flagged by scan
            </span>
          </div>
        )}
      </div>

      {/* Status buttons */}
      <div className="border-t border-zinc-100 px-3 py-2.5">
        <StatusButtons
          currentStatus={status}
          isAutoPopulated={isAuto}
          onStatusChange={(s) => advanceOnStatus(criterion.id, s)}
        />
      </div>
    </div>
  );
}

function StatusButtons({
  currentStatus,
  isAutoPopulated,
  onStatusChange,
}: {
  currentStatus: CheckStatus;
  isAutoPopulated: boolean;
  onStatusChange: (status: CheckStatus) => void;
}) {
  const buttons: { status: CheckStatus; label: string; activeStyle: string; style: string }[] = [
    {
      status: "pass",
      label: "Pass",
      style: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
      activeStyle: "border-emerald-400 bg-emerald-100 text-emerald-800",
    },
    {
      status: "fail",
      label: "Fail",
      style: "border-red-200 text-red-700 hover:bg-red-50",
      activeStyle: "border-red-400 bg-red-100 text-red-800",
    },
    {
      status: "not-applicable",
      label: "N/A",
      style: "border-zinc-200 text-zinc-600 hover:bg-zinc-50",
      activeStyle: "border-zinc-400 bg-zinc-200 text-zinc-700",
    },
  ];

  return (
    <div className="flex gap-2">
      {buttons.map((btn) => {
        const isActive = currentStatus === btn.status;
        return (
          <button
            key={btn.status}
            onClick={() => onStatusChange(isActive ? "untested" : btn.status)}
            className={`flex-1 cursor-pointer rounded-lg border py-2 text-xs font-medium transition-colors ${
              isActive ? btn.activeStyle : btn.style
            }`}
          >
            {btn.label}
            {isActive && isAutoPopulated && (
              <span className="ml-1 text-[10px]" title="Auto-detected from scan">*</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function StepperNav({
  isFirst,
  isLast,
  onPrev,
  onNext,
}: {
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onPrev}
        disabled={isFirst}
        className="flex-1 cursor-pointer rounded-lg border border-zinc-200 bg-white py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      <button
        onClick={onNext}
        className="flex-1 cursor-pointer rounded-lg border border-zinc-200 bg-white py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
      >
        {isLast ? "Next category" : "Next"}
      </button>
    </div>
  );
}

function getStatusIcon(progress: { total: number; pass: number; fail: number; na: number; untested: number }): { icon: string; color: string } {
  const tested = progress.pass + progress.fail + progress.na;

  if (tested === 0) {
    return { icon: "○", color: "text-zinc-300" };
  }
  if (progress.fail > 0 && tested === progress.total) {
    return { icon: "✗", color: "text-red-500" };
  }
  if (progress.fail > 0) {
    return { icon: "✗", color: "text-red-500" };
  }
  if (tested === progress.total) {
    return { icon: "✓", color: "text-emerald-500" };
  }
  return { icon: "◐", color: "text-blue-500" };
}
