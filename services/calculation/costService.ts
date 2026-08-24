import { roundCurrency } from './emiService';
import { ProcessingFeeType } from '@/types/database';

export interface ProcessingFeeInput {
  loanAmount: number;
  feeType?: ProcessingFeeType | null;
  feeValue?: number | null;
  minFee?: number | null;
  maxFee?: number | null;
}

export interface ProcessingFeeResult {
  feeAmount: number;
  isDisclosed: boolean;
  displayText: string;
}

export interface KnownBorrowingCostInput {
  totalInterest: number;
  processingFee: number;
  otherKnownCharges?: number;
}

export interface KnownBorrowingCostResult {
  totalInterest: number;
  processingFee: number;
  otherKnownCharges: number;
  knownBorrowingCost: number;
  disclaimer: string;
}

export const KNOWN_COST_DISCLAIMER =
  'Known Borrowing Cost includes disclosed charges available in our dataset. Actual borrowing cost may differ based on lender-specific charges, taxes, insurance, borrower profile and final sanction terms.';

/**
 * Calculates processing fees taking into account percentage, fixed values, min and max bounds.
 */
export function calculateProcessingFee({
  loanAmount,
  feeType,
  feeValue,
  minFee,
  maxFee,
}: ProcessingFeeInput): ProcessingFeeResult {
  if (loanAmount <= 0) {
    return {
      feeAmount: 0,
      isDisclosed: true,
      displayText: '₹0',
    };
  }

  if (feeType === 'Zero' || feeValue === 0) {
    return {
      feeAmount: 0,
      isDisclosed: true,
      displayText: 'Nil / Zero',
    };
  }

  if (feeType === 'Fixed' && typeof feeValue === 'number') {
    const feeAmount = roundCurrency(Math.max(0, feeValue));
    return {
      feeAmount,
      isDisclosed: true,
      displayText: `₹${feeAmount.toLocaleString('en-IN')}`,
    };
  }

  if (feeType === 'Percentage' && typeof feeValue === 'number') {
    const rawFee = loanAmount * (feeValue / 100);
    let feeAmount = rawFee;

    if (typeof minFee === 'number' && minFee > 0 && feeAmount < minFee) {
      feeAmount = minFee;
    }
    if (typeof maxFee === 'number' && maxFee > 0 && feeAmount > maxFee) {
      feeAmount = maxFee;
    }

    feeAmount = roundCurrency(feeAmount);
    return {
      feeAmount,
      isDisclosed: true,
      displayText: `${feeValue}% (₹${feeAmount.toLocaleString('en-IN')})`,
    };
  }

  // Not disclosed / unavailable
  return {
    feeAmount: 0,
    isDisclosed: false,
    displayText: 'Not disclosed',
  };
}

/**
 * Calculates Known Borrowing Cost: Total Interest + Processing Fee + Other Disclosed Charges
 */
export function calculateKnownBorrowingCost({
  totalInterest,
  processingFee,
  otherKnownCharges = 0,
}: KnownBorrowingCostInput): KnownBorrowingCostResult {
  const safeInterest = Math.max(0, totalInterest);
  const safeFee = Math.max(0, processingFee);
  const safeOther = Math.max(0, otherKnownCharges);

  const knownBorrowingCost = roundCurrency(safeInterest + safeFee + safeOther);

  return {
    totalInterest: safeInterest,
    processingFee: safeFee,
    otherKnownCharges: safeOther,
    knownBorrowingCost,
    disclaimer: KNOWN_COST_DISCLAIMER,
  };
}
