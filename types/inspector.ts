export interface AccessibleNameInfo {
  name: string;
  source:
    | "aria-label"
    | "aria-labelledby"
    | "alt"
    | "label-for"
    | "label-wrap"
    | "title"
    | "placeholder"
    | "contents"
    | "none";
}

export interface AriaProperty {
  name: string;
  value: string;
}

export interface InspectorResult {
  selector: string;
  tagName: string;
  accessibleName: AccessibleNameInfo;
  role: string;
  roleSource: "explicit" | "implicit" | "none";
  ariaProperties: AriaProperty[];
  focusable: boolean;
  inTabOrder: boolean;
  tabIndex: number | null;
  missingRequired: string[];
}
