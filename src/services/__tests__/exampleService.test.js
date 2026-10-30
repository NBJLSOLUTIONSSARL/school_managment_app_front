import { describe, it, expect } from 'vitest'
import { exampleService } from '../exampleService'

describe('exampleService uniform return contract', () => {
  it('returns normalized pagination for Spring Page endpoint', async () => {
    const res = await exampleService.getStudentsSpringPage({ page: 1, size: 10 })
    expect(res).toHaveProperty('success', true)
    expect(res).toHaveProperty('error', null)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveProperty('items')
    expect(Array.isArray(res.data.items)).toBe(true)
    expect(res.data).toHaveProperty('page', 1)
    expect(res.data).toHaveProperty('pageSize', 10)
    expect(res.data).toHaveProperty('totalItems')
    expect(res.data).toHaveProperty('totalPages')
    expect(res.data).toHaveProperty('hasNext')
    expect(res.data).toHaveProperty('hasPrevious')
  })

  it('returns normalized pagination for PageResponse endpoint', async () => {
    const res = await exampleService.getInvoicesPageResponse({ page: 1, size: 5 })
    expect(res).toHaveProperty('success', true)
    expect(res).toHaveProperty('error', null)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveProperty('items')
    expect(Array.isArray(res.data.items)).toBe(true)
    expect(res.data).toHaveProperty('page', 1)
    expect(res.data).toHaveProperty('pageSize', 5)
    expect(res.data).toHaveProperty('totalItems')
    expect(res.data).toHaveProperty('totalPages')
  })

  it('returns uniformly structured validation error when validation fails', async () => {
    const invalidData = { email: 'notanemail', firstName: 'a', matricule: '123' }
    const res = await exampleService.createStudentWithValidation(invalidData)
    expect(res).toHaveProperty('success', false)
    expect(res).toHaveProperty('data', null)
    expect(res.error).toBeDefined()
    expect(res.error.type).toBe('PROBLEM_DETAIL')
    expect(res.error.fieldErrors).toHaveProperty('email')
    expect(res.error.fieldErrors).toHaveProperty('firstName')
    expect(res.error.fieldErrors).toHaveProperty('matricule')
  })

  it('returns uniformly structured success when data is valid', async () => {
    const validData = {
      email: 'lucas.bernard@school.edu',
      firstName: 'Lucas',
      matricule: 'STU-2026-0001',
      className: 'Terminale S1',
    }
    const res = await exampleService.createStudentWithValidation(validData)
    expect(res).toHaveProperty('success', true)
    expect(res.data).toBeDefined()
    expect(res.data.matricule).toBe('STU-2026-0001')
    expect(res.error).toBeNull()
  })

  it('returns uniformly structured AI error when AI quota is exceeded', async () => {
    const res = await exampleService.generateStudentReportAi('Générer un rapport', true)
    expect(res).toHaveProperty('success', false)
    expect(res.data).toBeNull()
    expect(res.error).toBeDefined()
    expect(res.error.type).toBe('AI_ERROR')
    expect(res.error.code).toBe('AI_RATE_LIMIT_EXCEEDED')
  })
})
