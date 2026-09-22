import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Attempt to query borrower_profiles first
    let borrowerProfile: any = null;
    try {
      const { data, error } = await (supabase.from('borrower_profiles') as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        borrowerProfile = data;
      }
    } catch {
      // Fallback if table does not exist
    }

    // Also query legacy profiles if borrower_profiles had no personal info
    let legacyProfile: any = null;
    if (!borrowerProfile?.personal_info_completed_at) {
      try {
        const { data } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) legacyProfile = data;
      } catch {
        // ignore
      }
    }


    // Query financial profile
    let financialProfile: any = null;
    try {
      const { data } = await (supabase.from('financial_profiles') as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) financialProfile = data;
    } catch {
      // ignore
    }

    // Query loan requirements
    let loanRequirement: any = null;
    try {
      const { data } = await (supabase.from('loan_requirements') as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) loanRequirement = data;
    } catch {
      // ignore
    }


    const personalCompletedAt =
      borrowerProfile?.personal_info_completed_at ||
      legacyProfile?.personal_info_completed_at ||
      (legacyProfile?.full_name && legacyProfile?.age && legacyProfile?.location ? legacyProfile.updated_at || legacyProfile.created_at : null);

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      isPersonalInfoCompleted: Boolean(personalCompletedAt),
      personalInfo: {
        full_name: borrowerProfile?.full_name || legacyProfile?.full_name || '',
        age: borrowerProfile?.age || legacyProfile?.age || null,
        employment_type: borrowerProfile?.employment_type || legacyProfile?.employment_type || '',
        city: borrowerProfile?.city || legacyProfile?.city || legacyProfile?.location || '',
        personal_info_completed_at: personalCompletedAt,
      },
      financialInfo: {
        monthly_income: borrowerProfile?.monthly_income ?? financialProfile?.monthly_income ?? 60000,
        monthly_expenses: borrowerProfile?.monthly_expenses ?? financialProfile?.monthly_expenses ?? 25000,
        existing_emi: borrowerProfile?.existing_emi ?? financialProfile?.existing_emi ?? 5000,
        credit_score: borrowerProfile?.credit_score ?? financialProfile?.credit_score ?? 750,
      },
      loanRequirement: loanRequirement
        ? {
            loan_type: loanRequirement.loan_type,
            loan_amount: loanRequirement.loan_amount,
            tenure_years: Math.round((loanRequirement.tenure_months || 240) / 12),
          }
        : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'personal') {
      const { full_name, age, employment_type, city } = body;
      const now = new Date().toISOString();

      // Upsert into borrower_profiles
      try {
        await (supabase.from('borrower_profiles') as any).upsert(
          {
            user_id: user.id,
            full_name,
            age: Number(age),
            employment_type,
            city,
            personal_info_completed_at: now,
            updated_at: now,
          },
          { onConflict: 'user_id' }
        );
      } catch (e) {
        console.warn('Could not upsert into borrower_profiles, trying profiles table fallback', e);
      }

      // Also upsert into profiles for backwards compatibility
      try {
        await (supabase.from('profiles') as any).upsert(
          {
            user_id: user.id,
            full_name,
            age: Number(age),
            employment_type,
            location: city,
            city,
            personal_info_completed_at: now,
            updated_at: now,
          },
          { onConflict: 'user_id' }
        );
      } catch (e) {
        // ignore
      }

      return NextResponse.json({
        success: true,
        personal_info_completed_at: now,
      });
    }

    if (action === 'financial') {
      const { monthly_income, monthly_expenses, existing_emi, credit_score } = body;
      const now = new Date().toISOString();

      // Upsert into borrower_profiles
      try {
        await (supabase.from('borrower_profiles') as any).upsert(
          {
            user_id: user.id,
            monthly_income: Number(monthly_income),
            monthly_expenses: Number(monthly_expenses || 0),
            existing_emi: Number(existing_emi || 0),
            credit_score: credit_score ? Number(credit_score) : null,
            updated_at: now,
          },
          { onConflict: 'user_id' }
        );
      } catch (e) {
        // ignore
      }

      // Upsert into financial_profiles
      try {
        await (supabase.from('financial_profiles') as any).upsert(
          {
            user_id: user.id,
            monthly_income: Number(monthly_income),
            monthly_expenses: Number(monthly_expenses || 0),
            existing_emi: Number(existing_emi || 0),
            credit_score: credit_score ? Number(credit_score) : null,
            updated_at: now,
          },
          { onConflict: 'user_id' }
        );
      } catch (e) {
        // ignore
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'loan_requirement') {
      const { loan_type, loan_amount, tenure_years } = body;
      const now = new Date().toISOString();
      const tenure_months = Number(tenure_years) * 12;

      try {
        await (supabase.from('loan_requirements') as any).upsert(
          {
            user_id: user.id,
            loan_type,
            loan_amount: Number(loan_amount),
            tenure_months,
            updated_at: now,
          },
          { onConflict: 'user_id' }
        );
      } catch (e) {
        // ignore
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
