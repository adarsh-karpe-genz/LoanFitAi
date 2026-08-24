import {
  generateLocalXaiExplanation,
  generateXaiExplanation,
  SUPPORTED_LANGUAGES,
} from './lib/services/xaiEngine';
import { RecommendationResultItem } from './types/database';

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
console.log('🧪 RUNNING LOANFIT AI PHASE 4 XAI & AI TEST SUITE');
console.log('==================================================\n');

// 1. Multilingual Support Verification
console.log('--- 1. Multilingual & Bhashini-Ready Language Tests ---');
assert(SUPPORTED_LANGUAGES.length >= 8, `Supported languages count: ${SUPPORTED_LANGUAGES.length}`);
assert(SUPPORTED_LANGUAGES.some(l => l.code === 'hi' && l.nativeName === 'हिन्दी'), 'Hindi language configuration present');
assert(SUPPORTED_LANGUAGES.some(l => l.code === 'mr' && l.nativeName === 'मराठी'), 'Marathi language configuration present');

// 2. Deterministic XAI Local Generator Tests
console.log('\n--- 2. Explainable AI (XAI) Feature Importance Tests ---');
const sampleItem: RecommendationResultItem = {
  product_id: 'prod-sbi-1',
  lender_id: 'lender-sbi',
  lender_name: 'State Bank of India',
  product_name: 'SBI Regular Home Loan',
  loan_type: 'Home Loan',
  interest_rate: 8.50,
  calculated_emi: 26035,
  total_interest: 3248328,
  processing_fee: 10000,
  total_cost: 3258328,
  foir: 0.52,
  foir_percentage: 51.72,
  cost_utility: 0.95,
  fee_utility: 0.80,
  eligibility_utility: 1.0,
  utility_score: 93.0,
  rank: 1,
  is_eligible: true,
  breakdown: {
    costComponentScore: 57.0,
    feeComponentScore: 16.0,
    eligibilityComponentScore: 20.0,
    weightsApplied: { costWeight: 0.60, feeWeight: 0.20, eligibilityWeight: 0.20 },
    foirThreshold: 60,
    userCIBIL: 760,
    minCIBILRequired: 700,
    creditBuffer: 60,
  },
};

const sampleContext = {
  loanAmount: 3000000,
  tenureMonths: 240,
  monthlyIncome: 60000,
  existingEMI: 5000,
  creditScore: 760,
  language: 'en' as const,
};

const xaiResult = generateLocalXaiExplanation(sampleItem, sampleContext);

assert(xaiResult.rank === 1, 'XAI preserves product rank');
assert(xaiResult.utilityScore === 93.0, 'XAI preserves mathematical utility score');
assert(xaiResult.headline.includes('State Bank of India') || xaiResult.headline.includes('Rank #1'), 'XAI headline cites lender and rank');
assert(xaiResult.positiveDrivers.length > 0, 'Positive drivers generated');
assert(xaiResult.tradeOffs.length > 0, 'Trade-offs and watchouts generated');
assert(xaiResult.foirVerdict.includes('51.72%') || xaiResult.foirVerdict.includes('passing') || xaiResult.foirVerdict.includes('safe'), 'FOIR affordability verdict included');
assert(xaiResult.shapFeatureImpacts.length === 4, 'Simulated SHAP feature contributions generated (4 features)');
assert(xaiResult.shapFeatureImpacts.some(f => f.featureName === 'Net Cost of Borrowing'), 'Net Cost of Borrowing SHAP component present');

// 3. Fallback Safety & Error Handling
console.log('\n--- 3. Resilience & Fallback Tests ---');
async function testAsyncXai() {
  const asyncResult = await generateXaiExplanation(sampleItem, sampleContext);
  assert(asyncResult !== null && asyncResult.headline !== '', 'Asynchronous XAI generator returns valid structured explanation');
  assert(asyncResult.shapFeatureImpacts.length > 0, 'Async explanation contains SHAP impacts');

  console.log('\n==================================================');
  console.log(`PHASE 4 TEST SUMMARY: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('==================================================\n');
}

testAsyncXai();
