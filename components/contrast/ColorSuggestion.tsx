import type { ColorSuggestion } from "@/types/contrast";

interface ColorSuggestionPanelProps {
  suggestion: ColorSuggestion;
  onUse: (suggestion: ColorSuggestion) => void;
}

export function ColorSuggestionPanel({ suggestion, onUse }: ColorSuggestionPanelProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(suggestion.suggestedHex).catch(() => {});
  };

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded border border-violet-100 bg-violet-50 px-2 py-1.5">
      <span className="text-xs text-violet-600 capitalize">{suggestion.direction}:</span>

      <span
        className="inline-block h-4 w-4 shrink-0 rounded border border-zinc-300"
        style={{ backgroundColor: suggestion.originalHex }}
        aria-hidden="true"
      />
      <span className="text-xs text-zinc-400">&rarr;</span>
      <span
        className="inline-block h-4 w-4 shrink-0 rounded border border-zinc-300"
        style={{ backgroundColor: suggestion.suggestedHex }}
        aria-hidden="true"
      />
      <span className="font-mono text-xs text-violet-700">{suggestion.suggestedHex}</span>
      <span className="text-xs text-violet-500">({suggestion.achievedRatio}:1)</span>

      <div className="ml-auto flex shrink-0 gap-1">
        <button
          onClick={() => onUse(suggestion)}
          className="cursor-pointer rounded px-2 py-0.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors"
        >
          Use this
        </button>
        <button
          onClick={handleCopy}
          className="cursor-pointer rounded px-2 py-0.5 text-xs font-medium text-violet-700 bg-violet-100 hover:bg-violet-200 transition-colors"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
