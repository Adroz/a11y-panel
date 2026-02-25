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

## Phase 3 — Tab Stops

Visualise keyboard navigation order.

- [ ] Tab stops mode — numbered circles rendered at each focusable element
- [ ] SVG overlay connecting sequential tab stops
- [ ] Focus trap detection and warnings

## Phase 4 — Manual Checklist

Guided manual accessibility assessment.

- [ ] WCAG 2.1 AA checklist (Perceivable, Operable, Understandable, Robust)
- [ ] Auto-populated results from scan data where applicable
- [ ] Step-by-step testing instructions for manual-only items
- [ ] Pass/fail/not-applicable status tracking

## Phase 5 — Export & Polish

Production readiness.

- [ ] HTML report export
- [ ] JSON report export
- [ ] Extension options page (scan configuration, theme)
- [ ] Keyboard shortcuts
- [ ] Badge showing violation count on extension icon
- [ ] Polished extension icons
