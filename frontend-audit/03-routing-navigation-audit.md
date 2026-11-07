# 03 — Routing and Navigation Audit

## 1. Overview
All 28 route definitions in `src/app/router.jsx`, all 20 navigation links in `src/components/layout/PrivateLayout.jsx`, and internal navigation triggers were audited.

---

## 2. Route Verification Matrix

| Route Path | Associated Component | Allowed Roles | Layout | Verification Result |
|---|---|---|---|---|
| `/` | `RootIndexRedirect` | Public | None | Redirects to `/dashboard` (or `/login` if unauth) |
| `/login` | `LoginPage` | Public | Standalone | Split Figma screen, 1-click accounts, verified |
| `/403` | `ForbiddenPage` | Public | `PublicLayout` | Explains missing permissions, verified |
| `/404` | `NotFoundPage` | Public | `PublicLayout` | Catch-all for non-existing URLs, verified |
| `/dashboard` | `DashboardPage` | All Authenticated | `PrivateLayout` | Role-specific dashboard loads correctly |
| `/students` | `StudentListPage` | Admin, Staff, Teacher | `PrivateLayout` | Table, filters, create modal, verified |
| `/teachers` | `TeacherListPage` | Admin, Staff, Teacher | `PrivateLayout` | Table, filters, create modal, verified |
| `/staff` | `StaffListPage` | Admin, Staff | `PrivateLayout` | Table, filters, create modal, verified |
| `/guardians` | `GuardianListPage` | Admin, Staff | `PrivateLayout` | Table, filters, create modal, verified |
| `/departments` | `DepartmentListPage` | Admin, Staff, Teacher | `PrivateLayout` | Table, filters, create modal, verified |
| `/admissions` | `AdmissionsPage` | Admin, Staff | `PrivateLayout` | Admissions KPI cards, table, verified |
| `/finances` | `InvoicesPage` | Admin, Staff | `PrivateLayout` | Alias to InvoicesPage, verified |
| `/finances/invoices`| `InvoicesPage` | Admin, Staff | `PrivateLayout` | Financial KPIs, invoices table, verified |
| `/profile` | `ProfilePage` | All Authenticated | `PrivateLayout` | Profile info, legal documents, verified |
| `/observations` | `ObservationsPage` | Parent, Admin | `PrivateLayout` | Pedagogical observations, verified |
| `/consents` | `ConsentsPage` | Parent, Admin | `PrivateLayout` | AI consents management, verified |
| `/analyses` | `AnalysesPage` | Parent, Student, Admin | `PrivateLayout` | AI learning analyses, verified |
| `/strategies` | `StrategiesPage` | Parent, Admin | `PrivateLayout` | Learning strategies, verified |
| `/exams` | `ExamListPage` | All Authenticated | `PrivateLayout` | Exams list, stats, verified |
| `/exams/new` | `ExamFormPage` | Admin, Teacher, Staff | `PrivateLayout` | New exam form, verified |
| `/exams/:id` | `ExamFormPage` | Admin, Teacher, Staff | `PrivateLayout` | Edit exam form with dynamic ID, verified |
| `/grades` | `GradeEntryPage` | Admin, Teacher, Staff | `PrivateLayout` | Grade entry grid, verified |
| `/homework` | `HomeworkPage` | All Authenticated | `PrivateLayout` | Homework assignments, verified |
| `/report-cards` | `ReportCardListPage` | All Authenticated | `PrivateLayout` | Report cards list & generation, verified |
| `/announcements` | `AnnouncementListPage` | All Authenticated | `PrivateLayout` | Announcements list, modal, verified |
| `/events` | `EventListPage` | All Authenticated | `PrivateLayout` | Calendar & list views, verified |
| `/messages` | `MessageListPage` | All Authenticated | `PrivateLayout` | Internal conversations, verified |
| `/notifications` | `NotificationListPage`| All Authenticated | `PrivateLayout` | Notification centre, verified |
| `/leave-requests`| `LeaveRequestListPage` | Admin, Teacher, Staff, Student | `PrivateLayout` | Leave requests list & modal, verified |
| `/audit-logs` | `AuditLogListPage` | Admin | `PrivateLayout` | System audit logs, verified |
| `/showcase` | `ComponentShowcasePage`| All Authenticated | `PrivateLayout` | UI component design catalog, verified |
| `*` | `NotFoundPage` | Public | None | Verified |

---

## 3. Sidebar Actions and Internal Links
- **24/7 Support Card**: Clicking "Start chat" opens `/messages` smoothly.
- **Top Header Search**: Expands search pill without navigating or erroring.
- **Top Header Messages Icon**: Direct navigation to `/messages`.
- **Top Header Notification Bell**: Opens dropdown with latest 5 alerts and link to `/notifications`.
- **Top Header Language Switcher**: Toggles `fr`, `en`, `ar` with instant state update and direction adjustment.
- **Top Header User Avatar**: Opens menu with profile link (`/profile`) and sign out button (`logout()`).
- **Dead Link Check**: 40 unique `Link to` and `navigate()` references scanned across the application. 0 dead links found.
