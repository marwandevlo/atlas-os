'use client';
import { useState } from 'react';
import { ArrowLeft, Calculator, CheckCircle, FileCode, Globe, Download } from 'lucide-react';
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
    exercice: '2025',
  });
  const [calcule, setCalcule] = useState(false);
  const [declared, setDeclared] = useState(false);
  const [xmlGenerated, setXmlGenerated] = useState(false);

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
  const cotisationMinimale = (parseFloat(form.chiffreAffaires) || 0) * 0.005;
  const isAPayer = Math.max(is, cotisationMinimale);

  const generateXML = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DeclarationIS xmlns="http://www.tax.gov.ma/is/v1">
  <Entete>
    <Exercice>${form.exercice}</Exercice>
    <DateCreation>${new Date().toISOString().split('T')[0]}</DateCreation>
    <TypeDeclaration>IS_ANNUEL</TypeDeclaration>
  </Entete>
  <ResultatFiscal>
    <ChiffreAffaires>${parseFloat(form.chiffreAffaires) || 0}</ChiffreAffaires>
    <TotalCharges>${(parseFloat(form.chargesExploitation) || 0) + (parseFloat(form.salaires) || 0) + (parseFloat(form.amortissements) || 0) + (parseFloat(form.autresCharges) || 0)}</TotalCharges>
    <ResultatComptable>${resultat}</ResultatComptable>
    <ResultatFiscalNet>${resultat}</ResultatFiscalNet>
  </ResultatFiscal>
  <CalculIS>
    <TauxApplique>${resultat <= 300000 ? '10%' : resultat <= 1000000 ? '20%' : resultat <= 5000000 ? '26%' : '31%'}</TauxApplique>
    <ISCalcule>${is.toFixed(2)}</ISCalcule>
    <CotisationMinimale>${cotisationMinimale.toFixed(2)}</CotisationMinimale>
    <ISAPayer>${isAPayer.toFixed(2)}</ISAPayer>
  </CalculIS>
  <Acomptes>
    <Acompte1>${acompte.toFixed(2)}</Acompte1>
    <Acompte2>${acompte.toFixed(2)}</Acompte2>
    <Acompte3>${acompte.toFixed(2)}</Acompte3>
    <Acompte4>${acompte.toFixed(2)}</Acompte4>
  </Acomptes>
</DeclarationIS>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IS_${form.exercice}_DGI.xml`;
    a.click();
    URL.revokeObjectURL(url);
    setXmlGenerated(true);
  };

  const bareme = [
    { tranche: '0 - 300 000 MAD', taux: '10%', actif: resultat > 0 && resultat <= 300000 },
    { tranche: '300 001 - 1 000 000 MAD', taux: '20%', actif: resultat > 300000 && resultat <= 1000000 },
    { tranche: '1 000 001 - 5 000 000 MAD', taux: '26%', actif: resultat > 1000000 && resultat <= 5000000 },
    { tranche: 'Plus de 5 000 000 MAD', taux: '31%', actif: resultat > 5000000 },
  ];

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
            <Calculator size={16} /> IS Fiscal
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Impot sur Societes (IS)</h1>
            <p className="text-xs text-gray-400 mt-0.5">Calcul IS · Acomptes · Bareme Maroc 2026 · Cotisation Minimale</p>
          </div>
          {calcule && (
            <div className="flex gap-2">
              <button onClick={generateXML} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                <FileCode size={16} /> XML DGI
              </button>
              <button onClick={() => window.open('https://simpl.tax.gov.ma', '_blank')} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors">
                <Globe size={16} /> SIMPL-IS
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

          {xmlGenerated && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-green-500 shrink-0" />
              <div>
                <p className="font-semibold text-green-700">Fichier XML IS genere!</p>
                <p className="text-sm text-green-600">Deposez sur SIMPL-IS de la DGI</p>
              </div>
              <button onClick={() => window.open('https://simpl.tax.gov.ma', '_blank')} className="ml-auto px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-2">
                <Globe size={14} /> Ouvrir SIMPL-IS
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-4">Donnees fiscales — Exercice {form.exercice}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Exercice fiscal</label>
                <select value={form.exercice} onChange={e => setForm({...form, exercice: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400">
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
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
              <div className="col-span-2">
                <button onClick={calculerIS} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1B2A4A] text-white rounded-lg text-sm font-medium hover:bg-[#243660] transition-colors">
                  <Calculator size={16} /> Calculer IS automatiquement
                </button>
              </div>
            </div>
          </div>

          {calcule && (
            <>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">Resultat fiscal</p>
                  <p className={`text-2xl font-bold mt-1 ${resultat >= 0 ? 'text-gray-800' : 'text-red-600'}`}>{resultat.toLocaleString()} MAD</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">IS a payer</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{isAPayer.toFixed(0)} MAD</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">Acompte trimestriel</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{acompte.toFixed(0)} MAD</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400">Cotisation minimale</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{cotisationMinimale.toFixed(0)} MAD</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-semibold text-gray-700 mb-4">Bareme IS — Maroc 2026</h2>
                  <div className="space-y-2">
                    {bareme.map((b, i) => (
                      <div key={i} className={`flex justify-between px-4 py-3 rounded-lg text-sm ${b.actif ? 'bg-[#1B2A4A] text-white' : 'bg-gray-50 text-gray-600'}`}>
                        <span>{b.tranche}</span>
                        <span className="font-bold">{b.taux}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-semibold text-gray-700 mb-4">Calendrier acomptes</h2>
                  <div className="space-y-3">
                    {[
                      { label: '1er acompte', date: '31 Mars 2026', mois: 'Mars' },
                      { label: '2eme acompte', date: '30 Juin 2026', mois: 'Juin' },
                      { label: '3eme acompte', date: '30 Sept 2026', mois: 'Sept' },
                      { label: '4eme acompte', date: '31 Dec 2026', mois: 'Dec' },
                    ].map((a, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                        <div>
                          <p className="font-medium text-gray-700">{a.label}</p>
                          <p className="text-xs text-gray-400">{a.date}</p>
                        </div>
                        <span className="font-bold text-amber-600">{acompte.toFixed(0)} MAD</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex gap-3">
                  <button onClick={generateXML} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                    <FileCode size={14} /> Generer declaration XML
                  </button>
                  <button onClick={() => window.open('https://simpl.tax.gov.ma', '_blank')} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors">
                    <Globe size={14} /> Deposer sur SIMPL-IS
                  </button>
                  <button onClick={() => setDeclared(true)} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${declared ? 'bg-green-500 text-white' : 'bg-[#1B2A4A] text-white hover:bg-[#243660]'}`}>
                    {declared ? <><CheckCircle size={14} /> Declare</> : 'Valider declaration'}
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