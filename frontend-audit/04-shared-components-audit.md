# 04 — Shared Components Audit

## 1. Overview
Shared components in `src/components/ui/` and `src/components/layout/` are used across multiple routes. A defect in any shared component directly impacts the entire application.

---

## 2. Shared Components Audit Matrix

### 2.1 `DocTypePageHead.jsx`
- **Purpose**: Top sticky navigation and metadata header for DocType pages.
- **Props**: `breadcrumbs`, `title`, `docstatus`, `count`, `searchTerm`, `onSearchChange`, `searchPlaceholder`, `primaryAction`, `onPrimaryAction`, `secondaryActions`, `onMenuAction`.
- **Audit Findings**:
  - Previously assumed `primaryAction` was a string; crashed when consumers passed `{ label, onClick }`.
  - Discarded `onClick` callback if provided inside the action object.
  - Rendered `docstatus="Draft"` by default on listing pages where status was irrelevant.
- **Corrections**:
  - Unified contract to accept both `{ label, onClick, variant, disabled, isLoading }` and string/element props.
  - Normalized `breadcrumbs` to support both string array and object array.
  - Added optional `count` badge next to the title.
  - Added optional inline search input (`searchTerm`, `onSearchChange`).
- **Status**: **VERIFIED**

### 2.2 `Button.jsx`
- **Purpose**: Core interactive button supporting EduTrack / Frappe Desk variants and loading states.
- **Props**: `children`, `variant`, `size`, `type`, `isLoading`, `loadingText`, `disabled`, `leftIcon`, `rightIcon`, `onClick`, `className`.
- **Audit Findings**:
  - Could crash if `{ label, onClick }` object was passed as `children`.
- **Corrections**:
  - Unwraps object children safely: extracts `children.label` and wires `children.onClick`.
  - Added aria-busy and disabled states during loading.
- **Status**: **VERIFIED**

### 2.3 `EmptyState.jsx`
- **Purpose**: Displays empty collection graphic, message, and call-to-action button.
- **Props**: `title`, `description`, `icon`, `action`, `children`, `className`.
- **Audit Findings**:
  - Assumed `action` was always an object `{ label, onClick }`; would produce `undefined` or crash if a React element or string was passed.
- **Corrections**:
  - Added `renderAction()` supporting `isValidElement(action)`, object `{ label, onClick, variant }`, and string labels.
- **Status**: **VERIFIED**

### 2.4 `StatusBadge.jsx`
- **Purpose**: Pill badge displaying entity status.
- **Props**: `status`, `label`, `showDot`, `className`, `size`.
- **Audit Findings**:
  - Unsafe if `status` or `label` was passed as an object.
- **Corrections**:
  - Safely extracts status key and display label whether passed as string or object.
- **Status**: **VERIFIED**

### 2.5 `PaginatedTable.jsx` & `Pagination.jsx`
- **Purpose**: Data table with server/client pagination, column sorting, loading overlay, and empty state.
- **Audit Findings**:
  - Unhandled relation objects rendered as `[object Object]` when no custom `render` was provided.
  - Inactive pagination buttons lacked explicit cursor styling.
- **Corrections**:
  - Enhanced cell fallback to extract `name`, `title`, `label`, or `code` from object cells before converting to string.
  - Modernized pagination bar with `#4361EE` active pills and rounded buttons.
- **Status**: **VERIFIED**

### 2.6 Form Controls (`Input.jsx`, `Select.jsx`, `DatePicker.jsx`, `AsyncLinkField.jsx`)
- **Purpose**: Form inputs with label, helper text, and validation error messages.
- **Audit Findings**:
  - Displayed `{error}` directly; if Yup or an API caught error was passed as an object (`{ message: '...' }`), React would crash.
- **Corrections**:
  - Safely extracts `error.message || String(error)`.
- **Status**: **VERIFIED**

### 2.7 `Alert.jsx` & `Toast.jsx`
- **Purpose**: In-page alert banners and floating toast notifications.
- **Audit Findings**:
  - Alert message could fail if Error instance passed directly.
- **Corrections**:
  - Safely extracts `message.message || message.error || JSON.stringify(message)`.
- **Status**: **VERIFIED**

### 2.8 `ErrorBoundary.jsx` & Application Layout Resilience
- **Purpose**: Catch React rendering exceptions and display recovery UI.
- **Audit Findings**:
  - Only root provider error boundary existed. An error on a single page caused the entire application (including sidebar and topbar) to unmount.
- **Corrections**:
  - Wrapped `<Outlet />` inside `PrivateLayout` with an `ErrorBoundary` keyed by `location.pathname`.
  - Now, if an isolated page throws, the user sees an inline recovery box while sidebar, topbar, and active session remain interactive.
- **Status**: **VERIFIED**
