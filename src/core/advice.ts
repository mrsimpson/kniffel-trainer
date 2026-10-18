// The trainer's advice for a position: which field is the goal, which dice to keep, what each field would bring and
// the chances behind it. The trainer looks at one turn (at most two more throws and one field), not at the whole game:
// a field is worth what it brings above what that field brings on average (its "par"), so that a Chance with 20
// points is not better than fours with 14 only because 20 is more.
import { distribution, evaluate, heldCount, holdMean } from "./engine.ts";
import { percent } from "./fraction.ts";
import { ringsOf, treeOf, type Ring, type Tree } from "./odds.ts";
import { CATEGORIES, categoryOf, score, type Category } from "./scoring.ts";

/** What a field would bring in this turn. */
export interface Option {
  cat: string;
  /** The points the current dice score in it. */
  points: number;
  /** The points to expect on average when playing on as well as possible towards this field. */
  expected: number;
  /** The expected points minus the field's par: above 0 is better than usual. */
  surplus: number;
}

/** A bar of the spread: the points from `from` to `to` and how many of 100 tries end there. */
export interface Bar {
  from: number;
  to: number;
  share: number;
}

/** How the points of the goal field come out: the bars (the shares add up to 100) and the average. */
export interface Spread {
  bars: Bar[];
  mean: number;
}

/** All the throws of the free dice, as a table: the first die in the rows, the second in the columns. */
export interface Grid {
  /** The number of free dice, 1 or 2. */
  free: number;
  /** How many of the throws make the goal field score, and how many there are. */
  ok: number;
  total: number;
  /** For each throw whether it scores; one row for one free die. */
  rows: boolean[][];
}

/** The numbers 1 to 6 and how many of them are kept; `helps` marks the numbers that bring the goal closer. */
export interface Strip {
  faces: { face: number; held: number; helps: boolean }[];
}

/** What the dice kept bring: the goal they aim for, the fields compared, and the chances behind them. */
export interface Look {
  /** The dice kept: bit i set for die i. */
  mask: number;
  /** The dice that are thrown again. */
  free: number;
  /** The field the kept dice aim for; null when they fit none of the open fields. */
  target: string | null;
  /** The fields still open: the goal first, then the others the kept dice are on the way to, then the rest as on the sheet. */
  options: Option[];
  rings: Ring[];
  tree: Tree | null;
  /** How often which points come out in the goal field; null when nothing is thrown again. */
  spread: Spread | null;
  /** The throws of one or two free dice, when the goal is not "one more of a number" (a straight, a full house). */
  grid: Grid | null;
  /** The numbers held and the ones that help, for a straight or a full house. */
  strip: Strip | null;
}

export interface Advice extends Omit<Look, "target"> {
  /** The field the trainer aims for. */
  target: string;
  /** "hold": throw again, keeping `mask`; "score": enter the field now. */
  action: "hold" | "score";
  /** For each hold mask 0 to 30, and at index 31 for stopping now: the mean of the best field above its par to expect. */
  holdValues: number[];
}

/** How many dice show each pip, index 1 to 6. */
function countsOf(dice: readonly number[]): number[] {
  const found = [0, 0, 0, 0, 0, 0, 0];
  for (const die of dice) found[die] = (found[die] ?? 0) + 1;
  return found;
}

/** The number most of the kept dice show (the highest on a tie), or 0 when no die stays. */
function keptFace(kept: readonly number[]): number {
  const found = countsOf(kept);
  let face = 0;
  let most = 0;
  for (let pip = 1; pip <= 6; pip++) {
    if ((found[pip] ?? 0) > 0 && (found[pip] ?? 0) >= most) {
      face = pip;
      most = found[pip] ?? 0;
    }
  }
  return face;
}

/** How many of the kept dice are on the way to the field (0: none): a number held, a pair, a run of a straight. */
function uses(field: Category, kept: readonly number[]): number {
  if (kept.length === 0) return 0;
  const found = countsOf(kept);
  const most = Math.max(...found);
  const span = Math.max(...kept) - Math.min(...kept);
  const distinct = new Set(kept).size === kept.length;
  switch (field.id) {
    case "threeKind":
    case "fourKind":
    case "yahtzee":
      return most >= 2 ? most : 0;
    case "fullHouse":
      return most >= 2 ? found.filter((count) => count >= 2).reduce((total, count) => total + count, 0) : 0;
    case "smallStraight":
      return kept.length >= 2 && distinct && span <= 3 ? kept.length : 0;
    case "largeStraight":
      return kept.length >= 2 && distinct && span <= 4 ? kept.length : 0;
    case "chance":
      return 0;
    default:
      return field.face !== undefined ? (found[field.face] ?? 0) : 0;
  }
}

/** The kept dice need exactly one more of a number for the field: the chance is the tree's "one more". */
function needsOneMore(field: Category, kept: readonly number[]): boolean {
  const most = Math.max(0, ...countsOf(kept));
  if (field.face !== undefined) return kept.includes(field.face);
  return (
    (field.id === "threeKind" && most >= 2) ||
    (field.id === "fourKind" && most >= 3) ||
    (field.id === "yahtzee" && most >= 4)
  );
}

/** The throws of the `free` dice that make `field` score with the `kept` dice: how many, and as a table when it is small. */
function throwsOf(
  kept: readonly number[],
  free: number,
  field: Category,
): { ok: number; total: number; grid: Grid | null } {
  const total = 6 ** free;
  const rows: boolean[][] = free === 2 ? Array.from({ length: 6 }, () => []) : [[]];
  let ok = 0;
  for (let code = 0; code < total; code++) {
    const thrown: number[] = [];
    for (let rest = code, at = 0; at < free; at++, rest = Math.floor(rest / 6)) thrown.push((rest % 6) + 1);
    const scores = score([...kept, ...thrown], field) > 0;
    if (scores) ok++;
    // the first die is the one that changes slowest: it gives the row
    if (free <= 2) rows[free === 2 ? Math.floor(code / 6) : 0]?.push(scores);
  }
  return { ok, total, grid: free <= 2 ? { free, ok, total, rows } : null };
}

/** The numbers 1 to 6 with how many are kept and which ones help the goal (a run for a straight, a pair for a house). */
function stripOf(field: Category, kept: readonly number[]): Strip | null {
  if (field.id !== "smallStraight" && field.id !== "largeStraight" && field.id !== "fullHouse") return null;
  const found = countsOf(kept);
  return {
    faces: [1, 2, 3, 4, 5, 6].map((face) => ({
      face,
      held: found[face] ?? 0,
      helps:
        field.id === "fullHouse"
          ? (found[face] ?? 0) > 0
          : (found[face] ?? 0) === 0 && uses(field, [...kept, face]) === kept.length + 1,
    })),
  };
}

/** The bars of the points that come out: each value alone up to seven, else in steps of five. */
function spreadOf(found: Map<number, number>, mean: number): Spread {
  const values = [...found.keys()].sort((a, b) => a - b);
  const alone = values.length <= 7;
  const bars: Bar[] = [];
  for (const value of values) {
    const from = alone ? value : Math.floor(value / 5) * 5;
    const to = alone ? value : from + 4;
    const share = 100 * (found.get(value) ?? 0);
    const last = bars[bars.length - 1];
    if (last !== undefined && last.from === from) last.share += share;
    else bars.push({ from, to, share });
  }
  return { bars, mean };
}

/** What the dice kept (bit mask `mask`) bring with `rollsLeft` throws left and the fields of `open` still free. */
export function lookAt(dice: readonly number[], mask: number, rollsLeft: number, open: readonly string[]): Look {
  const fields: Category[] = open.map(categoryOf);
  const kept = dice.filter((_, at) => (mask >> at) % 2 === 1);
  const free = 5 - heldCount(mask);
  const options: Option[] = fields.map((field) => {
    const payoff = (set: readonly number[]): number => score(set, field);
    const expected = holdMean(payoff, dice, mask, rollsLeft);
    return { cat: field.id, points: payoff(dice), expected, surplus: expected - field.par };
  });
  const order = (id: string): number => CATEGORIES.findIndex((c) => c.id === id);
  const better = (a: Option, b: Option): number => b.surplus - a.surplus || order(a.cat) - order(b.cat);
  const sorted = [...options].sort(better);
  const used = (option: Option): number => uses(categoryOf(option.cat), kept);
  // the goal is the field the most kept dice are on the way to; of equal ones the best above its par
  const fitting = options.filter((option) => used(option) > 0).sort((a, b) => used(b) - used(a) || better(a, b));
  const fallback = options.find((option) => option.cat === "chance");
  const goal = kept.length === 0 ? undefined : free === 0 ? sorted[0] : (fitting[0] ?? fallback);
  // the list: the goal, the other fields the kept dice are on the way to, then the rest in the order of the sheet
  const first = goal === undefined ? [] : [goal, ...fitting.filter((option) => option.cat !== goal.cat)];
  const listed = [...first, ...options.filter((option) => !first.includes(option))];
  const target = goal?.cat ?? null;
  const field = target === null ? null : categoryOf(target);
  const throwing = rollsLeft > 0 && free > 0;
  const face = field === null ? 0 : (field.face ?? keptFace(kept));
  const simple = throwing && field !== null && face > 0 && needsOneMore(field, kept);
  const payoff = (set: readonly number[]): number => (field === null ? 0 : score(set, field));
  // a goal that is not "one more of a number": the chance that it scores at all
  const goalRings: Ring[] = [];
  let grid: Grid | null = null;
  if (throwing && field !== null && !simple && field.id !== "chance") {
    const one = throwsOf(kept, free, field);
    grid = one.grid;
    goalRings.push({
      id: "one",
      percent: percent({ n: one.ok, d: one.total }),
      fraction: { n: one.ok, d: one.total },
      goal: true,
    });
    if (rollsLeft >= 2) {
      const twice = distribution((set) => (score(set, field) > 0 ? 1 : 0), dice, mask, rollsLeft).get(1) ?? 0;
      goalRings.push({ id: "two", percent: Math.round(100 * twice), goal: true });
    }
  }
  return {
    mask,
    free,
    target,
    options: listed,
    rings: simple ? ringsOf(free, rollsLeft) : goalRings,
    tree: simple ? treeOf(face, free, rollsLeft) : null,
    spread:
      throwing && goal !== undefined ? spreadOf(distribution(payoff, dice, mask, rollsLeft), goal.expected) : null,
    grid,
    strip: throwing && field !== null && !simple ? stripOf(field, kept) : null,
  };
}

/** The advice for `dice` with `rollsLeft` throws left and the fields of `open` still free: the best dice to keep. */
export function adviseFor(dice: readonly number[], rollsLeft: number, open: readonly string[]): Advice {
  const fields: Category[] = open.map(categoryOf);
  const surplusOf = (set: readonly number[]): number =>
    Math.max(...fields.map((field) => score(set, field) - field.par));
  // which dice to keep: the hold with the best mean of "the best field above its par" after the throw
  const overall = evaluate(surplusOf, dice, rollsLeft);
  let mask = 31;
  if (rollsLeft > 0) {
    let bestValue = overall.stop;
    for (let at = 0; at < 31; at++) {
      const value = overall.hold[at] ?? 0;
      if (
        value > bestValue + 1e-9 ||
        (Math.abs(value - bestValue) <= 1e-9 && mask !== 31 && heldCount(at) > heldCount(mask))
      ) {
        bestValue = value;
        mask = at;
      }
    }
  }
  const look = lookAt(dice, mask, rollsLeft, open);
  return {
    ...look,
    target: look.target ?? look.options[0]?.cat ?? "chance",
    action: mask === 31 ? "score" : "hold",
    holdValues: [...overall.hold, overall.stop],
  };
}
