import type { ContrastAuditResult } from "@/types/contrast";

interface ContrastSummaryProps {
  result: ContrastAuditResult;
}

export function ContrastSummary({ result }: ContrastSummaryProps) {
  const { total, failures, undetermined } = result;
  const passing = total - failures.length - undetermined.length;
  const hasIssues = failures.length > 0 || undetermined.length > 0;

  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        hasIssues
          ? "border-orange-200 bg-orange-50"
          : "border-green-200 bg-green-50"
      }`}
    >
      <p
        className={`text-sm font-medium ${
          hasIssues ? "text-orange-800" : "text-green-800"
        }`}
      >
        {hasIssues
          ? `${failures.length} contrast failure${failures.length !== 1 ? "s" : ""}`
          : "All elements meet AA contrast"}
      </p>
      <p
        className={`text-xs ${hasIssues ? "text-orange-700" : "text-green-700"}`}
      >
        {total} element{total !== 1 ? "s" : ""} checked
        {passing > 0 && ` \u00b7 ${passing} passing`}
        {undetermined.length > 0 &&
          ` \u00b7 ${undetermined.length} undetermined`}
      </p>
    </div>
  );
}
