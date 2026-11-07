# 04 - Backend-to-Frontend Coverage Matrix & Gap Analysis

This document audits every backend-supported module against its frontend implementation, identifying coverage gaps, missing UI, and integration status.


---

## 1. Classification Scheme
- **COMPLETE:** Feature is fully integrated with live backend, tested, and role-gated.
- **PARTIAL:** Some frontend features exist, but key operations or workflows are missing.
- **MISSING:** Supported by backend, but entirely absent from frontend UI and routing.
- **BROKEN:** Frontend UI exists but fails or crashes during execution.
- **STATIC/MOCKED:** Contains hardcoded business data or fake responses.
- **INCORRECT INTEGRATION:** Path, HTTP method, or payload mismatch with backend.
- **UNAUTHORIZED ACCESS:** Page or component exposed to forbidden roles.
- **BACKEND ISSUE:** Feature blocked by backend omission or defect.

---

## 2. Module Coverage Summary Table

| Module | Backend Capability | Frontend Page / Component | Authorized Roles | Status | Assessment & Remediation |
|---|---|---|---|---|---|
| **Authentication** | Login, Token Refresh, Logout, Blacklist, Password Change | `LoginForm, AuthProvider, UserMenu` | `All Authenticated` | **COMPLETE** | Fully dynamic, JWT storage, Redis blacklist on logout, 5 role quick logins. |
| **Dashboard** | Multi-role academic & financial overview | `DashboardView, Admin-, Teacher-, Student-, Parent-, StaffDashboard` | `All Authenticated` | **COMPLETE** | All static fallbacks removed. Aggregated from live endpoints with ERPNext Desk UI cards. |
| **Students** | List, Search, Pagination, Detail, Create, Update, Link Guardians | `StudentsPage, StudentDetail, StudentForm, GuardianAssignModal` | `ROLE_ADMIN, ROLE_STAFF` | **COMPLETE** | Connected to `/api/v1/students` with full Frappe table & form. |
| **Teachers** | List, Search, Detail, Create, Update, Department assign | `TeachersPage, TeacherDetail, TeacherForm` | `ROLE_ADMIN, ROLE_STAFF` | **COMPLETE** | Connected to `/api/v1/teachers` with role-gated routes. |
| **Staff** | List, Search, Detail, Create, Update, Role assign | `StaffPage, StaffDetail, StaffForm` | `ROLE_ADMIN, ROLE_STAFF` | **COMPLETE** | Connected to `/api/v1/staff` with role-gated routes. |
| **Guardians** | List, Search, Detail, Create, Update, Link Students | `GuardiansPage, GuardianDetail, GuardianForm` | `ROLE_ADMIN, ROLE_STAFF` | **COMPLETE** | Connected to `/api/v1/guardians` with role-gated routes. |
| **Departments** | List, Create, Update, Delete, View Members | `DepartmentsPage, DepartmentFormModal` | `ROLE_ADMIN, ROLE_STAFF` | **COMPLETE** | Connected to `/api/v1/departments` with role-gated routes. |
| **Admissions / Applications** | Public Apply, Review List, Status Update, Decision, Convert to Student | `None (Missing)` | `ROLE_ADMIN, ROLE_STAFF` | **MISSING** | Backend has 6 endpoints. Frontend has NO page, route, or components! Need to implement Admissions feature. |
| **Finance - Factures (Invoices)** | Create, Update, Cancel, Lines, Batch Generate, Status filter | `None (Missing)` | `ROLE_ADMIN, ROLE_STAFF` | **MISSING** | Backend has 10 endpoints. Frontend has NO page or route! Need to implement Invoices feature. |
| **Finance - Paiements (Payments)** | Record payment, Receipts, History per invoice | `None (Missing)` | `ROLE_ADMIN, ROLE_STAFF` | **MISSING** | Backend has 4 endpoints. Frontend has NO payment modal/page! Need to implement Payments feature. |
| **Finance - Dépenses (Expenses)** | Create, Update, Delete, Category & Date filter | `None (Missing)` | `ROLE_ADMIN, ROLE_STAFF` | **MISSING** | Backend has 5 endpoints. Frontend has NO expenses management! Need to implement Expenses feature. |
| **Finance - Types de frais** | Create, Edit, Delete tuition/canteen fee types | `None (Missing)` | `ROLE_ADMIN, ROLE_STAFF` | **MISSING** | Backend has 5 endpoints. Frontend has NO fee-types management! Need to implement Fee Types feature. |
| **Exams & Grading** | Create, Edit, Lock, Batch Grade Entry, Status | `ExamsPage, ExamFormPage, ExamDetailPage, GradesPage` | `ROLE_TEACHER, ROLE_ADMIN, ROLE_STAFF` | **COMPLETE** | Full exam lifecycle, locking and batch grade input. |
| **Homework** | Submit work, download attachment, grade submission | `HomeworkPage, HomeworkSubmitModal, HomeworkGradeModal` | `All Authenticated (Role-scoped)` | **COMPLETE** | Live homework submissions and grading. |
| **Report Cards** | Batch generate, view semester summary, PDF download | `ReportCardsPage, ReportCardDetailModal` | `All Authenticated (Role-scoped)` | **COMPLETE** | Direct connection to `/v1/report-cards` and PDF streaming. |
| **Announcements** | Create, Edit, Target Audience, View | `AnnouncementsPage, AnnouncementModal` | `All Authenticated (Admin Write)` | **COMPLETE** | Audience filtering by role. |
| **Events** | School calendar, create, update, delete | `EventsPage, EventModal` | `All Authenticated (Admin Write)` | **COMPLETE** | Calendar view with real backend events. |
| **Messaging** | User-to-user inbox, sent, mark read, delete | `MessagesPage, ComposeMessageModal` | `All Authenticated` | **COMPLETE** | Internal messaging between active users. |
| **Notifications** | User alerts, mark read, clear | `NotificationsPage, NotificationBell` | `All Authenticated` | **COMPLETE** | Real-time user notification center. |
| **Leave Requests** | Submit request, cancel, approve, reject | `LeaveRequestsPage, LeaveRequestModal` | `ROLE_ADMIN, ROLE_TEACHER, ROLE_STAFF` | **COMPLETE** | HR leave management with admin approval workflows. |
| **Audit Logs** | Security audit trail, action, actor, timestamp | `AuditLogsPage, AuditLogFilters` | `ROLE_ADMIN` | **COMPLETE** | Strictly Admin-gated audit trail with filters. |
| **Pedagogical AI** | Observations, Consents, Analyses, Strategies | `ObservationsView, ConsentsView, AnalysesView, StrategiesView` | `Role-specific` | **COMPLETE** | Parent consent and observations workflow fully operational. |
| **Follow-Up Actions** | Create and track pedagogical follow-up actions | `None (integrated partially)` | `ROLE_TEACHER, ROLE_ADMIN` | **PARTIAL** | Endpoints exist (`/api/follow-up-actions`); need complete UI integration in observation details. |