export const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('placeholder') &&
    !url.includes('your-project') &&
    url.startsWith('http')
  );

  return {
    url,
    anonKey,
    serviceKey,
    isConfigured,
  };
};
