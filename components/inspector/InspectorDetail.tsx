import { useInspectorStore } from "@/hooks/use-inspector";
import type { InspectorResult } from "@/types/inspector";

const NAME_SOURCE_LABELS: Record<string, string> = {
  "aria-label": "via aria-label",
  "aria-labelledby": "via aria-labelledby",
  alt: "via alt attribute",
  "label-for": "via <label for>",
  "label-wrap": "via wrapping <label>",
  title: "via title attribute",
  placeholder: "via placeholder",
  contents: "via text content",
  none: "",
};

function HighlightButton({ selector }: { selector: string }) {
  const handleClick = () => {
    chrome.runtime.sendMessage({
      type: "HIGHLIGHT_ELEMENT",
      selector,
      impact: "minor",
    }).catch(() => {});
  };

  return (
    <button
      onClick={handleClick}
      className="cursor-pointer rounded bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-200"
    >
      Highlight on page
    </button>
  );
}

function RoleSection({ result }: { result: InspectorResult }) {
  return (
    <div className="flex items-center gap-2">
      <span className="rounded bg-violet-200 px-1.5 py-0.5 font-mono text-xs text-violet-800">
        &lt;{result.tagName}&gt;
      </span>
      {result.role ? (
        <span className="text-xs text-violet-700">
          {result.role}
          <span className="text-violet-400"> ({result.roleSource})</span>
        </span>
      ) : (
        <span className="text-xs text-violet-400">no role</span>
      )}
    </div>
  );
}

function NameSection({ result }: { result: InspectorResult }) {
  const { name, source } = result.accessibleName;

  if (!name) {
    return (
      <div className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5">
        <p className="text-xs font-medium text-amber-700">No accessible name</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-violet-900">
        &ldquo;{name}&rdquo;
      </p>
      <p className="text-xs text-violet-400">{NAME_SOURCE_LABELS[source]}</p>
    </div>
  );
}

function AriaSection({ result }: { result: InspectorResult }) {
  if (result.ariaProperties.length === 0) {
    return <p className="text-xs text-violet-400">No ARIA attributes</p>;
  }

  return (
    <div className="space-y-0.5">
      {result.ariaProperties.map((prop) => (
        <div key={prop.name} className="flex items-baseline gap-1.5 font-mono text-xs">
          <span className="text-violet-700">{prop.name}</span>
          <span className="text-violet-400">=</span>
          <span className="text-violet-900">&ldquo;{prop.value}&rdquo;</span>
        </div>
      ))}
    </div>
  );
}

function FocusSection({ result }: { result: InspectorResult }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
      <span className={result.focusable ? "text-violet-700" : "text-violet-400"}>
        {result.focusable ? "Focusable" : "Not focusable"}
      </span>
      {result.focusable && (
        <span className={result.inTabOrder ? "text-violet-700" : "text-violet-400"}>
          {result.inTabOrder ? "In tab order" : "Not in tab order"}
        </span>
      )}
      {result.tabIndex !== null && (
        <span className="text-violet-400">tabindex={result.tabIndex}</span>
      )}
    </div>
  );
}

function MissingRequiredSection({ result }: { result: InspectorResult }) {
  if (result.missingRequired.length === 0) return null;

  return (
    <div className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5">
      <p className="text-xs font-medium text-amber-700">Missing required properties:</p>
      <ul className="mt-0.5 list-inside list-disc">
        {result.missingRequired.map((prop) => (
          <li key={prop} className="font-mono text-xs text-amber-600">{prop}</li>
        ))}
      </ul>
    </div>
  );
}

export function InspectorDetail() {
  const result = useInspectorStore((s) => s.result);

  if (!result) return null;

  return (
    <div className="space-y-2 rounded-lg border border-violet-200 bg-violet-50 p-3">
      <RoleSection result={result} />
      <NameSection result={result} />
      <AriaSection result={result} />
      <FocusSection result={result} />
      <MissingRequiredSection result={result} />
      <HighlightButton selector={result.selector} />
    </div>
  );
}
