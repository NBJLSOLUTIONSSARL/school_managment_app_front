import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { notificationSocket } from '../notificationSocket'

describe('notificationSocket service', () => {
  let mockWsInstances = []

  class MockWebSocket {
    constructor(url) {
      this.url = url
      this.readyState = 0 // CONNECTING
      this.onopen = null
      this.onmessage = null
      this.onclose = null
      this.onerror = null
      mockWsInstances.push(this)
    }

    close(code = 1000) {
      this.readyState = 3 // CLOSED
      if (this.onclose) {
        this.onclose({ code })
      }
    }
  }

  beforeEach(() => {
    mockWsInstances = []
    global.WebSocket = MockWebSocket
    notificationSocket.disconnect()
  })

  afterEach(() => {
    notificationSocket.disconnect()
    delete global.WebSocket
  })

  it('builds ws URL and connects when token is provided', () => {
    notificationSocket.connect('my-jwt-token')

    expect(mockWsInstances).toHaveLength(1)
    expect(mockWsInstances[0].url).toContain('/ws/notifications?token=my-jwt-token')
  })

  it('dispatches edutrack:ws-notification and calls subscribers on message', () => {
    const subscriber = vi.fn()
    const unsubscribe = notificationSocket.subscribe(subscriber)

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    notificationSocket.connect('test-token')
    const wsInstance = mockWsInstances[0]

    const messageData = {
      event: 'LEAVE_REQUEST_CREATED',
      leaveRequestId: 123,
      message: 'Nouvelle demande de congé',
    }

    wsInstance.onmessage({
      data: JSON.stringify(messageData),
    })

    expect(subscriber).toHaveBeenCalledWith(messageData)
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'edutrack:ws-notification',
        detail: messageData,
      })
    )
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'edutrack:leave-request-created',
        detail: messageData,
      })
    )

    unsubscribe()
  })

  it('disconnects and cleans up socket', () => {
    notificationSocket.connect('test-token')
    const wsInstance = mockWsInstances[0]
    const closeSpy = vi.spyOn(wsInstance, 'close')

    notificationSocket.disconnect()

    expect(closeSpy).toHaveBeenCalled()
    expect(notificationSocket.socket).toBeNull()
  })
})
