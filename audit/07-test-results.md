# 07 - Automated & End-to-End Verification Test Results

This document records the exact results of running the test suite, linting, build verification, and live role-based endpoint testing against the backend.

---

## 1. Unit & Integration Test Suite (`npm test`)
- **Tool:** Vitest 5.0.5 with jsdom environment.
- **Execution Date:** 2026-11-07
- **Test Files:** 32 passed / 32 passed (100%)
- **Tests:** 284 passed / 284 passed (100%)
- **Status:** **ALL GREEN**

```text
Test Files  32 passed (32)
Tests  284 passed (284)
Start at  19:52:50
Duration  18.78s
```

---

## 2. Static Analysis & Linter (`npm run lint`)
- **Tool:** Oxlint 0.16.x
- **Rules Active:** 104 rules, 247 source files analyzed.
- **Result:** **0 warnings, 0 errors** (100% clean).

```text
Found 0 warnings and 0 errors.
Finished in 207ms on 247 files with 104 rules using 8 threads.
```

---

## 3. Production Build Verification (`npm run build`)
- **Tool:** Vite 8.3.4 (Rolldown engine)
- **Result:** Production bundle generated in `dist/` within 830ms without errors.

```text
vite v8.3.4 building client environment for production...
✓ 2321 modules transformed.
dist/index.html                   0.69 kB │ gzip:   0.41 kB
dist/assets/index-BbnFEcg0.css   90.31 kB │ gzip:  15.37 kB
dist/assets/index-x8ow5d9O.js   914.88 kB │ gzip: 238.10 kB
✓ built in 830ms
```

---

## 4. Live Backend Role Endpoint Permutation Test
Tested live with JWT bearer authentication against Spring Boot running on port 8080:

| Endpoint Tested | Admin (ID: 1) | Teacher (ID: 2) | Student (ID: 9) | Parent (ID: 7) | Staff (ID: 6) |
|---|---|---|---|---|---|
| `GET /v1/students` | **200 OK** | **200 OK** | **200 OK** | **200 OK** | **200 OK** |
| `GET /v1/teachers` | **200 OK** | **200 OK** | **200 OK** | **200 OK** | **200 OK** |
| `GET /v1/staff` | **200 OK** | **200 OK** | **200 OK** | **200 OK** | **200 OK** |
| `GET /v1/departments` | **200 OK** | **200 OK** | **200 OK** | **200 OK** | **200 OK** |
| `GET /v1/applications` | **200 OK** | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** | **200 OK** |
| `GET /v1/finances/invoices` | **200 OK** | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** | **200 OK** |
| `GET /v1/exams` | **200 OK** | **200 OK** | **200 OK** | **200 OK** | **200 OK** |
| `GET /events` | **200 OK** | **200 OK** | **200 OK** | **200 OK** | **200 OK** |
| `GET /audit-logs` | **200 OK** | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** |

> [!NOTE]
> Strict role isolation confirmed: Only `ROLE_ADMIN` and `ROLE_STAFF` can read admissions and invoices. Only `ROLE_ADMIN` can read audit logs.
