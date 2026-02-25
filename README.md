# A11y Panel

Chrome Side Panel extension for accessibility testing — powered by [axe-core](https://github.com/dequelabs/axe-core).

Inspired by [Microsoft's Accessibility Insights for Web](https://github.com/microsoft/accessibility-insights-web), reimagined as a persistent sidebar tool that stays visible alongside the page you're testing.

## Features

- **Automated scanning** — runs axe-core against the current page (WCAG 2.0/2.1/2.2 AA + best practices)
- **Violations grouped by impact** — critical, serious, moderate, minor
- **Element highlighting** — click any violation node to highlight it on the page and scroll into view
- **Side Panel UI** — stays open as you navigate, no DevTools required

## Tech stack

| Tool | Purpose |
|------|---------|
| [WXT](https://wxt.dev) | Chrome extension framework (Vite-powered, file-based entrypoints) |
| React 19 + TypeScript | UI framework |
| Tailwind CSS 4 | Styling |
| [axe-core](https://github.com/dequelabs/axe-core) | Accessibility scanning engine |
| [Zustand](https://github.com/pmndrs/zustand) | State management |
| pnpm | Package manager |

## Getting started

```sh
pnpm install
pnpm dev        # Opens Chrome with extension auto-loaded
```

### Usage

1. Click the extension icon in the toolbar — the side panel opens
2. Navigate to any web page
3. Click **Scan Page**
4. Violations appear grouped by impact severity
5. Expand a violation and click **Highlight** to see the element on the page

### Build for production

```sh
pnpm build      # Output in .output/chrome-mv3/
pnpm zip        # Creates distributable .zip
```

## Architecture

```
Side Panel (React)  ←→  Background Service Worker  ←→  Content Script (axe-core + highlighter)
```

- **Side Panel** — React app with Zustand store. Sends scan/highlight requests.
- **Background** — Routes messages between side panel and content script. Persists results to `chrome.storage.local`.
- **Content Script** — Dynamically imports axe-core on scan, runs `axe.run()`, manages DOM highlight overlays.

## Permissions

| Permission | Why |
|-----------|-----|
| `sidePanel` | Side Panel API |
| `activeTab` | Access current tab on user click |
| `scripting` | Inject content script on demand |
| `storage` | Persist scan results |

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the phased implementation plan.

## License

[MIT](./LICENSE)

### Third-party licenses

- **axe-core** — [MPL-2.0](https://mozilla.org/MPL/2.0/) (used as unmodified dependency)
- **accessibility-insights-web** — [MIT](https://github.com/microsoft/accessibility-insights-web/blob/main/LICENSE) (architectural patterns referenced)

See [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md) for full notices.
