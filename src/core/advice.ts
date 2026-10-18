// The trainer's advice for a position: which field is the goal, which dice to keep, what each field would bring and
// the chances behind it. The trainer looks at one turn (at most two more throws and one field), not at the whole game:
// a field is worth what it brings above what that field brings on average (its "par"), so that a Chance with 20
// points is not better than fours with 14 only because 20 is more.
import { evaluate, heldCount } from "./engine.ts";
import { ringsOf, treeOf, type Ring, type Tree } from "./odds.ts";
import { CATEGORIES, categoryOf, score, type Category } from "./scoring.ts";

/** What a field would bring in this turn. */
export interface Option {
  cat: string;
  /** The points the current dice score in it. */
  points: number;
  /** The points to expect when playing on as well as possible towards this field. */
  expected: number;
  /** The expected points minus the field's par: above 0 is better than usual. */
  surplus: number;
}

export interface Advice {
  /** The field the trainer aims for. */
  target: string;
  /** "hold": throw again, keeping `mask`; "score": enter the field now. */
  action: "hold" | "score";
  /** The dice to keep: bit i set for die i; 31 when `action` is "score". */
  mask: number;
  /** The fields still open, best first. */
  options: Option[];
  /** For each hold mask 0 to 30, and at index 31 for stopping now: the mean of the best field above its par to expect. */
  holdValues: number[];
  rings: Ring[];
  tree: Tree | null;
}

/** The number most of the kept dice show (the highest on a tie), or 0 when no die stays. */
function keptFace(dice: readonly number[], mask: number): number {
  const kept = dice.filter((_, at) => (mask >> at) % 2 === 1);
  let face = 0;
  let most = 0;
  for (let pip = 1; pip <= 6; pip++) {
    const count = kept.filter((die) => die === pip).length;
    if (count > 0 && count >= most) {
      face = pip;
      most = count;
    }
  }
  return face;
}

/** The advice for `dice` with `rollsLeft` throws left and the fields of `open` still free. */
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
  // the fields: what each brings when the trainer's advice is followed
  const options: Option[] = fields
    .map((field) => {
      const look = evaluate((set) => score(set, field), dice, rollsLeft);
      const expected = mask === 31 ? look.stop : (look.hold[mask] ?? look.stop);
      return { cat: field.id, points: look.stop, expected, surplus: expected - field.par };
    })
    .sort(
      (a, b) =>
        b.surplus - a.surplus ||
        CATEGORIES.findIndex((c) => c.id === a.cat) - CATEGORIES.findIndex((c) => c.id === b.cat),
    );
  const target = options[0]?.cat ?? "chance";
  const action = mask === 31 ? "score" : "hold";
  const field = categoryOf(target);
  const face = field.face ?? keptFace(dice, mask);
  const free = 5 - heldCount(mask);
  const simple =
    action === "hold" &&
    face > 0 &&
    free >= 1 &&
    (field.face !== undefined || field.id === "threeKind" || field.id === "fourKind" || field.id === "yahtzee");
  return {
    target,
    action,
    mask,
    options,
    holdValues: [...overall.hold, overall.stop],
    rings: simple ? ringsOf(free, rollsLeft) : [],
    tree: simple ? treeOf(face, free, rollsLeft) : null,
  };
}
