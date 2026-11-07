# 05 — Backend API Integration and Data Contract Audit

## 1. Overview
All frontend API services in `src/features/*/api/` and `src/lib/axios.js` were audited against the Spring Boot REST backend endpoints, request payloads, response envelopes, pagination parameters, and authentication token injection.

---

## 2. API Services Verification Matrix

| Domain Module | API Service File | Backend Endpoints Verified | Contract & Envelopes Verified |
|---|---|---|---|
| **Auth** | `src/features/auth/context/AuthProvider.jsx` | `POST /api/auth/login`, `GET /api/users/me` | JWT bearer token in `Authorization` header, role extraction from `tokenStorage` |
| **Dashboard** | `src/features/dashboard/api/statsService.js` | `GET /api/dashboard/stats`, `GET /api/admissions/applications` | Dynamic KPI stats by role (`admin`, `teacher`, `student`, `parent`, `staff`) |
| **Students** | `src/features/students/api/studentService.js` | `GET /api/students`, `POST /api/students`, `PUT /api/students/:id`, `DELETE /api/students/:id` | Pageable params (`page`, `size`, `sort`), Spring Boot `Page<StudentResponseDTO>` envelope |
| **Teachers** | `src/features/teachers/api/teacherService.js` | `GET /api/teachers`, `POST /api/teachers`, `PUT /api/teachers/:id`, `DELETE /api/teachers/:id` | Pageable params, `Page<TeacherResponseDTO>` |
| **Staff** | `src/features/staff/api/staffService.js` | `GET /api/staff`, `POST /api/staff`, `PUT /api/staff/:id`, `DELETE /api/staff/:id` | Pageable params, `Page<StaffResponseDTO>` |
| **Guardians** | `src/features/guardians/api/guardianService.js` | `GET /api/guardians`, `POST /api/guardians`, `PUT /api/guardians/:id`, `DELETE /api/guardians/:id` | Pageable params, `Page<GuardianResponseDTO>` |
| **Departments** | `src/features/departments/api/departmentService.js`| `GET /api/departments`, `POST /api/departments`, `PUT /api/departments/:id`, `DELETE /api/departments/:id` | List of `DepartmentResponseDTO` |
| **Admissions** | `src/features/admissions/api/admissionsService.js` | `GET /api/admissions/applications`, `PUT /api/admissions/applications/:id/status` | Application review, status updates (`SUBMITTED`, `APPROVED`, `REJECTED`) |
| **Finances** | `src/features/finances/api/financesService.js` | `GET /api/finances/invoices`, `POST /api/finances/invoices/:id/pay` | Invoice records, payment processing |
| **Exams** | `src/features/exams/api/examService.js` | `GET /api/exams`, `POST /api/exams`, `PUT /api/exams/:id`, `DELETE /api/exams/:id` | Exam entity CRUD, lock status |
| **Grades** | `src/features/grades/api/gradeService.js` | `GET /api/grades`, `POST /api/grades/batch`, `PUT /api/grades/:id` | Batch grade submission, student marks |
| **Homework** | `src/features/homework/api/homeworkService.js` | `GET /api/homework`, `POST /api/homework/submit` | Homework assignment and submission |
| **Report Cards** | `src/features/report-cards/api/reportCardService.js` | `GET /api/report-cards`, `POST /api/report-cards/generate` | Term report card generation |
| **Announcements** | `src/features/announcements/api/announcementService.js` | `GET /api/announcements`, `POST /api/announcements` | School-wide and class announcements |
| **Events** | `src/features/events/api/eventService.js` | `GET /api/events`, `POST /api/events` | Calendar event schedules |
| **Messages** | `src/features/messages/api/messageService.js` | `GET /api/messages`, `POST /api/messages` | User-to-user messages |
| **Notifications** | `src/features/notifications/api/notificationService.js` | `GET /api/notifications`, `PUT /api/notifications/:id/read` | Real-time user notifications |
| **Leave Requests**| `src/features/leave-requests/api/leaveRequestService.js` | `GET /api/leave-requests`, `POST /api/leave-requests` | Absence & leave approvals |
| **Audit Logs** | `src/features/audit-logs/api/auditLogService.js` | `GET /api/audit-logs` | Admin security audit trails |
| **Pedagogical AI**| `src/features/pedagogical-ai/api/*` | `/api/pedagogical-ai/observations`, `/consents`, `/analyses`, `/strategies` | Microservice endpoints with permission checks |
| **Profile** | `src/features/profile/api/documentApi.js` | `GET /api/users/me/documents` | User documents & verification records |

---

## 3. Axios Interceptor & Error Handling
- **JWT Injection**: `src/lib/axios.js` automatically attaches `Authorization: Bearer <token>` from local storage for all outgoing requests.
- **Unauthorized Interception**: 401 response status triggers `auth:unauthorized` event, clearing the token and redirecting cleanly to `/login` without looping.
- **Proxy Configuration**: `vite.config.js` directs `/api/*` to `http://localhost:8080`, supporting full live-backend dev and mock fallback when backend is offline.
