import { useEffect, useState } from "react";
import { normalizePageUrl } from "@/lib/checklist/url";

/** Tracks the current active tab's normalized URL (origin + pathname). */
export function useActiveUrl(): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    function updateFromTab(tab: chrome.tabs.Tab) {
      if (tab.url) {
        setUrl(normalizePageUrl(tab.url));
      }
    }

    // Initial query
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab) updateFromTab(tab);
    });

    // Tab switched
    function onActivated(info: chrome.tabs.TabActiveInfo) {
      chrome.tabs.get(info.tabId).then(updateFromTab).catch(() => {});
    }

    // In-page navigation
    function onUpdated(
      _tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tab: chrome.tabs.Tab,
    ) {
      if (changeInfo.url && tab.active) {
        setUrl(normalizePageUrl(changeInfo.url));
      }
    }

    chrome.tabs.onActivated.addListener(onActivated);
    chrome.tabs.onUpdated.addListener(onUpdated);

    return () => {
      chrome.tabs.onActivated.removeListener(onActivated);
      chrome.tabs.onUpdated.removeListener(onUpdated);
    };
  }, []);

  return url;
}
