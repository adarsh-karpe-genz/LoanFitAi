import { LoanType } from '@/types/database';

/**
 * Future Phase 3 Recommendation Engine Interfaces
 * Note: These are defined as clean contract boundaries for Phase 2/3 and are not executed in Phase 1.
 */

export interface LoanProduct {
  id: string;
  lender_id: string;
  lender_name: string;
  lender_logo_url?: string;
  loan_type: LoanType;
  min_interest_rate: number;
  max_interest_rate: number;
  processing_fee_percentage: number;
  min_processing_fee: number;
  max_tenure_months: number;
  min_credit_score: number;
  min_income: number;
  max_foir: number;
}

export interface RecommendationScoreBreakdown {
  costScore: number;
  emiScore: number;
  eligibilityScore: number;
  feeScore: number;
  flexibilityScore: number;
  compositeScore: number;
}

export interface LoanRecommendation {
  product: LoanProduct;
  estimatedInterestRate: number;
  estimatedEMI: number;
  totalBorrowingCost: number;
  estimatedProcessingFee: number;
  suitabilityScore: number; // 0 - 100
  scoreBreakdown: RecommendationScoreBreakdown;
  eligibilityStatus: 'High' | 'Moderate' | 'Low';
  xaiExplanation?: {
    positiveFactors: string[];
    tradeoffs: string[];
    summary: string;
  };
}
