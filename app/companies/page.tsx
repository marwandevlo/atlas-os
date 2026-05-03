'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Building2, ChevronRight, Trash2, Edit, CheckCircle, Search } from 'lucide-react';
import type { AtlasCompany } from '@/app/types/atlas-company';
import type { AtlasPaymentTerms, AtlasPaymentTermsPreset } from '@/app/types/atlas-payment-terms';
import { normalizePaymentTerms, paymentTermsLabel } from '@/app/types/atlas-payment-terms';
import { canCreateCompany, syncCompanyUsageCount } from '@/app/lib/atlas-usage-limits';
import { BrandWordmark } from '@/app/components/branding/BrandWordmark';

const defaultCompanies: AtlasCompany[] = [
  {
    id: 1,
    raisonSociale: 'ZAFIRIX COMMERCE SARL',
    formeJuridique: 'SARL',
    if_fiscal: '12345678',
    ice: '001234567000012',
    rc: '123456',
    cnss: '1234567',
    adresse: '123 Rue Mohammed V',
    ville: 'Casablanca',
    telephone: '0522123456',
    email: 'contact@zafirix.group',
    activite: 'Commerce de detail',
    regimeTVA: 'mensuel',
    actif: true,
    paymentTerms: { kind: 'preset', days: 30 },
    balance: 0,
  },
  {
    id: 2,
    raisonSociale: 'TECH SOLUTIONS SA',
    formeJuridique: 'SA',
    if_fiscal: '87654321',
    ice: '001234567000034',
    rc: '654321',
    cnss: '7654321',
    adresse: '45 Avenue Hassan II',
    ville: 'Rabat',
    telephone: '0537123456',
    email: 'contact@tech.ma',
    activite: 'Services informatiques',
    regimeTVA: 'mensuel',
    actif: false,
    paymentTerms: { kind: 'preset', days: 60 },
    balance: 0,
  },
  {
    id: 3,
    raisonSociale: 'BATI MAROC SARL',
    formeJuridique: 'SARL',
    if_fiscal: '11223344',
    ice: '001234567000056',
    rc: '112233',
    cnss: '2233441',
    adresse: '78 Rue de la Menara',
    ville: 'Marrakech',
    telephone: '0524123456',
    email: 'contact@bati.ma',
    activite: 'Construction',
    regimeTVA: 'trimestriel',
    actif: false,
    paymentTerms: { kind: 'preset', days: 30 },
    balance: 0,
  },
];

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<AtlasCompany[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [limitNotice, setLimitNotice] = useState('');
  const [termsKind, setTermsKind] = useState<'30' | '60' | '90' | 'custom'>('30');
  const [termsCustomDays, setTermsCustomDays] = useState('45');
  const [form, setForm] = useState({
    raisonSociale: '', formeJuridique: 'SARL', if_fiscal: '', ice: '',
    rc: '', cnss: '', adresse: '', ville: 'Casablanca', telephone: '',
    email: '', activite: '', regimeTVA: 'mensuel',
    balance: '0',
  });

  useEffect(() => {
    const saved = localStorage.getItem('atlas_companies');
    if (saved) {
      const parsed = JSON.parse(saved) as AtlasCompany[];
      setCompanies(parsed);
      syncCompanyUsageCount(parsed.length);
    } else {
      setCompanies(defaultCompanies);
      localStorage.setItem('atlas_companies', JSON.stringify(defaultCompanies));
      localStorage.setItem('atlas_company', JSON.stringify(defaultCompanies[0]));
      syncCompanyUsageCount(defaultCompanies.length);
    }
  }, []);

  const saveCompanies = (newCompanies: AtlasCompany[]) => {
    setCompanies(newCompanies);
    localStorage.setItem('atlas_companies', JSON.stringify(newCompanies));
    const active = newCompanies.find(c => c.actif);
    if (active) localStorage.setItem('atlas_company', JSON.stringify(active));
  };

  const addCompany = () => {
    if (!form.raisonSociale) return;
    const decision = canCreateCompany();
    if (!decision.allowed) {
      setLimitNotice(decision.messageFr ?? decision.messageAr ?? 'Limite atteinte.');
      return;
    }
    if (decision.level === 'warning') setLimitNotice(decision.messageFr ?? decision.messageAr ?? '');

    const { balance, ...payload } = form;
    const paymentTerms: AtlasPaymentTerms =
      termsKind === 'custom'
        ? { kind: 'custom', days: Number.parseInt(termsCustomDays || '0', 10) || 0 }
        : { kind: 'preset', days: Number.parseInt(termsKind, 10) as AtlasPaymentTermsPreset };
    const normalized = normalizePaymentTerms(paymentTerms);
    const newCompany: AtlasCompany = {
      id: Date.now(),
      ...payload,
      actif: false,
      paymentTerms: normalized,
      balance: Number.parseFloat(form.balance || '0') || 0,
    };
    const merged = [...companies, newCompany];
    saveCompanies(merged);
    syncCompanyUsageCount(merged.length);
    setForm({ raisonSociale: '', formeJuridique: 'SARL', if_fiscal: '', ice: '', rc: '', cnss: '', adresse: '', ville: 'Casablanca', telephone: '', email: '', activite: '', regimeTVA: 'mensuel', balance: '0' });
    setTermsKind('30');
    setTermsCustomDays('45');
    setShowForm(false);
  };

  const selectCompany = (id: number) => {
    const updated = companies.map(c => ({ ...c, actif: c.id === id }));
    saveCompanies(updated);
    router.push('/');
  };

  const deleteCompany = (id: number) => {
    const updated = companies.filter((c) => c.id !== id);
    saveCompanies(updated);
    syncCompanyUsageCount(updated.length);
  };

  const filtered = companies.filter(c =>
    c.raisonSociale.toLowerCase().includes(search.toLowerCase()) ||
    c.ville.toLowerCase().includes(search.toLowerCase()) ||
    c.if_fiscal.includes(search)
  );

  const activeCompany = companies.find(c => c.actif);
  const plan = companies.length <= 1 ? 'Starter' : companies.length <= 20 ? 'Pro' : 'Enterprise';
  const maxCompanies = plan === 'Starter' ? 1 : plan === 'Pro' ? 20 : Infinity;

  const formes = ['SARL', 'SA', 'SNC', 'SARL AU', 'Auto-entrepreneur', 'Personne physique'];
  const villes = ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tanger', 'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Autre'];

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
            <Building2 size={16} /> Mes sociétés
          </button>
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="bg-amber-400/20 rounded-lg p-3 text-center">
            <p className="text-amber-300 text-xs font-medium">Forfait {plan}</p>
            <p className="text-white font-bold text-lg">{companies.length} / {maxCompanies === Infinity ? '∞' : maxCompanies}</p>
            <p className="text-white/40 text-xs">sociétés</p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
              <div className="bg-amber-400 h-1.5 rounded-full" style={{width: `${Math.min((companies.length / (maxCompanies === Infinity ? companies.length : maxCompanies)) * 100, 100)}%`}}></div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Gestion des sociétés</h1>
            <p className="text-xs text-gray-400 mt-0.5">Gérez toutes vos sociétés depuis un seul espace</p>
          </div>
          <button
            onClick={() => {
              const decision = canCreateCompany();
              if (!decision.allowed) {
                setLimitNotice(decision.messageFr ?? decision.messageAr ?? '');
                return;
              }
              if (decision.level === 'warning') setLimitNotice(decision.messageFr ?? decision.messageAr ?? '');
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660] transition-colors"
          >
            <Plus size={16} /> Nouvelle société
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          {limitNotice && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
              {limitNotice}
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Total sociétés</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{companies.length}</p>
            </div>
            <div className="rounded-xl p-5 shadow-sm border border-green-200 bg-green-50">
              <p className="text-xs text-gray-400">Societe active</p>
              <p className="text-sm font-bold text-green-600 mt-1 truncate">{activeCompany?.raisonSociale || 'Aucune'}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Places restantes</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{maxCompanies === Infinity ? '∞' : maxCompanies - companies.length}</p>
            </div>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une société…" className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white" />
          </div>

          {showForm && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
              <h2 className="font-semibold text-gray-700 mb-4">Nouvelle société</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Raison sociale *</label>
                  <input value={form.raisonSociale} onChange={e => setForm({...form, raisonSociale: e.target.value})} placeholder="Ex: MON ENTREPRISE SARL" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Forme juridique</label>
                  <select value={form.formeJuridique} onChange={e => setForm({...form, formeJuridique: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400">
                    {formes.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">IF</label>
                  <input value={form.if_fiscal} onChange={e => setForm({...form, if_fiscal: e.target.value})} placeholder="12345678" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">ICE</label>
                  <input value={form.ice} onChange={e => setForm({...form, ice: e.target.value})} placeholder="001234567000012" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">RC</label>
                  <input value={form.rc} onChange={e => setForm({...form, rc: e.target.value})} placeholder="123456" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">CNSS</label>
                  <input value={form.cnss} onChange={e => setForm({...form, cnss: e.target.value})} placeholder="1234567" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ville</label>
                  <select value={form.ville} onChange={e => setForm({...form, ville: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400">
                    {villes.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Téléphone</label>
                  <input value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} placeholder="0522123456" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Activité</label>
                  <input value={form.activite} onChange={e => setForm({...form, activite: e.target.value})} placeholder="Commerce..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Régime TVA</label>
                  <select value={form.regimeTVA} onChange={e => setForm({...form, regimeTVA: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400">
                    <option value="mensuel">Mensuel</option>
                    <option value="trimestriel">Trimestriel</option>
                    <option value="exonere">Exonéré</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Délai de paiement</label>
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
                  <label className="text-xs text-gray-400 mb-1 block">Balance (MAD)</label>
                  <input value={form.balance} onChange={e => setForm({...form, balance: e.target.value})} type="number" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
                <div className="col-span-3 flex gap-3">
                  <button onClick={addCompany} className="px-6 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660]">Ajouter</button>
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Annuler</button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {filtered.map(c => (
              <div key={c.id} className={`bg-white rounded-xl p-5 shadow-sm border transition-all ${c.actif ? 'border-green-300 bg-green-50' : 'border-gray-100 hover:border-blue-200'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 ${c.actif ? 'bg-green-500' : 'bg-[#1B2A4A]'}`}>
                    {c.raisonSociale.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800 truncate">{c.raisonSociale}</p>
                      {c.actif && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          <CheckCircle size={10} /> Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400">{c.formeJuridique}</span>
                      {c.if_fiscal && <span className="text-xs text-gray-400">IF: {c.if_fiscal}</span>}
                      {c.ice && <span className="text-xs text-gray-400">ICE: {c.ice}</span>}
                      {c.cnss && <span className="text-xs text-gray-400">CNSS: {c.cnss}</span>}
                      <span className="text-xs text-gray-400">{c.ville}</span>
                      {c.paymentTerms && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          Délai {paymentTermsLabel(c.paymentTerms)}
                        </span>
                      )}
                      {typeof c.balance === 'number' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.balance > 0 ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                          Balance {Math.round(c.balance).toLocaleString()} MAD
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.regimeTVA === 'mensuel' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        TVA {c.regimeTVA}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!c.actif && (
                      <button onClick={() => selectCompany(c.id)} className="flex items-center gap-1 px-3 py-2 bg-[#1B2A4A] text-white rounded-lg text-xs hover:bg-[#243660]">
                        Sélectionner <ChevronRight size={12} />
                      </button>
                    )}
                    <button onClick={() => deleteCompany(c.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}