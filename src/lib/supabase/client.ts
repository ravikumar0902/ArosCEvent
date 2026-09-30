import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';

export function createClient() {
  const { url, anonKey } = getSupabaseConfig();
  // Safe fallback dummy credentials so browser doesn't throw if not yet connected to live Supabase
  const supabaseUrl = url || 'https://placeholder-project.supabase.co';
  const supabaseKey = anonKey || 'placeholder-anon-key';

  return createBrowserClient(supabaseUrl, supabaseKey);
}
