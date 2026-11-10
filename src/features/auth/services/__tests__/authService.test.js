import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  authService,
  hasRole,
  hasAnyRole,
  hasPermission,
} from '../authService'

describe('authService & RBAC Engine', () => {
  beforeEach(() => {
    authService.clearTokens()
    document.cookie = 'edutrack_session=; path=/; max-age=0'
    vi.restoreAllMocks()
  })

  describe('RBAC Verification for all 5 roles + Super Admin', () => {
    it('verifies ROLE_ADMIN access rights correctly', () => {
      const adminUser = { roles: ['ROLE_ADMIN'] }
      expect(hasRole(adminUser, 'ROLE_ADMIN')).toBe(true)
      expect(hasRole(adminUser, 'admin')).toBe(true)
      expect(hasRole(adminUser, ['ROLE_ADMIN', 'ROLE_STAFF'])).toBe(true)
      // Normal admin cannot claim ROLE_SUPER_ADMIN
      expect(hasRole(adminUser, 'ROLE_SUPER_ADMIN')).toBe(false)
      expect(hasRole(adminUser, 'ROLE_STUDENT')).toBe(false)
    })

    it('verifies ROLE_SUPER_ADMIN possesses both SUPER_ADMIN and ADMIN rights', () => {
      const superAdminUser = { roles: ['ROLE_SUPER_ADMIN'] }
      expect(hasRole(superAdminUser, 'ROLE_SUPER_ADMIN')).toBe(true)
      expect(hasRole(superAdminUser, 'ROLE_ADMIN')).toBe(true)
      expect(hasRole(superAdminUser, 'admin')).toBe(true)
      expect(hasRole(superAdminUser, 'ROLE_TEACHER')).toBe(false)
    })

    it('verifies ROLE_TEACHER access rights correctly', () => {
      const teacherUser = { roles: ['ROLE_TEACHER'] }
      expect(hasRole(teacherUser, 'ROLE_TEACHER')).toBe(true)
      expect(hasRole(teacherUser, 'teacher')).toBe(true)
      expect(hasRole(teacherUser, ['ROLE_TEACHER', 'ROLE_ADMIN'])).toBe(true)
      expect(hasRole(teacherUser, 'ROLE_ADMIN')).toBe(false)
      expect(hasRole(teacherUser, 'ROLE_STUDENT')).toBe(false)
    })

    it('verifies ROLE_STUDENT access rights correctly', () => {
      const studentUser = { roles: ['ROLE_STUDENT'] }
      expect(hasRole(studentUser, 'ROLE_STUDENT')).toBe(true)
      expect(hasRole(studentUser, 'student')).toBe(true)
      expect(hasRole(studentUser, 'ROLE_ADMIN')).toBe(false)
      expect(hasRole(studentUser, 'ROLE_TEACHER')).toBe(false)
      expect(hasRole(studentUser, 'ROLE_PARENT')).toBe(false)
    })

    it('verifies ROLE_PARENT access rights correctly', () => {
      const parentUser = { roles: ['ROLE_PARENT'] }
      expect(hasRole(parentUser, 'ROLE_PARENT')).toBe(true)
      expect(hasRole(parentUser, 'parent')).toBe(true)
      expect(hasRole(parentUser, 'ROLE_ADMIN')).toBe(false)
      expect(hasRole(parentUser, 'ROLE_STAFF')).toBe(false)
    })

    it('verifies ROLE_STAFF access rights correctly', () => {
      const staffUser = { roles: ['ROLE_STAFF'] }
      expect(hasRole(staffUser, 'ROLE_STAFF')).toBe(true)
      expect(hasRole(staffUser, 'staff')).toBe(true)
      expect(hasRole(staffUser, 'ROLE_ADMIN')).toBe(false)
      expect(hasRole(staffUser, 'ROLE_PARENT')).toBe(false)
    })

    it('denies access if user has empty or invalid roles (prevents privilege escalation)', () => {
      const guestUser = { roles: [] }
      expect(hasRole(guestUser, 'ROLE_ADMIN')).toBe(false)
      expect(hasRole(guestUser, 'ROLE_STUDENT')).toBe(false)
      expect(hasRole(null, 'ROLE_ADMIN')).toBe(false)
      expect(hasRole(undefined, 'ROLE_ADMIN')).toBe(false)
    })

    it('hasAnyRole accepts either array or string arguments', () => {
      const user = { roles: ['ROLE_TEACHER'] }
      expect(hasAnyRole(user, ['ROLE_STUDENT', 'ROLE_TEACHER'])).toBe(true)
      expect(hasAnyRole(user, 'ROLE_TEACHER')).toBe(true)
      expect(hasAnyRole(user, ['ROLE_ADMIN', 'ROLE_PARENT'])).toBe(false)
      expect(hasAnyRole(user, null)).toBe(false)
    })

    it('hasPermission verifies granular and wildcard permissions', () => {
      const standardUser = { permissions: ['students:read', 'grades:write'] }
      expect(hasPermission(standardUser, 'students:read')).toBe(true)
      expect(hasPermission(standardUser, 'grades:write')).toBe(true)
      expect(hasPermission(standardUser, 'users:delete')).toBe(false)

      const superUser = { permissions: ['*'] }
      expect(hasPermission(superUser, 'anything:delete')).toBe(true)
      expect(hasPermission(superUser, 'system:config')).toBe(true)
      expect(hasPermission(null, 'test')).toBe(false)
    })
  })

  describe('Token and session management', () => {
    it('stores tokens strictly in memory without leaking to localStorage', () => {
      authService.setAccessToken('mem_token_abc')
      expect(authService.getAccessToken()).toBe('mem_token_abc')
      expect(localStorage.length).toBe(0)
      expect(sessionStorage.length).toBe(0)

      authService.clearTokens()
      expect(authService.getAccessToken()).toBeNull()
    })

    it('manages edutrack_session cookie indicator properly', () => {
      expect(authService.hasSessionIndicator()).toBe(false)
      authService.setSessionIndicator(true)
      expect(authService.hasSessionIndicator()).toBe(true)
      authService.setSessionIndicator(false)
      expect(authService.hasSessionIndicator()).toBe(false)
    })

    it('normalizes user without escalating empty roles to ROLE_ADMIN', () => {
      const userWithoutRoles = {
        id: 99,
        email: 'empty@school.edu',
        roles: [],
      }
      const normalized = authService.normalizeUser(userWithoutRoles)
      expect(normalized.roles).toEqual([])
      expect(normalized.roles).not.toContain('ROLE_ADMIN')
    })
  })
})
