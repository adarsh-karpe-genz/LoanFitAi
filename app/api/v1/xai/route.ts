import { NextRequest, NextResponse } from 'next/server';
import { generateXaiExplanation } from '@/lib/services/xaiEngine';
import { RecommendationResultItem, SupportedLanguage } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const item: RecommendationResultItem = body.item;
    const context = {
      loanAmount: Number(body.loanAmount) || 3000000,
      tenureMonths: Number(body.tenureMonths) || 240,
      monthlyIncome: Number(body.monthlyIncome) || 60000,
      existingEMI: Number(body.existingEMI) || 0,
      creditScore: body.creditScore !== undefined && body.creditScore !== null ? Number(body.creditScore) : null,
      language: (body.language as SupportedLanguage) || 'en',
    };

    if (!item || !item.product_id) {
      return NextResponse.json(
        { error: 'Missing recommendation item payload.' },
        { status: 400 }
      );
    }

    const explanation = await generateXaiExplanation(item, context);
    return NextResponse.json(explanation, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate XAI explanation.' },
      { status: 500 }
    );
  }
}
