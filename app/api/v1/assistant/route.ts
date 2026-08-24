import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getActiveLoanProducts } from '@/services/loan/loanCatalogService';
import {
  ChatMessage,
  RecommendationResultItem,
  SupportedLanguage,
} from '@/types/database';
import { formatINR, formatTenure } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages: ChatMessage[] = body.messages || [];
    const recommendations: RecommendationResultItem[] = body.recommendations || [];
    const borrowerContext = body.borrowerContext || {
      loanType: 'Home Loan',
      loanAmount: 3000000,
      tenureMonths: 240,
      monthlyIncome: 60000,
      existingEMI: 0,
      creditScore: 750,
      foirThreshold: 60,
    };
    const language: SupportedLanguage = body.language || 'en';

    const latestUserMessage = messages[messages.length - 1]?.content || 'Hello, can you explain my recommendations?';

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // Build RAG Knowledge Base Context
    const rankedContextSummary = recommendations
      .slice(0, 5)
      .map(
        (r) =>
          `Rank #${r.rank}: ${r.product_name} (${r.lender_name})
- Advertised Interest Rate: ${r.interest_rate.toFixed(2)}% p.a.
- Monthly EMI: ₹${r.calculated_emi.toLocaleString('en-IN')}
- Total Lifetime Interest: ₹${r.total_interest.toLocaleString('en-IN')}
- Upfront Processing Fee: ₹${r.processing_fee.toLocaleString('en-IN')}
- True Net Cost of Borrowing: ₹${r.total_cost.toLocaleString('en-IN')}
- Suitability Score: ${r.utility_score}/100
- Borrower FOIR: ${r.foir_percentage}%
- Key Driver Breakdown: Cost Score +${r.breakdown.costComponentScore.toFixed(1)}, Fee Score +${r.breakdown.feeComponentScore.toFixed(1)}, Credit Score Buffer +${r.breakdown.eligibilityComponentScore.toFixed(1)} pts`
      )
      .join('\n\n');

    const langDirectives: Record<SupportedLanguage, string> = {
      en: 'Respond in professional, clear, and encouraging English.',
      hi: 'Respond in clear, accessible Hindi (हिन्दी) with Devanagari script for financial terms and Indian numerals.',
      mr: 'Respond in clear, accessible Marathi (मराठी) with Devanagari script.',
      ta: 'Respond in clear, accessible Tamil (தமிழ்).',
      te: 'Respond in clear, accessible Telugu (తెలుగు).',
      bn: 'Respond in clear, accessible Bengali (বাংলা).',
      kn: 'Respond in clear, accessible Kannada (ಕನ್ನಡ).',
      gu: 'Respond in clear, accessible Gujarati (ગુજરાતી).',
    };

    const ragSystemPrompt = `You are "LoanFit AI Advisor", a trusted, borrower-first fintech financial intelligence assistant.
You help users understand their personalized loan comparison, FOIR affordability metrics, and Multi-Attribute Utility Theory (MAUT) suitability rankings.

RAG GROUNDING KNOWLEDGE (ACTIVE BORROWER PROFILE & MATHEMATICAL EVALUATIONS):
- Requested Loan Type: ${borrowerContext.loanType}
- Requested Loan Amount: ₹${borrowerContext.loanAmount.toLocaleString('en-IN')}
- Requested Tenure: ${borrowerContext.tenureMonths} Months (${Math.round(borrowerContext.tenureMonths / 12)} Years)
- Stated Monthly Income: ₹${borrowerContext.monthlyIncome.toLocaleString('en-IN')}
- Existing Active Monthly EMIs: ₹${borrowerContext.existingEMI.toLocaleString('en-IN')}
- CIBIL Credit Score: ${borrowerContext.creditScore || 'Unspecified'}
- Maximum Safe FOIR Threshold: ${borrowerContext.foirThreshold}%

RANKED LOAN PRODUCTS (DETERMINISTIC EVALUATION):
${rankedContextSummary || 'No specific recommendations loaded yet.'}

BEHAVIORAL GUIDELINES:
1. Strict Grounding: Rely strictly on the numbers and facts provided in this context. Quote exact EMIs, interest rates, and Net Costs. Never invent random banks or fake rate numbers.
2. Neutrality & Education: Explain trade-offs clearly (e.g. lowest EMI vs lowest total lifetime cost, fixed vs floating rates, impact of prepayment).
3. No False Guarantees: Always remind borrowers that suitability scores reflect mathematical alignment with their stated inputs and do not guarantee final bank sanction.
4. Language Requirement: ${langDirectives[language] || langDirectives.en}
5. Tone: Concise, warm, structured with bullet points where helpful.`;

    if (!apiKey || apiKey === 'placeholder' || apiKey.includes('placeholder')) {
      // Local Grounded Fallback if API key not supplied
      let fallbackText = '';
      const top = recommendations[0];
      if (top) {
        fallbackText = `Based on your monthly income of ${formatINR(borrowerContext.monthlyIncome)} and loan requirement of ${formatINR(borrowerContext.loanAmount)} for ${formatTenure(borrowerContext.tenureMonths)}:\n\n` +
          `• **Top Recommendation (Rank #1):** **${top.product_name}** by **${top.lender_name}** achieved a Suitability Score of **${top.utility_score}/100**.\n` +
          `• **Monthly EMI:** ${formatINR(top.calculated_emi)}/month, resulting in a safe **${top.foir_percentage}% FOIR** (well below your ${borrowerContext.foirThreshold}% limit).\n` +
          `• **True Net Cost:** ${formatINR(top.total_cost)} (Total Interest: ${formatINR(top.total_interest)} + Fees: ${formatINR(top.processing_fee)}).\n\n` +
          `Would you like me to compare specific banks or simulate what happens if you adjust your tenure?`;
      } else {
        fallbackText = `Hello! I am your LoanFit AI Advisor. I can explain why specific loans scored higher, analyze your FOIR affordability, or simulate how changing your tenure alters your monthly EMI and total interest. How can I help you today?`;
      }

      return NextResponse.json({
        message: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: fallbackText,
          timestamp: new Date().toISOString(),
          language,
          isGrounded: true,
        },
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format conversation history for Gemini
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // If history doesn't contain current prompt, append it
    if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
      contents.push({
        role: 'user',
        parts: [{ text: latestUserMessage }],
      });
    }

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: ragSystemPrompt,
        temperature: 0.3,
      },
    });

    const assistantReply = geminiResponse.text || 'I analyzed your loan comparison. How can I assist with your decision?';

    return NextResponse.json({
      message: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: assistantReply,
        timestamp: new Date().toISOString(),
        language,
        isGrounded: true,
      },
    });
  } catch (error: any) {
    console.error('Assistant API error:', error);
    return NextResponse.json(
      {
        message: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: 'I encountered an issue processing your request. Please check your network connection or try again.',
          timestamp: new Date().toISOString(),
          isGrounded: false,
        },
      },
      { status: 200 } // Graceful return
    );
  }
}
