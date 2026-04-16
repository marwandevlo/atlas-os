'use client';
import { useState } from 'react';
import { ArrowLeft, Calculator, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ISPage() {
  const router = useRouter();
  const [resultat, setResultat] = useState(0);
  const [chargesSociales, setChargesSociales] = useState(0);
  const [form, setForm] = useState({
    chiffreAffaires: '',
    chargesExploitation: '',
    salaires: '',
    amortissements: '',
    autresCharges: '',
  });
  const [calcule, setCalcule] = useState(false);

  const calculerIS = () => {
    const ca = parseFloat(form.chiffreAffaires) || 0;
    const charges = parseFloat(form.chargesExploitation) || 0;
    const salaires = parseFloat(form.salaires) || 0;
    const amort = parseFloat(form.amortissements) || 0;
    const autres = parseFloat(form.autresCharges) || 0;
    const totalCharges = charges + salaires + amort + autres;
    const resultatFiscal = ca - totalCharges;
    setResultat(resultatFiscal);
    const cnssPatronal = salaires * 0.2126;
    setChargesSociales(cnssPatronal);
    setCalcule(true);
  };

  const calculerTauxIS = (r: number) => {
    if (r <= 0) return 0;
    if (r <= 300000) return r * 0.10;
    if (r <= 1000000) return r * 0.20;
    if (r <= 5000000) return r * 0.26;
    return r * 0.31;
  };

  const is = calculerTauxIS(resultat);
  const acompte = is / 4;

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
            <Calculator size={16} /> Impôt sur Sociétés
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-xl font-bold text-gray-800">Impôt sur Sociétés (IS)</h1>
          <p className="text-xs text-gray-400 mt-0.5">Calcul IS · Acomptes provisionnels · Barème Maroc 2026</p>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Form */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-4">Données fiscales</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Chiffre d'affaires (MAD)</label>
                <input value={form.chiffreAffaires} onChange={e => setForm({...form, chiffreAffaires: e.target.value})} placeholder="0" type="number" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Charges d'exploitation (MAD)</label>
                <input value={form.chargesExploitation} onChange={e => setForm({...form, chargesExploitation: e.target.value})} placeholder="0" type="number" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Salaires bruts (MAD)</label>
                <input value={form.salaires} onChange={e => setForm({...form, salaires: e.target.value})} placeholder="0" type="number" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Amortissements (MAD)</label>
                <input value={form.amortissements} onChange={e => setForm({...form, amortissements: e.target.value})} placeholder="0" type="number" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Autres charges (MAD)</label>
                <input value={form.autresCharges} onChange={e => setForm({...form, autresCharges: e.target.value})} placeholder="0" type="number" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>
              <div className="flex items-end">
                <button onClick={calculerIS} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660] transition-colors">
                  <Calculator size={16} /> Calculer IS
                </button>
              </div>
            </div>
          </div>

          {calcule && (
            <>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">Résultat fiscal</p>
                  <p className={`text-2xl font-bold mt-1 ${resultat >= 0 ? 'text-gray-800' : 'text-red-600'}`}>{resultat.toLocaleString()} MAD</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">IS à payer</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{is.toLocaleString()} MAD</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">Acompte trimestriel</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{acompte.toLocaleString()} MAD</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">Charges sociales patron</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{chargesSociales.toFixed(0)} MAD</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Récapitulatif IS — Barème Maroc 2026
                </h2>
                <div className="space-y-2 text-sm">
                  {[
                    { tranche: '0 – 300 000 MAD', taux: '10%' },
                    { tranche: '300 001 – 1 000 000 MAD', taux: '20%' },
                    { tranche: '1 000 001 – 5 000 000 MAD', taux: '26%' },
                    { tranche: 'Plus de 5 000 000 MAD', taux: '31%' },
                  ].map((t, i) => (
                    <div key={i} className="flex justify-between px-4 py-2 rounded-lg bg-gray-50">
                      <span className="text-gray-600">{t.tranche}</span>
                      <span className="font-medium text-[#1B2A4A]">{t.taux}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-3">
                  <button className="flex items-center gap-2 px-6 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660] transition-colors">
                    <CheckCircle size={14} /> Valider la déclaration
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}