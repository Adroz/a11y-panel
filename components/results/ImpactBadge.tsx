import type { Impact } from "@/types/scan";

const IMPACT_STYLES: Record<Impact, string> = {
  critical: "bg-red-100 text-red-800",
  serious: "bg-orange-100 text-orange-800",
  moderate: "bg-yellow-100 text-yellow-800",
  minor: "bg-blue-100 text-blue-800",
};

interface ImpactBadgeProps {
  impact: Impact;
  count?: number;
}

export function ImpactBadge({ impact, count }: ImpactBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${IMPACT_STYLES[impact]}`}
    >
      {impact}
      {count != null && <span className="font-semibold">{count}</span>}
    </span>
  );
}
