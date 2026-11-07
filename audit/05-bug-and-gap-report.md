# 05 - Defect, Vulnerability & Functional Gap Report

This report categorizes all issues discovered during the backend and frontend audit by severity level, documenting root causes, affected files, and remediation plans.


---

## 1. Issue Severity Classification
### CRITICAL: Security & Access Violations (Resolved in Phase 1)
- **C-01: Unprotected Navigation Links in PrivateLayout**
  - *Description:* Students and Parents had visible navigation items for `/teachers`, `/staff`, `/departments`, `/guardians`.
  - *Root Cause:* `navItems` array lacked role-based filtering.
  - *Remediation:* Gated every sidebar item with `item.roles.some(role => hasRole(role))`.
  - *Status:* **FIXED & VERIFIED**

- **C-02: Unprotected Client-Side Routes in Router**
  - *Description:* URL manipulation could access restricted pages without role guards.
  - *Root Cause:* Routes lacked `allowedRoles` on `<RoleGuard>`.
  - *Remediation:* Enforced `allowedRoles` for all administrative and academic routes.
  - *Status:* **FIXED & VERIFIED**

- **C-03: Fictional Role ROLE_LIBRARIAN in Auth & Dashboard**
  - *Description:* Frontend advertised and accepted a non-existent role.
  - *Root Cause:* Legacy hallucination.
  - *Remediation:* Deleted `LibrarianDashboard.jsx`, removed role from `AuthProvider.jsx` and `DashboardView.jsx`.
  - *Status:* **FIXED & VERIFIED**

---

### HIGH: Core Backend Functionality Missing from Frontend (To Be Implemented)
- **H-01: Admissions / Applications Management (`/api/v1/applications`)**
  - *Description:* Backend supports complete admissions pipeline (public application, listing with status filter, review decision ACCEPTED/REJECTED, conversion to Student), but frontend has zero UI.
  - *Root Cause:* Feature was never built in the frontend.
  - *Remediation:* Create `src/features/admissions/` with API service, `AdmissionsPage`, status filters, decision modal, and convert-to-student action. Add route `/admissions` in `router.jsx` and nav item in `PrivateLayout.jsx`.
  - *Status:* **IN PROGRESS**

- **H-02: Finances & Invoices Management (`/api/v1/finances/**`)**
  - *Description:* Backend provides 24 endpoints across Invoices, Payments, Expenses, and Fee-Types for Admin and Staff. Frontend has no page to view, create, or record payments on invoices.
  - *Root Cause:* Feature was never built in the frontend.
  - *Remediation:* Create `src/features/finances/` with API services (`invoiceService.js`, `paymentService.js`, `feeTypeService.js`), `InvoicesPage`, invoice creation/detail modal, line items grid, payment recording modal, and fee types view. Add route `/finances/invoices` and nav item in `PrivateLayout.jsx`.
  - *Status:* **IN PROGRESS**

---

### MEDIUM: Incomplete Data Handling & Mock Remnants (Resolved in Phase 1)
- **M-01: Static Mock Records on Dashboards**
  - *Description:* Dashboards used static numbers (1248, 84, 32), fake timetables, and fake attendance percentages.
  - *Root Cause:* Hardcoded fallback constants.
  - *Remediation:* Replaced with real dynamic endpoint calculations in `statsService.js`. Completely removed unsupported attendance rates.
  - *Status:* **FIXED & VERIFIED**

- **M-02: StaffDashboard Runtime Crash**
  - *Description:* Clicking retry in StaffDashboard threw `fetchStaffData is not defined`.
  - *Root Cause:* Missing function definition.
  - *Remediation:* Added `fetchStaffData` wrapped in `useCallback`.
  - *Status:* **FIXED & VERIFIED**

---

### LOW: Usability, i18n & Missing Translations (Resolved)
- **L-01: Missing Role & Navigation Translations**
  - *Description:* Arabic and French translations lacked `parent` and `staff` role labels.
  - *Remediation:* Added complete dictionary entries in `translations.js`.
  - *Status:* **FIXED & VERIFIED**