import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: {
        "prose-docs": "680px",
      },
      fontSize: {
        body: ["16px", { lineHeight: "1.75" }],
        "docs-h1": ["36px", { lineHeight: "1.2" }],
        "docs-h2": ["28px", { lineHeight: "1.3" }],
        "docs-h3": ["22px", { lineHeight: "1.4" }],
        "code-sm": ["14px", { lineHeight: "1.6" }],
      },
      colors: {
        "nh-body": "#1a1a1a",
        "nh-callout-bg": "#f8f9fa",
        "nh-callout-border": "#e2e8f0",
        "nh-blockquote-border": "#e5e7eb",
        "nh-blockquote-text": "#6b7280",
        "nh-code-bg": "#f5f5f5",
      },
      borderRadius: {
        "nh-code": "8px",
      },
    },
  },
  darkMode: "class",
};

export default config;

