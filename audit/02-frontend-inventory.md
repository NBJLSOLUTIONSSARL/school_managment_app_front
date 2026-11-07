# 02 - Frontend Feature Inventory & Component Audit

## 1. Frontend Architecture & Design Standards
- **Core Stack:** React 19, Vite, React Router v7 (`createBrowserRouter`), Axios (`axiosClient`).
- **Design System:** Frappe / ERPNext Desk UI Design System (compact typography: `text-2xs` to `text-base`, data-dense layout, `DocTypePageHead`, `LinkField`, `ChildTableGrid`, `DocTimeline`, keyboard shortcut `Ctrl+S`).
- **Quality & Verification:** Oxlint (`npm run lint`), Vitest (`npm test`), Vite build (`npm run build`).
- **Internationalization:** Multi-language provider (`I18nProvider`) supporting French (`fr`), English (`en`), Arabic (`ar`).

---

## 2. Frontend Route Inventory (`src/app/router.jsx`)
| Path | Component | Guard / Access Control | Status |
|---|---|---|---|
| `/login` | `LoginForm` | Public (Redirect if authenticated) | Functional |
| `/dashboard` | `DashboardView` | Authenticated (Dynamic per role) | Functional |
| `/profile` | `ProfileView` | Authenticated (Personal profile & documents) | Functional |
| `/students` | `StudentsPage` | `ROLE_ADMIN`, `ROLE_STAFF` | Functional |
| `/teachers` | `TeachersPage` | `ROLE_ADMIN`, `ROLE_STAFF` | Functional |
| `/staff` | `StaffPage` | `ROLE_ADMIN`, `ROLE_STAFF` | Functional |
| `/guardians` | `GuardiansPage` | `ROLE_ADMIN`, `ROLE_STAFF` | Functional |
| `/departments` | `DepartmentsPage` | `ROLE_ADMIN`, `ROLE_STAFF` | Functional |
| `/exams` | `ExamsPage` | Authenticated | Functional |
| `/exams/new` | `ExamFormPage` | `ROLE_TEACHER`, `ROLE_ADMIN`, `ROLE_STAFF` | Functional |
| `/exams/:id` | `ExamDetailPage` | `ROLE_TEACHER`, `ROLE_ADMIN`, `ROLE_STAFF` | Functional |
| `/grades` | `GradesPage` | `ROLE_TEACHER`, `ROLE_ADMIN`, `ROLE_STAFF` | Functional |
| `/homework` | `HomeworkPage` | Authenticated (Submit / Grade) | Functional |
| `/report-cards` | `ReportCardsPage` | Authenticated (Download / Generate) | Functional |
| `/announcements` | `AnnouncementsPage` | Authenticated (Audience filtered) | Functional |
| `/events` | `EventsPage` | Authenticated | Functional |
| `/messages` | `MessagesPage` | Authenticated (User-scoped) | Functional |
| `/notifications` | `NotificationsPage`| Authenticated (User-scoped) | Functional |
| `/leave-requests`| `LeaveRequestsPage`| `ROLE_ADMIN`, `ROLE_TEACHER`, `ROLE_STAFF` | Functional |
| `/audit-logs` | `AuditLogsPage` | `ROLE_ADMIN` | Functional |
| `/observations` | `ObservationsView` | `ROLE_TEACHER`, `ROLE_ADMIN`, `ROLE_PARENT` | Functional |
| `/consents` | `ConsentsView` | `ROLE_PARENT`, `ROLE_ADMIN`, `ROLE_STAFF` | Functional |
| `/analyses` | `AnalysesView` | `ROLE_TEACHER`, `ROLE_ADMIN` | Functional |
| `/strategies` | `StrategiesView` | `ROLE_TEACHER`, `ROLE_ADMIN`, `ROLE_STUDENT` | Functional |
| `/admissions` | *MISSING* | Should be `ROLE_ADMIN`, `ROLE_STAFF` | **MISSING IN FRONTEND** |
| `/finances/invoices` | *MISSING* | Should be `ROLE_ADMIN`, `ROLE_STAFF` | **MISSING IN FRONTEND** |
| `/finances/payments` | *MISSING* | Should be `ROLE_ADMIN`, `ROLE_STAFF` | **MISSING IN FRONTEND** |
| `/finances/expenses` | *MISSING* | Should be `ROLE_ADMIN`, `ROLE_STAFF` | **MISSING IN FRONTEND** |
| `/finances/fee-types`| *MISSING* | Should be `ROLE_ADMIN`, `ROLE_STAFF` | **MISSING IN FRONTEND** |

---

## 3. Discovered Frontend Deficiencies & Inconsistencies
### A. Missing Entire Feature Modules Supported by Backend
1. **Admissions & Applications (`/api/v1/applications`)**:
   - Backend has complete applicant workflow: submit public application, review applications with filters, accept/reject decision, and convert approved applicants directly into enrolled Students (`/applications/{id}/convert`).
   - **Frontend Status:** No route, no page, and no UI exists in frontend!
2. **Finance Module (`/api/v1/finances/**`)**:
   - Backend has 24 endpoints across Invoices (`/invoices`), Payments (`/payments`), Expenses (`/expenses`), and Fee Types (`/fee-types`).
   - **Frontend Status:** No route, no page, and no UI exists in frontend!
3. **Follow-Up Actions (`/api/follow-up-actions`)**:
   - Backend supports creating and tracking follow-up actions for pedagogical observations.
   - **Frontend Status:** Minimal integration in pedagogical AI views.

### B. Fixed Deficiencies in Previous Phase
1. **Fictional Librarian Role Eliminated:** Deleted `LibrarianDashboard.jsx` and removed `ROLE_LIBRARIAN` from Auth and Dashboard tabs.
2. **Eliminated Hardcoded Dashboard Data:** Replaced static 1248 students, 84 teachers, and fake attendance rates with live API calculations.
3. **Applied Route Guards:** Added `RoleGuard` with `allowedRoles` to all restricted routes in `router.jsx`.
4. **Gated Navigation Layout:** Gated sidebar navigation items in `PrivateLayout.jsx` with strict role permissions.

---

## 4. Frontend API Services Inventory
| Service File | Domain | Backend Endpoints Called | Integration Status |
|---|---|---|---|
| `statsService.js` | Dashboard Aggregations | `/v1/students`, `/v1/teachers`, `/v1/staff`, `/v1/departments`, `/v1/applications`, `/v1/finances/invoices`, `/v1/exams`, `/events`, `/v1/homework/students/{id}/submissions`, `/v1/report-cards` | Complete & Dynamic |
| `studentService.js` | Student Management | `/v1/students`, `/v1/students/{id}`, `/v1/students/{id}/guardians` | Complete |
| `teacherService.js` | Faculty Management | `/v1/teachers`, `/v1/teachers/{id}` | Complete |
| `staffService.js` | Staff Management | `/v1/staff`, `/v1/staff/{id}` | Complete |
| `guardianService.js` | Guardians / Tuteurs | `/v1/guardians`, `/v1/guardians/{id}` | Complete |
| `departmentService.js` | Academic Departments | `/v1/departments`, `/v1/departments/{id}` | Complete |
| `examService.js` | Exams & Grading | `/v1/exams`, `/v1/exams/{id}`, `/lock`, `/grades`, `/grades/batch` | Complete |
| `homeworkService.js` | Homework & Submissions | `/v1/homework/{id}/submit`, `/submissions/{id}/grade`, `/students/{id}/submissions` | Complete |
| `reportCardService.js` | Report Cards & Transcripts | `/v1/report-cards`, `/generate`, `/{id}/download` | Complete |
| `announcementService.js`| Announcements | `/api/announcements` | Complete |
| `eventService.js` | School Calendar Events | `/api/events` | Complete |
| `messageService.js` | Internal Messaging | `/api/messages/inbox/{id}`, `/sent/{id}`, `/read` | Complete |
| `notificationService.js`| Notifications | `/api/notifications/user/{id}`, `/read` | Complete |
| `leaveRequestService.js`| Leave Requests & Absences | `/api/leave-requests`, `/cancel`, `/approve`, `/reject` | Complete |
| `auditLogService.js` | Security & Audit Trail | `/api/audit-logs`, `/user/{id}` | Complete |
| `observationsApi.js` | Pedagogical Observations| `/api/observations` | Complete |
| `aiConsentsApi.js` | AI Parental Consents | `/api/ai-consents` | Complete |
| `aiAnalysesApi.js` | AI Diagnostic Analyses | `/api/ai-analyses` | Complete |
| `learningStrategiesApi.js` | Learning Strategies | `/api/learning-strategies` | Complete |
| `documentApi.js` | User Profile Documents | `/api/v1/documents` | Complete |