import { useState, useRef, useEffect } from 'react'

export function LinkField({
  label,
  value,
  onChange,
  onAddNew,
  options = [],
  placeholder = 'Rechercher...',
  required = false,
  doctype = 'Document',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
          onFocus={() => {
            setIsOpen(true)
            setQuery('')
          }}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-8 rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:outline-hidden"
        />
        <div className="absolute right-2 top-2 pointer-events-none text-slate-400 text-xs">🔍</div>
      </div>

      {isOpen && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-slate-200 bg-white py-1 shadow-md text-xs">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt)
                  setIsOpen(false)
                }}
                className="cursor-pointer px-3 py-1.5 hover:bg-slate-50 flex flex-col"
              >
                <span className="font-medium text-slate-800">{opt.label}</span>
                {opt.subtitle && <span className="text-2xs text-slate-400">{opt.subtitle}</span>}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-2xs text-slate-400">Aucun résultat</div>
          )}

          {onAddNew && (
            <div
              onClick={() => {
                onAddNew(query)
                setIsOpen(false)
              }}
              className="border-t border-slate-100 px-3 py-1.5 text-2xs font-semibold text-slate-900 hover:bg-slate-50 cursor-pointer"
            >
              + Créer un nouveau {doctype} {query && `"${query}"`}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LinkField
