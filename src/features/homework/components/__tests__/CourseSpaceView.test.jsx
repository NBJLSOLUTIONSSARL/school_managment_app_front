import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CourseSpaceView } from '../CourseSpaceView'

const mockService = vi.hoisted(() => ({
  getCourseById: vi.fn(),
  getCourseOutlines: vi.fn(),
  addCourseOutline: vi.fn(),
  getResourcesByLevelAndSubject: vi.fn(),
  addCourseResource: vi.fn(),
}))

vi.mock('../../api/homeworkWave7Service', () => ({
  homeworkWave7Service: mockService,
  default: mockService,
}))

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}

vi.mock('@/hooks/useToast', () => ({
  useToast: () => mockToast,
}))

describe('CourseSpaceView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockService.getCourseById.mockResolvedValue({
      success: true,
      data: {
        id: 1,
        code: 'MATH101',
        title: 'Algèbre et Géométrie',
        description: 'Algèbre fondamentale et trigonométrie',
        gradeLevelName: 'Classe de Seconde',
        subjectName: 'Mathématiques',
        teacherName: 'M. Turing',
        gradeLevelId: 1,
        subjectId: 1,
        teacherId: 1,
      },
    })
    mockService.getCourseOutlines.mockResolvedValue({
      success: true,
      data: [
        {
          id: 10,
          chapterNumber: 1,
          title: 'Équations linéaires et systèmes',
          objectives: 'Résolution par substitution',
          estimatedHours: 6,
        },
      ],
    })
    mockService.getResourcesByLevelAndSubject.mockResolvedValue({
      success: true,
      data: [
        {
          id: 20,
          title: 'Fiche de cours Chapitre 1',
          resourceType: 'PDF',
          fileUrl: '/docs/fiche1.pdf',
          sharedWithTeachers: true,
          description: 'Résumé des formules',
        },
      ],
    })
  })

  it('renders course space with syllabus and switches to resources tab', async () => {
    render(<CourseSpaceView courseId={1} isTeacher={true} />)

    await waitFor(() => {
      expect(screen.getByText('Algèbre et Géométrie')).toBeInTheDocument()
      expect(screen.getByText('MATH101')).toBeInTheDocument()
      expect(screen.getByText('Équations linéaires et systèmes')).toBeInTheDocument()
    })

    // Switch to resources tab
    const resourcesTab = screen.getByRole('button', { name: /Ressources/i })
    fireEvent.click(resourcesTab)

    await waitFor(() => {
      expect(screen.getByText('Fiche de cours Chapitre 1')).toBeInTheDocument()
      expect(screen.getByTitle("Partagé avec l'équipe pédagogique")).toBeInTheDocument()
    })
  })
})
