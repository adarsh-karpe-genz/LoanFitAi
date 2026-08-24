import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as Indian Currency (INR / ₹)
 * Example: 3000000 -> ₹30,00,000
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a number with Indian thousand/lakh separators
 * Example: 3000000 -> 30,00,000
 */
export function formatNumberIndian(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN').format(value);
}

/**
 * Formats tenure in months to years/months display
 * Example: 240 -> "20 Years (240 months)"
 */
export function formatTenure(months: number | null | undefined): string {
  if (!months || months <= 0) return '—';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years > 0 && remainingMonths === 0) {
    return `${years} ${years === 1 ? 'Year' : 'Years'} (${months} mos)`;
  }
  if (years > 0) {
    return `${years} yr ${remainingMonths} mo (${months} mos)`;
  }
  return `${months} months`;
}

/**
 * Calculates Debt-to-Income / FOIR estimate (for informational UI)
 */
export function calculateFOIR(income: number, existingEmi: number): number {
  if (!income || income <= 0) return 0;
  return Math.min(100, Math.round((existingEmi / income) * 100));
}
