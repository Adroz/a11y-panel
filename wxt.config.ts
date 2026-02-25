import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "A11y Panel",
    description: "Accessibility testing in your Chrome side panel — powered by axe-core",
    permissions: ["sidePanel", "activeTab", "scripting", "storage"],
    side_panel: {
      default_path: "sidepanel.html",
    },
    action: {
      default_title: "Open A11y Panel",
    },
    commands: {
      "run-scan": {
        suggested_key: {
          default: "Alt+Shift+A",
        },
        description: "Run accessibility scan on current page",
      },
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
