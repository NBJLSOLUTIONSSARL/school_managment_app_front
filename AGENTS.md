# School Management App (Frontend) — Agent Guidelines

## 1. Project Overview
This repository contains the frontend application for the School Management System, built with **React 19**, **Vite**, **Tailwind CSS**, and **Oxlint**.

## 2. Design System & UI Architecture
All user interface development in this project follows the **Frappe / ERPNext Desk UI Design System**:
* **Data-Dense & Clean**: Compact information layout, minimal decorative padding.
* **Compact Typography**: Hierarchy ranging from 11px (`text-2xs`) for labels and badges up to 14px (`text-base`).
* **DocType Uniformity**: All entities (Students, Teachers, Classes, Invoices, Grades) must follow the standard DocType layout:
  - Top sticky header with breadcrumbs, document status pill (`Draft`, `Submitted`, etc.), and primary/secondary actions (`DocTypePageHead`).
  - Left metadata sidebar (`aside`, 1 column on `md:grid-cols-4`).
  - Main sectioned form (`main`, 3 columns on `md:grid-cols-4`).
  - Foreign-key selection via autocomplete (`LinkField`).
  - Line-item collections using editable grids (`ChildTableGrid`).
  - Immutable activity history and comments (`DocTimeline`).
* **Keyboard-First**: Implement `Ctrl+S` / `Cmd+S` shortcuts for primary save actions.

## 3. Workspace Skills
The project includes Antigravity (`agy`) workspace skills located in `.agents/skills/`:
- **`erpnext-ui-design-system`**: Reference components, tokens, and layouts for Frappe/ERPNext Desk UI.
- **`school-frontend-dev`**: Development runbooks, build verification, and linting procedures.

## 4. Coding Standards & Quality Gates
- **Immutability**: Always produce new object/array copies when updating React state.
- **Linting**: All code must pass Oxlint (`npm run lint`) with zero warnings or errors.
- **Build**: Ensure `npm run build` succeeds before creating commits or pull requests.
