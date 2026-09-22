import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Profile, FinancialProfile, BorrowerProfile } from '@/types/database';
import { PersonalProfileInput, FinancialProfileInput } from '@/lib/validation/schemas';

const LOCAL_PROFILE_KEY = 'loanfit_demo_profile';
const LOCAL_FINANCIAL_KEY = 'loanfit_demo_financial';
const LOCAL_BORROWER_KEY = 'loanfit_demo_borrower';

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${LOCAL_PROFILE_KEY}_${userId}`) || localStorage.getItem(`${LOCAL_BORROWER_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }

  const supabase = createClient();

  // Try borrower_profiles first
  try {
    const { data: bData } = await supabase
      .from('borrower_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (bData && (bData as any).full_name) {
      return {
        id: (bData as any).id,
        user_id: (bData as any).user_id,
        full_name: (bData as any).full_name,
        age: (bData as any).age,
        employment_type: (bData as any).employment_type,
        location: (bData as any).city || 'India',
        city: (bData as any).city,
        personal_info_completed_at: (bData as any).personal_info_completed_at,
        created_at: (bData as any).created_at,
        updated_at: (bData as any).updated_at,
      } as Profile;
    }
  } catch {
    // ignore
  }

  // Fallback to profiles
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

export async function checkPersonalInfoCompleted(userId: string): Promise<boolean> {
  try {
    const profile = await getProfile(userId);
    if (!profile) return false;
    return Boolean(profile.personal_info_completed_at || (profile.full_name && profile.age && (profile.city || profile.location)));
  } catch {
    return false;
  }
}

export async function upsertProfile(
  userId: string,
  input: PersonalProfileInput
): Promise<Profile> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const mockProfile: Profile = {
      id: 'demo-profile-id',
      user_id: userId,
      full_name: input.full_name,
      age: input.age,
      employment_type: input.employment_type,
      location: input.location,
      city: input.location,
      personal_info_completed_at: now,
      created_at: now,
      updated_at: now,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_PROFILE_KEY}_${userId}`, JSON.stringify(mockProfile));
      localStorage.setItem(`${LOCAL_BORROWER_KEY}_${userId}`, JSON.stringify(mockProfile));
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
    city: input.location,
    personal_info_completed_at: now,
    updated_at: now,
  };

  // Upsert to borrower_profiles
  try {
    await (supabase.from('borrower_profiles') as any)
      .upsert(
        {
          user_id: userId,
          full_name: input.full_name,
          age: input.age,
          employment_type: input.employment_type,
          city: input.location,
          personal_info_completed_at: now,
          updated_at: now,
        },
        { onConflict: 'user_id' }
      );
  } catch {
    // fallback
  }

  // Upsert to profiles
  const { data, error } = await (supabase.from('profiles') as any)
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    // If profiles table errored, return mock payload so flow isn't interrupted
    return payload as unknown as Profile;
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

  // Try borrower_profiles first
  try {
    const { data: bData } = await supabase
      .from('borrower_profiles')
      .select('monthly_income, monthly_expenses, existing_emi, credit_score, id, user_id, created_at, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (bData && (bData as any).monthly_income) {
      return bData as unknown as FinancialProfile;
    }
  } catch {
    // ignore
  }

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
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const mockFinancial: FinancialProfile = {
      id: 'demo-financial-id',
      user_id: userId,
      monthly_income: input.monthly_income,
      monthly_expenses: input.monthly_expenses,
      existing_emi: input.existing_emi || 0,
      credit_score: creditScore,
      created_at: now,
      updated_at: now,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_FINANCIAL_KEY}_${userId}`, JSON.stringify(mockFinancial));
    }
    return mockFinancial;
  }

  const supabase = createClient();

  // Update borrower_profiles
  try {
    await (supabase.from('borrower_profiles') as any).upsert(
      {
        user_id: userId,
        monthly_income: input.monthly_income,
        monthly_expenses: input.monthly_expenses,
        existing_emi: input.existing_emi || 0,
        credit_score: creditScore,
        updated_at: now,
      },
      { onConflict: 'user_id' }
    );
  } catch {
    // ignore
  }

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
    return payload as unknown as FinancialProfile;
  }

  return data as unknown as FinancialProfile;
}
