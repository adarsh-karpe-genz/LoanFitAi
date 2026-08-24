/**
 * LoanFit AI - Phase 5: Consent Management Service
 * 
 * Manages user permissions, data collection authorizations,
 * and Account Aggregator consent records in compliance with RBI / DPDP standards.
 */

import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { ConsentRecord, ConsentStatus } from '@/types/database';
import { logAudit } from './auditService';

export interface RecordConsentInput {
  userId: string;
  provider: string; // e.g. 'Sahamati_AA', 'Bhashini', 'CreditBureau'
  purpose: string; // e.g. 'LOAN_UNDERWRITING', 'INCOME_VERIFICATION'
  status?: ConsentStatus;
  consentHandle?: string | null;
  validityDays?: number; // default 30 days
}

// In-memory buffer for demo / fallback
const IN_MEMORY_CONSENTS: ConsentRecord[] = [];

/**
 * Records a new user consent authorization artifact.
 */
export async function recordConsent(input: RecordConsentInput): Promise<ConsentRecord> {
  const now = new Date();
  const validityDays = input.validityDays || 30;
  const expiresAt = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000).toISOString();

  const record: ConsentRecord = {
    id: `consent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: input.userId,
    provider: input.provider,
    purpose: input.purpose,
    status: input.status || 'ACTIVE',
    consent_handle: input.consentHandle || `urn:sahamati:consent:${Date.now()}`,
    expires_at: expiresAt,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabase();
      const { data, error } = await (supabase as any)
        .from('consent_records')
        .insert({
          user_id: record.user_id,
          provider: record.provider,
          purpose: record.purpose,
          status: record.status,
          consent_handle: record.consent_handle,
          expires_at: record.expires_at,
        })
        .select()
        .single();

      if (!error && data) {
        record.id = data.id;
      }
    } catch (err) {
      console.warn('Supabase consent record insert fallback:', err);
    }
  }

  IN_MEMORY_CONSENTS.unshift(record);

  // Log compliance audit entry
  await logAudit({
    userId: input.userId,
    action: 'AA_CONSENT_GRANTED',
    resource: `consent:${record.provider}`,
    metadata: {
      provider: record.provider,
      purpose: record.purpose,
      consentHandle: record.consent_handle,
      expiresAt: record.expires_at,
    },
  });

  return record;
}

/**
 * Retrieves all active, non-expired consents for a given user.
 */
export async function getUserActiveConsents(userId: string): Promise<ConsentRecord[]> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabase();
      const { data, error } = await (supabase as any)
        .from('consent_records')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')
        .gt('expires_at', now)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as ConsentRecord[];
      }
    } catch (err) {
      console.warn('Supabase fetch active consents fallback:', err);
    }
  }

  return IN_MEMORY_CONSENTS.filter(
    (c) =>
      c.user_id === userId &&
      c.status === 'ACTIVE' &&
      c.expires_at &&
      c.expires_at > now
  );
}

/**
 * Revokes a user consent authorization.
 */
export async function revokeConsent(
  consentId: string,
  userId: string
): Promise<boolean> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabase();
      await (supabase as any)
        .from('consent_records')
        .update({ status: 'REVOKED', updated_at: now })
        .eq('id', consentId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Supabase revoke consent fallback:', err);
    }
  }

  const memoryRecord = IN_MEMORY_CONSENTS.find(
    (c) => c.id === consentId && c.user_id === userId
  );
  if (memoryRecord) {
    memoryRecord.status = 'REVOKED';
    memoryRecord.updated_at = now;
  }

  // Log compliance audit entry
  await logAudit({
    userId,
    action: 'AA_CONSENT_REVOKED',
    resource: `consent:${consentId}`,
    metadata: { consentId, revokedAt: now },
  });

  return true;
}
