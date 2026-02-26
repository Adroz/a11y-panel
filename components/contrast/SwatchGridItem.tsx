import { useState, useRef, useEffect } from "react";
import type { ColorSwatchEntry, SwatchRole } from "@/types/contrast";
import { isValidHex } from "@/lib/contrast/hex";

const ROLE_OPTIONS: { value: SwatchRole; label: string }[] = [
  { value: "normal-text", label: "Normal text" },
  { value: "large-text", label: "Large text" },
  { value: "background", label: "Background" },
  { value: "ui-component", label: "UI component" },
];

interface SwatchGridItemProps {
  swatch: ColorSwatchEntry;
  onRemove: (id: string) => void;
  onRoleChange: (id: string, role: SwatchRole) => void;
  onHexChange: (id: string, hex: string) => void;
  onToggleSelected: (id: string) => void;
}

export function SwatchGridItem({
  swatch,
  onRemove,
  onRoleChange,
  onHexChange,
  onToggleSelected,
}: SwatchGridItemProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(swatch.hex);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const handleStartEdit = () => {
    setEditValue(swatch.hex);
    setEditing(true);
  };

  const handleCommitEdit = () => {
    setEditing(false);
    const value = editValue.startsWith("#") ? editValue : `#${editValue}`;
    if (isValidHex(value)) {
      onHexChange(swatch.id, value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCommitEdit();
    if (e.key === "Escape") setEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(swatch.hex).catch(() => {});
  };

  return (
    <div className="flex items-center gap-2 py-1">
      <input
        type="checkbox"
        checked={swatch.selected}
        onChange={() => onToggleSelected(swatch.id)}
        className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-zinc-300"
      />

      <span
        className="inline-block h-6 w-6 shrink-0 rounded border border-zinc-300"
        style={{ backgroundColor: swatch.hex }}
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
          className="w-20 rounded border border-zinc-300 px-1.5 py-0.5 font-mono text-xs"
          maxLength={7}
        />
      ) : (
        <button
          onClick={handleStartEdit}
          className="cursor-pointer font-mono text-xs text-zinc-600 hover:text-zinc-900"
          title="Click to edit"
        >
          {swatch.hex}
        </button>
      )}

      <select
        value={swatch.role}
        onChange={(e) => onRoleChange(swatch.id, e.target.value as SwatchRole)}
        className="cursor-pointer rounded border border-zinc-200 px-1.5 py-0.5 text-xs text-zinc-600"
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="ml-auto flex gap-1">
        <button
          onClick={handleCopy}
          className="cursor-pointer rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          title="Copy hex"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <button
          onClick={() => onRemove(swatch.id)}
          className="cursor-pointer rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500"
          title="Remove swatch"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
