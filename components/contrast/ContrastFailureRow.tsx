import { useState, useRef, useEffect } from "react";
import type { ContrastResult, ColorSuggestion } from "@/types/contrast";
import { useContrastStore } from "@/hooks/use-contrast";
import { parseColor, colorToHex, contrastRatio as calcContrastRatio } from "@/lib/contrast/wcag";
import { hexToRgba, isValidHex, normalizeHex } from "@/lib/contrast/hex";
import { suggestColorFix } from "@/lib/contrast/suggest";
import { ColorSwatch } from "./ColorSwatch";
import { RatioBadge } from "./RatioBadge";
import { ColorSuggestionPanel } from "./ColorSuggestion";

interface ContrastFailureRowProps {
  result: ContrastResult;
}

export function ContrastFailureRow({ result }: ContrastFailureRowProps) {
  const highlightedSelector = useContrastStore((s) => s.highlightedSelector);
  const highlightElement = useContrastStore((s) => s.highlightElement);
  const appliedFixes = useContrastStore((s) => s.appliedFixes);
  const applyFix = useContrastStore((s) => s.applyFix);
  const revertFix = useContrastStore((s) => s.revertFix);
  const isHighlighted = highlightedSelector === result.selector;

  const [suggestions, setSuggestions] = useState<ColorSuggestion[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const appliedFix = appliedFixes.find((f) => f.selector === result.selector);

  const originalFgHex = colorToHex(parseColor(result.fgColor));
  const bgHex = colorToHex(parseColor(result.bgColor));

  // Compute displayed values — use applied fix color when present
  const displayFgHex = appliedFix?.newHex ?? originalFgHex;
  const displayRatio = appliedFix
    ? calcContrastRatio(hexToRgba(appliedFix.newHex), hexToRgba(bgHex))
    : result.contrastRatio;
  const displayAaPass = displayRatio >= result.requiredRatio;
  const aaaThreshold = result.isLargeText ? 4.5 : 7;
  const displayAaaPass = displayRatio >= aaaThreshold;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSuggestFix = () => {
    if (suggestions) {
      setSuggestions(null);
      return;
    }
    const results = suggestColorFix(originalFgHex, bgHex, result.requiredRatio);
    setSuggestions(results);
  };

  const handleUseSuggestion = (suggestion: ColorSuggestion) => {
    applyFix(result.selector, originalFgHex, suggestion.suggestedHex, suggestion.achievedRatio);
    setSuggestions(null);
  };

  const handleStartEdit = () => {
    setEditValue(displayFgHex);
    setEditing(true);
  };

  const handleCommitEdit = () => {
    setEditing(false);
    const value = editValue.startsWith("#") ? editValue : `#${editValue}`;
    if (!isValidHex(value)) return;
    const normalized = normalizeHex(value);
    if (!normalized || normalized === displayFgHex) return;
    const newRatio = calcContrastRatio(hexToRgba(normalized), hexToRgba(bgHex));
    applyFix(result.selector, originalFgHex, normalized, newRatio);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCommitEdit();
    if (e.key === "Escape") setEditing(false);
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <p className="mb-2 text-sm text-zinc-900 truncate" title={result.textSnippet}>
        {result.textSnippet || <span className="italic text-zinc-400">(empty text)</span>}
      </p>

      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {appliedFix ? (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-4 w-4 shrink-0 rounded border border-zinc-300"
              style={{ backgroundColor: displayFgHex }}
              aria-hidden="true"
            />
            {editing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleCommitEdit}
                onKeyDown={handleKeyDown}
                maxLength={7}
                className="w-20 rounded border border-zinc-300 px-1.5 py-0.5 font-mono text-xs"
              />
            ) : (
              <button
                onClick={handleStartEdit}
                className="cursor-pointer font-mono text-xs text-zinc-600 hover:text-zinc-900 hover:underline"
              >
                {displayFgHex}
              </button>
            )}
          </span>
        ) : (
          <ColorSwatch color={result.fgColor} />
        )}
        <span className="text-xs text-zinc-400">/</span>
        <ColorSwatch color={result.bgColor} />
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        {appliedFix ? (
          <>
            <span className="text-sm text-zinc-400 line-through">{result.contrastRatio}:1</span>
            <span className="text-xs text-zinc-400">&rarr;</span>
            <span className="text-sm font-semibold text-zinc-800">{displayRatio}:1</span>
          </>
        ) : (
          <span className="text-sm font-semibold text-zinc-800">{displayRatio}:1</span>
        )}
        <RatioBadge level="AA" pass={displayAaPass} />
        <RatioBadge level="AAA" pass={displayAaaPass} />
        {result.isLargeText && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
            Large text
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
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

        {!result.bgUndetermined && !appliedFix && (
          <button
            onClick={handleSuggestFix}
            className={`cursor-pointer rounded px-2 py-1 text-xs font-medium transition-colors ${
              suggestions
                ? "bg-violet-100 text-violet-700"
                : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
            }`}
          >
            {suggestions ? "Hide suggestions" : "Suggest fix"}
          </button>
        )}

        {appliedFix && (
          <button
            onClick={() => revertFix(result.selector)}
            className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            Undo changes
          </button>
        )}
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {suggestions.map((s) => (
            <ColorSuggestionPanel
              key={s.direction}
              suggestion={s}
              onUse={handleUseSuggestion}
            />
          ))}
        </div>
      )}

      {suggestions && suggestions.length === 0 && (
        <p className="mt-2 text-xs text-zinc-400">No passing color found.</p>
      )}
    </div>
  );
}
