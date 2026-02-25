import type { CheckStatus } from "@/hooks/use-checklist";

const STATUS_CONFIG: Record<CheckStatus, { label: string; short: string; style: string; activeStyle: string }> = {
  pass: {
    label: "Pass",
    short: "P",
    style: "border-emerald-200 text-emerald-600 hover:bg-emerald-50",
    activeStyle: "border-emerald-400 bg-emerald-100 text-emerald-800",
  },
  fail: {
    label: "Fail",
    short: "F",
    style: "border-red-200 text-red-600 hover:bg-red-50",
    activeStyle: "border-red-400 bg-red-100 text-red-800",
  },
  "not-applicable": {
    label: "N/A",
    short: "—",
    style: "border-zinc-200 text-zinc-500 hover:bg-zinc-50",
    activeStyle: "border-zinc-400 bg-zinc-200 text-zinc-700",
  },
};

interface StatusButtonProps {
  currentStatus: CheckStatus;
  onStatusChange: (status: CheckStatus) => void;
  isAutoPopulated?: boolean;
}

export function StatusButton({ currentStatus, onStatusChange, isAutoPopulated }: StatusButtonProps) {
  return (
    <div className="flex gap-1">
      {(Object.entries(STATUS_CONFIG) as [CheckStatus, typeof STATUS_CONFIG[CheckStatus]][]).map(
        ([status, config]) => {
          const isActive = currentStatus === status;
          return (
            <button
              key={status}
              onClick={() => onStatusChange(isActive ? "untested" : status)}
              title={`${config.label}${isActive && isAutoPopulated ? " (auto-detected)" : ""}`}
              className={`cursor-pointer rounded border px-1.5 py-0.5 text-xs font-medium transition-colors ${
                isActive ? config.activeStyle : config.style
              }`}
            >
              {config.short}
              {isActive && isAutoPopulated && (
                <span className="ml-0.5 text-[10px]" title="Auto-detected from scan">*</span>
              )}
            </button>
          );
        },
      )}
    </div>
  );
}
