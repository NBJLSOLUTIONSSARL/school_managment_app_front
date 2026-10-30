---
name: school-frontend-dev
description: Development workflow, build commands, and coding guidelines for the school management app frontend (React 19, Vite, Oxlint, Tailwind CSS). Use this skill when starting the dev server, running linter checks, building the application, troubleshooting frontend build errors, or scaffolding new school management features.
---

# School Management App Frontend Workflow

This skill outlines the core development commands, workflows, conventions, and procedures for developers working on the School Management Application frontend.

---

## 1. Quick Start Commands

| Command | Action | Notes |
| :--- | :--- | :--- |
| `npm run dev` | Starts Vite local development server | Fast HMR enabled |
| `npm run lint` | Runs Oxlint across the project | Fast Rust-based linter |
| `npm run build` | Compiles production assets into `dist/` | Runs Vite build |
| `npm run preview` | Previews the production build locally | Tests production bundle |

---

## 2. Tech Stack & Architecture

- **Runtime / Framework**: React 19 (`react`, `react-dom`)
- **Bundler**: Vite 8 (`@vitejs/plugin-react`)
- **Linter**: Oxlint (configured via `.oxlintrc.json`)
- **Styling**: Tailwind CSS / Frappe Desk Design Tokens
- **UI Design System**: Frappe / ERPNext Desk standard (see `erpnext-ui-design-system` skill)

---

## 3. Directory Conventions

```text
school_managment_app_front/
├── .agents/                        # Antigravity (agy) shared skills & configs
│   ├── skills.json                 # Customization registry
│   └── skills/
│       ├── erpnext-ui-design-system/
│       └── school-frontend-dev/
├── src/
│   ├── assets/                     # Static images, icons, logos
│   ├── components/                 # Reusable UI components (DocTypePageHead, LinkField, etc.)
│   ├── views/ or pages/            # Domain views (Students, Teachers, Classes, Fees)
│   ├── App.jsx                     # Application root / layout
│   ├── main.jsx                    # Application entry point
│   └── index.css                   # Global styles & Tailwind directives
├── package.json
└── vite.config.js
```

---

## 4. Development Workflow & Best Practices

1. **Test-Driven & Incremental**:
   - Verify every UI addition visually and check browser console.
   - Run `npm run lint` before committing any code.

2. **Component Reusability**:
   - Prefer composing standard DocType components from the `erpnext-ui-design-system` skill rather than writing one-off custom layouts.
   - Keep forms modular by separating the master view, child tables, and sidebar metadata.

3. **Immutability & State Management**:
   - Always return fresh arrays/objects when modifying child table rows or form state (e.g. `items.map(...)`, `[...items]`).
   - Never directly mutate React state objects.

---

## 5. Verification Checklist

Before pushing or completing a feature:
- [ ] `npm run lint` completes with zero errors.
- [ ] `npm run build` completes successfully.
- [ ] All interactive components (`LinkField`, `ChildTableGrid`) maintain focus and handle edge cases (empty rows, no search matches).
