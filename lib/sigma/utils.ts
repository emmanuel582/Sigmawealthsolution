import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number into Nigerian Naira currency format (₦X,XXX.XX or ₦X,XXX)
 */
export function formatNaira(amount: number | string | undefined | null, includeDecimals = false): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₦0';
  }
  const numeric = Number(amount);
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(numeric).replace('NGN', '₦').trim();
}

/**
 * Format a date string into readable text (e.g. 15 Oct 2026, 09:30 AM)
 */
export function formatDate(dateString: string | Date | undefined | null, includeTime = false): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    };
    return new Intl.DateTimeFormat('en-GB', options).format(d);
  } catch {
    return String(dateString);
  }
}

/**
 * Mask credit card numbers
 */
export function maskCardNumber(last4: string, brand = 'Card'): string {
  return `${brand.toUpperCase()} •••• ${last4}`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '—';
  return phone;
}

/** Get user initials from name or email */
export function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }
  if (email) return email.substring(0, 2).toUpperCase();
  return 'AC';
}
