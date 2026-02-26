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
