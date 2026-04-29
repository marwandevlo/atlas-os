'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, Trash2, Download, Send, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addDaysYmd, isOverdue, todayYmd } from '@/app/lib/atlas-dates';
import { readInvoicesFromLocalStorage, writeInvoicesToLocalStorage } from '@/app/lib/atlas-invoices-repository';
import type { AtlasInvoice, AtlasInvoiceUiStatut } from '@/app/types/atlas-invoice';
import type { AtlasPaymentTerms, AtlasPaymentTermsPreset } from '@/app/types/atlas-payment-terms';
import { normalizePaymentTerms, paymentTermsLabel } from '@/app/types/atlas-payment-terms';
import { applyUiStatut, computeInvoiceStatut } from '@/app/lib/atlas-invoice-ui';

type FactureRow = {
  id: number;
  numero: string;
  client: string;
  date: string;
  delai: string;
  echeance: string;
  montantHT: number;
  tva: number;
  ttc: number;
  statut: 'payée' | 'en attente' | 'en retard';
};

export default function FacturesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<AtlasInvoice[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [termsKind, setTermsKind] = useState<'30' | '60' | '90' | 'custom'>('30');
  const [termsCustomDays, setTermsCustomDays] = useState('45');
  const [statut, setStatut] = useState<AtlasInvoiceUiStatut>('en attente');
  const [form, setForm] = useState({ numero: '', client: '', date: '', montantHT: '', taux: '20' });

  useEffect(() => {
    const existing = readInvoicesFromLocalStorage();
    if (existing.length) {
      setInvoices(existing);
      return;
    }

    const seed: AtlasInvoice[] = [
      {
        id: 1,
        number: 'F-2026-001',
        clientName: 'Société Alpha',
        issueDate: '2026-04-01',
        amountHT: 15000,
        vatRate: 0.2,
        vatAmount: 3000,
        totalTTC: 18000,
        paymentTerms: { kind: 'preset', days: 30 },
        dueDate: addDaysYmd('2026-04-01', 30),
        status: 'paid',
        paidAt: '2026-04-15',
        paidAmount: 18000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        number: 'F-2026-002',
        clientName: 'Entreprise Beta',
        issueDate: '2026-04-05',
        amountHT: 8500,
        vatRate: 0.2,
        vatAmount: 1700,
        totalTTC: 10200,
        paymentTerms: { kind: 'preset', days: 60 },
        dueDate: addDaysYmd('2026-04-05', 60),
        status: 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        number: 'F-2026-003',
        clientName: 'Client Gamma',
        issueDate: '2026-03-20',
        amountHT: 5000,
        vatRate: 0.2,
        vatAmount: 1000,
        totalTTC: 6000,
        paymentTerms: { kind: 'preset', days: 30 },
        dueDate: addDaysYmd('2026-03-20', 30),
        status: 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setInvoices(seed);
    writeInvoicesToLocalStorage(seed);
  }, []);

  const addFacture = () => {
    if (!form.numero || !form.client || !form.montantHT) return;

    const issueDate = form.date || todayYmd();
    const ht = Number.parseFloat(form.montantHT);
    const vatRate = (Number.parseFloat(form.taux) || 0) / 100;
    const vatAmount = ht * vatRate;
    const totalTTC = ht + vatAmount;

    const paymentTerms: AtlasPaymentTerms =
      termsKind === 'custom'
        ? { kind: 'custom', days: Number.parseInt(termsCustomDays || '0', 10) || 0 }
        : { kind: 'preset', days: Number.parseInt(termsKind, 10) as AtlasPaymentTermsPreset };

    const normalized = normalizePaymentTerms(paymentTerms);
    const dueDate = addDaysYmd(issueDate, normalized.days);

    const now = new Date().toISOString();
    const base: AtlasInvoice = {
      id: Date.now(),
      number: form.numero,
      clientName: form.client,
      issueDate,
      amountHT: ht,
      vatRate,
      vatAmount,
      totalTTC,
      paymentTerms: normalized,
      dueDate,
      status: 'sent',
      createdAt: now,
      updatedAt: now,
    };
    const next = applyUiStatut(base, statut, issueDate);

    const updated = [...invoices, next];
    setInvoices(updated);
    writeInvoicesToLocalStorage(updated);

    setForm({ numero: '', client: '', date: '', montantHT: '', taux: '20' });
    setTermsKind('30');
    setTermsCustomDays('45');
    setStatut('en attente');
    setShowForm(false);
  };

  const dueDatePreview = useMemo(() => {
    const issueDate = form.date || todayYmd();
    const paymentTerms: AtlasPaymentTerms =
      termsKind === 'custom'
        ? { kind: 'custom', days: Number.parseInt(termsCustomDays || '0', 10) || 0 }
        : { kind: 'preset', days: Number.parseInt(termsKind, 10) as AtlasPaymentTermsPreset };
    const normalized = normalizePaymentTerms(paymentTerms);
    return addDaysYmd(issueDate, normalized.days);
  }, [form.date, termsKind, termsCustomDays]);

  const rows: FactureRow[] = useMemo(() => {
    const now = todayYmd();
    return invoices.map((inv) => {
      const statut = computeInvoiceStatut(inv, now);
      return {
        id: inv.id,
        numero: inv.number,
        client: inv.clientName,
        date: inv.issueDate,
        delai: paymentTermsLabel(inv.paymentTerms),
        echeance: inv.dueDate,
        montantHT: inv.amountHT,
        tva: inv.vatAmount,
        ttc: inv.totalTTC,
        statut,
      };
    });
  }, [invoices]);

  const overdueUnpaid = useMemo(() => rows.filter((r) => r.statut === 'en retard'), [rows]);

  const statutColor = (s: FactureRow['statut']) => {
    if (s === 'payée') return 'bg-green-100 text-green-700';
    if (s === 'en attente') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const totals = useMemo(() => {
    const totalFacture = rows.reduce((sum, r) => sum + r.ttc, 0);
    const totalUnpaid = rows.filter((r) => r.statut !== 'payée').reduce((sum, r) => sum + r.ttc, 0);
    const totalOverdue = rows.filter((r) => r.statut === 'en retard').reduce((sum, r) => sum + r.ttc, 0);
    const overdueCount = rows.filter((r) => r.statut === 'en retard').length;
    return { totalFacture, totalUnpaid, totalOverdue, overdueCount };
  }, [rows]);

  const updateInvoiceStatut = (id: number, nextStatut: AtlasInvoiceUiStatut) => {
    const updated = invoices.map((inv) => (inv.id === id ? applyUiStatut(inv, nextStatut) : inv));
    setInvoices(updated);
    writeInvoicesToLocalStorage(updated);
  };

  const markPaid = (id: number) => {
    updateInvoiceStatut(id, 'payée');
  };

  const removeInvoice = (id: number) => {
    const updated = invoices.filter((inv) => inv.id !== id);
    setInvoices(updated);
    writeInvoicesToLocalStorage(updated);
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
            <ArrowLeft size={16} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/15 text-white text-sm">
            <FileText size={16} /> Factures
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Factures</h1>
            <p className="text-xs text-gray-400 mt-0.5">Gestion des factures clients</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660] transition-colors">
            <Plus size={16} /> Nouvelle facture
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Total facturé</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totals.totalFacture.toLocaleString()} MAD</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Reste à encaisser</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{totals.totalUnpaid.toLocaleString()} MAD</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Retards de paiement</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{totals.overdueCount}</p>
            </div>
          </div>

          {totals.overdueCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
              <span className="font-semibold">Alerte paiements :</span> {totals.overdueCount} facture(s) en retard — {totals.totalOverdue.toLocaleString()} MAD.
            </div>
          )}

          {overdueUnpaid.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-red-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 text-sm">Factures impayées en retard</h2>
                <span className="text-xs text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full font-medium">
                  {overdueUnpaid.length} en retard
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3">Numéro</th>
                    <th className="px-6 py-3">Client</th>
                    <th className="px-6 py-3">Date émission</th>
                    <th className="px-6 py-3">Date échéance</th>
                    <th className="px-6 py-3 text-right">TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueUnpaid.map((f) => (
                    <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-700">{f.numero}</td>
                      <td className="px-6 py-3 text-gray-600">{f.client}</td>
                      <td className="px-6 py-3 text-gray-500">{f.date}</td>
                      <td className="px-6 py-3 text-red-700 font-medium">{f.echeance}</td>
                      <td className="px-6 py-3 text-right font-medium text-gray-800">{f.ttc.toLocaleString()} MAD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showForm && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
              <h2 className="font-semibold text-gray-700 mb-4">Nouvelle facture</h2>
              <div className="grid grid-cols-2 gap-4">
                <input value={form.numero} onChange={e => setForm({...form, numero: e.target.value})} placeholder="Numéro (ex: F-2026-004)" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                <input value={form.client} onChange={e => setForm({...form, client: e.target.value})} placeholder="Nom du client" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Date émission</label>
                  <input value={form.date} onChange={e => setForm({...form, date: e.target.value})} type="date" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
                <input value={form.montantHT} onChange={e => setForm({...form, montantHT: e.target.value})} placeholder="Montant HT (MAD)" type="number" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Délai de paiement</label>
                  <div className="flex gap-2">
                    <select value={termsKind} onChange={e => setTermsKind(e.target.value as any)} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400">
                      <option value="30">30 jours</option>
                      <option value="60">60 jours</option>
                      <option value="90">90 jours</option>
                      <option value="custom">Personnalisé</option>
                    </select>
                    {termsKind === 'custom' && (
                      <input
                        value={termsCustomDays}
                        onChange={e => setTermsCustomDays(e.target.value)}
                        placeholder="Jours"
                        type="number"
                        min={0}
                        className="w-28 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Date échéance</label>
                  <input
                    value={dueDatePreview}
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Statut</label>
                  <select
                    value={statut}
                    onChange={(e) => setStatut(e.target.value as AtlasInvoiceUiStatut)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                  >
                    <option value="payée">payé</option>
                    <option value="en attente">en attente</option>
                    <option value="en retard">en retard</option>
                  </select>
                </div>
                <select value={form.taux} onChange={e => setForm({...form, taux: e.target.value})} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400">
                  <option value="20">TVA 20%</option>
                  <option value="14">TVA 14%</option>
                  <option value="10">TVA 10%</option>
                  <option value="7">TVA 7%</option>
                  <option value="0">Exonéré</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={addFacture} className="flex-1 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660] transition-colors">Créer</button>
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3">Numéro</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Date émission</th>
                  <th className="px-4 py-3">Délai</th>
                  <th className="px-4 py-3">Échéance</th>
                  <th className="px-4 py-3 text-right">Montant HT</th>
                  <th className="px-4 py-3 text-right">TVA</th>
                  <th className="px-4 py-3 text-right">TTC</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(f => (
                  <tr
                    key={f.id}
                    className={`border-b hover:bg-gray-50 ${f.statut === 'en retard' ? 'bg-red-50/40 border-red-100' : 'border-gray-50'}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-700">{f.numero}</td>
                    <td className="px-4 py-3 text-gray-600">{f.client}</td>
                    <td className="px-4 py-3 text-gray-500">{f.date}</td>
                    <td className="px-4 py-3 text-gray-500">{f.delai}</td>
                    <td className={`px-4 py-3 ${f.statut === 'en retard' ? 'text-red-700 font-medium' : 'text-gray-500'}`}>{f.echeance}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{f.montantHT.toLocaleString()} MAD</td>
                    <td className="px-4 py-3 text-right text-blue-600">{f.tva.toLocaleString()} MAD</td>
                    <td className="px-4 py-3 text-right font-medium">{f.ttc.toLocaleString()} MAD</td>
                    <td className="px-4 py-3">
                      <select
                        value={f.statut}
                        onChange={(e) => updateInvoiceStatut(f.id, e.target.value as AtlasInvoiceUiStatut)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-100 ${statutColor(f.statut)}`}
                      >
                        <option value="payée">payé</option>
                        <option value="en attente">en attente</option>
                        <option value="en retard">en retard</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {f.statut !== 'payée' && (
                          <button onClick={() => markPaid(f.id)} className="text-gray-300 hover:text-green-600 transition-colors text-xs font-medium">
                            Marquer payée
                          </button>
                        )}
                        <button className="text-gray-300 hover:text-blue-500 transition-colors"><Download size={14} /></button>
                        <button className="text-gray-300 hover:text-green-500 transition-colors"><Send size={14} /></button>
                        <button onClick={() => removeInvoice(f.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}