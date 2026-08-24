import { NextRequest, NextResponse } from 'next/server';
import { recordConsent, getUserActiveConsents } from '@/lib/services/consentService';
import { logAudit } from '@/lib/services/auditService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action: 'INITIATE_CONSENT' | 'FETCH_FINANCIAL_DATA' | 'CHECK_STATUS' = body.action || 'INITIATE_CONSENT';
    const userId: string = body.userId || 'demo-user';

    // Strictly server-side environment variables
    const aaClientId = process.env.AA_CLIENT_ID || 'demo_sahamati_client_id';
    const aaClientSecret = process.env.AA_CLIENT_SECRET || 'demo_sahamati_secret';
    const aaGatewayUrl = process.env.AA_GATEWAY_URL || 'https://api.sahamati.org.in/v2';

    if (action === 'INITIATE_CONSENT') {
      const selectedBanks: string[] = body.selectedBanks || ['SBI'];
      const phoneNumber: string = body.phoneNumber || '9876543210';
      const consentHandle = `urn:sahamati:consent:${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      // Record in compliance consent table
      const consentRecord = await recordConsent({
        userId,
        provider: 'Sahamati_AA',
        purpose: 'LOAN_UNDERWRITING',
        status: 'ACTIVE',
        consentHandle,
        validityDays: 30,
      });

      return NextResponse.json(
        {
          success: true,
          status: 'CONSENT_INITIATED',
          consentHandle: consentRecord.consent_handle,
          redirectUrl: `${aaGatewayUrl}/consent/verify?handle=${consentHandle}`,
          expiresAt: consentRecord.expires_at,
        },
        { status: 200 }
      );
    }

    if (action === 'FETCH_FINANCIAL_DATA') {
      const consentHandle: string = body.consentHandle;

      // Log compliance fetch event
      await logAudit({
        userId,
        action: 'AA_CONSENT_GRANTED',
        resource: 'adapter:account_aggregator',
        metadata: {
          consentHandle,
          fetchedAt: new Date().toISOString(),
        },
      });

      // Standard Sahamati statement extraction payload simulation
      const verifiedStatementData = {
        fipName: 'State Bank of India',
        accountType: 'SAVINGS',
        accountNumberMasked: 'XXXXXX4812',
        verifiedMonthlyIncome: 62500,
        averageMonthlyOutflow: 24100,
        detectedRecurringEMIs: 5000,
        averageMonthlyBalance: 48900,
        statementPeriodMonths: 3,
        cashflowReliabilityScore: 94,
      };

      return NextResponse.json(
        {
          success: true,
          status: 'DATA_RETRIEVED',
          statement: verifiedStatementData,
          fetchedAt: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    if (action === 'CHECK_STATUS') {
      const consents = await getUserActiveConsents(userId);
      return NextResponse.json(
        {
          success: true,
          activeConsents: consents,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
  } catch (error: any) {
    console.error('Account Aggregator Adapter Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to communicate with Account Aggregator gateway.' },
      { status: 500 }
    );
  }
}
