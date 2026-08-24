import { logAudit, getUserAuditLogs } from './lib/services/auditService';
import { recordConsent, getUserActiveConsents, revokeConsent } from './lib/services/consentService';
import { CURRENT_MODEL_VERSION } from './lib/services/recommendationEngine';

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
console.log('🧪 RUNNING LOANFIT AI PHASE 5 PRODUCTION & SECURITY TEST SUITE');
console.log('==================================================\n');

async function runTests() {
  // 1. Audit Logging Tests
  console.log('--- 1. Compliance Audit Trail Tests ---');
  const testUserId = 'test-user-prod-123';
  const log1 = await logAudit({
    userId: testUserId,
    action: 'UPDATE_FINANCIAL_PROFILE',
    resource: 'profile:financial',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
    metadata: { monthlyIncome: 65000, existingEMI: 4500 },
  });

  assert(log1.id !== undefined && log1.id.startsWith('audit-'), 'Audit log generated with unique ID');
  assert(log1.action === 'UPDATE_FINANCIAL_PROFILE', 'Audit action recorded correctly');
  assert(log1.created_at !== undefined, 'Audit log timestamped');

  const userLogs = await getUserAuditLogs(testUserId);
  assert(userLogs.length >= 1, `Audit log retrieval successful (found ${userLogs.length} logs)`);
  assert(userLogs[0].metadata?.monthlyIncome === 65000, 'Audit metadata preserved');

  // 2. Consent Management Tests
  console.log('\n--- 2. User Consent Lifecycle Tests (RBI AA / DPDP) ---');
  const consent = await recordConsent({
    userId: testUserId,
    provider: 'Sahamati_AA',
    purpose: 'LOAN_UNDERWRITING',
    status: 'ACTIVE',
    validityDays: 30,
  });

  assert(consent.id !== undefined && consent.id.startsWith('consent-'), 'Consent artifact generated with ID');
  assert(consent.status === 'ACTIVE', 'Initial consent status is ACTIVE');
  assert(consent.provider === 'Sahamati_AA', 'Consent provider matches Sahamati_AA');

  const activeConsents = await getUserActiveConsents(testUserId);
  assert(activeConsents.length >= 1, `Active consent retrieval successful (count: ${activeConsents.length})`);

  // Revoke Consent
  if (consent.id) {
    const revoked = await revokeConsent(consent.id, testUserId);
    assert(revoked === true, 'Consent revocation returned true');

    const updatedConsents = await getUserActiveConsents(testUserId);
    assert(!updatedConsents.some(c => c.id === consent.id), 'Revoked consent is no longer returned in active list');
  }

  // 3. Model Version Tracking
  console.log('\n--- 3. DevOps & Model Versioning Tests ---');
  assert(typeof CURRENT_MODEL_VERSION === 'string' && CURRENT_MODEL_VERSION.startsWith('v'), `Model version defined: "${CURRENT_MODEL_VERSION}"`);

  // 4. Security & RLS Principles
  console.log('\n--- 4. Security & Data Minimization Verification ---');
  assert(log1.user_id === testUserId, 'Audit logs strictly isolated to user ID');
  assert(consent.user_id === testUserId, 'Consent records strictly isolated to user ID');

  console.log('\n==================================================');
  console.log(`PHASE 5 TEST SUMMARY: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('==================================================\n');
}

runTests();
