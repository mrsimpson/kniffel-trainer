<script setup lang="ts">
// The joker: the learner asks for it when stuck. It builds the probability tree in three levels, the learner chooses
// how much help: 1 the empty tree (the learner enters the chances of the branches), 2 the branches filled (the
// learner calculates a way and the sum), 3 the solution with the advice.
import { computed } from "vue";
import { translator } from "@lernapps/tooling/i18n";
import type { Input } from "@lernapps/app-templates/interactive";
import type { State } from "../core/index.ts";
import { text as fractionText } from "../core/fraction.ts";
import de from "../messages/de.json";
import en from "../messages/en.json";
import TreeView from "./TreeView.vue";

const props = defineProps<{ state: State; lang: string }>();
const emit = defineEmits<{ input: [input: Input] }>();
const t = computed(() => (props.lang === "en" ? translator(en, "en-US") : translator(de)));
const advice = computed(() => props.state.advice);
const tree = computed(() => advice.value?.tree ?? null);
const level = computed(() => props.state.joker.level);
const name = (id: string): string => t.value(`cat_${id}` as never);
const kept = computed(() =>
  props.state.dice.filter((_, at) => advice.value !== null && (advice.value.mask >> at) % 2 === 1),
);
const answers = computed(() => props.state.joker.answers);
const reveal = computed(() => ({
  hit: level.value >= 2 || answers.value["hit"]?.ok === true,
  miss: level.value >= 2 || answers.value["miss"]?.ok === true,
  results: level.value >= 3,
}));
const send = (field: string, event: Event): void => {
  const input = event.target;
  if (input instanceof HTMLInputElement)
    emit("input", { kind: "action", name: "answer", value: { field, text: input.value } });
};
const status = (field: string): string => {
  const answer = answers.value[field];
  return answer === undefined ? "" : answer.ok ? "ok" : "no";
};
</script>

<template>
  <section v-if="advice !== null" class="kt-card kt-joker" aria-labelledby="joker-title">
    <h3 id="joker-title"><span class="kt-badge" aria-hidden="true">🃏</span> {{ t("joker") }}</h3>
    <div class="kt-steps" role="group" :aria-label="t('helpLevel')">
      <button
        type="button"
        class="kt-step"
        :aria-pressed="level === 1"
        @click="emit('input', { kind: 'action', name: 'joker', value: 1 })"
      >
        {{ t("level1") }}
      </button>
      <button
        type="button"
        class="kt-step"
        :aria-pressed="level === 2"
        @click="emit('input', { kind: 'action', name: 'joker', value: 2 })"
      >
        {{ t("level2") }}
      </button>
      <button
        type="button"
        class="kt-step"
        :aria-pressed="level === 3"
        @click="emit('input', { kind: 'action', name: 'joker', value: 3 })"
      >
        {{ t("level3") }}
      </button>
    </div>

    <template v-if="tree === null">
      <p>{{ t("noTree") }}</p>
      <ul v-if="level >= 2" class="kt-list">
        <li v-for="option in advice.options.slice(0, 3)" :key="option.cat">
          <span>{{ name(option.cat) }}</span>
          <span>{{ t("pointsNow", { points: option.points }) }}</span>
        </li>
      </ul>
    </template>
    <template v-else>
      <p v-if="level === 1">{{ t("jokerLevel1", { free: tree.free, face: tree.face }) }}</p>
      <p v-else-if="level === 2">{{ t("jokerLevel2") }}</p>
      <p v-else>{{ t("jokerLevel3") }}</p>
      <TreeView :tree="tree" :lang="lang" :reveal="reveal" />

      <template v-if="level === 1">
        <p>
          <strong>{{ t("task") }}</strong> {{ t("task1", { face: tree.face }) }}
        </p>
        <div class="kt-ans">
          <label
            >{{ t("branchHit", { face: tree.face }) }}
            <input
              :class="status('hit')"
              :value="answers['hit']?.text ?? ''"
              inputmode="text"
              autocomplete="off"
              :aria-label="t('chanceHitLabel', { face: tree.face })"
              placeholder="?"
              @change="send('hit', $event)"
            />
            <span class="mark" aria-hidden="true">{{
              status("hit") === "ok" ? "✓" : status("hit") === "no" ? "✗" : ""
            }}</span>
          </label>
          <label
            >{{ t("branchMiss", { face: tree.face }) }}
            <input
              :class="status('miss')"
              :value="answers['miss']?.text ?? ''"
              inputmode="text"
              autocomplete="off"
              :aria-label="t('chanceMissLabel', { face: tree.face })"
              placeholder="?"
              @change="send('miss', $event)"
            />
            <span class="mark" aria-hidden="true">{{
              status("miss") === "ok" ? "✓" : status("miss") === "no" ? "✗" : ""
            }}</span>
          </label>
        </div>
        <p class="kt-note">{{ t("hintSides") }}</p>
      </template>
      <template v-else-if="level === 2">
        <p>
          <strong>{{ t("task") }}</strong> {{ t("task2") }}
        </p>
        <div class="kt-ans">
          <label
            >{{ tree.leaves[1]?.factors.map(fractionText).join(" × ") }} =
            <input
              :class="status('path')"
              :value="answers['path']?.text ?? ''"
              autocomplete="off"
              :aria-label="t('pathLabel')"
              placeholder="?"
              @change="send('path', $event)"
            />
            <span class="mark" aria-hidden="true">{{
              status("path") === "ok" ? "✓" : status("path") === "no" ? "✗" : ""
            }}</span>
          </label>
          <label
            >{{ t("sumLabel") }}
            <input
              :class="status('sum')"
              :value="answers['sum']?.text ?? ''"
              autocomplete="off"
              :aria-label="t('sumAria')"
              placeholder="?"
              @change="send('sum', $event)"
            />
            <span class="mark" aria-hidden="true">{{
              status("sum") === "ok" ? "✓" : status("sum") === "no" ? "✗" : ""
            }}</span>
          </label>
        </div>
      </template>
      <template v-else>
        <p class="kt-calc">
          <span
            >{{
              tree.leaves
                .filter((l) => l.hit)
                .map((l) => fractionText(l.product))
                .join(" + ")
            }}
            = <b>{{ fractionText(tree.hitSum) }}</b> ≈ {{ Math.round((100 * tree.hitSum.n) / tree.hitSum.d) }} %</span
          >
        </p>
        <p v-if="advice.action === 'hold'" class="kt-tip">
          <span aria-hidden="true">💡</span> {{ t("tipKeep") }}
          <span v-for="(die, at) in kept" :key="at" class="kt-dd">{{ die }}</span>
          {{ t("tipField", { field: name(advice.target), points: Math.round(advice.options[0]?.expected ?? 0) }) }}
        </p>
      </template>
    </template>
  </section>
</template>
