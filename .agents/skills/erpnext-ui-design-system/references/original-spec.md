---
name: erpnext-ui-design-system
description: Guide complet des principes de design, patterns d'interaction, composants React et classes Tailwind CSS inspirés de Frappe / ERPNext Desk.
version: 1.1.0
tags: [ui, ux, design-system, erpnext, frappe, tailwindcss, react]
---

# Frappe & ERPNext UI Design System (Desk Specification)

Ce document de compétence formalise les règles architecturales, visuelles et interactives pour répliquer ou étendre le système de design de l'écosystème Frappe / ERPNext.

---

## 1. Principes Fondamentaux de Conception

* **Data-Dense & Clean :** Optimiser l'espace d'écran pour afficher des volumes significatifs de données sans bruit visuel.
* **Typographie compacte & hiérarchisée :** Texte fonctionnel en 12px-14px (`text-xs` à `text-sm`), contrastes contrôlés (`gray-500` pour les libellés, `gray-900` pour les valeurs).
* **Keyboard-First :** Intégration systématique des raccourcis clavier (`Ctrl+K` pour la barre de commande, `Ctrl+S` pour la sauvegarde).
* **Consistance DocType :** Toutes les entités métier suivent la même disposition : Barre d'outils supérieure, barre d'actions, formulaire découpé en sections, volet latéral de métadonnées et journal d'activité (Timeline).

---

## 2. Spécifications du Thème Tailwind CSS

Configuration recommandée pour correspondre à la palette et à la densité de Frappe Desk :

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        frappe: {
          bg: '#f8fafc',
          surface: '#ffffff',
          border: '#e2e8f0',
          hover: '#f1f5f9',
          muted: '#64748b',
          dark: '#0f172a'
        }
      },
      fontSize: {
        '2xs': ['11px', '14px'],
        'xs': ['12px', '16px'],
        'sm': ['13px', '18px'],
        'base': ['14px', '20px'],
      },
      borderRadius: {
        DEFAULT: '4px',
        md: '6px',
      }
    }
  }
}
```

---

## 3. Composants React & Tailwind Réutilisables

### 3.1. En-Tête Standard de Page (`DocTypePageHead.jsx`)

En-tête sticky contenant le fil d'Ariane, l'identifiant du document, le badge d'état et les boutons d'action contextuels.

```jsx
import React from 'react';

const statusVariants = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  Submitted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  Overdue: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function DocTypePageHead({
  breadcrumbs = [],
  title,
  docstatus = 'Draft',
  primaryAction,
  onPrimaryAction,
  secondaryActions = [],
  onMenuAction,
}) {
  return (
    <div className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Fil d'Ariane & Titre */}
      <div className="flex items-center gap-3">
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-400">/</span>}
              <span className="hover:text-slate-800 cursor-pointer font-normal">{crumb}</span>
            </React.Fragment>
          ))}
        </nav>
        <span className="hidden md:inline text-slate-300">|</span>
        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h1>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium border ${
            statusVariants[docstatus] || statusVariants.Draft
          }`}
        >
          {docstatus}
        </span>
      </div>

      {/* Barre d'Actions */}
      <div className="flex items-center gap-2">
        {secondaryActions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            onClick={action.onClick}
            className="inline-flex h-8 items-center rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-slate-300"
          >
            {action.label}
          </button>
        ))}

        {primaryAction && (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="inline-flex h-8 items-center rounded bg-slate-900 px-3.5 text-xs font-medium text-white shadow-2xs hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
          >
            {primaryAction}
          </button>
        )}

        {onMenuAction && (
          <button
            type="button"
            onClick={onMenuAction}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 focus:outline-hidden"
            title="Options supplémentaires"
          >
            •••
          </button>
        )}
      </div>
    </div>
  );
}
```

---

### 3.2. Champ de Liaison Autocomplete (`LinkField.jsx`)

Composant de référence pour lier des documents entre eux (relations de type Foreign Key) avec filtre instantané et option de création rapide.

```jsx
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
```

---

### 3.3. Tableau Enfant Éditable (`ChildTableGrid.jsx`)

Tableau dense pour la saisie de lignes multiples (articles de commande, écritures comptables, tâches).

```jsx
import React from 'react';

export function ChildTableGrid({ columns, rows, onRowChange, onAddRow, onRemoveRow }) {
  return (
    <div className="w-full rounded border border-slate-200 bg-white overflow-hidden text-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <th className="w-10 px-2 py-2 text-center text-slate-400">#</th>
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-2 font-medium" style={{ width: col.width || 'auto' }}>
                  {col.label}
                </th>
              ))}
              <th className="w-12 px-2 py-2 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70 group">
                <td className="px-2 py-2 text-center text-slate-400 text-2xs">{idx + 1}</td>
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-1.5">
                    {col.editable ? (
                      <input
                        type={col.type || 'text'}
                        value={row[col.key] || ''}
                        onChange={(e) => onRowChange(idx, col.key, e.target.value)}
                        className="w-full h-7 rounded border border-transparent hover:border-slate-300 focus:border-slate-800 focus:bg-white px-2 text-xs bg-transparent transition-colors focus:outline-hidden"
                      />
                    ) : (
                      <span className="text-slate-800">{row[col.key]}</span>
                    )}
                  </td>
                ))}
                <td className="px-2 py-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveRow(idx)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 font-medium text-xs transition-opacity"
                    title="Supprimer la ligne"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-6 text-center text-slate-400 text-xs">
                  Aucun élément renseigné
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-200 bg-slate-50/50 p-2">
        <button
          type="button"
          onClick={onAddRow}
          className="inline-flex items-center text-2xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded px-2.5 py-1 hover:bg-slate-50 shadow-2xs"
        >
          + Ajouter une ligne
        </button>
      </div>
    </div>
  );
}
```

---

### 3.4. Timeline & Journal d'Activité (`DocTimeline.jsx`)

Affiche l'historique non altérable du document : commentaires de l'équipe, modifications de statut et journaux d'audit.

```jsx
import React from 'react';

export function DocTimeline({ activities = [] }) {
  return (
    <div className="w-full space-y-4 pt-6 border-t border-slate-200 mt-8 text-xs">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Activité & Historique
      </h3>
      <div className="relative pl-6 space-y-4 before:absolute before:bottom-0 before:top-2 before:left-2 before:w-px before:bg-slate-200">
        {activities.map((item, idx) => (
          <div key={idx} className="relative flex items-start gap-3">
            <div className="absolute -left-6 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-slate-400 ring-2 ring-slate-100" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">{item.user}</span>
                <span className="text-2xs text-slate-400">{item.time}</span>
              </div>
              <p className="mt-0.5 text-slate-600">{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 4. Exemple d'Assemblage Page DocType (`SalesInvoiceView.jsx`)

Exemple complet combinant les composants pour reproduire l'agencement standard d'un formulaire ERPNext (panneau latéral de métadonnées + contenu principal).

```jsx
import React, { useState } from 'react';
import { DocTypePageHead } from './DocTypePageHead';
import { LinkField } from './LinkField';
import { ChildTableGrid } from './ChildTableGrid';
import { DocTimeline } from './DocTimeline';

export default function SalesInvoiceView() {
  const [docstatus, setDocstatus] = useState('Draft');
  const [customer, setCustomer] = useState(null);
  const [items, setItems] = useState([
    { item_code: 'SRV-001', qty: '1', rate: '250.00', amount: '250.00' }
  ]);

  const columns = [
    { key: 'item_code', label: 'Article', editable: true, width: '40%' },
    { key: 'qty', label: 'Quantité', editable: true, width: '20%' },
    { key: 'rate', label: 'Prix Unitaire', editable: true, width: '20%' },
    { key: 'amount', label: 'Montant', editable: false, width: '20%' },
  ];

  const handleAddRow = () => {
    setItems([...items, { item_code: '', qty: '1', rate: '0.00', amount: '0.00' }]);
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'qty' || field === 'rate') {
      const q = parseFloat(updated[index].qty) || 0;
      const r = parseFloat(updated[index].rate) || 0;
      updated[index].amount = (q * r).toFixed(2);
    }
    setItems(updated);
  };

  const handleRemoveRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <DocTypePageHead
        breadcrumbs={['Comptabilité', 'Factures de vente']}
        title="ACC-SINV-2026-00042"
        docstatus={docstatus}
        primaryAction={docstatus === 'Draft' ? 'Enregistrer' : 'Modifier'}
        onPrimaryAction={() => setDocstatus('Submitted')}
        secondaryActions={[{ label: 'Imprimer', onClick: () => {} }]}
        onMenuAction={() => {}}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Volet Latéral / Métadonnées DocType */}
        <aside className="md:col-span-1 space-y-4">
          <div className="rounded border border-slate-200 bg-white p-4 shadow-2xs space-y-3 text-xs">
            <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Détails</h4>
            <div>
              <span className="text-2xs text-slate-400 block">Créé par</span>
              <span className="text-slate-700">admin@frappe.local</span>
            </div>
            <div>
              <span className="text-2xs text-slate-400 block">Date de comptabilisation</span>
              <span className="text-slate-700">30-10-2026</span>
            </div>
            <div>
              <span className="text-2xs text-slate-400 block">Assigné à</span>
              <span className="text-slate-500 italic">Non assigné</span>
            </div>
          </div>
        </aside>

        {/* Formulaire Principal */}
        <main className="md:col-span-3 space-y-6">
          <section className="rounded border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Informations Générales
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LinkField
                label="Client"
                required
                value={customer}
                onChange={setCustomer}
                options={[
                  { label: 'Client Alpha SAS', value: 'CUST-001', subtitle: 'Paris' },
                  { label: 'Société Beta Inc', value: 'CUST-002', subtitle: 'Lyon' },
                ]}
              />
              <div>
                <label className="block mb-1 text-2xs font-medium text-slate-600">
                  Date d'échéance
                </label>
                <input
                  type="date"
                  className="h-8 w-full rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-900 shadow-2xs focus:border-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Lignes d'articles
              </h2>
              <ChildTableGrid
                columns={columns}
                rows={items}
                onRowChange={handleRowChange}
                onAddRow={handleAddRow}
                onRemoveRow={handleRemoveRow}
              />
            </div>

            {/* Total Section */}
            <div className="flex justify-end pt-4 border-t border-slate-100 text-xs">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Total HT :</span>
                  <span>{items.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-200 pt-1.5">
                  <span>Grand Total (EUR) :</span>
                  <span>{items.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0).toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <DocTimeline
              activities={[
                { user: 'Administrateur', time: 'Il y a 10 minutes', content: 'Document créé en statut Brouillon' }
              ]}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
```