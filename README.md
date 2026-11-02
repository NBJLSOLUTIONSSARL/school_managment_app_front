# School Management App — Frontend

Modern, data-dense frontend for the School Management System, built with **React 19**, **Vite**, **Tailwind CSS**, and **Oxlint**.

The user interface follows the **Frappe / ERPNext Desk** design system, optimized for productivity, keyboard navigation, and high information density.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm / bun

### Installation
```bash
npm install
```

### Development
Start the local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```

### Quality & Linting
Run Oxlint across the codebase:
```bash
npm run lint
```

### Production Build
Compile and bundle production assets:
```bash
npm run build
npm run preview
```

### Tests
Run the Vitest suite (unit + accessibility checks):
```bash
npm test
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` (or `.env.local`) and adjust the values:

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `/api` | Backend API base URL. Use the same-origin `/api` proxy in production when available. |
| `VITE_BASE_PATH` | `/` | Vite `base` path. Set to `/school/` when the app is hosted in a sub-directory. |
| `VITE_DEV_PORT` | `3000` | Local Vite dev server port. |
| `VITE_BUILD_SOURCEMAP` | `false` | Emit production sourcemaps (`true`/`false`). |

Only variables prefixed with `VITE_` are exposed to the browser. Never put secrets in them.

---

## 🌍 Internationalization (FR / AR + RTL)

The app ships with a dependency-free i18n layer:

- **Languages**: French (default) and Arabic.
- **Persistence**: the selected language is stored in `localStorage` (`school_app_language`).
- **Direction**: switching to Arabic sets `dir="rtl"` and `lang="ar"` on `<html>`; the shell uses logical Tailwind utilities (`ps-*`, `pe-*`, `start-*`, `end-*`, `border-e`, `text-start`).
- **Formatting**: `formatDate` / `formatCurrency` follow the active locale.
- **Usage**: `const { t, language, setLanguage, isRTL } = useI18n()`.
- **Switcher**: `LanguageSwitcher` is available in the public and private headers.

Translation keys live in `src/i18n/translations.js`. Missing keys fall back to French.

---

## ♿ Accessibility & Robustness

- Skip-to-content link in both layouts, keyboard-visible focus rings, and `aria-current` navigation.
- Labelled form controls with `aria-invalid` / `aria-describedby` error wiring.
- Modals trap focus, restore focus on close, support `Escape`, and expose `aria-labelledby`.
- Sortable table headers use `aria-sort`; clickable rows support `Enter` / `Space`.
- A top-level `ErrorBoundary` replaces blank screens with a recoverable fallback.
- List fetches are cancelled on filter changes; create/grade/submit actions guard against duplicate submissions.

---

## 🚀 Deployment

The application is a client-side SPA. The host must rewrite unknown paths to `index.html`:

- **Netlify**: `public/_redirects` already contains `/* /index.html 200`.
- **Vercel**: `vercel.json` rewrites all paths to `/index.html`.
- **Nginx**: `try_files $uri $uri/ /index.html;`
- **Apache**: enable `mod_rewrite` and fall back to `index.html`.

Build once per environment:

```bash
# .env.production
VITE_API_BASE_URL=https://api.example.com/api
VITE_BASE_PATH=/
npm run build
```

If the backend is served by a reverse proxy, keep `VITE_API_BASE_URL=/api` to avoid CORS.

---

## 🤖 Antigravity (`agy`) Skills for Developers

This repository is equipped with project-level **Antigravity Customizations** in `.agents/`. When developers on the team work on this project using Google Antigravity (CLI or IDE), the AI assistant automatically detects and loads these skills.

### Available Skills

| Skill Name | Path | Purpose |
| :--- | :--- | :--- |
| **`erpnext-ui-design-system`** | [`.agents/skills/erpnext-ui-design-system/`](.agents/skills/erpnext-ui-design-system/SKILL.md) | Comprehensive Frappe / ERPNext Desk UI design system, interaction patterns, tokens, and reusable components (`DocTypePageHead`, `LinkField`, `ChildTableGrid`, `DocTimeline`). |
| **`school-frontend-dev`** | [`.agents/skills/school-frontend-dev/`](.agents/skills/school-frontend-dev/SKILL.md) | Development runbook, build commands, Oxlint checks, and feature scaffolding workflow. |

### How Developers Use the Skills
* **In Antigravity CLI (`agy`)**: Skills in `.agents/skills/` are automatically discovered for all developers on the repository. You can ask the agent:
  > *"Build a new Student Registration view using the erpnext design system skill."*
  > *"Add a child table for enrolled courses using the ChildTableGrid pattern."*
* **Automatic Context**: The repository root contains [`AGENTS.md`](./AGENTS.md), ensuring any agent session automatically respects the design conventions and quality gates.

---

## 🎨 UI Design System & Component Library

The UI adheres to the Frappe / ERPNext Desk specification:

- **Compact Typography**: 11px (`text-2xs`) to 14px (`text-base`).
- **Data-Dense Layouts**: Information density over excessive white space.
- **DocType Consistency**: Every domain model (Students, Teachers, Classes, Invoices) follows the standard 4-part layout:
  1. Sticky Page Head with breadcrumbs and status pill.
  2. Metadata aside panel.
  3. Main sectioned form with LinkFields & Child Table Grids.
  4. Activity & audit timeline.

Reusable reference components can be found in [`.agents/skills/erpnext-ui-design-system/examples/`](.agents/skills/erpnext-ui-design-system/examples/):
- `DocTypePageHead.jsx`: Top navigation and actions
- `LinkField.jsx`: Foreign key search with quick-create
- `ChildTableGrid.jsx`: Dense inline editable line items
- `DocTimeline.jsx`: Immutable activity trail
- `SalesInvoiceView.jsx`: Full assembly template
- `tailwind.config.js`: Tailwind theme tokens

---

## 📁 Project Structure

```text
school_managment_app_front/
├── .agents/                                # Antigravity (agy) team skills
│   ├── skills.json                         # Skills registry
│   └── skills/
│       ├── erpnext-ui-design-system/       # ERPNext Desk UI design system
│       │   ├── SKILL.md
│       │   ├── references/
│       │   └── examples/
│       └── school-frontend-dev/            # Frontend workflow skill
│           └── SKILL.md
├── src/                                    # React application source
│   ├── assets/                             # Static assets
│   ├── App.jsx                             # App entry component
│   ├── main.jsx                            # React root mount
│   └── index.css                           # Styles & Tailwind imports
├── AGENTS.md                               # Workspace agent instructions
├── README.md                               # Project documentation
├── package.json
└── vite.config.js
```
