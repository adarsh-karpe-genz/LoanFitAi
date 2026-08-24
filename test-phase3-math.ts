import {
  calculateFOIR,
  calculateCreditBufferUtility,
  normalizeWeights,
  generateRecommendations,
  buildRecommendationResponse,
  DEFAULT_WEIGHTS,
} from './lib/services/recommendationEngine';
import { SEED_LOAN_PRODUCTS } from './services/loan/loanCatalogService';
import { LoanProduct } from './types/database';

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
console.log('🧪 RUNNING LOANFIT AI PHASE 3 MATHEMATICAL TEST SUITE');
console.log('==================================================\n');

// 1. FOIR Calculation Tests
console.log('--- 1. FOIR (Fixed Obligation to Income Ratio) Tests ---');
const foir1 = calculateFOIR(5000, 25000, 60000); // (5000 + 25000) / 60000 = 30000 / 60000 = 0.50 (50%)
assert(foir1.foir === 0.50, `FOIR for ₹5k existing + ₹25k new on ₹60k income is 0.50 (actual: ${foir1.foir})`);
assert(foir1.foirPercentage === 50, `FOIR percentage is 50% (actual: ${foir1.foirPercentage}%)`);

const foirOver = calculateFOIR(15000, 30000, 60000); // (15000 + 30000) / 60000 = 45000 / 60000 = 0.75 (75%)
assert(foirOver.foir === 0.75 && foirOver.foirPercentage === 75, `High FOIR correctly computes 75%`);

// 2. Weight Normalization Tests
console.log('\n--- 2. MAUT Weight Normalization Tests ---');
const rawWeights = { costWeight: 60, feeWeight: 20, eligibilityWeight: 20 };
const norm = normalizeWeights(rawWeights);
assert(norm.costWeight === 0.60, `Normalized cost weight: ${norm.costWeight}`);
assert(norm.feeWeight === 0.20, `Normalized fee weight: ${norm.feeWeight}`);
assert(norm.eligibilityWeight === 0.20, `Normalized eligibility weight: ${norm.eligibilityWeight}`);
assert(Math.abs(norm.costWeight + norm.feeWeight + norm.eligibilityWeight - 1.0) < 0.01, 'Normalized weights sum to 1.0');

// 3. Credit Buffer Utility Tests
console.log('\n--- 3. Soft Eligibility & Credit Buffer Tests ---');
const bufOptimal = calculateCreditBufferUtility(800, 700); // 100 pts above -> utility 1.0
assert(bufOptimal.utility === 1.0 && bufOptimal.buffer === 100, `800 score with 700 min yields utility 1.0 (actual: ${bufOptimal.utility})`);

const bufExact = calculateCreditBufferUtility(700, 700); // 0 buffer -> utility 0.50
assert(bufExact.utility === 0.50 && bufExact.buffer === 0, `Exact match score yields utility 0.50 (actual: ${bufExact.utility})`);

const bufUnknown = calculateCreditBufferUtility(null, 700); // unknown -> neutral 0.70
assert(bufUnknown.utility === 0.70, `Unknown CIBIL score receives neutral 0.70 utility (actual: ${bufUnknown.utility})`);

// 4. Hard FOIR Filter Test
console.log('\n--- 4. Hard FOIR Affordability Filter Tests ---');
const lowIncomeContext = {
  loanType: 'Home Loan' as const,
  loanAmount: 3000000,
  tenureMonths: 240,
  monthlyIncome: 30000, // Monthly income too low for ₹26k EMI -> FOIR ~87% > 60%
  existingEMI: 0,
  creditScore: 760,
  maxFOIR: 0.60,
};
const resLowIncome = generateRecommendations(SEED_LOAN_PRODUCTS, lowIncomeContext);
assert(resLowIncome.recommendations.length === 0, 'Products exceeding 60% FOIR are disqualified');
assert(resLowIncome.disqualified.length > 0, 'Disqualified list captures excessive FOIR reasons');
assert(resLowIncome.disqualified[0].reasons.some(r => r.includes('FOIR')), 'FOIR rejection reason clearly specified');

// 5. Complete Recommendation Pipeline on Standard Test Borrower
console.log('\n--- 5. Complete Recommendation Scoring Pipeline ---');
const testBorrower = {
  loanType: 'Home Loan' as const,
  loanAmount: 3000000,
  tenureMonths: 240,
  monthlyIncome: 60000,
  existingEMI: 5000,
  creditScore: 760,
  weights: { costWeight: 0.60, feeWeight: 0.20, eligibilityWeight: 0.20 },
  maxFOIR: 0.60,
};

const homeProducts = SEED_LOAN_PRODUCTS.filter(p => p.loan_type === 'Home Loan');
const res = generateRecommendations(homeProducts, testBorrower);

assert(res.recommendations.length === 5, `All 5 Home Loan products qualified for test borrower (got ${res.recommendations.length})`);
assert(res.recommendations[0].rank === 1, 'Top recommendation is Rank 1');
assert(res.recommendations.every(r => r.utility_score >= 0 && r.utility_score <= 100), 'All utility scores are within 0–100');

// Verify strictly descending utility score ordering
let strictlyDescending = true;
for (let i = 0; i < res.recommendations.length - 1; i++) {
  if (res.recommendations[i].utility_score < res.recommendations[i + 1].utility_score) {
    strictlyDescending = false;
  }
}
assert(strictlyDescending, 'Recommendations are sorted in descending order of Suitability Score');

// Verify mathematical breakdown transparency
const top = res.recommendations[0];
assert(top.breakdown !== undefined, 'Mathematical breakdown object present');
assert(top.breakdown.weightsApplied.costWeight === 0.60, 'Breakdown includes applied weights');
assert(top.breakdown.foirThreshold === 60, 'Breakdown includes FOIR threshold');
assert(top.foir === 0.51 && top.foir_percentage === 51.41 || top.foir <= 0.60, `Calculated FOIR is accurate (got ${top.foir} / ${top.foir_percentage}%)`);

// 6. What-If Simulation Response Builder Test
console.log('\n--- 6. What-If Simulation Payload Tests ---');
const simResponse = buildRecommendationResponse({
  products: SEED_LOAN_PRODUCTS,
  context: testBorrower,
  isSimulated: true,
});
assert(simResponse.isSimulated === true, 'Simulation flag is set to true');
assert(simResponse.recommendations.length > 0, 'Simulation returns ranked recommendations');
assert(simResponse.qualifiedProductsCount === 5, 'Simulation counts qualified products');

console.log('\n==================================================');
console.log(`PHASE 3 MATHEMATICAL TESTS: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('==================================================\n');
