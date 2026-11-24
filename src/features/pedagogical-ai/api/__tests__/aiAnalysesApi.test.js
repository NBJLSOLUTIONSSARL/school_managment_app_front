import { describe, it, expect, vi } from 'vitest'
import {
  analysisError,
  compareAnalyses,
  computeLocalComparison,
  generateAnalysis,
  getAnalysis,
  getAnalysisStatus,
  getPeriodComparison,
  listAnalyses,
  listGenerationLogs,
  pollAnalysisStatus,
  publishAnalysis,
  rejectAnalysis,
  triggerAnalysisGeneration,
  validateAnalysis,
} from '../aiAnalysesApi'
import { ApiError } from '@/features/auth'

const sampleAnalysis = {
  id: 1,
  studentId: 10,
  studentName: 'Yassine Alami',
  termId: 1,
  status: 'DRAFT',
  generatedAt: '2026-11-01T10:00:00Z',
  model: 'gpt-4o-mini',
  summary: 'Progression satisfaisante en mathématiques.',
  strengths: 'Rigueur et participation.',
  difficulties: 'Calcul mental.',
  trends: 'Tendance haussière.',
}

describe('aiAnalysesApi - triggerAnalysisGeneration & generateAnalysis', () => {
  it('throws on invalid studentId or termId', async () => {
    const request = vi.fn()
    await expect(triggerAnalysisGeneration(request, null)).rejects.toThrow(ApiError)
    await expect(triggerAnalysisGeneration(request, { studentId: -1, termId: 1 })).rejects.toThrow(ApiError)
    await expect(triggerAnalysisGeneration(request, { studentId: 10, termId: 0 })).rejects.toThrow(ApiError)
  })

  it('triggers generation with default french locale in payload', async () => {
    const request = vi.fn().mockResolvedValue(sampleAnalysis)
    const result = await triggerAnalysisGeneration(request, { studentId: 10, termId: 1 })

    expect(request).toHaveBeenCalledWith(
      '/api/ai-analyses/generate',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          studentId: 10,
          termId: 1,
          locale: 'fr',
          language: 'fr',
        }),
      })
    )
    expect(result.id).toBe(1)
    expect(result.status).toBe('DRAFT')
  })

  it('triggers generation with custom requested locale (ar / en)', async () => {
    const request = vi.fn().mockResolvedValue(sampleAnalysis)
    await triggerAnalysisGeneration(request, { studentId: 10, termId: 1, locale: 'ar' })

    expect(request).toHaveBeenCalledWith(
      '/api/ai-analyses/generate',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          studentId: 10,
          termId: 1,
          locale: 'ar',
          language: 'ar',
        }),
      })
    )
  })

  it('generateAnalysis returns immediately when backend returns completed analysis', async () => {
    const request = vi.fn().mockResolvedValue(sampleAnalysis)
    const res = await generateAnalysis(request, { studentId: 10, termId: 1 })
    expect(res.id).toBe(1)
    expect(res.summary).toBe(sampleAnalysis.summary)
  })

  it('generateAnalysis polls status when backend returns PENDING', async () => {
    const request = vi.fn()
      // Initial generate call returns PENDING
      .mockResolvedValueOnce({
        id: 5,
        studentId: 10,
        termId: 1,
        status: 'PENDING',
      })
      // Status poll 1 returns PROCESSING
      .mockResolvedValueOnce({
        id: 5,
        status: 'PROCESSING',
      })
      // Status poll 2 returns COMPLETED
      .mockResolvedValueOnce({
        id: 5,
        status: 'COMPLETED',
        analysisId: 5,
      })
      // getAnalysis fetches final completed analysis
      .mockResolvedValueOnce({
        ...sampleAnalysis,
        id: 5,
        status: 'DRAFT',
      })

    const onProgress = vi.fn()
    const res = await generateAnalysis(
      request,
      { studentId: 10, termId: 1 },
      { intervalMs: 10, maxAttempts: 5, onProgress }
    )

    expect(res.id).toBe(5)
    expect(res.status).toBe('DRAFT')
    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ status: 'PROCESSING' }))
  })
})

describe('aiAnalysesApi - getAnalysisStatus & pollAnalysisStatus', () => {
  it('queries status endpoint with fallback to main ID endpoint on 404', async () => {
    const request = vi.fn()
      .mockRejectedValueOnce({ status: 404 })
      .mockResolvedValueOnce({ id: 8, status: 'PROCESSING' })

    const status = await getAnalysisStatus(request, 8)
    expect(status.status).toBe('PROCESSING')
    expect(request).toHaveBeenCalledWith('/api/ai-analyses/8/status')
    expect(request).toHaveBeenCalledWith('/api/ai-analyses/status/8')
  })

  it('pollAnalysisStatus throws when job fails', async () => {
    const request = vi.fn().mockResolvedValue({
      id: 9,
      status: 'FAILED',
      error: 'Erreur OpenAI',
    })

    await expect(
      pollAnalysisStatus(request, 9, { intervalMs: 5, maxAttempts: 3 })
    ).rejects.toThrow(/Erreur OpenAI/i)
  })

  it('pollAnalysisStatus times out after maxAttempts exceeded', async () => {
    const request = vi.fn().mockResolvedValue({
      id: 9,
      status: 'PROCESSING',
    })

    await expect(
      pollAnalysisStatus(request, 9, { intervalMs: 5, maxAttempts: 2 })
    ).rejects.toThrow(/délai d'attente/i)
  })
})

describe('aiAnalysesApi - standard CRUD endpoints', () => {
  it('listAnalyses parses response content correctly', async () => {
    const request = vi.fn().mockResolvedValue({
      content: [sampleAnalysis],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    })

    const res = await listAnalyses(request, 10, { page: 0, size: 20 })
    expect(res.content.length).toBe(1)
    expect(res.totalElements).toBe(1)
  })

  it('getAnalysis, validateAnalysis, rejectAnalysis, publishAnalysis work as expected', async () => {
    const request = vi.fn().mockResolvedValue(sampleAnalysis)

    const got = await getAnalysis(request, 1)
    expect(got.id).toBe(1)

    const validated = await validateAnalysis(request, 1)
    expect(validated.id).toBe(1)

    const published = await publishAnalysis(request, 1)
    expect(published.id).toBe(1)

    await expect(rejectAnalysis(request, 1, '')).rejects.toThrow(ApiError)
    const rejected = await rejectAnalysis(request, 1, 'Données incohérentes')
    expect(rejected.id).toBe(1)
    expect(request).toHaveBeenCalledWith(
      '/api/ai-analyses/1/reject',
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('listGenerationLogs fetches logs with pagination', async () => {
    const request = vi.fn().mockResolvedValue({
      content: [{ id: 1, message: 'Génération démarrée' }],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    })

    const logs = await listGenerationLogs(request, 1, { page: 0, size: 10 })
    expect(logs.content.length).toBe(1)
    expect(logs.content[0].message).toBe('Génération démarrée')
  })
})

describe('aiAnalysesApi - Period Comparison endpoints & helpers', () => {
  it('compareAnalyses calls compare endpoint and alias getPeriodComparison works', async () => {
    const mockComp = {
      studentId: 10,
      studentName: 'Yassine Alami',
      term1Id: 1,
      term2Id: 2,
      term1Average: 12.5,
      term2Average: 14.0,
      deltaAverage: 1.5,
      trend: 'IMPROVING',
      summary: 'Bonne progression',
      evolvingRecommendations: ['Poursuivre les efforts en maths'],
      followUpActions: [
        { id: 1, description: 'Exercices', done: false, carriedForward: true },
        { id: 2, description: 'Fiche lecture', done: true, carriedForward: false },
      ],
    }

    const request = vi.fn().mockResolvedValue(mockComp)
    const res = await compareAnalyses(request, { studentId: 10, term1Id: 1, term2Id: 2 })
    expect(res.deltaAverage).toBe(1.5)
    expect(res.trend).toBe('IMPROVING')
    expect(res.followUpActions.length).toBe(2)
    expect(res.followUpActions[0].carriedForward).toBe(true)
    expect(res.followUpActions[0].status).toBe('PENDING')
    expect(res.followUpActions[1].status).toBe('DONE')

    expect(getPeriodComparison).toBe(compareAnalyses)
  })

  it('compareAnalyses falls back to /api/v1/ai-analyses/compare on 404', async () => {
    const request = vi.fn()
      .mockRejectedValueOnce({ status: 404 })
      .mockResolvedValueOnce({
        studentId: 10,
        term1Id: 1,
        term2Id: 2,
        term1Average: 10,
        term2Average: 12,
      })

    const res = await compareAnalyses(request, { studentId: 10, term1Id: 1, term2Id: 2 })
    expect(res.deltaAverage).toBe(2)
    expect(request).toHaveBeenCalledWith(expect.stringContaining('/api/v1/ai-analyses/compare'))
  })

  it('computeLocalComparison computes delta and carried-forward indicators', () => {
    const a1 = {
      id: 1,
      studentId: 10,
      termId: 1,
      average: 11.5,
      summary: 'Trimestre 1 moyen',
      difficulties: 'Géométrie',
    }
    const a2 = {
      id: 2,
      studentId: 10,
      termId: 2,
      average: 13.5,
      summary: 'Trimestre 2 en hausse',
      trends: 'Meilleure concentration',
      difficulties: 'Algèbre',
    }
    const actions = [
      { id: 101, description: 'Soutien maths', done: false },
      { id: 102, description: 'Exercice bilan', done: true },
    ]

    const comp = computeLocalComparison(a1, a2, actions)
    expect(comp.deltaAverage).toBe(2.0)
    expect(comp.trend).toBe('IMPROVING')
    expect(comp.followUpActions[0].carriedForward).toBe(true)
    expect(comp.followUpActions[1].carriedForward).toBe(false)
  })

  it('analysisError handles various HTTP status codes', () => {
    expect(analysisError({ status: 401 })).toMatch(/session a expirée/i)
    expect(analysisError({ status: 403 })).toMatch(/autorisations nécessaires/i)
    expect(analysisError({ status: 502 })).toMatch(/temporairement indisponible/i)
    expect(analysisError({ status: 504 })).toMatch(/délai d'attente/i)
  })
})
