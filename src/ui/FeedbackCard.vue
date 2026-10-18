<script setup lang="ts">
// What the trainer says about the player's last move: the field entered, or the dice kept.
import { computed } from "vue";
import { translator } from "@lernapps/tooling/i18n";
import type { State } from "../core/index.ts";
import de from "../messages/de.json";
import en from "../messages/en.json";

const props = defineProps<{ state: State; lang: string }>();
const t = computed(() => (props.lang === "en" ? translator(en, "en-US") : translator(de)));
const last = computed(() => props.state.last);
const name = (id: string): string => t.value(`cat_${id}` as never);
const better = computed(() => last.value !== null && last.value.verdict === "better");
</script>

<template>
  <section v-if="last !== null" :class="['kt-card', 'kt-feedback', { better }]" aria-labelledby="feedback-title">
    <h3 id="feedback-title">
      <span class="kt-badge" aria-hidden="true">{{ better ? "💬" : "✔" }}</span> {{ t("feedbackTitle") }}
    </h3>
    <template v-if="last.kind === 'score'">
      <p v-if="last.verdict === 'best'">{{ t("scoreBest", { field: name(last.cat), points: last.points }) }}</p>
      <p v-else-if="last.verdict === 'good'">
        {{
          t("scoreGood", {
            field: name(last.cat),
            points: last.points,
            best: name(last.best),
            bestPoints: last.bestPoints,
          })
        }}
      </p>
      <p v-else>
        {{
          t("scoreBetter", {
            field: name(last.cat),
            points: last.points,
            best: name(last.best),
            bestPoints: last.bestPoints,
          })
        }}
      </p>
    </template>
    <template v-else>
      <p v-if="last.verdict === 'good'">{{ t("holdGood") }}</p>
      <p v-else>{{ t("holdBetter", { lost: last.lost.toLocaleString(lang === "en" ? "en-US" : "de-DE") }) }}</p>
    </template>
  </section>
</template>
