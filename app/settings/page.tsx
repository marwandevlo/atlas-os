'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Save, CheckCircle } from 'lucide-react';
import { BrandWordmark } from '@/app/components/branding/BrandWordmark';

export default function SettingsPage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [company, setCompany] = useState({
    raisonSociale: '',
    formeJuridique: 'SARL',
    if_fiscal: '',
    ice: '',
    rc: '',
    cnss: '',
    taxeProfessionnelle: '',
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
    activite: '',
    regimeTVA: 'mensuel',
    exerciceFiscal: '2025',
    ribBancaire: '',
    banque: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('atlas_company');
    if (saved) setCompany(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    localStorage.setItem('atlas_company', JSON.stringify(company));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const formes = ['SARL', 'SA', 'SNC', 'Auto-entrepreneur', 'Personne physique', 'Association'];
  const villes = ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tanger', 'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Autre'];
  const banques = ['Attijariwafa Bank', 'CIH Bank', 'BMCE Bank', 'BMCI', 'Banque Populaire', 'Societe Generale', 'CFG Bank', 'Al Barid Bank'];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-[#1B2A4A] flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <BrandWordmark size="md" />
          <p className="text-white/40 text-xs">ZAFIRIX GROUP</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white text-sm transition-all">
            <ArrowLeft size={16} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/15 text-white text-sm">
            <Building2 size={16} /> Paramètres
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Paramètres de la société</h1>
            <p className="text-xs text-gray-400 mt-0.5">IF · ICE · RC · CNSS · Coordonnées fiscales</p>
          </div>
          <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? 'bg-green-500 text-white' : 'bg-[#1B2A4A] text-white hover:bg-[#243660]'}`}>
            {saved ? <><CheckCircle size={16} /> Sauvegardé</> : <><Save size={16} /> Enregistrer</>}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-blue-500" />
              Identification de la société
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Raison sociale *</label>
                <input value={company.raisonSociale} onChange={e => setCompany({...company, raisonSociale: e.target.value})} placeholder="Ex: ZAFIRIX COMMERCE SARL" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Forme juridique</label>
                <select value={company.formeJuridique} onChange={e => setCompany({...company, formeJuridique: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400">
                  {formes.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Activité principale</label>
                <input value={company.activite} onChange={e => setCompany({...company, activite: e.target.value})} placeholder="Ex: Commerce de detail" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold mb-4 text-blue-600">Identifiants fiscaux et sociaux</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Identifiant Fiscal (IF) *</label>
                <input value={company.if_fiscal} onChange={e => setCompany({...company, if_fiscal: e.target.value})} placeholder="Ex: 12345678" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">ICE *</label>
                <input value={company.ice} onChange={e => setCompany({...company, ice: e.target.value})} placeholder="Ex: 001234567000012" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Registre de Commerce (RC)</label>
                <input value={company.rc} onChange={e => setCompany({...company, rc: e.target.value})} placeholder="Ex: 123456" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">N° CNSS employeur</label>
                <input value={company.cnss} onChange={e => setCompany({...company, cnss: e.target.value})} placeholder="Ex: 1234567" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Taxe professionnelle</label>
                <input value={company.taxeProfessionnelle} onChange={e => setCompany({...company, taxeProfessionnelle: e.target.value})} placeholder="Ex: TP123456" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Régime TVA</label>
                <select value={company.regimeTVA} onChange={e => setCompany({...company, regimeTVA: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400">
                  <option value="mensuel">Mensuel</option>
                  <option value="trimestriel">Trimestriel</option>
                  <option value="exonere">Exonéré</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-4">Coordonnées</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Adresse</label>
                <input value={company.adresse} onChange={e => setCompany({...company, adresse: e.target.value})} placeholder="Ex: 123 Rue Mohammed V" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Ville</label>
                <select value={company.ville} onChange={e => setCompany({...company, ville: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400">
                  <option value="">Choisir...</option>
                  {villes.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Téléphone</label>
                <input value={company.telephone} onChange={e => setCompany({...company, telephone: e.target.value})} placeholder="Ex: 0522123456" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email</label>
                <input value={company.email} onChange={e => setCompany({...company, email: e.target.value})} placeholder="contact@societe.ma" type="email" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-4">Informations bancaires</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Banque</label>
                <select value={company.banque} onChange={e => setCompany({...company, banque: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400">
                  <option value="">Choisir...</option>
                  {banques.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">RIB / IBAN</label>
                <input value={company.ribBancaire} onChange={e => setCompany({...company, ribBancaire: e.target.value})} placeholder="Ex: 007 780 0001234567890123 26" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono text-xs" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}