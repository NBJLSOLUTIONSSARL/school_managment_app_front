import { describe, it, expect, vi } from 'vitest'
import { ApiError } from '@/features/auth'
import {
  createLearningStrategy,
  getLearningStrategy,
  updateLearningStrategy,
  listFollowUpActions,
  strategyError,
} from '@/features/pedagogical-ai/api/learningStrategiesApi'

const validStrategy = {
  id: 1,
  analysisId: 42,
  goals: 'Renforcer la régularité du travail personnel.',
  recommendations: 'Mettre en place un plan de travail hebdomadaire.',
  parentAdvice: 'Valoriser les progrès de l’enfant.',
  studentAdvice: 'Organiser son cartable la veille.',
}

const validAction = {
  id: 10,
  strategyId: 1,
  description: 'Point de contrôle hebdomadaire',
  dueDate: '2026-11-15',
  done: false,
}

describe('learningStrategiesApi', () => {
  it('creates learning strategy with valid payload', async () => {
    const request = vi.fn().mockResolvedValue(validStrategy)
    const result = await createLearningStrategy(request, {
      analysisId: 42,
      goals: 'Renforcer la régularité.',
      recommendations: 'Mettre en place un plan.',
      parentAdvice: 'Valoriser les progrès.',
      studentAdvice: 'Organiser son cartable.',
    })
    expect(request).toHaveBeenCalledWith('/api/learning-strategies', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: 42,
        goals: 'Renforcer la régularité.',
        recommendations: 'Mettre en place un plan.',
        parentAdvice: 'Valoriser les progrès.',
        studentAdvice: 'Organiser son cartable.',
      }),
    })
    expect(result).toEqual(validStrategy)
  })

  it('rejects create with missing or non-positive analysisId', async () => {
    const request = vi.fn()
    await expect(createLearningStrategy(request, { analysisId: 0 })).rejects.toBeInstanceOf(ApiError)
    await expect(createLearningStrategy(request, null)).rejects.toBeInstanceOf(ApiError)
    await expect(createLearningStrategy(request, { analysisId: -1 })).rejects.toBeInstanceOf(ApiError)
  })

  it('rejects create with empty fields', async () => {
    const request = vi.fn()
    await expect(createLearningStrategy(request, {
      analysisId: 42,
      goals: '   ',
      recommendations: 'Recs',
      parentAdvice: 'Parent',
      studentAdvice: 'Student',
    })).rejects.toBeInstanceOf(ApiError)
  })

  it('fetches learning strategy by id', async () => {
    const request = vi.fn().mockResolvedValue(validStrategy)
    const result = await getLearningStrategy(request, 1)
    expect(request).toHaveBeenCalledWith('/api/learning-strategies/1')
    expect(result).toEqual(validStrategy)
  })

  it('rejects get with invalid id', async () => {
    const request = vi.fn()
    await expect(getLearningStrategy(request, 0)).rejects.toBeInstanceOf(ApiError)
    await expect(getLearningStrategy(request, -5)).rejects.toBeInstanceOf(ApiError)
    await expect(getLearningStrategy(request, 'abc')).rejects.toBeInstanceOf(ApiError)
  })

  it('updates learning strategy with valid payload', async () => {
    const request = vi.fn().mockResolvedValue(validStrategy)
    const result = await updateLearningStrategy(request, 1, {
      analysisId: 42,
      goals: 'Updated goals',
      recommendations: 'Updated recs',
      parentAdvice: 'Updated parent advice',
      studentAdvice: 'Updated student advice',
    })
    expect(request).toHaveBeenCalledWith('/api/learning-strategies/1', {
      method: 'PUT',
      body: JSON.stringify({
        analysisId: 42,
        goals: 'Updated goals',
        recommendations: 'Updated recs',
        parentAdvice: 'Updated parent advice',
        studentAdvice: 'Updated student advice',
      }),
    })
    expect(result).toEqual(validStrategy)
  })

  it('lists follow-up actions with query params and filters', async () => {
    const pageResponse = {
      content: [validAction],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    }
    const request = vi.fn().mockResolvedValue(pageResponse)
    const result = await listFollowUpActions(request, 1, {
      done: false,
      from: '2026-11-01',
      to: '2026-11-30',
      page: 1,
      size: 10,
    })
    expect(request).toHaveBeenCalledWith(
      '/api/learning-strategies/1/follow-up-actions?done=false&from=2026-11-01&to=2026-11-30&page=1&size=10',
      {}
    )
    expect(result.content).toHaveLength(1)
    expect(result.content[0]).toEqual(validAction)
  })

  it('rejects list follow-up actions with invalid strategyId', async () => {
    const request = vi.fn()
    await expect(listFollowUpActions(request, 0)).rejects.toBeInstanceOf(ApiError)
    await expect(listFollowUpActions(request, -2)).rejects.toBeInstanceOf(ApiError)
  })

  it('maps strategy errors to user-friendly messages', () => {
    expect(strategyError({ status: 400 })).toMatch(/invalides/i)
    expect(strategyError({ status: 401 })).toMatch(/session/i)
    expect(strategyError({ status: 403 })).toMatch(/autorisations nécessaires/i)
    expect(strategyError({ status: 404 })).toMatch(/n'existe pas/i)
    expect(strategyError({ status: 409 })).toMatch(/modifiée dans son état actuel/i)
    expect(strategyError({ status: 503 })).toMatch(/temporairement indisponible/i)
    expect(strategyError({ status: 500 })).toMatch(/erreur interne/i)
    expect(strategyError({})).toMatch(/impossible d'accéder/i)
  })
})
