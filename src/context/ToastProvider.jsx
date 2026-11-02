import { useState, useCallback, useMemo } from 'react'
import { ToastContext } from './toastContext'

let nextToastId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    ({ type = 'info', title = '', message = '', duration = 4000 } = {}) => {
      const id = nextToastId++
      const newToast = { id, type, title, message, duration }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }

      return id
    },
    [removeToast]
  )

  const success = useCallback(
    (message, title = 'Succès', duration) => {
      return addToast({ type: 'success', title, message, duration })
    },
    [addToast]
  )

  const error = useCallback(
    (message, title = 'Erreur', duration = 6000) => {
      return addToast({ type: 'error', title, message, duration })
    },
    [addToast]
  )

  const warning = useCallback(
    (message, title = 'Attention', duration) => {
      return addToast({ type: 'warning', title, message, duration })
    },
    [addToast]
  )

  const info = useCallback(
    (message, title = 'Information', duration) => {
      return addToast({ type: 'info', title, message, duration })
    },
    [addToast]
  )

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info,
    }),
    [toasts, addToast, removeToast, success, error, warning, info]
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
