// The chance engine: what five dice are worth when they may be thrown again, found by trying every outcome.
// A hold is a bit mask over the five dice (bit i set: die i stays); the dice that do not stay are thrown again.
// The value of a position with rolls left is the best of stopping (the payoff of the dice) and of every hold
// (the mean of the values after the throw); it is found by counting over the 252 distinct sets of dice.

/** A payoff: what a final set of five dice is worth (points, or 1 for "the field scores"). */
export type Payoff = (dice: readonly number[]) => number;

/** An outcome of throwing `count` dice: the pips in order, and how many of the 6^count throws give it. */
interface Outcome {
  dice: number[];
  ways: number;
}

const ALL_HELD = 31;

/** The distinct sets of `count` dice (as sorted pips) with the number of throws that give each. */
function outcomesOf(count: number): Outcome[] {
  const ways = new Map<string, Outcome>();
  const throws = 6 ** count;
  for (let code = 0; code < throws; code++) {
    const dice: number[] = [];
    let rest = code;
    for (let at = 0; at < count; at++) {
      dice.push((rest % 6) + 1);
      rest = Math.floor(rest / 6);
    }
    dice.sort((a, b) => a - b);
    const key = dice.join("");
    const found = ways.get(key);
    if (found === undefined) ways.set(key, { dice, ways: 1 });
    else found.ways += 1;
  }
  return [...ways.values()];
}

const OUTCOMES: readonly (readonly Outcome[])[] = Array.from({ length: 6 }, (_, count) => outcomesOf(count));

/** The dice that stay for `mask`. */
const keptOf = (dice: readonly number[], mask: number): number[] => dice.filter((_, at) => (mask >> at) % 2 === 1);

/** The number of dice that stay for `mask`. */
export const heldCount = (mask: number): number => [0, 1, 2, 3, 4].filter((at) => (mask >> at) % 2 === 1).length;

/** What a position is worth: stopping now, holding as `mask` says, and the best of both. */
export interface Evaluation {
  /** The payoff of stopping with these dice. */
  stop: number;
  /** For each hold mask 0 to 30: the mean payoff after throwing the other dice, then playing on as well as possible. */
  hold: number[];
  best: number;
}

/**
 * The value of the dice with `rollsLeft` throws left for the payoff: stopping now, each hold, and the best of both.
 * With no throw left only stopping remains.
 */
export function evaluate(payoff: Payoff, dice: readonly number[], rollsLeft: number): Evaluation {
  const memory = new Map<string, number>();
  /** The value of a sorted set of dice with `left` throws left. */
  const value = (sorted: readonly number[], left: number): number => {
    const stop = payoff(sorted);
    if (left === 0) return stop;
    const key = `${left}:${sorted.join("")}`;
    const known = memory.get(key);
    if (known !== undefined) return known;
    let best = stop;
    for (let mask = 0; mask < ALL_HELD; mask++) best = Math.max(best, holdValue(sorted, mask, left));
    memory.set(key, best);
    return best;
  };
  /** The mean value after throwing the dice that do not stay, with `left` throws left now. */
  const holdValue = (position: readonly number[], mask: number, left: number): number => {
    const kept = keptOf(position, mask);
    const free = position.length - kept.length;
    let total = 0;
    for (const outcome of OUTCOMES[free] ?? []) {
      const next = [...kept, ...outcome.dice].sort((a, b) => a - b);
      total += outcome.ways * value(next, left - 1);
    }
    return total / 6 ** free;
  };
  const stop = payoff(dice);
  if (rollsLeft === 0) return { stop, hold: Array.from({ length: ALL_HELD }, () => stop), best: stop };
  const hold = Array.from({ length: ALL_HELD }, (_, mask) => holdValue(dice, mask, rollsLeft));
  return { stop, hold, best: Math.max(stop, ...hold) };
}
