import type { Message, ResponseMessage } from "@/types/messages";

export default defineBackground(() => {
  // Open side panel when extension icon is clicked
  chrome.action.onClicked.addListener((tab) => {
    if (tab.windowId != null) {
      chrome.sidePanel.open({ windowId: tab.windowId });
    }
  });

  // Enable side panel to open on action click
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  // Route messages between side panel and content script
  chrome.runtime.onMessage.addListener(
    (message: Message, sender, sendResponse: (r: ResponseMessage) => void) => {
      switch (message.type) {
        // Requests from the side panel → forward to active tab's content script
        case "RUN_AXE_SCAN":
        case "HIGHLIGHT_ELEMENT":
        case "CLEAR_HIGHLIGHTS":
          forwardToActiveTab(message, sendResponse);
          return true; // async

        // Responses from content script → store results if scan complete
        case "SCAN_COMPLETE":
          chrome.storage.local.set({
            lastScan: {
              violations: message.violations,
              url: message.url,
              timestamp: message.timestamp,
            },
          });
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

    // Ensure content script is injected
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Check if content script already present
          return (window as any).__a11yPanelReady === true;
        },
      });
    } catch {
      // If we can't execute on this page (e.g. chrome:// pages)
      sendResponse({
        type: "SCAN_ERROR",
        error: "Cannot scan this page. Try a regular web page.",
      });
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, message);
    sendResponse(response);
  } catch (err) {
    sendResponse({
      type: "SCAN_ERROR",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
