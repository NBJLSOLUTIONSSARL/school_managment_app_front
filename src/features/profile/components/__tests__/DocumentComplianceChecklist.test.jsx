import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DocumentComplianceChecklist } from '../DocumentComplianceChecklist'

const mockService = vi.hoisted(() => ({
  getChecklist: vi.fn(),
  archiveDocument: vi.fn(),
}))

vi.mock('../../api/documentTypeService', () => ({
  documentTypeService: mockService,
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

describe('DocumentComplianceChecklist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially and then shows checklist items', async () => {
    mockService.getChecklist.mockResolvedValueOnce({
      success: true,
      data: [
        {
          documentTypeId: 10,
          documentTypeName: 'Extrait d’acte de naissance',
          required: true,
          status: 'MISSING',
          existingDocumentId: null,
          expiresAt: null,
        },
        {
          documentTypeId: 11,
          documentTypeName: 'Certificat médical',
          required: true,
          status: 'APPROVED',
          existingDocumentId: 201,
          expiresAt: '2027-01-01',
        },
      ],
    })

    render(<DocumentComplianceChecklist userId={1} studentId={5} />)

    expect(screen.getByText(/Vérification des pièces justificatives/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Extrait d’acte de naissance')).toBeInTheDocument()
      expect(screen.getByText('Certificat médical')).toBeInTheDocument()
    })

    expect(screen.getByText('Dossier de Conformité Documentaire')).toBeInTheDocument()
    expect(screen.getByText('Approuvé')).toBeInTheDocument()
    expect(screen.getByText('Manquant')).toBeInTheDocument()
  })

  it('handles archiving a document when clicked', async () => {
    mockService.getChecklist.mockResolvedValue({
      success: true,
      data: [
        {
          documentTypeId: 11,
          documentTypeName: 'Certificat médical',
          required: true,
          status: 'APPROVED',
          existingDocumentId: 201,
          expiresAt: '2027-01-01',
        },
      ],
    })
    mockService.archiveDocument.mockResolvedValueOnce({ success: true })

    render(<DocumentComplianceChecklist userId={1} studentId={5} />)

    await waitFor(() => {
      expect(screen.getByText('Certificat médical')).toBeInTheDocument()
    })

    const archiveBtn = screen.getByTitle('Archiver et remplacer')
    fireEvent.click(archiveBtn)

    await waitFor(() => {
      expect(mockService.archiveDocument).toHaveBeenCalledWith(201)
    })
  })
})
