'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Plus, Trash2, Search, HandCoins, Building2 } from 'lucide-react';
import type { AtlasClient } from '@/app/types/atlas-client';
import { normalizePaymentTerms, paymentTermsLabel, type AtlasPaymentTermsPreset } from '@/app/types/atlas-payment-terms';
import { readClientsFromLocalStorage, writeClientsToLocalStorage } from '@/app/lib/atlas-clients-repository';
import { readInvoicesFromLocalStorage } from '@/app/lib/atlas-invoices-repository';
import { readSupplierInvoicesFromLocalStorage, writeSupplierInvoicesToLocalStorage } from '@/app/lib/atlas-supplier-invoices-repository';
import type { AtlasInvoice } from '@/app/types/atlas-invoice';
import type { AtlasSupplierInvoice } from '@/app/types/atlas-supplier-invoice';
import { isOverdue, todayYmd } from '@/app/lib/atlas-dates';

type Tab = 'clients' | 'fournisseurs';

function money(n: number): string {
  return Math.round(n).toLocaleString('fr-MA') + ' MAD';
}

export default function ClientsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('clients');
  const [search, setSearch] = useState('');

  const [clients, setClients] = useState<AtlasClient[]>([]);
  const [supplierInvoices, setSupplierInvoices] = useState<AtlasSupplierInvoice[]>([]);
  const [invoices, setInvoices] = useState<AtlasInvoice[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [termsKind, setTermsKind] = useState<'30' | '60' | '90' | 'custom'>('30');
  const [termsCustomDays, setTermsCustomDays] = useState('45');

  useEffect(() => {
    setClients(readClientsFromLocalStorage());
    setInvoices(readInvoicesFromLocalStorage());
    setSupplierInvoices(readSupplierInvoicesFromLocalStorage());
  }, []);

  const now = todayYmd();

  const clientBalances = useMemo(() => {
    const normalized = (name: string) => name.trim().toLowerCase();
    const byClient = new Map<string, { totalFacture: number; totalPaye: number; overdueCount: number; overdueAmount: number }>();
    invoices.forEach((inv) => {
      const key = normalized(inv.clientName);
      const existing = byClient.get(key) ?? { totalFacture: 0, totalPaye: 0, overdueCount: 0, overdueAmount: 0 };
      existing.totalFacture += inv.totalTTC || 0;
      if (inv.status === 'paid') existing.totalPaye += inv.paidAmount ?? inv.totalTTC ?? 0;
      if (isOverdue(inv.dueDate, inv.status === 'paid', now)) {
        existing.overdueCount += 1;
        existing.overdueAmount += inv.totalTTC || 0;
      }
      byClient.set(key, existing);
    });

    const rows = clients.map((c) => {
      const b = byClient.get(normalized(c.name)) ?? { totalFacture: 0, totalPaye: 0, overdueCount: 0, overdueAmount: 0 };
      const reste = Math.max(0, b.totalFacture - b.totalPaye);
      return {
        client: c,
        totalFacture: b.totalFacture,
        totalPaye: b.totalPaye,
        reste,
        solde: reste,
        overdueCount: b.overdueCount,
        overdueAmount: b.overdueAmount,
      };
    });

    return rows.sort((a, b) => b.reste - a.reste);
  }, [clients, invoices, now]);

  const supplierBalance = useMemo(() => {
    const totalFacture = supplierInvoices.reduce((sum, inv) => sum + (inv.totalTTC || 0), 0);
    const totalPaye = supplierInvoices.filter((i) => i.status === 'paid').reduce((sum, inv) => sum + (inv.totalTTC || 0), 0);
    const unpaid = supplierInvoices.filter((i) => i.status !== 'paid');
    const overdue = unpaid.filter((i) => isOverdue(i.dueDate, false, now));
    return {
      totalFacture,
      totalPaye,
      reste: Math.max(0, totalFacture - totalPaye),
      solde: Math.max(0, totalFacture - totalPaye),
      overdueCount: overdue.length,
      overdueAmount: overdue.reduce((sum, inv) => sum + (inv.totalTTC || 0), 0),
    };
  }, [supplierInvoices, now]);

  const filteredClientBalances = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientBalances;
    return clientBalances.filter((r) => r.client.name.toLowerCase().includes(q));
  }, [clientBalances, search]);

  const addClient = () => {
    const name = formName.trim();
    if (!name) return;

    const paymentTerms =
      termsKind === 'custom'
        ? normalizePaymentTerms({ kind: 'custom', days: Number.parseInt(termsCustomDays || '0', 10) || 0 })
        : normalizePaymentTerms({ kind: 'preset', days: Number.parseInt(termsKind, 10) as AtlasPaymentTermsPreset });

    const nowIso = new Date().toISOString();
    const next: AtlasClient = {
      id: Date.now(),
      name,
      paymentTerms,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    const updated = [...clients, next];
    setClients(updated);
    writeClientsToLocalStorage(updated);
    setFormName('');
    setTermsKind('30');
    setTermsCustomDays('45');
    setShowForm(false);
  };

  const deleteClient = (id: number) => {
    const updated = clients.filter((c) => c.id !== id);
    setClients(updated);
    writeClientsToLocalStorage(updated);
  };

  const markAllSuppliersPaid = () => {
    const updated = supplierInvoices.map((inv) => ({ ...inv, status: 'paid' as const, paidAt: now, updatedAt: new Date().toISOString() }));
    setSupplierInvoices(updated);
    writeSupplierInvoicesToLocalStorage(updated);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-[#1B2A4A] flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <p className="text-white font-bold text-base">Atlas OS</p>
          <p className="text-white/40 text-xs">Enterprise</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white text-sm transition-all">
            <ArrowLeft size={16} /> Tableau de bord
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/15 text-white text-sm">
            <Users size={16} /> Clients & fournisseurs
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Clients & fournisseurs</h1>
            <p className="text-xs text-gray-400 mt-0.5">Délais de paiement, balances et retards</p>
          </div>
          {tab === 'clients' && (
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660] transition-colors">
              <Plus size={16} /> Nouveau client
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setTab('clients')} className={`px-4 py-2 rounded-lg text-sm font-medium border ${tab === 'clients' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              <Users size={14} className="inline-block mr-2" />
              Clients
            </button>
            <button onClick={() => setTab('fournisseurs')} className={`px-4 py-2 rounded-lg text-sm font-medium border ${tab === 'fournisseurs' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              <Building2 size={14} className="inline-block mr-2" />
              Fournisseurs
            </button>
            <div className="ml-auto relative w-80 max-w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tab === 'clients' ? 'Rechercher un client…' : 'Rechercher…'} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white" />
            </div>
          </div>

          {tab === 'clients' ? (
            <>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">Total facturé</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{money(clientBalances.reduce((s, r) => s + r.totalFacture, 0))}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">Total payé</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{money(clientBalances.reduce((s, r) => s + r.totalPaye, 0))}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">Reste à encaisser</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{money(clientBalances.reduce((s, r) => s + r.reste, 0))}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">Retards de paiement</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{clientBalances.reduce((s, r) => s + r.overdueCount, 0)}</p>
                </div>
              </div>

              {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
                  <h2 className="font-semibold text-gray-700 mb-4">Nouveau client</h2>
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <div className="col-span-1">
                      <label className="text-xs text-gray-500 mb-1 block">Nom du client</label>
                      <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex : Société Alpha" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                    </div>
                    <div className="col-span-1">
                      <label className="text-xs text-gray-500 mb-1 block">Délai de paiement par défaut</label>
                      <div className="flex gap-2">
                        <select value={termsKind} onChange={(e) => setTermsKind(e.target.value as any)} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400">
                          <option value="30">30 jours</option>
                          <option value="60">60 jours</option>
                          <option value="90">90 jours</option>
                          <option value="custom">Personnalisé</option>
                        </select>
                        {termsKind === 'custom' && (
                          <input value={termsCustomDays} onChange={(e) => setTermsCustomDays(e.target.value)} type="number" min={0} placeholder="Jours" className="w-28 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 flex gap-2">
                      <button onClick={addClient} className="flex-1 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660] transition-colors">Ajouter</button>
                      <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Délai de paiement</th>
                      <th className="px-4 py-3 text-right">Total facturé</th>
                      <th className="px-4 py-3 text-right">Total payé</th>
                      <th className="px-4 py-3 text-right">Reste à payer</th>
                      <th className="px-4 py-3 text-right">Solde</th>
                      <th className="px-4 py-3 text-right">Retards</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClientBalances.map((r) => (
                      <tr key={r.client.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-700">{r.client.name}</td>
                        <td className="px-4 py-3 text-gray-500">{paymentTermsLabel(r.client.paymentTerms)}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{money(r.totalFacture)}</td>
                        <td className="px-4 py-3 text-right text-green-700">{money(r.totalPaye)}</td>
                        <td className="px-4 py-3 text-right text-amber-700">{money(r.reste)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{money(r.solde)}</td>
                        <td className="px-4 py-3 text-right">
                          {r.overdueCount > 0 ? (
                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <HandCoins size={12} /> {r.overdueCount} ({money(r.overdueAmount)})
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => deleteClient(r.client.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredClientBalances.length === 0 && (
                      <tr>
                        <td className="px-4 py-8 text-center text-sm text-gray-400" colSpan={8}>Aucun client</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">Total facturé</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{money(supplierBalance.totalFacture)}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">Total payé</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{money(supplierBalance.totalPaye)}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">Reste à payer</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{money(supplierBalance.reste)}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">Retards de paiement</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{supplierBalance.overdueCount}</p>
                </div>
              </div>

              {supplierInvoices.length === 0 ? (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-sm text-gray-600">
                  Aucune facture fournisseur pour le moment. Vous pouvez en créer depuis <span className="font-medium">Documents IA</span> après analyse OCR.
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">Factures fournisseurs</p>
                    <button onClick={markAllSuppliersPaid} className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition-colors">
                      Marquer tout comme payé
                    </button>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Total : {supplierInvoices.length} facture(s).
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

