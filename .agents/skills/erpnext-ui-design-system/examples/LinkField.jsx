import React, { useState, useRef, useEffect } from 'react';

export function LinkField({
  label,
  value,
  onChange,
  onAddNew,
  options = [],
  placeholder = 'Sélectionner...',
  required = false,
  doctype = 'Document',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && (
        <label className="block mb-1 text-2xs font-medium text-slate-600">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={open ? query : value?.label || ''}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setQuery('');
            setOpen(true);
          }}
          placeholder={placeholder}
          className="h-8 w-full rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded border border-slate-200 bg-white py-1 shadow-lg text-xs">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.value}
                onClick={() => {
                  onChange(item);
                  setOpen(false);
                  setQuery('');
                }}
                className="cursor-pointer px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex justify-between items-center"
              >
                <span>{item.label}</span>
                {item.subtitle && (
                  <span className="text-2xs text-slate-400">{item.subtitle}</span>
                )}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-2xs text-slate-400">Aucun résultat</div>
          )}

          {onAddNew && (
            <div
              onClick={() => {
                setOpen(false);
                onAddNew(query);
              }}
              className="border-t border-slate-100 px-3 py-1.5 text-indigo-600 font-medium hover:bg-indigo-50/50 cursor-pointer flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Créer "{query || doctype}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
