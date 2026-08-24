'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { ShieldCheck, LogOut, User, LayoutDashboard, FileText, Menu, X, SlidersHorizontal } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email });
        } else {
          setUser(null);
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email });
          } else {
            setUser(null);
          }
        });

        setLoading(false);
        return () => subscription.unsubscribe();
      } else {
        // Fallback for local demo mode if Supabase env is not yet entered
        const demoUser = typeof window !== 'undefined' ? localStorage.getItem('loanfit_demo_user') : null;
        if (demoUser) {
          try {
            setUser(JSON.parse(demoUser));
          } catch {
            setUser(null);
          }
        }
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('loanfit_demo_user');
      }
    }
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-900 block leading-tight">
              LoanFit <span className="text-blue-600">AI</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
              Fintech Intelligence
            </span>
          </div>
        </Link>

        {/* Center Floating Pill Navigation */}
        <nav className="hidden md:flex items-center bg-slate-100/90 p-1.5 rounded-full border border-slate-200/60 shadow-inner">
          <Link
            href="/"
            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              pathname === '/'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
          </Link>
          {user && (
            <>
              <Link
                href="/dashboard"
                className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  pathname === '/dashboard'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  pathname.startsWith('/profile')
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Profile Setup
              </Link>
              <Link
                href="/compare"
                className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  pathname === '/compare'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Compare Loans
              </Link>
              <Link
                href="/recommendations"
                className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  pathname === '/recommendations'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Recommendations
              </Link>
            </>
          )}
          <Link
            href="/#how-it-works"
            className="px-5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all"
          >
            How it Works
          </Link>
        </nav>

        {/* Auth CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-full" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                title={user.email}
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="max-w-[120px] truncate">{user.email || 'My Account'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-full hover:bg-slate-100 transition-all"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold px-5 py-2.5 rounded-full shadow-sm hover:shadow hover:scale-[1.02] transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-900 rounded-lg focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Home
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Borrower Profile
              </Link>
              <Link
                href="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Compare Loans
              </Link>
              <Link
                href="/recommendations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Recommendations (MCDA)
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out ({user.email})
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full border border-slate-300 text-sm font-medium text-slate-700"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
