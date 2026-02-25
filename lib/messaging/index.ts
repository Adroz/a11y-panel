import type { Message, RequestMessage, ResponseMessage } from "@/types/messages";

/** Send a message to the background service worker and get a typed response. */
export function sendToBackground(message: RequestMessage): Promise<ResponseMessage> {
  return chrome.runtime.sendMessage(message);
}

/** Send a message to a specific tab's content script. */
export function sendToTab(tabId: number, message: RequestMessage): Promise<ResponseMessage> {
  return chrome.tabs.sendMessage(tabId, message);
}

/** Listen for messages and reply. */
export function onMessage(
  handler: (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseMessage) => void,
  ) => boolean | void,
) {
  chrome.runtime.onMessage.addListener(handler);
}
