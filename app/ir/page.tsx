'use client';
import { useState } from 'react';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Employe = {
  id: number;
  nom: string;
  salaireBrut: number;
  cnss: number;
  amo: number;
  ir: number;
  salaireNet: number;
};

function calculerSalaire(brut: number): Omit<Employe, 'id' | 'nom'> {
  const cnss = Math.min(brut * 0.0448, 339.12);
  const amo = brut * 0.0226;
  const baseIR = brut - cnss - amo;
  let ir = 0;
  if (baseIR <= 2500) ir = 0;
  else if (baseIR <= 4166) ir = (baseIR - 2500) * 0.1;
  else if (baseIR <= 5000) ir = 166.6 + (baseIR - 4166) * 0.2;
  else if (baseIR <= 6666) ir = 333.4 + (baseIR - 5000) * 0.3;
  else if (baseIR <= 15000) ir = 832.8 + (baseIR - 6666) * 0.34;
  else ir = 3666.6 + (baseIR - 15000) * 0.38;
  const salaireNet = brut - cnss - amo - ir;
  return { salaireBrut: brut, cnss, amo, ir, salaireNet };
}

export default function IRPage() {
  const router = useRouter();
  const [employes, setEmployes] = useState<Employe[]>([
    { id: 1, nom: 'Ahmed Benali', ...calculerSalaire(8000) },
    { id: 2, nom: 'Fatima Zahra', ...calculerSalaire(12000) },
    { id: 3, nom: 'Youssef Kadiri', ...calculerSalaire(6000) },
  ]);
  const [form, setForm] = useState({ nom: '', salaireBrut: '' });
  const [showForm, setShowForm] = useState(false);

  const addEmploye = () => {
    if (!form.nom || !form.salaireBrut) return;
    setEmployes([...employes, { id: Date.now(), nom: form.nom, ...calculerSalaire(parseFloat(form.salaireBrut)) }]);
    setForm({ nom: '', salaireBrut: '' });
    setShowForm(false);
  };

  const totalBrut = employes.reduce((s, e) => s + e.salaireBrut, 0);
  const totalCNSS = employes.reduce((s, e) => s + e.cnss, 0);
  const totalIR = employes.reduce((s, e) => s + e.ir, 0);
  const totalNet = employes.reduce((s, e) => s + e.salaireNet, 0);

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
            <Users size={16} /> IR / Salaires
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">IR / Salaires</h1>
            <p className="text-xs text-gray-400 mt-0.5">CNSS · AMO · IR mensuel</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660] transition-colors">
            <Plus size={16} /> Ajouter employé
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Masse salariale brute</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalBrut.toLocaleString()} MAD</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">CNSS à verser</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{totalCNSS.toFixed(0)} MAD</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">IR à verser</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{totalIR.toFixed(0)} MAD</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Masse salariale nette</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{totalNet.toFixed(0)} MAD</p>
            </div>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
              <h2 className="font-semibold text-gray-700 mb-4">Nouvel employé</h2>
              <div className="flex gap-4">
                <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} placeholder="Nom complet" className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                <input value={form.salaireBrut} onChange={e => setForm({...form, salaireBrut: e.target.value})} placeholder="Salaire brut (MAD)" type="number" className="w-48 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                <button onClick={addEmploye} className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660]">Ajouter</button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Annuler</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3">Employé</th>
                  <th className="px-4 py-3 text-right">Salaire Brut</th>
                  <th className="px-4 py-3 text-right">CNSS</th>
                  <th className="px-4 py-3 text-right">AMO</th>
                  <th className="px-4 py-3 text-right">IR</th>
                  <th className="px-4 py-3 text-right">Salaire Net</th>
                </tr>
              </thead>
              <tbody>
                {employes.map(e => (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{e.nom}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{e.salaireBrut.toLocaleString()} MAD</td>
                    <td className="px-4 py-3 text-right text-blue-600">{e.cnss.toFixed(2)} MAD</td>
                    <td className="px-4 py-3 text-right text-purple-600">{e.amo.toFixed(2)} MAD</td>
                    <td className="px-4 py-3 text-right text-red-600">{e.ir.toFixed(2)} MAD</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">{e.salaireNet.toFixed(2)} MAD</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold text-sm">
                  <td className="px-4 py-3 text-gray-600">TOTAL</td>
                  <td className="px-4 py-3 text-right">{totalBrut.toLocaleString()} MAD</td>
                  <td className="px-4 py-3 text-right text-blue-700">{totalCNSS.toFixed(2)} MAD</td>
                  <td className="px-4 py-3 text-right text-purple-700">{employes.reduce((s,e)=>s+e.amo,0).toFixed(2)} MAD</td>
                  <td className="px-4 py-3 text-right text-red-700">{totalIR.toFixed(2)} MAD</td>
                  <td className="px-4 py-3 text-right text-green-700">{totalNet.toFixed(2)} MAD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}