
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, FileText, Receipt, Calculator, 
  TrendingUp, Upload, Bell, Settings, ChevronRight,
  AlertCircle, CheckCircle, Building2
} from 'lucide-react';

const modules = [
  { id: 'tva', label: 'Déclaration TVA', icon: Receipt, color: 'bg-blue-500', desc: 'Ventes, achats, déclaration auto', href: '/tva' },
  { id: 'is', label: 'Impôt sur Sociétés', icon: Calculator, color: 'bg-purple-500', desc: 'Calcul IS, acomptes provisionnels', href: '/is' },
  { id: 'ir', label: 'IR / Salaires', icon: TrendingUp, color: 'bg-green-500', desc: 'Paie, CNSS, AMO, IR mensuel', href: '/ir' },
  { id: 'factures', label: 'Factures', icon: FileText, color: 'bg-amber-500', desc: 'Émission, réception, suivi', href: '/factures' },
  { id: 'comptabilite', label: 'Comptabilité', icon: LayoutDashboard, color: 'bg-cyan-500', desc: 'Journal, grand-livre, bilan', href: '/comptabilite' },
  { id: 'documents', label: 'Documents IA', icon: Upload, color: 'bg-rose-500', desc: 'OCR, import automatique', href: '/documents' },
];

const stats = [
  { label: 'CA du mois', value: '0 MAD' },
  { label: 'TVA à payer', value: '0 MAD' },
  { label: 'Factures en attente', value: '0' },
  { label: 'Déclarations dues', value: '0' },
];

const alerts = [
  { type: 'warning', text: 'Déclaration TVA — échéance dans 15 jours' },
  { type: 'info', text: 'Bienvenue sur Atlas OS Enterprise' },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1B2A4A] flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Building2 className="text-amber-400" size={22} />
            <div>
              <p className="text-white font-bold text-base leading-tight">Atlas OS</p>
              <p className="text-white/40 text-xs">Enterprise</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-white/15 text-white">
            <LayoutDashboard size={16} />
            Dashboard
          </button>
          {modules.map(m => (
            <button
              key={m.id}
              onClick={() => router.push(m.href)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:bg-white/10 hover:text-white transition-all"
            >
              <m.icon size={16} />
              {m.label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white text-sm transition-all">
            <Settings size={16} />
            Paramètres
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Tableau de bord</h1>
            <p className="text-xs text-gray-400 mt-0.5">Atlas OS Enterprise · Maroc</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white text-xs font-bold">M</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Alerts */}
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${a.type === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                {a.type === 'warning' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                {a.text}
              </div>
            ))}
          </div>

          {/* Modules Grid */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Modules</h2>
            <div className="grid grid-cols-3 gap-4">
              {modules.map(m => (
                <button
                  key={m.id}
                  onClick={() => router.push(m.href)}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left group"
                >
                  <div className={`w-10 h-10 ${m.color} rounded-lg flex items-center justify-center mb-3`}>
                    <m.icon size={20} className="text-white" />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{m.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{m.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-blue-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Ouvrir <ChevronRight size={12} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}