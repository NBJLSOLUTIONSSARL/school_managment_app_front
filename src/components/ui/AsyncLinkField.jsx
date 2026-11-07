import { useEffect, useId, useRef, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { useI18n } from '@/hooks/useI18n'

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
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef(null)
  const debouncedQuery = useDebounce(query, 300)

  const inputId = useId()
  const listboxId = `${inputId}-listbox`
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`
  const describedBy = [error ? errorId : null, !error && helperText ? helperId : null]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    if (!isOpen || disabled || typeof search !== 'function') return undefined

    let active = true

    Promise.resolve(search(debouncedQuery))
      .then((result) => {
        if (!active) return
        setOptions(Array.isArray(result) ? result : [])
        setActiveIndex(-1)
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
        setActiveIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openList = () => {
    if (disabled) return
    setIsOpen(true)
    setIsLoading(true)
    setQuery('')
  }

  const handleSelect = (option) => {
    onChange?.(option)
    setQuery('')
    setIsLoading(false)
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const handleClear = () => {
    onChange?.(null)
    setQuery('')
    setIsLoading(false)
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (event) => {
    if (disabled) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!isOpen) {
        openList()
        return
      }
      setActiveIndex((previous) => Math.min(previous + 1, options.length - 1))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((previous) => Math.max(previous - 1, 0))
      return
    }

    if (event.key === 'Enter' && isOpen && activeIndex >= 0 && options[activeIndex]) {
      event.preventDefault()
      handleSelect(options[activeIndex])
      return
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault()
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  const activeOptionId =
    activeIndex >= 0 && options[activeIndex] ? `${listboxId}-option-${activeIndex}` : undefined

  return (
    <div className="relative text-start" ref={containerRef}>
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-2xs font-medium text-slate-700">
          {label}
          {required && (
            <span className="ms-0.5 text-rose-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          autoComplete="off"
          value={isOpen ? query : value ? value.label : ''}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={openList}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsLoading(true)
            setActiveIndex(-1)
          }}
          className={`h-8 w-full rounded border bg-white ps-2.5 pe-8 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-offset-0 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 focus:border-slate-800 focus:ring-slate-200'
          } ${disabled ? 'cursor-not-allowed bg-slate-50 text-slate-400' : ''}`}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute end-2 top-2 text-xs text-slate-400"
        >
          {value && !disabled ? '✓' : '🔍'}
        </div>
      </div>

      {isOpen && !disabled && (
        <div
          role="presentation"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded border border-slate-200 bg-white py-1 text-xs shadow-md"
        >
          {isLoading ? (
            <div role="status" className="px-3 py-2 text-2xs text-slate-400">
              {t('common.searchInProgress')}
            </div>
          ) : options.length > 0 ? (
            <div role="listbox" id={listboxId} aria-label={label || doctype}>
              {options.map((option, index) => {
                const isSelected = value?.value === option.value

                return (
                  <div
                    key={option.value}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelect(option)}
                    className={`flex cursor-pointer flex-col px-3 py-1.5 ${
                      activeIndex === index ? 'bg-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-medium text-slate-800">{option.label}</span>
                    {option.subtitle && (
                      <span className="text-2xs text-slate-400">{option.subtitle}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div role="status" className="px-3 py-2 text-2xs text-slate-400">
              {t('common.noResults', { doctype: doctype.toLowerCase() })}
            </div>
          )}

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="w-full border-t border-slate-100 px-3 py-1.5 text-start text-2xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
            >
              {t('common.clearSelection')}
            </button>
          )}
        </div>
      )}

      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-2xs font-medium text-rose-600">
          {typeof error === 'object' && error !== null ? error.message || String(error) : error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mt-1 text-2xs text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}

export default AsyncLinkField
