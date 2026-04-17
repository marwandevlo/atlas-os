'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Building2, ChevronRight, Trash2, Edit, CheckCircle, Search } from 'lucide-react';

type Company = {
  id: number;
  raisonSociale: string;
  formeJuridique: string;
  if_fiscal: string;
  ice: string;
  ville: string;
  activite: string;
  regimeTVA: string;
  actif: boolean;
};

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([
    { id: 1, raisonSociale: 'ATLAS COMMERCE SARL', formeJuridique: 'SARL', if_fiscal: '12345678', ice: '001234567000012', ville: 'Casablanca', activite: 'Commerce de detail', regimeTVA: 'mensuel', actif: true },
    { id: 2, raisonSociale: 'TECH SOLUTIONS SA', formeJuridique: 'SA', if_fiscal: '87654321', ice: '001234567000034', ville: 'Rabat', activite: 'Services informatiques', regimeTVA: 'mensuel', actif: false },
    { id: 3, raisonSociale: 'BATI MAROC SARL', formeJuridique: 'SARL', if_fiscal: '11223344', ice: '001234567000056', ville: 'Marrakech', activite: 'Construction', regimeTVA: 'trimestriel', actif: false },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    raisonSociale: '', formeJuridique: 'SARL', if_fiscal: '', ice: '',
    ville: 'Casablanca', activite: '', regimeTVA: 'mensuel',
  });

  const addCompany = () => {
    if (!form.raisonSociale) return;
    setCompanies([...companies, { id: Date.now(), ...form, actif: false }]);
    setForm({ raisonSociale: '', formeJuridique: 'SARL', if_fiscal: '', ice: '', ville: 'Casablanca', activite: '', regimeTVA: 'mensuel' });
    setShowForm(false);
  };

  const selectCompany = (id: number) => {
    setCompanies(companies.map(c => ({ ...c, actif: c.id === id })));
    router.push('/');
  };

  const filtered = companies.filter(c =>
    c.raisonSociale.toLowerCase().includes(search.toLowerCase()) ||
    c.ville.toLowerCase().includes(search.toLowerCase()) ||
    c.if_fiscal.includes(search)
  );

  const formes = ['SARL', 'SA', 'SNC', 'Auto-entrepreneur', 'Personne physique'];
  const villes = ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tanger', 'Agadir', 'Meknes', 'Oujda', 'Kenitra'];

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
            <Building2 size={16} /> Mes societes
          </button>
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="bg-amber-400/20 rounded-lg p-3 text-center">
            <p className="text-amber-300 text-xs font-medium">Forfait Pro</p>
            <p className="text-white font-bold text-lg">{companies.length} / 20</p>
            <p className="text-white/40 text-xs">societes</p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
              <div className="bg-amber-400 h-1.5 rounded-full" style={{width: `${(companies.length / 20) * 100}%`}}></div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Gestion des societes</h1>
            <p className="text-xs text-gray-400 mt-0.5">Gerez toutes vos societes depuis un seul espace</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={companies.length >= 20}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660] transition-colors disabled:opacity-50"
          >
            <Plus size={16} /> Nouvelle societe
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Total societes</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{companies.length}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Societe active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{companies.find(c => c.actif)?.raisonSociale || 'Aucune'}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400">Places restantes</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{20 - companies.length} / 20</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une societe..."
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
            />
          </div>

          {/* Add Form */}
          {showForm && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
              <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Plus size={16} className="text-blue-500" />
                Nouvelle societe
              </h2>
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
                  <label className="text-xs text-gray-400 mb-1 block">Identifiant Fiscal (IF)</label>
                  <input value={form.if_fiscal} onChange={e => setForm({...form, if_fiscal: e.target.value})} placeholder="12345678" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">ICE</label>
                  <input value={form.ice} onChange={e => setForm({...form, ice: e.target.value})} placeholder="001234567000012" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ville</label>
                  <select value={form.ville} onChange={e => setForm({...form, ville: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400">
                    {villes.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Activite</label>
                  <input value={form.activite} onChange={e => setForm({...form, activite: e.target.value})} placeholder="Ex: Commerce" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Regime TVA</label>
                  <select value={form.regimeTVA} onChange={e => setForm({...form, regimeTVA: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400">
                    <option value="mensuel">Mensuel</option>
                    <option value="trimestriel">Trimestriel</option>
                    <option value="exonere">Exonere</option>
                  </select>
                </div>
                <div className="col-span-3 flex gap-3">
                  <button onClick={addCompany} className="px-6 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-[#243660] transition-colors">
                    Ajouter la societe
                  </button>
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Companies List */}
          <div className="space-y-3">
            {filtered.map(c => (
              <div key={c.id} className={`bg-white rounded-xl p-5 shadow-sm border transition-all ${c.actif ? 'border-green-300 bg-green-50' : 'border-gray-100 hover:border-blue-200'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${c.actif ? 'bg-green-500' : 'bg-[#1B2A4A]'}`}>
                    {c.raisonSociale.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800 truncate">{c.raisonSociale}</p>
                      {c.actif && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          <CheckCircle size={10} /> Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-400">{c.formeJuridique}</span>
                      <span className="text-xs text-gray-400">IF: {c.if_fiscal || '—'}</span>
                      <span className="text-xs text-gray-400">ICE: {c.ice || '—'}</span>
                      <span className="text-xs text-gray-400">{c.ville}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.regimeTVA === 'mensuel' ? 'bg-blue-100 text-blue-700' : c.regimeTVA === 'trimestriel' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                        TVA {c.regimeTVA}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!c.actif && (
                      <button onClick={() => selectCompany(c.id)} className="flex items-center gap-1 px-3 py-2 bg-[#1B2A4A] text-white rounded-lg text-xs hover:bg-[#243660] transition-colors">
                        Selectionner <ChevronRight size={12} />
                      </button>
                    )}
                    <button onClick={() => router.push('/settings')} className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => setCompanies(companies.filter(x => x.id !== c.id))} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {companies.length >= 20 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-amber-700 font-medium">Limite du forfait Pro atteinte (20 societes)</p>
              <p className="text-amber-600 text-sm mt-1">Passez au forfait Enterprise pour des societes illimitees</p>
              <button onClick={() => router.push('/pricing')} className="mt-3 px-4 py-2 bg-amber-400 text-amber-900 rounded-lg text-sm font-medium hover:bg-amber-300 transition-colors">
                Upgrade Enterprise
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}