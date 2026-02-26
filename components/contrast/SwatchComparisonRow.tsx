import { useState } from "react";
import type { SwatchContrastPair } from "@/types/contrast";
import { RatioBadge } from "./RatioBadge";
import { ColorSuggestionPanel } from "./ColorSuggestion";
import { suggestColorFix } from "@/lib/contrast/suggest";
import { useColorPickerStore } from "@/hooks/use-color-picker";
import type { ColorSuggestion } from "@/types/contrast";

const ROLE_LABELS: Record<string, string> = {
  "normal-text": "Normal text",
  "large-text": "Large text",
  "ui-component": "UI component",
  background: "Background",
};

interface SwatchComparisonRowProps {
  pair: SwatchContrastPair;
}

export function SwatchComparisonRow({ pair }: SwatchComparisonRowProps) {
  const [suggestions, setSuggestions] = useState<ColorSuggestion[] | null>(null);
  const updateSwatchHex = useColorPickerStore((s) => s.updateSwatchHex);

  const isFailing = !pair.aaPass;

  const handleSuggestFix = () => {
    if (suggestions) {
      setSuggestions(null);
      return;
    }
    const result = suggestColorFix(pair.fgHex, pair.bgHex, pair.requiredRatio);
    setSuggestions(result);
  };

  const handleUseSuggestion = (suggestion: ColorSuggestion) => {
    updateSwatchHex(pair.fgId, suggestion.suggestedHex);
    setSuggestions(null);
  };

  return (
    <div className="rounded-md border border-zinc-100 bg-zinc-50 p-2 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="inline-block h-5 w-5 shrink-0 rounded border border-zinc-300"
          style={{ backgroundColor: pair.fgHex }}
          aria-hidden="true"
        />
        <span className="font-mono text-xs text-zinc-600">{pair.fgHex}</span>
        <span className="text-xs text-zinc-400">{ROLE_LABELS[pair.fgRole]}</span>

        <span className="text-xs text-zinc-300">/</span>

        <span
          className="inline-block h-5 w-5 shrink-0 rounded border border-zinc-300"
          style={{ backgroundColor: pair.bgHex }}
          aria-hidden="true"
        />
        <span className="font-mono text-xs text-zinc-600">{pair.bgHex}</span>
        <span className="text-xs text-zinc-400">{ROLE_LABELS[pair.bgRole]}</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-sm font-semibold ${isFailing ? "text-red-700" : "text-green-700"}`}>
          {pair.contrastRatio}:1
        </span>
        <RatioBadge level="AA" pass={pair.aaPass} />
        <RatioBadge level="AAA" pass={pair.aaaPass} />

        {isFailing && (
          <button
            onClick={handleSuggestFix}
            className="ml-auto cursor-pointer rounded px-2 py-0.5 text-xs font-medium text-violet-700 bg-violet-100 hover:bg-violet-200 transition-colors"
          >
            {suggestions ? "Hide suggestions" : "Suggest fix"}
          </button>
        )}
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="space-y-1.5">
          {suggestions.map((s) => (
            <ColorSuggestionPanel
              key={s.direction}
              suggestion={s}
              onUse={handleUseSuggestion}
            />
          ))}
        </div>
      )}
    </div>
  );
}
