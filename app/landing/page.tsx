'use client';
import { useRouter } from 'next/navigation';
import { Building2, CheckCircle, Zap, Shield, Brain, FileText, TrendingUp, Upload, ArrowRight, Star } from 'lucide-react';
import { PublicFooter } from '@/app/components/public/PublicFooter';
import { BrandWordmark } from '@/app/components/branding/BrandWordmark';

const features = [
  { icon: FileText, title: 'Déclaration TVA automatique', desc: 'Import vos factures et l\'IA génère votre déclaration TVA en un clic', color: 'bg-blue-500' },
  { icon: Brain, title: 'Consultant IA 24/7', desc: 'Posez vos questions fiscales en arabe ou français, réponse instantanée', color: 'bg-purple-500' },
  { icon: Upload, title: 'OCR intelligent', desc: 'Photographiez vos factures, l\'IA extrait automatiquement toutes les données', color: 'bg-rose-500' },
  { icon: TrendingUp, title: 'IS & IR automatisés', desc: 'Calcul automatique de l\'impôt sur sociétés et IR salaires selon le barème marocain', color: 'bg-green-500' },
  { icon: Shield, title: 'Conforme DGI Maroc', desc: 'Mis à jour en temps réel selon les circulaires de la Direction Générale des Impôts', color: 'bg-amber-500' },
  { icon: Zap, title: 'Export & télédéclaration', desc: 'Exportez vos déclarations au format DGI et télédéclarez directement', color: 'bg-cyan-500' },
];

const testimonials = [
  { name: 'Karim Benjelloun', role: 'Gérant PME, Casablanca', text: 'ZAFIRIX PRO m\'a fait gagner 3 jours par mois sur ma comptabilité. La TVA est déclarée automatiquement!', stars: 5 },
  { name: 'Fatima Zahra Alami', role: 'Expert-comptable, Rabat', text: 'Enfin un logiciel marocain qui comprend vraiment notre fiscalité. Bien supérieur aux solutions étrangères.', stars: 5 },
  { name: 'Youssef Tazi', role: 'Auto-entrepreneur, Marrakech', text: 'Simple, rapide et conforme. Je recommande à tous les entrepreneurs marocains.', stars: 5 },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-[#1B2A4A] text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-[#1B2A4A]" />
            </div>
            <BrandWordmark size="md" />
            <span className="text-white/40 text-xs ml-1">ZAFIRIX GROUP</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => router.push('/pricing')} className="text-white/70 hover:text-white text-sm transition-colors">Tarifs</button>
            <button onClick={() => router.push('/login')} className="text-white/70 hover:text-white text-sm transition-colors">Connexion</button>
            <button onClick={() => router.push('/signup')} className="px-4 py-2 bg-amber-400 text-[#1B2A4A] rounded-lg text-sm font-bold hover:bg-amber-300 transition-colors">
              Essai gratuit 7j
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#1B2A4A] text-white pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6">
            <Zap size={14} className="text-amber-400" />
            <span>La première solution comptable IA pour le Maroc</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            La comptabilité marocaine,<br />
            <span className="text-amber-400">automatisée par l'IA</span>
          </h1>
          <p className="text-white/60 text-xl mb-10 max-w-2xl mx-auto">
            TVA, IS, IR, CNSS, AMO — ZAFIRIX PRO gère toute votre fiscalité marocaine automatiquement. Conforme DGI, simple, rapide.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => router.push('/login')} className="flex items-center gap-2 px-8 py-4 bg-amber-400 text-[#1B2A4A] rounded-xl text-base font-bold hover:bg-amber-300 transition-colors">
              Commencer gratuitement <ArrowRight size={18} />
            </button>
            <button onClick={() => router.push('/pricing')} className="px-8 py-4 border border-white/20 rounded-xl text-base hover:bg-white/10 transition-colors">
              Voir les tarifs
            </button>
          </div>
          <p className="text-white/30 text-sm mt-4">14 jours gratuits · Sans carte bancaire · Annulez à tout moment</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-6 text-center">
            {[
              { value: '500+', label: 'Entreprises actives' },
              { value: '98%', label: 'Satisfaction client' },
              { value: '3h', label: 'Gagnées par semaine' },
              { value: '100%', label: 'Conforme DGI' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-[#1B2A4A]">{s.value}</p>
                <p className="text-gray-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-400 text-lg">Une solution complète pour la fiscalité et comptabilité marocaine</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vs Competition */}
      <section className="bg-[#1B2A4A] text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Pourquoi ZAFIRIX PRO ?</h2>
          <p className="text-white/60 mb-10">Comparé aux solutions génériques non adaptées au Maroc</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Conforme TVA Maroc', atlas: true, other: false },
              { label: 'CNSS / AMO automatique', atlas: true, other: false },
              { label: 'Barème IR marocain', atlas: true, other: false },
              { label: 'Interface en Darija/FR', atlas: true, other: false },
              { label: 'Prix adapté Maroc', atlas: true, other: false },
              { label: 'Support local', atlas: true, other: false },
            ].map((r, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm text-white/80">{r.label}</span>
                <div className="flex gap-3">
                  <CheckCircle size={16} className="text-green-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Ils nous font confiance</h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-amber-400 py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1B2A4A] mb-4">Prêt à automatiser votre comptabilité?</h2>
          <p className="text-[#1B2A4A]/70 mb-8">Rejoignez 500+ entreprises marocaines qui font confiance à ZAFIRIX PRO</p>
          <button onClick={() => router.push('/login')} className="flex items-center gap-2 px-10 py-4 bg-[#1B2A4A] text-white rounded-xl text-base font-bold hover:bg-[#243660] transition-colors mx-auto">
            Démarrer maintenant <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <div className="mt-auto">
        <PublicFooter />
      </div>
    </div>
  );
}