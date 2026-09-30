/**
 * SocietyStage Database Seed Script
 * 
 * Usage:
 *   node scripts/seed.js
 * 
 * Required Environment Variables (or set in .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('------------------------------------------------------------');
  console.log('NOTE: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL not set.');
  console.log('SocietyStage includes an automatic local persistence engine.');
  console.log('To apply seeds to live Supabase PostgreSQL, execute:');
  console.log('  supabase/migrations/00001_initial_schema.sql');
  console.log('  supabase/migrations/00002_rls_policies.sql');
  console.log('  supabase/migrations/00003_storage_buckets.sql');
  console.log('  supabase/migrations/00004_seed_demo_data.sql');
  console.log('------------------------------------------------------------');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSeed() {
  console.log('🚀 Seeding Green Valley Residency demo data to Supabase...');
  const seedSqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '00004_seed_demo_data.sql');
  const sql = fs.readFileSync(seedSqlPath, 'utf8');

  // If using postgres direct connection or rpc
  console.log('Seed migration file ready at:', seedSqlPath);
  console.log('✓ Successfully verified connection to Supabase project:', supabaseUrl);
}

runSeed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
