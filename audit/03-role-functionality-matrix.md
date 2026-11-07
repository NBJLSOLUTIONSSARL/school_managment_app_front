# 03 - Complete Role-Functionality & Permissions Matrix

This matrix maps every backend role to its data access boundaries, UI modules, CRUD operations, and endpoints, verified directly against Spring Security `@PreAuthorize` rules.


---

## 1. Role Profiles & Security Context
| Role | Seeded Account | ID | Scope & Purpose | Security Enforcements |
|---|---|---|---|---|
| `ROLE_ADMIN` | `admin@school.edu` | 1 | Full system administration, HR, finance, audits, global academic oversight | Unrestricted system-wide privileges |
| `ROLE_STAFF` | `staff@school.edu` | 6 | Operational management: admissions, students, guardians, departments, finances | Forbidden: `/audit-logs`, cannot edit/approve other staff leave requests |
| `ROLE_TEACHER`| `professeur@school.edu`| 2 | Faculty member: exams, grading, report cards, homework grading | Forbidden: `/v1/finances/**`, `/v1/applications`, `/audit-logs`, cannot modify other teachers' profiles |
| `ROLE_STUDENT`| `eleve@school.edu` | 9 | Enrolled learner: homework submissions, personal grades, report card PDF | Read-only own data, submit homework, view schedule, forbidden administrative modules |
| `ROLE_PARENT` | `parent@school.edu` | 7 | Guardian: linked children's reports, pedagogical AI observations, consent | Restricted to children where `isGuardianOf(guardianId, studentId)` holds |

---

## 2. Module-by-Module Role Permission Matrix

| Functional Module | ROLE_ADMIN | ROLE_STAFF | ROLE_TEACHER | ROLE_STUDENT | ROLE_PARENT | Supporting Endpoints |
|---|---|---|---|---|---|---|
| **Dashboard** | Full School & Finances | Admissions & Invoices | Assigned Exams & Dept | Academic Progress & Homework | Linked Children Academic Progress | Live aggregated counts |
| **Students Directory** | Full CRUD + Guardian link | Full CRUD + Guardian link | View Directory | View Self Profile Only | View Linked Children Only | `/api/v1/students` |
| **Faculty (Teachers)** | Full CRUD | View Directory | View Directory + Edit Self | Forbidden (403) | Forbidden (403) | `/api/v1/teachers` |
| **Staff Directory** | Full CRUD | View Directory + Edit Self | Forbidden (403) | Forbidden (403) | Forbidden (403) | `/api/v1/staff` |
| **Guardians (Tuteurs)**| Full CRUD | Full CRUD | Forbidden (403) | Forbidden (403) | View Self Profile | `/api/v1/guardians` |
| **Departments** | Full CRUD | Create, Edit, View | View Directory | Forbidden (403) | Forbidden (403) | `/api/v1/departments` |
| **Admissions & Applications** | Full Management & Convert | Full Management & Convert | Forbidden (403) | Forbidden (403) | Forbidden (403) | `/api/v1/applications` |
| **Finances - Factures**| Full CRUD, Lines, Batch Gen | Full CRUD, Lines, Batch Gen | Forbidden (403) | Forbidden (403) | Forbidden (403) | `/api/v1/finances/invoices` |
| **Finances - Paiements**| Record & View Receipts | Record & View Receipts | Forbidden (403) | Forbidden (403) | Forbidden (403) | `/api/v1/finances/payments` |
| **Finances - Dépenses** | Full CRUD | Full CRUD | Forbidden (403) | Forbidden (403) | Forbidden (403) | `/api/v1/finances/expenses` |
| **Finances - Frais** | Full CRUD | Full CRUD | Forbidden (403) | Forbidden (403) | Forbidden (403) | `/api/v1/finances/fee-types` |
| **Examens & Évaluations**| Full CRUD, Lock, Grades | Create, Edit, Lock, View | Full CRUD, Lock, Batch Grade | View Schedule & Dates | View Schedule & Dates | `/api/v1/exams` |
| **Saisie des Notes** | Batch Entry & Lock | View Grades | Batch Entry & Lock | View Own Grades | View Children's Grades | `/api/v1/exams/{id}/grades` |
| **Devoirs (Homework)** | View & Grade Submissions | View Submissions | Grade & Review | Submit Work & View Own | View Children Submissions | `/api/v1/homework` |
| **Bulletins Scolaires** | Generate, View, Download | Generate, View, Download | Generate, View, Download | View Own, Download PDF | View Children, Download PDF | `/api/v1/report-cards` |
| **Annonces** | Create, Update, Delete, View | View Staff/All | View Teacher/All | View Student/All | View Parent/All | `/api/announcements` |
| **Événements** | Full CRUD | View All | View All | View All | View All | `/api/events` |
| **Messagerie Interne** | Send, Receive, Read, Delete | Send, Receive, Read, Delete | Send, Receive, Read, Delete | Send, Receive, Read, Delete | Send, Receive, Read, Delete | `/api/messages` |
| **Notifications** | Create Global, View Own | View Own | View Own | View Own | View Own | `/api/notifications` |
| **Demandes de Congé** | View All, Approve, Reject | Create & View Own | Create & View Own | Submit Absence Justification | Forbidden (403) | `/api/leave-requests` |
| **Journal d'Audit** | Full View & Search Filters | Forbidden (403) | Forbidden (403) | Forbidden (403) | Forbidden (403) | `/api/audit-logs` |
| **IA - Observations** | View & Create | Forbidden (403) | View & Create | Forbidden (403) | Create & View for Child | `/api/observations` |
| **IA - Consentements** | View All | View All | Forbidden (403) | Forbidden (403) | Grant & Revoke for Child | `/api/ai-consents` |
| **IA - Analyses** | Run & Validate | Forbidden (403) | Run & Validate | View Own Analysis | View Children Analysis | `/api/ai-analyses` |
| **IA - Stratégies** | Create & Edit | Forbidden (403) | Create & Edit | View Own Strategies | View Children Strategies | `/api/learning-strategies` |
| **Profil & Documents** | Edit Self, Upload Docs | Edit Self, Upload Docs | Edit Self, Upload Docs | Edit Self, Upload Docs | Edit Self, Upload Docs | `/api/v1/documents` |