import { FAST_PASS_CONFIG, mapAxeResults } from "@/lib/scanner";
import { highlightElement, highlightAll, clearHighlights } from "@/lib/highlighter";
import {
  getTabStops,
  detectFocusTraps,
  showTabStopOverlay,
  hideTabStopOverlay,
} from "@/lib/tabstops";
import type { Message, ResponseMessage } from "@/types/messages";

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
            sendResponse({ type: "TAB_STOPS_DISABLED" });
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

function handleEnableTabStops(sendResponse: (r: ResponseMessage) => void) {
  try {
    const tabStops = getTabStops();
    const traps = detectFocusTraps(tabStops);

    showTabStopOverlay(tabStops, traps);

    sendResponse({
      type: "TAB_STOPS_ENABLED",
      count: tabStops.length,
      traps: traps.map((t) => ({
        selector: t.selector,
        tabStopIndices: t.tabStopIndices,
      })),
    });
  } catch (err) {
    sendResponse({
      type: "TAB_STOPS_ERROR",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
