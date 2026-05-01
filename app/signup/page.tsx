'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, Eye, EyeOff, User, Phone, Building, MapPin, BadgeCheck } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { addDaysYmd, todayYmd } from '@/app/lib/atlas-dates';
import { ATLAS_STORAGE_KEYS } from '@/app/lib/atlas-storage-keys';
import type { AtlasCompany } from '@/app/types/atlas-company';
import { readCompaniesFromLocalStorage, writeCompaniesToLocalStorage } from '@/app/lib/atlas-companies-repository';
import { PublicFooter } from '@/app/components/public/PublicFooter';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';
import { ZafirixLogo } from '@/app/components/branding/ZafirixLogo';

type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  company: {
    name: string;
    type: string;
    city: string;
    ice?: string;
    companiesManaged?: number;
    usersNeeded?: number;
  };
  createdAt: string;
};

type ActiveSubscription = {
  id: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: 'trial';
  paymentReference: string;
  createdAt: string;
};

const STORAGE = {
  userProfile: 'atlas_user_profile',
  activeSubs: 'atlas_active_subscriptions',
} as const;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '').trim();
}

function isValidPhone(phone: string): boolean {
  const p = normalizePhone(phone);
  // simple: accept +212XXXXXXXXX or 0XXXXXXXXX, 9-15 digits
  return /^(\+?\d{9,15}|0\d{8,14})$/.test(p);
}

function readJsonArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeJsonArray<T>(key: string, value: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('SARL');
  const [city, setCity] = useState('Casablanca');
  const [ice, setIce] = useState('');
  const [companiesManaged, setCompaniesManaged] = useState('1');
  const [usersNeeded, setUsersNeeded] = useState('1');

  const [acceptTerms, setAcceptTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validation = useMemo(() => {
    const errs: string[] = [];
    if (!fullName.trim()) errs.push('Nom complet requis.');
    if (!email.trim() || !isValidEmail(email)) errs.push('Email invalide.');
    if (!phone.trim() || !isValidPhone(phone)) errs.push('Numéro de téléphone invalide.');
    if (!password) errs.push('Mot de passe requis.');
    if (password !== confirmPassword) errs.push('La confirmation du mot de passe ne correspond pas.');
    if (!companyName.trim()) errs.push('Nom de la société requis.');
    if (!acceptTerms) errs.push('Vous devez accepter les Conditions et la Politique de confidentialité.');
    return { ok: errs.length === 0, errs };
  }, [acceptTerms, companyName, confirmPassword, email, fullName, password, phone]);

  const createCompanyProfile = () => {
    const nextCompany: AtlasCompany = {
      id: Date.now(),
      raisonSociale: companyName.trim(),
      formeJuridique: companyType,
      if_fiscal: '',
      ice: ice.trim(),
      rc: '',
      cnss: '',
      adresse: '',
      ville: city,
      telephone: normalizePhone(phone),
      email: email.trim(),
      activite: '',
      regimeTVA: 'mensuel',
      actif: true,
      balance: 0,
      paymentTerms: { kind: 'preset', days: 30 },
    };

    const existing = readCompaniesFromLocalStorage();
    const deactivated = existing.map((c) => ({ ...c, actif: false }));
    const updated = [nextCompany, ...deactivated];
    writeCompaniesToLocalStorage(updated);
    localStorage.setItem(ATLAS_STORAGE_KEYS.activeCompany, JSON.stringify(nextCompany));
  };

  const assignFreeTrial = () => {
    const start = todayYmd();
    const end = addDaysYmd(start, 7);
    const order: ActiveSubscription = {
      id: `trial_${Date.now()}`,
      planId: 'free-trial',
      planName: 'Free Trial',
      startDate: start,
      endDate: end,
      status: 'trial',
      paymentReference: 'signup',
      createdAt: new Date().toISOString(),
    };
    const existing = readJsonArray<ActiveSubscription>(STORAGE.activeSubs);
    writeJsonArray(STORAGE.activeSubs, [order, ...existing]);
  };

  const storeUserProfile = () => {
    const profile: UserProfile = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: normalizePhone(phone),
      company: {
        name: companyName.trim(),
        type: companyType,
        city,
        ...(ice.trim() ? { ice: ice.trim() } : {}),
        companiesManaged: Number.parseInt(companiesManaged || '1', 10) || 1,
        usersNeeded: Number.parseInt(usersNeeded || '1', 10) || 1,
      },
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE.userProfile, JSON.stringify(profile));
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!validation.ok) {
      setError(validation.errs[0] || 'Erreur de validation.');
      return;
    }

    setLoading(true);
    try {
      // Do not break existing auth logic: keep Supabase signup.
      const { error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) {
        setError(error.message);
        return;
      }

      // Demo/localStorage seeding must never run in production (prevents accidental "Pro" defaults).
      // In Supabase mode, Free Trial is assigned server-side (DB trigger) and companies live in DB.
      const allowDemoSeed = process.env.NODE_ENV === 'development';
      if (allowDemoSeed && !isAtlasSupabaseDataEnabled()) {
        storeUserProfile();
        createCompanyProfile();
        assignFreeTrial();
      }

      setSuccess('Compte créé. Redirection…');
      router.push('/subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        <div className="bg-[#0F1F3D] text-white py-14 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-amber-400 rounded-xl flex items-center justify-center">
                <Building2 size={24} className="text-[#0F1F3D]" />
              </div>
              <div>
                <ZafirixLogo size="md" subtitle={false} />
                <p className="text-white/60 text-sm">Créer un compte · إنشاء حساب</p>
              </div>
            </div>
            <p className="text-white/70 text-sm mt-5">
              Commencez votre essai gratuit de 7 jours (Free Trial). Aucune carte requise.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 -mt-10 pb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sign up</h1>
                <p className="text-sm text-gray-500 mt-1">Informations personnelles + société</p>
              </div>
              <button onClick={() => router.push('/login')} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Login
              </button>
            </div>

            {error && (
              <div className="mt-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl">
                {success}
              </div>
            )}

            <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <User size={16} className="text-gray-400" /> Personal information
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Full name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" placeholder="Nom complet" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Email *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" placeholder="votre@email.com" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Phone number *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" placeholder="+2126xxxxxxx" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Confirm password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type={showConfirmPassword ? 'text' : 'password'} className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Company */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Building size={16} className="text-gray-400" /> Company information
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Company name *</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" placeholder="Raison sociale" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Company type</label>
                    <select value={companyType} onChange={(e) => setCompanyType(e.target.value)} className="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400">
                      <option value="SARL">SARL</option>
                      <option value="SA">SA</option>
                      <option value="AUTO-ENTREPRENEUR">Auto-entrepreneur</option>
                      <option value="CABINET">Cabinet</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">City</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" placeholder="Casablanca" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">ICE / Identifiant fiscal (optionnel)</label>
                  <div className="relative">
                    <BadgeCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={ice} onChange={(e) => setIce(e.target.value)} className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" placeholder="001234567000012" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block"># Companies managed</label>
                    <input value={companiesManaged} onChange={(e) => setCompaniesManaged(e.target.value)} type="number" min={1} className="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block"># Users needed</label>
                    <input value={usersNeeded} onChange={(e) => setUsersNeeded(e.target.value)} type="number" min={1} className="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3">
              <input checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} type="checkbox" className="mt-1" />
              <p className="text-sm text-gray-600">
                J’accepte les{' '}
                <a className="text-blue-600 hover:underline" href="/terms">Terms of Service</a> et la{' '}
                <a className="text-blue-600 hover:underline" href="/privacy">Privacy Policy</a>.
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
              <button onClick={() => router.push('/pricing')} className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Voir les tarifs
              </button>
              <button
                onClick={() => void handleSubmit()}
                disabled={loading}
                className="px-4 py-3 rounded-xl bg-[#0F1F3D] text-white text-sm font-semibold hover:bg-[#1a3060] disabled:opacity-50"
              >
                {loading ? 'Création…' : 'Créer mon compte'}
              </button>
            </div>

            {!validation.ok && (
              <div className="mt-5 text-xs text-gray-400">
                * Champs requis. {validation.errs[0]}
              </div>
            )}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}

