import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Calculator,
  TrendingUp,
  Upload,
  Brain,
  Zap,
  BarChart2,
  Scale,
  Users,
  Building2,
  Settings,
} from 'lucide-react';

export type AtlasNavItemId =
  | 'dashboard'
  | 'tva'
  | 'is'
  | 'ir'
  | 'factures'
  | 'clients'
  | 'comptabilite'
  | 'documents'
  | 'consultant'
  | 'agents'
  | 'etude'
  | 'juridique'
  | 'rh'
  | 'companies'
  | 'rapports'
  | 'settings';

export type AtlasAppNavItem = {
  id: AtlasNavItemId;
  label: string;
  labelAr: string;
  icon: LucideIcon;
  href: string;
};

/** Master order — filter by context, never reorder ad hoc. */
export const ATLAS_APP_NAV_ITEMS: AtlasAppNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', labelAr: 'الرئيسية', icon: LayoutDashboard, href: '/' },
  { id: 'tva', label: 'TVA', labelAr: 'الضريبة TVA', icon: Receipt, href: '/tva' },
  { id: 'is', label: 'IS Fiscal', labelAr: 'ضريبة الشركات', icon: Calculator, href: '/is' },
  { id: 'ir', label: 'IR / Salaires', labelAr: 'الرواتب والضرائب', icon: TrendingUp, href: '/ir' },
  { id: 'factures', label: 'Factures', labelAr: 'الفواتير', icon: FileText, href: '/factures' },
  { id: 'clients', label: 'Clients', labelAr: 'العملاء', icon: Users, href: '/clients' },
  { id: 'comptabilite', label: 'Comptabilité', labelAr: 'المحاسبة', icon: LayoutDashboard, href: '/comptabilite' },
  { id: 'documents', label: 'Documents IA', labelAr: 'وثائق ذكية', icon: Upload, href: '/documents' },
  { id: 'consultant', label: 'Consultant IA', labelAr: 'المستشار', icon: Brain, href: '/consultant' },
  { id: 'agents', label: 'Agents IA', labelAr: 'الوكلاء الذكيون', icon: Zap, href: '/agents' },
  { id: 'etude', label: 'Étude de projet', labelAr: 'دراسة الجدوى', icon: BarChart2, href: '/etude-projet' },
  { id: 'juridique', label: 'Juridique', labelAr: 'القانونية', icon: Scale, href: '/juridique' },
  { id: 'rh', label: 'Ressources humaines', labelAr: 'الموارد البشرية', icon: Users, href: '/rh' },
  { id: 'companies', label: 'Mes sociétés', labelAr: 'شركاتي', icon: Building2, href: '/companies' },
  { id: 'rapports', label: 'Rapports PDF', labelAr: 'التقارير', icon: FileText, href: '/rapports' },
  { id: 'settings', label: 'Paramètres', labelAr: 'الإعدادات', icon: Settings, href: '/settings' },
];

const GLOBAL_ACCOUNTING_IDS: AtlasNavItemId[] = [
  'dashboard',
  'tva',
  'is',
  'ir',
  'factures',
  'clients',
  'comptabilite',
  'documents',
  'consultant',
];

export type AtlasNavModuleContext =
  | 'global'
  | 'global_agents'
  | 'global_etude'
  | 'consultant'
  | 'juridique'
  | 'companies'
  | 'rh'
  | 'settings'
  | 'rapports';

export function resolveAtlasNavModuleContext(pathname: string): AtlasNavModuleContext {
  const p = pathname || '/';
  if (p === '/consultant' || p.startsWith('/consultant/')) return 'consultant';
  if (p.startsWith('/juridique')) return 'juridique';
  if (p.startsWith('/companies')) return 'companies';
  if (p.startsWith('/rh')) return 'rh';
  if (p.startsWith('/settings')) return 'settings';
  if (p.startsWith('/rapports')) return 'rapports';
  if (p.startsWith('/agents')) return 'global_agents';
  if (p.startsWith('/etude-projet')) return 'global_etude';
  return 'global';
}

export function getVisibleAtlasNavIds(pathname: string): AtlasNavItemId[] {
  const ctx = resolveAtlasNavModuleContext(pathname);
  switch (ctx) {
    case 'consultant':
      return ['dashboard', 'consultant'];
    case 'juridique':
      return ['dashboard', 'juridique', 'companies'];
    case 'companies':
      return ['dashboard', 'companies'];
    case 'rh':
      return ['dashboard', 'rh', 'companies'];
    case 'settings':
      return ['dashboard', 'settings'];
    case 'rapports':
      return ['dashboard', 'rapports'];
    case 'global_agents':
      return [...GLOBAL_ACCOUNTING_IDS, 'agents'];
    case 'global_etude':
      return [...GLOBAL_ACCOUNTING_IDS, 'etude'];
    default:
      return [...GLOBAL_ACCOUNTING_IDS];
  }
}

export function filterAtlasNavItemsForPath(pathname: string): AtlasAppNavItem[] {
  const allowed = new Set(getVisibleAtlasNavIds(pathname));
  return ATLAS_APP_NAV_ITEMS.filter((item) => allowed.has(item.id));
}

export function resolveActiveAtlasNavId(pathname: string, visible: AtlasAppNavItem[]): AtlasNavItemId {
  const p = pathname || '/';
  let best: { id: AtlasNavItemId; len: number } | null = null;
  for (const item of visible) {
    if (item.href === '/') {
      if (p === '/' || p === '') {
        if (!best || best.len < 1) best = { id: 'dashboard', len: 1 };
      }
      continue;
    }
    if (p === item.href || p.startsWith(`${item.href}/`)) {
      const len = item.href.length;
      if (!best || len > best.len) best = { id: item.id, len };
    }
  }
  if (best) return best.id;
  return visible[0]?.id ?? 'dashboard';
}
