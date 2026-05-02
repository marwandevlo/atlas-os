'use client';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, CheckCircle, Zap, Shield, Brain, FileText, TrendingUp, Upload, ArrowRight, Star } from 'lucide-react';
import { PublicFooter } from '@/app/components/public/PublicFooter';
import { ZafirixLogo } from '@/app/components/branding/ZafirixLogo';

type Lang = 'fr' | 'ar';

export default function LandingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('fr');
  const isAr = lang === 'ar';

  const t = useCallback((fr: string, ar: string) => (isAr ? ar : fr), [isAr]);

  const features = useMemo(
    () => [
      {
        icon: FileText,
        title: t('Aide à la déclaration de TVA', 'مساعدة على إقرار TVA'),
        desc: t(
          'Centralisez vos factures et préparez votre déclaration de TVA grâce à des contrôles explicites.',
          'جمّع فواتيرك وأعدّ إقرار TVA بفضل ضوابط وتدقيق واضحين.',
        ),
        color: 'bg-blue-500',
      },
      {
        icon: Brain,
        title: t('Consultant IA 24/7', 'مستشار الذكاء الاصطناعي (AI) — على مدار الساعة'),
        desc: t(
          'Posez vos questions fiscales en français ou en arabe : réponses structurées et pédagogiques.',
          'اطرح أسئلتك الضريبية بالفرنسية أو بالعربية، مع إجابات منظّمة وواضحة.',
        ),
        color: 'bg-purple-500',
      },
      {
        icon: Upload,
        title: t('OCR intelligent', 'OCR ذكي للوثائق'),
        desc: t(
          'Numérisez vos factures pour en extraire les données utiles et réduire la saisie manuelle.',
          'حوّل فواتيرك إلى نسخ رقمية لاستخراج الحقول المفيدة وتقليل الإدخال اليدوي.',
        ),
        color: 'bg-rose-500',
      },
      {
        icon: TrendingUp,
        title: t('IS et IR assistés', 'IS و IR بمساعدة منظّمة'),
        desc: t(
          'Cadres de calcul et barèmes marocains pour structurer vos éléments IS et IR ainsi que vos masses salariales.',
          'إطارات حساب وسلالم مغربية لترتيب عناصر IS وIR وكتل الأجور.',
        ),
        color: 'bg-green-500',
      },
      {
        icon: Shield,
        title: t('Conformité DGI (Maroc)', 'متوافق مع متطلبات المديرية العامة للضرائب'),
        desc: t(
          'Évolutions régulières alignées sur les circulaires et orientations de la DGI.',
          'تحديثات دورية تتماشى مع التعاميم والتوجيهات الصادرة عن المديرية العامة للضرائب.',
        ),
        color: 'bg-amber-500',
      },
      {
        icon: Zap,
        title: t('Export et télédéclaration', 'التصدير والتصريح الإلكتروني'),
        desc: t(
          'Exportez vos déclarations dans des formats adaptés et facilitez vos démarches de télédéclaration.',
          'صدّر التصاريح بصيغ مناسبة، وسهّل مسار التصريح الإلكتروني.',
        ),
        color: 'bg-cyan-500',
      },
    ],
    [t],
  );

  const testimonials = useMemo(
    () => [
      {
        name: t('Karim Benjelloun', 'كريم بنجلّون'),
        role: t('Gérant PME, Casablanca', 'مسير شركة، الدار البيضاء'),
        text: t(
          'ZAFIRIX PRO nous aide à structurer la TVA et à réduire les tâches répétitives au quotidien.',
          'ZAFIRIX PRO يساعدنا على تنظيم إقرار TVA وتقليل المهام المتكررة يومياً.',
        ),
        stars: 5,
      },
      {
        name: t('Fatima Zahra Alami', 'فاطمة الزهراء العلمي'),
        role: t('Experte-comptable, Rabat', 'خبيرة معتمدة للمحاسبة، الرباط'),
        text: t(
          'Une solution qui cadre bien avec la fiscalité marocaine — très pratique pour les cabinets.',
          'حل يتماشى جيداً مع السياق الضريبي المغربي — عملي جداً للمكاتب المحاسبية.',
        ),
        stars: 5,
      },
      {
        name: t('Youssef Tazi', 'يوسف تازي'),
        role: t('Auto-entrepreneur, Marrakech', 'مقاول ذاتي، مراكش'),
        text: t(
          'Simple, rapide et conforme aux attentes : utile pour les entreprises et les auto-entrepreneurs au Maroc.',
          'سهل وسريع ومتوافق مع المطلوب — مفيد للشركات وللمقاولين الذاتيين في المغرب.',
        ),
        stars: 5,
      },
    ],
    [t],
  );

  return (
    <div className="min-h-screen bg-white flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <nav className="bg-[#1B2A4A] text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ZafirixLogo size="sm" subtitle subtitleText="ZAFIRIX GROUP" subtitleClassName="text-white/40" />
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-1 rounded-lg bg-white/10 p-1">
              <button
                type="button"
                onClick={() => setLang('fr')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${!isAr ? 'bg-white text-[#1B2A4A]' : 'text-white/70 hover:text-white'}`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLang('ar')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${isAr ? 'bg-white text-[#1B2A4A]' : 'text-white/70 hover:text-white'}`}
              >
                AR
              </button>
            </div>
            <button
              onClick={() => router.push('/pricing')}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-sky-500 via-indigo-500 to-violet-500 shadow-sm hover:shadow-md hover:scale-[1.02] transition"
            >
              {t('Tarifs', 'الأسعار')}
            </button>
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white/90 border border-white/20 bg-white/10 hover:bg-white/15 hover:text-white transition"
            >
              {t('Connexion', 'تسجيل الدخول')}
            </button>
            <button onClick={() => router.push('/signup')} className="px-4 py-2 bg-amber-400 text-[#1B2A4A] rounded-lg text-sm font-bold hover:bg-amber-300 transition-colors">
              {t('Essai gratuit 7 j', 'تجربة مجانية 7 أيام')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#1B2A4A] text-white pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6">
            <Zap size={14} className="text-amber-400" />
            <span>
              {t(
                'Comptabilité et fiscalité au Maroc : plus simples au quotidien',
                'المحاسبة والضرائب في المغرب: أبسط في الممارسة اليومية',
              )}
            </span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            {t('Pilotez votre gestion,', 'تحكّم في إدارتك،')}
            <br />
            <span className="text-amber-400">{t('avec des outils conçus pour le Maroc', 'بأدوات مصممة للمغرب')}</span>
          </h1>
          <p className="text-white/60 text-xl mb-10 max-w-2xl mx-auto">
            {t(
              'Centralisez vos factures, suivez vos échéances et préparez vos déclarations (TVA, IS, IR) dans une interface claire — pour les PME et les cabinets.',
              'جمّع فواتيرك، تابع آجالك، وحضّر تصاريحك (TVA، IS، IR) عبر واجهة واضحة — للشركات الصغرى والمتوسطة وللمكاتب المحاسبية.',
            )}
          </p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => router.push('/login')} className="flex items-center gap-2 px-8 py-4 bg-amber-400 text-[#1B2A4A] rounded-xl text-base font-bold hover:bg-amber-300 transition-colors">
              {t('Créer un compte', 'إنشاء حساب')} <ArrowRight size={18} />
            </button>
            <button onClick={() => router.push('/pricing')} className="px-8 py-4 border border-white/20 rounded-xl text-base hover:bg-white/10 transition-colors">
              {t('Voir les offres', 'اطّلع على العروض')}
            </button>
          </div>
          <p className="text-white/30 text-sm mt-4">
            {t('Essai 7 jours · Sans carte bancaire · Support local', 'تجربة 7 أيام · بدون بطاقة بنكية · دعم محلي')}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-6 text-center">
            {[
              { value: t('Simple', 'بسيط'), label: t('Au quotidien', 'يومياً') },
              { value: t('Clair', 'واضح'), label: t('Suivi clair', 'متابعة واضحة') },
              { value: t('Temps', 'الوقت'), label: t('Gestion simplifiée', 'إدارة مبسّطة') },
              {
                value: t('Maroc', 'المغرب'),
                label: t('Conforme aux besoins du marché marocain', 'ملائم لاحتياجات السوق المغربي'),
              },
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
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('Tout ce dont vous avez besoin', 'كل ما تحتاجه')}</h2>
            <p className="text-gray-400 text-lg">
              {t(
                'Une solution complète pour la fiscalité et la comptabilité au Maroc',
                'حل متكامل للمحاسبة والضرائب في المغرب',
              )}
            </p>
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
          <h2 className="text-3xl font-bold mb-4">{t('Pourquoi ZAFIRIX PRO ?', 'لماذا ZAFIRIX PRO؟')}</h2>
          <p className="text-white/60 mb-10">
            {t(
              'Par rapport aux solutions génériques peu adaptées au contexte marocain',
              'مقارنةً بالحلول العامة التي لا تراعي السياق المغربي بما يكفي',
            )}
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: t('Conforme TVA Maroc', 'متوافق مع TVA بالمغرب'), atlas: true, other: false },
              { label: t('Cadres CNSS / AMO', 'إطارات CNSS / AMO'), atlas: true, other: false },
              { label: t('Barème IR marocain', 'سلم IR المغربي'), atlas: true, other: false },
              { label: t('Interface en français et en arabe', 'واجهة بالفرنسية والعربية'), atlas: true, other: false },
              { label: t('Tarification adaptée au Maroc', 'تسعير ملائم للسوق المغربي'), atlas: true, other: false },
              { label: t('Support local', 'دعم محلي'), atlas: true, other: false },
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
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('Ils nous font confiance', 'يثقون بنا')}</h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&quot;{t.text}&quot;</p>
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
          <h2 className="text-3xl font-bold text-[#1B2A4A] mb-4">
            {t('Simplifiez votre gestion comptable et fiscale', 'بسّط إدارتك المحاسبية والجبائية')}
          </h2>
          <p className="text-[#1B2A4A]/70 mb-8">
            {t(
              'Une approche structurée, un suivi plus lisible et moins de tâches répétitives — adaptée au contexte marocain.',
              'نهج منظم، ومتابعة أوضح، ومهام متكررة أقل — بما يلائم السياق المغربي.',
            )}
          </p>
          <button onClick={() => router.push('/login')} className="flex items-center gap-2 px-10 py-4 bg-[#1B2A4A] text-white rounded-xl text-base font-bold hover:bg-[#243660] transition-colors mx-auto">
            {t('Démarrer maintenant', 'ابدأ الآن')} <ArrowRight size={18} />
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