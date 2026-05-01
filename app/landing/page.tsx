'use client';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, CheckCircle, Zap, Shield, Brain, FileText, TrendingUp, Upload, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import { PublicFooter } from '@/app/components/public/PublicFooter';

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
        title: t('Déclaration TVA automatique', 'تصريح TVA تلقائي'),
        desc: t("Importez vos factures et l'IA génère votre déclaration TVA en un clic", 'استورد فواتيرك وسيقوم الذكاء الاصطناعي بإعداد تصريح TVA بنقرة واحدة'),
        color: 'bg-blue-500',
      },
      {
        icon: Brain,
        title: t('Consultant IA 24/7', 'مستشار ذكي 24/7'),
        desc: t('Posez vos questions fiscales بالعربية أو الفرنسية، مع جواب فوري وواضح', 'اطرح أسئلتك الجبائية بالعربية أو الفرنسية وستحصل على جواب فوري وواضح'),
        color: 'bg-purple-500',
      },
      {
        icon: Upload,
        title: t('OCR intelligent', 'OCR ذكي للوثائق'),
        desc: t('صوّر فواتيرك وسيتم استخراج البيانات تلقائياً بدقة', 'صوّر فواتيرك وسيتم استخراج البيانات تلقائياً بدقة'),
        color: 'bg-rose-500',
      },
      {
        icon: TrendingUp,
        title: t('IS & IR automatisés', 'حساب IS و IR تلقائياً'),
        desc: t("حساب تلقائي لIS وIR الأجور وفقاً للسلم المغربي", 'حساب تلقائي لضريبة الشركات IS وضريبة الدخل IR للأجور وفقاً للسلم المغربي'),
        color: 'bg-green-500',
      },
      {
        icon: Shield,
        title: t('Conforme DGI Maroc', 'متوافق مع DGI المغرب'),
        desc: t("تحديثات مستمرة حسب دوريات المديرية العامة للضرائب", 'تحديثات مستمرة حسب دوريات المديرية العامة للضرائب'),
        color: 'bg-amber-500',
      },
      {
        icon: Zap,
        title: t('Export & télédéclaration', 'تصدير وتصريح إلكتروني'),
        desc: t('صدّر التصاريح بصيغة مناسبة وسهّل عملية التصريح', 'صدّر التصاريح بصيغة مناسبة وسهّل عملية التصريح الإلكتروني'),
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
          "ZAFIRIX PRO m'a fait gagner 3 jours par mois sur ma comptabilité. La TVA est déclarée automatiquement !",
          'ZAFIRIX PRO وفر عليّ 3 أيام في الشهر في المحاسبة. تصريح TVA أصبح تلقائياً.',
        ),
        stars: 5,
      },
      {
        name: t('Fatima Zahra Alami', 'فاطمة الزهراء العلمي'),
        role: t('Expert-comptable, Rabat', 'خبيرة محاسبة، الرباط'),
        text: t(
          'Enfin une solution qui comprend vraiment la fiscalité marocaine. Très pratique pour les cabinets.',
          'أخيراً حل يفهم فعلاً الجباية المغربية. عملي جداً للمكاتب المحاسبية.',
        ),
        stars: 5,
      },
      {
        name: t('Youssef Tazi', 'يوسف تازي'),
        role: t('Auto-entrepreneur, Marrakech', 'مقاول ذاتي، مراكش'),
        text: t(
          'Simple, rapide et conforme. Je recommande à tous les entrepreneurs marocains.',
          'سهل وسريع ومتوافق. أنصح به كل رواد الأعمال في المغرب.',
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
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-[#1B2A4A]" />
            </div>
            <Image
              src="/zafirix-logo.png"
              alt="ZAFIRIX PRO"
              width={140}
              height={40}
              className="h-9 w-auto sm:h-10"
              priority
            />
            <span className="text-white/40 text-xs ml-1">ZAFIRIX GROUP</span>
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
              {t('Essai gratuit 7j', 'تجربة مجانية 7 أيام')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#1B2A4A] text-white pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6">
            <Zap size={14} className="text-amber-400" />
            <span>{t('Comptabilité & fiscalité au Maroc — plus simples au quotidien', 'المحاسبة والجباية بالمغرب — أبسط في العمل اليومي')}</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            {t('Pilotez votre gestion,', 'دبّر تسييرك،')}
            <br />
            <span className="text-amber-400">{t('avec des outils pensés pour le Maroc', 'بأدوات مصممة للمغرب')}</span>
          </h1>
          <p className="text-white/60 text-xl mb-10 max-w-2xl mx-auto">
            {t(
              "Centralisez vos factures, suivez vos échéances et préparez vos déclarations (TVA, IS, IR) avec une expérience claire — pour PME et cabinets.",
              'نظّم فواتيرك، تتبع آجالك، وحضّر تصاريحك (TVA، IS، IR) بتجربة واضحة — للشركات والمكاتب المحاسبية.',
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
              { value: '500+', label: t('Entreprises actives', 'شركة نشطة') },
              { value: '98%', label: t('Satisfaction client', 'رضا العملاء') },
              { value: '3h', label: t('Gagnées par semaine', 'توفير أسبوعي') },
              { value: '100%', label: t('Conforme DGI', 'متوافق مع DGI') },
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
            <p className="text-gray-400 text-lg">{t('Une solution complète pour la fiscalité et comptabilité marocaine', 'حل متكامل للجباية والمحاسبة بالمغرب')}</p>
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
          <p className="text-white/60 mb-10">{t('Comparé aux solutions génériques non adaptées au Maroc', 'مقارنةً بالحلول العامة غير الملائمة للمغرب')}</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: t('Conforme TVA Maroc', 'متوافق مع TVA بالمغرب'), atlas: true, other: false },
              { label: t('CNSS / AMO automatique', 'CNSS / AMO تلقائياً'), atlas: true, other: false },
              { label: t('Barème IR marocain', 'سلم IR المغربي'), atlas: true, other: false },
              { label: t('Interface en Darija/FR', 'واجهة بالعربية/الفرنسية'), atlas: true, other: false },
              { label: t('Prix adapté Maroc', 'سعر مناسب للمغرب'), atlas: true, other: false },
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
          <h2 className="text-3xl font-bold text-[#1B2A4A] mb-4">{t('Prêt à automatiser votre comptabilité?', 'هل أنت مستعد لأتمتة محاسبتك؟')}</h2>
          <p className="text-[#1B2A4A]/70 mb-8">
            {t('Rejoignez 500+ entreprises marocaines qui font confiance à ZAFIRIX PRO', 'انضم إلى +500 شركة مغربية تثق في ZAFIRIX PRO')}
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