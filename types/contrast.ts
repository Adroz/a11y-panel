export interface ContrastResult {
  selector: string;
  textSnippet: string;
  fontSize: number;
  fontWeight: number;
  isLargeText: boolean;
  fgColor: string;
  bgColor: string;
  contrastRatio: number;
  requiredRatio: number;
  aaPass: boolean;
  aaaPass: boolean;
  bgUndetermined: boolean;
}

export interface ContrastPickerResult extends ContrastResult {
  tagName: string;
  accessibleName: string;
}

export interface ContrastAuditResult {
  total: number;
  failures: ContrastResult[];
  undetermined: ContrastResult[];
}

export type SwatchRole = "normal-text" | "large-text" | "background" | "ui-component";

export interface ColorSwatchEntry {
  id: string;
  hex: string;
  role: SwatchRole;
  selected: boolean;
}

export interface SwatchContrastPair {
  fgId: string;
  bgId: string;
  fgHex: string;
  bgHex: string;
  fgRole: SwatchRole;
  bgRole: SwatchRole;
  contrastRatio: number;
  requiredRatio: number;
  aaPass: boolean;
  aaaPass: boolean;
}

export interface ColorSuggestion {
  originalHex: string;
  suggestedHex: string;
  targetRatio: number;
  achievedRatio: number;
  direction: "lighter" | "darker";
}
