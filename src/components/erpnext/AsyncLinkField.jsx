import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

export function AsyncLinkField({
  label,
  value,
  onChange,
  search,
  placeholder = 'Rechercher...',
  required = false,
  doctype = 'Document',
  helperText,
  error,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef(null)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!isOpen || disabled) return undefined

    let active = true

    Promise.resolve(search(debouncedQuery))
      .then((result) => {
        if (active) setOptions(Array.isArray(result) ? result : [])
      })
      .catch(() => {
        if (active) setOptions([])
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [debouncedQuery, isOpen, disabled, search])

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setIsLoading(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option) => {
    onChange(option)
    setQuery('')
    setIsLoading(false)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setQuery('')
    setIsLoading(false)
    setIsOpen(false)
  }

  return (
    <div className="relative text-left" ref={containerRef}>
      {label && (
        <label className="block text-2xs font-medium text-slate-700 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={isOpen ? query : value ? value.label : ''}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => {
            if (disabled) return
            setIsOpen(true)
            setIsLoading(true)
            setQuery('')
          }}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsLoading(true)
          }}
          className={`w-full h-8 rounded border bg-white px-2.5 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden ${
            error
              ? 'border-rose-300 focus:border-rose-500'
              : 'border-slate-300 focus:border-slate-800'
          } ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
        />
        <div className="absolute right-2 top-2 pointer-events-none text-slate-400 text-xs">
          {value && !disabled ? '✓' : '🔍'}
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded border border-slate-200 bg-white py-1 shadow-md text-xs">
          {isLoading ? (
            <div className="px-3 py-2 text-2xs text-slate-400">Recherche en cours...</div>
          ) : options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className="cursor-pointer px-3 py-1.5 hover:bg-slate-50 flex flex-col"
              >
                <span className="font-medium text-slate-800">{option.label}</span>
                {option.subtitle && <span className="text-2xs text-slate-400">{option.subtitle}</span>}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-2xs text-slate-400">
              Aucun {doctype.toLowerCase()} trouvé
            </div>
          )}

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="w-full border-t border-slate-100 px-3 py-1.5 text-left text-2xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Effacer la sélection
            </button>
          )}
        </div>
      )}

      {error ? (
        <p className="mt-1 text-2xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-2xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
}

export default AsyncLinkField
