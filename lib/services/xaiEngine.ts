/**
 * LoanFit AI - Phase 4: Explainable AI (XAI) Engine
 * 
 * Uses @google/genai and gemini-2.5-flash model to translate deterministic Phase 3
 * mathematical MCDA/MAUT scores and FOIR calculations into natural language explanations.
 * Simulates SHAP-value feature impact interpretations while strictly preventing hallucination.
 */

import { GoogleGenAI } from '@google/genai';
import {
  RecommendationResultItem,
  RecommendationWeights,
  XaiExplanation,
  ShapValueComponent,
  SupportedLanguage,
  LanguageOption,
} from '@/types/database';
import { formatINR } from '@/lib/utils';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];

export interface XaiContext {
  loanAmount: number;
  tenureMonths: number;
  monthlyIncome: number;
  existingEMI: number;
  creditScore: number | null;
  language?: SupportedLanguage;
}

/**
 * Deterministic local fallback generator for XAI explanations
 * Active when GEMINI_API_KEY is not configured or in offline/demo mode.
 */
export function generateLocalXaiExplanation(
  item: RecommendationResultItem,
  context: XaiContext
): XaiExplanation {
  const lang = context.language || 'en';
  const { breakdown } = item;

  const costScore = breakdown.costComponentScore;
  const feeScore = breakdown.feeComponentScore;
  const eligScore = breakdown.eligibilityComponentScore;

  const shapFeatureImpacts: ShapValueComponent[] = [
    {
      featureName: 'Net Cost of Borrowing',
      featureValue: formatINR(item.total_cost),
      impactScore: Number(costScore.toFixed(1)),
      direction: item.cost_utility >= 0.6 ? 'positive' : 'neutral',
      explanation: `Total interest of ${formatINR(item.total_interest)} plus upfront fee of ${formatINR(item.processing_fee)} contributed ${costScore.toFixed(1)} / 60 max points.`,
    },
    {
      featureName: 'Upfront Processing Fee',
      featureValue: formatINR(item.processing_fee),
      impactScore: Number(feeScore.toFixed(1)),
      direction: item.fee_utility >= 0.5 ? 'positive' : 'neutral',
      explanation: `Disclosed processing fee contributed ${feeScore.toFixed(1)} / 20 max fee points.`,
    },
    {
      featureName: 'Credit Score Cushion',
      featureValue: context.creditScore ? `${context.creditScore} CIBIL` : 'Unspecified',
      impactScore: Number(eligScore.toFixed(1)),
      direction: item.eligibility_utility >= 0.7 ? 'positive' : 'neutral',
      explanation: context.creditScore
        ? `Your score provides a +${breakdown.creditBuffer} pt buffer above the minimum threshold (${breakdown.minCIBILRequired || 650}).`
        : 'Neutral score applied as CIBIL was not provided.',
    },
    {
      featureName: 'Debt-to-Income (FOIR)',
      featureValue: `${item.foir_percentage}%`,
      impactScore: 0,
      direction: item.foir_percentage <= 50 ? 'positive' : 'neutral',
      explanation: `Combined EMI load (${formatINR(item.calculated_emi)} + existing ${formatINR(context.existingEMI)}) is within safe 60% threshold.`,
    },
  ];

  const positiveDrivers: string[] = [
    `Strong Net Cost efficiency (${formatINR(item.total_cost)} total lifecycle borrowing expense).`,
    `Manageable monthly installment of ${formatINR(item.calculated_emi)}/mo with a safe ${item.foir_percentage}% FOIR.`,
  ];
  if (item.processing_fee === 0) {
    positiveDrivers.push('Zero processing fee concession.');
  } else if (context.creditScore && breakdown.creditBuffer >= 50) {
    positiveDrivers.push(`Robust ${breakdown.creditBuffer}-point credit score buffer above lender minimum.`);
  }

  const tradeOffs: string[] = [
    `Floating rate terms mean monthly installments adjust with future benchmark repo rate shifts.`,
  ];
  if (item.processing_fee > 5000) {
    tradeOffs.push(`Upfront processing fee of ${formatINR(item.processing_fee)} required at loan sanction.`);
  }

  const headline = item.rank === 1
    ? `${item.lender_name} secured Rank #1 with the optimal balance of lowest lifecycle borrowing cost (${formatINR(item.total_cost)}) and verified affordability.`
    : `${item.lender_name} scored ${item.utility_score}/100 based on its competitive interest rate and stated eligibility match.`;

  const summary = `The mathematical model awarded this product ${item.utility_score}/100 suitability. Its monthly installment of ${formatINR(item.calculated_emi)} leaves you with an estimated FOIR of ${item.foir_percentage}%, safely within your income capacity.`;

  const foirVerdict = `Your total debt obligation of ${formatINR(context.existingEMI + item.calculated_emi)}/month represents ${item.foir_percentage}% of your ${formatINR(context.monthlyIncome)} income, passing all safety benchmarks.`;

  return {
    productId: item.product_id,
    productName: item.product_name,
    lenderName: item.lender_name,
    rank: item.rank,
    utilityScore: item.utility_score,
    headline,
    summary,
    positiveDrivers,
    tradeOffs,
    foirVerdict,
    shapFeatureImpacts,
    language: lang,
    generatedAt: new Date().toISOString(),
    isAiGenerated: false,
  };
}

/**
 * Generates an Explainable AI (XAI) narrative using Gemini API (gemini-2.5-flash)
 * Grounded strictly in Phase 3 mathematical outputs without hallucinating.
 */
export async function generateXaiExplanation(
  item: RecommendationResultItem,
  context: XaiContext
): Promise<XaiExplanation> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const targetLang = context.language || 'en';

  if (!apiKey || apiKey === 'placeholder' || apiKey.includes('placeholder')) {
    return generateLocalXaiExplanation(item, context);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const langInstructions: Record<SupportedLanguage, string> = {
      en: 'Respond in clear, professional English.',
      hi: 'Respond in natural, accessible Hindi (हिन्दी) using Devanagari script for financial terms and Indian numerals.',
      mr: 'Respond in natural, accessible Marathi (मराठी) using Devanagari script.',
      ta: 'Respond in natural, accessible Tamil (தமிழ்).',
      te: 'Respond in natural, accessible Telugu (తెలుగు).',
      bn: 'Respond in natural, accessible Bengali (বাংলা).',
      kn: 'Respond in natural, accessible Kannada (ಕನ್ನಡ).',
      gu: 'Respond in natural, accessible Gujarati (ગુજરાતી).',
    };

    const systemPrompt = `You are LoanFit AI's Explainable AI (XAI) financial interpreter.
Your role is to explain deterministic mathematical loan recommendation outputs to the borrower in plain, trustworthy, and precise language.

CRITICAL CONSTRAINTS:
1. Grounding: You must strictly narrate the provided mathematical facts. Never invent, alter, or hallucinate interest rates, fees, or metrics not given in the prompt.
2. Compliance: Do NOT promise or guarantee loan approval (e.g. say "based on your stated profile" instead of "guaranteed approval").
3. Language: ${langInstructions[targetLang] || langInstructions.en}
4. Response Format: Return ONLY a valid, parseable JSON object matching this schema:
{
  "headline": "Short 1-line reason why this product received its rank/score",
  "summary": "2-sentence plain explanation of why this product fits the borrower's numbers",
  "positiveDrivers": ["Key positive factor 1 with specific numbers", "Key positive factor 2"],
  "tradeOffs": ["Key trade-off or caution factor with specific numbers"],
  "foirVerdict": "1 sentence explaining the debt-to-income (FOIR) safety",
  "shapFeatureImpacts": [
    {
      "featureName": "Net Cost of Borrowing",
      "featureValue": "₹...",
      "impactScore": 38.5,
      "direction": "positive",
      "explanation": "Why this feature contributed to the score"
    }
  ]
}`;

    const prompt = `Interpret the following mathematical loan recommendation output:

BORROWER CONTEXT:
- Requested Loan: ₹${context.loanAmount.toLocaleString('en-IN')} (${item.loan_type})
- Requested Tenure: ${context.tenureMonths} Months (${Math.round(context.tenureMonths / 12)} Years)
- Monthly Income: ₹${context.monthlyIncome.toLocaleString('en-IN')}
- Existing Active EMIs: ₹${context.existingEMI.toLocaleString('en-IN')}
- CIBIL Credit Score: ${context.creditScore || 'Unspecified'}

PRODUCT & DETERMINISTIC MATHEMATICAL OUTPUTS:
- Lender: ${item.lender_name}
- Product: ${item.product_name}
- Advertised Interest Rate: ${item.interest_rate.toFixed(2)}% p.a.
- Calculated Monthly EMI: ₹${item.calculated_emi.toLocaleString('en-IN')}
- Total Lifetime Interest: ₹${item.total_interest.toLocaleString('en-IN')}
- Upfront Processing Fee: ₹${item.processing_fee.toLocaleString('en-IN')}
- True Net Cost of Borrowing: ₹${item.total_cost.toLocaleString('en-IN')}
- Borrower FOIR Ratio: ${item.foir_percentage}% (Affordability Cap: ${item.breakdown.foirThreshold}%)
- Normalized Cost Utility (60% weight): ${(item.cost_utility * 100).toFixed(1)}% -> +${item.breakdown.costComponentScore.toFixed(1)} pts
- Normalized Fee Utility (20% weight): ${(item.fee_utility * 100).toFixed(1)}% -> +${item.breakdown.feeComponentScore.toFixed(1)} pts
- Eligibility Buffer Utility (20% weight): ${(item.eligibility_utility * 100).toFixed(1)}% -> +${item.breakdown.eligibilityComponentScore.toFixed(1)} pts (Buffer: +${item.breakdown.creditBuffer} pts above min ${item.breakdown.minCIBILRequired || 650})
- Composite MCDA Suitability Score: ${item.utility_score}/100
- Final Rank: #${item.rank} in catalog

Generate the JSON explanation object according to your system instructions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2, // low temperature for strict deterministic grounding
      },
    });

    const responseText = response.text || '';
    const parsed = JSON.parse(responseText);

    return {
      productId: item.product_id,
      productName: item.product_name,
      lenderName: item.lender_name,
      rank: item.rank,
      utilityScore: item.utility_score,
      headline: parsed.headline || `${item.lender_name} achieved Rank #${item.rank} with a Suitability Score of ${item.utility_score}/100.`,
      summary: parsed.summary || `Calculated Net Cost of ${formatINR(item.total_cost)} and EMI of ${formatINR(item.calculated_emi)} results in ${item.foir_percentage}% FOIR.`,
      positiveDrivers: Array.isArray(parsed.positiveDrivers) && parsed.positiveDrivers.length > 0 ? parsed.positiveDrivers : [`Lowest Net Borrowing Cost of ${formatINR(item.total_cost)}`],
      tradeOffs: Array.isArray(parsed.tradeOffs) && parsed.tradeOffs.length > 0 ? parsed.tradeOffs : ['Standard benchmark-linked floating rates'],
      foirVerdict: parsed.foirVerdict || `Your FOIR of ${item.foir_percentage}% is safely below the ${item.breakdown.foirThreshold}% limit.`,
      shapFeatureImpacts: Array.isArray(parsed.shapFeatureImpacts) && parsed.shapFeatureImpacts.length > 0 ? parsed.shapFeatureImpacts : generateLocalXaiExplanation(item, context).shapFeatureImpacts,
      language: targetLang,
      generatedAt: new Date().toISOString(),
      isAiGenerated: true,
    };
  } catch (err) {
    console.warn('Gemini XAI generation failed; falling back to local deterministic generator:', err);
    return generateLocalXaiExplanation(item, context);
  }
}
