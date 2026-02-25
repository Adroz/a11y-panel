import { useScanStore } from "@/hooks/use-scan";
import { WCAG_CATEGORIES, type WcagCategory } from "@/lib/filters";
import type { Impact } from "@/types/scan";

const IMPACTS: { value: Impact; label: string; color: string }[] = [
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-800 border-red-300" },
  { value: "serious", label: "Serious", color: "bg-orange-100 text-orange-800 border-orange-300" },
  { value: "moderate", label: "Moderate", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "minor", label: "Minor", color: "bg-blue-100 text-blue-800 border-blue-300" },
];

export function FilterBar() {
  const filters = useScanStore((s) => s.filters);
  const toggleImpact = useScanStore((s) => s.toggleImpactFilter);
  const toggleCategory = useScanStore((s) => s.toggleCategoryFilter);
  const clearFilters = useScanStore((s) => s.clearFilters);

  const hasFilters = filters.impacts.size > 0 || filters.categories.size > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">Filters</span>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="cursor-pointer text-xs text-blue-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {IMPACTS.map(({ value, label, color }) => {
          const active = filters.impacts.has(value);
          return (
            <button
              key={value}
              onClick={() => toggleImpact(value)}
              className={`cursor-pointer rounded-full border px-2 py-0.5 text-xs font-medium transition-opacity ${color} ${
                active ? "opacity-100" : "opacity-40"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {WCAG_CATEGORIES.map(({ value, label }) => {
          const active = filters.categories.has(value);
          return (
            <button
              key={value}
              onClick={() => toggleCategory(value)}
              className={`cursor-pointer rounded-full border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 transition-opacity ${
                active ? "opacity-100" : "opacity-40"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
