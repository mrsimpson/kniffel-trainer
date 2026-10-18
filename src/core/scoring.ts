// The scoring of Kniffel (Yahtzee): the thirteen fields of the sheet and what five dice score in each.
import categories from "../data/categories.json" with { type: "json" };

/** A field of the sheet, as src/data/categories.json describes it. */
export interface Category {
  id: string;
  part: "upper" | "lower";
  /** The number of the upper fields: that many pips count. */
  face?: number;
  /** What the field scores on average in a game (a guess): the trainer compares a move with it. */
  par: number;
}

export const CATEGORIES: readonly Category[] = categories as readonly Category[];

export const BONUS_FROM = 63;
export const BONUS_POINTS = 35;
/** The fields of the short game: the upper half. */
export const UPPER_COUNT = 6;

/** The number of dice that show each pip, index 1 to 6. */
function counts(dice: readonly number[]): number[] {
  const found = [0, 0, 0, 0, 0, 0, 0];
  for (const die of dice) found[die] = (found[die] ?? 0) + 1;
  return found;
}

const sum = (dice: readonly number[]): number => dice.reduce((total, die) => total + die, 0);

/** The longest run of consecutive pips among the dice. */
function longestRun(found: readonly number[]): number {
  let best = 0;
  let run = 0;
  for (let pip = 1; pip <= 6; pip++) {
    run = (found[pip] ?? 0) > 0 ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

/** What `dice` (five numbers 1 to 6) score in the field `category`. */
export function score(dice: readonly number[], category: Category): number {
  const found = counts(dice);
  const most = Math.max(...found);
  switch (category.id) {
    case "threeKind":
      return most >= 3 ? sum(dice) : 0;
    case "fourKind":
      return most >= 4 ? sum(dice) : 0;
    case "fullHouse":
      return found.includes(3) && found.includes(2) ? 25 : 0;
    case "smallStraight":
      return longestRun(found) >= 4 ? 30 : 0;
    case "largeStraight":
      return longestRun(found) >= 5 ? 40 : 0;
    case "yahtzee":
      return most === 5 ? 50 : 0;
    case "chance":
      return sum(dice);
    default:
      return category.face === undefined ? 0 : (found[category.face] ?? 0) * category.face;
  }
}

/** The category with this id. */
export function categoryOf(id: string): Category {
  const found = CATEGORIES.find((category) => category.id === id);
  if (found === undefined) throw new Error(`no field ${id} in src/data/categories.json`);
  return found;
}
