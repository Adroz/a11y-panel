import { useContrastStore } from "@/hooks/use-contrast";
import { useColorPickerStore } from "@/hooks/use-color-picker";

export type ContrastView = "checker" | "element-picker" | "color-picker";

interface ContrastActionsProps {
  activeView: ContrastView;
  onViewChange: (view: ContrastView) => void;
}

export function ContrastActions({ activeView, onViewChange }: ContrastActionsProps) {
  const contrastMode = useContrastStore((s) => s.mode);
  const runAudit = useContrastStore((s) => s.runAudit);
  const togglePicker = useContrastStore((s) => s.togglePicker);

  const pixelMode = useColorPickerStore((s) => s.pickerMode);
  const startPixelPicker = useColorPickerStore((s) => s.startPixelPicker);
  const stopPixelPicker = useColorPickerStore((s) => s.stopPixelPicker);

  const isAuditLoading = contrastMode === "audit-loading";

  const stopActivePickers = () => {
    if (contrastMode === "picker-active") togglePicker();
    if (pixelMode === "active") stopPixelPicker();
  };

  const handleChecker = () => {
    stopActivePickers();
    onViewChange("checker");
    runAudit();
  };

  const handleElementPicker = () => {
    if (activeView === "element-picker") {
      // Toggle the picker on/off within the view
      togglePicker();
      return;
    }
    if (pixelMode === "active") stopPixelPicker();
    onViewChange("element-picker");
    if (contrastMode !== "picker-active") togglePicker();
  };

  const handleColorPicker = () => {
    if (activeView === "color-picker") {
      // Toggle the pixel picker on/off within the view
      if (pixelMode === "active") {
        stopPixelPicker();
      } else {
        startPixelPicker();
      }
      return;
    }
    if (contrastMode === "picker-active") togglePicker();
    onViewChange("color-picker");
    startPixelPicker();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleChecker}
        disabled={isAuditLoading}
        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          activeView === "checker"
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
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        Contrast checker
      </button>

      <button
        onClick={handleElementPicker}
        disabled={isAuditLoading}
        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          activeView === "element-picker"
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
          <path d="m2 2 8 3-1 1" />
          <path d="m22 22-8-3 1-1" />
          <path d="m7 7 1.5 1.5" />
          <path d="m15.5 15.5 1.5 1.5" />
          <path d="m18 4-4 4" />
          <path d="m10 14-4 4" />
        </svg>
        Element picker
      </button>

      <button
        onClick={handleColorPicker}
        disabled={isAuditLoading || pixelMode === "capturing"}
        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          activeView === "color-picker"
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
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
        Colour picker
      </button>
    </div>
  );
}
