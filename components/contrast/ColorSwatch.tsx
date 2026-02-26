import { parseColor, colorToHex } from "@/lib/contrast";

interface ColorSwatchProps {
  color: string;
  label?: string;
}

export function ColorSwatch({ color, label }: ColorSwatchProps) {
  const hex = colorToHex(parseColor(color));
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-4 w-4 shrink-0 rounded border border-zinc-300"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="font-mono text-xs text-zinc-600">{label ?? hex}</span>
    </span>
  );
}
