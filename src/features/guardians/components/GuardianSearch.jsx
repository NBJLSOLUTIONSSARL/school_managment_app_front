import { useState, useEffect, useRef } from 'react'
import { guardianService } from '../api/guardianService'
import { useDebounce } from '@/hooks/useDebounce'
import { Loader } from '@/components/ui/Loader'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/classNames'

export function GuardianSearch({
  value,
  onChange,
  onOpenCreateNew,
  placeholder = 'Rechercher un tuteur (nom, prénom, email)...',
  disabled = false,
  error,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (!isOpen) return
    let active = true
    const fetchGuardians = async () => {
      try {
        const res = await guardianService.searchGuardians({ query: debouncedSearch })
        if (active) {
          if (res.success && Array.isArray(res.data)) {
            setResults(res.data)
          } else {
            setResults([])
          }
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    const task = Promise.resolve().then(fetchGuardians)
    return () => {
      active = false
      task.catch(() => {})
    }
  }, [debouncedSearch, isOpen])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (guardian) => {
    onChange?.(guardian)
    setIsOpen(false)
    setSearchTerm('')
    setIsLoading(false)
  }

  const handleClear = () => {
    onChange?.(null)
    setSearchTerm('')
    setIsLoading(false)
  }

  const selectedUser = value?.user
  const selectedName = selectedUser
    ? `${selectedUser.firstName} ${selectedUser.lastName}`.trim()
    : value?.name || null

  return (
    <div ref={containerRef} className="relative w-full text-xs">
      {value ? (
        <div className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">
          <div className="min-w-0 flex-1">
            <div className="font-medium text-slate-900 truncate">{selectedName}</div>
            <div className="text-2xs text-slate-500 truncate">
              {selectedUser?.email} {selectedUser?.phone ? `• ${selectedUser.phone}` : ''}{' '}
              {value.profession ? `• ${value.profession}` : ''}
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              aria-label="Désélectionner le tuteur"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setIsLoading(true)
                if (!isOpen) setIsOpen(true)
              }}
              onFocus={() => {
                setIsLoading(true)
                setIsOpen(true)
              }}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'w-full rounded border bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400',
                'focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800',
                error ? 'border-red-500' : 'border-slate-200',
                disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed'
              )}
            />
            {isLoading && (
              <div className="absolute right-2.5 top-2.5">
                <Loader size="xs" />
              </div>
            )}
          </div>

          {isOpen && (
            <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded border border-slate-200 bg-white shadow-lg">
              {onOpenCreateNew && (
                <div className="border-b border-slate-100 p-2 bg-slate-50">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="w-full justify-center"
                    onClick={() => {
                      setIsOpen(false)
                      onOpenCreateNew()
                    }}
                  >
                    + Créer un nouveau tuteur
                  </Button>
                </div>
              )}

              {results.length === 0 && !isLoading ? (
                <div className="p-3 text-center text-2xs text-slate-500">
                  Aucun tuteur trouvé {searchTerm ? `pour "${searchTerm}"` : ''}
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {results.map((guardian) => {
                    const u = guardian.user || {}
                    const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Tuteur sans nom'
                    return (
                      <li key={guardian.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(guardian)}
                          className="w-full px-3 py-2 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                        >
                          <div className="font-medium text-slate-900">{name}</div>
                          <div className="text-2xs text-slate-500">
                            {u.email} {u.phone ? `• ${u.phone}` : ''}{' '}
                            {guardian.profession ? `• ${guardian.profession}` : ''}
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-2xs text-red-500">{error}</p>}
    </div>
  )
}

export default GuardianSearch
