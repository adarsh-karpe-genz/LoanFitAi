import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Profile, FinancialProfile } from '@/types/database';
import { PersonalProfileInput, FinancialProfileInput } from '@/lib/validation/schemas';

const LOCAL_PROFILE_KEY = 'loanfit_demo_profile';
const LOCAL_FINANCIAL_KEY = 'loanfit_demo_financial';

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${LOCAL_PROFILE_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error('Failed to fetch personal profile.');
  }

  return data ? (data as unknown as Profile) : null;
}

export async function upsertProfile(
  userId: string,
  input: PersonalProfileInput
): Promise<Profile> {
  if (!isSupabaseConfigured()) {
    const mockProfile: Profile = {
      id: 'demo-profile-id',
      user_id: userId,
      full_name: input.full_name,
      age: input.age,
      employment_type: input.employment_type,
      location: input.location,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_PROFILE_KEY}_${userId}`, JSON.stringify(mockProfile));
    }
    return mockProfile;
  }

  const supabase = createClient();
  const payload = {
    user_id: userId,
    full_name: input.full_name,
    age: input.age,
    employment_type: input.employment_type,
    location: input.location,
  };

  const { data, error } = await (supabase.from('profiles') as any)
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to save personal profile.');
  }

  return data as unknown as Profile;
}

export async function getFinancialProfile(userId: string): Promise<FinancialProfile | null> {
  if (!isSupabaseConfigured()) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${LOCAL_FINANCIAL_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('financial_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error('Failed to fetch financial profile.');
  }

  return data ? (data as unknown as FinancialProfile) : null;
}

export async function upsertFinancialProfile(
  userId: string,
  input: FinancialProfileInput
): Promise<FinancialProfile> {
  const creditScore = input.knows_credit_score && input.credit_score !== undefined
    ? input.credit_score
    : null;

  if (!isSupabaseConfigured()) {
    const mockFinancial: FinancialProfile = {
      id: 'demo-financial-id',
      user_id: userId,
      monthly_income: input.monthly_income,
      monthly_expenses: input.monthly_expenses,
      existing_emi: input.existing_emi || 0,
      credit_score: creditScore,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_FINANCIAL_KEY}_${userId}`, JSON.stringify(mockFinancial));
    }
    return mockFinancial;
  }

  const supabase = createClient();
  const payload = {
    user_id: userId,
    monthly_income: input.monthly_income,
    monthly_expenses: input.monthly_expenses,
    existing_emi: input.existing_emi || 0,
    credit_score: creditScore,
  };

  const { data, error } = await (supabase.from('financial_profiles') as any)
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to save financial profile.');
  }

  return data as unknown as FinancialProfile;
}
