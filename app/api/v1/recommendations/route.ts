import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getFullBorrowerProfile } from '@/services/loan/loanService';
import { getActiveLoanProducts } from '@/services/loan/loanCatalogService';
import {
  generateRecommendations,
  buildRecommendationResponse,
  DEFAULT_WEIGHTS,
  CURRENT_MODEL_VERSION,
} from '@/lib/services/recommendationEngine';
import { logAudit } from '@/lib/services/auditService';
import { LoanType, RecommendationWeights } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Empty body allowed if using session
    }

    let userId: string | null = body.userId || null;
    let supabaseClient: any = null;

    if (isSupabaseConfigured()) {
      supabaseClient = createServerSupabase();
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (user) {
        userId = user.id;
      }
    }

    // Default fallback values if profile not yet completed
    let targetLoanType: LoanType = body.loanType || 'Home Loan';
    let loanAmount = Number(body.loanAmount) || 3000000;
    let tenureMonths = Number(body.tenureMonths) || 240;
    let monthlyIncome = Number(body.monthlyIncome) || 60000;
    let existingEMI = Number(body.existingEMI) || 0;
    let creditScore: number | null = body.creditScore ? Number(body.creditScore) : 750;
    let weights: Partial<RecommendationWeights> = body.weights || DEFAULT_WEIGHTS;

    // If userId provided or in session, fetch stored profile
    if (userId) {
      const fullProfile = await getFullBorrowerProfile(userId);
      if (fullProfile.loanRequirement) {
        targetLoanType = fullProfile.loanRequirement.loan_type;
        loanAmount = fullProfile.loanRequirement.loan_amount;
        tenureMonths = fullProfile.loanRequirement.tenure_months;
      }
      if (fullProfile.financialProfile) {
        monthlyIncome = fullProfile.financialProfile.monthly_income;
        existingEMI = fullProfile.financialProfile.existing_emi || 0;
        creditScore = fullProfile.financialProfile.credit_score;
      }
      if (fullProfile.preferences) {
        // Map Phase 1 preference weights to MAUT weights if not explicitly overridden
        if (!body.weights) {
          weights = {
            costWeight: fullProfile.preferences.cost_weight || 60,
            feeWeight: fullProfile.preferences.fee_weight || 20,
            eligibilityWeight: fullProfile.preferences.eligibility_weight || 20,
          };
        }
      }
    }

    // Fetch active products for category
    const products = await getActiveLoanProducts(targetLoanType);

    const context = {
      loanType: targetLoanType,
      loanAmount,
      tenureMonths,
      monthlyIncome,
      existingEMI,
      creditScore,
      weights,
      maxFOIR: body.maxFOIR,
    };

    let runId: string | undefined = undefined;

    // Database persistence if Supabase configured & user authenticated
    if (userId && isSupabaseConfigured() && supabaseClient) {
      try {
        const { data: runData, error: runError } = await supabaseClient
          .from('recommendation_runs')
          .insert({
            user_id: userId,
            loan_type: targetLoanType,
            loan_amount: loanAmount,
            tenure_months: tenureMonths,
            monthly_income: monthlyIncome,
            existing_emi: existingEMI,
            credit_score: creditScore,
            cost_weight: weights.costWeight ?? DEFAULT_WEIGHTS.costWeight,
            fee_weight: weights.feeWeight ?? DEFAULT_WEIGHTS.feeWeight,
            eligibility_weight: weights.eligibilityWeight ?? DEFAULT_WEIGHTS.eligibilityWeight,
            model_version: CURRENT_MODEL_VERSION,
          })
          .select('id')
          .single();

        if (!runError && runData) {
          runId = runData.id;
          const { recommendations } = generateRecommendations(products, context);

          if (recommendations.length > 0) {
            const resultsToInsert = recommendations.map((rec) => ({
              run_id: runId,
              product_id: rec.product_id,
              calculated_emi: rec.calculated_emi,
              total_cost: rec.total_cost,
              utility_score: rec.utility_score,
              rank: rec.rank,
              foir: rec.foir,
              cost_utility: rec.cost_utility,
              fee_utility: rec.fee_utility,
              eligibility_utility: rec.eligibility_utility,
            }));

            await supabaseClient.from('recommendation_results').insert(resultsToInsert);
          }
        }
      } catch (dbErr) {
        console.warn('Recommendation run persistence skipped (local/demo mode active):', dbErr);
      }
    }

    // Log compliance audit entry
    await logAudit({
      userId,
      action: 'GENERATE_RECOMMENDATION',
      resource: 'engine:maut_recommendations',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
      metadata: {
        runId,
        modelVersion: CURRENT_MODEL_VERSION,
        loanType: targetLoanType,
        loanAmount,
        tenureMonths,
      },
    });

    const responsePayload = buildRecommendationResponse({
      products,
      context,
      userId: userId || undefined,
      runId,
      isSimulated: false,
    });

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate personalized loan recommendations.' },
      { status: 500 }
    );
  }
}
