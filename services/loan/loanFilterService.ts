import { LoanProduct, EmploymentType, LoanType } from '@/types/database';

export interface BorrowerEligibilityContext {
  loanType: LoanType;
  loanAmount: number;
  tenureMonths: number;
  monthlyIncome?: number | null;
  creditScore?: number | null;
  employmentType?: EmploymentType | null;
}

export interface EligibilityFilterResult {
  isEligible: boolean;
  notes: string[];
}

export const BASIC_FILTER_DISCLAIMER =
  'Basic Product Eligibility Filter — Passing this initial criteria check does not guarantee final bank sanction. Lenders apply independent credit appraisal, FOIR, title verification, and underwriting policies.';

/**
 * Evaluates whether a loan product matches the borrower's stated requirements and minimum thresholds.
 */
export function evaluateBasicEligibility(
  product: LoanProduct,
  context: BorrowerEligibilityContext
): EligibilityFilterResult {
  const notes: string[] = [];
  let isEligible = true;

  // 1. Loan Type Match
  if (product.loan_type !== context.loanType) {
    return {
      isEligible: false,
      notes: [`Product category (${product.loan_type}) does not match requested loan type (${context.loanType}).`],
    };
  }

  // 2. Loan Amount Limits
  if (typeof product.min_loan_amount === 'number' && context.loanAmount < product.min_loan_amount) {
    isEligible = false;
    notes.push(`Loan amount ₹${context.loanAmount.toLocaleString('en-IN')} is below lender minimum of ₹${product.min_loan_amount.toLocaleString('en-IN')}.`);
  }

  if (typeof product.max_loan_amount === 'number' && context.loanAmount > product.max_loan_amount) {
    isEligible = false;
    notes.push(`Loan amount ₹${context.loanAmount.toLocaleString('en-IN')} exceeds lender maximum cap of ₹${product.max_loan_amount.toLocaleString('en-IN')}.`);
  }

  // 3. Tenure Limits
  if (typeof product.min_tenure_months === 'number' && context.tenureMonths < product.min_tenure_months) {
    isEligible = false;
    notes.push(`Requested tenure (${context.tenureMonths} mos) is below lender minimum tenure (${product.min_tenure_months} mos).`);
  }

  if (typeof product.max_tenure_months === 'number' && context.tenureMonths > product.max_tenure_months) {
    isEligible = false;
    notes.push(`Requested tenure (${context.tenureMonths} mos) exceeds lender maximum allowable tenure (${product.max_tenure_months} mos).`);
  }

  // 4. Minimum Stated Income
  if (
    typeof product.minimum_income === 'number' &&
    typeof context.monthlyIncome === 'number' &&
    context.monthlyIncome > 0
  ) {
    if (context.monthlyIncome < product.minimum_income) {
      isEligible = false;
      notes.push(`Monthly income ₹${context.monthlyIncome.toLocaleString('en-IN')} is below lender stated threshold of ₹${product.minimum_income.toLocaleString('en-IN')}.`);
    }
  }

  // 5. Minimum Credit Score
  if (typeof product.minimum_credit_score === 'number' && product.minimum_credit_score > 0) {
    if (typeof context.creditScore === 'number' && context.creditScore > 0) {
      if (context.creditScore < product.minimum_credit_score) {
        isEligible = false;
        notes.push(`Credit score (${context.creditScore}) is below lender minimum requirement of ${product.minimum_credit_score}.`);
      }
    } else {
      notes.push(`Lender prefers CIBIL score $\\ge$ ${product.minimum_credit_score}. Your score is currently unspecified.`);
    }
  }

  // 6. Employment Eligibility
  if (
    product.employment_eligibility &&
    context.employmentType &&
    !product.employment_eligibility.includes('All')
  ) {
    const allowedTypes = product.employment_eligibility.toLowerCase();
    const userType = context.employmentType.toLowerCase();
    if (!allowedTypes.includes(userType)) {
      isEligible = false;
      notes.push(`Lender caters specifically to ${product.employment_eligibility}.`);
    }
  }

  if (isEligible && notes.length === 0) {
    notes.push('Meets stated baseline parameters for amount, tenure, and eligibility criteria.');
  }

  return {
    isEligible,
    notes,
  };
}
