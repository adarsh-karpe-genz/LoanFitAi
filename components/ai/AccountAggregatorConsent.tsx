'use client';

import React, { useState } from 'react';
import {
  AccountAggregatorConsentState,
} from '@/types/database';
import { formatINR } from '@/lib/utils';
import {
  ShieldCheck,
  Building2,
  Lock,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  X,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface AccountAggregatorConsentProps {
  isOpen: boolean;
  onClose: () => void;
  onConsentComplete?: (data: { verifiedIncome: number; verifiedEMI: number }) => void;
}

const SUPPORTED_FIP_BANKS = [
  { id: 'sbi', name: 'State Bank of India', shortName: 'SBI' },
  { id: 'hdfc', name: 'HDFC Bank', shortName: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', shortName: 'ICICI' },
  { id: 'axis', name: 'Axis Bank', shortName: 'Axis' },
  { id: 'bob', name: 'Bank of Baroda', shortName: 'BoB' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', shortName: 'Kotak' },
];

export default function AccountAggregatorConsent({
  isOpen,
  onClose,
  onConsentComplete,
}: AccountAggregatorConsentProps) {
  const [step, setStep] = useState<'SELECT_BANK' | 'OTP_AUTH' | 'CONSENT_SUMMARY' | 'SUCCESS'>('SELECT_BANK');
  const [selectedBanks, setSelectedBanks] = useState<string[]>(['sbi']);
  const [phoneNumber, setPhoneNumber] = useState<string>('9876543210');
  const [otp, setOtp] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleBank = (bankId: string) => {
    setSelectedBanks((prev) =>
      prev.includes(bankId) ? prev.filter((b) => b !== bankId) : [...prev, bankId]
    );
  };

  const handleSendOtp = () => {
    if (selectedBanks.length === 0) return;
    setStep('OTP_AUTH');
  };

  const handleVerifyOtp = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep('CONSENT_SUMMARY');
    }, 800);
  };

  const handleApproveConsent = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep('SUCCESS');
      if (onConsentComplete) {
        onConsentComplete({
          verifiedIncome: 62500,
          verifiedEMI: 5000,
        });
      }
    }, 1200);
  };

  const handleReset = () => {
    setStep('SELECT_BANK');
    setSelectedBanks(['sbi']);
    setOtp('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 text-xs">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-white flex items-center gap-1.5">
                <span>Account Aggregator Connect</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                  RBI Licensed (Sahamati)
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                100% Encrypted • View-Only • No Credentials Stored
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span className={step === 'SELECT_BANK' ? 'text-blue-600 font-bold' : ''}>1. Select Bank</span>
          <span>→</span>
          <span className={step === 'OTP_AUTH' ? 'text-blue-600 font-bold' : ''}>2. Mobile OTP</span>
          <span>→</span>
          <span className={step === 'CONSENT_SUMMARY' ? 'text-blue-600 font-bold' : ''}>3. Approve</span>
          <span>→</span>
          <span className={step === 'SUCCESS' ? 'text-emerald-600 font-bold' : ''}>4. Verified</span>
        </div>

        {/* Step 1: Bank Selection */}
        {step === 'SELECT_BANK' && (
          <div className="p-6 space-y-5">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                Select your primary salary or savings accounts
              </h4>
              <p className="text-slate-500">
                LoanFit AI will fetch your official bank statement (read-only) to automatically verify salary credits and existing debt obligations.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {SUPPORTED_FIP_BANKS.map((b) => {
                const isSelected = selectedBanks.includes(b.id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleBank(b.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 text-blue-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold">{b.shortName}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Net banking passwords or PINs are NEVER requested. Data is transferred via RBI Account Aggregator protocol.
              </span>
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={selectedBanks.length === 0}
              className="w-full py-3 rounded-full bg-slate-900 hover:bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition-colors shadow-sm"
            >
              <span>Continue to Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'OTP_AUTH' && (
          <div className="p-6 space-y-5">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                Authenticate Mobile Number with Sahamati AA
              </h4>
              <p className="text-slate-500">
                Enter the OTP sent to your Aadhaar/Bank-linked mobile number ending in <strong>...3210</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-slate-700 block">Enter 6-Digit OTP</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 block text-right">
                Demo OTP: Enter any 6 numbers
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('SELECT_BANK')}
                className="w-1/3 py-2.5 rounded-full border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otp.length < 4 || isVerifying}
                className="w-2/3 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition-colors shadow-sm"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Consent Artifact Review */}
        {step === 'CONSENT_SUMMARY' && (
          <div className="p-6 space-y-5">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                Review & Authorize Consent Terms
              </h4>
              <p className="text-slate-500">
                This consent artifact allows LoanFit AI to fetch verified statement cashflows.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 font-mono text-[11px]">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-sans">Financial Information Provider (FIP):</span>
                <span className="font-bold text-slate-900">{selectedBanks.map(b => b.toUpperCase()).join(', ')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-sans">Purpose of Fetch:</span>
                <span className="font-bold text-slate-900 font-sans">Loan Eligibility & Affordability</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-sans">Statement Range:</span>
                <span className="font-bold text-slate-900">Last 90 Days</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-sans">Consent Validity:</span>
                <span className="font-bold text-slate-900">Single Use (30 Days)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Data Encryption:</span>
                <span className="font-bold text-emerald-700 font-sans flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  256-bit TLS E2E
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('OTP_AUTH')}
                className="w-1/3 py-2.5 rounded-full border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleApproveConsent}
                disabled={isVerifying}
                className="w-2/3 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Fetching Encrypted Cashflow...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Fetch Statements</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Verification Success */}
        {step === 'SUCCESS' && (
          <div className="p-6 space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                Bank Data Verified via Account Aggregator!
              </h4>
              <p className="text-slate-500">
                We successfully retrieved and parsed your salary credits and recurring obligations.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-2">
              <span className="font-bold text-emerald-900 block text-xs">
                Auto-Extracted Cashflow Parameters:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Verified Salary Credit:</span>
                  <strong className="text-slate-900 font-mono text-sm">₹62,500/mo</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Existing Active EMIs:</span>
                  <strong className="text-slate-900 font-mono text-sm">₹5,000/mo</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm transition-colors"
            >
              Done & Update Recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
