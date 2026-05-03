'use client';

type Props = {
  open: boolean;
  title: string;
  description: string;
  variant?: 'warning' | 'blocked';
  onClose: () => void;
  onUpgrade: () => void;
};

export function TrialLimitNudgeModal({
  open,
  title,
  description,
  variant = 'warning',
  onClose,
  onUpgrade,
}: Props) {
  if (!open) return null;

  const border = variant === 'blocked' ? 'border-red-200' : 'border-amber-200';
  const bg = variant === 'blocked' ? 'bg-red-50' : 'bg-amber-50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true">
      <div className={`max-w-md w-full rounded-2xl shadow-xl border ${border} ${bg} p-6`}>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-700 mt-2 leading-relaxed">{description}</p>
        <div className="mt-6 flex flex-wrap gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Fermer
          </button>
          <button
            type="button"
            onClick={onUpgrade}
            className="px-4 py-2 rounded-lg bg-[#0F1F3D] text-white text-sm font-semibold hover:bg-[#1a3060]"
          >
            Voir les offres
          </button>
        </div>
      </div>
    </div>
  );
}
