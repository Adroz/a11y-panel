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

## Phase 8 — Manual Tab Stops ✅

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

## Phase 9 — Plain Language Mode ✅

Make results accessible to non-technical users.

- [x] Technical / non-technical toggle (persisted to storage)
- [x] Simplified violation descriptions and fix suggestions for all 98 axe-core rules
- [x] Plain language checklist descriptions and testing steps for all 50 WCAG criteria
- [x] Settings gear menu in header with toggle switch
- [x] Exports and copy always use technical text regardless of mode

## Phase 10 — Color Picker & Swatch Comparison ✅

Pixel-level eyedropper and swatch comparison grid for arbitrary color contrast checks.

**Pixel picker:**
- [x] Screenshot capture via `chrome.tabs.captureVisibleTab()` in background script
- [x] Full-screen canvas overlay in content script with crosshair cursor
- [x] Magnifier lens — 15x15 pixel grid at 8x zoom, following cursor, with center pixel highlight
- [x] DPI-aware pixel sampling (retina/HiDPI coordinate mapping)
- [x] Click to sample pixel color (picker stays active for multiple picks)
- [x] Escape to dismiss, smart magnifier positioning near viewport edges

**Swatch grid:**
- [x] Collected color swatches with hex value, color preview, and role assignment
- [x] Inline hex editing with validation (3 or 6 digit hex)
- [x] Role dropdown: Normal text / Large text / Background / UI component
- [x] Select/deselect, copy hex, remove individual swatches
- [x] Select all / clear all controls

**Contrast comparison:**
- [x] Role-aware pairing — foreground swatches vs background swatches
- [x] Threshold selection by role (normal text 4.5:1, large text 3:1, UI component 3:1)
- [x] Fallback to all-pairs comparison at 4.5:1 when no background assigned
- [x] AA/AAA pass/fail badges per pair

**Color suggestions:**
- [x] HSL-based binary search for minimum lightness change to meet target ratio
- [x] Lighter and darker suggestions offered for failing pairs
- [x] "Use this" button updates swatch and re-triggers comparison
- [x] "Copy" button for suggested hex values

**Integration:**
- [x] Mutual exclusivity — pixel picker and element picker disable each other
- [x] Tab-switch cleanup — pixel picker disabled when leaving Contrast tab
- [x] Tab stops cleared when leaving Tab Stops tab
- [x] Swatch grid and comparison persist across mode changes

**UI refinements:**
- [x] Contrast tab uses three always-on toggle buttons (Contrast checker, Element picker, Colour picker)
- [x] Consistent blue active state across all toggle buttons
- [x] Only the selected view's content is shown; one view always active
- [x] Contrast checker auto-runs on first visit, re-runs on click
- [x] Helper text for empty element picker and colour picker states
- [x] Magnifier hidden when cursor leaves the page
- [x] Colour suggestion layout wraps cleanly at narrow widths
- [x] Scan button moved from header to Scan tab

## Phase 11 — Element Inspector ✅

Click-to-inspect any element and view its accessibility properties. Hidden behind a settings toggle ("Element inspector") while being evaluated for usefulness.

**Interaction:**
- [x] Toggle inspector mode — hover highlights elements with violet overlay, click selects
- [x] Separate picker from contrast checker (violet tint vs blue), auto-starts on tab entry
- [x] Mutual exclusivity with contrast element picker and pixel picker
- [x] Hidden by default — enable via gear menu "Element inspector" toggle (persisted to storage)

**Properties shown:**
- [x] Computed accessible name (and source — `aria-label`, `aria-labelledby`, content, `alt`, `title`, `placeholder`, `label`)
- [x] Role (explicit ARIA role or implicit HTML role)
- [x] States & properties (`aria-expanded`, `aria-required`, `aria-checked`, etc.)
- [x] Focusable / in tab order / tabindex value
- [x] Missing required properties for explicit roles (e.g. `role="checkbox"` without `aria-checked`)
- [x] Highlight inspected element on page

## Phase 12 — Assessment-Style Checklist ✅

Restructure the checklist from POUR-principle grouping to activity-based grouping inspired by [Accessibility Insights](https://github.com/microsoft/accessibility-insights-web). Groups criteria by testing domain (Keyboard, Focus, Images, etc.) instead of abstract WCAG principles, making the checklist more actionable.

**Data model:**
- [x] New `AssessmentCategory` type: key, label, order, getting-started text, criterion IDs
- [x] 15 categories: Automated Checks, Keyboard, Focus, Headings & Landmarks, Links & Navigation, Images, Sensory & Color, Adaptable Content, Forms & Errors, Widgets, Timed Events, Multimedia, Language, Pointer & Motion, Predictable Behaviour
- [x] Each category maps to a subset of the existing 50 WCAG criteria (regrouped, not changed)
- [x] Getting-started text per category: 1–2 paragraphs explaining who this helps and what to look for

**UI:**
- [x] Numbered collapsible category sections replace POUR `<details>` sections
- [x] Each category expands to show "Getting started" blurb then individual criteria
- [x] Category header shows aggregate progress (e.g. "3/5 tested") and fail count
- [x] "Automated checks" category at top — lists `canAutoDetect` criteria, links to scan
- [x] Overall progress bar and action buttons (auto-populate, reset) unchanged
- [x] Individual `ChecklistItem` component unchanged

**Migration:**
- [x] `PRINCIPLES` → `ASSESSMENT_CATEGORIES` array
- [x] `PrincipleSection` → `CategorySection` component
- [x] `usePrincipleProgress` → `useCategoryProgress` hook

## Phase 12b — Guided Assessment Flow ✅

Inline accordion checklist: expanding a category shows a stepper within the list, keeping progress bar, action buttons, and all other categories visible.

- [x] Remove Automated Checks virtual category (14 categories remain)
- [x] Merged "Scan" + "Auto-populate" into a single "Scan & auto-populate" button
- [x] Inline accordion — clicking a category expands it in-place; clicking again collapses
- [x] Opening one category auto-closes any other
- [x] Expanded view: progress dots, getting started, criterion card, prev/next nav
- [x] Large Pass / Fail / N/A buttons (full-width, labelled words)
- [x] Auto-advance on status change (Pass/Fail/N/A advances to next criterion)
- [x] Last criterion answered auto-opens next category (collapses if last)
- [x] Collapsible "Getting started" section, open by default on first criterion
- [x] Violation indicator when scan flagged elements for current criterion
- [x] Element highlighting via HIGHLIGHT_ALL for criteria with scan violations
- [x] Highlights clear on criterion navigation and tab switch
- [x] Criterion highlight map built from scan violations via AXE_TO_WCAG + tag parsing
- [x] Progress bar + scan button + reset always visible regardless of expanded state

## Phase 12c — Automated Verification ✅

Vitest test suite for checklist data model and store logic.

- [x] Vitest setup with chrome API mocks and `@/` path aliases
- [x] Category count assertion (14 categories, 50 total criteria, unique keys, valid IDs)
- [x] Checklist store unit tests (navigation state, toggle, auto-advance, status management)
- [x] Progress calculation unit tests (per-category and overall, mixed statuses)
- [x] Auto-populate integration test (scan → auto-populate → correct statuses, no overwrite)
- [x] AXE_TO_WCAG mapping integrity test (all mapped IDs are valid criteria)
- [x] Highlight map unit tests (violations → criterion ID mapping, multi-node, multi-criterion)
- [x] `pnpm test` script (50 tests across 5 test files)

## Phase 13 — Tab Stop Improvements ✅

Enhance tab stops with persistent state, auto-show, and checklist integration.

- [x] Auto-show tab stops when entering Tab Stops tab (re-hide on leave)
- [x] Persist reordered tab stop order across tab switches (don't re-walk DOM)
- [x] Remember toggle preference (on/off) in chrome.storage
- [x] Export with original + reordered position columns (HTML and JSON)
- [x] Focus category in checklist shows captured tab stop order inline
- [x] Sticky header and tab nav — content scrolls underneath
- [x] Sticky prev/next nav in tab stop list
- [x] Remove redundant Element column from exports (Role column uses tagName fallback)

## Phase 14 — Contrast Fix Suggestions ✅

Live-preview contrast fixes on the page and track applied changes.

- [x] "Suggest fix" button on contrast audit failure rows
- [x] Live preview — apply suggested color to page element via inline style override
- [x] Track applied fixes in store (selector, property, original hex, new hex)
- [x] Include applied fixes in HTML/JSON export ("Suggested fixes" section)
- [x] Clear overrides on tab switch / reset (same as highlight cleanup)

## Phase 15 — Text-in-Image Detection ✅

Flag images that likely contain text for WCAG 1.4.5 (Images of Text) review.

- [x] Tier 1: metadata heuristics (SVG `<text>` elements, alt text keywords, filename patterns)
- [x] Tier 2: canvas edge-density analysis (row variance, horizontal band detection)
- [x] Tier 3: progressive enhancement via TextDetector API when available
- [x] Flag images as "likely contains text" in scan results for manual review
- [x] Integration with checklist via `text-in-image` → 1.4.5 auto-populate mapping
- [x] Plain language mode support

## Phase 16 — Checklist Improvements

Refine the checklist workflow beyond the restructure.

- [ ] Per-page checklist state (track progress per URL)
- [ ] Better auto-populate accuracy and feedback

## Phase 17 — Issue Navigator & Auto-Rescan

Streamline the scan workflow with guided issue navigation and automatic re-scanning.

- [ ] Step-by-step issue stepper — walk through violations one at a time, scrolling to each on the page
- [ ] Re-scan on page navigation — detect URL changes, prompt or auto-rescan

## Phase 18 — Quality of Life

Keyboard navigation, export improvements, and extension settings.

- [ ] Keyboard navigation within the side panel (arrow keys, focus management)
- [ ] AI-friendly export format (structured for pasting into LLM prompts)
- [ ] Extension options page (when there's enough config to justify it)
