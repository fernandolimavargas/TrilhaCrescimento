import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combina classes condicionais do Tailwind sem conflitos entre utilitários. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
