import {
  calculateFOIR,
  calculateCreditBufferUtility,
  normalizeWeights,
  generateRecommendations,
  buildRecommendationResponse,
  DEFAULT_WEIGHTS,
  DEFAULT_MAX_FOIR,
} from './lib/services/recommendationEngine';
import { SEED_LOAN_PRODUCTS } from './services/loan/loanCatalogService';

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
console.log('🧪 RUNNING LOANFIT AI PHASE 3 COMPLETE TEST SUITE');
console.log('==================================================\n');

// 1. Math Verification
console.log('--- 1. Mathematical Formulas & FOIR Tests ---');
const foirCase1 = calculateFOIR(0, 26034.7, 60000);
assert(foirCase1.foir === 0.43 && foirCase1.foirPercentage === 43.39, `FOIR computed: ${foirCase1.foirPercentage}%`);

const foirHigh = calculateFOIR(15000, 26000, 60000); // 41000 / 60000 = 68.33%
assert(foirHigh.foir > 0.60, 'FOIR exceeding 60% correctly identified as > 0.60');

// 2. MAUT Normalization Tests
console.log('\n--- 2. MAUT Weight Normalization & Inversion Tests ---');
const weights = normalizeWeights({ costWeight: 60, feeWeight: 20, eligibilityWeight: 20 });
assert(weights.costWeight === 0.60 && weights.feeWeight === 0.20 && weights.eligibilityWeight === 0.20, 'Custom weights normalized to decimals');

// 3. Recommendation Pipeline Verification
console.log('\n--- 3. Recommendation Pipeline Verification ---');
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
const result = generateRecommendations(homeProducts, testBorrower);

assert(result.recommendations.length === 5, `All 5 Home Loan products evaluated (qualified: ${result.recommendations.length})`);
assert(result.recommendations[0].rank === 1, 'Top recommendation ranked #1');
assert(result.recommendations[0].utility_score >= result.recommendations[1].utility_score, 'Rank #1 has higher or equal utility score than Rank #2');
assert(result.recommendations[0].breakdown !== undefined, 'Score breakdown provided for explainability');

// 4. Hard FOIR Exclusion Verification
console.log('\n--- 4. Hard FOIR Exclusion Verification ---');
const tightBorrower = {
  ...testBorrower,
  monthlyIncome: 35000, // EMI ~26k + 5k existing = 31k -> FOIR ~88%
};
const tightResult = generateRecommendations(homeProducts, tightBorrower);
assert(tightResult.recommendations.length === 0, 'Excessive FOIR products excluded from recommendation list');
assert(tightResult.disqualified.length === 5, 'All 5 products recorded in disqualified list with explicit reasons');
assert(tightResult.disqualified[0].reasons[0].includes('FOIR'), 'Disqualification reason clearly cites FOIR');

// 5. Simulation Response Integrity
console.log('\n--- 5. Simulation Builder Integrity ---');
const sim = buildRecommendationResponse({
  products: SEED_LOAN_PRODUCTS,
  context: testBorrower,
  isSimulated: true,
});
assert(sim.isSimulated === true, 'Simulation flag active');
assert(sim.borrowerContext.loanAmount === 3000000, 'Context matches payload amount');
assert(sim.recommendations.length > 0, 'Simulated recommendations generated');

console.log('\n==================================================');
console.log(`PHASE 3 COMPLETE TEST SUMMARY: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('==================================================\n');
