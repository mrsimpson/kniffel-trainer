<script setup lang="ts">
// The five dice and the throw button with the throws left. A die is a button that holds or releases it; the dice
// the joker's solution (level 3) would keep are marked with a dashed frame; the coach never marks any.
import { computed } from "vue";
import { translator } from "@lernapps/tooling/i18n";
import type { Input } from "@lernapps/app-templates/interactive";
import type { State } from "../core/index.ts";
import de from "../messages/de.json";
import en from "../messages/en.json";

const props = defineProps<{ state: State; lang: string }>();
const emit = defineEmits<{ input: [input: Input] }>();
const t = computed(() => (props.lang === "en" ? translator(en, "en-US") : translator(de)));

/** The pips of a die as grid cells (row/column of a 3 × 3 grid). */
const PIPS: Record<number, string[]> = {
  1: ["2/2"],
  2: ["1/1", "3/3"],
  3: ["1/1", "2/2", "3/3"],
  4: ["1/1", "1/3", "3/1", "3/3"],
  5: ["1/1", "1/3", "2/2", "3/1", "3/3"],
  6: ["1/1", "2/1", "3/1", "1/3", "2/3", "3/3"],
};
const TILT = [-3, 2, -1, 4, -5];
const thrown = computed(() => props.state.rollsLeft < 3);
const canHold = computed(() => thrown.value && props.state.rollsLeft > 0);
const advised = (at: number): boolean =>
  props.state.advice !== null && props.state.advice.action === "hold" && (props.state.advice.mask >> at) % 2 === 1;
const showAdvice = computed(() => props.state.route === "joker" && props.state.joker.level === 3);
const label = (at: number): string => {
  const die = props.state.dice[at] ?? 0;
  if (!thrown.value) return t.value("dieEmpty", { n: at + 1 });
  return t.value(props.state.held[at] ? "dieHeld" : "dieFree", { n: at + 1, pips: die });
};
</script>

<template>
  <div class="kt-dice">
    <div class="kt-row" role="group" :aria-label="t('dice')">
      <button
        v-for="(die, at) in state.dice"
        :key="`${at}-${state.rollsLeft}-${state.round}`"
        type="button"
        :class="['kt-die', { advised: advised(at) && showAdvice, rolled: thrown && !state.held[at] }]"
        :style="{ '--r': `${TILT[at]}deg` }"
        :aria-pressed="state.held[at]"
        :aria-label="label(at)"
        :data-held="t('held')"
        :disabled="!canHold"
        @click="emit('input', { kind: 'action', name: 'hold', value: at })"
      >
        <i v-for="cell in PIPS[die] ?? []" :key="cell" :style="{ gridArea: cell }"></i>
      </button>
    </div>
    <div class="kt-roll">
      <button
        type="button"
        class="kt-rollbtn"
        :disabled="state.rollsLeft === 0"
        @click="emit('input', { kind: 'action', name: 'roll' })"
      >
        {{ thrown ? t("rollAgain") : t("rollFirst") }}
      </button>
      <div class="kt-pips" role="img" :aria-label="t('rollsLeft', { count: state.rollsLeft })">
        <span v-for="n in 3" :key="n" :class="{ used: n <= 3 - state.rollsLeft }"></span>
      </div>
    </div>
  </div>
</template>
