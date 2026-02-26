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
        case "ENABLE_TAB_STOPS":
        case "DISABLE_TAB_STOPS":
        case "HIGHLIGHT_TAB_STOP":
        case "CLEAR_TAB_STOP_HIGHLIGHT":
        case "REORDER_TAB_STOPS":
        case "RUN_CONTRAST_AUDIT":
        case "ENABLE_CONTRAST_PICKER":
        case "DISABLE_CONTRAST_PICKER":
        case "HIGHLIGHT_CONTRAST_ELEMENT":
        case "CLEAR_CONTRAST_HIGHLIGHT":
          forwardToActiveTab(message, sendResponse);
          return true; // async
        default:
          return false;
      }
    },
  );

  // Keyboard shortcut handler
  chrome.commands.onCommand.addListener((command) => {
    if (command === "run-scan") {
      // Trigger a scan by sending a message that the side panel can pick up
      chrome.runtime.sendMessage({ type: "RUN_AXE_SCAN" }).catch(() => {});
    }
  });
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

    // Persist scan results to history and update badge
    if (response?.type === "SCAN_COMPLETE") {
      saveToHistory({
        violations: response.violations,
        url: response.url,
        timestamp: response.timestamp,
      });
      updateBadge(response.violations.length, tab.id);
    }

    sendResponse(response);
  } catch (err) {
    sendResponse({
      type: "SCAN_ERROR",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

function updateBadge(violationCount: number, tabId: number) {
  if (violationCount > 0) {
    chrome.action.setBadgeText({ text: String(violationCount), tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#d32f2f", tabId });
  } else {
    chrome.action.setBadgeText({ text: "✓", tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#2e7d32", tabId });
  }
}
