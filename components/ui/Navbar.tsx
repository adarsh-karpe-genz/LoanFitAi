'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Compare loans', href: '/compare' },
  { label: 'How it works', href: '/#how-it-works' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b flex items-center"
        style={{ background: 'color-mix(in srgb, var(--bg-surface) 95%, transparent)', backdropFilter: 'blur(16px)', borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: 'var(--navy-600)' }}>
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              LoanFit <span style={{ color: 'var(--navy-300)' }}>AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login"
              className="text-xs font-medium px-4 py-2 rounded-md transition-colors"
              style={{ color: 'var(--text-secondary)' }}>
              Sign in
            </Link>
            <Link href="/profile"
              className="text-xs font-semibold px-4 py-2 rounded-md text-white transition-colors"
              style={{ background: 'var(--navy-950)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--navy-800)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--navy-950)')}>
              Start assessment
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md"
            style={{ color: 'var(--text-secondary)' }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,42,0.4)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col p-6"
              style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.32 }}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  LoanFit <span style={{ color: 'var(--navy-300)' }}>AI</span>
                </span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>
              <nav className="flex flex-col gap-1 flex-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}
                    className="text-sm font-medium py-3 px-3 rounded-md"
                    style={{ color: 'var(--text-secondary)' }}
                    onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <Link href="/login" className="text-xs font-medium py-2.5 px-4 rounded-md text-center"
                  style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                  Sign in
                </Link>
                <Link href="/profile" className="text-xs font-semibold py-2.5 px-4 rounded-md text-center text-white"
                  style={{ background: 'var(--navy-950)' }}
                  onClick={() => setMobileOpen(false)}>
                  Start my assessment
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
