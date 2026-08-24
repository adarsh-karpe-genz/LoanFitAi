import {
  personalProfileSchema,
  financialProfileSchema,
  loanRequirementSchema,
  userPreferencesSchema,
  signupSchema,
  loginSchema,
} from './lib/validation/schemas';
import { formatINR, formatTenure, calculateFOIR } from './lib/utils';

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
console.log('🧪 RUNNING LOANFIT AI PHASE 1 TEST SUITE');
console.log('==================================================\n');

// 1. Auth Validation Tests
console.log('--- 1. Auth Validation Tests ---');
const validSignup = signupSchema.safeParse({
  full_name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  password: 'Password@123',
  confirm_password: 'Password@123',
});
assert(validSignup.success, 'Valid registration payload passes');

const mismatchedSignup = signupSchema.safeParse({
  full_name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  password: 'Password@123',
  confirm_password: 'MismatchPassword',
});
assert(!mismatchedSignup.success, 'Mismatched signup passwords rejected');

// 2. Personal Profile Tests
console.log('\n--- 2. Personal Profile Validation Tests ---');
const validPersonal = personalProfileSchema.safeParse({
  full_name: 'Rahul Sharma',
  age: 28,
  employment_type: 'Salaried',
  location: 'Pune',
});
assert(validPersonal.success, 'Valid personal profile (28 yrs, Salaried, Pune) passes');

const invalidAgeYoung = personalProfileSchema.safeParse({
  full_name: 'Rahul Sharma',
  age: 17,
  employment_type: 'Salaried',
  location: 'Pune',
});
assert(!invalidAgeYoung.success, 'Age < 18 rejected');

const invalidAgeOld = personalProfileSchema.safeParse({
  full_name: 'Rahul Sharma',
  age: 66,
  employment_type: 'Salaried',
  location: 'Pune',
});
assert(!invalidAgeOld.success, 'Age > 65 rejected');

const invalidEmployment = personalProfileSchema.safeParse({
  full_name: 'Rahul Sharma',
  age: 30,
  employment_type: 'Unemployed' as any,
  location: 'Pune',
});
assert(!invalidEmployment.success, 'Invalid employment type rejected');

// 3. Financial Profile Validation Tests
console.log('\n--- 3. Financial Profile Validation Tests ---');
const validFinancial = financialProfileSchema.safeParse({
  monthly_income: 60000,
  monthly_expenses: 25000,
  existing_emi: 5000,
  knows_credit_score: true,
  credit_score: 760,
});
assert(validFinancial.success, 'Valid financial profile (Income ₹60k, Exp ₹25k, EMI ₹5k, CIBIL 760) passes');

const expensesExceedIncome = financialProfileSchema.safeParse({
  monthly_income: 30000,
  monthly_expenses: 35000,
  existing_emi: 0,
  knows_credit_score: true,
  credit_score: 700,
});
assert(
  !expensesExceedIncome.success &&
  expensesExceedIncome.error?.issues[0]?.message.includes('cannot be greater than monthly income'),
  'Expenses exceeding income rejected with exact message'
);

const incomeTooLow = financialProfileSchema.safeParse({
  monthly_income: 8000,
  monthly_expenses: 4000,
  existing_emi: 0,
  knows_credit_score: true,
  credit_score: 700,
});
assert(!incomeTooLow.success, 'Income < ₹10,000 rejected');

const negativeEMI = financialProfileSchema.safeParse({
  monthly_income: 50000,
  monthly_expenses: 20000,
  existing_emi: -1000,
  knows_credit_score: true,
  credit_score: 700,
});
assert(!negativeEMI.success, 'Negative EMI rejected');

const invalidCreditScoreHigh = financialProfileSchema.safeParse({
  monthly_income: 50000,
  monthly_expenses: 20000,
  existing_emi: 0,
  knows_credit_score: true,
  credit_score: 950,
});
assert(!invalidCreditScoreHigh.success, 'Credit score > 900 rejected');

const invalidCreditScoreLow = financialProfileSchema.safeParse({
  monthly_income: 50000,
  monthly_expenses: 20000,
  existing_emi: 0,
  knows_credit_score: true,
  credit_score: 250,
});
assert(!invalidCreditScoreLow.success, 'Credit score < 300 rejected');

const unknownCreditScore = financialProfileSchema.safeParse({
  monthly_income: 60000,
  monthly_expenses: 25000,
  existing_emi: 5000,
  knows_credit_score: false,
  credit_score: null,
});
assert(unknownCreditScore.success, 'Unknown credit score allowed (stored as null)');

// 4. Loan Requirement Tests
console.log('\n--- 4. Loan Requirement Validation Tests ---');
const validLoan = loanRequirementSchema.safeParse({
  loan_type: 'Home Loan',
  loan_amount: 3000000,
  tenure_years: 20,
});
assert(validLoan.success, 'Valid loan requirement (Home Loan, ₹30L, 20 yrs) passes');

const invalidLoanType = loanRequirementSchema.safeParse({
  loan_type: 'Crypto Loan' as any,
  loan_amount: 1000000,
  tenure_years: 5,
});
assert(!invalidLoanType.success, 'Invalid loan type rejected');

const invalidTenure = loanRequirementSchema.safeParse({
  loan_type: 'Home Loan',
  loan_amount: 1000000,
  tenure_years: 17, // 17 is not in standard tiers [1,2,3,4,5,7,10,15,20,25,30]
});
assert(!invalidTenure.success, 'Non-standard tenure rejected');

// 5. User Preferences Tests
console.log('\n--- 5. User Preferences Tests ---');
const validPreferences = userPreferencesSchema.safeParse({
  cost_weight: 90,
  emi_weight: 60,
  eligibility_weight: 80,
  fee_weight: 50,
  flexibility_weight: 40,
});
assert(validPreferences.success, 'Valid raw preference weights (90, 60, 80, 50, 40) pass');
if (validPreferences.success) {
  assert(validPreferences.data.cost_weight === 90, 'Raw cost weight (90) preserved without modification');
  assert(validPreferences.data.flexibility_weight === 40, 'Raw flexibility weight (40) preserved');
}

const invalidWeight = userPreferencesSchema.safeParse({
  cost_weight: 150,
  emi_weight: 60,
  eligibility_weight: 80,
  fee_weight: 50,
  flexibility_weight: 40,
});
assert(!invalidWeight.success, 'Preference weight > 100 rejected');

// 6. Utility and Formatting Tests
console.log('\n--- 6. Utility & Formatting Tests ---');
assert(formatINR(3000000).replace(/\s/g, '').includes('30,00,000'), 'formatINR formats ₹30,00,000 correctly');
assert(formatTenure(240).includes('20 Years'), 'formatTenure converts 240 months to 20 Years');
assert(calculateFOIR(60000, 5000) === 8, 'calculateFOIR correctly computes 8% FOIR for ₹5k EMI on ₹60k income');

console.log('\n==================================================');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('==================================================\n');
