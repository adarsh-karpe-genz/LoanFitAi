import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { logAudit } from '@/lib/services/auditService';
import { WebhookUpdatePayload } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const expectedSecret = process.env.LENDER_WEBHOOK_SECRET || 'loanfit_prod_webhook_secret_2026';

    // Verify webhook secret token to prevent unauthorized catalog manipulation
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token || token !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid lender webhook secret token.' },
        { status: 401 }
      );
    }

    const payload: WebhookUpdatePayload = await request.json();
    const { lenderId, products = [] } = payload;

    if (!lenderId || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload. "lenderId" and a non-empty "products" array are required.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const updatedProductIds: string[] = [];

    if (isSupabaseConfigured()) {
      const supabase = createServerSupabase();

      for (const prod of products) {
        const updateFields: Record<string, any> = {
          last_verified_at: now,
        };

        if (typeof prod.minInterestRate === 'number') updateFields.min_interest_rate = prod.minInterestRate;
        if (typeof prod.maxInterestRate === 'number') updateFields.max_interest_rate = prod.maxInterestRate;
        if (typeof prod.processingFeeValue === 'number') updateFields.processing_fee_value = prod.processingFeeValue;
        if (typeof prod.active === 'boolean') updateFields.active = prod.active;
        if (prod.sourceUrl) updateFields.source_url = prod.sourceUrl;

        const { error } = await (supabase as any)
          .from('loan_products')
          .update(updateFields)
          .eq('id', prod.productId)
          .eq('lender_id', lenderId);

        if (!error) {
          updatedProductIds.push(prod.productId);
        }
      }
    } else {
      // In-memory demo update acknowledgment
      products.forEach((p) => updatedProductIds.push(p.productId));
    }

    // Log compliance audit entry
    await logAudit({
      userId: null,
      action: 'LENDER_WEBHOOK_RECEIVED',
      resource: `lender:${lenderId}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
      metadata: {
        lenderId,
        updatedCount: updatedProductIds.length,
        updatedProductIds,
        timestamp: now,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully synchronized ${updatedProductIds.length} loan product(s) for lender ${lenderId}.`,
        updatedProductIds,
        synchronizedAt: now,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Lender Webhook Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process lender webhook update.' },
      { status: 500 }
    );
  }
}
