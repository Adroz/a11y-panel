import type { RunOptions } from "axe-core";

export const FAST_PASS_CONFIG: RunOptions = {
  runOnly: {
    type: "tag",
    values: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"],
  },
  resultTypes: ["violations"],
};
