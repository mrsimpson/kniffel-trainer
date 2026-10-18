// The chances the coach shows when learners keep dice of one number: rings (the chance in percent, as a fraction when
// there is a simple one) and the probability tree they come from. All of it is counted exactly with fractions.
import { frac, minus, ONE, percent, plus, power, times, type Frac } from "./fraction.ts";

/** A chance the coach shows: its percentage and, where a simple calculation gives it, the exact fraction. */
export interface Ring {
  /** "one": one more of the number in the next throw; "two": in two throws; "all": every free die shows it. */
  id: "one" | "two" | "all";
  percent: number;
  fraction?: Frac;
}

/** A way through the tree: for each free die whether it shows the number (H) or not (M), with its probabilities. */
export interface Leaf {
  steps: ("H" | "M")[];
  factors: Frac[];
  product: Frac;
  /** Whether at least one die shows the number on this way. */
  hit: boolean;
}

/** The probability tree for "at least one more die shows the number" in the next throw of the free dice. */
export interface Tree {
  face: number;
  /** The number of free dice. */
  free: number;
  /** "full": every die branches (up to two dice); "ladder": a way ends at the first hit (three dice or more). */
  kind: "full" | "ladder";
  hit: Frac;
  miss: Frac;
  leaves: Leaf[];
  /** The sum of the ways with a hit. */
  hitSum: Frac;
  /** The chance that no free die shows the number: the way of all misses. */
  missAll: Frac;
  /** With two throws left: no hit twice in a row, and the opposite. */
  again: { missTwice: Frac; hitTwice: Frac } | null;
}

const HIT = frac(1, 6);
const MISS = frac(5, 6);

/** The leaves of the full tree: every sequence of hits and misses of `free` dice. */
function fullLeaves(free: number): Leaf[] {
  let ways: Leaf[] = [{ steps: [], factors: [], product: ONE, hit: false }];
  for (let at = 0; at < free; at++) {
    ways = ways.flatMap((way) =>
      (["H", "M"] as const).map((step) => ({
        steps: [...way.steps, step],
        factors: [...way.factors, step === "H" ? HIT : MISS],
        product: times(way.product, step === "H" ? HIT : MISS),
        hit: way.hit || step === "H",
      })),
    );
  }
  return ways;
}

/** The leaves of the ladder: the first hit ends a way; the last leaf is the way of all misses. */
function ladderLeaves(free: number): Leaf[] {
  const leaves: Leaf[] = [];
  for (let at = 0; at < free; at++) {
    const misses = Array.from({ length: at }, () => MISS);
    leaves.push({
      steps: [...Array.from({ length: at }, () => "M" as const), "H"],
      factors: [...misses, HIT],
      product: times(power(MISS, at), HIT),
      hit: true,
    });
  }
  leaves.push({
    steps: Array.from({ length: free }, () => "M" as const),
    factors: Array.from({ length: free }, () => MISS),
    product: power(MISS, free),
    hit: false,
  });
  return leaves;
}

/** The tree for `free` dice (1 to 5) that may show `face`, with the second throw when `rollsLeft` is 2 or more. */
export function treeOf(face: number, free: number, rollsLeft: number): Tree {
  const kind = free <= 2 ? "full" : "ladder";
  const leaves = kind === "full" ? fullLeaves(free) : ladderLeaves(free);
  const missAll = power(MISS, free);
  const missTwice = times(missAll, missAll);
  return {
    face,
    free,
    kind,
    hit: HIT,
    miss: MISS,
    leaves,
    hitSum: leaves.filter((leaf) => leaf.hit).reduce((total, leaf) => plus(total, leaf.product), frac(0, 1)),
    missAll,
    again: rollsLeft >= 2 ? { missTwice, hitTwice: minus(ONE, missTwice) } : null,
  };
}

/** The rings for `free` dice that may show a number, with `rollsLeft` throws left (1 or more). */
export function ringsOf(free: number, rollsLeft: number): Ring[] {
  const oneThrow = minus(ONE, power(MISS, free));
  const rings: Ring[] = [{ id: "one", percent: percent(oneThrow), fraction: oneThrow }];
  if (rollsLeft >= 2) {
    const twoThrows = minus(ONE, power(times(MISS, MISS), free));
    rings.push({ id: "two", percent: percent(twoThrows), fraction: twoThrows });
    const all = power(minus(ONE, times(MISS, MISS)), free);
    rings.push({ id: "all", percent: percent(all), fraction: all });
  } else {
    const all = power(HIT, free);
    rings.push({ id: "all", percent: percent(all), fraction: all });
  }
  return rings;
}
