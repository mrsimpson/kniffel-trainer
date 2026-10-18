// The game's logic: Kniffel (Yahtzee) in three modes (routes): "erklaeren" with the coach, "joker" with a joker that
// builds the probability tree and feedback on every move, "spielen" without help. A game has the short form (the six
// upper fields, 6 rounds) or the whole sheet (13 rounds). Dice come from the seed. Pure TypeScript without DOM; the
// runtime keeps the state and calls start and step (@lernapps/app-templates/interactive); nothing here moves on its own.
import type { Input } from "@lernapps/app-templates/interactive";
import { adviseFor, type Advice } from "./advice.ts";
import { equal, parse } from "./fraction.ts";
import { BONUS_FROM, BONUS_POINTS, CATEGORIES, UPPER_COUNT, categoryOf, score } from "./scoring.ts";

export { CATEGORIES, categoryOf } from "./scoring.ts";

/** What the player's last move was worth, for the feedback of the coach and the joker. */
export type Last =
  | {
      kind: "score";
      cat: string;
      points: number;
      best: string;
      bestPoints: number;
      verdict: "best" | "good" | "better";
    }
  | { kind: "hold"; held: number; verdict: "good" | "better"; mask: number; lost: number };

export interface Answer {
  text: string;
  ok: boolean;
}

export interface State {
  seed: number;
  route: string;
  /** The state of the dice generator. */
  rng: number;
  /** "setup": choose the length; "play"; "paused"; "done". */
  phase: "setup" | "play" | "paused" | "done";
  /** 6 for the short game (upper half), 13 for the whole sheet. */
  size: 6 | 13;
  /** The round being played, from 1. */
  round: number;
  /** The five dice, 0 before the first throw of the round. */
  dice: number[];
  held: boolean[];
  /** Throws left in this round, 3 at its start. */
  rollsLeft: number;
  /** The points entered per field, null while open. */
  sheet: Record<string, number | null>;
  upper: number;
  bonus: number;
  total: number;
  advice: Advice | null;
  last: Last | null;
  /** The coach's view and the step of its explanation. */
  coachView: "odds" | "how";
  coachStep: 1 | 2;
  /** The joker: 0 not asked this round, else the level (1 empty tree, 2 branches filled, 3 solution). */
  joker: { level: 0 | 1 | 2 | 3; answers: Record<string, Answer> };
}

const MODES = ["erklaeren", "joker", "spielen"];

/** A random number from 0 to 1 and the next generator state (mulberry32). */
function random(rng: number): { value: number; rng: number } {
  const next = (rng + 0x6d2b79f5) >>> 0;
  let mixed = Math.imul(next ^ (next >>> 15), 1 | next);
  mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
  return { value: ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296, rng: next };
}

const emptySheet = (): Record<string, number | null> => Object.fromEntries(CATEGORIES.map((c) => [c.id, null]));

const ready = { level: 0 as const, answers: {} };

function newRound(state: State, round: number): State {
  return {
    ...state,
    round,
    dice: [0, 0, 0, 0, 0],
    held: [false, false, false, false, false],
    rollsLeft: 3,
    advice: null,
    coachView: "odds",
    coachStep: 1,
    joker: { ...ready },
  };
}

export function start(seed: number, route: string): State {
  return {
    seed,
    route: MODES.includes(route) ? route : "erklaeren",
    rng: seed >>> 0,
    phase: "setup",
    size: 6,
    round: 1,
    dice: [0, 0, 0, 0, 0],
    held: [false, false, false, false, false],
    rollsLeft: 3,
    sheet: emptySheet(),
    upper: 0,
    bonus: 0,
    total: 0,
    advice: null,
    last: null,
    coachView: "odds",
    coachStep: 1,
    joker: { ...ready },
  };
}

/** The fields of this game: the upper ones for the short game, all for the whole sheet. */
export const fieldsOf = (size: number): string[] =>
  CATEGORIES.slice(0, size === 6 ? UPPER_COUNT : undefined).map((c) => c.id);

const openFields = (state: State): string[] => fieldsOf(state.size).filter((id) => state.sheet[id] === null);

const maskOf = (held: readonly boolean[]): number => held.reduce((mask, on, at) => mask + (on ? 2 ** at : 0), 0);

/** Throws the dice that are not held. */
function roll(state: State): State {
  if (state.rollsLeft === 0) return state;
  let rng = state.rng;
  const dice = state.dice.map((die, at) => {
    if (state.rollsLeft < 3 && state.held[at]) return die;
    const next = random(rng);
    rng = next.rng;
    return 1 + Math.floor(next.value * 6);
  });
  const rollsLeft = state.rollsLeft - 1;
  let last = state.last;
  if (state.advice !== null && state.rollsLeft < 3) {
    const mask = maskOf(state.held);
    const best = state.advice.holdValues[state.advice.mask] ?? 0;
    const chosen = state.advice.holdValues[mask] ?? 0;
    const lost = Math.max(0, best - chosen);
    last = {
      kind: "hold",
      held: state.held.filter(Boolean).length,
      verdict: lost >= 0.6 ? "better" : "good",
      mask: state.advice.mask,
      lost: Math.round(lost * 10) / 10,
    };
  }
  const next: State = { ...state, rng, dice, rollsLeft, last, joker: { ...ready }, coachView: "odds", coachStep: 1 };
  return { ...next, advice: advice(next) };
}

/** The trainer's advice for the dice of the state (none in the game without help). */
function advice(state: State): Advice | null {
  if (state.route === "spielen" || state.dice[0] === 0) return null;
  return adviseFor(state.dice, state.rollsLeft, openFields(state));
}

/** Enters the points of the dice in the field and goes on to the next round, or ends the game. */
function enter(state: State, cat: string): State {
  if (state.dice[0] === 0 || state.sheet[cat] !== null || !fieldsOf(state.size).includes(cat)) return state;
  const field = categoryOf(cat);
  const points = score(state.dice, field);
  const open = openFields(state);
  const surplus = (id: string): number => score(state.dice, categoryOf(id)) - categoryOf(id).par;
  const best = open.reduce((a, b) => (surplus(b) > surplus(a) ? b : a), cat);
  const chosenSurplus = surplus(cat);
  const verdict: "best" | "good" | "better" =
    chosenSurplus >= surplus(best) ? "best" : surplus(best) - chosenSurplus <= 2.5 ? "good" : "better";
  const sheet = { ...state.sheet, [cat]: points };
  const upper = CATEGORIES.filter((c) => c.part === "upper").reduce((total, c) => total + (sheet[c.id] ?? 0), 0);
  const bonus =
    upper >= BONUS_FROM &&
    fieldsOf(state.size).filter((id) => sheet[id] === null && categoryOf(id).part === "upper").length === 0
      ? BONUS_POINTS
      : 0;
  const total = fieldsOf(state.size).reduce((sum, id) => sum + (sheet[id] ?? 0), 0) + bonus;
  const last: Last = { kind: "score", cat, points, best, bestPoints: score(state.dice, categoryOf(best)), verdict };
  const moved: State = { ...state, sheet, upper, bonus, total, last: state.route === "spielen" ? null : last };
  if (state.round >= state.size) return { ...moved, phase: "done", advice: null, joker: { ...ready } };
  return newRound(moved, state.round + 1);
}

/** The joker's answers: what the learner typed for `field` is right when it equals the fraction the tree shows. */
function answer(state: State, field: string, typed: string): State {
  const tree = state.advice?.tree ?? null;
  if (tree === null || state.joker.level === 0) return state;
  const expected: Record<string, ReturnType<typeof parse>> = {
    hit: tree.hit,
    miss: tree.miss,
    path: tree.leaves[1]?.product,
    sum: tree.hitSum,
  };
  if (!(field in expected)) return state;
  const want = expected[field];
  const given = parse(typed);
  const ok = given !== undefined && want !== undefined && equal(given, want);
  return { ...state, joker: { ...state.joker, answers: { ...state.joker.answers, [field]: { text: typed, ok } } } };
}

const key = (input: Input): string => (input.kind === "key" ? input.key : "");
const action = (input: Input): string => (input.kind === "action" ? input.name : "");
const value = (input: Input): unknown => (input.kind === "action" ? input.value : undefined);

export function step(state: State, input: Input): State {
  const name = action(input);
  const pressed = key(input);
  if (state.phase === "done") {
    return name === "again" || pressed === "Enter" ? { ...start(state.seed + 1, state.route) } : state;
  }
  if (state.phase === "setup") {
    if (name === "size" && (value(input) === 6 || value(input) === 13)) {
      return newRound({ ...state, phase: "play", size: value(input) === 13 ? 13 : 6 }, 1);
    }
    return state;
  }
  if (state.phase === "paused") {
    if (name === "resume" || pressed === "Escape") return { ...state, phase: "play" };
    if (name === "quit") return { ...start(state.seed + 1, state.route) };
    return state;
  }
  if (name === "pause" || pressed === "Escape") return { ...state, phase: "paused" };
  if (name === "roll" || pressed === " " || pressed === "r" || pressed === "R") return roll(state);
  const holdKey = /^[1-5]$/.test(pressed)
    ? Number(pressed) - 1
    : name === "hold" && typeof value(input) === "number"
      ? Number(value(input))
      : -1;
  if (holdKey >= 0 && holdKey <= 4) {
    if (state.rollsLeft === 3 || state.rollsLeft === 0) return state;
    return { ...state, held: state.held.map((on, at) => (at === holdKey ? !on : on)) };
  }
  if (name === "score" && typeof value(input) === "string") return enter(state, String(value(input)));
  if (name === "joker" && state.route === "joker" && state.advice !== null) {
    const level = value(input);
    return level === 1 || level === 2 || level === 3 ? { ...state, joker: { ...state.joker, level } } : state;
  }
  if (name === "answer" && typeof value(input) === "object" && value(input) !== null) {
    const given = value(input) as { field?: unknown; text?: unknown };
    return typeof given.field === "string" && typeof given.text === "string"
      ? answer(state, given.field, given.text)
      : state;
  }
  if (name === "coachView" && state.route === "erklaeren" && (value(input) === "odds" || value(input) === "how")) {
    return { ...state, coachView: value(input) === "how" ? "how" : "odds" };
  }
  if (name === "coachStep" && (value(input) === 1 || value(input) === 2))
    return { ...state, coachStep: value(input) === 2 ? 2 : 1 };
  return state;
}
