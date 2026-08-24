import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getFullBorrowerProfile } from '@/services/loan/loanService';
import { getActiveLoanProducts, buildLoanComparison } from '@/services/loan/loanCatalogService';
import { LoanRequirement, LoanType } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;

    if (isSupabaseConfigured()) {
      const supabase = createServerSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        userId = user.id;
      }
    }

    // Support query param fallback for demo / testing
    const searchParams = request.nextUrl.searchParams;
    const queryUserId = searchParams.get('userId');
    if (!userId && queryUserId) {
      userId = queryUserId;
    }

    // Default parameters if profile not yet completed
    let requirement: LoanRequirement = {
      id: 'default-req',
      user_id: userId || 'demo-user',
      loan_type: (searchParams.get('type') as LoanType) || 'Home Loan',
      loan_amount: Number(searchParams.get('amount')) || 3000000,
      tenure_months: Number(searchParams.get('tenure')) || 240,
    };

    let financialProfile = null;
    let personalProfile = null;

    if (userId) {
      const fullProfile = await getFullBorrowerProfile(userId);
      if (fullProfile.loanRequirement) {
        requirement = fullProfile.loanRequirement;
      }
      financialProfile = fullProfile.financialProfile;
      personalProfile = fullProfile.profile;
    }

    // Fetch active products matching requested loan type
    const products = await getActiveLoanProducts(requirement.loan_type);

    // Build comparison results
    const comparisonResponse = buildLoanComparison({
      requirement,
      financialProfile,
      profile: personalProfile,
      products,
    });

    return NextResponse.json(comparisonResponse, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate loan comparison.' },
      { status: 500 }
    );
  }
}
