'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { listAtlasInvoices } from '@/app/lib/atlas-invoices-repository';
import type { AtlasInvoice } from '@/app/types/atlas-invoice';
import { isOverdue, todayYmd } from '@/app/lib/atlas-dates';

type Ecriture = {
  id: number;
  date: string;
  libelle: string;
  compte: string;
  debit: number;
  credit: number;
};

export default function ComptabilitePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'journal' | 'grandlivre' | 'bilan'>('journal');
  const [invoices, setInvoices] = useState<AtlasInvoice[]>([]);
  const [ecritures, setEcritures] = useState<Ecriture[]>([
    { id: 1, date: '2026-04-01', libelle: 'Vente Client Alpha', compte: '3421', debit: 18000, credit: 0 },
    { id: 2, date: '2026-04-01', libelle: 'TVA collectee', compte: '4455', debit: 0, credit: 3000 },
    { id: 3, date: '2026-04-01', libelle: 'Produits ventes', compte: '7111', debit: 0, credit: 15000 },
    { id: 4, date: '2026-04-05', libelle: 'Achat fournitures', compte: '6123', debit: 3000, credit: 0 },
    { id: 5, date: '2026-04-05', libelle: 'TVA deductible', compte: '3455', debit: 600, credit: 0 },
    { id: 6, date: '2026-04-05', libelle: 'Fournisseur X', compte: '4411', debit: 0, credit: 3600 },
  ]);

  const [form, setForm] = useState({ date: '', libelle: '', compte: '', debit: '', credit: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const inv = await listAtlasInvoices();
      if (!cancelled) setInvoices(inv);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalDebit = ecritures.reduce((s, e) => s + e.debit, 0);
  const totalCredit = ecritures.reduce((s, e) => s + e.credit, 0);

  const accountingKpis = useMemo(() => {
    const totalFacture = invoices.reduce((sum, inv) => sum + (inv.totalTTC || 0), 0);
    const totalPaye = invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + (inv.paidAmount ?? inv.totalTTC ?? 0), 0);
    const resteAPayer = invoices.filter((inv) => inv.status !== 'paid').reduce((sum, inv) => sum + (inv.totalTTC || 0), 0);

    const balanceClient = resteAPayer;
    const balanceFournisseur = 0; // reserved for supplier invoices (atlas_supplier_invoices)
    const soldeGlobal = balanceClient - balanceFournisseur;

    const now = todayYmd();
    const overdue = invoices
      .filter((inv) => inv.status !== 'paid' && isOverdue(inv.dueDate, false, now))
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

    return {
      balanceClient,
      balanceFournisseur,
      totalFacture,
      totalPaye,
      resteAPayer,
      soldeGlobal,
      overdue,
    };
  }, [invoices]);

  const addEcriture = () => {
    if (!form.libelle || !form.compte) return;
    setEcritures([...ecritures, {
      id: Date.now(),
      date: form.date || new Date().toISOString().split('T')[0],
      libelle: form.libelle,
      compte: form.compte,
      debit: parseFloat(form.debit) || 0,
      credit: parseFloat(form.credit) || 0,
    }]);
    setForm({ date: '', libelle: '', compte: '', debit: '', credit: '' });
    setShowForm(false);
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
          {(['journal', 'grandlivre', 'bilan'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${activeTab === tab ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}>
              <BookOpen size={16} />
              {tab === 'journal' ? 'Journal' : tab === 'grandlivre' ? 'Grand-livre' : 'Bilan'}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Comptabilite</h1>
            <p className="text-xs text-gray-400 mt-0.5">Journal - Grand-livre - Bilan</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660] transition-colors">
            <Plus size={16} /> Nouvelle ecriture
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Balance client</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">{Math.round(accountingKpis.balanceClient).toLocaleString()} MAD</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Balance fournisseur</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{Math.round(accountingKpis.balanceFournisseur).toLocaleString()} MAD</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Solde global</p>
              <p className={`text-2xl font-bold mt-1 ${accountingKpis.soldeGlobal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.round(accountingKpis.soldeGlobal).toLocaleString()} MAD
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Total facturé</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{Math.round(accountingKpis.totalFacture).toLocaleString()} MAD</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Total payé</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{Math.round(accountingKpis.totalPaye).toLocaleString()} MAD</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Reste à payer</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{Math.round(accountingKpis.resteAPayer).toLocaleString()} MAD</p>
            </div>
          </div>

          {accountingKpis.overdue.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-red-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 text-sm">Alerte paiements · Factures en retard</h2>
                <span className="text-xs text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full font-medium">
                  {accountingKpis.overdue.length} en retard
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
                  {accountingKpis.overdue.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-700">{inv.number}</td>
                      <td className="px-6 py-3 text-gray-600">{inv.clientName}</td>
                      <td className="px-6 py-3 text-gray-500">{inv.issueDate}</td>
                      <td className="px-6 py-3 text-red-700 font-medium">{inv.dueDate}</td>
                      <td className="px-6 py-3 text-right font-medium text-gray-800">{Math.round(inv.totalTTC || 0).toLocaleString()} MAD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Total Debit</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{totalDebit.toLocaleString()} MAD</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Total Credit</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{totalCredit.toLocaleString()} MAD</p>
            </div>
            <div className={`rounded-xl p-5 shadow-sm border ${totalDebit === totalCredit ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-xs text-gray-400">Equilibre</p>
              <p className={`text-2xl font-bold mt-1 ${totalDebit === totalCredit ? 'text-green-600' : 'text-red-600'}`}>
                {totalDebit === totalCredit ? 'Equilibre' : 'Desequilibre'}
              </p>
            </div>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
              <h2 className="font-semibold text-gray-700 mb-4">Nouvelle ecriture comptable</h2>
              <div className="grid grid-cols-3 gap-4">
                <input value={form.date} onChange={e => setForm({...form, date: e.target.value})} type="date" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                <input value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})} placeholder="Libelle" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                <input value={form.compte} onChange={e => setForm({...form, compte: e.target.value})} placeholder="N Compte" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                <input value={form.debit} onChange={e => setForm({...form, debit: e.target.value})} placeholder="Debit (MAD)" type="number" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                <input value={form.credit} onChange={e => setForm({...form, credit: e.target.value})} placeholder="Credit (MAD)" type="number" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                <div className="flex gap-2">
                  <button onClick={addEcriture} className="flex-1 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660]">Ajouter</button>
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Annuler</button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              {(['journal', 'grandlivre', 'bilan'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                  {tab === 'journal' ? 'Journal' : tab === 'grandlivre' ? 'Grand-livre' : 'Bilan'}
                </button>
              ))}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Libelle</th>
                  <th className="px-4 py-3">Compte</th>
                  <th className="px-4 py-3 text-right">Debit</th>
                  <th className="px-4 py-3 text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {ecritures.map(e => (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{e.date}</td>
                    <td className="px-4 py-3 text-gray-700">{e.libelle}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{e.compte}</td>
                    <td className="px-4 py-3 text-right text-blue-600">{e.debit > 0 ? e.debit.toLocaleString() + ' MAD' : '-'}</td>
                    <td className="px-4 py-3 text-right text-green-600">{e.credit > 0 ? e.credit.toLocaleString() + ' MAD' : '-'}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold text-sm">
                  <td colSpan={3} className="px-4 py-3 text-gray-600">TOTAL</td>
                  <td className="px-4 py-3 text-right text-blue-700">{totalDebit.toLocaleString()} MAD</td>
                  <td className="px-4 py-3 text-right text-green-700">{totalCredit.toLocaleString()} MAD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}