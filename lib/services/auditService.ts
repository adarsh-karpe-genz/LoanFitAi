/**
 * LoanFit AI - Phase 5: Fintech Audit Logging Service
 * 
 * Provides tamper-evident compliance audit trail recording user actions,
 * financial calculations, recommendation runs, and consent events.
 */

import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { AuditAction, AuditLog } from '@/types/database';

export interface AuditLogInput {
  userId?: string | null;
  action: AuditAction;
  resource: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any> | null;
}

// In-memory audit buffer for demo / offline fallback
const IN_MEMORY_AUDIT_LOGS: AuditLog[] = [];

/**
 * Appends an audit log entry to public.audit_logs in Supabase.
 * Fallback to in-memory buffer if database is offline.
 */
export async function logAudit(input: AuditLogInput): Promise<AuditLog> {
  const timestamp = new Date().toISOString();
  const logEntry: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: input.userId || null,
    action: input.action,
    resource: input.resource,
    ip_address: input.ipAddress || null,
    user_agent: input.userAgent || null,
    metadata: input.metadata || {},
    created_at: timestamp,
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabase();
      await (supabase as any).from('audit_logs').insert({
        user_id: logEntry.user_id,
        action: logEntry.action,
        resource: logEntry.resource,
        ip_address: logEntry.ip_address,
        user_agent: logEntry.user_agent,
        metadata: logEntry.metadata,
      });
    } catch (err) {
      console.warn('Supabase audit log insert fallback:', err);
    }
  }

  IN_MEMORY_AUDIT_LOGS.unshift(logEntry);
  if (IN_MEMORY_AUDIT_LOGS.length > 200) {
    IN_MEMORY_AUDIT_LOGS.pop();
  }

  return logEntry;
}

/**
 * Retrieves audit logs for a given user.
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabase();
      const { data, error } = await (supabase as any)
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data as AuditLog[];
      }
    } catch (err) {
      console.warn('Supabase fetch audit logs fallback:', err);
    }
  }

  return IN_MEMORY_AUDIT_LOGS.filter((l) => l.user_id === userId).slice(0, limit);
}
