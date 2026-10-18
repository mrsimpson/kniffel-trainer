<script setup lang="ts">
// How the points of a goal field come out: 100 tries as bars, and the average they have. It shows what "on average"
// means: the points of all tries added up and shared among them.
import { computed } from "vue";
import { translator } from "@lernapps/tooling/i18n";
import type { Spread } from "../core/advice.ts";
import de from "../messages/de.json";
import en from "../messages/en.json";

const props = defineProps<{ spread: Spread; field: string; lang: string }>();
const t = computed(() => (props.lang === "en" ? translator(en, "en-US") : translator(de)));
const most = computed(() => Math.max(...props.spread.bars.map((bar) => bar.share)));
const share = (value: number): string => (value < 0.5 ? "<1" : String(Math.round(value)));
const points = (from: number, to: number): string =>
  from === to ? t.value("spreadPoints", { points: from }) : t.value("spreadRange", { from, to });
const mean = computed(() =>
  (Math.round(props.spread.mean * 10) / 10).toLocaleString(props.lang === "en" ? "en-US" : "de-DE"),
);
</script>

<template>
  <div class="kt-spread">
    <p class="kt-spread-intro">{{ t("spreadIntro", { field }) }}</p>
    <ul :aria-label="t('spreadLabel', { field })">
      <li v-for="bar in spread.bars" :key="bar.from">
        <span class="pts">{{ points(bar.from, bar.to) }}</span>
        <span class="bar" aria-hidden="true"><i :style="{ width: `${(100 * bar.share) / most}%` }"></i></span>
        <span class="n">{{ t("spreadShare", { n: share(bar.share) }) }}</span>
      </li>
    </ul>
    <p class="kt-spread-mean">{{ t("spreadMean", { points: mean }) }}</p>
  </div>
</template>
