<script setup lang="ts">
// The coach of the explanation mode: a companion, not an instructor. It looks at the dice the player keeps: the
// chances as rings (percent and fraction), the way they come about as a probability tree, how often which points come
// out in the goal field, and a short list of what the fields would bring. It never says which dice to keep.
import { computed } from "vue";
import { translator } from "@lernapps/tooling/i18n";
import type { Input } from "@lernapps/app-templates/interactive";
import type { State } from "../core/index.ts";
import { text as fractionText } from "../core/fraction.ts";
import de from "../messages/de.json";
import en from "../messages/en.json";
import SpreadView from "./SpreadView.vue";
import TreeView from "./TreeView.vue";

const props = defineProps<{ state: State; lang: string }>();
const emit = defineEmits<{ input: [input: Input] }>();
const t = computed(() => (props.lang === "en" ? translator(en, "en-US") : translator(de)));
const look = computed(() => props.state.coach);
const name = (id: string): string => t.value(`cat_${id}` as never);
const kept = computed(() =>
  props.state.dice.filter((_, at) => look.value !== null && (look.value.mask >> at) % 2 === 1),
);
const top = computed(() => look.value?.options.slice(0, 3) ?? []);
/** Whether the points shown are the dice's own (nothing is thrown again), not an average. */
const sure = computed(() => look.value !== null && (props.state.rollsLeft === 0 || look.value.free === 0));
const round1 = (value: number): string =>
  (Math.round(value * 10) / 10).toLocaleString(props.lang === "en" ? "en-US" : "de-DE");
const face = computed(() => look.value?.tree?.face ?? 0);
const tree = computed(() => look.value?.tree ?? null);
const revealAll = { hit: true, miss: true, results: true };
</script>

<template>
  <section v-if="look !== null" class="kt-card kt-coach" aria-labelledby="coach-title">
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

    <template v-if="state.rollsLeft === 0">
      <p class="kt-lead">{{ t("coachNoThrow") }}</p>
    </template>
    <template v-else-if="look.free === 0">
      <p class="kt-lead">{{ t("coachAllHeld") }}</p>
    </template>
    <template v-else-if="kept.length === 0">
      <p class="kt-lead">{{ t("coachNothing") }}</p>
    </template>
    <template v-else-if="state.coachView === 'odds'">
      <p class="kt-lead">
        {{ t("youKeep") }}
        <span v-for="(die, at) in kept" :key="at" class="kt-dd">{{ die }}</span>
        {{ t("howGood") }}
      </p>
      <ul v-if="look.rings.length > 0" class="kt-odds" :aria-label="t('chances')">
        <li v-for="ring in look.rings" :key="ring.id">
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
      <SpreadView
        v-if="look.spread !== null && look.target !== null"
        :spread="look.spread"
        :field="name(look.target)"
        :lang="lang"
      />
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

    <p v-if="look.free > 0 && look.target !== null && kept.length > 0" class="kt-tip">
      <span aria-hidden="true">💡</span> {{ t("tipWith") }}
      <span v-for="(die, at) in kept" :key="at" class="kt-dd">{{ die }}</span>
      {{ t("tipAim", { field: name(look.target), points: round1(look.options[0]?.expected ?? 0) }) }}
    </p>
    <p v-if="state.rollsLeft > 0 && look.free > 0 && kept.length > 0" class="kt-note">{{ t("coachNote") }}</p>
    <ul class="kt-list" :aria-label="t('fieldsCompared')">
      <li v-for="option in top" :key="option.cat">
        <span>{{ name(option.cat) }}</span>
        <span>{{
          sure ? t("pointsNow", { points: option.points }) : t("expectedPoints", { points: round1(option.expected) })
        }}</span>
      </li>
    </ul>
  </section>
</template>
