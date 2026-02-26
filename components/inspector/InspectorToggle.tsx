import { useInspectorStore } from "@/hooks/use-inspector";

export function InspectorToggle() {
  const mode = useInspectorStore((s) => s.mode);
  const toggle = useInspectorStore((s) => s.toggle);

  const isActive = mode === "active";

  return (
    <button
      onClick={toggle}
      className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "border-blue-300 bg-blue-50 text-blue-700"
          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
      }`}
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      {isActive ? "Stop inspector" : "Start inspector"}
    </button>
  );
}
