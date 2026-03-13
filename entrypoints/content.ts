import { FAST_PASS_CONFIG, mapAxeResults, mapAxePasses } from "@/lib/scanner";
import { detectTextInImages } from "@/lib/scanner/text-in-image";
import { IMPACT_ORDER } from "@/types/scan";
import type { CustomCheckCounts } from "@/types/scan";
import { checkTextSpacing } from "@/lib/scanner/checks/text-spacing";
import { checkFocusOrder } from "@/lib/scanner/checks/focus-order";
import { checkFocusVisible } from "@/lib/scanner/checks/focus-visible";
import { checkCaptions } from "@/lib/scanner/checks/captions";
import { checkKeyboard } from "@/lib/scanner/checks/keyboard";
import { highlightElement, highlightAll, clearHighlights } from "@/lib/highlighter";
import {
  getTabStops,
  detectFocusTraps,
  generateSelector,
  getAccessibleName,
  showTabStopOverlay,
  hideTabStopOverlay,
  highlightTabStopCircle,
  showHighlightRing,
  clearHighlightRing,
  type TabStop,
  type FocusTrap,
} from "@/lib/tabstops";
import { runContrastAudit, enablePicker, disablePicker } from "@/lib/contrast";
import { enablePixelPicker, disablePixelPicker } from "@/lib/contrast/pixel-picker";
import { enableInspectorPicker, disableInspectorPicker, getImplicitRole } from "@/lib/inspector";
import type { Message, ResponseMessage, SerializedTabStop } from "@/types/messages";

// Module-level state for tab stops so later messages can reference live elements
let storedTabStops: TabStop[] = [];
let storedTraps: FocusTrap[] = [];

// Maps selector → original inline style.color (empty string if none was set)
const contrastFixOverrides = new Map<string, string>();

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_idle",
  main(_ctx) {
    chrome.runtime.onMessage.addListener(
      (message: Message, _sender, sendResponse: (r: ResponseMessage) => void) => {
        switch (message.type) {
          case "RUN_AXE_SCAN":
            handleScan(sendResponse);
            return true;

          case "HIGHLIGHT_ELEMENT":
            highlightElement(message.selector, message.impact);
            sendResponse({ type: "HIGHLIGHT_APPLIED", selector: message.selector });
            return false;

          case "HIGHLIGHT_ALL": {
            const count = highlightAll(message.targets);
            sendResponse({ type: "HIGHLIGHTS_APPLIED", count });
            return false;
          }

          case "CLEAR_HIGHLIGHTS":
            clearHighlights();
            sendResponse({ type: "HIGHLIGHTS_CLEARED" });
            return false;

          case "ENABLE_TAB_STOPS":
            handleEnableTabStops(sendResponse);
            return false;

          case "DISABLE_TAB_STOPS":
            hideTabStopOverlay();
            clearHighlightRing();
            storedTabStops = [];
            storedTraps = [];
            sendResponse({ type: "TAB_STOPS_DISABLED" });
            return false;

          case "HIGHLIGHT_TAB_STOP":
            handleHighlightTabStop(message.selector, sendResponse);
            return false;

          case "CLEAR_TAB_STOP_HIGHLIGHT":
            highlightTabStopCircle(null);
            clearHighlightRing();
            sendResponse({ type: "TAB_STOP_HIGHLIGHT_CLEARED" });
            return false;

          case "REORDER_TAB_STOPS":
            handleReorderTabStops(message.order, sendResponse);
            return false;

          case "HIDE_TAB_STOPS_OVERLAY":
            hideTabStopOverlay();
            clearHighlightRing();
            sendResponse({ type: "TAB_STOPS_OVERLAY_HIDDEN" });
            return false;

          case "SHOW_TAB_STOPS_OVERLAY":
            handleShowTabStopsOverlay(sendResponse);
            return false;

          case "RUN_CONTRAST_AUDIT":
            handleContrastAudit(sendResponse);
            return false;

          case "ENABLE_CONTRAST_PICKER":
            handleEnableContrastPicker();
            sendResponse({ type: "CONTRAST_PICKER_ENABLED" });
            return false;

          case "DISABLE_CONTRAST_PICKER":
            disablePicker();
            sendResponse({ type: "CONTRAST_PICKER_DISABLED" });
            return false;

          case "HIGHLIGHT_CONTRAST_ELEMENT":
            highlightElement(message.selector, "serious");
            sendResponse({ type: "HIGHLIGHT_APPLIED", selector: message.selector });
            return false;

          case "CLEAR_CONTRAST_HIGHLIGHT":
            clearHighlights();
            sendResponse({ type: "HIGHLIGHTS_CLEARED" });
            return false;

          case "ENABLE_PIXEL_PICKER":
            handleEnablePixelPicker(message.screenshotDataUrl, sendResponse);
            return true; // async

          case "DISABLE_PIXEL_PICKER":
            disablePixelPicker();
            sendResponse({ type: "PIXEL_PICKER_DISABLED" });
            return false;

          case "ENABLE_INSPECTOR":
            handleEnableInspector();
            sendResponse({ type: "INSPECTOR_ENABLED" });
            return false;

          case "DISABLE_INSPECTOR":
            disableInspectorPicker();
            sendResponse({ type: "INSPECTOR_DISABLED" });
            return false;

          case "APPLY_CONTRAST_FIX":
            handleApplyContrastFix(message.selector, message.hex, sendResponse);
            return false;

          case "REVERT_CONTRAST_FIX":
            handleRevertContrastFix(message.selector, sendResponse);
            return false;

          case "CLEAR_CONTRAST_FIXES":
            handleClearContrastFixes(sendResponse);
            return false;

          default:
            return false;
        }
      },
    );
  },
});

async function handleScan(sendResponse: (r: ResponseMessage) => void) {
  try {
    const axe = await import("axe-core");
    const results = await axe.default.run(document, FAST_PASS_CONFIG);
    const violations = mapAxeResults(results.violations);
    const passes = mapAxePasses(results.passes);

    const textInImageViolation = await detectTextInImages();
    if (textInImageViolation) {
      violations.push(textInImageViolation);
      violations.sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]);
    }

    // Run trap detection for 2.1.2 auto-populate (lightweight, no overlay)
    const tabStops = getTabStops();
    const traps = detectFocusTraps(tabStops);

    // Run custom WCAG checks
    const captionResult = checkCaptions();
    const keyboardResult = checkKeyboard();
    const textSpacingResult = checkTextSpacing();
    const focusOrderResult = checkFocusOrder(tabStops);
    const focusVisibleResult = checkFocusVisible(tabStops);

    const customChecks: CustomCheckCounts = {
      trapCount: traps.length,
      textSpacingFailCount: textSpacingResult.failCount,
      focusOrderInversionCount: focusOrderResult.inversions,
      focusVisibleMissingCount: focusVisibleResult.missingCount,
      captionFailCount: captionResult?.failCount ?? null,
      keyboardFailCount: keyboardResult?.failCount ?? null,
      // Presence detection for N/A auto-population
      hasMedia: document.querySelectorAll("video, audio").length > 0,
      hasFormFields: document.querySelectorAll("input:not([type='hidden']), select, textarea").length > 0,
      // Selectors for on-page highlighting
      trapSelectors: traps.map((t) => t.selector),
      textSpacingSelectors: textSpacingResult.failingElements.map(generateSelector),
      focusOrderSelectors: focusOrderResult.inversionIndices.map((i) => generateSelector(tabStops[i].element)),
      focusVisibleSelectors: focusVisibleResult.failingElements.map(generateSelector),
      keyboardSelectors: keyboardResult?.failingElements.map(generateSelector),
    };

    sendResponse({
      type: "SCAN_COMPLETE",
      violations,
      passes,
      customChecks,
      url: window.location.href,
      timestamp: Date.now(),
    });
  } catch (err) {
    sendResponse({
      type: "SCAN_ERROR",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

function serializeTabStops(tabStops: TabStop[], traps: FocusTrap[]): SerializedTabStop[] {
  return tabStops.map((stop) => {
    const explicitRole = stop.element.getAttribute("role");
    const role = explicitRole || getImplicitRole(stop.element);

    let trapSelector: string | null = null;
    for (const trap of traps) {
      if (trap.container.contains(stop.element)) {
        trapSelector = trap.selector;
        break;
      }
    }

    return {
      index: stop.index,
      selector: generateSelector(stop.element),
      tagName: stop.element.tagName.toLowerCase(),
      accessibleName: getAccessibleName(stop.element),
      role,
      trapSelector,
    };
  });
}

function handleEnableTabStops(sendResponse: (r: ResponseMessage) => void) {
  try {
    const tabStops = getTabStops();
    const traps = detectFocusTraps(tabStops);

    storedTabStops = tabStops;
    storedTraps = traps;

    showTabStopOverlay(tabStops, traps);

    const stops = serializeTabStops(tabStops, traps);

    sendResponse({
      type: "TAB_STOPS_ENABLED",
      count: tabStops.length,
      traps: traps.map((t) => ({
        selector: t.selector,
        tabStopIndices: t.tabStopIndices,
      })),
      stops,
    });
  } catch (err) {
    sendResponse({
      type: "TAB_STOPS_ERROR",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

function handleHighlightTabStop(selector: string, sendResponse: (r: ResponseMessage) => void) {
  const element = document.querySelector(selector);
  if (!element) {
    sendResponse({ type: "TAB_STOP_HIGHLIGHTED" });
    return;
  }

  // Scroll element into view
  element.scrollIntoView({ behavior: "smooth", block: "center" });

  // Highlight the overlay circle
  const stop = storedTabStops.find((s) => {
    try { return document.querySelector(generateSelector(s.element)) === element; } catch { return false; }
  });
  if (stop) {
    highlightTabStopCircle(stop.index);
  }

  // Show pulsing ring around the element
  showHighlightRing(element);

  sendResponse({ type: "TAB_STOP_HIGHLIGHTED" });
}

function handleReorderTabStops(order: string[], sendResponse: (r: ResponseMessage) => void) {
  // Rebuild TabStop array from selectors in new order
  const selectorToStop = new Map<string, TabStop>();
  for (const stop of storedTabStops) {
    selectorToStop.set(generateSelector(stop.element), stop);
  }

  const reordered: TabStop[] = [];
  for (let i = 0; i < order.length; i++) {
    const stop = selectorToStop.get(order[i]);
    if (stop) {
      reordered.push({
        ...stop,
        index: i + 1,
        rect: stop.element.getBoundingClientRect(),
      });
    }
  }

  storedTabStops = reordered;
  showTabStopOverlay(reordered, storedTraps);

  sendResponse({ type: "TAB_STOPS_REORDERED" });
}

function handleContrastAudit(sendResponse: (r: ResponseMessage) => void) {
  try {
    const result = runContrastAudit();
    sendResponse({ type: "CONTRAST_AUDIT_COMPLETE", result });
  } catch (err) {
    sendResponse({
      type: "CONTRAST_AUDIT_ERROR",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

async function handleEnablePixelPicker(
  screenshotDataUrl: string,
  sendResponse: (r: ResponseMessage) => void,
) {
  try {
    await enablePixelPicker(
      screenshotDataUrl,
      (hex) => {
        chrome.runtime.sendMessage({ type: "PIXEL_PICKED", hex }).catch(() => {});
      },
      () => {
        chrome.runtime.sendMessage({ type: "PIXEL_PICKER_DISABLED" }).catch(() => {});
      },
    );
    sendResponse({ type: "PIXEL_PICKER_ENABLED" });
  } catch (err) {
    sendResponse({
      type: "SCAN_ERROR",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

function handleShowTabStopsOverlay(sendResponse: (r: ResponseMessage) => void) {
  if (storedTabStops.length === 0) {
    sendResponse({ type: "TAB_STOPS_ERROR", error: "No tab stop data available. Page may have navigated." });
    return;
  }

  // Refresh bounding rects for each stored element
  const refreshed: TabStop[] = storedTabStops.map((stop, i) => ({
    ...stop,
    index: i + 1,
    rect: stop.element.getBoundingClientRect(),
  }));

  storedTabStops = refreshed;
  showTabStopOverlay(refreshed, storedTraps);
  sendResponse({ type: "TAB_STOPS_OVERLAY_SHOWN" });
}

function handleEnableContrastPicker() {
  enablePicker(
    (result) => {
      // Send unsolicited message to side panel via runtime
      chrome.runtime.sendMessage({ type: "CONTRAST_PICKER_RESULT", result }).catch(() => {});
    },
    () => {
      // Notify side panel when picker is dismissed via Escape key
      chrome.runtime.sendMessage({ type: "CONTRAST_PICKER_DISABLED" }).catch(() => {});
    },
  );
}

function handleEnableInspector() {
  enableInspectorPicker(
    (result) => {
      chrome.runtime.sendMessage({ type: "INSPECTOR_RESULT", result }).catch(() => {});
    },
    () => {
      chrome.runtime.sendMessage({ type: "INSPECTOR_DISABLED" }).catch(() => {});
    },
  );
}

function handleApplyContrastFix(selector: string, hex: string, sendResponse: (r: ResponseMessage) => void) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) {
    sendResponse({ type: "CONTRAST_FIX_APPLIED", selector });
    return;
  }
  // Store original inline color on first override for this selector
  if (!contrastFixOverrides.has(selector)) {
    contrastFixOverrides.set(selector, el.style.color);
  }
  el.style.color = hex;
  sendResponse({ type: "CONTRAST_FIX_APPLIED", selector });
}

function handleRevertContrastFix(selector: string, sendResponse: (r: ResponseMessage) => void) {
  const el = document.querySelector<HTMLElement>(selector);
  if (el && contrastFixOverrides.has(selector)) {
    const original = contrastFixOverrides.get(selector)!;
    if (original) {
      el.style.color = original;
    } else {
      el.style.removeProperty("color");
    }
  }
  contrastFixOverrides.delete(selector);
  sendResponse({ type: "CONTRAST_FIX_REVERTED", selector });
}

function handleClearContrastFixes(sendResponse: (r: ResponseMessage) => void) {
  for (const [selector, original] of contrastFixOverrides) {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) {
      if (original) {
        el.style.color = original;
      } else {
        el.style.removeProperty("color");
      }
    }
  }
  contrastFixOverrides.clear();
  sendResponse({ type: "CONTRAST_FIXES_CLEARED" });
}
