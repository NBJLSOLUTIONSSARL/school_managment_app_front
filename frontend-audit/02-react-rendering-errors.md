# 02 — React Rendering Errors & Root Cause Analysis

## 1. Reported Defect: `Objects are not valid as a React child (found: object with keys {label, onClick})`

### 1.1 Root Cause Diagnosis
The error was triggered upon navigating from the sidebar to certain list views (such as `/students`, `/teachers`, `/staff`, `/guardians`, `/departments`, `/announcements`, `/events`, `/messages`, `/leave-requests`).

When mounting these views, each component rendered the shared `<DocTypePageHead>` component with an action object passed to `primaryAction`:
```jsx
// Example from StudentList.jsx:
<DocTypePageHead
  title="Gestion des Élèves"
  count={totalItems}
  primaryAction={
    canCreate
      ? {
          label: 'Nouvel Élève',
          onClick: () => {
            setEditingStudent(null)
            setIsFormOpen(true)
          },
        }
      : undefined
  }
/>
```

However, inside `DocTypePageHead.jsx`, the implementation assumed `primaryAction` was always a raw string or ReactNode, and rendered it directly as children of `<Button>`:
```jsx
// Defective code in DocTypePageHead.jsx:
{primaryAction && (
  <Button variant="primary" size="sm" onClick={onPrimaryAction}>
    {primaryAction}
  </Button>
)}
```
When `primaryAction` was `{ label: 'Nouvel Élève', onClick: ... }`, React attempted to render the plain JavaScript object directly, throwing the fatal error:
`Objects are not valid as a React child (found: object with keys {label, onClick})`.

Furthermore, the `onClick` callback attached inside the object was completely discarded, meaning even if `primaryAction.label` had been rendered superficially, the primary action button would never have functioned!

### 1.2 Systemic Solution
Rather than patching only one page, a comprehensive architectural solution was implemented:

1. **`DocTypePageHead.jsx` Contract Unification**:
   - Supports both object format: `primaryAction={{ label, onClick, variant, disabled, isLoading }}`
   - And legacy format: `primaryAction="Label" onPrimaryAction={fn}`
   - Normalizes `secondaryActions` to accept arrays of objects or strings safely.
   - Normalizes `breadcrumbs` to safely render both string crumbs and `{ label, to }` crumb objects.
   - Supports optional `count` badge and `searchTerm` / `onSearchChange` filters.

2. **`Button.jsx` Defensive Handling**:
   - Enhanced `Button` to safely unwrap object children having `{ label, onClick }` if passed accidentally as `{children}`.
   - Extracts `children.label` for text and chains `children.onClick` into the button handler.

3. **`EmptyState.jsx` Action Handling**:
   - Safely differentiates JSX elements (`isValidElement`), action configuration objects `{ label, onClick, variant }`, and string labels.

4. **`StatusBadge.jsx` Status & Label Handling**:
   - Safely parses `status` or `label` whether passed as a string or an object `{ status, label, value }`.

5. **Form Error Renderings (`Input.jsx`, `Select.jsx`, `DatePicker.jsx`, `AsyncLinkField.jsx`)**:
   - Safely extracts `error.message` if an error object or ValidationError instance is passed to `error`.

6. **Table Cell Renderings (`PaginatedTable.jsx`)**:
   - Safely renders `row[col.key]?.name || row[col.key]?.title || row[col.key]?.label` when a column without a custom `render` function accesses a relation object.

---

## 2. Regression & Stability Verification
- **Automated Tests**: Added test cases in `src/components/__tests__/commonComponents.test.jsx` verifying object-shaped primary actions, string primary actions, object breadcrumbs, object button children, object status badges, and error objects in form inputs.
- **Test Result**: 100% green (19 / 19 tests in `commonComponents.test.jsx`, 290 / 290 across the suite).
