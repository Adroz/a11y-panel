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

function getImplicitRole(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const type = element.getAttribute("type")?.toLowerCase();

  switch (tag) {
    case "a": return element.hasAttribute("href") ? "link" : "";
    case "button": return "button";
    case "input":
      if (!type || type === "text") return "textbox";
      if (type === "checkbox") return "checkbox";
      if (type === "radio") return "radio";
      if (type === "submit" || type === "reset" || type === "button") return "button";
      if (type === "search") return "searchbox";
      if (type === "range") return "slider";
      if (type === "number") return "spinbutton";
      return type;
    case "select": return "combobox";
    case "textarea": return "textbox";
    case "img": return "img";
    case "nav": return "navigation";
    case "main": return "main";
    case "header": return "banner";
    case "footer": return "contentinfo";
    default: return "";
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
