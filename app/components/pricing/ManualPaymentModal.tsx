'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Send, X } from 'lucide-react';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';
import { supabase } from '@/app/lib/supabase';
import {
  buildManualSubscriptionWhatsAppUrl,
  getManualWhatsAppPhoneDigits,
  planDisplayName,
} from '@/app/lib/atlas-manual-subscription';
import { ATLAS_INCIDENT_HOTFIX_GROWTH } from '@/app/lib/atlas-hotfix';
import { trackEvent } from '@/app/lib/analytics-track';

type Props = {
  open: boolean;
  onClose: () => void;
  planId: string;
};

export function ManualPaymentModal({ open, onClose, planId }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const planLabel = planDisplayName(planId);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      if (!isAtlasSupabaseDataEnabled()) {
        setEmail(null);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!cancelled) setEmail(data.session?.user?.email?.trim() ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const whatsappHref =
    email != null && email.length > 0
      ? buildManualSubscriptionWhatsAppUrl({
          phoneDigits: getManualWhatsAppPhoneDigits(),
          planLabel,
          userEmail: email,
        })
      : null;

  const submitRequest = useCallback(async () => {
    setError('');
    setMessage('');
    if (!isAtlasSupabaseDataEnabled()) {
      setError('Supabase requis pour enregistrer la demande.');
      return;
    }
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      router.push(`/login?next=${encodeURIComponent('/pricing')}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/manual-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok) {
        setError(typeof json.error === 'string' ? json.error : 'Échec de l’envoi');
        return;
      }
      trackEvent('manual_payment_requested', { planId, source: 'pricing_modal' });
      setMessage(typeof json.message === 'string' ? json.message : 'Demande enregistrée.');
    } catch {
      setError('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  }, [planId, router]);

  if (ATLAS_INCIDENT_HOTFIX_GROWTH) return null;
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Paiement manuel</h2>
            <p className="text-xs text-slate-500 mt-0.5">Maroc · virement, CashPlus, agence</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:bg-white hover:text-slate-800 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Choisissez votre plan et contactez-nous pour finaliser le paiement. Pas de carte bancaire sur le site — équipe
            ZAFIRIX PRO valide votre règlement puis active l’offre.
          </p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Forfait sélectionné</p>
          <p className="text-base font-bold text-slate-900">{planLabel}</p>
          {error ? <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p> : null}
          {message ? (
            <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">{message}</p>
          ) : null}
          <div className="flex flex-col gap-2 pt-1">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:brightness-95 transition-all"
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
            ) : (
              <button
                type="button"
                onClick={() => router.push(`/login?next=${encodeURIComponent('/pricing')}`)}
                className="w-full py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Se connecter pour WhatsApp
              </button>
            )}
            <button
              type="button"
              disabled={submitting}
              onClick={() => void submitRequest()}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#0F1F3D] text-white text-sm font-bold hover:bg-[#1a3060] disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
              {submitting ? 'Envoi…' : 'Envoyer la demande'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            En envoyant la demande, vous confirmez vouloir souscrire au forfait indiqué. Réponse sous 1–2 jours ouvrés en
            général.
          </p>
        </div>
      </div>
    </div>
  );
}
