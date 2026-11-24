# Role & Permissions Matrix — School Management System

This permissions matrix is derived from Section 3 ("Acteurs et rôles du système") of the functional specification (`docs/spec.pdf`). It establishes the strict method-level security (`@PreAuthorize`) and object-level ownership requirements implemented across all REST API endpoints.

---

## 1. System Roles

| Role Code | Role Name (FR) | Description & Scope |
|---|---|---|
| `ROLE_ADMIN` | Administrateur Système | Full super-admin authority across all modules, user administration, security audit logs, backups, and configuration. |
| `ROLE_STAFF` | Personnel / Secrétaire | School administration, admissions processing, student dossiers, document verification, announcements, and events. |
| `ROLE_TEACHER` | Enseignant | Grade entry, homework management, class observations, course materials, viewing assigned student timetables. |
| `ROLE_PARENT` | Parent / Tuteur Légal | Strictly scoped to own enrolled children: attendance, report cards, grades, homework, invoices/receipts, messaging. |
| `ROLE_STUDENT` | Élève / Étudiant | Strictly scoped to own profile: timetable, homework, grades, report cards, learning strategy, borrowing books. |
| `ROLE_LIBRARIAN` | Bibliothécaire | Management of book catalog, loans, returns, and inventory. |

---

## 2. Endpoint Authorization Matrix

### Authentication & Account (`/api/v1/auth`)

| Method | Endpoint | Authorized Roles | Description / Security Notes |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | **Public (`permitAll`)** | Email/password login with Redis rate limiting and account lockout. |
| `POST` | `/api/v1/auth/forgot-password` | **Public (`permitAll`)** | Password reset request; anti-enumeration timing-safe response. |
| `POST` | `/api/v1/auth/reset-password` | **Public (`permitAll`)** | Single-use expiring token password reset. |
| `POST` | `/api/v1/auth/google` | **Public (`permitAll`)** | Google OAuth2 PKCE login. |
| `GET` | `/api/v1/auth/google/config` | **Public (`permitAll`)** | Returns public Google Client ID. |
| `POST` | `/api/v1/auth/google/link` | `isAuthenticated()` | Links Google account to authenticated user. |
| `POST` | `/api/v1/auth/refresh` | **Public (`permitAll`)** | Refresh token rotation. |
| `POST` | `/api/v1/auth/logout` | `isAuthenticated()` | Blacklists current access token in Redis. |
| `GET` | `/api/v1/auth/me` | `isAuthenticated()` | Returns current user profile, roles, and permissions. |
| `POST` | `/api/v1/auth/change-password` | `isAuthenticated()` | Password update with first-login clearance. |

---

### Admissions & Applications (`/api/v1/applications`, `/api/v1/public/applications`)

| Method | Endpoint | Authorized Roles | Description / Security Notes |
|---|---|---|---|
| `POST` | `/api/v1/public/applications` | **Public (`permitAll`)** | Public student candidate application submission. |
| `GET` | `/api/v1/applications` | `ADMIN`, `STAFF` | List candidate applications with search and filters. |
| `GET` | `/api/v1/applications/{id}` | `ADMIN`, `STAFF` | View full application dossier, candidate info, and documents. |
| `PATCH` | `/api/v1/applications/{id}/status`| `ADMIN`, `STAFF` | Progress candidate pipeline (Under Review, Interview, etc.). |
| `POST` | `/api/v1/applications/{id}/decision`| `ADMIN`, `STAFF` | Record final decision (Accept, Waitlist, Reject). |
| `POST` | `/api/v1/applications/{id}/convert`| `ADMIN`, `STAFF` | Convert accepted application to active `Student` and generate matricule. |

---

### Students & Dossiers (`/api/v1/students`)

| Method | Endpoint | Authorized Roles | Description / Security Notes |
|---|---|---|---|
| `GET` | `/api/v1/students` | `ADMIN`, `STAFF` | Search and list student directory (teachers scoped in Wave 2). |
| `GET` | `/api/v1/students/{id}` | `ADMIN`, `STAFF`, `TEACHER`, `PARENT`, `STUDENT` | IDOR protected: parents see only own children, students see only self. |
| `POST` | `/api/v1/students` | `ADMIN`, `STAFF` | Register new student profile. |
| `PUT` | `/api/v1/students/{id}` | `ADMIN`, `STAFF` | Update student profile and contact details. |
| `DELETE` | `/api/v1/students/{id}` | `ADMIN` | Soft delete / archive student record. |

---

### Guardians & Parents (`/api/v1/guardians`)

| Method | Endpoint | Authorized Roles | Description / Security Notes |
|---|---|---|---|
| `GET` | `/api/v1/guardians` | `ADMIN`, `STAFF` | Search and list guardians directory. |
| `GET` | `/api/v1/guardians/{id}` | `ADMIN`, `STAFF`, `PARENT` | IDOR protected: parents can only view their own guardian record. |
| `GET` | `/api/v1/guardians/me/students` | `PARENT` | Returns strictly the authenticated guardian's children. |
| `GET` | `/api/v1/guardians/my-children` | `PARENT` | Alias for `/me/students`. |
| `GET` | `/api/v1/guardians/{id}/students` | `ADMIN`, `STAFF`, `PARENT` | IDOR protected: parent can only query their own guardian ID. |
| `POST` | `/api/v1/guardians` | `ADMIN`, `STAFF` | Create guardian record and link to student. |

---

### Teachers & Staff (`/api/v1/teachers`, `/api/v1/staff`)

| Method | Endpoint | Authorized Roles | Description / Security Notes |
|---|---|---|---|
| `GET` | `/api/v1/teachers` | `ADMIN`, `STAFF` | List teachers directory. |
| `GET` | `/api/v1/teachers/{id}` | `ADMIN`, `STAFF`, `TEACHER` | IDOR protected: teachers can view own record; admin/staff view all. |
| `POST` | `/api/v1/teachers` | `ADMIN` | Create teacher profile. |
| `PUT` | `/api/v1/teachers/{id}` | `ADMIN` | Update teacher profile and department. |
| `DELETE` | `/api/v1/teachers/{id}` | `ADMIN` | Archive teacher record. |
| `GET` | `/api/v1/staff` | `ADMIN`, `STAFF` | List administrative staff. |
| `GET` | `/api/v1/staff/{id}` | `ADMIN`, `STAFF` | Get staff details by ID. |
| `POST` | `/api/v1/staff` | `ADMIN` | Create administrative staff profile. |
| `PUT` | `/api/v1/staff/{id}` | `ADMIN` | Update staff record. |
| `DELETE` | `/api/v1/staff/{id}` | `ADMIN` | Archive staff record. |

---

### Departments (`/api/v1/departments`)

| Method | Endpoint | Authorized Roles | Description / Security Notes |
|---|---|---|---|
| `GET` | `/api/v1/departments` | `ADMIN`, `STAFF`, `TEACHER` | List academic departments. |
| `GET` | `/api/v1/departments/{id}` | `ADMIN`, `STAFF`, `TEACHER` | Get department details and assigned teachers. |
| `POST` | `/api/v1/departments` | `ADMIN` | Create new department. |
| `PUT` | `/api/v1/departments/{id}` | `ADMIN` | Update department details. |
| `DELETE` | `/api/v1/departments/{id}` | `ADMIN` | Delete department (prevented if assigned teachers exist). |

---

### Legal Documents (`/api/v1/documents`)

| Method | Endpoint | Authorized Roles | Description / Security Notes |
|---|---|---|---|
| `POST` | `/api/v1/documents` | `isAuthenticated()` | Upload legal document (magic bytes content sniffing enforced). |
| `GET` | `/api/v1/documents/{id}` | `ADMIN`, `STAFF`, `PARENT`, `STUDENT`, `TEACHER` | IDOR protected: owner, linked guardian, or admin/staff. |
| `GET` | `/api/v1/documents/my-documents`| `isAuthenticated()` | Returns documents belonging to current authenticated user. |
| `GET` | `/api/v1/documents/user/{userId}`| `ADMIN`, `STAFF`, `PARENT` | IDOR protected: parents only see their children's documents. |
| `PATCH` | `/api/v1/documents/{id}/verify`| `ADMIN`, `STAFF` | Approve or reject submitted document with reason. |
| `GET` | `/api/v1/documents/files/{fileKey}`| `isAuthenticated()` | **P0:** Authenticated download; verifies HMAC + owner/guardian/admin check; audit logged. |

---

### Exams & Grades (`/api/v1/exams`, `/api/v1/grades`, `/api/v1/report-cards`)

| Method | Endpoint | Authorized Roles | Description / Security Notes |
|---|---|---|---|
| `GET` | `/api/v1/exams` | `ADMIN`, `STAFF`, `TEACHER`, `STUDENT`, `PARENT` | Scoped list of exams. |
| `GET` | `/api/v1/exams/{id}` | `ADMIN`, `STAFF`, `TEACHER`, `STUDENT`, `PARENT` | Exam details. |
| `POST` | `/api/v1/exams` | `ADMIN`, `TEACHER` | Schedule examination. |
| `PUT` | `/api/v1/exams/{id}` | `ADMIN`, `TEACHER` | Update exam details. |
| `DELETE` | `/api/v1/exams/{id}` | `ADMIN`, `TEACHER` | Cancel/delete exam. |
| `POST` | `/api/v1/exams/{id}/publish` | `ADMIN`, `TEACHER` | Publish exam results. |
| `GET` | `/api/v1/exams/{id}/grades` | `ADMIN`, `STAFF`, `TEACHER` | View full grade grid for exam. |
| `POST` | `/api/v1/exams/{id}/grades` | `ADMIN`, `TEACHER` | Bulk enter/save exam grades. |
| `GET` | `/api/v1/report-cards/students/{studentId}`| `ADMIN`, `STAFF`, `TEACHER`, `PARENT`, `STUDENT` | IDOR protected: parents see only own children, students see only self. |
| `GET` | `/api/v1/report-cards/students/{studentId}/pdf`| `ADMIN`, `STAFF`, `TEACHER`, `PARENT`, `STUDENT` | IDOR protected PDF report card download. |

---

### Finance & Invoices (`/api/v1/finances`)

| Method | Endpoint | Authorized Roles | Description / Security Notes |
|---|---|---|---|
| `GET` | `/api/v1/finances/invoices` | `ADMIN`, `STAFF` | List all school invoices with filters. |
| `GET` | `/api/v1/finances/invoices/students/{studentId}` | `ADMIN`, `STAFF`, `PARENT`, `STUDENT` | IDOR protected: parents only see own children's invoices; students see self. |
| `GET` | `/api/v1/finances/invoices/{id}` | `ADMIN`, `STAFF`, `PARENT`, `STUDENT` | IDOR protected: verified against caller's student/guardian link. |
| `POST` | `/api/v1/finances/invoices` | `ADMIN`, `STAFF` | Create invoice. |
| `PUT` | `/api/v1/finances/invoices/{id}` | `ADMIN`, `STAFF` | Update invoice lines / discount. |
| `DELETE` | `/api/v1/finances/invoices/{id}` | `ADMIN`, `STAFF` | Delete unpaid invoice. |
| `POST` | `/api/v1/finances/invoices/generate` | `ADMIN`, `STAFF` | Periodic bulk invoice generation. |
| `GET` | `/api/v1/finances/payments` | `ADMIN`, `STAFF` | List school payment transactions. |
| `GET` | `/api/v1/finances/payments/{id}` | `ADMIN`, `STAFF`, `PARENT`, `STUDENT` | IDOR protected payment receipt view. |
| `GET` | `/api/v1/finances/payments/{id}/receipt`| `ADMIN`, `STAFF`, `PARENT`, `STUDENT` | IDOR protected PDF receipt download. |
| `POST` | `/api/v1/finances/payments` | `ADMIN`, `STAFF` | Record fee payment transaction. |
| `GET` | `/api/v1/finances/expenses` | `ADMIN`, `STAFF` | List institutional expenses. |
| `POST` | `/api/v1/finances/expenses` | `ADMIN`, `STAFF` | Record operational expense. |
| `GET` | `/api/v1/finances/fee-types` | `ADMIN`, `STAFF`, `PARENT` | Read fee schedule. |
| `POST` | `/api/v1/finances/fee-types` | `ADMIN` | Manage fee structure. |

---

### Communication & Messaging (`/api/v1/announcements`, `/api/v1/messages`, `/api/v1/events`, `/api/v1/notifications`)

| Method | Endpoint | Authorized Roles | Description / Security Notes |
|---|---|---|---|
| `GET` | `/api/v1/announcements` | `isAuthenticated()` | Scoped announcements based on user role/target. |
| `POST` | `/api/v1/announcements` | `ADMIN`, `STAFF` | Publish school announcement. |
| `GET` | `/api/v1/messages/inbox` | `isAuthenticated()` | User's personal inbox (IDOR: only user's received messages). |
| `GET` | `/api/v1/messages/sent` | `isAuthenticated()` | User's sent messages (IDOR: only user's sent messages). |
| `POST` | `/api/v1/messages` | `isAuthenticated()` | Send direct message. |
| `GET` | `/api/v1/messages/{id}` | `isAuthenticated()` | IDOR protected: caller must be sender or recipient. |
| `GET` | `/api/v1/events` | `isAuthenticated()` | Calendar events. |
| `POST` | `/api/v1/events` | `ADMIN`, `STAFF` | Create school event. |
| `GET` | `/api/v1/notifications` | `isAuthenticated()` | User's in-app notification feed. |
| `PATCH` | `/api/v1/notifications/{id}/read`| `isAuthenticated()` | IDOR protected: caller must own notification. |

---

### Homework & Resources (`/api/v1/homework`)

| Method | Endpoint | Authorized Roles | Description / Security Notes |
|---|---|---|---|
| `GET` | `/api/v1/homework` | `ADMIN`, `STAFF`, `TEACHER`, `STUDENT`, `PARENT` | Scoped homework list. |
| `GET` | `/api/v1/homework/{id}` | `ADMIN`, `STAFF`, `TEACHER`, `STUDENT`, `PARENT` | Homework details and attachments. |
| `POST` | `/api/v1/homework` | `ADMIN`, `TEACHER` | Create homework assignment. |
| `PUT` | `/api/v1/homework/{id}` | `ADMIN`, `TEACHER` | Update assignment. |
| `DELETE` | `/api/v1/homework/{id}` | `ADMIN`, `TEACHER` | Delete assignment. |

---

### Pedagogical AI & Observations (`/api/observations`, `/api/ai-analyses`, `/api/learning-strategies`, `/api/ai-consents`)

| Method | Endpoint | Authorized Roles | Description / Security Notes |
|---|---|---|---|
| `GET` | `/api/observations` | `ADMIN`, `STAFF`, `TEACHER`, `PARENT` | List observations for authorized students. |
| `POST` | `/api/observations` | `ADMIN`, `STAFF`, `TEACHER`, `PARENT` | Record pedagogical observation. |
| `GET` | `/api/observations/{id}` | `ADMIN`, `STAFF`, `TEACHER`, `PARENT` | IDOR protected: author, parent of student, teacher of student, or admin. |
| `POST` | `/api/ai-analyses/generate` | `ADMIN`, `STAFF`, `TEACHER` | Trigger asynchronous LLM pedagogical analysis. |
| `GET` | `/api/ai-analyses/{id}` | `ADMIN`, `STAFF`, `TEACHER`, `PARENT`, `STUDENT` | IDOR protected: parents and students only see PUBLISHED analyses. |
| `POST` | `/api/ai-analyses/{id}/validate`| `ADMIN`, `STAFF`, `TEACHER` | Validate analysis draft. |
| `POST` | `/api/ai-analyses/{id}/publish` | `ADMIN`, `STAFF`, `TEACHER` | Publish analysis to parent and student portals. |
| `GET` | `/api/learning-strategies` | `ADMIN`, `STAFF`, `TEACHER`, `PARENT`, `STUDENT` | Scoped learning strategies. |
| `GET` | `/api/ai-consents` | `ADMIN`, `STAFF`, `PARENT` | Scoped parental AI processing consent. |

---

### Library (`/api/v1/library`)

| Method | Endpoint | Authorized Roles | Description / Security Notes |
|---|---|---|---|
| `GET` | `/api/v1/library/books` | `isAuthenticated()` | Search book catalog. |
| `POST` | `/api/v1/library/books` | `ADMIN`, `LIBRARIAN` | Add book to catalog. |
| `PUT` | `/api/v1/library/books/{id}` | `ADMIN`, `LIBRARIAN` | Update book details. |
| `DELETE` | `/api/v1/library/books/{id}`| `ADMIN`, `LIBRARIAN` | Remove book from catalog. |
| `GET` | `/api/v1/library/loans` | `ADMIN`, `LIBRARIAN` | View all active/past loans. |
| `GET` | `/api/v1/library/loans/my-loans`| `isAuthenticated()` | Current user's loans. |
| `POST` | `/api/v1/library/loans` | `ADMIN`, `LIBRARIAN` | Issue book loan. |
| `POST` | `/api/v1/library/loans/{id}/return`| `ADMIN`, `LIBRARIAN` | Return book loan. |

---

### Audit Logs & System Administration (`/api/v1/audit-logs`)

| Method | Endpoint | Authorized Roles | Description / Security Notes |
|---|---|---|---|
| `GET` | `/api/v1/audit-logs` | `ADMIN` | Search and filter immutable security audit logs. |
| `GET` | `/api/v1/audit-logs/{id}` | `ADMIN` | View audit log event details. |
| `GET` | `/api/v1/audit-logs/user/{userId}`| `ADMIN` | Filter audit logs by actor. |
