// Exact fractions for the chances: whole numbers n/d in lowest terms, so that the app shows 11/36 and never 0.3055.

/** A fraction n/d of whole numbers, in lowest terms, d > 0. */
export interface Frac {
  n: number;
  d: number;
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** The fraction n/d in lowest terms. */
export function frac(n: number, d: number): Frac {
  const g = gcd(n, d) || 1;
  return { n: n / g, d: d / g };
}

export const ONE: Frac = { n: 1, d: 1 };

export const times = (a: Frac, b: Frac): Frac => frac(a.n * b.n, a.d * b.d);
export const plus = (a: Frac, b: Frac): Frac => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const minus = (a: Frac, b: Frac): Frac => frac(a.n * b.d - b.n * a.d, a.d * b.d);
export const equal = (a: Frac, b: Frac): boolean => a.n * b.d === b.n * a.d;

/** `base` to the power `count` (a whole number from 0). */
export function power(base: Frac, count: number): Frac {
  let result = ONE;
  for (let at = 0; at < count; at++) result = times(result, base);
  return result;
}

/** The text of a fraction as learners write it: "11/36", "1" for a whole. */
export const text = (value: Frac): string => (value.d === 1 ? String(value.n) : `${value.n}/${value.d}`);

/** The percentage, rounded to a whole number. */
export const percent = (value: Frac): number => Math.round((100 * value.n) / value.d);

/** A fraction typed by a learner ("1/6", "2/12", "1" or with spaces), or undefined if it is none. */
export function parse(input: string): Frac | undefined {
  const match = /^\s*(\d{1,6})\s*(?:\/\s*(\d{1,6}))?\s*$/.exec(input);
  if (match === null) return undefined;
  const n = Number(match[1]);
  const d = match[2] === undefined ? 1 : Number(match[2]);
  return d === 0 ? undefined : frac(n, d);
}
