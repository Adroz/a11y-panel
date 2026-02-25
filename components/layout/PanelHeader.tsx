export function PanelHeader() {
  return (
    <header className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-zinc-700"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m16 10-5.12 6-2.88-3" />
      </svg>
      <h1 className="text-base font-semibold text-zinc-900">A11y Panel</h1>
    </header>
  );
}
