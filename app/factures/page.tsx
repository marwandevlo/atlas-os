'use client';
import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Download, Send, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Facture = {
  id: number;
  numero: string;
  client: string;
  date: string;
  montantHT: number;
  tva: number;
  statut: 'payée' | 'en attente' | 'en retard';
};

export default function FacturesPage() {
  const router = useRouter();
  const [factures, setFactures] = useState<Facture[]>([
    { id: 1, numero: 'F-2026-001', client: 'Société Alpha', date: '2026-04-01', montantHT: 15000, tva: 3000, statut: 'payée' },
    { id: 2, numero: 'F-2026-002', client: 'Entreprise Beta', date: '2026-04-05', montantHT: 8500, tva: 1700, statut: 'en attente' },
    { id: 3, numero: 'F-2026-003', client: 'Client Gamma', date: '2026-03-20', montantHT: 5000, tva: 1000, statut: 'en retard' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ numero: '', client: '', date: '', montantHT: '', taux: '20' });

  const addFacture = () => {
    if (!form.numero || !form.client || !form.montantHT) return;
    const ht = parseFloat(form.montantHT);
    const tva = ht * (parseFloat(form.taux) / 100);
    setFactures([...factures, {
      id: Date.now(),
      numero: form.numero,
      client: form.client,
      date: form.date || new Date().toISOString().split('T')[0],
      montantHT: ht,
      tva,
      statut: 'en attente',
    }]);
    setForm({ numero: '', client: '', date: '', montantHT: '', taux: '20' });
    setShowForm(false);
  };

  const statutColor = (s: string) => {
    if (s === 'payée') return 'bg-green-100 text-green-700';
    if (s === 'en attente') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const total = factures.reduce((sum, f) => sum + f.montantHT + f.tva, 0);
  const enAttente = factures.filter(f => f.statut === 'en attente').reduce((sum, f) => sum + f.montantHT + f.tva, 0);

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
              <p className="text-2xl font-bold text-gray-800 mt-1">{total.toLocaleString()} MAD</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">En attente</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{enAttente.toLocaleString()} MAD</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Nombre de factures</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{factures.length}</p>
            </div>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
              <h2 className="font-semibold text-gray-700 mb-4">Nouvelle facture</h2>
              <div className="grid grid-cols-2 gap-4">
                <input value={form.numero} onChange={e => setForm({...form, numero: e.target.value})} placeholder="Numéro (ex: F-2026-004)" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                <input value={form.client} onChange={e => setForm({...form, client: e.target.value})} placeholder="Nom du client" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                <input value={form.date} onChange={e => setForm({...form, date: e.target.value})} type="date" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                <input value={form.montantHT} onChange={e => setForm({...form, montantHT: e.target.value})} placeholder="Montant HT (MAD)" type="number" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
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
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Montant HT</th>
                  <th className="px-4 py-3 text-right">TVA</th>
                  <th className="px-4 py-3 text-right">TTC</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {factures.map(f => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{f.numero}</td>
                    <td className="px-4 py-3 text-gray-600">{f.client}</td>
                    <td className="px-4 py-3 text-gray-500">{f.date}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{f.montantHT.toLocaleString()} MAD</td>
                    <td className="px-4 py-3 text-right text-blue-600">{f.tva.toLocaleString()} MAD</td>
                    <td className="px-4 py-3 text-right font-medium">{(f.montantHT + f.tva).toLocaleString()} MAD</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutColor(f.statut)}`}>{f.statut}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button className="text-gray-300 hover:text-blue-500 transition-colors"><Download size={14} /></button>
                        <button className="text-gray-300 hover:text-green-500 transition-colors"><Send size={14} /></button>
                        <button onClick={() => setFactures(factures.filter(x => x.id !== f.id))} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
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