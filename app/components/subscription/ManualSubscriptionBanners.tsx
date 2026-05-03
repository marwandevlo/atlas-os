'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import {
  planLabelFromSnapshot,
  useManualSubscription,
} from '@/app/components/subscription/manual-subscription-context';

export function ManualSubscriptionBanners() {
  const { loading, pendingManual, latestPending, hasAtlasEntitlement, buildWhatsAppUrl } = useManualSubscription();

  if (loading || !pendingManual || !latestPending) return null;

  const label = planLabelFromSnapshot(latestPending);
  const wa = buildWhatsAppUrl(label);

  const soft = hasAtlasEntitlement;

  return (
    <div
      className={`sticky top-0 z-40 border-b px-4 py-3 text-sm ${
        soft
          ? 'border-amber-200 bg-amber-50 text-amber-950'
          : 'border-rose-200 bg-rose-50 text-rose-950'
      }`}
      role="status"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="font-medium leading-snug">
          {soft ? (
            <>
              Votre demande de <strong>paiement manuel</strong> pour le forfait <strong>{label}</strong> est en cours de
              traitement. Vous gardez l’accès pendant l’essai ou jusqu’à activation.
            </>
          ) : (
            <>
              Votre abonnement <strong>n’est pas encore activé</strong>. Finalisez le paiement avec notre équipe ou
              contactez-nous sur WhatsApp.
            </>
          )}
        </p>
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              soft
                ? 'bg-[#0F1F3D] text-white hover:bg-[#1a3060]'
                : 'bg-emerald-700 text-white hover:bg-emerald-800'
            }`}
          >
            <MessageCircle size={16} />
            Contacter sur WhatsApp
          </a>
        ) : (
          <Link
            href="/login?next=/pricing"
            className="text-xs font-semibold underline underline-offset-2 text-amber-900/80"
          >
            Connectez-vous pour le lien WhatsApp
          </Link>
        )}
      </div>
    </div>
  );
}
