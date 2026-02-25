export type Tab = "scan" | "tabstops" | "checklist";

const TABS: { value: Tab; label: string }[] = [
  { value: "scan", label: "Scan" },
  { value: "tabstops", label: "Tab Stops" },
  { value: "checklist", label: "Checklist" },
];

interface PanelNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function PanelNav({ activeTab, onTabChange }: PanelNavProps) {
  return (
    <nav className="flex border-b border-zinc-200 bg-white px-4">
      {TABS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onTabChange(value)}
          className={`cursor-pointer border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === value
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
