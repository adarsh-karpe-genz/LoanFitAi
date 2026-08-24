import { NextRequest, NextResponse } from 'next/server';
import { getActiveLoanProducts } from '@/services/loan/loanCatalogService';
import {
  buildRecommendationResponse,
  DEFAULT_WEIGHTS,
} from '@/lib/services/recommendationEngine';
import { LoanType, SimulationPayload } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const payload: SimulationPayload = await request.json();

    const targetLoanType: LoanType = payload.loanType || 'Home Loan';
    const loanAmount = Number(payload.amount);
    const tenureMonths = Number(payload.tenureMonths);
    const monthlyIncome = Number(payload.monthlyIncome);
    const existingEMI = Number(payload.existingEMI || 0);
    const creditScore = payload.creditScore !== undefined && payload.creditScore !== null ? Number(payload.creditScore) : null;
    const weights = payload.weights || DEFAULT_WEIGHTS;
    const maxFOIR = payload.maxFOIR;

    if (!loanAmount || loanAmount <= 0) {
      return NextResponse.json(
        { error: 'Loan amount must be a positive number.' },
        { status: 400 }
      );
    }

    if (!tenureMonths || tenureMonths <= 0) {
      return NextResponse.json(
        { error: 'Tenure in months must be greater than 0.' },
        { status: 400 }
      );
    }

    if (!monthlyIncome || monthlyIncome <= 0) {
      return NextResponse.json(
        { error: 'Monthly income must be greater than 0.' },
        { status: 400 }
      );
    }

    // Fetch active products for requested category
    const products = await getActiveLoanProducts(targetLoanType);

    // Stateless simulation calculation (zero database writes)
    const simulationResponse = buildRecommendationResponse({
      products,
      context: {
        loanType: targetLoanType,
        loanAmount,
        tenureMonths,
        monthlyIncome,
        existingEMI,
        creditScore,
        weights,
        maxFOIR,
      },
      isSimulated: true,
    });

    return NextResponse.json(simulationResponse, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process loan simulation.' },
      { status: 500 }
    );
  }
}
