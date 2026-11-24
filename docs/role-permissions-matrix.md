# Authoritative Role & Permissions Matrix — School Management System

**Project:** School Management Platform (*Système de Gestion Scolaire*)  
**Version:** 2.0 (Post-Wave 9 Architecture)  
**Standard:** Role-Based Access Control (RBAC) + Method Security (`@PreAuthorize`) + Object-Level Ownership (IDOR Protection)  
**Sources of Truth:** `docs/spec.pdf` (Section 3 Roles & Section 6.1 Security), `AUDIT_REPORT_v2.md`, Flyway Migrations `V1`–`V20`  

---

## 1. Unified Permission Dictionary

All system operations map to a unified permission key format: `<domain>:<action>`. Each key links to its legacy Spring Security Authority (`PERM_*`) and functional description.

| Permission Key | Domain | Legacy Authority | Description |
| :--- | :--- | :--- | :--- |
| `system:monitor` | System | `PERM_SYSTEM_MONITOR` | View platform uptime, server health, and infrastructure metrics. |
| `system:config` | System | `PERM_SYSTEM_CONFIG` | Modify platform environment parameters, cache, and system settings. |
| `system:backup` | System | `PERM_SYSTEM_BACKUP` | Trigger manual database backups, view historical logs, and download SQL dumps. |
| `school:manage` | School | `PERM_SCHOOL_MANAGE` | Create, configure, suspend, or delete school tenant instances. |
| `school:configure` | School | `PERM_SCHOOL_CONFIGURE` | Edit school institutional profile, branding, logo, stamp, and grading thresholds. |
| `user:read` | User | `PERM_USER_READ` | Search and inspect user accounts across roles. |
| `user:write` | User | `PERM_USER_WRITE` | Create, update, or deactivate user login accounts and credentials. |
| `role:manage` | Role | `PERM_ROLE_MANAGE` | Assign roles to users and update dynamic role-permission mappings. |
| `audit:read` | Audit | `PERM_READ_LOG` | Search and export immutable security audit logs. |
| `student:read` | Student | `PERM_STUDENT_READ` | Access student dossiers, enrollment history, and directory. |
| `student:write` | Student | `PERM_STUDENT_WRITE` | Register, update identity, and maintain student records. |
| `student:delete` | Student | `PERM_STUDENT_DELETE` | Soft-delete / archive student profiles. |
| `guardian:read` | Guardian | `PERM_GUARDIAN_READ` | Access guardian directory and contact details. |
| `guardian:write` | Guardian | `PERM_GUARDIAN_WRITE` | Register and link guardians to enrolled students. |
| `teacher:read` | Teacher | `PERM_TEACHER_READ` | Access faculty directory and teacher profiles. |
| `teacher:write` | Teacher | `PERM_TEACHER_WRITE` | Create and manage teacher contracts and department assignments. |
| `staff:read` | Staff | `PERM_STAFF_READ` | Access administrative staff directory. |
| `staff:write` | Staff | `PERM_STAFF_WRITE` | Create and manage administrative staff records. |
| `staff:manage` | Staff | `PERM_STAFF_MANAGE` | Review and approve staff leave requests and evaluations. |
| `department:read` | Department | `PERM_DEPARTMENT_READ` | View academic departments. |
| `department:write` | Department | `PERM_DEPARTMENT_WRITE` | Create and configure academic departments and heads. |
| `academics:manage` | Academics | `PERM_ACADEMICS_MANAGE` | Manage academic years, terms, grade levels, and sections. |
| `class:read` | Class | `PERM_CLASS_READ` | View school classes, co-teachers, and student cohorts. |
| `class:write` | Class | `PERM_CLASS_WRITE` | Create classes, assign main rooms, and allocate teacher-subject hours. |
| `class:teacher:read`| Class | `PERM_CLASS_TEACHER_READ` | View classes and cohorts assigned to the teacher. |
| `subject:read` | Subject | `PERM_SUBJECT_READ` | View academic subjects and coefficients. |
| `subject:write` | Subject | `PERM_SUBJECT_WRITE` | Configure course subjects, credits, and coefficients. |
| `timetable:read` | Timetable | `PERM_TIMETABLE_READ` | View school-wide and room schedules. |
| `timetable:write` | Timetable | `PERM_TIMETABLE_WRITE` | Configure slot schedules with double-booking conflict detection. |
| `timetable:teacher:read` | Timetable | `PERM_TIMETABLE_TEACHER_READ`| View personal faculty teaching timetable. |
| `timetable:parent:read` | Timetable | `PERM_TIMETABLE_PARENT_READ` | View enrolled children's class schedule. |
| `timetable:student:read` | Timetable | `PERM_TIMETABLE_STUDENT_READ`| View personal learner class timetable. |
| `attendance:read` | Attendance | `PERM_ATTENDANCE_READ` | View school attendance rates and absence logs. |
| `attendance:write` | Attendance | `PERM_ATTENDANCE_WRITE` | Conduct daily classroom roll-call and record absences/tardiness. |
| `attendance:justify`| Attendance | `PERM_ATTENDANCE_JUSTIFY` | Review parent absence notes and transition status to `EXCUSED`. |
| `attendance:parent:read` | Attendance | `PERM_ATTENDANCE_PARENT_READ` | View attendance presence calendar for own children. |
| `attendance:parent:write`| Attendance | `PERM_ATTENDANCE_PARENT_WRITE`| Upload medical notes and excuse letters for child absences. |
| `attendance:student:read`| Attendance | `PERM_ATTENDANCE_STUDENT_READ`| View personal attendance records. |
| `grade:read` | Grade | `PERM_GRADE_READ` | View school exam scores and grade grids. |
| `grade:write` | Grade | `PERM_GRADE_WRITE` | Create exams, bulk input numeric scores, and lock grades. |
| `grade:parent:read` | Grade | `PERM_GRADE_PARENT_READ` | View evaluation scores and remarks for own children. |
| `grade:student:read`| Grade | `PERM_GRADE_STUDENT_READ` | View personal evaluation results and teacher remarks. |
| `reportcard:read` | ReportCard | `PERM_REPORTCARD_READ` | Inspect term report cards and class ranking lists. |
| `reportcard:publish`| ReportCard | `PERM_REPORTCARD_PUBLISH` | Bulk generate, apply school digital stamp/signature, and publish bulletins. |
| `reportcard:parent:read` | ReportCard | `PERM_REPORTCARD_PARENT_READ` | Download official PDF report cards for own children. |
| `reportcard:student:read` | ReportCard | `PERM_REPORTCARD_STUDENT_READ` | Download official PDF report card for self. |
| `homework:read` | Homework | `PERM_HOMEWORK_READ` | View homework tasks and assigned exercises. |
| `homework:write` | Homework | `PERM_HOMEWORK_WRITE` | Assign homework with file attachments; grade student submissions. |
| `homework:parent:read` | Homework | `PERM_HOMEWORK_PARENT_READ` | View homework assignments and due dates for own children. |
| `homework:student:read` | Homework | `PERM_HOMEWORK_STUDENT_READ` | View homework assignments and download worksheets. |
| `homework:student:write`| Homework | `PERM_HOMEWORK_STUDENT_WRITE`| Upload completed homework submissions before deadline. |
| `course:manage` | Course | `PERM_COURSE_MANAGE` | Upload syllabus outlines, textbooks, and pedagogical resources. |
| `course:read` | Course | `PERM_COURSE_READ` | Download syllabus outlines and course reference files. |
| `observation:read` | Observation | `PERM_READ_OBSERVATION` | View student pedagogical observations. |
| `observation:write`| Observation | `PERM_WRITE_OBSERVATION` | Submit academic or behavioral observation notes. |
| `ai:validate` | AI | `PERM_VALIDATE_ANALYSIS` | Review, edit, validate, and publish AI pedagogical analyses. |
| `ai:parent:read` | AI | `PERM_READ_ANALYSIS` | Read published learning strategies for own children. |
| `strategy:student:read` | AI | `PERM_READ_STRATEGY` | Read published, age-adapted learner study strategy. |
| `application:read` | Admissions | `PERM_APPLICATION_READ` | View admissions candidate dossiers. |
| `application:write`| Admissions | `PERM_APPLICATION_WRITE` | Progress admissions pipeline, schedule interviews, and enroll candidates. |
| `document:verify` | Document | `PERM_DOCUMENT_VERIFY` | Verify, approve, or reject submitted legal and medical documents. |
| `certificate:generate`| Document | `PERM_CERTIFICATE_GENERATE` | Generate printable attendance certificates and student ID cards. |
| `finance:read` | Finance | `PERM_FINANCE_READ` | View general ledger, cash-flow, and accounting summaries. |
| `finance:write` | Finance | `PERM_FINANCE_WRITE` | Configure installment plans, automated overdue reminders, and billing. |
| `invoice:read` | Finance | `PERM_INVOICE_READ` | View invoices, installments, and billing status. |
| `invoice:write` | Finance | `PERM_INVOICE_WRITE` | Create, edit, and generate term tuition invoices. |
| `invoice:manage` | Finance | `PERM_INVOICE_MANAGE` | Manage overdue accounts and trigger payment reminders. |
| `payment:read` | Finance | `PERM_PAYMENT_READ` | View payment records and transactions. |
| `payment:write` | Finance | `PERM_PAYMENT_WRITE` | Record incoming payments and render official PDF receipts. |
| `fee:manage` | Finance | `PERM_FEE_MANAGE` | Manage fee schedule, discounts, and scholarship rules. |
| `expense:read` | Finance | `PERM_EXPENSE_READ` | View institutional operational expenses. |
| `expense:write` | Finance | `PERM_EXPENSE_WRITE` | Record and approve operational expenses. |
| `payroll:manage` | Finance | `PERM_PAYROLL_MANAGE` | Process staff payroll and generate official PDF payslips. |
| `finance:parent:read`| Finance | `PERM_FINANCE_PARENT_READ` | View tuition invoices, due dates, and receipts for own children. |
| `library:read` | Library | `PERM_LIBRARY_READ` | Browse book catalog, availability, and popular titles. |
| `library:write` | Library | `PERM_LIBRARY_WRITE` | Catalog books, manage copies, and update inventory. |
| `library:loan:read` | Library | `PERM_LIBRARY_LOAN_READ` | View active and historical book circulation loans. |
| `library:loan:write`| Library | `PERM_LIBRARY_LOAN_WRITE` | Issue book loans and process book check-in returns. |
| `library:loan:manage`| Library | `PERM_LIBRARY_LOAN_MANAGE` | Enforce loan duration limits and renewal allowances. |
| `library:penalty:manage`| Library | `PERM_LIBRARY_PENALTY_MANAGE`| Calculate and collect overdue fines and damaged book penalties. |
| `addon:read` | Addons | `PERM_ADDON_READ` | Access enabled add-on modules (Transport, Canteen, Clubs, etc.). |
| `addon:parent:read`| Addons | `PERM_ADDON_PARENT_READ` | View transport vehicle routes and canteen meal plans for child. |
| `addon:student:read`| Addons | `PERM_ADDON_STUDENT_READ` | View personal bus pass and weekly canteen menu. |
| `announcement:read`| Communication | `PERM_ANNOUNCEMENT_READ` | View school announcements targeted to user role. |
| `announcement:write`| Communication | `PERM_ANNOUNCEMENT_WRITE` | Publish announcements by level, class, or role. |
| `message:send` | Communication | `PERM_MESSAGE_SEND` | Send internal direct messages to authorized contacts. |
| `meeting:manage` | Communication | `PERM_MEETING_MANAGE` | Coordinate school-wide parent-teacher appointment slots. |
| `meeting:teacher:manage`| Communication | `PERM_MEETING_TEACHER_MANAGE`| Define availability and confirm parent appointment requests. |
| `meeting:parent:manage` | Communication | `PERM_MEETING_PARENT_MANAGE` | Book appointment slots with child's teachers. |
| `report:read` | Reports | `PERM_REPORT_READ` | Generate enrollment, attendance, and academic reports. |
| `report:finance:read`| Reports | `PERM_REPORT_FINANCE_READ` | Generate financial revenue and expense audit reports. |

---

## 2. Role × Permission Matrix

*Legend:*
* `✓ (All)`: Full authority across all institutions (Super Admin).
* `✓ (School)`: Full authority within single school institution (Director).
* `✓ (Office)`: School administrative and registrar scope (Secretary).
* `✓ (Class)`: Scoped strictly to assigned classes and students (Teacher).
* `✓ (Finance)`: Scoped strictly to financial and billing ledger (Accountant).
* `✓ (Lib)`: Scoped strictly to library circulation module (Librarian).
* `✓ (Child)`: Scoped strictly to authenticated guardian's children (Parent).
* `✓ (Self)`: Scoped strictly to authenticated user's own dossier (Student).
* `—`: Completely unauthorized (access denied at HTTP gateway & method level).

| Permission Key | SUPER_ADMIN | DIRECTOR | SECRETARY | TEACHER | ACCOUNTANT | LIBRARIAN | PARENT | STUDENT | *NURSE (Add-on)* |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `system:monitor` | ✓ (All) | — | — | — | — | — | — | — | — |
| `system:config` | ✓ (All) | — | — | — | — | — | — | — | — |
| `system:backup` | ✓ (All) | ✓ (School) | — | — | — | — | — | — | — |
| `school:manage` | ✓ (All) | — | — | — | — | — | — | — | — |
| `school:configure` | ✓ (All) | ✓ (School) | — | — | — | — | — | — | — |
| `user:read` | ✓ (All) | ✓ (School) | ✓ (Office) | — | — | — | — | — | — |
| `user:write` | ✓ (All) | ✓ (School) | — | — | — | — | — | — | — |
| `role:manage` | ✓ (All) | ✓ (School) | — | — | — | — | — | — | — |
| `audit:read` | ✓ (All) | ✓ (School) | — | — | — | — | — | — | — |
| `student:read` | ✓ (All) | ✓ (School) | ✓ (Office) | ✓ (Class) | ✓ (Finance) | ✓ (Lib) | ✓ (Child) | ✓ (Self) | ✓ (Health) |
| `student:write` | ✓ (All) | ✓ (School) | ✓ (Office) | — | — | — | — | — | — |
| `student:delete` | ✓ (All) | ✓ (School) | — | — | — | — | — | — | — |
| `guardian:read` | ✓ (All) | ✓ (School) | ✓ (Office) | ✓ (Class) | ✓ (Finance) | — | ✓ (Self) | — | — |
| `guardian:write` | ✓ (All) | ✓ (School) | ✓ (Office) | — | — | — | — | — | — |
| `teacher:read` | ✓ (All) | ✓ (School) | ✓ (Office) | ✓ (School)| — | — | ✓ (Child) | ✓ (Self) | — |
| `teacher:write` | ✓ (All) | ✓ (School) | — | — | — | — | — | — | — |
| `staff:read` | ✓ (All) | ✓ (School) | ✓ (Office) | — | ✓ (Finance) | — | — | — | — |
| `staff:write` | ✓ (All) | ✓ (School) | — | — | — | — | — | — | — |
| `staff:manage` | ✓ (All) | ✓ (School) | — | — | — | — | — | — | — |
| `department:read` | ✓ (All) | ✓ (School) | ✓ (Office) | ✓ (School)| — | — | — | — | — |
| `department:write` | ✓ (All) | ✓ (School) | — | — | — | — | — | — | — |
| `academics:manage` | ✓ (All) | ✓ (School) | — | — | — | — | — | — | — |
| `class:read` | ✓ (All) | ✓ (School) | ✓ (Office) | ✓ (School)| — | — | ✓ (Child) | ✓ (Self) | — |
| `class:write` | ✓ (All) | ✓ (School) | — | — | — | — | — | — | — |
| `class:teacher:read`| — | ✓ (School) | — | ✓ (Class) | — | — | — | — | — |
| `subject:read` | ✓ (All) | ✓ (School) | ✓ (Office) | ✓ (School)| — | — | ✓ (Child) | ✓ (Self) | — |
| `subject:write` | ✓ (All) | ✓ (School) | — | — | — | — | — | — | — |
| `timetable:read` | ✓ (All) | ✓ (School) | ✓ (Office) | ✓ (School)| — | — | ✓ (Child) | ✓ (Self) | — |
| `timetable:write` | ✓ (All) | ✓ (School) | — | — | — | — | — | — | — |
| `timetable:teacher:read`| — | ✓ (School) | — | ✓ (Self) | — | — | — | — | — |
| `timetable:parent:read` | — | — | — | — | — | — | ✓ (Child) | — | — |
| `timetable:student:read`| — | — | — | — | — | — | — | ✓ (Self) | — |
| `attendance:read` | ✓ (All) | ✓ (School) | ✓ (Office) | ✓ (Class) | — | — | — | — | — |
| `attendance:write` | — | ✓ (School) | — | ✓ (Class) | — | — | — | — | — |
| `attendance:justify`| — | ✓ (School) | ✓ (Office) | — | — | — | — | — | — |
| `attendance:parent:read`| — | — | — | — | — | — | ✓ (Child) | — | — |
| `attendance:parent:write`| — | — | — | — | — | — | ✓ (Child) | — | — |
| `attendance:student:read`| — | — | — | — | — | — | — | ✓ (Self) | — |
| `grade:read` | ✓ (All) | ✓ (School) | — | ✓ (Class) | — | — | — | — | — |
| `grade:write` | — | ✓ (School) | — | ✓ (Class) | — | — | — | — | — |
| `grade:parent:read`| — | — | — | — | — | — | ✓ (Child) | — | — |
| `grade:student:read`| — | — | — | — | — | — | — | ✓ (Self) | — |
| `reportcard:read` | ✓ (All) | ✓ (School) | ✓ (Office) | ✓ (Class) | — | — | — | — | — |
| `reportcard:publish`| — | ✓ (School) | — | — | — | — | — | — | — |
| `reportcard:parent:read`| — | — | — | — | — | — | ✓ (Child) | — | — |
| `reportcard:student:read`| — | — | — | — | — | — | — | ✓ (Self) | — |
| `homework:read` | ✓ (All) | ✓ (School) | — | ✓ (Class) | — | — | — | — | — |
| `homework:write` | — | ✓ (School) | — | ✓ (Class) | — | — | — | — | — |
| `homework:parent:read`| — | — | — | — | — | — | ✓ (Child) | — | — |
| `homework:student:read`| — | — | — | — | — | — | — | ✓ (Self) | — |
| `homework:student:write`| — | — | — | — | — | — | — | ✓ (Self) | — |
| `course:manage` | — | ✓ (School) | — | ✓ (Class) | — | — | — | — | — |
| `course:read` | ✓ (All) | ✓ (School) | — | ✓ (School)| — | — | ✓ (Child) | ✓ (Self) | — |
| `observation:read` | — | ✓ (School) | — | ✓ (Class) | — | — | ✓ (Child) | — | — |
| `observation:write`| — | ✓ (School) | — | ✓ (Class) | — | — | ✓ (Child) | — | — |
| `ai:validate` | — | ✓ (School) | — | ✓ (Class) | — | — | — | — | — |
| `ai:parent:read` | — | — | — | — | — | — | ✓ (Child) | — | — |
| `strategy:student:read`| — | — | — | — | — | — | — | ✓ (Self) | — |
| `application:read` | ✓ (All) | ✓ (School) | ✓ (Office) | — | — | — | — | — | — |
| `application:write`| — | ✓ (School) | ✓ (Office) | — | — | — | — | — | — |
| `document:verify` | ✓ (All) | ✓ (School) | ✓ (Office) | — | — | — | — | — | — |
| `certificate:generate`| — | ✓ (School) | ✓ (Office) | — | — | — | — | — | — |
| `finance:read` | ✓ (All) | ✓ (School) | — | — | ✓ (Finance) | — | — | — | — |
| `finance:write` | — | ✓ (School) | — | — | ✓ (Finance) | — | — | — | — |
| `invoice:read` | ✓ (All) | ✓ (School) | ✓ (Office) | — | ✓ (Finance) | — | — | — | — |
| `invoice:write` | — | ✓ (School) | — | — | ✓ (Finance) | — | — | — | — |
| `invoice:manage` | — | ✓ (School) | — | — | ✓ (Finance) | — | — | — | — |
| `payment:read` | ✓ (All) | ✓ (School) | ✓ (Office) | — | ✓ (Finance) | — | — | — | — |
| `payment:write` | — | ✓ (School) | — | — | ✓ (Finance) | — | — | — | — |
| `fee:manage` | — | ✓ (School) | — | — | ✓ (Finance) | — | — | — | — |
| `expense:read` | ✓ (All) | ✓ (School) | — | — | ✓ (Finance) | — | — | — | — |
| `expense:write` | — | ✓ (School) | — | — | ✓ (Finance) | — | — | — | — |
| `payroll:manage` | — | ✓ (School) | — | — | ✓ (Finance) | — | — | — | — |
| `finance:parent:read`| — | — | — | — | — | — | ✓ (Child) | — | — |
| `library:read` | ✓ (All) | ✓ (School) | ✓ (Office) | ✓ (School)| — | ✓ (Lib) | ✓ (Child) | ✓ (Self) | — |
| `library:write` | — | ✓ (School) | — | — | — | ✓ (Lib) | — | — | — |
| `library:loan:read`| ✓ (All) | ✓ (School) | — | — | — | ✓ (Lib) | — | — | — |
| `library:loan:write`| — | ✓ (School) | — | — | — | ✓ (Lib) | — | — | — |
| `library:loan:manage`| — | ✓ (School) | — | — | — | ✓ (Lib) | — | — | — |
| `library:penalty:manage`| — | ✓ (School) | — | — | — | ✓ (Lib) | — | — | — |
| `addon:read` | ✓ (All) | ✓ (School) | ✓ (Office) | ✓ (School)| — | ✓ (Lib) | — | — | ✓ (Health) |
| `addon:parent:read`| — | — | — | — | — | — | ✓ (Child) | — | — |
| `addon:student:read`| — | — | — | — | — | — | — | ✓ (Self) | — |
| `announcement:read`| ✓ (All) | ✓ (School) | ✓ (Office) | ✓ (School)| ✓ (Finance) | ✓ (Lib) | ✓ (Child) | ✓ (Self) | ✓ (Health) |
| `announcement:write`| ✓ (All) | ✓ (School) | ✓ (Office) | — | — | — | — | — | — |
| `message:send` | ✓ (All) | ✓ (School) | ✓ (Office) | ✓ (Class) | ✓ (Finance) | ✓ (Lib) | ✓ (Child) | ✓ (Self) | ✓ (Health) |
| `meeting:manage` | — | ✓ (School) | ✓ (Office) | — | — | — | — | — | — |
| `meeting:teacher:manage`| — | ✓ (School) | — | ✓ (Self) | — | — | — | — | — |
| `meeting:parent:manage` | — | — | — | — | — | — | ✓ (Child) | — | — |
| `report:read` | ✓ (All) | ✓ (School) | ✓ (Office) | — | — | — | — | — | — |
| `report:finance:read`| ✓ (All) | ✓ (School) | — | — | ✓ (Finance) | — | — | — | — |

---

## 3. Role × API Endpoint Matrix

Every mapped controller endpoint in Spring Boot enforces Method Security (`@PreAuthorize`) and parameter-level / entity-level ownership validation.

| Method | REST Endpoint | Authorized Roles | Required Permission / SpEL Rule | Ownership Enforcement |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | **Public (`permitAll`)** | None | Rate limited via Redis; brute-force protection. |
| `POST` | `/api/v1/auth/2fa/challenge/verify`| **Public (`permitAll`)** | None | Single-use expiring `tempToken` required. |
| `POST` | `/api/v1/auth/logout` | `isAuthenticated()` | None | Blacklists JWT token in Redis. |
| `GET` | `/api/v1/auth/me` | `isAuthenticated()` | None | Returns authenticated user profile, roles, permissions. |
| `POST` | `/api/v1/auth/change-password` | `isAuthenticated()` | None | Verifies old password; clears `firstLogin`. |
| `GET` | `/api/v1/users/me/badge-counts` | `isAuthenticated()` | None | Scoped badge counters per user role. |
| `GET` | `/api/v1/applications` | `ADMIN`, `DIRECTOR`, `SECRETARY` | `hasAnyRole('ADMIN', 'DIRECTOR', 'SECRETARY')` | School-wide admissions candidate list. |
| `GET` | `/api/v1/applications/{id}` | `ADMIN`, `DIRECTOR`, `SECRETARY` | `hasAnyRole('ADMIN', 'DIRECTOR', 'SECRETARY')` | Full application candidate dossier. |
| `POST` | `/api/v1/applications` | `ADMIN`, `DIRECTOR`, `SECRETARY` | `hasAuthority('application:write')` | Register candidate; validation rules enforced. |
| `PATCH`| `/api/v1/applications/{id}/status`| `ADMIN`, `DIRECTOR`, `SECRETARY` | `hasAuthority('application:write')` | State machine: PENDING -> REVIEW -> TEST -> ACCEPT. |
| `POST` | `/api/v1/applications/{id}/convert`| `ADMIN`, `DIRECTOR`, `SECRETARY` | `hasAuthority('application:write')` | Converts candidate into enrolled active Student. |
| `GET` | `/api/v1/students` | `ADMIN`, `DIRECTOR`, `SECRETARY`, `TEACHER` | `hasAnyRole('ADMIN', 'DIRECTOR', 'SECRETARY', 'TEACHER')` | Teachers scoped to assigned classes via repository filter. |
| `GET` | `/api/v1/students/{id}` | `ADMIN`, `DIRECTOR`, `SECRETARY`, `TEACHER`, `PARENT`, `STUDENT` | `@accessControlService.canAccessStudent(#id)` | IDOR: Parents only access own children; students self only. |
| `POST` | `/api/v1/students` | `ADMIN`, `DIRECTOR`, `SECRETARY` | `hasAuthority('student:write')` | Generates student matricule and records dossier. |
| `PUT` | `/api/v1/students/{id}` | `ADMIN`, `DIRECTOR`, `SECRETARY` | `hasAuthority('student:write')` | Updates contact, emergency, and personal info. |
| `DELETE`| `/api/v1/students/{id}` | `ADMIN`, `DIRECTOR` | `hasAuthority('student:delete')` | Soft delete / archive student record. |
| `GET` | `/api/v1/guardians/me/students` | `PARENT` | `hasRole('PARENT')` | Strictly returns authenticated guardian's children. |
| `GET` | `/api/v1/guardians` | `ADMIN`, `DIRECTOR`, `SECRETARY` | `hasAuthority('guardian:read')` | School-wide guardian directory. |
| `GET` | `/api/v1/guardians/{id}` | `ADMIN`, `DIRECTOR`, `SECRETARY`, `PARENT` | `@accessControlService.canAccessGuardian(#id)` | Parents only view own guardian record. |
| `GET` | `/api/v1/teachers` | `ADMIN`, `DIRECTOR`, `SECRETARY`, `TEACHER` | `hasAuthority('teacher:read')` | School faculty directory. |
| `GET` | `/api/v1/teachers/{id}` | `ADMIN`, `DIRECTOR`, `TEACHER` | `@accessControlService.canAccessTeacher(#id)` | Teachers view own record; director views all. |
| `GET` | `/api/v1/teachers/{id}/workload`| `ADMIN`, `DIRECTOR`, `TEACHER` | `@accessControlService.canAccessTeacher(#id)` | Weekly assigned hours and subjects workload. |
| `POST` | `/api/v1/teachers` | `ADMIN`, `DIRECTOR` | `hasAuthority('teacher:write')` | Create teacher employment profile. |
| `GET` | `/api/v1/staff` | `ADMIN`, `DIRECTOR`, `ACCOUNTANT` | `hasAuthority('staff:read')` | Administrative staff directory. |
| `POST` | `/api/v1/staff` | `ADMIN`, `DIRECTOR` | `hasAuthority('staff:write')` | Create administrative staff profile. |
| `GET` | `/api/v1/departments` | `ADMIN`, `DIRECTOR`, `SECRETARY`, `TEACHER` | `hasAuthority('department:read')` | Academic departments directory. |
| `POST` | `/api/v1/departments` | `ADMIN`, `DIRECTOR` | `hasAuthority('department:write')` | Create academic department. |
| `GET` | `/api/v1/academic-years` | `ADMIN`, `DIRECTOR`, `SECRETARY` | `hasAuthority('academics:manage')` | Academic years and term windows. |
| `POST` | `/api/v1/academic-years/{id}/activate` | `ADMIN`, `DIRECTOR` | `hasAuthority('academics:manage')` | Transactional single-active-year activation. |
| `GET` | `/api/v1/classes` | `ADMIN`, `DIRECTOR`, `SECRETARY`, `TEACHER` | `hasAuthority('class:read')` | Classes list; teachers filtered to assigned cohorts. |
| `POST` | `/api/v1/classes` | `ADMIN`, `DIRECTOR` | `hasAuthority('class:write')` | Create class cohort with student capacity cap. |
| `POST` | `/api/v1/classes/{id}/subjects`| `ADMIN`, `DIRECTOR` | `hasAuthority('class:write')` | Assign subject, weekly hours, and teacher. |
| `GET` | `/api/v1/subjects` | `ADMIN`, `DIRECTOR`, `SECRETARY`, `TEACHER` | `hasAuthority('subject:read')` | Subjects and coefficient schedule. |
| `GET` | `/api/v1/timetables` | `ADMIN`, `DIRECTOR`, `SECRETARY`, `TEACHER`, `PARENT`, `STUDENT` | `hasAuthority('timetable:read')` | Scoped to caller's class / teacher slots. |
| `POST` | `/api/v1/timetables/slots` | `ADMIN`, `DIRECTOR` | `hasAuthority('timetable:write')` | Enforces teacher/room/class conflict checking (HTTP 409). |
| `GET` | `/api/v1/attendance/classes/{classId}` | `ADMIN`, `DIRECTOR`, `SECRETARY`, `TEACHER` | `@accessControlService.canAccessClass(#classId)` | Teachers only access assigned classes. |
| `POST` | `/api/v1/attendance/roll-call` | `ADMIN`, `DIRECTOR`, `TEACHER` | `hasAuthority('attendance:write')` | Daily roll-call submission (Present/Absent/Late). |
| `GET` | `/api/v1/attendance/justifications` | `ADMIN`, `DIRECTOR`, `SECRETARY` | `hasAuthority('attendance:justify')` | Review pending absence notes and doctor certificates. |
| `PATCH`| `/api/v1/attendance/justifications/{id}/review` | `ADMIN`, `DIRECTOR`, `SECRETARY` | `hasAuthority('attendance:justify')` | Transitions absence record to `EXCUSED` upon approval. |
| `POST` | `/api/v1/attendance/students/{id}/justifications` | `PARENT` | `@accessControlService.canAccessStudent(#id)` | Parents upload absence proof for own child. |
| `GET` | `/api/v1/exams` | `ADMIN`, `DIRECTOR`, `TEACHER`, `PARENT`, `STUDENT` | `@accessControlService.canAccessExams()` | Scoped list of evaluations. |
| `POST` | `/api/v1/exams` | `ADMIN`, `DIRECTOR`, `TEACHER` | `hasAuthority('grade:write')` | Schedule exam in assigned subject/class. |
| `POST` | `/api/v1/exams/{id}/grades/batch` | `ADMIN`, `DIRECTOR`, `TEACHER` | `@accessControlService.canGradeExam(#id)` | Bulk grade entry with score / 20 validation. |
| `POST` | `/api/v1/exams/{id}/lock` | `ADMIN`, `DIRECTOR`, `TEACHER` | `hasAuthority('grade:write')` | Locks exam grades against further modification. |
| `GET` | `/api/v1/report-cards` | `ADMIN`, `DIRECTOR`, `SECRETARY`, `TEACHER`, `PARENT`, `STUDENT` | `@accessControlService.canAccessReportCards()` | Scoped: Parents view own children; students view self. |
| `POST` | `/api/v1/report-cards/generate` | `ADMIN`, `DIRECTOR` | `hasAuthority('reportcard:publish')` | Bulk compute term averages, rank, and mentions. |
| `GET` | `/api/v1/report-cards/students/{id}/pdf` | `ADMIN`, `DIRECTOR`, `TEACHER`, `PARENT`, `STUDENT` | `@accessControlService.canAccessStudent(#id)` | Download official OpenPDF bulletin with school stamp. |
| `GET` | `/api/v1/homework` | `ADMIN`, `DIRECTOR`, `TEACHER`, `PARENT`, `STUDENT` | `hasAuthority('homework:read')` | Scoped homework assignments. |
| `POST` | `/api/v1/homework` | `ADMIN`, `DIRECTOR`, `TEACHER` | `hasAuthority('homework:write')` | Create homework assignment with file attachment. |
| `POST` | `/api/v1/homework/{id}/submit` | `STUDENT` | `@accessControlService.canSubmitHomework(#id)` | Student uploads homework submission file. |
| `POST` | `/api/v1/homework/submissions/{id}/grade` | `ADMIN`, `DIRECTOR`, `TEACHER` | `@accessControlService.canGradeSubmission(#id)` | Grade student submission and provide feedback. |
| `GET` | `/api/v1/finances/invoices` | `ADMIN`, `DIRECTOR`, `ACCOUNTANT`, `SECRETARY` | `hasAnyRole('ADMIN', 'DIRECTOR', 'ACCOUNTANT', 'SECRETARY')` | List invoices; Secretary has read-only view. |
| `GET` | `/api/v1/finances/invoices/students/{id}` | `ADMIN`, `DIRECTOR`, `ACCOUNTANT`, `PARENT`, `STUDENT` | `@accessControlService.canAccessStudent(#id)` | Parents only view own child invoices; student self. |
| `POST` | `/api/v1/finances/invoices` | `ADMIN`, `DIRECTOR`, `ACCOUNTANT` | `hasAuthority('invoice:write')` | Create tuition invoice with discount rules. |
| `POST` | `/api/v1/finances/invoices/generate` | `ADMIN`, `DIRECTOR`, `ACCOUNTANT` | `hasAuthority('invoice:write')` | Bulk generate invoices for academic term. |
| `POST` | `/api/v1/finances/invoices/trigger-overdue-reminders` | `ADMIN`, `DIRECTOR`, `ACCOUNTANT` | `hasAuthority('invoice:manage')` | Trigger scheduled overdue reminder dispatch. |
| `GET` | `/api/v1/finances/payments` | `ADMIN`, `DIRECTOR`, `ACCOUNTANT`, `SECRETARY` | `hasAuthority('payment:read')` | List payment transactions. |
| `POST` | `/api/v1/finances/payments` | `ADMIN`, `DIRECTOR`, `ACCOUNTANT` | `hasAuthority('payment:write')` | Record tuition fee payment and allocate installments. |
| `GET` | `/api/v1/finances/payments/{id}/receipt`| `ADMIN`, `DIRECTOR`, `ACCOUNTANT`, `PARENT`, `STUDENT` | `@accessControlService.canAccessPayment(#id)` | Download official PDF payment receipt. |
| `GET` | `/api/v1/finances/expenses` | `ADMIN`, `DIRECTOR`, `ACCOUNTANT` | `hasAuthority('expense:read')` | List school operational expenses. |
| `POST` | `/api/v1/finances/expenses` | `ADMIN`, `DIRECTOR`, `ACCOUNTANT` | `hasAuthority('expense:write')` | Record operational expense. |
| `GET` | `/api/v1/finances/fee-types` | `ADMIN`, `DIRECTOR`, `ACCOUNTANT`, `SECRETARY`, `PARENT` | `hasAuthority('fee:manage')` | Read fee schedules and discount policies. |
| `GET` | `/api/v1/payroll` | `ADMIN`, `DIRECTOR`, `ACCOUNTANT` | `hasAuthority('payroll:manage')` | Staff payroll summary and monthly batches. |
| `GET` | `/api/v1/payroll/{id}/payslip` | `ADMIN`, `DIRECTOR`, `ACCOUNTANT`, `STAFF`, `TEACHER` | `@accessControlService.canAccessPayslip(#id)` | Staff/teachers download own PDF payslip. |
| `GET` | `/api/observations` | `ADMIN`, `DIRECTOR`, `TEACHER`, `PARENT` | `@accessControlService.canAccessObservationForStudent(#studentId)` | Observations: Teachers/Admin or parent of child. |
| `POST` | `/api/observations` | `ADMIN`, `DIRECTOR`, `TEACHER`, `PARENT` | `hasAuthority('observation:write')` | Record observation (flagged as TEACHER or PARENT). |
| `POST` | `/api/ai-analyses/generate` | `ADMIN`, `DIRECTOR`, `TEACHER` | `hasAuthority('ai:validate')` | Trigger LLM pedagogical analysis. |
| `GET` | `/api/ai-analyses/{id}` | `ADMIN`, `DIRECTOR`, `TEACHER`, `PARENT`, `STUDENT` | `@accessControlService.canAccessAnalysis(#id)` | Parents/students only see `PUBLISHED` analyses. |
| `POST` | `/api/ai-analyses/{id}/validate` | `ADMIN`, `DIRECTOR`, `TEACHER` | `hasAuthority('ai:validate')` | Review and approve AI analysis draft. |
| `POST` | `/api/ai-analyses/{id}/publish` | `ADMIN`, `DIRECTOR`, `TEACHER` | `hasAuthority('ai:validate')` | Publish AI strategy to student & parent portals. |
| `GET` | `/api/v1/documents/files/{fileKey}`| `isAuthenticated()` | `@accessControlService.canAccessDocument(#fileKey)` | Authenticated download with magic bytes & audit log. |
| `PATCH`| `/api/v1/documents/{id}/verify` | `ADMIN`, `DIRECTOR`, `SECRETARY` | `hasAuthority('document:verify')` | Approve or reject submitted legal document. |
| `GET` | `/api/v1/library/books` | `isAuthenticated()` | `hasAuthority('library:read')` | Browse book catalog. |
| `POST` | `/api/v1/library/books` | `ADMIN`, `DIRECTOR`, `LIBRARIAN` | `hasAuthority('library:write')` | Add book to catalog. |
| `POST` | `/api/v1/library/loans` | `ADMIN`, `DIRECTOR`, `LIBRARIAN` | `hasAuthority('library:loan:write')` | Issue loan to student/teacher. |
| `POST` | `/api/v1/library/loans/{id}/return` | `ADMIN`, `DIRECTOR`, `LIBRARIAN` | `hasAuthority('library:loan:write')` | Return book and calculate overdue fines. |
| `GET` | `/api/v1/reports/enrollment` | `ADMIN`, `DIRECTOR`, `SECRETARY` | `hasAuthority('report:read')` | Multi-criteria enrollment statistics. |
| `GET` | `/api/v1/reports/attendance` | `ADMIN`, `DIRECTOR`, `SECRETARY` | `hasAuthority('report:read')` | Absence trends and class attendance rates. |
| `GET` | `/api/v1/reports/academic` | `ADMIN`, `DIRECTOR` | `hasAuthority('report:read')` | School grade distribution and failure risk report. |
| `GET` | `/api/v1/reports/finance` | `ADMIN`, `DIRECTOR`, `ACCOUNTANT` | `hasAuthority('report:finance:read')` | Revenue, collection rate, and cash-flow report. |
| `GET` | `/api/v1/audit-logs` | `ADMIN`, `SUPER_ADMIN`, `DIRECTOR` | `hasAuthority('audit:read')` | Search and export security audit trail. |
| `POST` | `/api/v1/admin/backups/trigger` | `SUPER_ADMIN`, `ADMIN` | `hasAuthority('system:backup')` | Trigger scheduled database backup. |

---

## 4. Object-Level Ownership & Security Architecture

1. **IDOR Prevention (`AccessControlService`):**
   * Endpoint URLs containing `{id}` or `{studentId}` never rely solely on role checks.
   * `AccessControlService.java` executes dynamic ownership checks:
     ```java
     // Guardian ownership check
     public boolean canAccessStudent(Long studentId) {
         if (hasAnyRole("ADMIN", "DIRECTOR", "SECRETARY")) return true;
         User user = getAuthenticatedUser();
         if (hasRole("PARENT")) {
             return guardianRepository.existsByUserIdAndStudents_Id(user.getId(), studentId);
         }
         if (hasRole("STUDENT")) {
             return studentRepository.existsByUserIdAndId(user.getId(), studentId);
         }
         if (hasRole("TEACHER")) {
             return classSubjectTeacherRepository.isTeacherAssignedToStudent(user.getId(), studentId);
         }
         return false;
     }
     ```

2. **Pedagogical AI Safeguards:**
   * Parental consent (`PERM_READ_CONSENT`, `PERM_WRITE_CONSENT`) is verified server-side prior to invoking LLM generation.
   * Prompts are pseudonymized (no student names, emails, or phone numbers transmitted to LLM API).
   * Unpublished drafts (`status = DRAFT`) are strictly blocked from student and parent endpoints.

3. **Multi-Tenant Platform Boundary (Super Admin):**
   * School directors and personnel are scoped strictly to their `school_id` foreign key.
   * Only `ROLE_SUPER_ADMIN` has multi-tenant query privileges (`WHERE school_id IS NULL` or cross-school joins).
