# Frappe / ERPNext Desk Design Tokens & Theme Specification

This reference defines the visual tokens and Tailwind CSS specifications used to match the clean, data-dense look and feel of Frappe / ERPNext Desk.

---

## 1. Color Palette

| Token Name | Hex Code | Utility Class | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| `frappe-bg` | `#f8fafc` (`slate-50`) | `bg-slate-50` / `bg-frappe-bg` | Page background, subtle contrasting canvases |
| `frappe-surface` | `#ffffff` | `bg-white` / `bg-frappe-surface` | Card surfaces, form sections, popovers |
| `frappe-border` | `#e2e8f0` (`slate-200`) | `border-slate-200` | Borders for cards, dividers, grid lines |
| `frappe-hover` | `#f1f5f9` (`slate-100`) | `hover:bg-slate-50` / `hover:bg-slate-100` | Table row hover, button hover |
| `frappe-muted` | `#64748b` (`slate-500`) | `text-slate-500` / `text-slate-400` | Labels, helper text, breadcrumbs |
| `frappe-dark` | `#0f172a` (`slate-900`) | `bg-slate-900`, `text-slate-900` | Primary actions, headings, primary values |

### Status Badges

Document status pills follow strict semantic color mappings:

| Status | Background & Border | Text Color | Classes |
| :--- | :--- | :--- | :--- |
| **Draft** (Brouillon) | Slate 100 / Slate 200 | Slate 700 | `bg-slate-100 text-slate-700 border-slate-200` |
| **Submitted** (Soumis) | Emerald 50 / Emerald 200 | Emerald 700 | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| **Completed** (Terminé) | Emerald 50 / Emerald 200 | Emerald 700 | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| **Pending** (En attente) | Amber 50 / Amber 200 | Amber 700 | `bg-amber-50 text-amber-700 border-amber-200` |
| **Cancelled** (Annulé) | Rose 50 / Rose 200 | Rose 700 | `bg-rose-50 text-rose-700 border-rose-200` |
| **Overdue** (En retard) | Rose 50 / Rose 200 | Rose 700 | `bg-rose-50 text-rose-700 border-rose-200` |

---

## 2. Typography Scale

Frappe Desk uses a compact, functional typography hierarchy designed to maximize screen real estate and legibility:

| Token | Font Size | Line Height | Tailwind Class | Application |
| :--- | :--- | :--- | :--- | :--- |
| **2xs** | 11px | 14px | `text-2xs` | Form field labels, timestamps, table indices, status badges |
| **xs** | 12px | 16px | `text-xs` | Body text, table cells, dropdown items, secondary buttons |
| **sm** | 13px | 18px | `text-sm` | Section titles, page header title, primary inputs |
| **base** | 14px | 20px | `text-base` | Modal headings, high-level summaries |

---

## 3. Density & Spacing Standards

* **Field Heights**: Form inputs and standard buttons must be strictly 32px height (`h-8`).
* **Table Cell Heights**: Table grid rows should be compact, with `py-1.5 px-3` padding.
* **Border Radii**: Default subtle curves (`rounded` = 4px, `rounded-md` = 6px). Avoid large pill or rounded-2xl buttons.
* **Shadows**: Low elevation (`shadow-2xs` or `shadow-xs`). The UI relies primarily on borders (`border-slate-200`) rather than deep drop shadows.
