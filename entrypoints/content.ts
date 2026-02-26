import { FAST_PASS_CONFIG, mapAxeResults } from "@/lib/scanner";
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

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_idle",
  main(_ctx) {
    (window as any).__a11yPanelReady = true;

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

    sendResponse({
      type: "SCAN_COMPLETE",
      violations,
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
