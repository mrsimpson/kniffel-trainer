<script setup lang="ts">
// The coach of the explanation mode: the chances as rings (percent and fraction), the way they come about as a
// probability tree, the dice to keep and the goal field, and a short list of what the fields would bring.
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
const name = (id: string): string => t.value(`cat_${id}` as never);
const kept = computed(() =>
  props.state.dice.filter((_, at) => advice.value !== null && (advice.value.mask >> at) % 2 === 1),
);
const top = computed(() => advice.value?.options.slice(0, 3) ?? []);
const round1 = (value: number): string =>
  (Math.round(value * 10) / 10).toLocaleString(props.lang === "en" ? "en-US" : "de-DE");
const face = computed(() => advice.value?.tree?.face ?? 0);
const tree = computed(() => advice.value?.tree ?? null);
const revealAll = { hit: true, miss: true, results: true };
</script>

<template>
  <section v-if="advice !== null" class="kt-card kt-coach" aria-labelledby="coach-title">
    <h3 id="coach-title"><span class="kt-badge" aria-hidden="true">🎓</span> {{ t("coach") }}</h3>
    <div class="kt-tabs" role="group" :aria-label="t('coachView')">
      <button
        type="button"
        class="kt-tab"
        :aria-pressed="state.coachView === 'odds'"
        @click="emit('input', { kind: 'action', name: 'coachView', value: 'odds' })"
      >
        {{ t("chances") }}
      </button>
      <button
        v-if="tree !== null"
        type="button"
        class="kt-tab"
        :aria-pressed="state.coachView === 'how'"
        @click="emit('input', { kind: 'action', name: 'coachView', value: 'how' })"
      >
        {{ t("howItWorks") }}
      </button>
    </div>

    <template v-if="advice.action === 'score'">
      <p class="kt-lead">{{ t("scoreNow", { field: name(advice.target) }) }}</p>
    </template>
    <template v-else-if="state.coachView === 'odds'">
      <p class="kt-lead">
        {{ t("youKeep") }}
        <span v-for="(die, at) in kept" :key="at" class="kt-dd">{{ die }}</span>
        {{ t("howGood") }}
      </p>
      <ul v-if="advice.rings.length > 0" class="kt-odds" :aria-label="t('chances')">
        <li v-for="ring in advice.rings" :key="ring.id">
          <div
            class="kt-ring"
            :style="{ '--p': ring.percent }"
            role="img"
            :aria-label="t('percentLabel', { percent: ring.percent })"
          >
            <b>{{ ring.percent < 1 ? "<1" : ring.percent }} %</b>
          </div>
          <div class="kt-cap">
            <strong>{{ t(`ring_${ring.id}`) }}</strong>
            <span>{{ t(ring.id === "all" ? "ringAllFor" : "ringOneFor", { face }) }}</span>
            <span v-if="ring.fraction" class="fr">{{
              t("fractionOf", { n: String(ring.fraction.n), d: String(ring.fraction.d) })
            }}</span>
          </div>
        </li>
      </ul>
    </template>
    <template v-else-if="tree !== null">
      <p class="kt-lead">{{ t("howTitle", { percent: Math.round((100 * tree.hitSum.n) / tree.hitSum.d) }) }}</p>
      <div class="kt-steps" role="group" :aria-label="t('step')">
        <button
          type="button"
          class="kt-tab"
          :aria-pressed="state.coachStep === 1"
          @click="emit('input', { kind: 'action', name: 'coachStep', value: 1 })"
        >
          {{ t("oneThrow") }}
        </button>
        <button
          v-if="tree.again !== null"
          type="button"
          class="kt-tab"
          :aria-pressed="state.coachStep === 2"
          @click="emit('input', { kind: 'action', name: 'coachStep', value: 2 })"
        >
          {{ t("twoThrows") }}
        </button>
      </div>
      <template v-if="state.coachStep === 1 || tree.again === null">
        <p>{{ t("treeIntro", { free: tree.free, face: tree.face }) }}</p>
        <TreeView :tree="tree" :lang="lang" :reveal="revealAll" />
        <p class="kt-legend">
          <span class="kt-sw win"></span> {{ t("legendHit", { face: tree.face }) }} <span class="kt-sw lose"></span>
          {{ t("legendMiss", { face: tree.face }) }}
        </p>
        <div class="kt-calc">
          <div>
            <strong>{{ t("sumUp") }}</strong>
            <span class="kt-eq">
              {{
                tree.leaves
                  .filter((l) => l.hit)
                  .map((l) => fractionText(l.product))
                  .join(" + ")
              }}
              = <b>{{ fractionText(tree.hitSum) }}</b></span
            >
          </div>
          <div>
            <strong>{{ t("shortcut") }}</strong>
            <span class="kt-eq">
              1 − {{ fractionText(tree.missAll) }} = <b>{{ fractionText(tree.hitSum) }}</b> ≈
              {{ Math.round((100 * tree.hitSum.n) / tree.hitSum.d) }} %</span
            >
          </div>
        </div>
      </template>
      <template v-else>
        <p>{{ t("twoIntro", { face: tree.face }) }}</p>
        <div class="kt-chain" role="group" :aria-label="t('calculation')">
          <div class="kt-cellbox">
            {{ t("throwN", { n: 1, face: tree.face }) }}<b>{{ fractionText(tree.missAll) }}</b>
          </div>
          <div class="kt-op" aria-hidden="true">×</div>
          <div class="kt-cellbox">
            {{ t("throwN", { n: 2, face: tree.face }) }}<b>{{ fractionText(tree.missAll) }}</b>
          </div>
          <div class="kt-op" aria-hidden="true">=</div>
          <div class="kt-cellbox">
            {{ t("never", { face: tree.face }) }}<b>{{ fractionText(tree.again.missTwice) }}</b>
          </div>
        </div>
        <div class="kt-calc">
          <div>
            <strong>{{ t("opposite") }}</strong>
            <span class="kt-eq">
              1 − {{ fractionText(tree.again.missTwice) }} = <b>{{ fractionText(tree.again.hitTwice) }}</b> ≈
              {{ Math.round((100 * tree.again.hitTwice.n) / tree.again.hitTwice.d) }} %</span
            >
          </div>
        </div>
      </template>
    </template>

    <p v-if="advice.action === 'hold'" class="kt-tip">
      <span aria-hidden="true">💡</span> {{ t("tipKeep") }}
      <span v-for="(die, at) in kept" :key="at" class="kt-dd">{{ die }}</span>
      {{ t("tipField", { field: name(advice.target), points: round1(advice.options[0]?.expected ?? 0) }) }}
    </p>
    <ul class="kt-list" :aria-label="t('fieldsCompared')">
      <li v-for="option in top" :key="option.cat">
        <span>{{ name(option.cat) }}</span>
        <span>{{ t("expectedPoints", { points: round1(option.expected) }) }}</span>
      </li>
    </ul>
  </section>
</template>
