import { useState } from "react";
import type { ScanViolation } from "@/types/scan";
import { useScanStore } from "@/hooks/use-scan";
import { ImpactBadge } from "./ImpactBadge";

const INITIAL_VISIBLE = 3;

interface ViolationCardProps {
  violation: ScanViolation;
}

function buildCopyText(violation: ScanViolation): string {
  const lines = [
    `[${violation.impact.toUpperCase()}] ${violation.help}`,
    violation.description,
    `Rule: ${violation.id}`,
    `Info: ${violation.helpUrl}`,
    "",
    `Affected elements (${violation.nodes.length}):`,
  ];

  for (const node of violation.nodes) {
    lines.push(`  - ${node.target.join(" > ")}`);
    if (node.failureSummary) {
      lines.push(`    ${node.failureSummary}`);
    }
  }

  return lines.join("\n");
}

export function ViolationCard({ violation }: ViolationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);
  const highlightedSelector = useScanStore((s) => s.highlightedSelector);
  const setHighlighted = useScanStore((s) => s.setHighlighted);

  // Deduplicate: if all nodes share the same failureSummary, show it once
  const summaries = violation.nodes.map((n) => n.failureSummary);
  const sharedSummary =
    summaries.length > 0 && summaries.every((s) => s === summaries[0])
      ? summaries[0]
      : null;

  const totalNodes = violation.nodes.length;
  const visibleNodes =
    showAll || totalNodes <= INITIAL_VISIBLE
      ? violation.nodes
      : violation.nodes.slice(0, INITIAL_VISIBLE);
  const hiddenCount = totalNodes - INITIAL_VISIBLE;

  function handleCopy() {
    navigator.clipboard.writeText(buildCopyText(violation)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full cursor-pointer items-start gap-3 p-3 text-left hover:bg-zinc-50"
        aria-expanded={expanded}
      >
        <svg
          className={`mt-0.5 h-4 w-4 shrink-0 text-zinc-400 transition-transform ${expanded ? "rotate-90" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <ImpactBadge impact={violation.impact} />
            <span className="text-xs text-zinc-500">
              {totalNodes} element{totalNodes !== 1 && "s"}
            </span>
          </div>
          <p className="text-sm font-medium text-zinc-900">{violation.help}</p>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-100 px-3 pb-3 pt-2">
          <p className="mb-2 text-xs text-zinc-600">{violation.description}</p>

          <div className="mb-3 flex items-center gap-3">
            <a
              href={violation.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              Learn more
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
              </svg>
            </a>

            <button
              onClick={handleCopy}
              className="inline-flex cursor-pointer items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700"
            >
              {copied ? (
                <>
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect width="14" height="14" x="8" y="8" rx="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>

          {sharedSummary && (
            <p className="mb-2 text-xs text-zinc-500">{sharedSummary}</p>
          )}

          <div className="space-y-2">
            {visibleNodes.map((node, i) => {
              const selector = node.target[0];
              const isHighlighted = highlightedSelector === selector;

              return (
                <div key={i} className="rounded border border-zinc-100 bg-zinc-50 p-2">
                  <pre className="mb-2 overflow-x-auto text-xs text-zinc-700 whitespace-pre-wrap break-all">
                    {node.html}
                  </pre>
                  {!sharedSummary && node.failureSummary && (
                    <p className="mb-2 text-xs text-zinc-500">{node.failureSummary}</p>
                  )}
                  <button
                    onClick={() => setHighlighted(isHighlighted ? null : selector, violation.impact)}
                    className={`cursor-pointer rounded px-2 py-1 text-xs font-medium transition-colors ${
                      isHighlighted
                        ? "bg-red-100 text-red-700"
                        : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                    }`}
                  >
                    {isHighlighted ? "Clear highlight" : "Highlight"}
                  </button>
                </div>
              );
            })}
          </div>

          {totalNodes > INITIAL_VISIBLE && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-2 cursor-pointer text-xs font-medium text-blue-600 hover:underline"
            >
              {showAll ? "Show fewer" : `Show ${hiddenCount} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
