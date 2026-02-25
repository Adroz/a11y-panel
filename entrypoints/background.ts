import type { Message, ResponseMessage } from "@/types/messages";
import { saveToHistory } from "@/lib/history";

export default defineBackground(() => {
  // Open side panel when extension icon is clicked
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  // Route messages between side panel and content script
  chrome.runtime.onMessage.addListener(
    (message: Message, _sender, sendResponse: (r: ResponseMessage) => void) => {
      switch (message.type) {
        case "RUN_AXE_SCAN":
        case "HIGHLIGHT_ELEMENT":
        case "HIGHLIGHT_ALL":
        case "CLEAR_HIGHLIGHTS":
          forwardToActiveTab(message, sendResponse);
          return true; // async
        default:
          return false;
      }
    },
  );
});

async function forwardToActiveTab(message: Message, sendResponse: (r: ResponseMessage) => void) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      sendResponse({ type: "SCAN_ERROR", error: "No active tab found" });
      return;
    }

    // Check if content script is loaded on this page
    try {
      const [{ result: isReady }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => (window as any).__a11yPanelReady === true,
      });

      if (!isReady) {
        sendResponse({
          type: "SCAN_ERROR",
          error: "Content script not loaded. Try refreshing the page.",
        });
        return;
      }
    } catch {
      sendResponse({
        type: "SCAN_ERROR",
        error: "Cannot scan this page. Try a regular web page.",
      });
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, message);

    // Persist scan results to history
    if (response?.type === "SCAN_COMPLETE") {
      saveToHistory({
        violations: response.violations,
        url: response.url,
        timestamp: response.timestamp,
      });
    }

    sendResponse(response);
  } catch (err) {
    sendResponse({
      type: "SCAN_ERROR",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
