import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Currency = 'CAD' | 'USD';

export const EXCHANGE_RATES = {
  USD_TO_CAD: 1.44,
  CAD_TO_USD: 1 / 1.44,
} as const;

export const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
  if (from === to) return amount;
  return from === 'USD' 
    ? amount * EXCHANGE_RATES.USD_TO_CAD 
    : amount * EXCHANGE_RATES.CAD_TO_USD;
};
