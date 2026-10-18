<script setup lang="ts">
// The score block: the fields of the game with the points entered, and for the open fields what the current dice
// would score. A field is entered with its button; the field the coach aims for is marked when the help is on.
import { computed } from "vue";
import { translator } from "@lernapps/tooling/i18n";
import type { Input } from "@lernapps/app-templates/interactive";
import { CATEGORIES, categoryOf, fieldsOf, type State } from "../core/index.ts";
import { score } from "../core/scoring.ts";
import de from "../messages/de.json";
import en from "../messages/en.json";

const props = defineProps<{ state: State; lang: string; showTarget: boolean }>();
const emit = defineEmits<{ input: [input: Input] }>();
const t = computed(() => (props.lang === "en" ? translator(en, "en-US") : translator(de)));
const thrown = computed(() => props.state.dice[0] !== 0);
const fields = computed(() => fieldsOf(props.state.size));
const upper = computed(() => CATEGORIES.filter((c) => c.part === "upper" && fields.value.includes(c.id)));
const lower = computed(() => CATEGORIES.filter((c) => c.part === "lower" && fields.value.includes(c.id)));
const name = (id: string): string => t.value(`cat_${id}` as never);
const points = (id: string): number => score(props.state.dice, categoryOf(id));
const target = computed(() => (props.showTarget ? (props.state.advice?.target ?? "") : ""));
</script>

<template>
  <div class="kt-block" role="region" :aria-label="t('block')">
    <div class="kt-spiral" aria-hidden="true"><b v-for="n in 10" :key="n"></b></div>
    <h2>{{ t("title") }}</h2>
    <table>
      <tbody>
        <tr class="sec">
          <th colspan="2">{{ t("upperPart") }}</th>
        </tr>
        <tr
          v-for="field in upper"
          :key="field.id"
          :class="[state.sheet[field.id] === null ? 'open' : '', target === field.id ? 'target' : '']"
        >
          <th>
            <button
              v-if="state.sheet[field.id] === null"
              type="button"
              class="kt-cell"
              :disabled="!thrown"
              :aria-label="thrown ? t('enter', { field: name(field.id), points: points(field.id) }) : name(field.id)"
              @click="emit('input', { kind: 'action', name: 'score', value: field.id })"
            >
              {{ name(field.id) }}<span v-if="target === field.id" aria-hidden="true"> ★</span>
            </button>
            <template v-else>{{ name(field.id) }}</template>
          </th>
          <td v-if="state.sheet[field.id] !== null" class="pt">{{ state.sheet[field.id] }}</td>
          <td v-else class="pt hint">{{ thrown ? points(field.id) : "" }}</td>
        </tr>
        <tr>
          <th>{{ t("bonus") }}</th>
          <td class="pt">{{ state.bonus > 0 ? state.bonus : "–" }}</td>
        </tr>
        <template v-if="lower.length > 0">
          <tr class="sec">
            <th colspan="2">{{ t("lowerPart") }}</th>
          </tr>
          <tr
            v-for="field in lower"
            :key="field.id"
            :class="[state.sheet[field.id] === null ? 'open' : '', target === field.id ? 'target' : '']"
          >
            <th>
              <button
                v-if="state.sheet[field.id] === null"
                type="button"
                class="kt-cell"
                :disabled="!thrown"
                :aria-label="thrown ? t('enter', { field: name(field.id), points: points(field.id) }) : name(field.id)"
                @click="emit('input', { kind: 'action', name: 'score', value: field.id })"
              >
                {{ name(field.id) }}<span v-if="target === field.id" aria-hidden="true"> ★</span>
              </button>
              <template v-else>{{ name(field.id) }}</template>
            </th>
            <td v-if="state.sheet[field.id] !== null" class="pt">{{ state.sheet[field.id] }}</td>
            <td v-else class="pt hint">{{ thrown ? points(field.id) : "" }}</td>
          </tr>
        </template>
        <tr class="sum">
          <th>{{ t("total") }}</th>
          <td class="pt">{{ state.total }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
