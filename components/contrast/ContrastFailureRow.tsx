import type { ContrastResult } from "@/types/contrast";
import { useContrastStore } from "@/hooks/use-contrast";
import { ColorSwatch } from "./ColorSwatch";
import { RatioBadge } from "./RatioBadge";

interface ContrastFailureRowProps {
  result: ContrastResult;
}

export function ContrastFailureRow({ result }: ContrastFailureRowProps) {
  const highlightedSelector = useContrastStore((s) => s.highlightedSelector);
  const highlightElement = useContrastStore((s) => s.highlightElement);
  const isHighlighted = highlightedSelector === result.selector;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <p className="mb-2 text-sm text-zinc-900 truncate" title={result.textSnippet}>
        {result.textSnippet || <span className="italic text-zinc-400">(empty text)</span>}
      </p>

      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <ColorSwatch color={result.fgColor} />
        <span className="text-xs text-zinc-400">/</span>
        <ColorSwatch color={result.bgColor} />
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-zinc-800">
          {result.contrastRatio}:1
        </span>
        <RatioBadge level="AA" pass={result.aaPass} />
        <RatioBadge level="AAA" pass={result.aaaPass} />
        {result.isLargeText && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
            Large text
          </span>
        )}
      </div>

      <button
        onClick={() => highlightElement(isHighlighted ? null : result.selector)}
        className={`cursor-pointer rounded px-2 py-1 text-xs font-medium transition-colors ${
          isHighlighted
            ? "bg-orange-100 text-orange-700"
            : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
        }`}
      >
        {isHighlighted ? "Clear highlight" : "Highlight"}
      </button>
    </div>
  );
}
