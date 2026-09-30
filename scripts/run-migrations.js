const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

const client = connectionString
  ? new Client({ connectionString, ssl: { rejectUnauthorized: false } })
  : new Client({
      host: process.env.DB_HOST || 'aws-0-ap-southeast-1.pooler.supabase.com',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres.rkarlvcytttowaypoirt',
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    });

async function runMigrations() {
  if (!connectionString && !process.env.DB_PASSWORD) {
    console.log('SUPABASE_DB_URL or DB_PASSWORD environment variable not set.');
    console.log('To run migrations against Supabase, set SUPABASE_DB_URL in .env.local');
    return;
  }

  console.log('Connecting to Supabase PostgreSQL database...');
  await client.connect();
  console.log('✓ Connected to Supabase PostgreSQL!');

  const migrationFiles = [
    '00001_initial_schema.sql',
    '00002_rls_policies.sql',
    '00003_storage_buckets.sql',
    '00004_seed_demo_data.sql',
    '00005_add_wing_and_flat_number.sql',
  ];

  for (const file of migrationFiles) {
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', file);
    console.log(`Applying migration: ${file}...`);
    const sql = fs.readFileSync(filePath, 'utf8');
    await client.query(sql);
    console.log(`✓ Migration applied successfully: ${file}`);
  }

  console.log('All migrations applied successfully!');
  await client.end();
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
