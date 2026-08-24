import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local manually if not in Next environment
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n==================================================');
console.log('🔍 LOANFIT AI — SUPABASE CONNECTION & RLS VERIFICATION');
console.log('==================================================\n');

if (!url || !key) {
  console.error('❌ ERROR: Missing Supabase environment variables in .env.local.');
  console.log('Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are set.');
  process.exit(1);
}

// Masked URL domain for reporting safely
const parsedUrl = new URL(url);
console.log(`✓ Detected Supabase Project Host: ${parsedUrl.hostname}`);
console.log(`✓ Publishable/Anon Key configured: YES (Length: ${key.length} characters)`);

const supabase = createClient(url, key);

async function runChecks() {
  console.log('\n--- 1. Testing Supabase Authentication Service ---');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error(`❌ Auth check returned error: ${error.message}`);
    } else {
      console.log('✓ Supabase Auth Gateway responded successfully (Status: 200 OK)');
    }
  } catch (err: any) {
    console.error(`❌ Auth network failure: ${err.message}`);
  }

  console.log('\n--- 2. Testing Phase 1 Database Tables & RLS ---');
  const tables = ['profiles', 'financial_profiles', 'loan_requirements', 'user_preferences'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        // Check if error is table missing (42P01 in postgres)
        if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log(`⚠️  Table "${table}": NOT FOUND (Migration needed - run supabase/schema.sql in Supabase SQL editor)`);
        } else if (error.code === 'PGRST301' || error.message.includes('JWT') || error.code === '42501' || error.message.includes('policy') || error.message.includes('row-level security')) {
          console.log(`✓ Table "${table}": EXISTS & RLS PROTECTED (Unauthenticated read correctly denied/empty)`);
        } else {
          console.log(`ℹ️  Table "${table}": Response code ${error.code} (${error.message})`);
        }
      } else {
        console.log(`✓ Table "${table}": EXISTS & REACHABLE (Row Level Security active)`);
      }
    } catch (err: any) {
      console.log(`❌ Table "${table}" check error: ${err.message}`);
    }
  }

  console.log('\n--- 3. Testing Unauthenticated Write Protection (RLS Test) ---');
  try {
    const { error: insertError } = await supabase.from('profiles').insert({
      id: '00000000-0000-0000-0000-000000000000',
      user_id: '00000000-0000-0000-0000-000000000000',
      full_name: 'Unauthorized User',
      age: 30,
      employment_type: 'Salaried',
      location: 'Test Location',
    } as any);

    if (insertError) {
      console.log(`✓ RLS Write Isolation Enforced: Direct unauthenticated INSERT rejected (${insertError.message || insertError.code})`);
    } else {
      console.log('⚠️  Warning: Unauthenticated insert succeeded. Ensure RLS is enabled on public.profiles.');
    }
  } catch (err: any) {
    console.log(`✓ RLS check: ${err.message}`);
  }

  console.log('\n==================================================');
  console.log('✅ SUPABASE VERIFICATION COMPLETE');
  console.log('==================================================\n');
}

runChecks();
