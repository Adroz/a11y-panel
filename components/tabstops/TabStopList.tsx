import { Fragment, useRef, useState, useCallback, useEffect } from "react";
import { useTabStopsStore } from "@/hooks/use-tab-stops";
import { TabStopRow } from "./TabStopRow";
import { exportTabStopsJSON } from "@/lib/tabstops/export";
import type { SerializedTabStop } from "@/types/messages";

interface DragState {
  fromIndex: number; // index in orderedStops
  insertAt: number;  // index in filtered array (0..filtered.length)
  cursorY: number;
}

export function TabStopList() {
  const stops = useTabStopsStore((s) => s.stops);
  const order = useTabStopsStore((s) => s.order);
  const activeStopIndex = useTabStopsStore((s) => s.activeStopIndex);
  const selectStop = useTabStopsStore((s) => s.selectStop);
  const nextStop = useTabStopsStore((s) => s.nextStop);
  const prevStop = useTabStopsStore((s) => s.prevStop);
  const reorder = useTabStopsStore((s) => s.reorder);
  const traps = useTabStopsStore((s) => s.traps);
  const originalOrder = useTabStopsStore((s) => s.originalOrder);

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [movedSelector, setMovedSelector] = useState<string | null>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);

  // Refs for pointer-based drag
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const dragStateRef = useRef<DragState | null>(null);
  const orderRef = useRef(order);
  const rafRef = useRef<number>(0);

  // Keep refs in sync with state
  dragStateRef.current = dragState;
  orderRef.current = order;

  // Build ordered stops from the order array
  const selectorToStop = new Map(stops.map((s) => [s.selector, s]));
  const orderedStops = order.map((sel) => selectorToStop.get(sel)!).filter(Boolean);

  const isDragging = dragState !== null;

  // Scroll active row into view in the list
  useEffect(() => {
    if (activeStopIndex !== null && activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [activeStopIndex]);

  // Clear justMoved animation after it plays
  useEffect(() => {
    if (movedSelector === null) return;
    const timer = setTimeout(() => setMovedSelector(null), 350);
    return () => clearTimeout(timer);
  }, [movedSelector]);

  // --- Pointer-based drag ---

  const calculateInsertAt = useCallback((cursorY: number, fromIndex: number): number => {
    const entries: { fi: number; midY: number }[] = [];

    for (const [origIdx, el] of rowRefs.current) {
      if (origIdx === fromIndex) continue;
      const fi = origIdx < fromIndex ? origIdx : origIdx - 1;
      const rect = el.getBoundingClientRect();
      entries.push({ fi, midY: rect.top + rect.height / 2 });
    }

    entries.sort((a, b) => a.fi - b.fi);

    for (const entry of entries) {
      if (cursorY < entry.midY) return entry.fi;
    }

    return entries.length;
  }, []);

  const handleGripPointerDown = useCallback((index: number) => (e: React.PointerEvent) => {
    e.preventDefault();

    const fromIndex = index;
    const initial: DragState = { fromIndex, insertAt: fromIndex, cursorY: e.clientY };
    setDragState(initial);
    dragStateRef.current = initial;

    const onMove = (ev: PointerEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const newInsertAt = calculateInsertAt(ev.clientY, fromIndex);
        const next: DragState = { fromIndex, insertAt: newInsertAt, cursorY: ev.clientY };
        setDragState(next);
        dragStateRef.current = next;
      });
    };

    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      cancelAnimationFrame(rafRef.current);

      const ds = dragStateRef.current;
      if (ds && ds.fromIndex !== ds.insertAt) {
        const selector = orderRef.current[ds.fromIndex];
        reorder(ds.fromIndex, ds.insertAt);
        setMovedSelector(selector);
        selectStop(ds.insertAt);
      }
      setDragState(null);
      dragStateRef.current = null;
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, [calculateInsertAt, reorder, selectStop]);

  // --- Keyboard reorder ---
  const doReorder = useCallback((from: number, to: number) => {
    const selector = order[from];
    reorder(from, to);
    setMovedSelector(selector);
    selectStop(to);
  }, [order, reorder, selectStop]);

  // --- Drag preview computation ---
  // During drag: figure out display numbers and gap placement
  // Gap appears "before" the row whose filteredIndex === insertAt,
  // or at the end if insertAt === filteredLength.

  function getFilteredIndex(origIndex: number): number {
    if (!isDragging) return -1;
    if (origIndex === dragState.fromIndex) return -1;
    return origIndex < dragState.fromIndex ? origIndex : origIndex - 1;
  }

  function getDisplayNumber(origIndex: number): number {
    if (!isDragging) return origIndex + 1;
    const fi = getFilteredIndex(origIndex);
    if (fi === -1) return -1; // dragged row, hidden
    return fi < dragState.insertAt ? fi + 1 : fi + 2;
  }

  const draggedStop = isDragging ? orderedStops[dragState.fromIndex] : null;
  const filteredLength = isDragging ? orderedStops.length - 1 : 0;

  // --- Export ---
  const handleExport = useCallback(() => {
    exportTabStopsJSON(orderedStops, traps, originalOrder);
  }, [orderedStops, traps, originalOrder]);

  const displayNum = activeStopIndex !== null ? activeStopIndex + 1 : "–";

  // --- Ref setter ---
  const setRowRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    if (el) rowRefs.current.set(index, el);
    else rowRefs.current.delete(index);
  }, []);

  // --- Gap element ---
  function renderGap(stop: SerializedTabStop, number: number) {
    const label = stop.role || stop.tagName;
    return (
      <div
        key="drag-gap"
        className="mx-2 my-0.5 flex items-center gap-1.5 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/70 px-2 py-1.5"
      >
        <span className="text-sm leading-none text-blue-300 select-none">⠿</span>
        <span className="w-5 shrink-0 text-right font-mono text-xs font-semibold text-blue-500">
          {number}
        </span>
        <span className="shrink-0 rounded bg-blue-100 px-1 font-mono text-[10px] text-blue-500">
          {label}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-blue-400">
          {stop.accessibleName || "no name"}
        </span>
      </div>
    );
  }

  // --- Render row (shared between grouped and flat) ---
  function renderRow(stop: SerializedTabStop, orderIndex: number, displayNumber: number) {
    const isActive = !isDragging && activeStopIndex === orderIndex;
    const isDraggedRow = isDragging && orderIndex === dragState.fromIndex;

    return (
      <div
        key={stop.selector}
        ref={setRowRef(orderIndex)}
        className={isDraggedRow ? "h-0 overflow-hidden" : ""}
      >
        {!isDraggedRow && (
          <div ref={isActive ? activeRowRef : undefined}>
            <TabStopRow
              stop={stop}
              isActive={isActive}
              displayIndex={displayNumber}
              justMoved={movedSelector === stop.selector}
              onSelect={() => selectStop(isActive ? null : orderIndex)}
              onGripPointerDown={handleGripPointerDown(orderIndex)}
              onMoveUp={() => { if (orderIndex > 0) doReorder(orderIndex, orderIndex - 1); }}
              onMoveDown={() => { if (orderIndex < orderedStops.length - 1) doReorder(orderIndex, orderIndex + 1); }}
              isFirst={orderIndex === 0}
              isLast={orderIndex === orderedStops.length - 1}
            />
          </div>
        )}
      </div>
    );
  }

  // --- Flat drag rendering ---
  function renderFlatDrag() {
    return orderedStops.map((stop, i) => {
      const fi = getFilteredIndex(i);
      const showGapBefore = fi !== -1 && fi === dragState!.insertAt;
      const showGapEnd = fi !== -1 && i === orderedStops.length - 1 && dragState!.insertAt >= filteredLength;

      return (
        <Fragment key={stop.selector}>
          {showGapBefore && renderGap(draggedStop!, dragState!.insertAt + 1)}
          {renderRow(stop, i, getDisplayNumber(i))}
          {showGapEnd && renderGap(draggedStop!, dragState!.insertAt + 1)}
        </Fragment>
      );
    });
  }

  // --- Grouped non-drag rendering ---
  type StopGroup =
    | { type: "normal"; stops: { stop: SerializedTabStop; orderIndex: number }[] }
    | { type: "trap"; trapSelector: string; stops: { stop: SerializedTabStop; orderIndex: number }[] };

  function renderGrouped() {
    const groups: StopGroup[] = [];
    for (let i = 0; i < orderedStops.length; i++) {
      const stop = orderedStops[i];
      const entry = { stop, orderIndex: i };
      if (stop.trapSelector) {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup?.type === "trap" && lastGroup.trapSelector === stop.trapSelector) {
          lastGroup.stops.push(entry);
        } else {
          groups.push({ type: "trap", trapSelector: stop.trapSelector, stops: [entry] });
        }
      } else {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup?.type === "normal") {
          lastGroup.stops.push(entry);
        } else {
          groups.push({ type: "normal", stops: [entry] });
        }
      }
    }

    return groups.map((group, gi) => {
      if (group.type === "trap") {
        return (
          <div
            key={`trap-${gi}`}
            className="mx-1 rounded border border-red-200 bg-red-50/50 pl-1"
          >
            <div className="border-l-2 border-red-400 pl-1.5">
              <div className="px-1 pt-1 text-[10px] font-medium text-red-600">
                Focus trap: <code className="rounded bg-red-100 px-0.5">{group.trapSelector}</code>
              </div>
              {group.stops.map(({ stop, orderIndex }) =>
                renderRow(stop, orderIndex, orderIndex + 1)
              )}
            </div>
          </div>
        );
      }
      return (
        <div key={`normal-${gi}`}>
          {group.stops.map(({ stop, orderIndex }) =>
            renderRow(stop, orderIndex, orderIndex + 1)
          )}
        </div>
      );
    });
  }

  return (
    <div className="flex flex-col">
      {/* Settle animation keyframe */}
      <style>{`
        @keyframes tab-stop-settle {
          0% { opacity: 0.5; transform: scale(0.97); background: rgb(219 234 254); }
          100% { opacity: 1; transform: scale(1); background: transparent; }
        }
      `}</style>

      {/* Sticky nav bar — negative offsets fill main's p-4 padding so it sticks flush under the tab nav */}
      <div className="-mx-4 sticky top-[-16px] z-10 flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 pb-1.5 pt-[calc(16px+0.375rem)]">
        <button
          onClick={prevStop}
          className="cursor-pointer rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200"
        >
          ← Prev
        </button>
        <span className="text-xs font-medium text-zinc-500">
          {displayNum} / {orderedStops.length}
        </span>
        <button
          onClick={nextStop}
          className="cursor-pointer rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200"
        >
          Next →
        </button>
      </div>

      {/* Stop list */}
      <div className="space-y-0.5 py-1">
        {isDragging ? renderFlatDrag() : renderGrouped()}
      </div>

      {/* Floating drag cursor badge */}
      {isDragging && draggedStop && (
        <div
          className="pointer-events-none fixed z-50 flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 py-1 shadow-lg"
          style={{ top: dragState.cursorY + 12, left: 16, maxWidth: 260 }}
        >
          <span className="font-mono text-xs font-bold text-blue-600">
            {dragState.insertAt + 1}
          </span>
          <span className={`shrink-0 rounded px-1 font-mono text-[10px] ${
            draggedStop.role ? "bg-violet-50 text-violet-600" : "bg-zinc-100 text-zinc-600"
          }`}>
            {draggedStop.role || draggedStop.tagName}
          </span>
          <span className="truncate text-xs text-zinc-600">
            {draggedStop.accessibleName || "no name"}
          </span>
        </div>
      )}

      {/* Export button */}
      <div className="border-t border-zinc-200 px-3 py-2">
        <button
          onClick={handleExport}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export tab order
        </button>
      </div>
    </div>
  );
}
