# LoanFit AI — Phase 1: Foundation & Borrower Profile

> **"Find the loan that fits you — not just the lowest interest rate."**

LoanFit AI is a modern fintech web application built to help borrowers identify which bank/lender loan product is most suitable for their financial profile through multi-dimensional criteria (affordability, FOIR, total cost of borrowing, processing fees, and custom borrower preference weights).

---

## 🛠 Technology Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, React 18, Tailwind CSS, Lucide React
- **Design Language:** High-tech precision fintech aesthetic (Plus Jakarta Sans, Inter, Slate neutrals, pure white elevated cards)
- **Validation:** Zod schemas for multi-tier client & server verification
- **Backend & Database:** Supabase (Auth, PostgreSQL, Row Level Security)
- **Security:** RLS policies isolating all user data via `auth.uid() = user_id`, secure cookie sessions, zero sensitive data console logging

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js LTS (v20+ or v24+)
- Supabase project (cloud or local)

### 2. Environment Setup
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```
Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Database Migration
Open your Supabase Project $\rightarrow$ **SQL Editor**, and run the SQL script found in:
[`supabase/schema.sql`](./supabase/schema.sql)

This will create:
- `public.profiles` (Personal borrower details)
- `public.financial_profiles` (Income, expenses, EMI, optional CIBIL score)
- `public.loan_requirements` (Loan category, amount, tenure)
- `public.user_preferences` (Raw 0–100 MCDA priority weights)
- Automatic `updated_at` trigger functions
- Row Level Security (RLS) policies for `SELECT`, `INSERT`, `UPDATE`, `DELETE` bound to `auth.uid()`

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Architecture

```
LOANFITai/
 ├── app/
 │    ├── page.tsx                  # High-trust fintech landing page
 │    ├── layout.tsx                # App layout with typography & nav/footer
 │    ├── login/                    # Supabase authentication login
 │    ├── signup/                   # User onboarding & initial profile seed
 │    ├── forgot-password/          # Password recovery
 │    ├── reset-password/           # Password update
 │    ├── auth/callback/            # OAuth & reset callback handler
 │    ├── dashboard/                # Borrower overview & progress tracker
 │    ├── profile/                  # 5-step borrower profile wizard
 │    │    └── review/              # Review & confirmation page
 │    ├── loan-requirement/         # Step redirect
 │    ├── preferences/              # Step redirect
 │    └── review/                   # Direct review redirect
 ├── components/
 │    ├── ui/                       # Navbar, Footer, ProgressBar, Tooltip
 │    ├── dashboard/                # ProgressOverview, SectionCard
 │    └── forms/                    # Personal, Financial, Loan, Preferences, Review
 ├── lib/
 │    ├── supabase/                 # Client, Server, and Middleware clients
 │    ├── validation/               # Strict Zod schemas & types
 │    └── utils/                    # INR currency, tenure & FOIR formatters
 ├── services/                      # Future-proof modular service layer
 │    ├── profile/                  # Personal & financial profile service
 │    ├── loan/                     # Loan requirements & preferences service
 │    ├── recommendation/           # Phase 3 MCDA recommendation types
 │    ├── calculation/              # Phase 2 EMI & Net Cost types
 │    └── ai/                       # Phase 4 XAI & Advisor types
 ├── supabase/
 │    └── schema.sql                # Production PostgreSQL tables & RLS
 ├── types/
 │    └── database.ts               # Database & domain models
 └── test-suite.ts                  # Automated test suite (23 tests passing)
```

---

## 🧪 Testing

Run the automated test suite:
```bash
npx tsx test-suite.ts
```

All 23 test assertions verify:
- Registration & login validation
- Age boundaries (18–65)
- Income threshold ($\ge$ ₹10,000)
- Expense guardrails (Expenses $\le$ Income)
- Optional CIBIL score handling (Known 300–900 / Unknown null)
- Raw 0–100 preference weight retention (no premature normalization)
- Indian Rupee currency and tenure formatting
