import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext } from '@/features/auth'
import { ExamForm } from '@/features/exams/components/ExamForm'

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
}))

const examApi = vi.hoisted(() => ({
  getAllExams: vi.fn(),
  getExamById: vi.fn(),
  createExam: vi.fn(),
  updateExam: vi.fn(),
  deleteExam: vi.fn(),
  setExamLock: vi.fn(),
  getGradesByExam: vi.fn(),
  batchGrade: vi.fn(),
}))

const directoryApi = vi.hoisted(() => ({
  getStudents: vi.fn(),
  searchStudents: vi.fn(),
  getAllTeachers: vi.fn(),
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => toast,
  default: () => toast,
}))

vi.mock('@/features/exams/api/examService', () => ({
  examService: examApi,
  default: examApi,
}))

vi.mock('@/features/students', () => ({
  directoryService: directoryApi,
  default: directoryApi,
}))

const teacher = {
  id: 1,
  user: { firstName: 'Ada', lastName: 'Lovelace' },
  specialization: 'Mathématiques',
}

const existingExam = {
  id: 7,
  title: 'Examen existant',
  type: 'Devoir',
  date: '2026-11-10',
  maxScore: 20,
  coefficient: 1,
  teacherId: 1,
  teacherName: 'Ada Lovelace',
  locked: false,
}

function authValue(roles = ['ROLE_ADMIN']) {
  return {
    user: { id: 1, email: 'admin@example.test', roles },
    isAuthenticated: true,
    isLoading: false,
    roles,
    hasRole: (allowed) => roles.some((role) => allowed.includes(role)),
    hasAnyRole: (allowed) => roles.some((role) => allowed.includes(role)),
    hasPermission: () => true,
    request: vi.fn(),
  }
}

function renderNewForm() {
  return render(
    <AuthContext.Provider value={authValue()}>
      <MemoryRouter initialEntries={['/exams/new']}>
        <ExamForm />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

function renderEditForm() {
  return render(
    <AuthContext.Provider value={authValue()}>
      <MemoryRouter initialEntries={['/exams/7']}>
        <Routes>
          <Route path="/exams/:id" element={<ExamForm />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

function getForm() {
  return screen.getByText('Informations générales').closest('form')
}

function fillForm({
  title = 'Examen final',
  type = 'Contrôle continu',
  date = '2026-11-20',
  maxScore = '20',
  coefficient = '2',
  teacherId = '1',
} = {}) {
  fireEvent.change(screen.getByLabelText(/Titre de l’examen/), { target: { value: title } })
  fireEvent.change(screen.getByLabelText(/Type d’examen/), { target: { value: type } })
  fireEvent.change(screen.getByLabelText(/Date de l’examen/), { target: { value: date } })
  fireEvent.change(screen.getByLabelText(/Note maximale/), { target: { value: maxScore } })
  fireEvent.change(screen.getByLabelText(/Coefficient/), { target: { value: coefficient } })
  fireEvent.change(screen.getByLabelText(/Enseignant responsable/), { target: { value: teacherId } })
}

describe('ExamForm', () => {
  beforeEach(() => {
    directoryApi.getAllTeachers.mockResolvedValue({ success: true, data: [teacher] })
    examApi.createExam.mockResolvedValue({ success: true, data: { id: 55 }, message: null })
    examApi.updateExam.mockResolvedValue({ success: true, data: existingExam, message: null })
    examApi.getExamById.mockResolvedValue({ success: true, data: existingExam })
  })

  it('renders default values and loads teacher options', async () => {
    renderNewForm()

    expect(await screen.findByRole('option', { name: 'Ada Lovelace' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Note maximale/)).toHaveValue(20)
    expect(screen.getByLabelText(/Coefficient/)).toHaveValue(1)
    expect(screen.getByRole('button', { name: 'Créer l’examen' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nouvel examen' })).toBeInTheDocument()
  })

  it('shows schema errors and blocks an invalid submission', async () => {
    renderNewForm()
    await screen.findByRole('option', { name: 'Ada Lovelace' })

    fireEvent.submit(getForm())

    expect(screen.getByText('Le titre de l’examen est obligatoire.')).toBeInTheDocument()
    expect(screen.getByText('Le type d’examen est obligatoire.')).toBeInTheDocument()
    expect(screen.getByText('La date de l’examen est obligatoire.')).toBeInTheDocument()
    expect(screen.getByText('L’enseignant responsable est obligatoire.')).toBeInTheDocument()
    expect(examApi.createExam).not.toHaveBeenCalled()
  })

  it('validates numeric bounds and title length', async () => {
    renderNewForm()
    await screen.findByRole('option', { name: 'Ada Lovelace' })

    fireEvent.change(screen.getByLabelText(/Titre de l’examen/), {
      target: { value: 'a'.repeat(201) },
    })
    fireEvent.change(screen.getByLabelText(/Note maximale/), { target: { value: '0' } })
    fireEvent.change(screen.getByLabelText(/Coefficient/), { target: { value: '-2' } })
    fireEvent.submit(getForm())

    expect(screen.getByText('Le titre ne doit pas dépasser 200 caractères.')).toBeInTheDocument()
    expect(
      screen.getByText('La note maximale doit être strictement positive.')
    ).toBeInTheDocument()
    expect(screen.getByText('Le coefficient doit être strictement positif.')).toBeInTheDocument()
    expect(examApi.createExam).not.toHaveBeenCalled()
  })

  it('creates an exam with a normalized payload', async () => {
    renderNewForm()
    await screen.findByRole('option', { name: 'Ada Lovelace' })

    fillForm({
      title: '  Examen final  ',
      type: ' Contrôle continu ',
      date: '2026-11-20',
      maxScore: '15.5',
      coefficient: '3',
      teacherId: '1',
    })

    fireEvent.submit(getForm())

    await waitFor(() => expect(examApi.createExam).toHaveBeenCalledTimes(1))
    expect(examApi.createExam).toHaveBeenCalledWith({
      title: 'Examen final',
      type: 'Contrôle continu',
      date: '2026-11-20',
      maxScore: 15.5,
      coefficient: 3,
      teacherId: 1,
    })
    expect(toast.success).toHaveBeenCalledWith('Examen créé avec succès.', 'Examens')
  })

  it('shows backend field errors when creation fails', async () => {
    examApi.createExam.mockResolvedValue({
      success: false,
      data: null,
      message: null,
      error: {
        message: 'Ce titre existe déjà.',
        fieldErrors: { title: 'Titre déjà utilisé.' },
      },
    })
    renderNewForm()
    await screen.findByRole('option', { name: 'Ada Lovelace' })

    fillForm()
    fireEvent.submit(getForm())

    expect(await screen.findByText('Titre déjà utilisé.')).toBeInTheDocument()
    expect(toast.error).toHaveBeenCalledWith('Ce titre existe déjà.')
    expect(screen.getByRole('button', { name: 'Créer l’examen' })).toBeEnabled()
  })

  it('updates an existing exam without sending the teacher assignment', async () => {
    renderEditForm()

    expect(await screen.findByDisplayValue('Examen existant')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/Titre de l’examen/), {
      target: { value: 'Examen mis à jour' },
    })
    fireEvent.change(screen.getByLabelText(/Type d’examen/), { target: { value: 'Devoir' } })
    fireEvent.change(screen.getByLabelText(/Date de l’examen/), {
      target: { value: '2026-12-01' },
    })
    fireEvent.change(screen.getByLabelText(/Note maximale/), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText(/Coefficient/), { target: { value: '3' } })

    fireEvent.submit(getForm())

    await waitFor(() => expect(examApi.updateExam).toHaveBeenCalledTimes(1))
    const [id, payload] = examApi.updateExam.mock.calls[0]
    expect(id).toBe('7')
    expect(payload).toEqual({
      title: 'Examen mis à jour',
      type: 'Devoir',
      date: '2026-12-01',
      maxScore: 10,
      coefficient: 3,
    })
    expect(payload).not.toHaveProperty('teacherId')
  })
})
