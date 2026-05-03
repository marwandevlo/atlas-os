'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Brain,
  Building2,
  CheckCircle,
  CreditCard,
  FileText,
  Headphones,
  Lock,
  Receipt,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Upload,
  Users,
  Zap,
} from 'lucide-react';
import { PublicFooter } from '@/app/components/public/PublicFooter';
import { ZafirixLogo } from '@/app/components/branding/ZafirixLogo';

type Lang = 'fr' | 'ar';

export default function LandingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('fr');
  const isAr = lang === 'ar';

  const t = useCallback((fr: string, ar: string) => (isAr ? ar : fr), [isAr]);

  const goSignup = () => router.push('/signup');
  const goPricing = () => router.push('/pricing');
  const goLogin = () => router.push('/login');

  const trustBarItems = useMemo(
    () => [
      { icon: Building2, label: t('Pensé pour le Maroc', 'مصمم للمغرب') },
      { icon: Users, label: t('PME & Cabinets', 'الشركات الصغرى والمكاتب') },
      { icon: Sparkles, label: t('Interface FR / AR', 'واجهة FR / AR') },
      { icon: Zap, label: t('7 jours gratuits', '7 أيام مجانية') },
    ],
    [t],
  );

  const benefitFeatures = useMemo(
    () => [
      {
        icon: Receipt,
        title: t('Déclarez votre TVA en quelques clics', 'صَرِّح عن TVA في بضع نقرات'),
        desc: t(
          'Moins d’erreurs, moins de tableurs : vos bases et échéances restent lisibles.',
          'أخطاء أقل وجداول أقل: تبقى قواعدك وآجالك واضحة.',
        ),
        gradient: 'from-blue-500 to-indigo-600',
      },
      {
        icon: TrendingUp,
        title: t('IS & IR structurés pour le Maroc', 'IS وIR منظّمان للسياق المغربي'),
        desc: t(
          'Barèmes et cadres pensés pour les obligations locales — sans jargon inutile.',
          'سلوم وإطارات تلائم الالتزامات المحلية — دون مصطلحات معقّدة.',
        ),
        gradient: 'from-emerald-500 to-teal-600',
      },
      {
        icon: FileText,
        title: t('Factures & clients sans friction', 'الفواتير والعملاء بسهولة'),
        desc: t(
          'Centralisez clients et factures : suivez les retards et gardez une trace claire.',
          'جمّع العملاء والفواتير: تابع التأخير واحتفظ بأثر واضح.',
        ),
        gradient: 'from-amber-500 to-orange-600',
      },
      {
        icon: Brain,
        title: t('Un consultant fiscal IA à portée de clic', 'مستشار ضريبي بالذكاء الاصطناعي'),
        desc: t(
          'Réponses structurées sur TVA, IS, IR, CNSS — en français ou en arabe.',
          'إجابات منظّمة حول TVA وIS وIR والضمان الاجتماعي — بالفرنسية أو العربية.',
        ),
        gradient: 'from-violet-500 to-purple-600',
      },
      {
        icon: Upload,
        title: t('OCR : moins de saisie, plus de contrôle', 'OCR: إدخال أقل وتحكّم أكبر'),
        desc: t(
          'Extrayez l’essentiel de vos pièces pour accélérer votre dossier.',
          'استخرج جوهر وثائقك لتسريع ملفك.',
        ),
        gradient: 'from-rose-500 to-pink-600',
      },
      {
        icon: Shield,
        title: t('Aligné sur le cadre marocain (DGI)', 'متماشٍ مع الإطار المغربي (DGI)'),
        desc: t(
          'Une logique produit orientée conformité et clarté opérationnelle.',
          'منطق منتوج يركّز على المطابقة والوضوح التشغيلي.',
        ),
        gradient: 'from-slate-600 to-slate-800',
      },
    ],
    [t],
  );

  const steps = useMemo(
    () => [
      {
        n: 1,
        title: t('Créez votre compte', 'أنشئ حسابك'),
        desc: t('En 1 minute — sans carte bancaire.', 'في دقيقة — بدون بطاقة بنكية.'),
      },
      {
        n: 2,
        title: t('Ajoutez vos données', 'أضف بياناتك'),
        desc: t('Clients, factures, société : tout au même endroit.', 'العملاء والفواتير والشركة: في مكان واحد.'),
      },
      {
        n: 3,
        title: t('Gérez & déclarez sereinement', 'أدِر وصَرِّح براحة'),
        desc: t('Tableaux de bord, exports et assistant IA.', 'لوحات معلومات وتصدير ومساعد ذكي.'),
      },
    ],
    [t],
  );

  const objections = useMemo(
    () => [
      {
        icon: CreditCard,
        title: t('Pas besoin de carte bancaire', 'لا حاجة لبطاقة بنكية'),
        text: t('L’essai démarre sans friction — vous décidez ensuite.', 'تبدأ التجربة بسلاسة — ثم تقرر.'),
      },
      {
        icon: Sparkles,
        title: t('Facile à prendre en main', 'سهل الاستيعاب'),
        text: t('Interface pensée pour les équipes non techniques.', 'واجهة مفكّرة للفرق غير التقنية.'),
      },
      {
        icon: Headphones,
        title: t('Support disponible', 'دعم متوفر'),
        text: t('Une équipe à l’écoute pour vous accompagner.', 'فريق يستمع لمرافقتك.'),
      },
      {
        icon: Lock,
        title: t('Conçu pour le système marocain', 'مفكّر للنظام المغربي'),
        text: t('TVA, IS, IR, CNSS : le vocabulaire et les flux locaux.', 'TVA وIS وIR والضمان الاجتماعي: المفردات والمسارات المحلية.'),
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
    <div className="min-h-screen bg-slate-50 flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0f1a32]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0 shrink">
            <ZafirixLogo size="sm" subtitle subtitleText="ZAFIRIX GROUP" subtitleClassName="text-white/45" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-0.5 rounded-xl bg-white/10 p-0.5 ring-1 ring-white/10">
              <button
                type="button"
                onClick={() => setLang('fr')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${!isAr ? 'bg-white text-[#0f1a32] shadow' : 'text-white/70 hover:text-white'}`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLang('ar')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${isAr ? 'bg-white text-[#0f1a32] shadow' : 'text-white/70 hover:text-white'}`}
              >
                AR
              </button>
            </div>
            <button
              type="button"
              onClick={goPricing}
              className="hidden sm:inline-flex items-center justify-center px-3 py-2 rounded-xl text-sm font-semibold text-white/90 border border-white/15 bg-white/5 hover:bg-white/10 transition"
            >
              {t('Tarifs', 'الأسعار')}
            </button>
            <button
              type="button"
              onClick={goLogin}
              className="hidden sm:inline-flex items-center justify-center px-3 py-2 rounded-xl text-sm font-semibold text-white/90 hover:bg-white/10 transition"
            >
              {t('Connexion', 'دخول')}
            </button>
            <button
              type="button"
              onClick={goSignup}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-400 text-[#0f1a32] hover:bg-amber-300 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('Essai gratuit', 'تجربة مجانية')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero — compact, CTA visible without scroll on most phones */}
      <section className="relative overflow-hidden bg-linear-to-br from-[#0b1428] via-[#121f3d] to-[#1a1040] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.25), transparent 45%), radial-gradient(circle at 80% 60%, rgba(245,158,11,0.12), transparent 40%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-14 lg:pb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs sm:text-sm font-medium text-white/85 backdrop-blur-sm mb-4 sm:mb-5">
            <Zap size={14} className="text-amber-400 shrink-0" aria-hidden />
            <span>{t('Pour entrepreneurs, PME & cabinets — Maroc', 'لروّاد الأعمال والشركات والمكاتب — المغرب')}</span>
          </div>

          <h1 className="text-[1.65rem] leading-tight sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-balance max-w-4xl">
            {t(
              'Gérez votre comptabilité sans stress — TVA, IS, IR en quelques clics',
              'أدِر محاسبتك بلا توتر — TVA وIS وIR في بضع نقرات',
            )}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed text-pretty">
            {t(
              'Factures, clients, déclarations et assistant IA — tout centralisé pour réduire les erreurs fiscales et le temps perdu.',
              'الفواتير والعملاء والتصاريح والمساعد الذكي — مركزية لتقليل الأخطاء الضريبية والوقت الضائع.',
            )}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={goSignup}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-amber-400 to-amber-300 px-6 py-3.5 sm:py-4 text-base font-bold text-[#0b1428] shadow-lg shadow-amber-500/25 transition-all hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] ring-1 ring-amber-200/60"
            >
              {t('Essai gratuit 7 jours', 'تجربة مجانية 7 أيام')}
              <ArrowRight size={18} className={isAr ? 'rotate-180' : ''} aria-hidden />
            </button>
            <button
              type="button"
              onClick={goSignup}
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              {t('Commencez maintenant', 'ابدأ الآن')}
            </button>
            <button
              type="button"
              onClick={goPricing}
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-semibold text-white/80 hover:text-white hover:underline underline-offset-4 transition-colors sm:no-underline sm:hover:bg-white/5 sm:rounded-2xl sm:px-5"
            >
              {t('Voir les offres', 'عرض الأسعار')}
            </button>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm text-white/55">
            <li className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-400 shrink-0" aria-hidden />
              {t('Sans carte bancaire', 'بدون بطاقة بنكية')}
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-400 shrink-0" aria-hidden />
              {t('Activation immédiate', 'تفعيل فوري')}
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-400 shrink-0" aria-hidden />
              {t('Conçu pour le Maroc', 'مصمم للمغرب')}
            </li>
          </ul>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-slate-200/80 bg-white py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {trustBarItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 py-3 px-3 text-center text-xs sm:text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-white hover:shadow-md"
              >
                <item.icon size={16} className="text-indigo-500 shrink-0" aria-hidden />
                <span className="leading-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits / features */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 mb-2">{t('Résultats', 'النتائج')}</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-balance">
              {t('Moins de complexité. Plus de maîtrise.', 'تعقيد أقل. تحكّم أكبر.')}
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              {t(
                'Chaque fonctionnalité est formulée comme un gain concret pour votre entreprise ou votre cabinet.',
                'كل ميزة صيغت كمكسب ملموس لمؤسستك أو لمكتبك.',
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {benefitFeatures.map((f, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-xl"
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${f.gradient} text-white shadow-md transition-transform group-hover:scale-105`}
                >
                  <f.icon size={22} aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-linear-to-b from-white to-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{t('Comment ça marche ?', 'كيف يعمل؟')}</h2>
            <p className="mt-2 text-slate-600">{t('Trois étapes. Aucune formation lourde.', 'ثلاث خطوات. دون تكوين معقّد.')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-linear-to-r from-indigo-200 via-violet-200 to-amber-200 z-0" aria-hidden />
            {steps.map((s) => (
              <div
                key={s.n}
                className="relative z-10 flex flex-col items-center text-center rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 text-lg font-black text-white shadow-lg mb-4">
                  {s.n}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-slate-200/80 bg-linear-to-r from-indigo-50 via-white to-amber-50 px-6 py-8 sm:py-10 text-center mb-10 sm:mb-12 shadow-sm">
            <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">{t('Confiance', 'الثقة')}</p>
            <p className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900">
              {t('Des dizaines d’entreprises nous font confiance', 'عشرات الشركات تثق بنا')}
            </p>
            <p className="mt-2 text-slate-600 max-w-xl mx-auto">
              {t('Pensé pour le marché marocain — PME, indépendants et cabinets comptables.', 'مفكّر للسوق المغربي — الشركات والمستقلون والمحاسبون.')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {testimonials.map((item, i) => (
              <figure
                key={i}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-amber-100"
              >
                <div className="flex gap-0.5 mb-4" aria-label={t('5 sur 5', '5 من 5')}>
                  {Array.from({ length: item.stars }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" aria-hidden />
                  ))}
                </div>
                <blockquote className="text-slate-600 text-sm leading-relaxed mb-4">&ldquo;{item.text}&rdquo;</blockquote>
                <figcaption>
                  <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{item.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Objection handling */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900 mb-3">
            {t('Des réponses avant vos questions', 'إجابات قبل أسئلتك')}
          </h2>
          <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">
            {t('On enlève les freins classiques pour vous faire gagner du temps.', 'نزيل العوائق المعتادة لتوفير وقتك.')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {objections.map((o, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:p-6 transition hover:bg-white hover:shadow-md hover:border-indigo-100"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
                  <o.icon size={20} className="text-indigo-600" aria-hidden />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{o.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{o.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 pb-28 sm:pb-20 lg:pb-16">
        <div className="max-w-3xl mx-auto text-center rounded-3xl border border-indigo-100 bg-linear-to-br from-[#0f1a32] via-[#1a2560] to-[#2e1065] p-8 sm:p-12 text-white shadow-2xl shadow-indigo-900/20">
          <Sparkles className="mx-auto mb-4 text-amber-400" size={28} aria-hidden />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-balance">
            {t('Commencez gratuitement dès aujourd’hui', 'ابدأ مجاناً من اليوم')}
          </h2>
          <p className="mt-3 text-white/75 text-base sm:text-lg">
            {t('Aucune carte requise — testez pendant 7 jours', 'لا حاجة لبطاقة — جرّب 7 أيام')}
          </p>
          <button
            type="button"
            onClick={goSignup}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-8 py-4 text-base font-bold text-[#0b1428] shadow-lg transition-all hover:bg-amber-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            {t('Essai gratuit 7 jours', 'تجربة مجانية 7 أيام')}
            <ArrowRight size={20} className={isAr ? 'rotate-180' : ''} aria-hidden />
          </button>
          <button
            type="button"
            onClick={goPricing}
            className="mt-4 block w-full text-center text-sm font-semibold text-white/70 hover:text-white transition-colors"
          >
            {t('Comparer les offres d’abord →', 'قارن العروض أولاً ←')}
          </button>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-md p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(15,23,42,0.12)] lg:hidden">
        <div className="max-w-lg mx-auto flex gap-2">
          <button
            type="button"
            onClick={goSignup}
            className="flex-1 rounded-xl bg-linear-to-r from-amber-400 to-amber-300 py-3.5 text-sm font-bold text-[#0b1428] shadow-md active:scale-[0.98] transition-transform"
          >
            {t('Essai gratuit 7 j', '7 أيام مجاناً')}
          </button>
          <button
            type="button"
            onClick={goPricing}
            className="rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-700 bg-white active:scale-[0.98] transition-transform"
          >
            {t('Offres', 'العروض')}
          </button>
        </div>
      </div>

      <div className="mt-auto">
        <PublicFooter />
      </div>
    </div>
  );
}
