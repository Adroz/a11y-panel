type Tab = "scan" | "tabstops";

interface PanelNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function PanelNav({ activeTab, onTabChange }: PanelNavProps) {
  return (
    <nav className="flex border-b border-zinc-200 bg-white px-4">
      <button
        onClick={() => onTabChange("scan")}
        className={`cursor-pointer border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
          activeTab === "scan"
            ? "border-zinc-900 text-zinc-900"
            : "border-transparent text-zinc-500 hover:text-zinc-700"
        }`}
      >
        Scan
      </button>
      <button
        onClick={() => onTabChange("tabstops")}
        className={`cursor-pointer border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
          activeTab === "tabstops"
            ? "border-zinc-900 text-zinc-900"
            : "border-transparent text-zinc-500 hover:text-zinc-700"
        }`}
      >
        Tab Stops
      </button>
    </nav>
  );
}
