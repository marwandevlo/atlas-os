'use client';
import { useState } from 'react';
import { Upload, Plus, Trash2, CheckCircle, AlertCircle, Download, ArrowLeft } from 'lucide-react';

type Facture = {
  id: number;
  ref: string;
  fournisseur: string;
  montantHT: number;
  tva: number;
  type: 'vente' | 'achat';
};

export default function TVAPage() {
  const [activeTab, setActiveTab] = useState<'ventes' | 'achats' | 'declaration'>('ventes');
  const [factures, setFactures] = useState<Facture[]>([
    { id: 1, ref: 'F-001', fournisseur: 'Client A', montantHT: 10000, tva: 2000, type: 'vente' },
    { id: 2, ref: 'F-002', fournisseur: 'Client B', montantHT: 5000, tva: 1000, type: 'vente' },
    { id: 3, ref: 'A-001', fournisseur: 'Fournisseur X', montantHT: 3000, tva: 600, type: 'achat' },
  ]);

  const [newFacture, setNewFacture] = useState({ ref: '', fournisseur: '', montantHT: '', taux: '20' });
  const [uploading, setUploading] = useState(false);
  const [declared, setDeclared] = useState(false);

  const ventes = factures.filter(f => f.type === 'vente');
  const achats = factures.filter(f => f.type === 'achat');
  const tvaCollectee = ventes.reduce((sum, f) => sum + f.tva, 0);
  const tvaDeductible = achats.reduce((sum, f) => sum + f.tva, 0);
  const tvaAPayer = tvaCollectee - tvaDeductible;

  const addFacture = () => {
    if (!newFacture.ref || !newFacture.fournisseur || !newFacture.montantHT) return;
    const ht = parseFloat(newFacture.montantHT);
    const tva = ht * (parseFloat(newFacture.taux) / 100);
    setFactures([...factures, {
      id: Date.now(),
      ref: newFacture.ref,
      fournisseur: newFacture.fournisseur,
      montantHT: ht,
      tva,
      type: activeTab === 'ventes' ? 'vente' : 'achat',
    }]);
    setNewFacture({ ref: '', fournisseur: '', montantHT: '', taux: '20' });
  };

  const deleteFacture = (id: number) => {
    setFactures(factures.filter(f => f.id !== id));
  };

  const simulateUpload = () => {
    setUploading(true);
    setTimeout(() => setUploading(false), 2000);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1B2A4A] flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <p className="text-white font-bold text-base">Atlas OS</p>
          <p className="text-white/40 text-xs">Enterprise</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <a href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white text-sm transition-all">
            <ArrowLeft size={16} /> Dashboard
          </a>
          {['ventes', 'achats', 'declaration'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'ventes' | 'achats' | 'declaration')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${activeTab === tab ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
            >
              {tab === 'ventes' ? 'Ventes' : tab === 'achats' ? 'Achats' : 'Déclaration'}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-xl font-bold text-gray-800">Déclaration TVA</h1>
          <p className="text-xs text-gray-400 mt-0.5">Période: Avril 2026</p>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">TVA Collectée</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{tvaCollectee.toLocaleString()} MAD</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">TVA Déductible</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{tvaDeductible.toLocaleString()} MAD</p>
            </div>
            <div className={`rounded-xl p-5 shadow-sm border ${tvaAPayer > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <p className="text-xs text-gray-400">TVA à Payer</p>
              <p className={`text-2xl font-bold mt-1 ${tvaAPayer > 0 ? 'text-red-600' : 'text-green-600'}`}>{tvaAPayer.toLocaleString()} MAD</p>
            </div>
          </div>

          {/* Upload IA */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Upload size={16} className="text-blue-500" />
              Import automatique par IA
            </h2>
            <div
              onClick={simulateUpload}
              className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-blue-600">Analyse IA en cours...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={24} className="text-gray-400" />
                  <p className="text-sm text-gray-500">Déposez vos factures, relevés bancaires ou PDF</p>
                  <p className="text-xs text-gray-400">L'IA extrait automatiquement les données TVA</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              {['ventes', 'achats'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'ventes' | 'achats')}
                  className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tab === 'ventes' ? `Ventes (${ventes.length})` : `Achats (${achats.length})`}
                </button>
              ))}
            </div>

            {/* Add Row */}
            <div className="flex gap-2 p-4 bg-gray-50 border-b border-gray-100">
              <input value={newFacture.ref} onChange={e => setNewFacture({...newFacture, ref: e.target.value})} placeholder="Réf." className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
              <input value={newFacture.fournisseur} onChange={e => setNewFacture({...newFacture, fournisseur: e.target.value})} placeholder={activeTab === 'ventes' ? 'Client' : 'Fournisseur'} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
              <input value={newFacture.montantHT} onChange={e => setNewFacture({...newFacture, montantHT: e.target.value})} placeholder="Montant HT" type="number" className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
              <select value={newFacture.taux} onChange={e => setNewFacture({...newFacture, taux: e.target.value})} className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400">
                <option value="20">20%</option>
                <option value="14">14%</option>
                <option value="10">10%</option>
                <option value="7">7%</option>
              </select>
              <button onClick={addFacture} className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                <Plus size={14} /> Ajouter
              </button>
            </div>

            {/* Table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="px-4 py-3">Référence</th>
                  <th className="px-4 py-3">{activeTab === 'ventes' ? 'Client' : 'Fournisseur'}</th>
                  <th className="px-4 py-3 text-right">Montant HT</th>
                  <th className="px-4 py-3 text-right">TVA</th>
                  <th className="px-4 py-3 text-right">TTC</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'ventes' ? ventes : achats).map(f => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{f.ref}</td>
                    <td className="px-4 py-3 text-gray-600">{f.fournisseur}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{f.montantHT.toLocaleString()} MAD</td>
                    <td className="px-4 py-3 text-right text-blue-600">{f.tva.toLocaleString()} MAD</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{(f.montantHT + f.tva).toLocaleString()} MAD</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deleteFacture(f.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Declaration Button */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              Déclaration TVA — Avril 2026
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-16"><span className="text-gray-500">TVA collectée:</span><span className="font-medium">{tvaCollectee.toLocaleString()} MAD</span></div>
                <div className="flex justify-between gap-16"><span className="text-gray-500">TVA déductible:</span><span className="font-medium text-green-600">- {tvaDeductible.toLocaleString()} MAD</span></div>
                <div className="flex justify-between gap-16 font-bold text-base pt-1 border-t border-gray-200 mt-1"><span>Net à payer:</span><span className="text-red-600">{tvaAPayer.toLocaleString()} MAD</span></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Download size={14} /> Télécharger PDF
              </button>
              <button
                onClick={() => setDeclared(true)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${declared ? 'bg-green-500 text-white' : 'bg-[#1B2A4A] text-white hover:bg-[#243660]'}`}
              >
                {declared ? <><CheckCircle size={14} /> Déclaré</> : 'Déclarer automatiquement'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}