export type EmploymentType = 'Salaried' | 'Self-employed' | 'Student';

export type LoanType =
  | 'Home Loan'
  | 'Education Loan'
  | 'Car Loan'
  | 'Personal Loan'
  | 'Business Loan';

export type LenderType = 'Bank' | 'NBFC' | 'Other';

export type InterestRateType = 'Fixed' | 'Floating' | 'Rate Range';

export type ProcessingFeeType = 'Percentage' | 'Fixed' | 'Zero';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  age: number;
  employment_type: EmploymentType;
  location: string;
  city?: string;
  personal_info_completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BorrowerProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  age: number | null;
  employment_type: string | null;
  city: string | null;
  personal_info_completed_at: string | null;
  monthly_income: number;
  monthly_expenses: number;
  existing_emi: number;
  credit_score: number | null;
  created_at?: string;
  updated_at?: string;
}


export interface FinancialProfile {
  id: string;
  user_id: string;
  monthly_income: number;
  monthly_expenses: number;
  existing_emi: number;
  credit_score: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoanRequirement {
  id: string;
  user_id: string;
  loan_type: LoanType;
  loan_amount: number;
  tenure_months: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  cost_weight: number;
  emi_weight: number;
  eligibility_weight: number;
  fee_weight: number;
  flexibility_weight: number;
  created_at?: string;
  updated_at?: string;
}

export interface BorrowerFullProfile {
  profile: Profile | null;
  financialProfile: FinancialProfile | null;
  loanRequirement: LoanRequirement | null;
  preferences: UserPreferences | null;
  completionPercentage: number;
}

export interface Lender {
  id: string;
  name: string;
  short_name?: string | null;
  lender_type: LenderType;
  website_url?: string | null;
  logo_url?: string | null;
  headquarters?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoanProduct {
  id: string;
  lender_id: string;
  product_name: string;
  loan_type: LoanType;
  description?: string | null;
  min_loan_amount?: number | null;
  max_loan_amount?: number | null;
  min_tenure_months?: number | null;
  max_tenure_months?: number | null;
  interest_rate_type?: InterestRateType | null;
  min_interest_rate: number;
  max_interest_rate?: number | null;
  processing_fee_type?: ProcessingFeeType | null;
  processing_fee_value?: number | null;
  processing_fee_min?: number | null;
  processing_fee_max?: number | null;
  prepayment_allowed?: boolean | null;
  prepayment_penalty_type?: string | null;
  prepayment_penalty_value?: number | null;
  lock_in_months?: number | null;
  employment_eligibility?: string | null;
  minimum_income?: number | null;
  minimum_credit_score?: number | null;
  collateral_required?: boolean | null;
  co_applicant_allowed?: boolean | null;
  active: boolean;
  source_url?: string | null;
  source_name?: string | null;
  last_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  lender?: Lender | null;
}

export interface ComparisonProductResult {
  productId: string;
  lenderId: string;
  lenderName: string;
  lenderShortName?: string | null;
  lenderLogoUrl?: string | null;
  lenderType: LenderType;
  productName: string;
  loanType: LoanType;
  description?: string | null;
  interestRateType: InterestRateType;
  minInterestRate: number;
  maxInterestRate: number;
  advertisedRateDisplay: string;
  appliedInterestRate: number; // Baseline rate used for calculations
  monthlyEMI: number;
  minMonthlyEMI?: number;
  maxMonthlyEMI?: number;
  totalInterest: number;
  minTotalInterest?: number;
  maxTotalInterest?: number;
  totalRepayment: number;
  processingFee: number;
  processingFeeDisplay: string;
  otherKnownCharges: number;
  knownBorrowingCost: number;
  minimumIncome?: number | null;
  minimumCreditScore?: number | null;
  employmentEligibility?: string | null;
  prepaymentAllowed?: boolean | null;
  prepaymentPenalty?: string | null;
  lockInMonths?: number | null;
  collateralRequired?: boolean | null;
  coApplicantAllowed?: boolean | null;
  isEligible: boolean;
  eligibilityNotes: string[];
  sourceName: string;
  sourceUrl: string;
  lastVerifiedAt: string;
  isStale: boolean;
}

export interface ComparisonResponse {
  loanType: LoanType;
  loanAmount: number;
  tenureMonths: number;
  borrowerIncome?: number;
  borrowerCreditScore?: number | null;
  borrowerEmployment?: EmploymentType;
  borrowerLocation?: string;
  totalProductsCount: number;
  eligibleProductsCount: number;
  products: ComparisonProductResult[];
  lastUpdated: string;
}

export type SortField =
  | 'interest_rate'
  | 'emi'
  | 'total_interest'
  | 'processing_fee'
  | 'known_borrowing_cost';

export type SortOrder = 'asc' | 'desc';

export interface ComparisonFilterState {
  lenderIds: string[];
  minRate?: number;
  maxRate?: number;
  maxEMI?: number;
  maxProcessingFee?: number;
  onlyEligible: boolean;
  searchTerm: string;
}

// ============================================================================
// PHASE 3: RECOMMENDATION & SIMULATION ENGINE TYPES
// ============================================================================

export interface RecommendationWeights {
  costWeight: number; // default 0.60 (60%)
  feeWeight: number; // default 0.20 (20%)
  eligibilityWeight: number; // default 0.20 (20%)
}

export interface RecommendationRun {
  id: string;
  user_id: string;
  loan_type: LoanType;
  loan_amount: number;
  tenure_months: number;
  monthly_income: number;
  existing_emi: number;
  credit_score: number | null;
  cost_weight: number;
  fee_weight: number;
  eligibility_weight: number;
  model_version?: string;
  created_at?: string;
}

export interface RecommendationResultItem {
  id?: string;
  run_id?: string;
  product_id: string;
  lender_id: string;
  lender_name: string;
  lender_short_name?: string | null;
  lender_logo_url?: string | null;
  product_name: string;
  loan_type: LoanType;
  interest_rate: number;
  calculated_emi: number;
  total_interest: number;
  processing_fee: number;
  total_cost: number; // Net Cost of Borrowing
  foir: number; // Ratio e.g. 0.42 (42%)
  foir_percentage: number; // Percentage e.g. 42
  cost_utility: number; // 0 to 1
  fee_utility: number; // 0 to 1
  eligibility_utility: number; // 0 to 1
  utility_score: number; // 0 to 100
  rank: number;
  is_eligible: boolean;
  filter_reasons?: string[];
  source_name?: string;
  source_url?: string;
  last_verified_at?: string;
  breakdown: {
    costComponentScore: number; // cost_utility * cost_weight * 100
    feeComponentScore: number; // fee_utility * fee_weight * 100
    eligibilityComponentScore: number; // eligibility_utility * eligibility_weight * 100
    weightsApplied: RecommendationWeights;
    foirThreshold: number;
    userCIBIL: number | null;
    minCIBILRequired: number | null;
    creditBuffer: number;
  };
}

export interface RecommendationResponse {
  runId?: string;
  userId?: string;
  isSimulated: boolean;
  borrowerContext: {
    loanType: LoanType;
    loanAmount: number;
    tenureMonths: number;
    monthlyIncome: number;
    existingEMI: number;
    creditScore: number | null;
    foirThreshold: number;
  };
  weightsApplied: RecommendationWeights;
  totalCatalogProducts: number;
  qualifiedProductsCount: number;
  recommendations: RecommendationResultItem[];
  disqualifiedProducts?: Array<{
    productId: string;
    productName: string;
    lenderName: string;
    calculatedEMI: number;
    foir: number;
    reasons: string[];
  }>;
  generatedAt: string;
}

export interface SimulationPayload {
  loanType?: LoanType;
  amount: number;
  tenureMonths: number;
  monthlyIncome: number;
  existingEMI?: number;
  creditScore?: number | null;
  weights?: Partial<RecommendationWeights>;
  maxFOIR?: number;
}

// ============================================================================
// PHASE 4: EXPLAINABLE AI (XAI) & GEMINI ASSISTANT TYPES
// ============================================================================

export type SupportedLanguage =
  | 'en' // English
  | 'hi' // Hindi (हिन्दी)
  | 'mr' // Marathi (मराठी)
  | 'ta' // Tamil (தமிழ்)
  | 'te' // Telugu (తెలుగు)
  | 'bn' // Bengali (বাংলা)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'gu'; // Gujarati (ગુજરાતી)

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export interface ShapValueComponent {
  featureName: string;
  featureValue: string;
  impactScore: number; // e.g. +38.5 pts
  direction: 'positive' | 'negative' | 'neutral';
  explanation: string;
}

export interface XaiExplanation {
  productId: string;
  productName: string;
  lenderName: string;
  rank: number;
  utilityScore: number;
  headline: string;
  summary: string;
  positiveDrivers: string[];
  tradeOffs: string[];
  foirVerdict: string;
  shapFeatureImpacts: ShapValueComponent[];
  language: SupportedLanguage;
  generatedAt: string;
  isAiGenerated: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language?: SupportedLanguage;
  relatedProductId?: string;
  isGrounded?: boolean;
}

export interface AccountAggregatorConsentState {
  status: 'IDLE' | 'SELECTING_BANKS' | 'REQUESTING_OTP' | 'VERIFYING_OTP' | 'FETCHING_DATA' | 'SUCCESS' | 'ERROR';
  selectedBanks: string[];
  phoneNumber?: string;
  consentHandle?: string;
  accountsFoundCount?: number;
  errorMessage?: string;
}

// ============================================================================
// PHASE 5: AUDIT LOGGING, CONSENT & PRODUCTION SCALE TYPES
// ============================================================================

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'SIGNUP'
  | 'UPDATE_PROFILE'
  | 'UPDATE_FINANCIAL_PROFILE'
  | 'UPDATE_LOAN_REQUIREMENT'
  | 'UPDATE_PREFERENCES'
  | 'GENERATE_RECOMMENDATION'
  | 'RUN_SIMULATION'
  | 'REQUEST_XAI_EXPLANATION'
  | 'AA_CONSENT_INITIATED'
  | 'AA_CONSENT_GRANTED'
  | 'AA_CONSENT_REVOKED'
  | 'LENDER_WEBHOOK_RECEIVED'
  | 'DELETE_ACCOUNT';

export interface AuditLog {
  id?: string;
  user_id?: string | null;
  action: AuditAction;
  resource: string;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, any> | null;
  created_at?: string;
}

export type ConsentStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface ConsentRecord {
  id?: string;
  user_id: string;
  provider: string; // e.g. 'Sahamati_AA', 'Bhashini', 'CreditBureau'
  purpose: string; // e.g. 'LOAN_UNDERWRITING', 'INCOME_VERIFICATION'
  status: ConsentStatus;
  consent_handle?: string | null;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WebhookUpdatePayload {
  lenderId: string;
  secretToken: string;
  products: Array<{
    productId: string;
    minInterestRate?: number;
    maxInterestRate?: number;
    processingFeeValue?: number;
    active?: boolean;
    sourceUrl?: string;
  }>;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          age: number;
          employment_type: EmploymentType;
          location: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          age?: number;
          employment_type?: EmploymentType;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      financial_profiles: {
        Row: FinancialProfile;
        Insert: {
          id?: string;
          user_id: string;
          monthly_income: number;
          monthly_expenses: number;
          existing_emi?: number;
          credit_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          monthly_income?: number;
          monthly_expenses?: number;
          existing_emi?: number;
          credit_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      loan_requirements: {
        Row: LoanRequirement;
        Insert: {
          id?: string;
          user_id: string;
          loan_type: LoanType;
          loan_amount: number;
          tenure_months: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          loan_type?: LoanType;
          loan_amount?: number;
          tenure_months?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: {
          id?: string;
          user_id: string;
          cost_weight?: number;
          emi_weight?: number;
          eligibility_weight?: number;
          fee_weight?: number;
          flexibility_weight?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cost_weight?: number;
          emi_weight?: number;
          eligibility_weight?: number;
          fee_weight?: number;
          flexibility_weight?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lenders: {
        Row: Lender;
        Insert: Omit<Lender, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Lender, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      loan_products: {
        Row: LoanProduct;
        Insert: Omit<LoanProduct, 'id' | 'created_at' | 'updated_at' | 'lender'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<LoanProduct, 'id' | 'created_at' | 'updated_at' | 'lender'>>;
        Relationships: [];
      };
      recommendation_runs: {
        Row: RecommendationRun;
        Insert: {
          id?: string;
          user_id: string;
          loan_type: LoanType;
          loan_amount: number;
          tenure_months: number;
          monthly_income: number;
          existing_emi?: number;
          credit_score?: number | null;
          cost_weight?: number;
          fee_weight?: number;
          eligibility_weight?: number;
          created_at?: string;
        };
        Update: Partial<RecommendationRun>;
        Relationships: [];
      };
      recommendation_results: {
        Row: {
          id: string;
          run_id: string;
          product_id: string;
          calculated_emi: number;
          total_cost: number;
          utility_score: number;
          rank: number;
          foir?: number;
          cost_utility?: number;
          fee_utility?: number;
          eligibility_utility?: number;
          created_at?: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          product_id: string;
          calculated_emi: number;
          total_cost: number;
          utility_score: number;
          rank: number;
          foir?: number;
          cost_utility?: number;
          fee_utility?: number;
          eligibility_utility?: number;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          run_id: string;
          product_id: string;
          calculated_emi: number;
          total_cost: number;
          utility_score: number;
          rank: number;
          foir?: number;
          cost_utility?: number;
          fee_utility?: number;
          eligibility_utility?: number;
          created_at?: string;
        }>;
        Relationships: [];
      };
      consent_records: {
        Row: ConsentRecord;
        Insert: Omit<ConsentRecord, 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ConsentRecord>;
        Relationships: [];
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<AuditLog>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
