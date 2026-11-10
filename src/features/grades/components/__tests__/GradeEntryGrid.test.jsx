import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/features/auth'
import { GradeEntryGrid } from '@/features/grades/components/GradeEntryGrid'

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
}))

const examApi = vi.hoisted(() => ({
  getAllExams: vi.fn(),
  getExamById: vi.fn(),
  getGradesByExam: vi.fn(),
  batchGrade: vi.fn(),
}))

const directoryApi = vi.hoisted(() => ({
  getStudents: vi.fn(),
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => toast,
  default: () => toast,
}))

vi.mock('@/features/exams', () => ({
  examService: examApi,
  default: examApi,
}))

vi.mock('@/features/students', () => ({
  directoryService: directoryApi,
  default: directoryApi,
}))

const examSummary = {
  id: 1,
  title: 'Mathématiques',
  date: '2026-11-20',
  type: 'Contrôle continu',
  maxScore: 20,
}

const exam = {
  ...examSummary,
  teacherName: 'Ada Lovelace',
  locked: false,
}

const students = [
  {
    id: 10,
    studentNumber: 'S-001',
    user: { firstName: 'Léa', lastName: 'Martin' },
  },
  {
    id: 11,
    studentNumber: 'S-002',
    user: { firstName: 'Hugo', lastName: 'Bernard' },
  },
]

const existingGrade = {
  studentId: 10,
  score: 12,
  comment: 'Bon travail',
}

function authValue(roles = ['ROLE_TEACHER']) {
  return {
    user: { id: 2, email: 'teacher@example.test', roles },
    isAuthenticated: true,
    isLoading: false,
    roles,
    hasRole: (allowed) => roles.some((role) => allowed.includes(role)),
    hasAnyRole: (allowed) => roles.some((role) => allowed.includes(role)),
    hasPermission: () => true,
    request: vi.fn(),
  }
}

function renderGrid() {
  return render(
    <AuthContext.Provider value={authValue()}>
      <MemoryRouter initialEntries={['/grades?examId=1']}>
        <GradeEntryGrid />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

async function renderLoadedGrid() {
  renderGrid()
  await screen.findByLabelText('Note de Léa Martin')
}

describe('GradeEntryGrid', () => {
  beforeEach(() => {
    examApi.getAllExams.mockResolvedValue({ success: true, data: [examSummary] })
    examApi.getExamById.mockResolvedValue({ success: true, data: exam })
    examApi.getGradesByExam.mockResolvedValue({ success: true, data: [existingGrade] })
    examApi.batchGrade.mockResolvedValue({
      success: true,
      data: [{ studentId: 10, score: 16, comment: 'Bon travail' }],
      message: 'Notes enregistrées avec succès.',
    })
    directoryApi.getStudents.mockResolvedValue({
      success: true,
      data: { items: students, totalPages: 1 },
    })
  })

  it('renders the selected exam, students and existing grades', async () => {
    await renderLoadedGrid()

    expect(
      screen.getByRole('heading', { name: 'Notes — Mathématiques' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Note de Léa Martin')).toHaveValue(12)
    expect(screen.getByLabelText('Commentaire de Léa Martin')).toHaveValue('Bon travail')
    expect(screen.getByLabelText('Note de Hugo Bernard').value).toBe('')
    expect(screen.getByText('Notée')).toBeInTheDocument()
    expect(screen.getByText('Non notée')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enregistrer les notes' })).toBeDisabled()
  })

  it('tracks dirty state when a grade input changes', async () => {
    await renderLoadedGrid()

    fireEvent.change(screen.getByLabelText('Note de Léa Martin'), { target: { value: '15' } })

    expect(screen.getByLabelText('Note de Léa Martin')).toHaveValue(15)
    expect(screen.getByText('Modifiée')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enregistrer (1)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enregistrer les notes' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Réinitialiser' })).toBeInTheDocument()
    expect(
      within(screen.getByText('Modifiées').parentElement).getByText('1')
    ).toBeInTheDocument()
  })

  it('saves edited grades with Ctrl+S and refreshes the stored grade', async () => {
    await renderLoadedGrid()

    fireEvent.change(screen.getByLabelText('Note de Léa Martin'), { target: { value: '16' } })
    fireEvent.change(screen.getByLabelText('Commentaire de Léa Martin'), {
      target: { value: 'Très bien' },
    })
    examApi.batchGrade.mockResolvedValue({
      success: true,
      data: [{ studentId: 10, score: 16, comment: 'Très bien' }],
      message: 'Notes enregistrées avec succès.',
    })

    fireEvent.keyDown(window, { key: 's', ctrlKey: true })

    await waitFor(() =>
      expect(examApi.batchGrade).toHaveBeenCalledWith(1, [
        { studentId: 10, score: 16, comment: 'Très bien' },
      ])
    )
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Notes enregistrées avec succès.',
        'Saisie des notes'
      )
    )
    expect(screen.queryByText('Modifiée')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Note de Léa Martin')).toHaveValue(16)
    expect(screen.getByRole('button', { name: 'Enregistrer les notes' })).toBeDisabled()
  })

  it('saves a new grade through the button and keeps the returned values', async () => {
    await renderLoadedGrid()

    fireEvent.change(screen.getByLabelText('Note de Hugo Bernard'), { target: { value: '14' } })
    fireEvent.change(screen.getByLabelText('Commentaire de Hugo Bernard'), {
      target: { value: 'Bien' },
    })
    examApi.batchGrade.mockResolvedValue({
      success: true,
      data: [{ studentId: 11, score: 14, comment: 'Bien' }],
      message: 'Notes enregistrées avec succès.',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer les notes' }))

    await waitFor(() =>
      expect(examApi.batchGrade).toHaveBeenCalledWith(1, [
        { studentId: 11, score: 14, comment: 'Bien' },
      ])
    )
    await waitFor(() => expect(screen.getAllByText('Notée')).toHaveLength(2))
    expect(screen.getByLabelText('Note de Hugo Bernard')).toHaveValue(14)
    expect(screen.getByLabelText('Commentaire de Hugo Bernard')).toHaveValue('Bien')
    expect(screen.getByRole('button', { name: 'Enregistrer les notes' })).toBeDisabled()
  })

  it('rejects out-of-range and negative scores without calling the API', async () => {
    await renderLoadedGrid()

    fireEvent.change(screen.getByLabelText('Note de Léa Martin'), { target: { value: '25' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer les notes' }))

    expect(
      await screen.findByText('La note ne peut pas dépasser 20.')
    ).toBeInTheDocument()
    expect(examApi.batchGrade).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith(
      'Certaines notes sont invalides. Corrigez les lignes signalées.'
    )

    fireEvent.change(screen.getByLabelText('Note de Léa Martin'), { target: { value: '-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer les notes' }))

    expect(await screen.findByText('La note ne peut pas être négative.')).toBeInTheDocument()
    expect(examApi.batchGrade).not.toHaveBeenCalled()
  })

  it('keeps a locked exam read-only and blocks the shortcut', async () => {
    examApi.getExamById.mockResolvedValue({
      success: true,
      data: { ...exam, locked: true },
    })
    await renderLoadedGrid()

    expect(screen.getByLabelText('Note de Léa Martin')).toBeDisabled()
    expect(screen.getByLabelText('Commentaire de Léa Martin')).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Enregistrer les notes' })).not.toBeInTheDocument()

    fireEvent.keyDown(window, { key: 's', ctrlKey: true })
    expect(examApi.batchGrade).not.toHaveBeenCalled()
  })
})
