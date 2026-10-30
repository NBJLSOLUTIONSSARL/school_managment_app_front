import { useState, useCallback } from 'react'

/**
 * Hook to manage modal/dialog visibility state.
 * @param {boolean} [initialState=false]
 */
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState)
  const [modalData, setModalData] = useState(null)

  const open = useCallback((data = null) => {
    setModalData(data)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setModalData(null)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return {
    isOpen,
    data: modalData,
    open,
    close,
    toggle,
  }
}

export default useModal
