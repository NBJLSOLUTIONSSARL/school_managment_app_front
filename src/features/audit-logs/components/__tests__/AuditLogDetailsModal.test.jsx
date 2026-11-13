import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AuditLogDetailsModal } from '../AuditLogDetailsModal'

describe('AuditLogDetailsModal', () => {
  const sampleLog = {
    id: 42,
    action: 'CREATE',
    entity: 'Student',
    entityId: 101,
    userId: 7,
    username: 'admin@school.edu',
    ipAddress: '192.168.1.50',
    createdAt: '2026-11-12T14:30:00Z',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: { message: 'Étudiant créé avec succès', classId: 3 },
  }

  it('renders modal details correctly with valid date and metadata without throwing', () => {
    const handleClose = vi.fn()
    render(<AuditLogDetailsModal isOpen={true} onClose={handleClose} log={sampleLog} />)

    expect(screen.getByText("Journal d'audit #42")).toBeInTheDocument()
    expect(screen.getByText('Student')).toBeInTheDocument()
    expect(screen.getByText('#101')).toBeInTheDocument()
    expect(screen.getByText(/User #7/)).toBeInTheDocument()
    expect(screen.getByText('192.168.1.50')).toBeInTheDocument()
    expect(screen.getByText(/Mozilla\/5.0/)).toBeInTheDocument()
    expect(screen.getByText(/Étudiant créé avec succès/)).toBeInTheDocument()
  })

  it('handles invalid or missing dates gracefully without crashing', () => {
    const logWithInvalidDate = {
      ...sampleLog,
      id: 99,
      createdAt: 'invalid-date-string',
      details: 'Simple text detail message',
    }

    render(<AuditLogDetailsModal isOpen={true} onClose={() => {}} log={logWithInvalidDate} />)

    expect(screen.getByText("Journal d'audit #99")).toBeInTheDocument()
    expect(screen.getByText(/Enregistré le -/)).toBeInTheDocument()
    expect(screen.getByText('Simple text detail message')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn()
    render(<AuditLogDetailsModal isOpen={true} onClose={handleClose} log={sampleLog} />)

    const closeButtons = screen.getAllByRole('button', { name: /fermer/i })
    fireEvent.click(closeButtons[0])

    expect(handleClose).toHaveBeenCalled()
  })

  it('returns null if log is null or modal is closed', () => {
    const { container: container1 } = render(
      <AuditLogDetailsModal isOpen={true} onClose={() => {}} log={null} />
    )
    expect(container1.firstChild).toBeNull()

    const { container: container2 } = render(
      <AuditLogDetailsModal isOpen={false} onClose={() => {}} log={sampleLog} />
    )
    expect(container2.firstChild).toBeNull()
  })
})
