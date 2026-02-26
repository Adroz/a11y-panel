import { useColorPickerStore } from "@/hooks/use-color-picker";
import { SwatchComparisonRow } from "./SwatchComparisonRow";

export function SwatchComparison() {
  const pairs = useColorPickerStore((s) => s.comparisonPairs);
  const swatches = useColorPickerStore((s) => s.swatches);

  if (pairs.length === 0) return null;

  const hasBg = swatches.some((s) => s.role === "background" && s.selected);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 space-y-2">
      <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
        Comparison ({pairs.length} {pairs.length === 1 ? "pair" : "pairs"})
      </h3>

      {!hasBg && (
        <p className="text-xs text-amber-600">
          No background role assigned — showing all combinations at 4.5:1 threshold.
        </p>
      )}

      <div className="space-y-2">
        {pairs.map((pair) => (
          <SwatchComparisonRow key={`${pair.fgId}-${pair.bgId}`} pair={pair} />
        ))}
      </div>
    </div>
  );
}
