import { useState } from "react";
import { SettingsMenu } from "./SettingsMenu";
import { ExportModal } from "./ExportModal";

export function PanelHeader() {
  const [showExport, setShowExport] = useState(false);

  return (
    <>
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
        <h1 className="text-base font-semibold text-zinc-900">A11y Checker</h1>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setShowExport(true)}
            className="flex cursor-pointer items-center justify-center rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Export report"
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <SettingsMenu />
        </div>
      </header>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </>
  );
}
