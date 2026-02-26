import { useColorPickerStore } from "@/hooks/use-color-picker";
import { SwatchGridItem } from "./SwatchGridItem";
import type { SwatchRole } from "@/types/contrast";

export function SwatchGrid() {
  const swatches = useColorPickerStore((s) => s.swatches);
  const removeSwatch = useColorPickerStore((s) => s.removeSwatch);
  const updateSwatchRole = useColorPickerStore((s) => s.updateSwatchRole);
  const updateSwatchHex = useColorPickerStore((s) => s.updateSwatchHex);
  const toggleSwatchSelected = useColorPickerStore((s) => s.toggleSwatchSelected);
  const selectAllSwatches = useColorPickerStore((s) => s.selectAllSwatches);
  const clearAllSwatches = useColorPickerStore((s) => s.clearAllSwatches);

  if (swatches.length === 0) return null;

  const allSelected = swatches.every((s) => s.selected);
  const hasBg = swatches.some((s) => s.role === "background");

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          Swatches ({swatches.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={selectAllSwatches}
            className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-700"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
          <button
            onClick={clearAllSwatches}
            className="cursor-pointer text-xs text-red-500 hover:text-red-700"
          >
            Clear all
          </button>
        </div>
      </div>

      {!hasBg && swatches.length >= 2 && (
        <p className="text-xs text-amber-600">
          No background swatch assigned. Comparing all pairs with 4.5:1 default.
        </p>
      )}

      <div className="space-y-1">
        {swatches.map((swatch) => (
          <SwatchGridItem
            key={swatch.id}
            swatch={swatch}
            onRemove={removeSwatch}
            onRoleChange={updateSwatchRole}
            onHexChange={updateSwatchHex}
            onToggleSelected={toggleSwatchSelected}
          />
        ))}
      </div>
    </div>
  );
}
