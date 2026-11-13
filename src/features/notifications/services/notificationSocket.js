/**
 * WebSocket client for real-time notification dispatching.
 * Connects to /ws/notifications with JWT token.
 */

class NotificationSocket {
  constructor() {
    this.socket = null
    this.token = null
    this.reconnectTimer = null
    this.reconnectDelay = 2000
    this.maxReconnectDelay = 30000
    this.isManuallyClosed = false
    this.subscribers = new Set()
  }

  getWebSocketUrl(token) {
    if (typeof window === 'undefined') return ''
    const isHttps = window.location.protocol === 'https:'
    const wsProto = isHttps ? 'wss:' : 'ws:'
    const host = window.location.host || 'localhost:3000'
    const encodedToken = encodeURIComponent(token || '')
    return `${wsProto}//${host}/ws/notifications?token=${encodedToken}`
  }

  connect(token) {
    if (typeof window === 'undefined' || typeof window.WebSocket === 'undefined') {
      return
    }

    if (!token) {
      this.disconnect()
      return
    }

    // Already connected with same token and ready
    if (
      this.socket &&
      this.token === token &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return
    }

    this.disconnect()
    this.token = token
    this.isManuallyClosed = false

    try {
      const url = this.getWebSocketUrl(token)
      this.socket = new WebSocket(url)

      this.socket.onopen = () => {
        this.reconnectDelay = 2000
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('edutrack:ws-status', { detail: { status: 'connected' } })
          )
        }
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.notifySubscribers(data)

          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('edutrack:ws-notification', { detail: data })
            )
            if (data?.event === 'LEAVE_REQUEST_CREATED') {
              window.dispatchEvent(
                new CustomEvent('edutrack:leave-request-created', { detail: data })
              )
            }
          }
        } catch {
          // Ignore invalid JSON payloads
        }
      }

      this.socket.onclose = (event) => {
        this.socket = null
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('edutrack:ws-status', {
              detail: { status: 'disconnected', code: event.code },
            })
          )
        }

        if (!this.isManuallyClosed && this.token) {
          this.scheduleReconnect()
        }
      }

      this.socket.onerror = () => {
        // Handled by onclose
      }
    } catch {
      if (!this.isManuallyClosed && this.token) {
        this.scheduleReconnect()
      }
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = setTimeout(() => {
      if (!this.isManuallyClosed && this.token) {
        this.connect(this.token)
        this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay)
      }
    }, this.reconnectDelay)
  }

  disconnect() {
    this.isManuallyClosed = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.socket) {
      try {
        this.socket.close()
      } catch {
        // ignore
      }
      this.socket = null
    }
    this.token = null
  }

  subscribe(callback) {
    if (typeof callback === 'function') {
      this.subscribers.add(callback)
    }
    return () => this.unsubscribe(callback)
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback)
  }

  notifySubscribers(data) {
    this.subscribers.forEach((cb) => {
      try {
        cb(data)
      } catch {
        // ignore subscriber errors
      }
    })
  }
}

export const notificationSocket = new NotificationSocket()
