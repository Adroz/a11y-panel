import type { Impact, ScanViolation } from "@/types/scan";

// Defined locally to avoid circular imports with hooks
type CheckStatus = "untested" | "pass" | "fail" | "not-applicable";

export interface ExportData {
  url: string;
  timestamp: number;
  violations: ScanViolation[];
  checklistStatuses: Record<string, CheckStatus>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildFilename(url: string, timestamp: number, ext: string): string {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    hostname = "unknown";
  }
  const date = new Date(timestamp).toISOString().slice(0, 10); // YYYY-MM-DD
  return `a11y-report-${hostname}-${date}.${ext}`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

const IMPACT_COLORS: Record<Impact, { bg: string; text: string }> = {
  critical: { bg: "#dc2626", text: "#ffffff" },
  serious: { bg: "#ea580c", text: "#ffffff" },
  moderate: { bg: "#ca8a04", text: "#ffffff" },
  minor: { bg: "#2563eb", text: "#ffffff" },
};

const STATUS_LABELS: Record<CheckStatus, string> = {
  pass: "Pass",
  fail: "Fail",
  "not-applicable": "N/A",
  untested: "Untested",
};

const STATUS_COLORS: Record<CheckStatus, string> = {
  pass: "#16a34a",
  fail: "#dc2626",
  "not-applicable": "#6b7280",
  untested: "#9ca3af",
};

// ---------------------------------------------------------------------------
// JSON Export
// ---------------------------------------------------------------------------

export function exportJSON(data: ExportData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  downloadBlob(blob, buildFilename(data.url, data.timestamp, "json"));
}

// ---------------------------------------------------------------------------
// HTML Export
// ---------------------------------------------------------------------------

export function exportHTML(data: ExportData): void {
  const { url, timestamp, violations, checklistStatuses } = data;

  // Summary counts — count nodes (issues), not rules, to match UI
  const ruleCount = violations.length;
  let totalIssues = 0;
  const countByImpact: Record<Impact, number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };
  for (const v of violations) {
    totalIssues += v.nodes.length;
    countByImpact[v.impact] += v.nodes.length;
  }

  // Checklist — determine if any criteria have been tested
  const checklistEntries = Object.entries(checklistStatuses);
  const hasTestedCriteria = checklistEntries.some(
    ([, status]) => status !== "untested",
  );

  // Build violation cards
  const violationCards = violations
    .map((v) => {
      const impactColor = IMPACT_COLORS[v.impact];
      const nodeRows = v.nodes
        .map(
          (node) => `
        <div style="margin-bottom:12px;padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;">
          <div style="margin-bottom:6px;">
            <strong style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Selector</strong>
            <div style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:13px;color:#1f2937;margin-top:2px;">${escapeHtml(node.target.join(" > "))}</div>
          </div>
          <div style="margin-bottom:6px;">
            <strong style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">HTML</strong>
            <pre style="margin:2px 0 0;padding:8px;background:#1f2937;color:#e5e7eb;border-radius:4px;font-size:12px;overflow-x:auto;white-space:pre-wrap;word-break:break-all;">${escapeHtml(node.html)}</pre>
          </div>
          <div>
            <strong style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Fix</strong>
            <div style="font-size:13px;color:#374151;margin-top:2px;white-space:pre-wrap;">${escapeHtml(node.failureSummary)}</div>
          </div>
        </div>`,
        )
        .join("");

      return `
      <div style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <div style="padding:16px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <span style="display:inline-block;padding:3px 10px;border-radius:9999px;font-size:12px;font-weight:600;background:${impactColor.bg};color:${impactColor.text};text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(v.impact)}</span>
          <span style="font-weight:600;font-size:15px;color:#111827;">${escapeHtml(v.help)}</span>
          <code style="font-size:12px;color:#6b7280;background:#f3f4f6;padding:2px 6px;border-radius:4px;">${escapeHtml(v.id)}</code>
        </div>
        <div style="padding:16px;">
          <p style="margin:0 0 8px;font-size:14px;color:#374151;">${escapeHtml(v.description)}</p>
          <p style="margin:0 0 16px;">
            <a href="${escapeHtml(v.helpUrl)}" style="font-size:13px;color:#2563eb;text-decoration:underline;" target="_blank" rel="noopener noreferrer">Learn more</a>
          </p>
          <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;">${v.nodes.length} affected node${v.nodes.length !== 1 ? "s" : ""}</div>
          ${nodeRows}
        </div>
      </div>`;
    })
    .join("");

  // Build checklist table
  let checklistSection = "";
  if (hasTestedCriteria) {
    const rows = checklistEntries
      .map(([criterionId, status]) => {
        const color = STATUS_COLORS[status as CheckStatus];
        const label = STATUS_LABELS[status as CheckStatus];
        return `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;color:#1f2937;">${escapeHtml(criterionId)}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
              <span style="display:inline-block;padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:600;color:#fff;background:${color};">${escapeHtml(label)}</span>
            </td>
          </tr>`;
      })
      .join("");

    checklistSection = `
      <div style="margin-top:40px;">
        <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">WCAG Checklist</h2>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="text-align:left;padding:10px 12px;font-size:13px;font-weight:600;color:#374151;border-bottom:2px solid #e5e7eb;">Criterion</th>
              <th style="text-align:left;padding:10px 12px;font-size:13px;font-weight:600;color:#374151;border-bottom:2px solid #e5e7eb;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>`;
  }

  // Summary badges
  const impactBadges = (["critical", "serious", "moderate", "minor"] as const)
    .map((impact) => {
      const c = IMPACT_COLORS[impact];
      return `<div style="display:flex;align-items:center;gap:8px;">
        <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${c.bg};"></span>
        <span style="font-size:14px;color:#374151;text-transform:capitalize;">${impact}</span>
        <span style="font-size:14px;font-weight:600;color:#111827;">${countByImpact[impact]}</span>
      </div>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report - ${escapeHtml(url)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1f2937;line-height:1.6;">
  <div style="max-width:860px;margin:0 auto;padding:32px 24px;">

    <!-- Header -->
    <div style="margin-bottom:32px;">
      <h1 style="font-size:24px;font-weight:800;color:#111827;margin:0 0 8px;">Accessibility Report</h1>
      <p style="margin:0;font-size:14px;color:#6b7280;">
        <strong>URL:</strong> <a href="${escapeHtml(url)}" style="color:#2563eb;text-decoration:underline;" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>
      </p>
      <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">
        <strong>Scanned:</strong> ${escapeHtml(formatDate(timestamp))}
      </p>
    </div>

    <!-- Summary -->
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:32px;">
      <h2 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 16px;">Summary</h2>
      <div style="font-size:32px;font-weight:800;color:#111827;margin-bottom:4px;">${totalIssues} <span style="font-size:16px;font-weight:400;color:#6b7280;">issue${totalIssues !== 1 ? "s" : ""} across ${ruleCount} rule${ruleCount !== 1 ? "s" : ""}</span></div>
      <div style="display:flex;gap:24px;flex-wrap:wrap;">
        ${impactBadges}
      </div>
    </div>

    <!-- Violations -->
    <div style="margin-bottom:32px;">
      <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">Violations</h2>
      ${totalIssues === 0 ? '<p style="font-size:14px;color:#6b7280;">No violations detected.</p>' : violationCards}
    </div>

    <!-- Checklist -->
    ${checklistSection}

    <!-- Footer -->
    <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;text-align:center;">
      Generated by A11y Checker
    </div>

  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  downloadBlob(blob, buildFilename(url, timestamp, "html"));
}
