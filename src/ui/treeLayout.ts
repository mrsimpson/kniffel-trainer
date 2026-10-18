// The drawing of a probability tree: where its nodes, branches and result boxes go in a 360 × n picture. Pure
// arithmetic on the tree the core describes; the component only draws what this gives.
import type { Frac } from "../core/fraction.ts";
import type { Leaf, Tree } from "../core/odds.ts";

export interface Edge {
  from: { x: number; y: number };
  to: { x: number; y: number };
  middle: { x: number; y: number };
  chance: Frac;
  /** The branch of a hit (true) or a miss (false). */
  hit: boolean;
}

export interface Node {
  x: number;
  y: number;
  /** The pips of a hit, "–" for a miss. */
  label: string;
  hit: boolean;
}

export interface Result {
  y: number;
  leaf: Leaf;
}

export interface Layout {
  width: number;
  height: number;
  edges: Edge[];
  nodes: Node[];
  results: Result[];
  /** The x of each level of dice, from the first. */
  columns: number[];
  root: { x: number; y: number };
}

const WIDTH = 360;
const ROOT_X = 14;
const LAST_X = 214;
const TOP = 40;
const GAP = 68;

/** The layout of `tree`: the first leaf at the top, the branches of hits before those of misses. */
export function layoutOf(tree: Tree): Layout {
  const depth = Math.max(...tree.leaves.map((leaf) => leaf.steps.length));
  const column = (at: number): number => ROOT_X + (at * (LAST_X - ROOT_X)) / depth;
  const height = TOP + GAP * Math.max(tree.leaves.length - 1, 1) + 40;
  const leafY = new Map<string, number>();
  tree.leaves.forEach((leaf, at) => leafY.set(leaf.steps.join(""), TOP + at * GAP));
  /** The y of the node reached by `path`: that of its leaf, or the middle of its children. */
  const yOf = (path: string): number => {
    const own = leafY.get(path);
    if (own !== undefined) return own;
    const below = [...leafY.entries()].filter(([key]) => key.startsWith(path)).map(([, y]) => y);
    return (Math.min(...below) + Math.max(...below)) / 2;
  };
  const paths = new Set<string>();
  for (const leaf of tree.leaves)
    for (let at = 1; at <= leaf.steps.length; at++) paths.add(leaf.steps.slice(0, at).join(""));
  const firstY = [...paths].filter((path) => path.length === 1).map(yOf);
  const rootY = (Math.min(...firstY) + Math.max(...firstY)) / 2;
  const edges: Edge[] = [];
  const nodes: Node[] = [];
  for (const path of paths) {
    const parent = path.slice(0, -1);
    const from = { x: column(parent.length), y: parent === "" ? rootY : yOf(parent) };
    const hit = path.endsWith("H");
    const to = { x: column(path.length), y: yOf(path) };
    edges.push({
      from,
      to,
      middle: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 },
      chance: hit ? tree.hit : tree.miss,
      hit,
    });
    nodes.push({ ...to, label: hit ? String(tree.face) : "–", hit });
  }
  const results = tree.leaves.map((leaf, at) => ({ y: TOP + at * GAP, leaf }));
  const columns = Array.from({ length: depth }, (_, at) => column(at + 1));
  return { width: WIDTH, height, edges, nodes, results, columns, root: { x: ROOT_X, y: rootY } };
}
