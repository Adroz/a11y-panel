import type { ContrastPickerResult } from "@/types/contrast";
import { useContrastStore } from "@/hooks/use-contrast";
import { ColorSwatch } from "./ColorSwatch";
import { RatioBadge } from "./RatioBadge";

export function ContrastPickerDetail() {
  const pickerResult = useContrastStore((s) => s.pickerResult);
  const highlightElement = useContrastStore((s) => s.highlightElement);
  const highlightedSelector = useContrastStore((s) => s.highlightedSelector);

  if (!pickerResult) return null;

  const isHighlighted = highlightedSelector === pickerResult.selector;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="rounded bg-blue-200 px-1.5 py-0.5 font-mono text-xs text-blue-800">
          &lt;{pickerResult.tagName}&gt;
        </span>
        {pickerResult.accessibleName && (
          <span className="truncate text-xs text-blue-700" title={pickerResult.accessibleName}>
            {pickerResult.accessibleName}
          </span>
        )}
      </div>

      <p className="text-sm text-blue-900 truncate" title={pickerResult.textSnippet}>
        {pickerResult.textSnippet || <span className="italic text-blue-400">(empty text)</span>}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <ColorSwatch color={pickerResult.fgColor} />
        <span className="text-xs text-blue-400">/</span>
        <ColorSwatch color={pickerResult.bgColor} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-blue-900">
          {pickerResult.contrastRatio}:1
        </span>
        <RatioBadge level="AA" pass={pickerResult.aaPass} />
        <RatioBadge level="AAA" pass={pickerResult.aaaPass} />
        {pickerResult.isLargeText && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
            Large text
          </span>
        )}
        {pickerResult.bgUndetermined && (
          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
            Background image
          </span>
        )}
      </div>

      <button
        onClick={() => highlightElement(isHighlighted ? null : pickerResult.selector)}
        className={`cursor-pointer rounded px-2 py-1 text-xs font-medium transition-colors ${
          isHighlighted
            ? "bg-blue-200 text-blue-800"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
        }`}
      >
        {isHighlighted ? "Clear highlight" : "Highlight on page"}
      </button>
    </div>
  );
}
