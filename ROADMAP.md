# Roadmap

## Phase 1 — MVP: Automated Scanning ✅

Scan the current page, display violations, highlight problem elements.

- [x] WXT project scaffold with React 19, TypeScript, Tailwind CSS 4
- [x] Manifest V3 permissions (`sidePanel`, `activeTab`, `scripting`, `storage`)
- [x] Typed message protocol (discriminated union for all message types)
- [x] axe-core wrapper with FastPass config (wcag2a + wcag2aa + wcag21aa + best-practice)
- [x] Result mapper — transforms raw axe output into app model sorted by impact severity
- [x] Content script — listens for scan requests, dynamically imports axe-core, runs `axe.run()`
- [x] Element highlighter — red outline + scroll-into-view on selected elements
- [x] Background service worker — message routing, side panel opener, `chrome.storage` persistence
- [x] Zustand store — scan status, violations, highlighted element
- [x] Side Panel UI — scan button, progress spinner, summary card, collapsible violation list
- [x] Violation detail — description, WCAG reference link, HTML snippet, highlight button
- [x] Extension icons (placeholder)
- [x] MIT LICENSE + THIRD-PARTY-NOTICES.md

## Phase 2 — Enhanced Results ✅

Richer scan results, filtering, and history.

- [x] Persistent highlight mode (toggle all violations visible at once)
- [x] Colour-coded highlights by impact level (critical=red, serious=orange, moderate=amber, minor=blue)
- [x] Filter violations by impact level
- [x] Filter violations by WCAG category (2.0 A, 2.0 AA, 2.1 AA, 2.2 AA, Best Practice)
- [x] ~~Group violations by rule~~ (removed — violations already grouped by rule in the card view)
- [x] Scan history with delta comparison (new/fixed issues between scans)

## Phase 3 — Tab Stops ✅

Visualise keyboard navigation order.

- [x] Tab stops mode — numbered circles rendered at each focusable element
- [x] SVG overlay connecting sequential tab stops
- [x] Focus trap detection and warnings
- [x] Side panel nav with Scan / Tab Stops tabs

## Phase 4 — Manual Checklist ✅

Guided manual accessibility assessment.

- [x] WCAG 2.1 AA checklist — all 50 Level A + AA criteria across four POUR principles
- [x] Auto-populated from scan results via axe-core rule → WCAG criterion mapping
- [x] Step-by-step testing instructions for each criterion
- [x] Pass/fail/not-applicable status tracking, persisted to chrome.storage
- [x] Progress bar with per-principle breakdown

## Phase 5 — Export & Polish ✅

Production readiness.

- [x] HTML report export (self-contained styled report with violations + checklist)
- [x] JSON report export
- [x] Keyboard shortcut (Alt+Shift+A to run scan)
- [x] Badge showing violation count on extension icon (red for issues, green checkmark for clean)
- [x] Polished extension icons (shield with checkmark)
- [ ] Extension options page (deferred — no meaningful config to expose yet)

## Phase 6 — Rename & UI Polish ✅

Rebrand to A11y Checker and refine violation card UX.

- [x] Rename all user-visible references from "A11y Panel" to "A11y Checker"
- [x] Inline scan button in header (compact, always visible)
- [x] Deduplicate shared `failureSummary` text in grouped violations
- [x] "Show N more" progressive disclosure for violations with many nodes
- [x] Copy violation to clipboard button

## Phase 7 — Contrast Checker ✅

Full-page contrast audit plus a live picker to spot-check elements.

**Audit mode:**
- [x] TreeWalker-based DOM walk of all visible text elements
- [x] WCAG contrast math — sRGB linearization, relative luminance, contrast ratio
- [x] Background color resolution — ancestor walk with alpha compositing over white canvas
- [x] Large text detection (>= 24px or >= 18.67px bold) with 3:1 AA threshold
- [x] Failures sorted worst-first, undetermined (background-image) in separate section
- [x] Highlight failing elements on-page via existing highlight system

**Picker mode:**
- [x] Toggle picker — hover highlights elements with blue overlay + floating tooltip
- [x] Click to lock selection, Escape to unlock or dismiss picker
- [x] Show foreground/background color swatches, hex values, contrast ratio, AA/AAA badges
- [x] Works on any element (text, images, links) — not limited to text nodes
- [x] Picker dismissal via Escape syncs state back to side panel

**UI:**
- [x] New "Contrast" tab in PanelNav (between Tab Stops and Checklist)
- [x] Audit summary card (green for clean, orange for failures)
- [x] Failure list with color swatches, ratio, AA/AAA badges, highlight button
- [x] Picker detail card with tag name, accessible name, full contrast info
- [x] Tab-switch cleanup (picker auto-disabled when navigating away)

**Robustness:**
- [x] Extension-injected elements excluded from audit and picker
- [x] Error handling on restricted pages (chrome://, extensions page)
- [x] Fixed tab stop active circle contrast (darkened from #e65100 to #bf360c)

## Phase 8 — Element Inspector

Click-to-inspect any element and view its accessibility properties.

**Interaction:**
- [ ] Toggle inspector mode — hover highlights elements, click selects
- [ ] Share picker mechanism with contrast checker where possible

**Properties shown:**
- [ ] Computed accessible name (and source — `aria-label`, `aria-labelledby`, content, `alt`, `title`)
- [ ] Role (explicit ARIA role or implicit HTML role)
- [ ] States & properties (`aria-expanded`, `aria-required`, `aria-checked`, etc.)
- [ ] Focusable / in tab order
- [ ] Missing required properties (e.g. `role="checkbox"` without `aria-checked`)

## Phase 9 — Checklist Improvements

Refine the manual checklist UX and workflow.

- [ ] Per-page checklist state (track progress per URL)
- [ ] Better auto-populate accuracy and feedback
- [ ] Checklist export integration (include in HTML/JSON reports)

## Phase 10 — Issue Navigator & Auto-Rescan

Streamline the scan workflow with guided issue navigation and automatic re-scanning.

- [ ] Step-by-step issue stepper — walk through violations one at a time, scrolling to each on the page
- [ ] Re-scan on page navigation — detect URL changes, prompt or auto-rescan

## Phase 11 — Manual Tab Stops ✅

Interactive tab stop list with reorder, highlight, and export.

- [x] Serialize tab stops with accessible name, role, and trap membership
- [x] Side panel list with numbered rows, click-to-highlight, and scroll-into-view
- [x] Prev/Next stepping through tab stops
- [x] Focus trap grouping with red accent in the list
- [x] Pointer-based drag-to-reorder with live gap preview and renumbered items
- [x] Keyboard reorder (up/down buttons)
- [x] Overlay circle highlight and pulsing ring on selected element
- [x] Auto-select moved item after reorder
- [x] JSON export of tab stop order with selectors, roles, and trap info

## Phase 12 — Plain Language Mode ✅

Make results accessible to non-technical users.

- [x] Technical / non-technical toggle (persisted to storage)
- [x] Simplified violation descriptions and fix suggestions for all 98 axe-core rules
- [x] Plain language checklist descriptions and testing steps for all 50 WCAG criteria
- [x] Settings gear menu in header with toggle switch
- [x] Exports and copy always use technical text regardless of mode

## Phase 13 — Quality of Life

Keyboard navigation, export improvements, and extension settings.

- [ ] Keyboard navigation within the side panel (arrow keys, focus management)
- [ ] AI-friendly export format (structured for pasting into LLM prompts)
- [ ] Extension options page (when there's enough config to justify it)
