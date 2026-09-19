import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--navy-950)', color: 'var(--navy-150)', borderTop: '1px solid var(--navy-800)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand — spans 2 cols on lg */}
          <div className="lg:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--navy-600)' }}>
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm text-white">
                LoanFit <span style={{ color: 'var(--navy-300)' }}>AI</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'var(--navy-450)' }}>
              &ldquo;Find the loan that fits your finances — not just the lowest advertised rate.&rdquo;
            </p>
            <p className="text-[11px] leading-relaxed max-w-sm" style={{ color: 'var(--navy-450)' }}>
              Loan information is for comparison and educational purposes only. Rates and fees shown are indicative. Actual approval terms are determined solely by lending institutions based on their underwriting criteria.
            </p>
          </div>

          {/* Platform links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-white">Platform</h4>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--navy-450)' }}>
              {[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Profile assessment', href: '/profile' },
                { label: 'Loan comparison', href: '/compare' },
                { label: 'My recommendations', href: '/recommendations' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="hover:text-white transition-colors"
                    style={{ color: 'inherit' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Security */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-white">Security</h4>
            <ul className="space-y-2.5 text-xs" style={{ color: 'var(--navy-450)' }}>
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--navy-300)' }} />
                <span>Row Level Security (RLS)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--navy-300)' }} />
                <span>No password storage on our servers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--navy-300)' }} />
                <span>Isolated user data partitions</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--navy-800)' }}>

          {/* Technical Head */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/adarsh_karpe.jpg"
              alt="Adarsh Karpe"
              width={32}
              height={32}
              className="rounded-full object-cover object-top"
              style={{ outline: '2px solid var(--navy-600)', outlineOffset: '1px' }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">Adarsh Karpe</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                  style={{ background: 'var(--navy-600)' }}>
                  Technical Head
                </span>
              </div>
              <span className="text-[10px]" style={{ color: 'var(--navy-450)' }}>LoanFit AI Platform</span>
            </div>
          </div>

          <p className="text-[11px]" style={{ color: 'var(--navy-450)' }}>
            &copy; {new Date().getFullYear()} LoanFit AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
