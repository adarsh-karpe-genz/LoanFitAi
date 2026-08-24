import { z } from 'zod';

export const loanTypes = [
  'Home Loan',
  'Education Loan',
  'Car Loan',
  'Personal Loan',
  'Business Loan',
] as const;

export const employmentTypes = [
  'Salaried',
  'Self-employed',
  'Student',
] as const;

export const validTenureYears = [1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30] as const;

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email address is required').email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z
  .object({
    full_name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    email: z.string().trim().min(1, 'Email address is required').email('Invalid email address format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Email address is required').email('Invalid email address format'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

// Personal Profile Schema
export const personalProfileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  age: z.coerce
    .number({ invalid_type_error: 'Age must be a valid number' })
    .int('Age must be an integer')
    .min(18, 'Age must be at least 18 years')
    .max(65, 'Age must be 65 years or younger'),
  employment_type: z.enum(employmentTypes, {
    errorMap: () => ({ message: 'Please select a valid employment type' }),
  }),
  location: z
    .string()
    .trim()
    .min(2, 'Location is required (e.g. Mumbai, Pune, Bengaluru)')
    .max(100, 'Location cannot exceed 100 characters'),
});

// Financial Profile Schema
export const financialProfileSchema = z
  .object({
    monthly_income: z.coerce
      .number({ invalid_type_error: 'Monthly income is required' })
      .min(10000, 'Monthly income must be at least ₹10,000'),
    monthly_expenses: z.coerce
      .number({ invalid_type_error: 'Monthly expenses must be a valid number' })
      .min(0, 'Monthly expenses cannot be negative'),
    existing_emi: z.coerce
      .number({ invalid_type_error: 'Existing EMI must be a valid number' })
      .min(0, 'Existing EMI cannot be negative')
      .default(0),
    knows_credit_score: z.boolean().default(true),
    credit_score: z.coerce
      .number()
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.monthly_expenses > data.monthly_income) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Monthly expenses cannot be greater than monthly income.',
        path: ['monthly_expenses'],
      });
    }

    if (data.knows_credit_score) {
      if (data.credit_score === null || data.credit_score === undefined || isNaN(data.credit_score)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter your CIBIL / credit score (300–900) or choose "I don\'t know"',
          path: ['credit_score'],
        });
      } else if (data.credit_score < 300 || data.credit_score > 900) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CIBIL / Credit score must be between 300 and 900',
          path: ['credit_score'],
        });
      }
    }
  });

// Loan Requirement Schema
export const loanRequirementSchema = z.object({
  loan_type: z.enum(loanTypes, {
    errorMap: () => ({ message: 'Please select a valid loan type' }),
  }),
  loan_amount: z.coerce
    .number({ invalid_type_error: 'Loan amount is required' })
    .min(10000, 'Loan amount must be at least ₹10,000')
    .max(1000000000, 'Loan amount exceeds maximum limit'),
  tenure_years: z.coerce
    .number({ invalid_type_error: 'Please select a preferred tenure' })
    .refine((val) => (validTenureYears as readonly number[]).includes(val), {
      message: 'Please select a valid tenure option',
    }),
});

// User Preferences Schema (Stores Raw 0-100 values)
export const userPreferencesSchema = z.object({
  cost_weight: z.coerce
    .number()
    .min(0, 'Cost weight cannot be less than 0')
    .max(100, 'Cost weight cannot exceed 100')
    .default(50),
  emi_weight: z.coerce
    .number()
    .min(0, 'EMI weight cannot be less than 0')
    .max(100, 'EMI weight cannot exceed 100')
    .default(50),
  eligibility_weight: z.coerce
    .number()
    .min(0, 'Eligibility weight cannot be less than 0')
    .max(100, 'Eligibility weight cannot exceed 100')
    .default(50),
  fee_weight: z.coerce
    .number()
    .min(0, 'Fee weight cannot be less than 0')
    .max(100, 'Fee weight cannot exceed 100')
    .default(50),
  flexibility_weight: z.coerce
    .number()
    .min(0, 'Flexibility weight cannot be less than 0')
    .max(100, 'Flexibility weight cannot exceed 100')
    .default(50),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type PersonalProfileInput = z.infer<typeof personalProfileSchema>;
export type FinancialProfileInput = z.infer<typeof financialProfileSchema>;
export type LoanRequirementInput = z.infer<typeof loanRequirementSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
