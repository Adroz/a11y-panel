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
        case "HIDE_TAB_STOPS_OVERLAY":
        case "SHOW_TAB_STOPS_OVERLAY":
        case "RUN_CONTRAST_AUDIT":
        case "ENABLE_CONTRAST_PICKER":
        case "DISABLE_CONTRAST_PICKER":
        case "HIGHLIGHT_CONTRAST_ELEMENT":
        case "CLEAR_CONTRAST_HIGHLIGHT":
        case "ENABLE_PIXEL_PICKER":
        case "DISABLE_PIXEL_PICKER":
        case "ENABLE_INSPECTOR":
        case "DISABLE_INSPECTOR":
        case "APPLY_CONTRAST_FIX":
        case "REVERT_CONTRAST_FIX":
        case "CLEAR_CONTRAST_FIXES":
          forwardToActiveTab(message, sendResponse);
          return true; // async
        case "CAPTURE_TAB_SCREENSHOT":
          handleCaptureScreenshot(sendResponse);
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
    const msg = err instanceof Error ? err.message : String(err);
    // Content script not available — restricted page (chrome://) or not yet loaded
    if (msg.includes("Receiving end does not exist") || msg.includes("Could not establish connection")) {
      sendResponse({
        type: "SCAN_ERROR",
        error: "Cannot scan this page. Try a regular web page, or refresh the page.",
      });
    } else {
      sendResponse({ type: "SCAN_ERROR", error: msg });
    }
  }
}

async function handleCaptureScreenshot(sendResponse: (r: ResponseMessage) => void) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.windowId) {
      sendResponse({ type: "TAB_SCREENSHOT_ERROR", error: "No active tab found" });
      return;
    }
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
    sendResponse({ type: "TAB_SCREENSHOT_CAPTURED", dataUrl });
  } catch (err) {
    sendResponse({
      type: "TAB_SCREENSHOT_ERROR",
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
