import type { SerializedTabStop } from "@/types/messages";

interface TabStopRowProps {
  stop: SerializedTabStop;
  isActive: boolean;
  displayIndex: number;
  justMoved: boolean;
  onSelect: () => void;
  onGripPointerDown: (e: React.PointerEvent) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function TabStopRow({
  stop,
  isActive,
  displayIndex,
  justMoved,
  onSelect,
  onGripPointerDown,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: TabStopRowProps) {
  const label = stop.role || stop.tagName;

  return (
    <div
      className={`relative flex items-center gap-1.5 rounded px-2 py-1.5 text-left transition-all duration-200 ${
        isActive
          ? "border border-blue-200 bg-blue-50"
          : "border border-transparent hover:bg-zinc-50"
      } ${justMoved ? "animate-[tab-stop-settle_0.3s_ease-out]" : ""}`}
    >
      {/* Drag handle — left side */}
      <div className="flex shrink-0 items-center">
        <div
          onPointerDown={onGripPointerDown}
          className="cursor-grab text-sm leading-none text-zinc-300 touch-none select-none hover:text-zinc-500 active:cursor-grabbing"
          title="Drag to reorder"
        >
          ⠿
        </div>
        <div className="flex flex-col opacity-0 transition-opacity focus-within:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={isFirst}
            className="h-3 cursor-pointer bg-transparent p-0 text-[8px] leading-none text-zinc-400 hover:text-zinc-600 disabled:invisible"
            aria-label={`Move stop ${displayIndex} up`}
          >
            ▲
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={isLast}
            className="h-3 cursor-pointer bg-transparent p-0 text-[8px] leading-none text-zinc-400 hover:text-zinc-600 disabled:invisible"
            aria-label={`Move stop ${displayIndex} down`}
          >
            ▼
          </button>
        </div>
      </div>

      <button
        onClick={onSelect}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 bg-transparent p-0"
      >
        <span className="w-5 shrink-0 text-right font-mono text-xs text-zinc-400">
          {displayIndex}
        </span>
        <span className={`shrink-0 rounded px-1 font-mono text-[10px] ${
          stop.role
            ? "bg-violet-50 text-violet-600"
            : "bg-zinc-100 text-zinc-600"
        }`}>
          {label}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-zinc-700">
          {stop.accessibleName || (
            <span className="italic text-zinc-400">no name</span>
          )}
        </span>
      </button>
    </div>
  );
}
