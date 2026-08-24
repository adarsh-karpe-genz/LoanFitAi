import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { LoanRequirement, UserPreferences, BorrowerFullProfile } from '@/types/database';
import { LoanRequirementInput, UserPreferencesInput } from '@/lib/validation/schemas';
import { getProfile, getFinancialProfile } from '@/services/profile/profileService';

const LOCAL_LOAN_KEY = 'loanfit_demo_loan';
const LOCAL_PREF_KEY = 'loanfit_demo_pref';

export async function getLoanRequirement(userId: string): Promise<LoanRequirement | null> {
  if (!isSupabaseConfigured()) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${LOCAL_LOAN_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('loan_requirements')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error('Failed to fetch loan requirements.');
  }

  return data ? (data as unknown as LoanRequirement) : null;
}

export async function upsertLoanRequirement(
  userId: string,
  input: LoanRequirementInput
): Promise<LoanRequirement> {
  const tenureMonths = input.tenure_years * 12;

  if (!isSupabaseConfigured()) {
    const mockLoan: LoanRequirement = {
      id: 'demo-loan-id',
      user_id: userId,
      loan_type: input.loan_type,
      loan_amount: input.loan_amount,
      tenure_months: tenureMonths,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_LOAN_KEY}_${userId}`, JSON.stringify(mockLoan));
    }
    return mockLoan;
  }

  const supabase = createClient();
  const payload = {
    user_id: userId,
    loan_type: input.loan_type,
    loan_amount: input.loan_amount,
    tenure_months: tenureMonths,
  };

  const { data, error } = await (supabase.from('loan_requirements') as any)
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to save loan requirements.');
  }

  return data as unknown as LoanRequirement;
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  if (!isSupabaseConfigured()) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${LOCAL_PREF_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error('Failed to fetch user preferences.');
  }

  return data ? (data as unknown as UserPreferences) : null;
}

export async function upsertUserPreferences(
  userId: string,
  input: UserPreferencesInput
): Promise<UserPreferences> {
  if (!isSupabaseConfigured()) {
    const mockPref: UserPreferences = {
      id: 'demo-pref-id',
      user_id: userId,
      cost_weight: input.cost_weight,
      emi_weight: input.emi_weight,
      eligibility_weight: input.eligibility_weight,
      fee_weight: input.fee_weight,
      flexibility_weight: input.flexibility_weight,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_PREF_KEY}_${userId}`, JSON.stringify(mockPref));
    }
    return mockPref;
  }

  const supabase = createClient();
  const payload = {
    user_id: userId,
    cost_weight: input.cost_weight,
    emi_weight: input.emi_weight,
    eligibility_weight: input.eligibility_weight,
    fee_weight: input.fee_weight,
    flexibility_weight: input.flexibility_weight,
  };

  const { data, error } = await (supabase.from('user_preferences') as any)
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to save preferences.');
  }

  return data as unknown as UserPreferences;
}

export async function getFullBorrowerProfile(userId: string): Promise<BorrowerFullProfile> {
  const [profile, financialProfile, loanRequirement, preferences] = await Promise.all([
    getProfile(userId).catch(() => null),
    getFinancialProfile(userId).catch(() => null),
    getLoanRequirement(userId).catch(() => null),
    getUserPreferences(userId).catch(() => null),
  ]);

  let completedSteps = 0;
  if (profile && profile.full_name && profile.age && profile.location) completedSteps += 1;
  if (financialProfile && financialProfile.monthly_income >= 10000 && financialProfile.monthly_expenses !== undefined) completedSteps += 1;
  if (loanRequirement && loanRequirement.loan_type && loanRequirement.loan_amount > 0 && loanRequirement.tenure_months > 0) completedSteps += 1;
  if (preferences && preferences.cost_weight !== undefined) completedSteps += 1;

  const completionPercentage = Math.round((completedSteps / 4) * 100);

  return {
    profile,
    financialProfile,
    loanRequirement,
    preferences,
    completionPercentage,
  };
}
