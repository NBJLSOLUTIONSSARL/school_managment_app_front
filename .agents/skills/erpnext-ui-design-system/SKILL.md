---
name: erpnext-ui-design-system
description: Comprehensive Frappe and ERPNext Desk UI design system specification, interactive patterns, and reusable React/Tailwind CSS components. Use this skill whenever designing, building, or reviewing UI components, DocType forms, data-dense views, master-detail layouts, LinkFields, child table grids, or activity timelines for the school management application.
---

# Frappe & ERPNext UI Design System (Desk Specification)

This skill provides complete design principles, interaction patterns, Tailwind CSS specifications, and reusable React components inspired by the Frappe / ERPNext Desk design system, tailored for high-density business applications like the School Management System.

---

## 1. Core Principles

1. **Data-Dense & Clean**: Maximize information density without visual clutter. Use borders rather than heavy drop shadows.
2. **Compact Typography Hierarchy**: Functional text sizing from 11px to 14px (`text-2xs` for labels, `text-xs` for standard values, `text-sm` for titles).
3. **Keyboard-First**: Prioritize keyboard navigation (`Ctrl+S` / `Cmd+S` for save, `Tab` cycling through form and grid cells, `Escape` to close popovers).
4. **Standard DocType Architecture**: Consistent layout across all domain entities (Student, Teacher, Course Enrollment, Fee Invoice, Attendance).

For comprehensive design token specifications, refer to [references/design-tokens.md](./references/design-tokens.md).  
For structural DocType conventions, refer to [references/doctype-specification.md](./references/doctype-specification.md).

---

## 2. Reusable Component Catalog

All components are located in the [`examples/`](./examples/) directory and can be imported directly into the application:

### 2.1. Standard Page Header (`DocTypePageHead`)
- **Path**: [`examples/DocTypePageHead.jsx`](./examples/DocTypePageHead.jsx)
- **Role**: Sticky top navigation bar featuring breadcrumbs, document ID/title, document status badge (`Draft`, `Submitted`, `Completed`, `Cancelled`, `Pending`, `Overdue`), secondary actions, and primary action button.
- **Props**:
  - `breadcrumbs`: `string[]` (e.g. `['School', 'Students']`)
  - `title`: `string` (e.g. `'STU-2026-0012'`)
  - `docstatus`: `'Draft' | 'Submitted' | 'Completed' | 'Pending' | 'Cancelled' | 'Overdue'`
  - `primaryAction`: `string` (e.g. `'Enregistrer'`)
  - `onPrimaryAction`: `() => void`
  - `secondaryActions`: `Array<{ label: string, onClick: () => void }>`
  - `onMenuAction`: `() => void` (additional menu options)

### 2.2. Autocomplete Link Field (`LinkField`)
- **Path**: [`examples/LinkField.jsx`](./examples/LinkField.jsx)
- **Role**: Foreign key selection component providing instant search filtering and a "+ Create new" quick-creation action.
- **Props**:
  - `label`: `string`
  - `value`: `{ label: string, value: string | number }`
  - `onChange`: `(item) => void`
  - `onAddNew`: `(query: string) => void`
  - `options`: `Array<{ label: string, value: any, subtitle?: string }>`
  - `placeholder`: `string`
  - `required`: `boolean`
  - `doctype`: `string`

### 2.3. Editable Child Table Grid (`ChildTableGrid`)
- **Path**: [`examples/ChildTableGrid.jsx`](./examples/ChildTableGrid.jsx)
- **Role**: Data-dense multi-row editable table for items such as fee components, enrolled courses, or exam marks.
- **Props**:
  - `columns`: `Array<{ key: string, label: string, editable?: boolean, width?: string, type?: string }>`
  - `rows`: `Array<Record<string, any>>`
  - `onRowChange`: `(rowIndex: number, columnKey: string, newValue: any) => void`
  - `onAddRow`: `() => void`
  - `onRemoveRow`: `(rowIndex: number) => void`

### 2.4. Audit Trail & Activity Timeline (`DocTimeline`)
- **Path**: [`examples/DocTimeline.jsx`](./examples/DocTimeline.jsx)
- **Role**: Immutable historical audit log and commentary stream.
- **Props**:
  - `activities`: `Array<{ user: string, time: string, content: string }>`

---

## 3. Reference Implementation: DocType View

A complete, fully working implementation combining all these components into a standard 4-column responsive DocType layout is provided in [`examples/SalesInvoiceView.jsx`](./examples/SalesInvoiceView.jsx).

### Standard 4-Column Layout Pattern:
```jsx
<div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
  <DocTypePageHead {...headerProps} />

  <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
    {/* Left Sidebar (1 col): Metadata, assignments, created date */}
    <aside className="md:col-span-1 space-y-4">
      <div className="rounded border border-slate-200 bg-white p-4 shadow-2xs space-y-3 text-xs">
        {/* Metadata items */}
      </div>
    </aside>

    {/* Main Form (3 cols): Primary fields, child tables, totals, timeline */}
    <main className="md:col-span-3 space-y-6">
      <section className="rounded border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
        {/* Form fields & LinkFields */}
        {/* ChildTableGrid */}
        {/* Totals & Summary */}
        {/* DocTimeline */}
      </section>
    </main>
  </div>
</div>
```

---

## 4. Step-by-Step Procedure: Creating a New DocType View

When implementing a new entity (e.g., Student, Teacher, Course Enrollment) for this project:

1. **Define Schema & Columns**:
   - Determine master fields (strings, dates, LinkFields to other DocTypes).
   - Determine child tables (e.g., guardian list for a student, course list for an enrollment).
2. **Setup State**:
   - Maintain `docstatus` (`'Draft'` by default).
   - Keep master form fields in a single state object or individual state variables.
   - Keep child table rows in an array of row objects.
3. **Assemble the Layout**:
   - Mount `<DocTypePageHead>` at the top.
   - Place metadata in `<aside className="md:col-span-1">`.
   - Place the master form inputs and `<LinkField>` components inside `<main className="md:col-span-3">`.
   - Mount `<ChildTableGrid>` for any 1-to-N related collections.
   - Mount `<DocTimeline>` at the bottom of the main section.
4. **Wire Keyboard Shortcuts**:
   - Listen for `Ctrl+S` / `Cmd+S` to trigger the primary save action and prevent default browser save behavior.
5. **Verify**:
   - Run `npm run lint` (Oxlint) to ensure no syntax or lint errors.
   - Verify layout on both mobile (`grid-cols-1`) and desktop (`md:grid-cols-4`).

---

## 5. Tailwind Configuration

Ensure your `tailwind.config.js` includes the Frappe theme extensions specified in [`examples/tailwind.config.js`](./examples/tailwind.config.js):
* Extended colors (`frappe.bg`, `frappe.surface`, `frappe.border`, `frappe.hover`, `frappe.muted`, `frappe.dark`).
* Font size scale (`'2xs': ['11px', '14px']`, `'xs': ['12px', '16px']`, `'sm': ['13px', '18px']`).
* Border radius (`DEFAULT: '4px'`, `md: '6px'`).
