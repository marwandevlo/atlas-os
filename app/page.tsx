'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, Receipt, Calculator,
  TrendingUp, Upload, Bell, Settings, ChevronRight,
  AlertCircle, CheckCircle, Building2, Brain,
  ArrowUpRight, ArrowDownRight, Calendar, Globe,
  Users, Zap, Shield, Clock
} from 'lucide-react';
const modules = [
  { id: 'tva', label: 'TVA', labelAr: 'الضريبة على القيمة المضافة', icon: Receipt, color: 'bg-blue-500', href: '/tva', deadline: '20 Mai', urgent: true },
  { id: 'is', label: 'IS Fiscal', labelAr: 'الضريبة على الشركات', icon: Calculator, color: 'bg-purple-500', href: '/is', deadline: '31 Mars', urgent: false },
  { id: 'ir', label: 'IR / Salaires', labelAr: 'الضريبة على الدخل', icon: TrendingUp, color: 'bg-green-500', href: '/ir', deadline: '30 Avril', urgent: false },
  { id: 'factures', label: 'Factures', labelAr: 'الفواتير', icon: FileText, color: 'bg-amber-500', href: '/factures', deadline: null, urgent: false },
  { id: 'comptabilite', label: 'Comptabilite', labelAr: 'المحاسبة', icon: LayoutDashboard, color: 'bg-cyan-500', href: '/comptabilite', deadline: null, urgent: false },
  { id: 'documents', label: 'Documents IA', labelAr: 'وثائق الذكاء الاصطناعي', icon: Upload, color: 'bg-rose-500', href: '/documents', deadline: null, urgent: false },
  { id: 'consultant', label: 'Consultant IA', labelAr: 'المستشار الذكي', icon: Brain, color: 'bg-indigo-500', href: '/consultant', deadline: null, urgent: false },
];

const navItems = [
  { id: 'dashboard', label: 'Dashboard', labelAr: 'الرئيسية', icon: LayoutDashboard, href: '/' },
  { id: 'tva', label: 'TVA', labelAr: 'الضريبة TVA', icon: Receipt, href: '/tva' },
  { id: 'is', label: 'IS Fiscal', labelAr: 'ضريبة الشركات', icon: Calculator, href: '/is' },
  { id: 'ir', label: 'IR / Salaires', labelAr: 'الرواتب والضرائب', icon: TrendingUp, href: '/ir' },
  { id: 'factures', label: 'Factures', labelAr: 'الفواتير', icon: FileText, href: '/factures' },
  { id: 'comptabilite', label: 'Comptabilite', labelAr: 'المحاسبة', icon: LayoutDashboard, href: '/comptabilite' },
  { id: 'documents', label: 'Documents IA', labelAr: 'وثائق ذكية', icon: Upload, href: '/documents' },
  { id: 'consultant', label: 'Consultant IA', labelAr: 'المستشار', icon: Brain, href: '/consultant' },
  { id: 'companies', label: 'Mes societes', labelAr: 'شركاتي', icon: Building2, href: '/companies' },{ id: 'settings', label: 'Parametres', labelAr: 'الإعدادات', icon: Settings, href: '/settings' },
];

const kpis = [
  { label: "Chiffre d'affaires", labelAr: 'رقم الأعمال', value: '0 MAD', change: '+0%', up: true, icon: TrendingUp, color: 'text-blue-600' },
  { label: 'TVA a payer', labelAr: 'TVA واجبة', value: '0 MAD', change: 'Echeance: 20 Mai', up: false, icon: Receipt, color: 'text-red-600' },
  { label: 'Factures en attente', labelAr: 'فواتير معلقة', value: '0', change: '0 en retard', up: true, icon: FileText, color: 'text-amber-600' },
  { label: 'Declarations dues', labelAr: 'تصاريح واجبة', value: '2', change: 'Ce mois', up: false, icon: Calendar, color: 'text-purple-600' },
];

const deadlines = [
  { label: 'Declaration TVA mensuelle', labelAr: 'التصريح الشهري بالـ TVA', date: '20 Mai 2026', jours: 3, type: 'danger', lien: 'https://www.tax.gov.ma' },
  { label: 'Virement CNSS', labelAr: 'تحويل CNSS', date: '25 Mai 2026', jours: 8, type: 'warning', lien: 'https://www.cnss.ma' },
  { label: 'Acompte IS (2eme)', labelAr: 'الدفعة الثانية IS', date: '31 Mai 2026', jours: 14, type: 'info', lien: 'https://www.tax.gov.ma' },
  { label: 'Declaration IR salaires', labelAr: 'تصريح IR الرواتب', date: '30 Juin 2026', jours: 44, type: 'ok', lien: 'https://www.tax.gov.ma' },
];

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');
  const t = (fr: string, ar: string) => lang === 'fr' ? fr : ar;

  const deadlineColor = (type: string) => {
    if (type === 'danger') return 'bg-red-50 border-red-200 text-red-700';
    if (type === 'warning') return 'bg-amber-50 border-amber-200 text-amber-700';
    if (type === 'info') return 'bg-blue-50 border-blue-200 text-blue-700';
    return 'bg-green-50 border-green-200 text-green-700';
  };

  const deadlineIcon = (type: string) => {
    if (type === 'danger' || type === 'warning') return <AlertCircle size={14} />;
    return <CheckCircle size={14} />;
  };

  return (
    <div className={`flex h-screen bg-gray-50`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <aside className="w-64 bg-[#0F1F3D] flex flex-col shrink-0 shadow-xl">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-[#0F1F3D]" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">Atlas OS</p>
              <p className="text-white/40 text-xs">Enterprise · المغرب</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${item.id === 'dashboard' ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
            >
              <item.icon size={16} className="shrink-0" />
              <span className="flex-1 text-left">{t(item.label, item.labelAr)}</span>
              {item.id === 'tva' && <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 mb-2">
            <Globe size={14} className="text-white/40" />
            <span className="text-white/40 text-xs flex-1">{t('Langue', 'اللغة')}</span>
            <button onClick={() => setLang('fr')} className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${lang === 'fr' ? 'bg-amber-400 text-[#0F1F3D]' : 'text-white/40 hover:text-white'}`}>FR</button>
            <button onClick={() => setLang('ar')} className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${lang === 'ar' ? 'bg-amber-400 text-[#0F1F3D]' : 'text-white/40 hover:text-white'}`}>AR</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t('Tableau de bord', 'لوحة التحكم')}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Atlas OS Enterprise · {t('Maroc', 'المغرب')} · {new Date().toLocaleDateString(lang === 'fr' ? 'fr-MA' : 'ar-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/consultant')} className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
              <Brain size={16} />
              {t('Consultant IA', 'المستشار الذكي')}
            </button>
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#0F1F3D] flex items-center justify-center text-white text-sm font-bold">M</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-400 font-medium">{t(kpi.label, kpi.labelAr)}</p>
                  <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center ${kpi.color}`}>
                    <kpi.icon size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {kpi.up ? <ArrowUpRight size={12} className="text-green-500" /> : <ArrowDownRight size={12} className="text-red-500" />}
                  <span className={`text-xs ${kpi.up ? 'text-green-500' : 'text-red-500'}`}>{kpi.change}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                  <Clock size={14} className="text-red-500" />
                  {t('Echeances fiscales', 'المواعيد الضريبية')}
                </h2>
                <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                  {t('Ce mois', 'هذا الشهر')}
                </span>
              </div>
              <div className="p-4 space-y-3">
                {deadlines.map((d, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border text-xs ${deadlineColor(d.type)}`}>
                    <div className="mt-0.5">{deadlineIcon(d.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{t(d.label, d.labelAr)}</p>
                      <p className="opacity-70 mt-0.5">{d.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold">{d.jours}j</span>
                      <button onClick={() => window.open(d.lien, '_blank')} className="opacity-60 hover:opacity-100 transition-opacity">
                        <Globe size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-700 text-sm">{t('Modules', 'الوحدات')}</h2>
                <span className="text-xs text-gray-400">{modules.length} {t('modules actifs', 'وحدة نشطة')}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {modules.map(m => (
                  <button key={m.id} onClick={() => router.push(m.href)}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left group relative overflow-hidden">
                    {m.urgent && <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>}
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${m.color} rounded-lg flex items-center justify-center shrink-0`}>
                        <m.icon size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{t(m.label, m.labelAr)}</p>
                        {m.deadline && <p className="text-xs text-red-500 mt-0.5">⏰ {m.deadline}</p>}
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <button onClick={() => window.open('https://www.tax.gov.ma', '_blank')} className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors text-left">
                  <Shield size={16} className="text-blue-500 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-700">DGI · SIMPL</p>
                    <p className="text-xs text-blue-400">{t('Portail fiscal', 'البوابة الضريبية')}</p>
                  </div>
                </button>
                <button onClick={() => window.open('https://www.cnss.ma', '_blank')} className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors text-left">
                  <Users size={16} className="text-green-500 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-green-700">CNSS</p>
                    <p className="text-xs text-green-400">{t('Securite sociale', 'الضمان الاجتماعي')}</p>
                  </div>
                </button>
                <button onClick={() => router.push('/consultant')} className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors text-left">
                  <Zap size={16} className="text-indigo-500 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-indigo-700">{t('Conseil IA', 'نصيحة ذكية')}</p>
                    <p className="text-xs text-indigo-400">{t('Posez une question', 'اسأل سؤالاً')}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}