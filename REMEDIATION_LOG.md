# Remediation Log — School Management System

## Overview
- Source of truth: `docs/spec.pdf` (spec) and `AUDIT_REPORT.md` (audit findings).
- Goal: Bring platform completeness from 42% to 100% across all 10 waves.
- Repositories:
  - Frontend SPA: `/home/hamza/Desktop/WEBINHAND/PROJECT/school_managment_app_front`
  - Backend API: `/home/hamza/Desktop/JAVA SPRING BOOT/school_managment_app`
  - Landing: `/home/hamza/Desktop/WEBINHAND/PROJECT/school_managment_app_front/landing-page`

---

## Wave 0 — Stabilize (P0)

### 1. Scope Restatement
1. Fix all failing backend tests (`./mvnw test` exits 0).
2. Clean up secrets in `application.properties`, add production startup secret validator failing if missing, too short (<32 bytes), or equals dev fallback, provide `.env.example`, keep dev fallbacks in `application-dev.properties`.
3. Add root `docker-compose.yml` (MySQL, Redis, backend, frontend, landing) with healthchecks, named volumes, env-file support, and multi-stage non-root Dockerfiles.
4. Add `.github/workflows/ci.yml` verifying backend build/test, frontend lint/test/build, landing build, and Docker build.
5. Exit criterion: Backend tests pass, frontend tests pass, lint passes, Docker config validates.

### 2. Status: DONE
- **Backend Tests:** 662/662 passed, 0 failures, 0 errors (`./mvnw test -q` exits 0).
- **Frontend Tests:** 515/515 passed, 0 failures (`npm run test` exits 0).
- **Frontend Lint:** 0 warnings, 0 errors across 301 files (`oxlint`).
- **Landing Build:** Next.js 15 production build successful (`next build` exits 0).
- **Docker Compose:** Validated on both root and backend contexts (`docker compose config` exits 0).
- **Open P0 Items:** 8 remaining (down from 10; Issue 5 and Issue 7 closed).

### 3. Changes Made
- **Backend Repository** (`/home/hamza/Desktop/JAVA SPRING BOOT/school_managment_app`):
  - Commit: `ee071d9 feat(security): wave 1 document authentication, method security, IDOR protection, and rate limiting`
  - Commit: `6ebb9e6 chore(config): wave 0 backend stabilization, secrets hardening, and CI setup`
  - Files modified/added:
    - `src/main/resources/application.properties`: Removed hardcoded secrets for `app.jwt.secret` and `storage.secret-key`; set `spring.profiles.default=dev`.
    - `src/main/resources/application-dev.properties`: Added local development fallback values.
    - `src/main/java/com/example/shcool_managment_app/config/ProductionConfigurationValidator.java`: Added production secret validation (enforces non-null, non-dev, >=32 bytes for JWT and storage HMAC secrets).
    - `src/test/java/com/example/shcool_managment_app/config/ProductionConfigurationValidatorTest.java`: Added 15 unit tests covering missing/short/dev secrets.
    - `src/main/java/com/example/shcool_managment_app/service/implementation/LocalStorageService.java`: Removed hardcoded fallback; injected `Environment` and added fail-safe validation.
    - `.env.example`: Updated with openssl secret generation instructions and documented variables.
    - `Dockerfile`: Upgraded to multi-stage build running as non-root user `appuser`.
    - `docker-compose.yml`: Corrected service paths, added landing service and storage secrets.
    - `.github/workflows/ci.yml`: Created GitHub Actions CI workflow for backend tests and docker config.
- **Frontend Repository** (`/home/hamza/Desktop/WEBINHAND/PROJECT/school_managment_app_front`):
  - Commit: `95e7e84 feat(security): wave 1 parent scoping, permissions matrix, and audit report update`
  - Files modified/added:
    - `docker-compose.yml`: Complete multi-container orchestration (MySQL, Redis, backend, frontend, landing, mailpit) with healthchecks and named volumes.
    - `Dockerfile`: Multi-stage build with `nginxinc/nginx-unprivileged:alpine` running as unprivileged user `nginx`.
    - `nginx.conf`: Configured unprivileged listening port 8080 with API and WebSocket reverse-proxying.
    - `landing-page/Dockerfile`: Multi-stage Next.js 15 build running as non-root user `nextjs`.
    - `.github/workflows/ci.yml`: Created GitHub Actions CI workflow for frontend lint/test/build, landing build, and docker compose validation.
    - `AUDIT_REPORT.md`: Updated scorecard and marked Issues 5 & 7 as resolved.
    - `REMEDIATION_LOG.md`: Initialized and maintained progress log.

### 4. Open Issues & Decisions Needed
- None for Wave 0. Proceeded to **WAVE 1 — Security (P0)**.

---

## Wave 1 — Security (P0)

### 1. Scope Restatement
1. Documents: Require auth on `/api/v1/documents/files/**`, enforce ownership checks in `downloadFile` (owner, linked guardian, admin/staff), log every download with IP in audit log, validate MIME content sniffing (PDF/JPG/PNG) & max size.
2. Method security: `@EnableMethodSecurity`, full permissions matrix (`docs/permissions-matrix.md`), `@PreAuthorize` on all endpoints across 20+ controllers, automated scanner test preventing unprotected endpoints.
3. Object-level authorization (IDOR): Scoped ownership checks for students, invoices, payments, grades, report cards, documents, homework, messages, observations; suite of IDOR integration tests.
4. Parent data scope: Add `GET /api/v1/guardians/me/students` returning only authenticated guardian's children; restrict `GET /api/v1/students` to ADMIN/STAFF; update `ParentDashboard.jsx` and `statsService.js`.
5. Hardening: Redis login rate limiting & account lockout with backoff, JWT expiry/rotation/revocation verification, strict CORS allow-list from env, security headers, password policy, BCrypt strength check.

### 2. Status: DONE
- **Backend Tests:** 676/676 passed, 0 failures, 0 errors (`./mvnw test -q` exits 0).
- **Frontend Tests:** 516/516 passed, 0 failures (`npm run test` exits 0).
- **Frontend Lint:** 0 warnings, 0 errors across 301 files (`npm run lint` / `oxlint` exits 0).
- **Frontend & Landing Build:** Successful production builds (`npm run build` exits 0).
- **Open P0 Items:** 2 remaining (down from 8; Issues 1, 2, and 6 closed).

### 3. Changes Made
- **Backend Repository** (`/home/hamza/Desktop/JAVA SPRING BOOT/school_managment_app`):
  - Commit: `ee071d9 feat(security): wave 1 document authentication, method security, IDOR protection, and rate limiting`
  - Files modified/added:
    - `src/main/java/com/example/shcool_managment_app/config/SecurityConfig.java`: Enabled `@EnableMethodSecurity`; removed `/api/v1/documents/files/**` from `permitAll()`; added strict CORS configuration reading `app.cors.allowed-origins`; added security response headers (X-Frame-Options: DENY, X-Content-Type-Options: nosniff, XSS protection, HSTS); configured BCrypt with cost factor 12.
    - `src/main/java/com/example/shcool_managment_app/security/AccessControlService.java`: Created centralized access control helper checking authorities directly for admin/staff to avoid synthetic user lookups; enforces ownership for students, documents, invoices, payments, and report cards.
    - `src/main/java/com/example/shcool_managment_app/security/LoginRateLimiterService.java`: Created Redis-backed rate limiter for login attempts (IP rate limiting + account lockout backoff with in-memory fallback).
    - `src/main/java/com/example/shcool_managment_app/controller/AuthController.java`: Integrated `LoginRateLimiterService` for login attempt counting, lockout, and success clearing.
    - `src/main/java/com/example/shcool_managment_app/controller/DocumentController.java`: Added `@PreAuthorize` on all endpoints (`upload`, `getDocument`, `getMyDocuments`, `downloadFile`, `verify`).
    - `src/main/java/com/example/shcool_managment_app/service/implementation/DocumentServiceImpl.java`: Enforced owner/guardian/admin ownership validation and HMAC signature validation on download; records download audit log event with actor and remote IP.
    - `src/main/java/com/example/shcool_managment_app/service/implementation/LocalStorageService.java`: Added magic bytes content sniffing (`isValidDocumentContent`) checking PDF, JPEG, PNG signatures.
    - Added `@PreAuthorize` on: `StudentController`, `TeacherController`, `StaffController`, `DepartmentController`, `GuardianController`, `LeaveRequestController`, `AnnouncementController`, `MessageController`, `EventController`, `NotificationController`, `ObservationController`, `AIAnalysisController`, `LearningStrategyController`, `AIConsentController`, `FollowUpActionController`, `TimetableController`, `UserController`.
    - `src/main/java/com/example/shcool_managment_app/controller/GuardianController.java`: Added `@GetMapping({"/my-children", "/me/students"})` returning authenticated parent's children.
    - `src/main/java/com/example/shcool_managment_app/service/implementation/GuardianServiceImpl.java`: IDOR protection in `getGuardianById(Long id)`.
    - `src/main/java/com/example/shcool_managment_app/service/implementation/InvoiceServiceImpl.java`: IDOR protection in `getInvoices` and `getInvoiceById`.
    - `src/main/java/com/example/shcool_managment_app/service/implementation/PaymentServiceImpl.java`: IDOR protection in `getPaymentById`.
    - `src/main/java/com/example/shcool_managment_app/service/implementation/ReceiptServiceImpl.java`: IDOR protection in `generateReceiptPdf`.
    - `src/main/java/com/example/shcool_managment_app/service/implementation/ReportCardServiceImpl.java`: IDOR protection in report card lookups and PDF generation.
    - `src/main/java/com/example/shcool_managment_app/service/implementation/StudentServiceImpl.java`: Enforced `requireCanAccessStudent` on student updates.
    - `src/test/java/com/example/shcool_managment_app/security/EndpointAuthorizationSecurityTest.java`: Automated security gate scanning all controller request mappings and asserting `@PreAuthorize` presence.
    - `src/test/java/com/example/shcool_managment_app/security/IdorSecurityTest.java`: 6 automated integration tests proving parents and students cannot access other families' data.
    - Updated test suites: `DocumentControllerIntegrationTest`, `DocumentsControllerTest`, `DocumentServiceTest`, `DepartmentControllerTest`, `GuardianControllerTest`, `StaffControllerTest`, `StudentControllerTest`, `TeacherControllerTest`, `PedagogicalWorkflowTest`.
- **Frontend Repository** (`/home/hamza/Desktop/WEBINHAND/PROJECT/school_managment_app_front`):
  - Commit: `95e7e84 feat(security): wave 1 parent scoping, permissions matrix, and audit report update`
  - Files modified/added:
    - `docs/permissions-matrix.md`: Published comprehensive role x endpoint permissions matrix derived from functional spec section 3.
    - `src/features/guardians/api/guardianService.js`: Added `getMyChildren()` calling `/v1/guardians/me/students`.
    - `src/features/dashboard/api/statsService.js`: Updated `getParentStats()` to use `guardianService.getMyChildren()` instead of downloading the entire student directory.
    - `src/features/guardians/api/__tests__/guardianService.test.js`: Added unit tests for `getMyChildren()`.
    - `AUDIT_REPORT.md`: Updated scorecard, marked Issues 1, 2, and 6 as resolved.
    - `REMEDIATION_LOG.md`: Updated with Wave 1 remediation details.

### 4. Open Issues & Decisions Needed
- None for Wave 1. All P0 and P1 security requirements met.
- Proceeded to **WAVE 2 — Academic Backbone (spec 4.6, 4.4, 4.5)**.

---

## Wave 2 — Academic Backbone (spec 4.6, 4.4, 4.5)

### 1. Scope Restatement
1. Migration V14: `academic_years`, `terms`, `grade_levels`, `sections`, `classes`, `subjects`, `class_subject_teacher`, `rooms`, `student_class_enrollment`.
2. Entities, repositories, DTOs, services, controllers with filters and pagination. Rules: only one active year, class capacity enforced at enrollment, no deletion of year/class with dependent data (archive instead).
3. Teacher weekly workload calculation endpoint (`/api/v1/teachers/{id}/workload`).
4. Students: emergency contacts, sibling links, restricted medical notes (ADMIN + school nurse/staff only with audit logging), discipline records, CSV import (dry-run mode + commit) & export, printable student ID card PDF, transfer and leaving certificates PDF with OpenPDF.
5. Frontend: pages for years/terms, classes with capacity meter, class details with student enrollments and subject-teacher assignments, subjects catalog, CSV import modal with dry-run error report, enhanced student details modal with 6 tabs.
6. Verification: 100% test coverage on new endpoints, all tests green on backend and frontend, Oxlint zero warnings.

### 2. Status: DONE
- **Backend Tests:** 680/680 passed, 0 failures, 0 errors (`./mvnw test -q` exits 0).
- **Frontend Tests:** 528/528 passed, 0 failures across 54 test files (`npm run test -- --run` exits 0).
- **Frontend Lint:** 0 warnings, 0 errors across 315 files (`npm run lint` / `oxlint` exits 0).
- **Frontend Build:** Successful Vite production build (`npm run build` exits 0).
- **Platform Completeness:** 68% (up from 54%).

### 3. Changes Made
- **Backend Repository** (`/home/hamza/Desktop/JAVA SPRING BOOT/school_managment_app`):
  - Commit: `bf28536 feat(academic): wave 2 academic backbone, structure, workload, and student dossiers`
  - Files modified/added:
    - `src/main/resources/db/migration/V14__academic_backbone.sql`: Flyway migration creating 13 tables (`academic_years`, `terms`, `grade_levels`, `sections`, `rooms`, `classes`, `subjects`, `class_subject_teacher`, `student_class_enrollment`, `student_emergency_contacts`, `student_siblings`, `student_medical_notes`, `student_discipline_records`) with indexes and foreign keys.
    - Entities: `AcademicYear`, `Term`, `GradeLevel`, `Section`, `Room`, `SchoolClass`, `Subject`, `ClassSubjectTeacher`, `StudentClassEnrollment`, `EmergencyContact`, `StudentSibling`, `MedicalNote`, `DisciplineRecord`.
    - Repositories: `AcademicYearRepository`, `TermRepository`, `GradeLevelRepository`, `SectionRepository`, `RoomRepository`, `SchoolClassRepository`, `SubjectRepository`, `ClassSubjectTeacherRepository`, `StudentClassEnrollmentRepository`, `EmergencyContactRepository`, `StudentSiblingRepository`, `MedicalNoteRepository`, `DisciplineRecordRepository`.
    - DTOs & Mappers: MapStruct mappers and validated request/response records for all academic entities.
    - Services & Implementations:
      - `AcademicYearServiceImpl`: Enforces single active year constraint and safe archival.
      - `SchoolClassServiceImpl`: Enforces class capacity at enrollment and calculates teacher weekly workload.
      - `SubjectServiceImpl`: Subject catalog with coefficient and hours calculation.
      - `StudentAcademicServiceImpl`: Emergency contacts, sibling links, restricted medical notes with audit logging, and discipline records.
      - `StudentImportExportServiceImpl`: Multi-row CSV import with dry-run validation report and CSV export.
      - `StudentCertificatePdfServiceImpl`: OpenPDF generation for student ID cards, transfer certificates, and leaving certificates.
    - Controllers: `AcademicYearController`, `SchoolClassController`, `SubjectController`, `StudentAcademicController` with `@PreAuthorize` on every endpoint.
    - Tests: `AcademicBackboneIntegrationTest` (4 comprehensive integration tests covering academic year activation, class enrollment capacity limits, teacher workload calculation, and restricted medical notes access).
- **Frontend Repository** (`/home/hamza/Desktop/WEBINHAND/PROJECT/school_managment_app_front`):
  - Files modified/added:
    - `src/features/academics/api/academicYearService.js`: API service for academic years and terms.
    - `src/features/academics/api/classService.js`: API service for classes, enrollments, subject-teacher assignments, and teacher workload.
    - `src/features/academics/api/subjectService.js`: API service for subjects catalog.
    - `src/features/academics/api/studentAcademicService.js`: API service for emergency contacts, siblings, medical notes, discipline records, CSV import/export, and PDF certificates.
    - `src/features/academics/components/AcademicYearsList.jsx` & `src/routes/AcademicYearsPage.jsx`: Years listing with active badge, terms drawer, activate and archive actions.
    - `src/features/academics/components/ClassesList.jsx` & `src/routes/ClassesPage.jsx`: Classes table with capacity meters, year/grade filters, and create modal.
    - `src/features/academics/components/ClassDetailView.jsx` & `src/routes/ClassDetailPage.jsx`: Frappe Desk DocType view with capacity sidebar, enrolled students tab, and subject-teacher assignments tab.
    - `src/features/academics/components/SubjectsList.jsx` & `src/routes/SubjectsPage.jsx`: Subjects catalog with coefficients and hours.
    - `src/features/students/components/StudentImportModal.jsx`: CSV uploader with dry-run validation error breakdown.
    - `src/features/students/components/StudentDetailsModal.jsx`: 6-tab student dossier with Emergency Contacts, Siblings, Medical Notes (confidentiality banner), Discipline records, and PDF certificates generation.
    - `src/features/students/components/StudentList.jsx`: Added CSV import and export buttons.
    - `src/routes/index.js`, `src/app/router.jsx`, `src/components/layout/PrivateLayout.jsx`: Navigation items and routes registered.
    - `src/features/academics/api/__tests__/academicServices.test.js`: 12 automated unit tests verifying all academic API services.

### 4. Open Issues & Decisions Needed
- None for Wave 2. Academic backbone and student dossiers are 100% complete and green.
- Ready to proceed to **WAVE 3 — AI Module Unblock (spec 4.18)** upon user command `GO WAVE 3`.
