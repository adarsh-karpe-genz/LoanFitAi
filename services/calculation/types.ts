/**
 * Calculation interfaces for Phase 2 (EMI, Total Cost of Borrowing, FOIR, Amortization)
 */

export interface EMICalculationInput {
  principal: number;
  annualInterestRate: number; // e.g. 8.5 for 8.5%
  tenureMonths: number;
}

export interface EMICalculationResult {
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  principal: number;
}

export interface FOIRInput {
  monthlyIncome: number;
  existingMonthlyEMI: number;
  proposedMonthlyEMI?: number;
}

export interface FOIRResult {
  currentFOIR: number; // percentage (0 - 100)
  projectedFOIR?: number; // percentage (0 - 100)
  isWithinStandardLimit: boolean; // typically <= 50%
}
