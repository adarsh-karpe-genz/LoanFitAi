/**
 * LoanFit AI - Deterministic Reducing-Balance EMI Calculation Engine
 * 
 * Standard formula:
 * EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * Where:
 * P = Principal loan amount
 * r = Monthly interest rate (annual_rate / 12 / 100)
 * n = Number of monthly installments (tenure in months)
 */

export interface EMICalculationParams {
  principal: number;
  annualInterestRate: number; // e.g. 8.5 for 8.5%
  tenureMonths: number;
}

export interface EMICalculationResult {
  principal: number;
  annualInterestRate: number;
  monthlyInterestRate: number;
  tenureMonths: number;
  emi: number;
  totalRepayment: number;
  totalInterest: number;
}

export interface EMIRangeResult {
  principal: number;
  minRate: number;
  maxRate: number;
  tenureMonths: number;
  minEMI: number;
  maxEMI: number;
  baselineEMI: number;
  minTotalInterest: number;
  maxTotalInterest: number;
  baselineTotalInterest: number;
  minTotalRepayment: number;
  maxTotalRepayment: number;
  baselineTotalRepayment: number;
}

/**
 * Rounds number to 2 decimal places to prevent floating-point representation artifacts.
 */
export function roundCurrency(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates deterministic monthly EMI, total repayment, and total interest.
 */
export function calculateEMI({
  principal,
  annualInterestRate,
  tenureMonths,
}: EMICalculationParams): EMICalculationResult {
  if (principal < 0) {
    throw new Error('Principal loan amount cannot be negative.');
  }

  if (tenureMonths <= 0) {
    throw new Error('Tenure in months must be greater than 0.');
  }

  if (annualInterestRate < 0) {
    throw new Error('Annual interest rate cannot be negative.');
  }

  if (principal === 0) {
    return {
      principal: 0,
      annualInterestRate,
      monthlyInterestRate: 0,
      tenureMonths,
      emi: 0,
      totalRepayment: 0,
      totalInterest: 0,
    };
  }

  // Handle 0% interest case (e.g. promotional / no-cost finance)
  if (annualInterestRate === 0) {
    const rawEMI = principal / tenureMonths;
    const emi = roundCurrency(rawEMI);
    const totalRepayment = roundCurrency(emi * tenureMonths);
    return {
      principal,
      annualInterestRate: 0,
      monthlyInterestRate: 0,
      tenureMonths,
      emi,
      totalRepayment,
      totalInterest: 0,
    };
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  const growthFactor = Math.pow(1 + monthlyRate, tenureMonths);

  // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  const rawEMI = (principal * monthlyRate * growthFactor) / (growthFactor - 1);
  const emi = roundCurrency(rawEMI);
  const totalRepayment = roundCurrency(emi * tenureMonths);
  const totalInterest = roundCurrency(Math.max(0, totalRepayment - principal));

  return {
    principal,
    annualInterestRate,
    monthlyInterestRate: roundCurrency(monthlyRate * 100) / 100,
    tenureMonths,
    emi,
    totalRepayment,
    totalInterest,
  };
}

/**
 * Calculates EMI and cost ranges for variable/floating rate products.
 */
export function calculateEMIRange(
  principal: number,
  minRate: number,
  maxRate: number | null | undefined,
  tenureMonths: number
): EMIRangeResult {
  const effectiveMaxRate = maxRate && maxRate >= minRate ? maxRate : minRate;
  const minResult = calculateEMI({ principal, annualInterestRate: minRate, tenureMonths });
  const maxResult = calculateEMI({ principal, annualInterestRate: effectiveMaxRate, tenureMonths });

  return {
    principal,
    minRate,
    maxRate: effectiveMaxRate,
    tenureMonths,
    minEMI: minResult.emi,
    maxEMI: maxResult.emi,
    baselineEMI: minResult.emi, // Min rate used as standard advertised baseline
    minTotalInterest: minResult.totalInterest,
    maxTotalInterest: maxResult.totalInterest,
    baselineTotalInterest: minResult.totalInterest,
    minTotalRepayment: minResult.totalRepayment,
    maxTotalRepayment: maxResult.totalRepayment,
    baselineTotalRepayment: minResult.totalRepayment,
  };
}
