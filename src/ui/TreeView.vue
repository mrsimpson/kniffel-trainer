<script setup lang="ts">
// A probability tree drawn from the tree of the core: which dice show the number (hit) or not (miss), the chance at
// each branch and the chance of each way. What is not revealed shows a question mark, so that the joker can ask the
// learner to fill it in.
import { computed } from "vue";
import { translator } from "@lernapps/tooling/i18n";
import { text as fractionText } from "../core/fraction.ts";
import type { Tree } from "../core/odds.ts";
import de from "../messages/de.json";
import en from "../messages/en.json";
import { layoutOf } from "./treeLayout.ts";

const props = defineProps<{
  tree: Tree;
  lang: string;
  /** Which chances show their value: the branch of a hit, of a miss, and the results of the ways. */
  reveal: { hit: boolean; miss: boolean; results: boolean };
}>();
const t = computed(() => (props.lang === "en" ? translator(en, "en-US") : translator(de)));
const layout = computed(() => layoutOf(props.tree));
/** The levels that get a heading "n. die": for the full tree only, so that the headings do not crowd. */
const heads = computed(() => (props.tree.kind === "full" ? layout.value.columns : layout.value.columns.slice(0, 1)));
const shown = (hit: boolean): boolean => (hit ? props.reveal.hit : props.reveal.miss);
const resultText = (factors: { n: number; d: number }[], product: { n: number; d: number }): string =>
  factors.length <= 2
    ? `${factors.map(fractionText).join("×")} = ${fractionText(product)}`
    : `= ${fractionText(product)}`;
</script>

<template>
  <svg
    class="tree"
    :viewBox="`0 0 ${layout.width} ${layout.height}`"
    role="img"
    :aria-label="t('treeLabel', { face: tree.face, free: tree.free })"
  >
    <text v-for="(x, at) in heads" :key="`h${at}`" :x="x" y="16" class="th">{{ t("treeDie", { n: at + 1 }) }}</text>
    <text x="300" y="16" class="th">{{ t("treeWay") }}</text>
    <path
      v-for="(edge, at) in layout.edges"
      :key="`e${at}`"
      class="e"
      :d="`M${edge.from.x} ${edge.from.y} L${edge.to.x} ${edge.to.y}`"
    />
    <g
      v-for="(edge, at) in layout.edges"
      :key="`p${at}`"
      :class="['pill', edge.hit ? 'y' : '', shown(edge.hit) ? '' : 'q']"
    >
      <rect :x="edge.middle.x - 17" :y="edge.middle.y - 10" width="34" height="20" rx="6" />
      <text :x="edge.middle.x" :y="edge.middle.y + 4">{{ shown(edge.hit) ? fractionText(edge.chance) : "?" }}</text>
    </g>
    <circle class="root" :cx="layout.root.x - 2" :cy="layout.root.y" r="7" />
    <g v-for="(node, at) in layout.nodes" :key="`n${at}`" class="node">
      <rect :x="node.x - 12" :y="node.y - 14" width="24" height="28" rx="6" />
      <text :x="node.x" :y="node.y + 6">{{ node.label }}</text>
    </g>
    <g
      v-for="(result, at) in layout.results"
      :key="`r${at}`"
      :class="['res', reveal.results ? (result.leaf.hit ? 'win' : 'lose') : 'ask']"
    >
      <rect x="246" :y="result.y - 14" width="108" height="28" rx="8" />
      <text x="300" :y="result.y + 5">
        {{ reveal.results ? resultText(result.leaf.factors, result.leaf.product) : "?" }}
      </text>
    </g>
  </svg>
</template>
