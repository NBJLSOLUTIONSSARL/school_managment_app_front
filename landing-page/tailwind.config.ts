import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* EduTrack Design Tokens — mapped to CSS custom properties */
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        paper: "var(--paper)",
        surface: "var(--surface)",
        "border-subtle": "var(--border-subtle)",
        "border-strong": "var(--border-strong)",

        "blue-core": "var(--blue-core)",
        "blue-hover": "var(--blue-hover)",
        "blue-wash": "var(--blue-wash)",
        "blue-muted": "var(--blue-muted)",

        emerald: "var(--emerald)",
        "emerald-wash": "var(--emerald-wash)",
        amber: "var(--amber)",
        "amber-wash": "var(--amber-wash)",
        rose: "var(--rose)",
        "rose-wash": "var(--rose-wash)",

        frappe: {
          bg: "var(--frappe-bg)",
          surface: "var(--frappe-surface)",
          border: "var(--frappe-border)",
          hover: "var(--frappe-hover)",
          muted: "var(--frappe-muted)",
          dark: "var(--frappe-dark)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        ui: ["var(--font-ui)"],
        mono: ["var(--font-mono)"],
        sans: ["var(--font-ui)"],
      },
      fontSize: {
        "display-xl": ["clamp(1.5rem, 2vw, 1.875rem)", { lineHeight: "1.2", fontWeight: "700" }],
        "display-lg": ["clamp(1.25rem, 1.5vw, 1.5rem)", { lineHeight: "1.25", fontWeight: "700" }],
        "display-md": ["clamp(1.125rem, 1.2vw, 1.25rem)", { lineHeight: "1.3", fontWeight: "600" }],
        section: ["clamp(0.875rem, 1.2vw, 1rem)", { lineHeight: "1.3", fontWeight: "600" }],
        "card-title": ["0.875rem", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["0.6875rem", { lineHeight: "1.4", fontWeight: "500" }],
        caption: ["0.625rem", { lineHeight: "1.4", fontWeight: "400" }],
        "mono-sm": ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }],
        "mono-base": ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }],
        "2xs": ["11px", "14px"],
        xs: ["12px", "16px"],
        sm: ["13px", "18px"],
        base: ["14px", "20px"],
      },
      borderRadius: {
        tight: "var(--radius-tight)",
        card: "var(--radius-card)",
        panel: "var(--radius-panel)",
        DEFAULT: "4px",
        md: "6px",
      },
      boxShadow: {
        hair: "var(--shadow-hair)",
        soft: "var(--shadow-soft)",
        elevated: "var(--shadow-elevated)",
        focus: "var(--shadow-focus)",
        "2xs": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        7: "var(--space-7)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "200ms",
        slow: "300ms",
      },
      transitionTimingFunction: {
        default: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      maxWidth: {
        "8xl": "88rem",
      },
    },
  },
  plugins: [],
};

export default config;