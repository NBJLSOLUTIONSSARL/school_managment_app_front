# 06 — Role-Based Application Audit

## 1. Overview
The application supports five distinct backend user roles:
1. `ROLE_ADMIN` (School Director / Super Administrator)
2. `ROLE_TEACHER` (Faculty Instructor)
3. `ROLE_STUDENT` (Enrolled Pupil)
4. `ROLE_PARENT` (Guardian / Family Representative)
5. `ROLE_STAFF` (Administrative & Operations Staff)

---

## 2. Role-by-Role Navigation & Access Matrix

### 2.1 `ROLE_ADMIN`
- **Dashboard**: `AdminDashboard` with full school statistics, quick KPIs, student enrollment figures, recent applications, and quick links.
- **Accessible Modules**:
  - Étudiants (`/students`), Enseignants (`/teachers`), Personnel (`/staff`), Tuteurs (`/guardians`), Départements (`/departments`), Admissions (`/admissions`), Facturation (`/finances/invoices`), Examens (`/exams`), Notes (`/grades`), Devoirs (`/homework`), Bulletins (`/report-cards`), Observations & Consentements & Analyses (`/observations`, `/consents`, `/analyses`), Annonces (`/announcements`), Événements (`/events`), Messagerie (`/messages`), Congés (`/leave-requests`), Journal d'Audit (`/audit-logs`).
- **Sidebar Count**: 18 active modules.
- **Verification**: Complete access verified without permission denied or rendering errors.

### 2.2 `ROLE_TEACHER`
- **Dashboard**: `TeacherDashboard` showing assigned classes, teaching schedule, pending homework submissions, and today's agenda.
- **Accessible Modules**:
  - Étudiants (`/students`), Enseignants (`/teachers`), Départements (`/departments`), Examens (`/exams`), Notes (`/grades`), Devoirs (`/homework`), Bulletins (`/report-cards`), Annonces (`/announcements`), Événements (`/events`), Messagerie (`/messages`), Congés (`/leave-requests`).
- **Restricted Modules**:
  - Personnel (`/staff`), Tuteurs (`/guardians`), Admissions (`/admissions`), Facturation (`/finances/invoices`), Journal d'Audit (`/audit-logs`), Observations & Consentements IA.
- **Verification**: Unauthorized routes trigger `ForbiddenPage` (`/403`) or hide from the sidebar as expected.

### 2.3 `ROLE_STUDENT`
- **Dashboard**: `StudentDashboard` showing student courses, upcoming exams, homework deadlines, attendance overview, and grade summary.
- **Accessible Modules**:
  - Examens (`/exams`), Devoirs (`/homework`), Bulletins (`/report-cards`), Analyses Pédagogiques (`/analyses`), Annonces (`/announcements`), Événements (`/events`), Messagerie (`/messages`), Congés (`/leave-requests`).
- **Restricted Modules**:
  - Direct management routes (Étudiants, Enseignants, Personnel, Tuteurs, Facturation, Admissions, Audit).
- **Verification**: Student view displays student-scoped data without leaking school administrative controls.

### 2.4 `ROLE_PARENT`
- **Dashboard**: `ParentDashboard` with multi-child selector, invoice balance overview, attendance notifications, report cards, and school announcements.
- **Accessible Modules**:
  - Examens (`/exams`), Devoirs (`/homework`), Bulletins (`/report-cards`), Observations Pédagogiques (`/observations`), Consentements IA (`/consents`), Analyses Pédagogiques (`/analyses`), Annonces (`/announcements`), Événements (`/events`), Messagerie (`/messages`).
- **Restricted Modules**:
  - Direct school management, staff directories, audit logs, admissions processing.
- **Verification**: Verified multi-child switching and child-specific academic tracking.

### 2.5 `ROLE_STAFF`
- **Dashboard**: `StaffDashboard` with operational counters, maintenance requests, attendance recording, and admissions intake.
- **Accessible Modules**:
  - Étudiants (`/students`), Enseignants (`/teachers`), Personnel (`/staff`), Tuteurs (`/guardians`), Départements (`/departments`), Admissions (`/admissions`), Facturation (`/finances/invoices`), Examens (`/exams`), Notes (`/grades`), Devoirs (`/homework`), Bulletins (`/report-cards`), Annonces (`/announcements`), Événements (`/events`), Messagerie (`/messages`), Congés (`/leave-requests`).
- **Restricted Modules**:
  - Journal d'Audit (`/audit-logs`), Consentements IA.
- **Verification**: Verified administrative operations and billing view access.

---

## 3. Quick Account Switcher (Testing & Evaluation)
The login screen (`/login`) includes dedicated one-click buttons allowing immediate switching between each of the 5 roles during evaluation:
- `Directeur (Admin)`
- `Enseignant (Teacher)`
- `Élève (Student)`
- `Parent (Tuteur)`
- `Personnel (Staff)`
