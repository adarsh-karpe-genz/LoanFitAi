import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                LoanFit <span className="text-blue-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-300 font-medium max-w-md leading-relaxed">
              &ldquo;Find the loan that fits you — not just the lowest interest rate.&rdquo;
            </p>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Empowering borrowers with structured financial profile analysis, transparent eligibility criteria, and multi-dimensional loan comparison.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Borrower Dashboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  Profile Assessment
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  How it Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Data Integrity */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Privacy & Security
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Row Level Security (RLS)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>No password storage on our servers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Isolated user data partitions</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Regulatory & Informational Disclaimer */}
        <div className="pt-8 border-t border-slate-800/80 text-xs text-slate-400 space-y-3">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <p className="text-slate-300 font-medium mb-1">
              Important Financial Disclaimer:
            </p>
            <p className="leading-relaxed">
              Loan information and recommendations are for informational purposes and should be verified with the lender before applying. LoanFit AI does not provide loan approval guarantees. Actual loan approval, final interest rates, processing charges, and terms are determined solely by respective lending institutions based on individual credit appraisal and bank policies.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-[11px]">
            <p>© {new Date().getFullYear()} LoanFit AI. All rights reserved.</p>
            <p className="text-slate-400">Built for precision, transparency, and borrower control.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
