'use client';

type Props = {
  title: string;
  description?: string;
  onPrimary: () => void;
  primaryLabelFr: string;
  primaryLabelAr: string;
  lang: 'fr' | 'ar';
};

export function EmptyStateCta({
  title,
  description,
  onPrimary,
  primaryLabelFr,
  primaryLabelAr,
  lang,
}: Props) {
  const t = (fr: string, ar: string) => (lang === 'ar' ? ar : fr);
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center max-w-lg mx-auto">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      {description ? <p className="text-sm text-slate-600 mt-2">{description}</p> : null}
      <button
        type="button"
        onClick={onPrimary}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#1B2A4A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#243660]"
      >
        {t(primaryLabelFr, primaryLabelAr)}
      </button>
    </div>
  );
}
