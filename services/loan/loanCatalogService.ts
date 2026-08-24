import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  Lender,
  LoanProduct,
  ComparisonProductResult,
  ComparisonResponse,
  LoanRequirement,
  FinancialProfile,
  Profile,
  LoanType,
} from '@/types/database';
import { calculateEMI, calculateEMIRange } from '@/services/calculation/emiService';
import { calculateProcessingFee, calculateKnownBorrowingCost } from '@/services/calculation/costService';
import { evaluateBasicEligibility } from '@/services/loan/loanFilterService';

/**
 * Verified fallback seed catalog for offline and demo scenarios.
 * Label: "Research/Demo Data — Verify with lender before real-world use."
 */
export const SEED_LENDERS: Lender[] = [
  {
    id: '11111111-1111-1111-1111-111111111001',
    name: 'State Bank of India',
    short_name: 'SBI',
    lender_type: 'Bank',
    website_url: 'https://sbi.co.in',
    headquarters: 'Mumbai, Maharashtra',
    active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111002',
    name: 'HDFC Bank',
    short_name: 'HDFC',
    lender_type: 'Bank',
    website_url: 'https://www.hdfcbank.com',
    headquarters: 'Mumbai, Maharashtra',
    active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111003',
    name: 'ICICI Bank',
    short_name: 'ICICI',
    lender_type: 'Bank',
    website_url: 'https://www.icicibank.com',
    headquarters: 'Mumbai, Maharashtra',
    active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111004',
    name: 'Axis Bank',
    short_name: 'Axis',
    lender_type: 'Bank',
    website_url: 'https://www.axisbank.com',
    headquarters: 'Mumbai, Maharashtra',
    active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111005',
    name: 'Bank of Baroda',
    short_name: 'BoB',
    lender_type: 'Bank',
    website_url: 'https://www.bankofbaroda.in',
    headquarters: 'Vadodara, Gujarat',
    active: true,
  },
];

export const SEED_LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: '22222222-2222-2222-2222-222222222001',
    lender_id: '11111111-1111-1111-1111-111111111001',
    product_name: 'SBI Regular Home Loan',
    loan_type: 'Home Loan',
    description: 'Floating interest rate linked to EBLR for purchasing or constructing residential property.',
    min_loan_amount: 500000,
    max_loan_amount: 100000000,
    min_tenure_months: 12,
    max_tenure_months: 360,
    interest_rate_type: 'Floating',
    min_interest_rate: 8.50,
    max_interest_rate: 9.65,
    processing_fee_type: 'Percentage',
    processing_fee_value: 0.35,
    processing_fee_min: 2000,
    processing_fee_max: 10000,
    prepayment_allowed: true,
    prepayment_penalty_type: 'Zero for floating rate',
    prepayment_penalty_value: 0,
    lock_in_months: 0,
    employment_eligibility: 'Salaried, Self-employed',
    minimum_income: 25000,
    minimum_credit_score: 700,
    collateral_required: true,
    co_applicant_allowed: true,
    active: true,
    source_url: 'https://sbi.co.in/web/personal-banking/loans/home-loans/regular-home-loan',
    source_name: 'SBI Official Portal',
    last_verified_at: '2026-08-23T00:00:00Z',
    lender: SEED_LENDERS[0],
  },
  {
    id: '22222222-2222-2222-2222-222222222002',
    lender_id: '11111111-1111-1111-1111-111111111002',
    product_name: 'HDFC Standard Housing Loan',
    loan_type: 'Home Loan',
    description: 'Competitive home financing with flexible repayment options and minimal documentation.',
    min_loan_amount: 300000,
    max_loan_amount: 100000000,
    min_tenure_months: 12,
    max_tenure_months: 360,
    interest_rate_type: 'Floating',
    min_interest_rate: 8.70,
    max_interest_rate: 9.80,
    processing_fee_type: 'Percentage',
    processing_fee_value: 0.50,
    processing_fee_min: 3000,
    processing_fee_max: 15000,
    prepayment_allowed: true,
    prepayment_penalty_type: 'Zero for floating rate',
    prepayment_penalty_value: 0,
    lock_in_months: 0,
    employment_eligibility: 'Salaried, Self-employed',
    minimum_income: 20000,
    minimum_credit_score: 720,
    collateral_required: true,
    co_applicant_allowed: true,
    active: true,
    source_url: 'https://www.hdfcbank.com/personal/borrow/popular-loans/home-loan',
    source_name: 'HDFC Bank Official Website',
    last_verified_at: '2026-08-23T00:00:00Z',
    lender: SEED_LENDERS[1],
  },
  {
    id: '22222222-2222-2222-2222-222222222003',
    lender_id: '11111111-1111-1111-1111-111111111003',
    product_name: 'ICICI Express Home Loan',
    loan_type: 'Home Loan',
    description: 'Fast-track digital home loan sanction linked to Repo rate with step-up repayment flexibility.',
    min_loan_amount: 500000,
    max_loan_amount: 100000000,
    min_tenure_months: 12,
    max_tenure_months: 360,
    interest_rate_type: 'Floating',
    min_interest_rate: 8.75,
    max_interest_rate: 9.90,
    processing_fee_type: 'Percentage',
    processing_fee_value: 0.50,
    processing_fee_min: 2500,
    processing_fee_max: 12500,
    prepayment_allowed: true,
    prepayment_penalty_type: 'Zero for floating rate',
    prepayment_penalty_value: 0,
    lock_in_months: 0,
    employment_eligibility: 'Salaried, Self-employed',
    minimum_income: 25000,
    minimum_credit_score: 700,
    collateral_required: true,
    co_applicant_allowed: true,
    active: true,
    source_url: 'https://www.icicibank.com/personal-banking/loans/home-loan',
    source_name: 'ICICI Bank Official Portal',
    last_verified_at: '2026-08-23T00:00:00Z',
    lender: SEED_LENDERS[2],
  },
  {
    id: '22222222-2222-2222-2222-222222222004',
    lender_id: '11111111-1111-1111-1111-111111111004',
    product_name: 'Axis Bank QuickPay Home Loan',
    loan_type: 'Home Loan',
    description: 'Home loan with interest rate concessions based on high credit score tiers.',
    min_loan_amount: 300000,
    max_loan_amount: 100000000,
    min_tenure_months: 12,
    max_tenure_months: 360,
    interest_rate_type: 'Floating',
    min_interest_rate: 8.75,
    max_interest_rate: 10.05,
    processing_fee_type: 'Percentage',
    processing_fee_value: 0.50,
    processing_fee_min: 5000,
    processing_fee_max: 20000,
    prepayment_allowed: true,
    prepayment_penalty_type: 'Zero for floating rate',
    prepayment_penalty_value: 0,
    lock_in_months: 0,
    employment_eligibility: 'Salaried, Self-employed',
    minimum_income: 25000,
    minimum_credit_score: 750,
    collateral_required: true,
    co_applicant_allowed: true,
    active: true,
    source_url: 'https://www.axisbank.com/retail/loans/home-loan',
    source_name: 'Axis Bank Official Portal',
    last_verified_at: '2026-08-23T00:00:00Z',
    lender: SEED_LENDERS[3],
  },
  {
    id: '22222222-2222-2222-2222-222222222005',
    lender_id: '11111111-1111-1111-1111-111111111005',
    product_name: 'Baroda Home Loan',
    loan_type: 'Home Loan',
    description: 'Concessional floating rate housing loan linked to Baroda Repo Linked Lending Rate (BRLLR).',
    min_loan_amount: 200000,
    max_loan_amount: 100000000,
    min_tenure_months: 12,
    max_tenure_months: 360,
    interest_rate_type: 'Floating',
    min_interest_rate: 8.40,
    max_interest_rate: 9.60,
    processing_fee_type: 'Percentage',
    processing_fee_value: 0.25,
    processing_fee_min: 2500,
    processing_fee_max: 10000,
    prepayment_allowed: true,
    prepayment_penalty_type: 'Zero for floating rate',
    prepayment_penalty_value: 0,
    lock_in_months: 0,
    employment_eligibility: 'Salaried, Self-employed',
    minimum_income: 15000,
    minimum_credit_score: 680,
    collateral_required: true,
    co_applicant_allowed: true,
    active: true,
    source_url: 'https://www.bankofbaroda.in/personal-banking/loans/home-loan',
    source_name: 'Bank of Baroda Official Website',
    last_verified_at: '2026-08-23T00:00:00Z',
    lender: SEED_LENDERS[4],
  },
  {
    id: '22222222-2222-2222-2222-222222222006',
    lender_id: '11111111-1111-1111-1111-111111111002',
    product_name: 'HDFC CustomFit Auto Loan',
    loan_type: 'Car Loan',
    description: 'Finance up to 100% on-road price for new four-wheelers with flexible tenure.',
    min_loan_amount: 100000,
    max_loan_amount: 15000000,
    min_tenure_months: 12,
    max_tenure_months: 84,
    interest_rate_type: 'Fixed',
    min_interest_rate: 8.90,
    max_interest_rate: 10.50,
    processing_fee_type: 'Percentage',
    processing_fee_value: 0.50,
    processing_fee_min: 3500,
    processing_fee_max: 8000,
    prepayment_allowed: true,
    prepayment_penalty_type: 'Part prepayment allowed after 6 mos',
    prepayment_penalty_value: 0,
    lock_in_months: 6,
    employment_eligibility: 'Salaried, Self-employed',
    minimum_income: 25000,
    minimum_credit_score: 720,
    collateral_required: true,
    co_applicant_allowed: true,
    active: true,
    source_url: 'https://www.hdfcbank.com/personal/borrow/popular-loans/car-loan',
    source_name: 'HDFC Bank Portal',
    last_verified_at: '2026-08-23T00:00:00Z',
    lender: SEED_LENDERS[1],
  },
  {
    id: '22222222-2222-2222-2222-222222222007',
    lender_id: '11111111-1111-1111-1111-111111111001',
    product_name: 'SBI Scholar Education Loan',
    loan_type: 'Education Loan',
    description: 'Collateral-free higher education loans for premier Indian and global institutions.',
    min_loan_amount: 100000,
    max_loan_amount: 5000000,
    min_tenure_months: 12,
    max_tenure_months: 180,
    interest_rate_type: 'Floating',
    min_interest_rate: 8.20,
    max_interest_rate: 9.50,
    processing_fee_type: 'Zero',
    processing_fee_value: 0,
    processing_fee_min: 0,
    processing_fee_max: 0,
    prepayment_allowed: true,
    prepayment_penalty_type: 'Nil prepayment charge',
    prepayment_penalty_value: 0,
    lock_in_months: 0,
    employment_eligibility: 'Student',
    minimum_income: 0,
    minimum_credit_score: 650,
    collateral_required: false,
    co_applicant_allowed: true,
    active: true,
    source_url: 'https://sbi.co.in/web/personal-banking/loans/education-loans',
    source_name: 'SBI Portal',
    last_verified_at: '2026-08-23T00:00:00Z',
    lender: SEED_LENDERS[0],
  },
  {
    id: '22222222-2222-2222-2222-222222222008',
    lender_id: '11111111-1111-1111-1111-111111111003',
    product_name: 'ICICI Flexi Personal Loan',
    loan_type: 'Personal Loan',
    description: 'Unsecured personal finance for planned and emergency expenses.',
    min_loan_amount: 50000,
    max_loan_amount: 5000000,
    min_tenure_months: 12,
    max_tenure_months: 72,
    interest_rate_type: 'Fixed',
    min_interest_rate: 10.65,
    max_interest_rate: 14.50,
    processing_fee_type: 'Percentage',
    processing_fee_value: 1.00,
    processing_fee_min: 1000,
    processing_fee_max: 5000,
    prepayment_allowed: true,
    prepayment_penalty_type: 'Allowed after 12 EMIs with nominal fee',
    prepayment_penalty_value: 3,
    lock_in_months: 12,
    employment_eligibility: 'Salaried, Self-employed',
    minimum_income: 30000,
    minimum_credit_score: 720,
    collateral_required: false,
    co_applicant_allowed: false,
    active: true,
    source_url: 'https://www.icicibank.com/personal-banking/loans/personal-loan',
    source_name: 'ICICI Bank Portal',
    last_verified_at: '2026-08-23T00:00:00Z',
    lender: SEED_LENDERS[2],
  },
  {
    id: '22222222-2222-2222-2222-222222222009',
    lender_id: '11111111-1111-1111-1111-111111111004',
    product_name: 'Axis MSME Business Term Loan',
    loan_type: 'Business Loan',
    description: 'Collateral-backed term loans and working capital facility for MSMEs and enterprises.',
    min_loan_amount: 500000,
    max_loan_amount: 50000000,
    min_tenure_months: 12,
    max_tenure_months: 120,
    interest_rate_type: 'Floating',
    min_interest_rate: 11.25,
    max_interest_rate: 15.00,
    processing_fee_type: 'Percentage',
    processing_fee_value: 1.25,
    processing_fee_min: 5000,
    processing_fee_max: 25000,
    prepayment_allowed: true,
    prepayment_penalty_type: 'Standard foreclosure terms',
    prepayment_penalty_value: 2,
    lock_in_months: 6,
    employment_eligibility: 'Self-employed',
    minimum_income: 50000,
    minimum_credit_score: 700,
    collateral_required: true,
    co_applicant_allowed: true,
    active: true,
    source_url: 'https://www.axisbank.com/business-banking/loans/business-loan',
    source_name: 'Axis Bank Portal',
    last_verified_at: '2026-08-23T00:00:00Z',
    lender: SEED_LENDERS[3],
  },
];

/**
 * Checks if rate verification date is older than configurable threshold (default: 90 days).
 */
export function isDataStale(
  lastVerifiedAt?: string | null,
  thresholdDays: number = 90
): boolean {
  if (!lastVerifiedAt) return true;
  try {
    const verifiedDate = new Date(lastVerifiedAt).getTime();
    const now = Date.now();
    const diffDays = (now - verifiedDate) / (1000 * 60 * 60 * 24);
    return diffDays > thresholdDays;
  } catch {
    return true;
  }
}

/**
 * Formats date into standard "DD MMM YYYY" display format.
 */
export function formatVerifiedDate(isoDateString?: string | null): string {
  if (!isoDateString) return 'Unverified';
  try {
    const date = new Date(isoDateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Unverified';
  }
}

/**
 * Fetches all active loan products for a specified loan type from Supabase or seed catalog.
 */
export async function getActiveLoanProducts(loanType?: LoanType): Promise<LoanProduct[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      let query = supabase
        .from('loan_products')
        .select('*, lender:lenders(*)')
        .eq('active', true);

      if (loanType) {
        query = query.eq('loan_type', loanType);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as unknown as LoanProduct[];
      }
    } catch {
      // Fallback to seed catalog below
    }
  }

  // Fallback to seed catalog
  if (loanType) {
    return SEED_LOAN_PRODUCTS.filter((p) => p.loan_type === loanType && p.active);
  }
  return SEED_LOAN_PRODUCTS.filter((p) => p.active);
}

/**
 * Builds deterministic comparison results for a given borrower requirement and loan product catalog.
 */
export function buildLoanComparison(params: {
  requirement: LoanRequirement;
  financialProfile?: FinancialProfile | null;
  profile?: Profile | null;
  products: LoanProduct[];
}): ComparisonResponse {
  const { requirement, financialProfile, profile, products } = params;
  const loanType = requirement.loan_type;
  const loanAmount = requirement.loan_amount;
  const tenureMonths = requirement.tenure_months;

  const comparisonRows: ComparisonProductResult[] = products.map((prod) => {
    const minRate = prod.min_interest_rate;
    const maxRate = prod.max_interest_rate ?? minRate;
    const rateDisplay =
      minRate === maxRate
        ? `${minRate.toFixed(2)}% p.a.`
        : `${minRate.toFixed(2)}% – ${maxRate.toFixed(2)}% p.a.`;

    // 1. EMI Calculation (Deterministic range and baseline)
    const emiRange = calculateEMIRange(loanAmount, minRate, maxRate, tenureMonths);

    // 2. Processing Fee Calculation
    const feeResult = calculateProcessingFee({
      loanAmount,
      feeType: prod.processing_fee_type,
      feeValue: prod.processing_fee_value,
      minFee: prod.processing_fee_min,
      maxFee: prod.processing_fee_max,
    });

    // 3. Known Borrowing Cost
    const costResult = calculateKnownBorrowingCost({
      totalInterest: emiRange.baselineTotalInterest,
      processingFee: feeResult.feeAmount,
      otherKnownCharges: 0,
    });

    // 4. Basic Eligibility Filter
    const eligibility = evaluateBasicEligibility(prod, {
      loanType,
      loanAmount,
      tenureMonths,
      monthlyIncome: financialProfile?.monthly_income,
      creditScore: financialProfile?.credit_score,
      employmentType: profile?.employment_type,
    });

    const isStale = isDataStale(prod.last_verified_at);

    return {
      productId: prod.id,
      lenderId: prod.lender_id,
      lenderName: prod.lender?.name || prod.product_name,
      lenderShortName: prod.lender?.short_name || null,
      lenderLogoUrl: prod.lender?.logo_url || null,
      lenderType: prod.lender?.lender_type || 'Bank',
      productName: prod.product_name,
      loanType: prod.loan_type,
      description: prod.description,
      interestRateType: prod.interest_rate_type || 'Floating',
      minInterestRate: minRate,
      maxInterestRate: maxRate,
      advertisedRateDisplay: rateDisplay,
      appliedInterestRate: minRate,
      monthlyEMI: emiRange.baselineEMI,
      minMonthlyEMI: emiRange.minEMI,
      maxMonthlyEMI: emiRange.maxEMI,
      totalInterest: emiRange.baselineTotalInterest,
      minTotalInterest: emiRange.minTotalInterest,
      maxTotalInterest: emiRange.maxTotalInterest,
      totalRepayment: emiRange.baselineTotalRepayment,
      processingFee: feeResult.feeAmount,
      processingFeeDisplay: feeResult.displayText,
      otherKnownCharges: 0,
      knownBorrowingCost: costResult.knownBorrowingCost,
      minimumIncome: prod.minimum_income,
      minimumCreditScore: prod.minimum_credit_score,
      employmentEligibility: prod.employment_eligibility,
      prepaymentAllowed: prod.prepayment_allowed,
      prepaymentPenalty: prod.prepayment_penalty_type,
      lockInMonths: prod.lock_in_months,
      collateralRequired: prod.collateral_required,
      coApplicantAllowed: prod.co_applicant_allowed,
      isEligible: eligibility.isEligible,
      eligibilityNotes: eligibility.notes,
      sourceName: prod.source_name || 'Official lender disclosure',
      sourceUrl: prod.source_url || 'https://www.rbi.org.in',
      lastVerifiedAt: prod.last_verified_at || new Date().toISOString(),
      isStale,
    };
  });

  const eligibleProductsCount = comparisonRows.filter((r) => r.isEligible).length;

  return {
    loanType,
    loanAmount,
    tenureMonths,
    borrowerIncome: financialProfile?.monthly_income,
    borrowerCreditScore: financialProfile?.credit_score,
    borrowerEmployment: profile?.employment_type,
    borrowerLocation: profile?.location,
    totalProductsCount: comparisonRows.length,
    eligibleProductsCount,
    products: comparisonRows,
    lastUpdated: new Date().toISOString(),
  };
}
