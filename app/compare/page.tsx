'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getFullBorrowerProfile } from '@/services/loan/loanService';
import { getActiveLoanProducts, buildLoanComparison } from '@/services/loan/loanCatalogService';
import {
  BorrowerFullProfile,
  ComparisonProductResult,
  ComparisonFilterState,
  SortField,
  SortOrder,
  LoanRequirement,
  LoanType,
} from '@/types/database';
import { formatINR, formatTenure } from '@/lib/utils';
import ComparisonTable from '@/components/compare/ComparisonTable';
import ComparisonFilters from '@/components/compare/ComparisonFilters';
import ProductDetailDrawer from '@/components/compare/ProductDetailDrawer';
import {
  Building2,
  SlidersHorizontal,
  ArrowRight,
  Edit3,
  ShieldCheck,
  Sparkles,
  Info,
  Scale,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

const initialFilterState: ComparisonFilterState = {
  lenderIds: [],
  minRate: undefined,
  maxRate: undefined,
  maxEMI: undefined,
  maxProcessingFee: undefined,
  onlyEligible: false,
  searchTerm: '',
};

function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<BorrowerFullProfile | null>(null);
  const [rawProducts, setRawProducts] = useState<ComparisonProductResult[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ComparisonProductResult | null>(null);

  const [filters, setFilters] = useState<ComparisonFilterState>(initialFilterState);
  const [sortField, setSortField] = useState<SortField>('known_borrowing_cost');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    async function loadData() {
      try {
        let currentUserId = '';
        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            currentUserId = data.user.id;
          }
        } else {
          const demoUser = typeof window !== 'undefined' ? localStorage.getItem('loanfit_demo_user') : null;
          if (demoUser) {
            currentUserId = JSON.parse(demoUser).id || 'demo-user-123';
          }
        }

        let fullProfile: BorrowerFullProfile | null = null;
        if (currentUserId) {
          fullProfile = await getFullBorrowerProfile(currentUserId);
          setProfileData(fullProfile);
        }

        // Active requirement or fallback standard comparison requirement (Home Loan ₹30L, 20 yrs)
        const requirement: LoanRequirement = fullProfile?.loanRequirement || {
          id: 'demo-req',
          user_id: currentUserId || 'demo-user',
          loan_type: (searchParams.get('type') as LoanType) || 'Home Loan',
          loan_amount: Number(searchParams.get('amount')) || 3000000,
          tenure_months: Number(searchParams.get('tenure')) || 240,
        };

        const products = await getActiveLoanProducts(requirement.loan_type);
        const comparison = buildLoanComparison({
          requirement,
          financialProfile: fullProfile?.financialProfile,
          profile: fullProfile?.profile,
          products,
        });

        setRawProducts(comparison.products);
      } catch (err) {
        console.error('Error loading loan comparison data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [searchParams]);

  // Unique lenders available in current product list
  const availableLenders = useMemo(() => {
    const map = new Map<string, { id: string; name: string; shortName?: string | null }>();
    rawProducts.forEach((p) => {
      if (!map.has(p.lenderId)) {
        map.set(p.lenderId, {
          id: p.lenderId,
          name: p.lenderName,
          shortName: p.lenderShortName,
        });
      }
    });
    return Array.from(map.values());
  }, [rawProducts]);

  const maxRateBound = useMemo(() => {
    return Math.max(...rawProducts.map((p) => p.maxInterestRate), 15);
  }, [rawProducts]);

  const maxEMIBound = useMemo(() => {
    return Math.max(...rawProducts.map((p) => p.monthlyEMI), 50000);
  }, [rawProducts]);

  // Filter & Sort Pipeline
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...rawProducts];

    // 1. Filter by Lender IDs
    if (filters.lenderIds.length > 0) {
      list = list.filter((p) => filters.lenderIds.includes(p.lenderId));
    }

    // 2. Filter by Max Rate
    if (typeof filters.maxRate === 'number' && filters.maxRate > 0) {
      list = list.filter((p) => p.minInterestRate <= (filters.maxRate as number));
    }

    // 3. Filter by Max Monthly EMI
    if (typeof filters.maxEMI === 'number' && filters.maxEMI > 0) {
      list = list.filter((p) => p.monthlyEMI <= (filters.maxEMI as number));
    }

    // 4. Filter by Eligibility
    if (filters.onlyEligible) {
      list = list.filter((p) => p.isEligible);
    }

    // 5. Search text filter
    if (filters.searchTerm.trim() !== '') {
      const q = filters.searchTerm.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.lenderName.toLowerCase().includes(q) ||
          p.productName.toLowerCase().includes(q) ||
          (p.lenderShortName && p.lenderShortName.toLowerCase().includes(q))
      );
    }

    // 6. Sorting
    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      switch (sortField) {
        case 'interest_rate':
          valA = a.minInterestRate;
          valB = b.minInterestRate;
          break;
        case 'emi':
          valA = a.monthlyEMI;
          valB = b.monthlyEMI;
          break;
        case 'total_interest':
          valA = a.totalInterest;
          valB = b.totalInterest;
          break;
        case 'processing_fee':
          valA = a.processingFee;
          valB = b.processingFee;
          break;
        case 'known_borrowing_cost':
        default:
          valA = a.knownBorrowingCost;
          valB = b.knownBorrowingCost;
          break;
      }

      if (sortOrder === 'asc') {
        return valA - valB;
      } else {
        return valB - valA;
      }
    });

    return list;
  }, [rawProducts, filters, sortField, sortOrder]);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const req = profileData?.loanRequirement;
  const currentLoanType = req?.loan_type || 'Home Loan';
  const currentAmount = req?.loan_amount || 3000000;
  const currentTenure = req?.tenure_months || 240;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-36 bg-slate-200/70 animate-pulse rounded-3xl" />
        <div className="h-28 bg-slate-200/70 animate-pulse rounded-2xl" />
        <div className="h-96 bg-slate-200/70 animate-pulse rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. Header & User Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold uppercase tracking-wider">
              Phase 2: Loan Intelligence
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Deterministic Comparison Engine
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            Compare Loan Options
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Compare advertised rates, monthly EMI, lifetime interest, processing fees, and Known Borrowing Costs across institutional lenders.
          </p>

          {/* Active Borrower Requirement Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 font-semibold text-slate-800">
              <span className="text-slate-500 font-normal">Category: </span>
              {currentLoanType}
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 font-semibold text-slate-800 font-mono">
              <span className="text-slate-500 font-normal font-sans">Amount: </span>
              {formatINR(currentAmount)}
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 font-semibold text-slate-800">
              <span className="text-slate-500 font-normal">Tenure: </span>
              {formatTenure(currentTenure)}
            </div>
          </div>
        </div>

        {/* Edit Requirements Button */}
        <div className="shrink-0 flex items-center gap-3">
          <Link
            href="/profile?step=0"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Requirements</span>
          </Link>
        </div>
      </div>

      {/* 2. Research / Reference Dataset Notice */}
      <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-slate-900 block mb-0.5">
            Demonstration & Research Dataset (August 2026 Reference Rates)
          </span>
          All listed rates, processing fees, and terms are compiled for comparison modeling from public disclosures. Stated numbers must be verified directly with respective lenders before loan application.
        </div>
      </div>

      {/* 3. Filters Component */}
      <ComparisonFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters(initialFilterState)}
        availableLenders={availableLenders}
        maxRateBound={maxRateBound}
        maxEMIBound={maxEMIBound}
      />

      {/* 4. Comparison Table Component */}
      <ComparisonTable
        products={filteredAndSortedProducts}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
      />

      {/* 5. Product Detail Slide-Over Drawer */}
      <ProductDetailDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="h-96 bg-slate-100 animate-pulse rounded-3xl" />
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
