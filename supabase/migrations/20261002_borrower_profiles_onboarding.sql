-- ============================================================================
-- LoanFit AI — Borrower Profiles & Personal Info Persistence Migration
-- Adds or extends borrower_profiles table with personal_info_completed_at
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.borrower_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  age INTEGER,
  employment_type TEXT,
  city TEXT,
  personal_info_completed_at TIMESTAMPTZ,
  monthly_income NUMERIC DEFAULT 60000,
  monthly_expenses NUMERIC DEFAULT 25000,
  existing_emi NUMERIC DEFAULT 5000,
  credit_score INTEGER DEFAULT 750,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist if the table was previously created
ALTER TABLE public.borrower_profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS employment_type TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS personal_info_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS monthly_income NUMERIC DEFAULT 60000,
  ADD COLUMN IF NOT EXISTS monthly_expenses NUMERIC DEFAULT 25000,
  ADD COLUMN IF NOT EXISTS existing_emi NUMERIC DEFAULT 5000,
  ADD COLUMN IF NOT EXISTS credit_score INTEGER DEFAULT 750;

-- Enable RLS
ALTER TABLE public.borrower_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'borrower_profiles' AND policyname = 'Users can view own borrower profile'
  ) THEN
    CREATE POLICY "Users can view own borrower profile"
      ON public.borrower_profiles FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'borrower_profiles' AND policyname = 'Users can insert own borrower profile'
  ) THEN
    CREATE POLICY "Users can insert own borrower profile"
      ON public.borrower_profiles FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'borrower_profiles' AND policyname = 'Users can update own borrower profile'
  ) THEN
    CREATE POLICY "Users can update own borrower profile"
      ON public.borrower_profiles FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Also update existing profiles table if present for backwards compatibility
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS personal_info_completed_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS city TEXT;
  END IF;
END $$;
