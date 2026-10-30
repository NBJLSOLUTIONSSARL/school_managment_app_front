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
