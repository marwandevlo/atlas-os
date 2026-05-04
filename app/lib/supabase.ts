import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser Supabase client (cookie-aware, aligned with @supabase/ssr middleware).
 * Keeps auth flows — including password recovery — consistent with server session checks.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
