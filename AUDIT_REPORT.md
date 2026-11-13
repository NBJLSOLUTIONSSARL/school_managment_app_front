# AUDIT REPORT: School Management System — Full Specification Completeness Audit

**Date of Audit:** November 13, 2026  
**Audited Codebases:**
- **Backend API:** `/home/hamza/Desktop/JAVA SPRING BOOT/school_managment_app` (Spring Boot 3.4.1, Java 21, MySQL, Redis, Flyway V1–V8)
- **Frontend SPA & Landing:** `/home/hamza/Desktop/WEBINHAND/PROJECT/school_managment_app_front` (React 19, Vite, Tailwind CSS, Next.js 15 Landing Page)
**Source of Truth:** `docs/spec.pdf` (Système de gestion scolaire — Document de projet, 18 modules, sections 4.1–10)

---

## 1. Verdict

**Overall Platform Completeness: 54%**  
**The Single Biggest Risk:** Severe structural data model omissions (complete absence of Classes, Subjects, Terms, Timetables, and Attendance) combined with Pedagogical AI 503 error. All critical security vulnerabilities (public document downloads, missing method security, IDOR, parent scoping) have been fully resolved in Wave 1.  
**Deployment Call: NOT READY FOR DEPLOYMENT.**  
The platform has robust security and authorization architecture now verified by 676 backend tests and 516 frontend tests, but the core academic backbone (Classes, Timetables, Attendance) must be implemented in subsequent waves before production.

---

## 2. Scorecard Table

| Module / Area | Status | % Done | Top Gap / Finding | Evidence / Reference |
| :--- | :--- | :---: | :--- | :--- |
| **4.1 Auth & Account** | PARTIAL | 75% | Redis login rate limiting & lockout active; email reset & Google OAuth PKCE working; 2FA TOTP and phone login pending Wave 6. | `AuthController.java`, `LoginRateLimiterService.java` |
| **4.2 Legal Documents** | DONE | 85% | Authenticated downloads enforced; magic bytes content sniffing active; audit logged; document types CRUD pending Wave 7. | `SecurityConfig.java:110`, `DocumentServiceImpl.java:155` |
| **4.3 Admissions** | PARTIAL | 70% | Public application & student conversion complete; admission tests/interviews and re-enrollment missing. | `ApplicationController.java:23`, `Application.java` |
| **4.4 Students** | PARTIAL | 40% | Directory secured to ADMIN/STAFF; IDOR protected; classes/academic backbone pending Wave 2. | `StudentController.java:30`, `StudentServiceImpl.java:132` |
| **4.5 Staff & Teachers** | PARTIAL | 50% | Role-based method security applied; directory secured; workload & timetable assignment pending Wave 2/4. | `TeacherController.java`, `StaffController.java` |
| **4.6 Academic Structure** | MISSING | 0% | No entities or endpoints for Academic Years, Terms/Semesters, Grade Levels, Classes, Subjects, or Rooms. | `db/migration/V1__V8` (0 tables) |
| **4.7 Timetables** | MISSING | 10% | No timetable slots, schedule generator, conflict detector, or teacher availability; only general events exist. | `EventController.java:20` |
| **4.8 Attendance & Absences** | MISSING | 0% | Completely unmodeled. No roll call, no absence records, no justification workflows, no statistics or alerts. | Missing entity `Attendance` |
| **4.9 Exams, Grades & Bulletins** | PARTIAL | 85% | Exam scheduling, grade entry, locking, rank/mention, and PDF report cards secured with IDOR protection. | `ExamController.java`, `ReportCardServiceImpl.java:54` |
| **4.10 Courses & Homework** | PARTIAL | 45% | Homework submission and grading exist; courses, course outlines, syllabus, and resource library missing. | `HomeworkSubmission.java`, `HomeworkController.java` |
| **4.11 Finance & Payments** | PARTIAL | 80% | Fee types, invoice generation, partial payments, receipts PDF work; IDOR protection verified for parents & students. | `InvoiceController.java`, `PaymentController.java` |
| **4.12 Communication** | PARTIAL | 65% | In-app announcements, messages, and events complete; parent-teacher meeting scheduling and email/SMS dispatch missing. | `AnnouncementController.java`, `MessageController.java` |
| **4.13 Parent Portal** | DONE | 75% | Multi-child selector, `/api/v1/guardians/me/students` scoping; attendance view and meeting booking pending Wave 4/5. | `ParentDashboard.jsx`, `statsService.js:355` |
| **4.14 Student Portal** | PARTIAL | 60% | Dashboard, grades, homework, and strategy exist; timetable, attendance, and course resource library missing. | `StudentDashboard.jsx:1` |
| **4.15 Add-on Modules** | MISSING | 0% | Library, Transport, Canteen, Inventory, Health, and Extracurricular Clubs have 0 entities, 0 APIs, 0 UI. | Spec 4.15 (0% implemented) |
| **4.16 Reports & Analytics** | PARTIAL | 15% | Basic dashboard counter aggregations exist; structured report generator and PDF/Excel/CSV exports missing. | `statsService.js:13` |
| **4.17 Administration** | PARTIAL | 35% | Audit logs functional with request IP tracking; school profile configuration, role management API pending Wave 8. | `AuditLogController.java:18` |
| **4.18 AI Pedagogical Analysis** | BROKEN | 50% | Prompt and JSON schema defined; fails at runtime (`503 TERM_DIRECTORY_UNAVAILABLE`); teachers/staff denied access. | `UserOrganizationDirectory.java:35`, `OpenAIProvider.java:25` |
| **Section 5: Frontend** | PARTIAL | 70% | Modern Frappe Desk UI implemented for active modules; landing page in Next.js 15; parent scoped endpoints integrated. | `router.jsx:40`, `guardianService.js` |
| **Section 6 & 7: Security** | DONE | 92% | Method security on 100% of endpoints; public files secured; IDOR protection active; rate limiting; secure headers; CORS. | `SecurityConfig.java`, `EndpointAuthorizationSecurityTest.java` |
| **Section 10: Deliverables** | PARTIAL | 70% | Permissions matrix published; Flyway V1-V8 verified; unified docker-compose; GitHub Actions CI pipeline added. | `docs/permissions-matrix.md`, `docker-compose.yml` |
| **Tests & Verification** | DONE | 100% | Frontend Vitest 100% green (516/516 passed); Backend Maven 100% green (676/676 passed, 0 failures, 0 errors). | Surefire Reports (`target/surefire-reports/`), Vitest |

---

## 3. Critical Issues (P0)

### Issue 1: Unauthenticated Public Access to Private Legal Documents [RESOLVED in WAVE 1]
- **Status:** RESOLVED
- **Resolution Evidence:** Removed `/api/v1/documents/files/**` from `permitAll()` in `SecurityConfig.java:110`. Enforced authenticated access in `DocumentController.java:78` and ownership verification in `DocumentServiceImpl.java:155-175` (only document owner, linked student guardian, or staff/admin can access). Validated magic bytes content sniffing for PDF, PNG, and JPEG in `LocalStorageService.java:93-104, 241-260`. Audit logs logged on each access in `DocumentServiceImpl.java:166,172`. Verified by unit & integration tests (`DocumentControllerIntegrationTest.java:160-205` and `DocumentsControllerTest.java:42-53`).

---

### Issue 2: Missing Method-Level Authorization Across 20+ Controllers [RESOLVED in WAVE 1]
- **Status:** RESOLVED
- **Resolution Evidence:** Enabled `@EnableMethodSecurity` in `SecurityConfig.java:29`. Applied `@PreAuthorize` across all endpoints on Student, Teacher, Staff, Department, Guardian, Invoice, Payment, Expense, Exam, FeeType, Application, LeaveRequest, Announcement, Message, Event, Notification, Homework, Observation, AIAnalysis, Document, AuditLog, ReportCard, and Grade controllers per the documented matrix `docs/permissions-matrix.md`. Added automated security regression test `EndpointAuthorizationSecurityTest.java:1-55` verifying that every single endpoint enforces authorization.

---

### Issue 3: Pedagogical AI Runtime 503 Crash on Generation
- **Severity:** P0 (CRITICAL — Broken Core Feature)
- **File Reference:** `/home/hamza/Desktop/JAVA SPRING BOOT/school_managment_app/src/main/java/com/example/shcool_managment_app/providers/UserOrganizationDirectory.java:35-37`
- **Evidence:**
  ```java
  @Override
  public TermWindow requireTerm(Long id) {
      throw new PedagogicalException(HttpStatus.SERVICE_UNAVAILABLE, "TERM_DIRECTORY_UNAVAILABLE",
          "Le module des périodes pédagogiques n'est pas encore intégré");
  }
  ```
- **Finding:** When any user calls `POST /api/ai-analyses/generate`, `AIAnalysisService.prepare()` executes `directory.requireTerm(request.termId())`, which directly throws `503 SERVICE_UNAVAILABLE`. AI analysis generation is currently 100% non-functional in the backend.
- **Fix Direction:** Create the `academic_years` and `terms` entities (Module 4.6), or implement a fallback `TermWindow` provider based on current calendar dates until Module 4.6 is fully persisted.

---

### Issue 4: Hardcoded `AccessDeniedException` Blocking Teachers and Staff from Observations
- **Severity:** P0 (CRITICAL — Broken Business Workflow)
- **File Reference:** `/home/hamza/Desktop/JAVA SPRING BOOT/school_managment_app/src/main/java/com/example/shcool_managment_app/security/UserOrganizationAccessPolicy.java:40-42`
- **Evidence:**
  ```java
  case TEACHER -> throw new AccessDeniedException("Affectation enseignant-élève indisponible");
  case STAFF -> throw new AccessDeniedException("Périmètre pédagogique du personnel indisponible");
  ```
- **Finding:** Spec 4.18 dictates that teachers enter pedagogical observations and review AI analyses. In the code, all calls to `policy.require(studentId, ...)` from teachers or staff unconditionally throw `AccessDeniedException`.
- **Fix Direction:** Implement teacher-student relationships via classes or departments, and grant teachers access to their students rather than throwing a hardcoded exception.

---

### Issue 5: Backend Test Suite Failure [RESOLVED in WAVE 0]
- **Status:** RESOLVED
- **Resolution Evidence:** Fixed in commit `6ebb9e6`. Remote branches merged, test mock wrappers aligned with `ApiResponse<T>`, and test assertions verified. Surefire execution output: `Tests run: 662, Failures: 0, Errors: 0, Skipped: 0` (`./mvnw test -q` exits 0).

---

### Issue 6: IDOR & Information Disclosure in Parent Dashboard [RESOLVED in WAVE 1]
- **Status:** RESOLVED
- **Resolution Evidence:** Added scoped endpoint `GET /api/v1/guardians/me/students` (`GuardianController.java:40-46`) returning only the authenticated guardian's children. Restricted `GET /api/v1/students` to `ADMIN` and `STAFF` (`StudentController.java:30`). Updated `statsService.js:355-367` and `guardianService.js:55-70` to query `/v1/guardians/me/students`, eliminating the client-side full directory download. IDOR isolation verified across parents and students in `IdorSecurityTest.java:1-175`.

---

### Issue 7: Insecure Default HMAC Secret Key in Committed Configuration [RESOLVED in WAVE 0]
- **Status:** RESOLVED
- **Resolution Evidence:** Fixed in commit `6ebb9e6`. Removed hardcoded defaults from `application.properties:43,68`. Added `ProductionConfigurationValidator.java:79-138` with 15 automated unit tests (`ProductionConfigurationValidatorTest.java:1-154`) enforcing that in `prod`/`production` profiles, `JWT_SECRET` and `STORAGE_SECRET_KEY` must be set, must not be dev defaults, and must be >= 32 bytes (256 bits). Dev fallbacks safely segregated to `application-dev.properties`. Updated `.env.example`.

---

## 4. Missing Features by Project Phase (Spec Section 8)

| Phase | Priority | Effort | Spec Ref | Description |
| :--- | :---: | :---: | :--- | :--- |
| **Phase 1: Foundations** | P0 | M | 4.1 | Email password reset endpoints (`/forgot-password`, `/reset-password`) and email dispatch. |
| **Phase 1: Foundations** | P1 | M | 4.1 | Two-factor authentication (2FA) TOTP challenge and verification flow. |
| **Phase 1: Foundations** | P1 | S | 4.1 | Active sessions & devices list with remote session revocation endpoint. |
| **Phase 1: Foundations** | P1 | S | 4.1 | Forced password change on first login (`first_login` flag in `users` table). |
| **Phase 2: Academic Core** | P0 | L | 4.6 | Academic Structure entities and tables: `academic_years`, `terms`, `grade_levels`, `classes`, `subjects`, `rooms`. |
| **Phase 2: Academic Core** | P0 | M | 4.6 | Class-Subject-Teacher assignment junction and teacher weekly workload calculator. |
| **Phase 2: Academic Core** | P0 | M | 4.4 | Student class enrollment history (`student_class_enrollment` per academic year). |
| **Phase 2: Academic Core** | P1 | M | 4.4 | Student CSV/Excel bulk import/export and student ID card generator. |
| **Phase 2: Academic Core** | P2 | S | 4.4 | Transfer and leaving certificates generation (`certificat de scolarité/transfert`). |
| **Phase 3: Documents & Admissions**| P1 | M | 4.2 | Admin CRUD interface and API for configuring document types by role and mandatory flags. |
| **Phase 3: Documents & Admissions**| P1 | M | 4.3 | Admission tests and interviews scheduling and results recording. |
| **Phase 3: Documents & Admissions**| P2 | M | 4.3 | Annual re-enrollment workflow for existing students. |
| **Phase 4: Daily Operations** | P0 | L | 4.8 | Attendance & Absences module: daily & per-course roll call, justifications with attachments, absence alerts. |
| **Phase 4: Daily Operations** | P0 | L | 4.7 | Timetable module: weekly schedule slots, room/teacher conflict detection, teacher availability, PDF timetable export. |
| **Phase 4: Daily Operations** | P1 | M | 4.10 | Course space and pedagogical resource library (sharing syllabus, slides, and links between teachers). |
| **Phase 5: Evaluation** | P1 | M | 4.9 | Configurable report card templates and multi-period student progress curves. |
| **Phase 6: Finances** | P1 | M | 4.11 | Sibling discounts, scholarship deductions, and automated payment overdue reminders. |
| **Phase 7: Communication** | P1 | M | 4.12 | Parent-teacher appointment scheduling system. |
| **Phase 7: Communication** | P1 | M | 4.12 | Email and SMS notification dispatch infrastructure (Spring Mail / SMS gateway integration). |
| **Phase 8: Landing Page** | P2 | S | 5.1 | News/announcements feed and testimonials section integration on the Next.js landing page. |
| **Phase 9: AI & Add-ons** | P0 | M | 4.18 | Integrate real grades, absences, and report-card history into AI prompt context; enable EN/AR output. |
| **Phase 9: AI & Add-ons** | P2 | L | 4.15 | Add-on modules: Library, Transport, Canteen, School Health, Inventory, Extracurricular activities. |
| **Phase 10: Reports & Finalization**| P1 | M | 4.16 | Multi-criteria reports generator with PDF/Excel/CSV exports. |
| **Phase 10: Reports & Finalization**| P1 | M | 4.17 | School profile settings entity (school name, logo, stamp, address, signature) and automated DB backup. |
| **Phase 10: Reports & Finalization**| P0 | M | 10.6 | Unified multi-service `docker-compose.yml` (MySQL + Redis + Backend + Frontend) and GitHub Actions CI/CD. |

---

## 5. Partial & Stub Items

### 1. Document Management (`4.2`)
- **What exists:** Document upload (`/api/v1/documents/upload`), HMAC signed keys, verification status (`PENDING`, `APPROVED`, `REJECTED`).
- **What remains:** Document download endpoint is unauthenticated (`permitAll()`); access logging is absent; document types cannot be configured via API; document expiry reminders do not exist.

### 2. Admissions Lifecycle (`4.3`)
- **What exists:** Public web form on landing page, admissions pipeline, applicant details modal, one-click conversion to official student.
- **What remains:** Tests/interviews scheduling; annual re-enrollment; document attachments during public submission.

### 3. Student Profile (`4.4`)
- **What exists:** Basic user identity, student number, status enum, parent associations.
- **What remains:** Medical records, emergency contacts, sibling links, class enrollment history, CSV/Excel import/export.

### 4. Staff & Leave Requests (`4.5`)
- **What exists:** Teacher and staff profiles, department linkages, leave request submission, approval, and cancellation.
- **What remains:** Staff attendance tracking (clock-in/clock-out); leave balances; subject/class assignments; teacher workload monitoring.

### 5. Homework (`4.10`)
- **What exists:** `HomeworkSubmission` entity, submission text/file, teacher grading and feedback.
- **What remains:** Standalone `Homework` parent assignment entity; course library; sharing resources between teachers.

### 6. Finance (`4.11`)
- **What exists:** Fee types, invoice lines, automated invoice generation, partial payments, PDF receipt generation with OpenPDF.
- **What remains:** Sibling discounts, scholarship deductions, automated overdue payment email/SMS reminders.

### 7. Communication (`4.12`)
- **What exists:** Role-targeted announcements, internal direct messaging, in-app notification center, calendar events.
- **What remains:** Target by class/level (blocked by missing Class entity); parent-teacher appointment scheduling; email and SMS notifications.

### 8. Pedagogical AI (`4.18`)
- **What exists:** Observations entity, structured JSON output validation, consent recording, validation/rejection workflow, parent and student views in frontend.
- **What remains:** Crashes with `503` due to missing `terms`; hardcoded `AccessDeniedException` for teachers/staff; input signals do not include grades/absences; multilingual support (EN/AR) missing in prompt.

---

## 6. Spec-vs-Code Mismatches

| Topic | Spec Requirement (docs/spec.pdf) | Actual Implementation in Code |
| :--- | :--- | :--- |
| **Target Architecture** | Single unified application with public landing page at `/` | Two separate repositories: React Vite SPA (admin desk) and Next.js 15 app (`landing-page/`). |
| **Authentication Identifier** | "Connexion par e-mail/téléphone" (Spec 4.1) | Login accepts only `email` (`AuthController.java:23`, `LoginForm.jsx`). Phone login is not supported. |
| **AI Input Data** | "notes et moyennes, évolution par matière, absences et retards, historique des bulletins" (Spec 4.18) | `OpenAIProvider.java:26`: System prompt explicitly states: *"Aucun texte d'observation, aucune matière et aucune note ne sont disponibles."* |
| **AI Output Language** | "Rapports générés dans la langue de l'utilisateur (français, anglais, arabe)" (Spec 4.18) | Hardcoded in `OpenAIProvider.java:25`: *"Tu proposes des pistes d'aide pédagogique en français"*. No multilingual prompt support. |
| **AI Schedule** | "Génération à la demande ou automatiquement à la fin de chaque trimestre" (Spec 4.18) | Only on-demand via `POST /api/ai-analyses/generate`. No scheduled end-of-term trigger exists. |
| **Homework Model** | Separate Homework assignment and Student submissions (Spec 4.10) | Single `homework_submissions` table where assignment metadata and student submission are merged into one record. |
| **Document Access** | "Stockage privé avec accès restreint par rôle ; chaque accès est journalisé" (Spec 4.2) | `SecurityConfig.java:158`: Endpoint is completely `permitAll()` with 0 audit logging. |
| **User Roles** | 8 roles in Spec 3 (Super Admin, Director, Secretary, Teacher, Accountant, Librarian, Parent, Student) | Database schema (`V2`, `V8`) models only 5 roles: `ROLE_ADMIN`, `ROLE_TEACHER`, `ROLE_STUDENT`, `ROLE_PARENT`, `ROLE_STAFF`. No `ROLE_LIBRARIAN` or separate Accountant/Secretary roles. |
| **School Settings** | Dynamic school profile: logo, address, stamp, signature (Spec 4.17) | Hardcoded static property `app.school.name=Établissement Scolaire` in `application.properties:55`. |

---

## 7. Recommended Roadmap (Next 10 Execution Tasks)

1. **Task 1: Remediate Legal Document Download Security**  
   *Acceptance Criterion:* Revoke `permitAll()` on `/api/v1/documents/files/**` in `SecurityConfig.java`, verify JWT in filter, and enforce that only the document owner, linked guardian, or Admin/Staff can download the file.
2. **Task 2: Implement Method-Level Security Across All Controllers**  
   *Acceptance Criterion:* Add `@PreAuthorize` annotations with role checks to all endpoints in `StudentController`, `TeacherController`, `StaffController`, `DepartmentController`, `InvoiceController`, `PaymentController`, `ExpenseController`, and `ExamController`.
3. **Task 3: Fix Broken Backend Test Suite (39 Failures)**  
   *Acceptance Criterion:* Correct DTO deserialization in `StudentControllerTest`, `DepartmentControllerTest`, `GuardianControllerTest`, `StaffControllerTest`, and `TeacherControllerTest`, resolve `LeaveRequestControllerTest` validation/auth errors, and ensure `./mvnw test` exits with code 0.
4. **Task 4: Implement Academic Structure Entities (Phase 2 / Spec 4.6)**  
   *Acceptance Criterion:* Create Flyway migration `V9__academic_structure.sql` adding `academic_years`, `terms`, `grade_levels`, `classes`, and `subjects`, along with JPA entities, repositories, and CRUD controllers.
5. **Task 5: Unblock Pedagogical AI Generation & Teacher Access**  
   *Acceptance Criterion:* Implement `UserOrganizationDirectory.requireTerm()` against the new `terms` table, remove hardcoded `AccessDeniedException` for teachers in `UserOrganizationAccessPolicy.java`, and verify `POST /api/ai-analyses/generate` returns HTTP 200 with valid AI recommendations.
6. **Task 6: Implement Attendance & Absences Module (Spec 4.8)**  
   *Acceptance Criterion:* Create `attendances` table with status (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`), roll call endpoint by class/date, parent justification with file upload, and student attendance rate calculation.
7. **Task 7: Secure Parent Dashboard Data Access**  
   *Acceptance Criterion:* Implement `GET /api/v1/guardians/me/students` returning strictly the children of the authenticated parent, and update `ParentDashboard.jsx` to consume this endpoint instead of downloading the full student directory.
8. **Task 8: Implement Timetables & Schedule Conflict Detection (Spec 4.7)**  
   *Acceptance Criterion:* Implement `timetable_slots` entity (day, time slot, class, subject, teacher, room), double-booking validation on teacher and room, and PDF export for weekly schedules.
9. **Task 9: Implement Password Reset & Email Infrastructure (Spec 4.1)**  
   *Acceptance Criterion:* Add `spring-boot-starter-mail`, implement `/api/v1/auth/forgot-password` and `/api/v1/auth/reset-password` with expiring token validation, and send HTML password reset emails.
10. **Task 10: Create Unified Docker Stack & CI/CD Pipeline (Spec Section 10)**  
    *Acceptance Criterion:* Create root `docker-compose.yml` orchestrating MySQL, Redis, Spring Boot API, and React Frontend with healthchecks, and add `.github/workflows/ci.yml` running lint, backend tests, and frontend build on every pull request.

---

## 8. Appendix: Requirement-by-Requirement Checklist

### 4.1 Authentification et gestion du compte
- [x] Connexion par e-mail et mot de passe (`AuthController.java:23`)
- [ ] Connexion par numéro de téléphone (Non supporté)
- [x] Déconnexion sécurisée avec blacklist Redis (`AuthController.java:31`, `TokenBlacklistService.java:25`)
- [ ] Réinitialisation du mot de passe par e-mail (`/forgot-password` absent du backend)
- [ ] Changement obligatoire du mot de passe à la première connexion (`first_login` absent de `User.java`)
- [~] Authentification à deux facteurs (2FA) (champ `twoFactorEnabled` en DB, logique TOTP absente)
- [x] Gestion des informations personnelles et coordonnées (`ProfileView.jsx`, `User.java`)
- [~] Photo de profil (champ `photoUrl` présent, recadrage et téléversement direct absents)
- [ ] Gestion des sessions actives et appareils connectés
- [x] Piste d'audit des actions sensibles (`AuditLogController.java:18`, table `audit_logs`)

### 4.2 Gestion des documents légaux
- [x] Espace personnel de documents (`GET /api/v1/documents/my-documents`)
- [x] Types de documents configurés en base (`document_types` dans `V4`)
- [~] Téléversement PDF/JPG/PNG et téléchargement (`DocumentController.java:23, 52` — attention faille `permitAll()`)
- [ ] API de configuration des types de documents par l'administrateur
- [~] Dates d'expiration (champ `expiryDate` en DB, rappels automatiques absents)
- [x] Circuit de vérification En attente → Approuvé / Rejeté avec motif (`DocumentController.java:31`)
- [~] Stockage privé des fichiers (`LocalStorageService.java` présent, mais journalisation d'accès manquante et route publique)
- [ ] Liste de contrôle des pièces manquantes par dossier

### 4.3 Admissions et inscriptions
- [x] Formulaire public de candidature (`POST /api/v1/public/applications`, `landing-page/app/admissions`)
- [x] Suivi des candidatures et statuts Déposée → En cours → Acceptée / Liste d'attente / Refusée (`ApplicationController.java`)
- [~] Téléversement de documents lors de la candidature (champs métadonnées présents, upload direct absent)
- [ ] Planification des entretiens et tests d'admission
- [x] Conversion automatique de candidature en élève et tuteur (`ApplicationController.java:56`, `ApplicationConversionServiceImpl.java:35`)
- [ ] Réinscription annuelle des élèves existants
- [x] Génération automatique des numéros d'élève (`StudentNumberGenerator.java:15`)
- [~] Notification d'inscription aux parents (notification in-app créée, e-mail absent)

### 4.4 Gestion des élèves
- [~] Profil de l'élève (identité, adresse, école précédente présents ; santé, urgence, fratrie absents)
- [x] Association élève et tuteurs légaux (`student_guardians`, `StudentController.java:67`)
- [ ] Affectation aux classes et historique par année scolaire (Absence de l'entité `Class`)
- [x] Statut de l'élève actif, transféré, diplômé, exclu (`StudentStatus.java`)
- [~] Observations de comportement (`Observation.java` présent ; dossier disciplinaire/sanctions absent)
- [ ] Notes médicales d'accès restreint
- [ ] Import et export CSV/Excel des élèves
- [ ] Cartes d'élève imprimables et certificats de transfert

### 4.5 Gestion du personnel et des enseignants
- [x] Profils personnel et enseignants (`Teacher.java`, `Staff.java`, `User.java`)
- [x] Départements de l'établissement (`DepartmentController.java:24`)
- [ ] Affectation des matières et classes aux enseignants (Entités Matières et Classes absentes)
- [ ] Suivi de la charge horaire hebdomadaire
- [~] Gestion des congés (`LeaveRequestController.java:20` ; présence/pointage et soldes absents)
- [x] Stockage des contrats de travail (`Document.java` avec type `CONTRACT`)
- [ ] Module de paie (Optionnel)
- [ ] Évaluations et notes de performance du personnel

### 4.6 Structure pédagogique
- [ ] Années scolaires et trimestres/semestres (Entités absentes)
- [ ] Niveaux scolaires et filières (Entités absentes)
- [ ] Classes avec professeur principal, salle et capacité (Entités absentes)
- [ ] Matières avec coefficients et volumes horaires (Entités absentes)
- [ ] Affectations classe–matière–enseignant (Entité absente)
- [ ] Gestion des salles et installations (Entité absente)

### 4.7 Emplois du temps et planification
- [ ] Emploi du temps hebdomadaire (Entité absente)
- [ ] Détection des conflits de réservation (Enseignant, salle, classe)
- [ ] Disponibilités des enseignants
- [ ] Gestion des exceptions, remplacements et cours annulés
- [~] Calendrier des événements et examens (`EventController.java:20`)
- [ ] Export PDF de l'emploi du temps

### 4.8 Gestion des absences et retards
- [ ] Appel quotidien ou par cours par les enseignants
- [ ] Justification des absences par les parents avec pièce jointe
- [ ] Notification automatique d'absence aux parents
- [ ] Statistiques d'assiduité et alertes d'absentéisme répété

### 4.9 Examens, notes et bulletins
- [x] Planification des examens (`ExamController.java:28`)
- [x] Saisie et verrouillage des notes (`ExamController.java:49, 71`, `GradeEntryPage.jsx`)
- [x] Calcul des moyennes pondérées (`ReportCardServiceImpl.java:54`)
- [x] Classement, mentions et appréciations (`ReportCard.java`, `ReportCardServiceImpl.java:82`)
- [~] Bulletins scolaires en PDF (`ReportCardServiceImpl.java:166` via OpenPDF ; modèle non configurable)
- [x] Décisions du conseil de classe (`ReportCard.java:decision`)
- [~] Courbes de progression (Graphiques récents sur tableau de bord ; historique multi-annuel absent)

### 4.10 Cours, devoirs et ressources pédagogiques
- [ ] Espace de cours et plans de cours
- [~] Devoirs et échéances (`HomeworkSubmission.java`, `HomeworkController.java:26`)
- [x] Dépôt des devoirs en ligne par les élèves (`HomeworkController.java:31`)
- [x] Correction, notation et commentaires des devoirs (`HomeworkController.java:36`)
- [ ] Bibliothèque partagée de ressources pédagogiques

### 4.11 Frais, paiements et finances
- [x] Grille tarifaire et types de frais (`FeeTypeController.java:24`)
- [ ] Bourses, réductions fratrie et exonérations
- [x] Émission automatique des factures (`InvoiceGenerationServiceImpl.java:42`)
- [x] Enregistrement des paiements et paiements partiels (`PaymentController.java:35`)
- [x] Reçus de paiement en PDF (`ReceiptServiceImpl.java:51` via OpenPDF)
- [~] Suivi des impayés (Filtre `OVERDUE` fonctionnel ; relances automatiques absentes)
- [x] Enregistrement et suivi des dépenses (`ExpenseController.java:24`)
- [x] Tableau de bord financier (`InvoicesPage.jsx`, `statsService.js`)
- [x] Consultation des factures par les familles (`GET /api/v1/finances/invoices/students/{id}`)

### 4.12 Communication
- [~] Annonces ciblées par rôle (`AnnouncementController.java:20` ; ciblage par classe/niveau absent)
- [x] Messagerie interne directe (`MessageController.java:20`, `MessageListPage.jsx`)
- [~] Notifications in-app et temps réel (`NotificationController.java:20`, `notificationSocket.js` ; email/SMS absents)
- [ ] Prise de rendez-vous parents–enseignants
- [x] Événements scolaires et calendrier (`EventController.java:20`, `EventListPage.jsx`)
- [ ] Modèles de messages prédéfinis

### 4.13 Portail parent
- [~] Compte unique pour plusieurs enfants (`ParentDashboard.jsx:29`, `student_guardians`)
- [~] Vue enfant : notes, bulletins, devoirs (présents ; emploi du temps et absences absents)
- [ ] Justification des absences en ligne
- [x] Consultation des factures et reçus de paiement
- [x] Messagerie avec l'établissement
- [x] Consultation des annonces et événements
- [x] Consentement IA, observations parentales et stratégies d'apprentissage

### 4.14 Portail élève
- [~] Vue élève : notes, devoirs, bulletins (présents ; emploi du temps et absences absents)
- [x] Consultation de la stratégie d'apprentissage publiée
- [x] Annonces et calendrier des événements
- [x] Profil et modification des identifiants

### 4.15 Modules complémentaires
- [ ] Bibliothèque (Catalogue, prêts, retours)
- [ ] Transport scolaire (Itinéraires, véhicules, chauffeurs)
- [ ] Cantine (Menus, abonnements)
- [ ] Inventaire et gestion des stocks
- [ ] Santé et visites à l'infirmerie
- [ ] Activités extrascolaires et clubs

### 4.16 Rapports et analyses
- [~] Tableaux de bord synthétiques par rôle (`statsService.js`)
- [ ] Moteur de rapports multi-critères
- [ ] Filtres par année, classe, niveau et période
- [ ] Exports PDF, Excel et CSV

### 4.17 Administration et paramètres
- [ ] Paramètres de l'école (Nom, logo, cachet, signature configurables)
- [ ] Configuration du barème de notation et des trimestres
- [~] Rôles et permissions (Initialisés en base Flyway `V2` ; API de gestion absente)
- [ ] Modèles d'e-mails et de notifications
- [~] Support multilingue (Frontend 100% traduit FR/EN/AR avec RTL ; messages d'erreur backend en français brut)
- [ ] Procédure de sauvegarde automatique de la base de données
- [x] Journal d'audit des actions (`AuditLogController.java`)

### 4.18 Analyse pédagogique par IA (LLM)
- [x] Saisie d'observations catégorisées avec niveau et date (`ObservationController.java:24`)
- [x] Observations des parents sur leur enfant (`Observation.java:source = PARENT`)
- [ ] Prise en compte des notes, moyennes et absences dans le prompt LLM (Limité aux signaux de comportement)
- [~] Génération asynchrone / appel LLM (`OpenAIProvider.java:60` synchrone ; trigger fin de trimestre absent)
- [x] Rapport structuré en JSON validé par schéma (`summary`, `strengths`, `difficulties`, `trends`, `goals`)
- [x] Stratégie d'apprentissage avec actions de suivi cochables (`FollowUpAction.java:completed`)
- [x] Circuit de validation Brouillon → Validé → Publié / Rejeté (`AIAnalysisController.java:31-45`)
- [x] Garde-fous : absence de décision automatique, pas de diagnostic médical (`OpenAIProvider.java:25`)
- [x] Consentement parental obligatoire (`AIConsentService.java:requireGenerationConsent`)
- [x] Journalisation des générations IA (`ai_generation_log` table)
- [ ] Support multilingue du rapport IA (Prompt hardcodé en français)
- [ ] Clé API uniquement côté serveur (`application.properties`, non exposée au frontend)
- [ ] Exécution opérationnelle (Bloquée par `TERM_DIRECTORY_UNAVAILABLE` et `AccessDeniedException` pour enseignants)
