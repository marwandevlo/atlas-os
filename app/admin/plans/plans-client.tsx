'use client';

import AdminShell from '@/app/admin/_components/AdminShell';
import { ATLAS_PRICING_PLANS, formatLimit, formatPriceMadYear } from '@/app/lib/atlas-pricing-plans';
import { AdminEmptyState } from '@/app/admin/_components/AdminUi';

export default function PlansAdminClient() {
  return (
    <AdminShell title="Admin · Plans">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div>
          <p className="text-sm font-semibold text-gray-900">Pricing plans · الخطط</p>
          <p className="text-xs text-gray-500 mt-1">Read-only view (editing limits will be added later).</p>
        </div>

        {ATLAS_PRICING_PLANS.length === 0 ? (
          <div className="mt-6">
            <AdminEmptyState title="No plans configured" description="Add plans in `app/lib/atlas-pricing-plans.ts`." />
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ATLAS_PRICING_PLANS.map((p) => {
              const priceLabel =
                p.billingPeriod === 'year'
                  ? formatPriceMadYear(p.price)
                  : `${p.price.toLocaleString()} ${p.currency} · ${p.durationDays ?? 7} jours`;
              return (
                <div key={p.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-extrabold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">{p.id}</p>
                    </div>
                    {p.isPopular ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-800 border-amber-200">
                        Popular
                      </span>
                    ) : null}
                  </div>

                  <p className="text-sm text-gray-600 mt-3">{p.description}</p>

                  <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4">
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">{priceLabel}</p>
                    <p className="text-xs text-gray-400 mt-1">CTA: {p.ctaLabel}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl border border-gray-100 bg-white p-3">
                      <p className="text-[11px] text-gray-500">Companies</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{formatLimit(p.companiesLimit)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-3">
                      <p className="text-[11px] text-gray-500">Users</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{formatLimit(p.usersLimit)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-3">
                      <p className="text-[11px] text-gray-500">Ops</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{formatLimit(p.operationsLimit)}</p>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    Billing: <span className="font-semibold text-gray-700">{p.billingPeriod}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

