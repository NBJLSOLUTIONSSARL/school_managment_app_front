# Role & Permissions Database Migration Runbook

**Project:** School Management Platform (*Système de Gestion Scolaire*)  
**Phase:** Step A — Backend Roles & Permissions Migration  
**Database Engines:** MySQL 8.0 (Production / Staging) & H2 in PostgreSQL/MySQL syntax mode (Automated Tests)  
**Migration Tool:** Flyway Database Migrations (`db/migration/`)  

---

## 1. Safety & Operational Constraints

1. **MySQL DDL Non-Transactional Warning:**
   * In MySQL, DDL statements (`CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`) cause an implicit commit and cannot be rolled back within a standard database transaction.
   * If a migration fails mid-way, Flyway marks the schema as dirty (`success = 0` in `flyway_schema_history`).
   * **Rule:** Migrations must be partitioned into small, single-purpose, idempotent files (`IF NOT EXISTS`, `ON DUPLICATE KEY UPDATE`).

2. **Pre-Migration Backup Command (MANDATORY):**
   Prior to applying any migration in staging or production, create a point-in-time snapshot:
   ```bash
   # 1. Native MySQL Dump with routines, triggers, and single-transaction consistency
   mysqldump -h "${MYSQL_HOST:-127.0.0.1}" -P "${MYSQL_PORT:-3306}" \
     -u "${MYSQL_USER:-school_app}" -p"${MYSQL_PASSWORD}" \
     --single-transaction --quick --routines --triggers \
     --databases "${MYSQL_DATABASE:-schooldb}" > "backup_schooldb_pre_roles_$(date +%Y%m%d_%H%M%S).sql"

   # 2. Redis Snapshot (Active sessions and token blacklists)
   redis-cli -h "${REDIS_HOST:-127.0.0.1}" -p "${REDIS_PORT:-6379}" BGSAVE
   ```

---

## 2. Migration Execution Sequence

### Phase 1: Small, Idempotent Flyway Scripts

* **`V21__permissions_catalog_and_roles_setup.sql`:**
  - Ensures `permissions` table schema supports code, category/domain, and description.
  - Inserts the complete 88-permission unified catalog (`system:monitor`, `student:read`, `grade:write`, `invoice:write`, etc.) alongside legacy authority names (`PERM_*`).
  - Ensures all 8 target roles exist in `roles` (`ROLE_SUPER_ADMIN`, `ROLE_DIRECTOR`, `ROLE_SECRETARY`, `ROLE_TEACHER`, `ROLE_ACCOUNTANT`, `ROLE_LIBRARIAN`, `ROLE_PARENT`, `ROLE_STUDENT`) + add-on `ROLE_NURSE`.

* **`V22__role_permissions_assignment.sql`:**
  - Idempotently maps all 88 permissions to the 8 roles per `docs/role-permissions-matrix.md`.
  - Links permissions to roles using `INSERT INTO role_permissions ... ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)`.

* **`V23__user_roles_migration_and_mapping.sql`:**
  - Migrates legacy user role associations safely without deleting previous roles:
    - `ROLE_ADMIN` (id 1) users receive `ROLE_DIRECTOR` (id 8).
    - Platform owner accounts (e.g. `is_system_owner = true` or `email LIKE '%superadmin%'`) receive `ROLE_SUPER_ADMIN` (id 7).
    - `ROLE_STAFF` (id 2/5) users receive `ROLE_SECRETARY` (id 9).
    - Staff members with finance roles/titles receive `ROLE_ACCOUNTANT` (id 10).
  - Legacy roles remain assigned during the transition period to prevent session revocation or security check regressions.

---

## 3. Post-Migration Verification Queries

Run these queries directly on MySQL to verify the state of roles, permissions, and user assignments:

```sql
-- 1. Verify all 8 roles exist (+ NURSE)
SELECT id, name FROM roles ORDER BY id;
-- Expected output:
-- 1: ROLE_ADMIN (legacy compatibility)
-- 2: ROLE_STAFF (legacy compatibility)
-- 3: ROLE_TEACHER
-- 4: ROLE_PARENT
-- 5: ROLE_STUDENT
-- 6: ROLE_LIBRARIAN
-- 7: ROLE_SUPER_ADMIN
-- 8: ROLE_DIRECTOR
-- 9: ROLE_SECRETARY
-- 10: ROLE_ACCOUNTANT
-- 11: ROLE_NURSE

-- 2. Verify total permissions count
SELECT COUNT(*) AS total_permissions FROM permissions;
-- Expected: >= 88 permissions

-- 3. Verify role-permission mapping counts per role
SELECT r.name AS role_name, COUNT(rp.permission_id) AS assigned_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.id;

-- 4. Verify user role migrations
SELECT u.id, u.email, GROUP_CONCAT(r.name) AS user_roles
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.email;

-- 5. Verify no orphan permissions or roles
SELECT * FROM role_permissions WHERE role_id NOT IN (SELECT id FROM roles);
SELECT * FROM role_permissions WHERE permission_id NOT IN (SELECT id FROM permissions);
```

---

## 4. Rollback Strategy & Recovery Plan

If a migration fails or an unexpected regression occurs during execution:

### Step 1: Automated Flyway Repair
If Flyway halted on a failed migration:
```bash
# In backend directory
./mvnw flyway:repair
```

### Step 2: Emergency Schema Restore (if data inconsistency occurs)
```bash
# Drop current schema and re-import the pre-migration snapshot
mysql -h "${MYSQL_HOST:-127.0.0.1}" -P "${MYSQL_PORT:-3306}" \
  -u "${MYSQL_USER:-school_app}" -p"${MYSQL_PASSWORD}" \
  -e "DROP DATABASE IF EXISTS ${MYSQL_DATABASE:-schooldb}; CREATE DATABASE ${MYSQL_DATABASE:-schooldb} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

mysql -h "${MYSQL_HOST:-127.0.0.1}" -P "${MYSQL_PORT:-3306}" \
  -u "${MYSQL_USER:-school_app}" -p"${MYSQL_PASSWORD}" \
  "${MYSQL_DATABASE:-schooldb}" < "backup_schooldb_pre_roles_<TIMESTAMP>.sql"
```

### Step 3: Backward-Compatible Application Recovery
Because the migration sequence preserves all legacy roles (`ROLE_ADMIN`, `ROLE_STAFF`), the previous application version can immediately connect and operate against the restored or dual-mapped schema without code modifications.
