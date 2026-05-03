'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Globe,
  LogIn,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { BrandWordmark } from '@/app/components/branding/BrandWordmark';
import { ZafirixLogo } from '@/app/components/branding/ZafirixLogo';
import {
  filterAtlasNavItemsForPath,
  resolveActiveAtlasNavId,
  type AtlasAppNavItem,
} from '@/app/lib/atlas-app-nav';

export type AppSidebarProps = {
  variant: 'home' | 'module';
  /** FR/AR labels on module variant when provided */
  t?: (fr: string, ar: string) => string;
  lang?: 'fr' | 'ar';
  setLang?: (lang: 'fr' | 'ar') => void;
  connected?: boolean;
  setConnected?: (v: boolean) => void;
  menuOpen?: boolean;
  setMenuOpen?: (open: boolean) => void;
  /** Fired before navigation (e.g. close mobile menu) */
  onNavigate?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

function navLabel(item: AtlasAppNavItem, t?: (fr: string, ar: string) => string): string {
  if (t) return t(item.label, item.labelAr);
  return item.label;
}

export function AppSidebar({
  variant,
  t,
  lang = 'fr',
  setLang,
  connected = true,
  setConnected,
  menuOpen = false,
  setMenuOpen,
  onNavigate,
  children,
  footer,
}: AppSidebarProps) {
  const pathname = usePathname() || '/';
  const router = useRouter();

  const visibleItems = useMemo(() => filterAtlasNavItemsForPath(pathname), [pathname]);
  const activeId = useMemo(() => resolveActiveAtlasNavId(pathname, visibleItems), [pathname, visibleItems]);

  const go = (href: string) => {
    onNavigate?.();
    setMenuOpen?.(false);
    router.push(href);
  };

  const isHome = variant === 'home';
  const consultantModuleAccent =
    variant === 'module' && pathname.startsWith('/consultant') && activeId === 'consultant';

  const navButtonClass = (item: AtlasAppNavItem, isActive: boolean) => {
    const base = isHome
      ? 'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group'
      : 'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all';
    if (!isActive) return `${base} text-white/50 hover:bg-white/10 hover:text-white`;
    if (consultantModuleAccent && item.id === 'consultant') {
      return `${base} bg-indigo-500/25 text-indigo-100 border border-indigo-400/30`;
    }
    return `${base} bg-white/15 text-white`;
  };

  const asideClass = isHome
    ? `fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-[#0F1F3D] flex flex-col shrink-0 shadow-xl transform transition-transform duration-300 ${
        menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`
    : 'w-60 bg-[#1B2A4A] flex flex-col shrink-0';

  return (
    <aside className={asideClass}>
      <div className={`px-6 py-5 border-b border-white/10 ${isHome ? 'flex items-center justify-between' : ''}`}>
        {isHome ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center">
                <Building2 size={20} className="text-[#0F1F3D]" />
              </div>
              <div>
                <ZafirixLogo size="sm" subtitle subtitleText="ZAFIRIX GROUP · المغرب" subtitleClassName="text-white/40" />
              </div>
            </div>
            <button type="button" onClick={() => setMenuOpen?.(false)} className="lg:hidden text-white/50 hover:text-white">
              <X size={20} />
            </button>
          </>
        ) : (
          <>
            <BrandWordmark size="md" />
            <p className="text-white/40 text-xs">ZAFIRIX GROUP</p>
          </>
        )}
      </div>

      <nav className={`flex-1 px-3 py-4 overflow-y-auto ${isHome ? 'space-y-0.5' : 'space-y-1'}`}>
        {visibleItems.map((item) => {
          const isActive = item.id === activeId;
          if (item.id === 'dashboard' && variant === 'module') {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go('/')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ArrowLeft size={16} /> {navLabel(item, t)}
              </button>
            );
          }
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.href)}
              className={navButtonClass(item, isActive)}
            >
              <item.icon size={16} className="shrink-0" />
              <span className={isHome ? 'flex-1 text-left' : ''}>{navLabel(item, t)}</span>
              {item.id === 'tva' && isHome && (
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" aria-hidden />
              )}
            </button>
          );
        })}
        {children}
      </nav>

      {footer}

      {isHome && setLang && t && (
        <div className="px-3 py-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
            <Globe size={14} className="text-white/40" />
            <span className="text-white/40 text-xs flex-1">{t('Langue', 'اللغة')}</span>
            <button
              type="button"
              onClick={() => setLang('fr')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${lang === 'fr' ? 'bg-amber-400 text-[#0F1F3D]' : 'text-white/40 hover:text-white'}`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLang('ar')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${lang === 'ar' ? 'bg-amber-400 text-[#0F1F3D]' : 'text-white/40 hover:text-white'}`}
            >
              AR
            </button>
          </div>
          {setConnected ? (
            connected ? (
              <button
                type="button"
                onClick={() => {
                  setConnected(false);
                  go('/login');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm transition-all"
              >
                <LogOut size={16} className="shrink-0" />
                <span>{t('Se déconnecter', 'تسجيل الخروج')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setConnected(true);
                  go('/login');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-green-400 hover:bg-green-500/10 hover:text-green-300 text-sm transition-all"
              >
                <LogIn size={16} className="shrink-0" />
                <span>{t('Se connecter', 'تسجيل الدخول')}</span>
              </button>
            )
          ) : null}
        </div>
      )}
    </aside>
  );
}

export function AppSidebarMobileOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} aria-hidden />;
}
