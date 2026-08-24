import { calculateEMI, calculateEMIRange, roundCurrency } from './services/calculation/emiService';
import { calculateProcessingFee, calculateKnownBorrowingCost } from './services/calculation/costService';
import { evaluateBasicEligibility } from './services/loan/loanFilterService';
import { isDataStale, buildLoanComparison, SEED_LOAN_PRODUCTS } from './services/loan/loanCatalogService';
import { LoanProduct, LoanRequirement, FinancialProfile, Profile } from './types/database';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

console.log('\n==================================================');
console.log('🧪 RUNNING LOANFIT AI PHASE 2 TEST SUITE');
console.log('==================================================\n');

// 1. Standard EMI Formula Calculation
console.log('--- 1. Standard Reducing-Balance EMI Tests ---');
// ₹30,00,000 at 8.5% for 20 years (240 months)
// Standard formula gives EMI = 26,034.66 -> round to 26034.66
const emiResult1 = calculateEMI({
  principal: 3000000,
  annualInterestRate: 8.5,
  tenureMonths: 240,
});
assert(Math.abs(emiResult1.emi - 26034.66) < 1, `Standard EMI for ₹30L @ 8.5% for 20 yrs: ${emiResult1.emi} (expected ~26,034.66)`);
assert(Math.abs(emiResult1.totalRepayment - 6248318.4) < 10, `Total Repayment: ${emiResult1.totalRepayment}`);
assert(Math.abs(emiResult1.totalInterest - 3248318.4) < 10, `Total Interest: ${emiResult1.totalInterest}`);

// 2. Zero Interest EMI Test
console.log('\n--- 2. Zero-Interest EMI Tests ---');
const emiZero = calculateEMI({
  principal: 120000,
  annualInterestRate: 0,
  tenureMonths: 12,
});
assert(emiZero.emi === 10000, `Zero-interest EMI on ₹1.2L for 12 mos: ${emiZero.emi} (expected 10,000)`);
assert(emiZero.totalInterest === 0, `Zero-interest total interest: ${emiZero.totalInterest} (expected 0)`);
assert(emiZero.totalRepayment === 120000, `Zero-interest total repayment: ${emiZero.totalRepayment}`);

// 3. Different Tenures Tests
console.log('\n--- 3. Tenure Variations Tests ---');
const emi5yr = calculateEMI({ principal: 1000000, annualInterestRate: 9.0, tenureMonths: 60 });
const emi10yr = calculateEMI({ principal: 1000000, annualInterestRate: 9.0, tenureMonths: 120 });
const emi30yr = calculateEMI({ principal: 1000000, annualInterestRate: 9.0, tenureMonths: 360 });

assert(emi5yr.emi > emi10yr.emi && emi10yr.emi > emi30yr.emi, 'Shorter tenure yields higher monthly EMI');
assert(emi5yr.totalInterest < emi10yr.totalInterest && emi10yr.totalInterest < emi30yr.totalInterest, 'Longer tenure yields higher cumulative total interest');

// 4. Different Rates Tests
console.log('\n--- 4. Interest Rate Variations Tests ---');
const emiLowRate = calculateEMI({ principal: 2000000, annualInterestRate: 8.4, tenureMonths: 240 });
const emiHighRate = calculateEMI({ principal: 2000000, annualInterestRate: 10.5, tenureMonths: 240 });
assert(emiLowRate.emi < emiHighRate.emi, 'Lower interest rate produces lower monthly EMI');

// 5. Processing Fee Calculation Tests
console.log('\n--- 5. Processing Fee Calculation Tests ---');
// Percentage: 0.5% on ₹30,00,000 with min 3,000 and max 15,000
const feeNormal = calculateProcessingFee({
  loanAmount: 3000000,
  feeType: 'Percentage',
  feeValue: 0.5,
  minFee: 3000,
  maxFee: 15000,
});
assert(feeNormal.feeAmount === 15000, `Processing fee 0.5% on ₹30L: ₹${feeNormal.feeAmount} (expected 15,000)`);

// Min clamp: 0.5% on ₹2,00,000 = ₹1,000 -> clamped to min ₹3,000
const feeMinClamp = calculateProcessingFee({
  loanAmount: 200000,
  feeType: 'Percentage',
  feeValue: 0.5,
  minFee: 3000,
  maxFee: 15000,
});
assert(feeMinClamp.feeAmount === 3000, `Min fee clamp active: ₹${feeMinClamp.feeAmount} (expected 3,000)`);

// Max clamp: 0.5% on ₹1,00,00,000 = ₹50,000 -> clamped to max ₹15,000
const feeMaxClamp = calculateProcessingFee({
  loanAmount: 10000000,
  feeType: 'Percentage',
  feeValue: 0.5,
  minFee: 3000,
  maxFee: 15000,
});
assert(feeMaxClamp.feeAmount === 15000, `Max fee clamp active: ₹${feeMaxClamp.feeAmount} (expected 15,000)`);

// Fixed fee
const feeFixed = calculateProcessingFee({
  loanAmount: 500000,
  feeType: 'Fixed',
  feeValue: 4999,
});
assert(feeFixed.feeAmount === 4999, `Fixed processing fee: ₹${feeFixed.feeAmount}`);

// Zero fee
const feeZero = calculateProcessingFee({
  loanAmount: 1000000,
  feeType: 'Zero',
  feeValue: 0,
});
assert(feeZero.feeAmount === 0 && feeZero.displayText.includes('Nil'), 'Zero processing fee handled');

// Missing / undisclosed fee
const feeUndisclosed = calculateProcessingFee({
  loanAmount: 1000000,
  feeType: null,
  feeValue: null,
});
assert(feeUndisclosed.displayText === 'Not disclosed', 'Undisclosed fee labeled transparently');

// 6. Known Borrowing Cost Tests
console.log('\n--- 6. Known Borrowing Cost Tests ---');
const knownCost = calculateKnownBorrowingCost({
  totalInterest: 3248318.4,
  processingFee: 10000,
  otherKnownCharges: 0,
});
assert(knownCost.knownBorrowingCost === 3258318.4, `Known Borrowing Cost: ₹${knownCost.knownBorrowingCost}`);
assert(knownCost.disclaimer.includes('Known Borrowing Cost includes disclosed charges'), 'Mandatory disclaimer present');

// 7. Input Edge Cases & Guardrails
console.log('\n--- 7. Error Handling & Guardrails ---');
let caughtNegativePrincipal = false;
try {
  calculateEMI({ principal: -500000, annualInterestRate: 8.5, tenureMonths: 240 });
} catch {
  caughtNegativePrincipal = true;
}
assert(caughtNegativePrincipal, 'Negative loan principal rejected with Error');

let caughtZeroTenure = false;
try {
  calculateEMI({ principal: 500000, annualInterestRate: 8.5, tenureMonths: 0 });
} catch {
  caughtZeroTenure = true;
}
assert(caughtZeroTenure, 'Zero tenure rejected with Error');

// Very large loan amount
const emiLarge = calculateEMI({ principal: 100000000, annualInterestRate: 8.5, tenureMonths: 360 });
assert(emiLarge.emi > 0 && !isNaN(emiLarge.emi), `Large loan (₹10 Cr) calculated safely: ₹${emiLarge.emi}/mo`);

// 8. Data Freshness Utility Tests
console.log('\n--- 8. Data Freshness Checking Tests ---');
const recentDate = new Date().toISOString();
const oldDate = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(); // 120 days ago
assert(!isDataStale(recentDate, 90), 'Recent verification date is not stale');
assert(isDataStale(oldDate, 90), 'Date older than 90 days flagged as stale');
assert(isDataStale(null), 'Missing verification date treated as stale');

// 9. Basic Eligibility Filter Tests
console.log('\n--- 9. Basic Eligibility Filter Tests ---');
const sampleProduct: LoanProduct = {
  id: 'prod-1',
  lender_id: 'lender-1',
  product_name: 'Test Home Loan',
  loan_type: 'Home Loan',
  min_loan_amount: 500000,
  max_loan_amount: 50000000,
  min_tenure_months: 12,
  max_tenure_months: 360,
  min_interest_rate: 8.5,
  minimum_income: 25000,
  minimum_credit_score: 700,
  employment_eligibility: 'Salaried, Self-employed',
  active: true,
};

const eligibleCtx = {
  loanType: 'Home Loan' as const,
  loanAmount: 3000000,
  tenureMonths: 240,
  monthlyIncome: 60000,
  creditScore: 760,
  employmentType: 'Salaried' as const,
};
const filterPass = evaluateBasicEligibility(sampleProduct, eligibleCtx);
assert(filterPass.isEligible, 'Borrower meeting all criteria passes basic filter');

const lowIncomeCtx = { ...eligibleCtx, monthlyIncome: 20000 };
const filterFailIncome = evaluateBasicEligibility(sampleProduct, lowIncomeCtx);
assert(!filterFailIncome.isEligible, 'Income below threshold fails filter');

const lowScoreCtx = { ...eligibleCtx, creditScore: 650 };
const filterFailScore = evaluateBasicEligibility(sampleProduct, lowScoreCtx);
assert(!filterFailScore.isEligible, 'Credit score below threshold fails filter');

const mismatchTypeCtx = { ...eligibleCtx, loanType: 'Personal Loan' as const };
const filterFailType = evaluateBasicEligibility(sampleProduct, mismatchTypeCtx);
assert(!filterFailType.isEligible, 'Mismatched loan type fails filter');

// 10. Complete Final Test Scenario Comparison Pipeline
console.log('\n--- 10. Final Scenario Comparison Pipeline Verification ---');
const testRequirement: LoanRequirement = {
  id: 'req-final',
  user_id: 'user-final',
  loan_type: 'Home Loan',
  loan_amount: 3000000,
  tenure_months: 240,
};

const testFinancial: FinancialProfile = {
  id: 'fin-final',
  user_id: 'user-final',
  monthly_income: 60000,
  monthly_expenses: 25000,
  existing_emi: 5000,
  credit_score: 760,
};

const testPersonal: Profile = {
  id: 'prof-final',
  user_id: 'user-final',
  full_name: 'Rahul Sharma',
  age: 28,
  employment_type: 'Salaried',
  location: 'Pune',
};

const homeProducts = SEED_LOAN_PRODUCTS.filter((p) => p.loan_type === 'Home Loan');
const comparisonResult = buildLoanComparison({
  requirement: testRequirement,
  financialProfile: testFinancial,
  profile: testPersonal,
  products: homeProducts,
});

if (comparisonResult.eligibleProductsCount !== 5) {
  console.log('Ineligible products debug:', comparisonResult.products.map(p => ({
    name: p.productName,
    isEligible: p.isEligible,
    notes: p.eligibilityNotes,
  })));
}

assert(comparisonResult.products.length === 5, `Generated comparison for 5 Home Loan products (SBI, HDFC, ICICI, Axis, BoB)`);
assert(comparisonResult.eligibleProductsCount === 5, 'All 5 institutional products match test borrower profile');
assert(comparisonResult.products.every((p) => p.monthlyEMI > 0 && p.knownBorrowingCost > 0), 'All comparison rows contain positive EMI and Known Borrowing Cost');
assert(comparisonResult.products.every((p) => p.sourceName && p.sourceUrl && p.lastVerifiedAt), 'All products contain verified source and timestamp');

console.log('\n==================================================');
console.log(`PHASE 2 TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('==================================================\n');
