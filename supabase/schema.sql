-- ============================================================================
-- LoanFit AI - Phase 1 & Phase 2 Database Schema & Row Level Security (RLS)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 1. TABLE: profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 65),
    employment_type TEXT NOT NULL CHECK (employment_type IN ('Salaried', 'Self-employed', 'Student')),
    location TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
    ON public.profiles FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- 2. TABLE: financial_profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.financial_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    monthly_income NUMERIC NOT NULL CHECK (monthly_income >= 10000),
    monthly_expenses NUMERIC NOT NULL CHECK (monthly_expenses >= 0 AND monthly_expenses <= monthly_income),
    existing_emi NUMERIC NOT NULL DEFAULT 0 CHECK (existing_emi >= 0),
    credit_score INTEGER CHECK (credit_score IS NULL OR (credit_score >= 300 AND credit_score <= 900)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_profiles_user_id ON public.financial_profiles(user_id);

DROP TRIGGER IF EXISTS trigger_financial_profiles_updated_at ON public.financial_profiles;
CREATE TRIGGER trigger_financial_profiles_updated_at
    BEFORE UPDATE ON public.financial_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.financial_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own financial profile"
    ON public.financial_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial profile"
    ON public.financial_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial profile"
    ON public.financial_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial profile"
    ON public.financial_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- 3. TABLE: loan_requirements
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.loan_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    loan_type TEXT NOT NULL CHECK (loan_type IN ('Home Loan', 'Education Loan', 'Car Loan', 'Personal Loan', 'Business Loan')),
    loan_amount NUMERIC NOT NULL CHECK (loan_amount > 0),
    tenure_months INTEGER NOT NULL CHECK (tenure_months > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loan_requirements_user_id ON public.loan_requirements(user_id);

DROP TRIGGER IF EXISTS trigger_loan_requirements_updated_at ON public.loan_requirements;
CREATE TRIGGER trigger_loan_requirements_updated_at
    BEFORE UPDATE ON public.loan_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.loan_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loan requirements"
    ON public.loan_requirements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loan requirements"
    ON public.loan_requirements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loan requirements"
    ON public.loan_requirements FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own loan requirements"
    ON public.loan_requirements FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- 4. TABLE: user_preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    cost_weight NUMERIC NOT NULL DEFAULT 50 CHECK (cost_weight >= 0 AND cost_weight <= 100),
    emi_weight NUMERIC NOT NULL DEFAULT 50 CHECK (emi_weight >= 0 AND emi_weight <= 100),
    eligibility_weight NUMERIC NOT NULL DEFAULT 50 CHECK (eligibility_weight >= 0 AND eligibility_weight <= 100),
    fee_weight NUMERIC NOT NULL DEFAULT 50 CHECK (fee_weight >= 0 AND fee_weight <= 100),
    flexibility_weight NUMERIC NOT NULL DEFAULT 50 CHECK (flexibility_weight >= 0 AND flexibility_weight <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

DROP TRIGGER IF EXISTS trigger_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER trigger_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
    ON public.user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON public.user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON public.user_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
    ON public.user_preferences FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- 5. TABLE: lenders (PHASE 2)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    short_name TEXT,
    lender_type TEXT NOT NULL CHECK (lender_type IN ('Bank', 'NBFC', 'Other')),
    website_url TEXT,
    logo_url TEXT,
    headquarters TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lenders_active ON public.lenders(active);

DROP TRIGGER IF EXISTS trigger_lenders_updated_at ON public.lenders;
CREATE TRIGGER trigger_lenders_updated_at
    BEFORE UPDATE ON public.lenders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.lenders ENABLE ROW LEVEL SECURITY;

-- Public / Authenticated read-only access for active lenders
CREATE POLICY "Public read active lenders"
    ON public.lenders FOR SELECT
    USING (active = true);

-- ============================================================================
-- 6. TABLE: loan_products (PHASE 2)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.loan_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lender_id UUID NOT NULL REFERENCES public.lenders(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    loan_type TEXT NOT NULL CHECK (loan_type IN ('Home Loan', 'Education Loan', 'Car Loan', 'Personal Loan', 'Business Loan')),
    description TEXT,
    min_loan_amount NUMERIC CHECK (min_loan_amount IS NULL OR min_loan_amount >= 0),
    max_loan_amount NUMERIC CHECK (max_loan_amount IS NULL OR max_loan_amount >= 0),
    min_tenure_months INTEGER CHECK (min_tenure_months IS NULL OR min_tenure_months >= 0),
    max_tenure_months INTEGER CHECK (max_tenure_months IS NULL OR max_tenure_months >= 0),
    interest_rate_type TEXT CHECK (interest_rate_type IS NULL OR interest_rate_type IN ('Fixed', 'Floating', 'Rate Range')),
    min_interest_rate NUMERIC NOT NULL CHECK (min_interest_rate >= 0),
    max_interest_rate NUMERIC CHECK (max_interest_rate IS NULL OR max_interest_rate >= min_interest_rate),
    processing_fee_type TEXT CHECK (processing_fee_type IS NULL OR processing_fee_type IN ('Percentage', 'Fixed', 'Zero')),
    processing_fee_value NUMERIC CHECK (processing_fee_value IS NULL OR processing_fee_value >= 0),
    processing_fee_min NUMERIC CHECK (processing_fee_min IS NULL OR processing_fee_min >= 0),
    processing_fee_max NUMERIC CHECK (processing_fee_max IS NULL OR processing_fee_max >= 0),
    prepayment_allowed BOOLEAN DEFAULT true,
    prepayment_penalty_type TEXT,
    prepayment_penalty_value NUMERIC,
    lock_in_months INTEGER DEFAULT 0,
    employment_eligibility TEXT,
    minimum_income NUMERIC CHECK (minimum_income IS NULL OR minimum_income >= 0),
    minimum_credit_score INTEGER CHECK (minimum_credit_score IS NULL OR (minimum_credit_score >= 300 AND minimum_credit_score <= 900)),
    collateral_required BOOLEAN DEFAULT false,
    co_applicant_allowed BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    source_url TEXT,
    source_name TEXT,
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_loan_products_loan_type ON public.loan_products(loan_type);
CREATE INDEX IF NOT EXISTS idx_loan_products_lender_id ON public.loan_products(lender_id);
CREATE INDEX IF NOT EXISTS idx_loan_products_active ON public.loan_products(active);
CREATE INDEX IF NOT EXISTS idx_loan_products_last_verified_at ON public.loan_products(last_verified_at);
CREATE INDEX IF NOT EXISTS idx_loan_products_min_interest_rate ON public.loan_products(min_interest_rate);

DROP TRIGGER IF EXISTS trigger_loan_products_updated_at ON public.loan_products;
CREATE TRIGGER trigger_loan_products_updated_at
    BEFORE UPDATE ON public.loan_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;

-- Public / Authenticated read-only access for active loan products
CREATE POLICY "Public read active loan products"
    ON public.loan_products FOR SELECT
    USING (active = true);


-- ============================================================================
-- 7. DEMONSTRATION & REFERENCE SEED DATA (PHASE 2)
-- Note: Reference research dataset. Disclosed rates must be verified with lenders.
-- ============================================================================

-- Insert 5 Major Lenders
INSERT INTO public.lenders (id, name, short_name, lender_type, website_url, headquarters, active)
VALUES
    ('11111111-1111-1111-1111-111111111001', 'State Bank of India', 'SBI', 'Bank', 'https://sbi.co.in', 'Mumbai, Maharashtra', true),
    ('11111111-1111-1111-1111-111111111002', 'HDFC Bank', 'HDFC', 'Bank', 'https://www.hdfcbank.com', 'Mumbai, Maharashtra', true),
    ('11111111-1111-1111-1111-111111111003', 'ICICI Bank', 'ICICI', 'Bank', 'https://www.icicibank.com', 'Mumbai, Maharashtra', true),
    ('11111111-1111-1111-1111-111111111004', 'Axis Bank', 'Axis', 'Bank', 'https://www.axisbank.com', 'Mumbai, Maharashtra', true),
    ('11111111-1111-1111-1111-111111111005', 'Bank of Baroda', 'BoB', 'Bank', 'https://www.bankofbaroda.in', 'Vadodara, Gujarat', true)
ON CONFLICT (name) DO UPDATE SET
    short_name = EXCLUDED.short_name,
    lender_type = EXCLUDED.lender_type,
    website_url = EXCLUDED.website_url,
    headquarters = EXCLUDED.headquarters,
    active = EXCLUDED.active;

-- Insert Representative Loan Products for Comparison (Home Loan & other categories)
INSERT INTO public.loan_products (
    id, lender_id, product_name, loan_type, description,
    min_loan_amount, max_loan_amount, min_tenure_months, max_tenure_months,
    interest_rate_type, min_interest_rate, max_interest_rate,
    processing_fee_type, processing_fee_value, processing_fee_min, processing_fee_max,
    prepayment_allowed, prepayment_penalty_type, prepayment_penalty_value, lock_in_months,
    employment_eligibility, minimum_income, minimum_credit_score, collateral_required, co_applicant_allowed,
    active, source_url, source_name, last_verified_at
) VALUES
-- 1. SBI Regular Home Loan
(
    '22222222-2222-2222-2222-222222222001',
    '11111111-1111-1111-1111-111111111001',
    'SBI Regular Home Loan',
    'Home Loan',
    'Floating interest rate linked to EBLR for purchasing or constructing residential property.',
    500000, 100000000, 12, 360,
    'Floating', 8.50, 9.65,
    'Percentage', 0.35, 2000, 10000,
    true, 'Zero for floating rate', 0, 0,
    'Salaried, Self-employed', 25000, 700, true, true,
    true, 'https://sbi.co.in/web/personal-banking/loans/home-loans/regular-home-loan',
    'SBI Official Portal', '2026-08-23T00:00:00Z'
),
-- 2. HDFC Reach Home Loan
(
    '22222222-2222-2222-2222-222222222002',
    '11111111-1111-1111-1111-111111111002',
    'HDFC Standard Housing Loan',
    'Home Loan',
    'Competitive home financing with flexible repayment options and minimal documentation.',
    300000, 100000000, 12, 360,
    'Floating', 8.70, 9.80,
    'Percentage', 0.50, 3000, 15000,
    true, 'Zero for floating rate', 0, 0,
    'Salaried, Self-employed', 20000, 720, true, true,
    true, 'https://www.hdfcbank.com/personal/borrow/popular-loans/home-loan',
    'HDFC Bank Official Website', '2026-08-23T00:00:00Z'
),
-- 3. ICICI Extra Home Loan
(
    '22222222-2222-2222-2222-222222222003',
    '11111111-1111-1111-1111-111111111003',
    'ICICI Express Home Loan',
    'Home Loan',
    'Fast-track digital home loan sanction linked to I-MCLR and Repo rate with step-up flexibility.',
    500000, 100000000, 12, 360,
    'Floating', 8.75, 9.90,
    'Percentage', 0.50, 2500, 12500,
    true, 'Zero for floating rate', 0, 0,
    'Salaried, Self-employed', 25000, 700, true, true,
    true, 'https://www.icicibank.com/personal-banking/loans/home-loan',
    'ICICI Bank Official Portal', '2026-08-23T00:00:00Z'
),
-- 4. Axis Bank Super Saver Home Loan
(
    '22222222-2222-2222-2222-222222222004',
    '11111111-1111-1111-1111-111111111004',
    'Axis Bank QuickPay Home Loan',
    'Home Loan',
    'Home loan with interest rate concessions based on high credit score tiers.',
    300000, 100000000, 12, 360,
    'Floating', 8.75, 10.05,
    'Percentage', 0.50, 5000, 20000,
    true, 'Zero for floating rate', 0, 0,
    'Salaried, Self-employed', 25000, 750, true, true,
    true, 'https://www.axisbank.com/retail/loans/home-loan',
    'Axis Bank Official Portal', '2026-08-23T00:00:00Z'
),
-- 5. Bank of Baroda Baroda Home Loan
(
    '22222222-2222-2222-2222-222222222005',
    '11111111-1111-1111-1111-111111111005',
    'Baroda Home Loan',
    'Home Loan',
    'Concessional floating rate housing loan linked to Baroda Repo Linked Lending Rate (BRLLR).',
    200000, 100000000, 12, 360,
    'Floating', 8.40, 9.60,
    'Percentage', 0.25, 2500, 10000,
    true, 'Zero for floating rate', 0, 0,
    'Salaried, Self-employed', 15000, 680, true, true,
    true, 'https://www.bankofbaroda.in/personal-banking/loans/home-loan',
    'Bank of Baroda Official Website', '2026-08-23T00:00:00Z'
),
-- 6. HDFC Car Loan
(
    '22222222-2222-2222-2222-222222222006',
    '11111111-1111-1111-1111-111111111002',
    'HDFC CustomFit Auto Loan',
    'Car Loan',
    'Finance up to 100% on-road price for new four-wheelers with flexible tenure.',
    100000, 15000000, 12, 84,
    'Fixed', 8.90, 10.50,
    'Percentage', 0.50, 3500, 8000,
    true, 'Part prepayment allowed after 6 mos', 0, 6,
    'Salaried, Self-employed', 25000, 720, true, true,
    true, 'https://www.hdfcbank.com/personal/borrow/popular-loans/car-loan',
    'HDFC Bank Portal', '2026-08-23T00:00:00Z'
),
-- 7. SBI Scholar Education Loan
(
    '22222222-2222-2222-2222-222222222007',
    '11111111-1111-1111-1111-111111111001',
    'SBI Scholar Education Loan',
    'Education Loan',
    'Collateral-free higher education loans for premier Indian and global institutions.',
    100000, 5000000, 12, 180,
    'Floating', 8.20, 9.50,
    'Zero', 0, 0, 0,
    true, 'Nil prepayment charge', 0, 0,
    'Student', 0, 650, false, true,
    true, 'https://sbi.co.in/web/personal-banking/loans/education-loans',
    'SBI Portal', '2026-08-23T00:00:00Z'
),
-- 8. ICICI Personal Loan
(
    '22222222-2222-2222-2222-222222222008',
    '11111111-1111-1111-1111-111111111003',
    'ICICI Flexi Personal Loan',
    'Personal Loan',
    'Unsecured personal finance for planned and emergency expenses.',
    50000, 5000000, 12, 72,
    'Fixed', 10.65, 14.50,
    'Percentage', 1.00, 1000, 5000,
    true, 'Allowed after 12 EMIs with nominal fee', 3, 12,
    'Salaried, Self-employed', 30000, 720, false, false,
    true, 'https://www.icicibank.com/personal-banking/loans/personal-loan',
    'ICICI Bank Portal', '2026-08-23T00:00:00Z'
),
-- 9. Axis Bank Business Growth Loan
(
    '22222222-2222-2222-2222-222222222009',
    '11111111-1111-1111-1111-111111111004',
    'Axis MSME Business Term Loan',
    'Business Loan',
    'Collateral-backed term loans and working capital facility for MSMEs and enterprises.',
    500000, 50000000, 12, 120,
    'Floating', 11.25, 15.00,
    'Percentage', 1.25, 5000, 25000,
    true, 'Standard foreclosure terms', 2, 6,
    'Self-employed', 50000, 700, true, true,
    true, 'https://www.axisbank.com/business-banking/loans/business-loan',
    'Axis Bank Portal', '2026-08-23T00:00:00Z'
)
ON CONFLICT (id) DO UPDATE SET
    product_name = EXCLUDED.product_name,
    min_interest_rate = EXCLUDED.min_interest_rate,
    max_interest_rate = EXCLUDED.max_interest_rate,
    processing_fee_value = EXCLUDED.processing_fee_value,
    processing_fee_min = EXCLUDED.processing_fee_min,
    processing_fee_max = EXCLUDED.processing_fee_max,
    source_url = EXCLUDED.source_url,
    source_name = EXCLUDED.source_name,
    last_verified_at = EXCLUDED.last_verified_at;

-- ============================================================================
-- 8. TABLE: recommendation_runs (PHASE 3)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recommendation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    loan_type TEXT NOT NULL CHECK (loan_type IN ('Home Loan', 'Education Loan', 'Car Loan', 'Personal Loan', 'Business Loan')),
    loan_amount NUMERIC NOT NULL CHECK (loan_amount > 0),
    tenure_months INTEGER NOT NULL CHECK (tenure_months > 0),
    monthly_income NUMERIC NOT NULL CHECK (monthly_income > 0),
    existing_emi NUMERIC NOT NULL DEFAULT 0 CHECK (existing_emi >= 0),
    credit_score INTEGER CHECK (credit_score IS NULL OR (credit_score >= 300 AND credit_score <= 900)),
    cost_weight NUMERIC NOT NULL DEFAULT 0.60,
    fee_weight NUMERIC NOT NULL DEFAULT 0.20,
    eligibility_weight NUMERIC NOT NULL DEFAULT 0.20,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendation_runs_user_id ON public.recommendation_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_runs_created_at ON public.recommendation_runs(created_at);

ALTER TABLE public.recommendation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendation runs"
    ON public.recommendation_runs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendation runs"
    ON public.recommendation_runs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 9. TABLE: recommendation_results (PHASE 3)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recommendation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.recommendation_runs(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.loan_products(id) ON DELETE CASCADE,
    calculated_emi NUMERIC NOT NULL,
    total_cost NUMERIC NOT NULL,
    utility_score NUMERIC NOT NULL CHECK (utility_score >= 0 AND utility_score <= 100),
    rank INTEGER NOT NULL CHECK (rank >= 1),
    foir NUMERIC,
    cost_utility NUMERIC,
    fee_utility NUMERIC,
    eligibility_utility NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendation_results_run_id ON public.recommendation_results(run_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_results_product_id ON public.recommendation_results(product_id);

ALTER TABLE public.recommendation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendation results"
    ON public.recommendation_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.recommendation_runs
            WHERE recommendation_runs.id = recommendation_results.run_id
            AND recommendation_runs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own recommendation results"
    ON public.recommendation_results FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.recommendation_runs
            WHERE recommendation_runs.id = recommendation_results.run_id
            AND recommendation_runs.user_id = auth.uid()
        )
    );

-- Add model_version to recommendation_runs if not exists
ALTER TABLE public.recommendation_runs ADD COLUMN IF NOT EXISTS model_version TEXT DEFAULT 'v3.2.0-maut-reducing-balance';

-- ============================================================================
-- 10. TABLE: consent_records (PHASE 5 COMPLIANCE & AA)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- e.g. 'Sahamati_AA', 'Bhashini', 'CreditBureau'
    purpose TEXT NOT NULL, -- e.g. 'LOAN_UNDERWRITING', 'INCOME_VERIFICATION'
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
    consent_handle TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON public.consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_status ON public.consent_records(status);

DROP TRIGGER IF EXISTS trigger_consent_records_updated_at ON public.consent_records;
CREATE TRIGGER trigger_consent_records_updated_at
    BEFORE UPDATE ON public.consent_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent records"
    ON public.consent_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent records"
    ON public.consent_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consent records"
    ON public.consent_records FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 11. TABLE: audit_logs (PHASE 5 FINTECH COMPLIANCE & TRACEABILITY)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Application/Users can append audit log records
CREATE POLICY "Users can append audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Immutability: No UPDATE or DELETE policies on audit_logs (tamper-evident audit trail)

