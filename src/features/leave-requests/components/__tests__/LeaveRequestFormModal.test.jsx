import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LeaveRequestFormModal } from '../LeaveRequestFormModal'
import { leaveRequestService } from '../../api/leaveRequestService'

vi.mock('../../api/leaveRequestService', () => ({
  leaveRequestService: {
    createLeaveRequest: vi.fn(),
    updateLeaveRequest: vi.fn(),
  },
}))

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}

vi.mock('@/hooks/useToast', () => ({
  useToast: () => mockToast,
}))

describe('LeaveRequestFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default annual leave type and allows selecting other options (e.g. SICK)', async () => {
    leaveRequestService.createLeaveRequest.mockResolvedValue({
      success: true,
      data: { id: 105, type: 'SICK' },
    })

    const handleSuccess = vi.fn()
    const handleClose = vi.fn()

    render(
      <LeaveRequestFormModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    )

    const select = screen.getByRole('combobox')
    // Default value is ANNUAL
    expect(select.value).toBe('ANNUAL')

    // Change to SICK
    fireEvent.change(select, { target: { value: 'SICK' } })
    expect(select.value).toBe('SICK')

    // Fill required reason
    const reasonInput = screen.getByPlaceholderText(/Précisez le motif/i)
    fireEvent.change(reasonInput, { target: { value: 'Intervention médicale imprévue.' } })

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /soumettre la demande/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(leaveRequestService.createLeaveRequest).toHaveBeenCalledTimes(1)
    })

    const calledPayload = leaveRequestService.createLeaveRequest.mock.calls[0][0]
    expect(calledPayload.type).toBe('SICK')
    expect(calledPayload.reason).toBe('Intervention médicale imprévue.')

    // Ensure JSON.stringify does NOT throw circular structure error
    expect(() => JSON.stringify(calledPayload)).not.toThrow()
    const jsonStr = JSON.stringify(calledPayload)
    expect(jsonStr).toContain('"type":"SICK"')

    expect(handleSuccess).toHaveBeenCalled()
    expect(handleClose).toHaveBeenCalled()
  })

  it('allows selecting ADMINISTRATIVE and UNPAID leave types without reverting to ANNUAL', async () => {
    render(
      <LeaveRequestFormModal
        isOpen={true}
        onClose={() => {}}
      />
    )

    const select = screen.getByRole('combobox')

    fireEvent.change(select, { target: { value: 'ADMINISTRATIVE' } })
    expect(select.value).toBe('ADMINISTRATIVE')

    fireEvent.change(select, { target: { value: 'UNPAID' } })
    expect(select.value).toBe('UNPAID')
  })

  it('pre-populates the select value when editing an existing leave request', () => {
    const existing = {
      id: 202,
      type: 'ADMINISTRATIVE',
      startDate: '2026-12-10',
      endDate: '2026-12-12',
      reason: 'Démarches administratives.',
    }

    render(
      <LeaveRequestFormModal
        isOpen={true}
        leaveRequest={existing}
        onClose={() => {}}
      />
    )

    const select = screen.getByRole('combobox')
    expect(select.value).toBe('ADMINISTRATIVE')
  })

  it('safely handles onChange when passing simulated DOM nodes or objects with fiber references', async () => {
    leaveRequestService.createLeaveRequest.mockResolvedValue({
      success: true,
      data: { id: 106, type: 'SICK' },
    })

    render(
      <LeaveRequestFormModal
        isOpen={true}
        onClose={() => {}}
      />
    )

    const select = screen.getByRole('combobox')

    // Simulate an object containing circular React fiber references
    const circularFiberObj = { stateNode: null }
    circularFiberObj.stateNode = circularFiberObj

    const syntheticTarget = {
      value: 'SICK',
      __reactFiber$test: circularFiberObj,
    }

    fireEvent.change(select, { target: syntheticTarget })
    expect(select.value).toBe('SICK')

    const reasonInput = screen.getByPlaceholderText(/Précisez le motif/i)
    fireEvent.change(reasonInput, { target: { value: 'Rendez-vous cardiologie' } })

    const submitBtn = screen.getByRole('button', { name: /soumettre la demande/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(leaveRequestService.createLeaveRequest).toHaveBeenCalled()
    })

    const payload = leaveRequestService.createLeaveRequest.mock.calls[0][0]
    expect(typeof payload.type).toBe('string')
    expect(payload.type).toBe('SICK')
    expect(() => JSON.stringify(payload)).not.toThrow()
  })
})
