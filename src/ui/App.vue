<script setup lang="ts">
// The game: the setup (the mode and the short game or whole sheet), the table while playing (dice, score block, coach or joker),
// the pause and the end with the high scores. It announces every change for screen readers. The runtime gives it
// the core's state and steps every key typed on the page; buttons emit actions as input. The whole app
// fills the screen over the page's frame; the Info link and the Pause button lead out.
import { computed, ref, watch } from "vue";
import { announce } from "@lernapps/tooling/a11y";
import { createStorage } from "@lernapps/tooling/storage";
import { translator } from "@lernapps/tooling/i18n";
import type { Input } from "@lernapps/app-templates/interactive";
import type { State } from "../core/index.ts";
import de from "../messages/de.json";
import en from "../messages/en.json";
import CoachCard from "./CoachCard.vue";
import DiceRow from "./DiceRow.vue";
import FeedbackCard from "./FeedbackCard.vue";
import JokerCard from "./JokerCard.vue";
import SheetBlock from "./SheetBlock.vue";
import "./game.css";

const props = defineProps<{ state: State; lang: string }>();
const emit = defineEmits<{ input: [input: Input] }>();
const t = computed(() => (props.lang === "en" ? translator(en, "en-US") : translator(de)));
const send = (input: Input): void => emit("input", input);
const MODES = ["erklaeren", "joker", "spielen"] as const;
type MessageKey = keyof typeof de;

/** A saved game of the high-score list: the points and the day, no name. */
interface Entry {
  score: number;
  day: string;
}
const storage = createStorage("kniffel-trainer");
const isEntries = (value: unknown): value is Entry[] =>
  Array.isArray(value) &&
  value.every(
    (v) =>
      typeof v === "object" &&
      v !== null &&
      typeof (v as Entry).score === "number" &&
      typeof (v as Entry).day === "string",
  );
const board = ref<Entry[]>([]);
const mine = ref(-1);
const boardKey = (size: number): string => `scores-${size}`;
const loadBoard = (size: number): void => {
  board.value = storage.load(boardKey(size), isEntries) ?? [];
};
watch(
  () => props.state.size,
  (size) => loadBoard(size),
  { immediate: true },
);
watch(
  () => props.state.phase,
  (phase) => {
    if (phase === "setup") mine.value = -1;
    if (phase !== "done" || props.state.route !== "spielen") return;
    const entry = { score: props.state.total, day: new Date().toISOString().slice(0, 10) };
    const list = [...(storage.load(boardKey(props.state.size), isEntries) ?? []), entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    storage.save(boardKey(props.state.size), list);
    board.value = list;
    mine.value = list.indexOf(entry);
  },
);

const modeText = computed(() =>
  t.value(
    props.state.route === "joker" ? "mode_joker" : props.state.route === "spielen" ? "mode_spielen" : "mode_erklaeren",
  ),
);
/** A saved day (2026-10-18) the way the language writes it. */
const dayText = (day: string): string =>
  new Date(`${day}T12:00:00`).toLocaleDateString(props.lang === "en" ? "en-GB" : "de-DE");
const showCoach = computed(() => props.state.route === "erklaeren" && props.state.coach !== null);
const showJoker = computed(() => props.state.route === "joker" && props.state.advice !== null);
const diceText = computed(() => props.state.dice.join(", "));

watch(
  () => [props.state.phase, props.state.round, props.state.rollsLeft, props.state.total] as const,
  () => {
    const { state } = props;
    if (state.phase === "setup") announce(t.value("announceSetup"));
    else if (state.phase === "paused") announce(t.value("announcePause"));
    else if (state.phase === "done") announce(t.value("announceDone", { total: state.total }));
    else if (state.dice[0] === 0) announce(t.value("announceRound", { round: state.round, size: state.size }));
    else announce(t.value("announceRoll", { dice: diceText.value, count: state.rollsLeft }));
  },
);
</script>

<template>
  <div class="kt playing">
    <!-- setup -->
    <div v-if="state.phase === 'setup'" class="kt-table kt-center">
      <section class="kt-panel" :aria-label="t('setup')">
        <nav class="kt-modes" :aria-label="t('modes')">
          <a
            v-for="mode in MODES"
            :key="mode"
            :href="`#${mode}`"
            class="kt-mode"
            :aria-current="state.route === mode ? 'true' : undefined"
            >{{ t(`modeName_${mode}` as MessageKey) }}</a
          >
        </nav>
        <p class="kt-note">{{ modeText }}</p>
        <h2>{{ t("chooseLength") }}</h2>
        <div class="kt-sizes">
          <button type="button" class="kt-big" @click="send({ kind: 'action', name: 'size', value: 6 })">
            {{ t("short") }}<small>{{ t("shortHint") }}</small>
          </button>
          <button type="button" class="kt-big" @click="send({ kind: 'action', name: 'size', value: 13 })">
            {{ t("whole") }}<small>{{ t("wholeHint") }}</small>
          </button>
        </div>
        <div v-if="state.route === 'spielen' && board.length > 0" class="kt-scores">
          <strong>{{ t("scores") }}</strong>
          <ol>
            <li v-for="(entry, at) in board" :key="at">
              {{ t("scoreLine", { score: entry.score, day: dayText(entry.day) }) }}
            </li>
          </ol>
        </div>
        <a class="kt-info" href="../">{{ t("info") }}</a>
      </section>
    </div>

    <!-- the end -->
    <div v-else-if="state.phase === 'done'" class="kt-table kt-center">
      <section class="kt-panel" :aria-label="t('end')">
        <h2>{{ t("gameOver") }}</h2>
        <p class="kt-lead">
          {{ t("finalScore", { total: state.total })
          }}<span v-if="state.bonus > 0"> {{ t("withBonus", { bonus: state.bonus }) }}</span>
        </p>
        <div v-if="state.route === 'spielen'" class="kt-scores">
          <strong>{{ t("scores") }}</strong>
          <ol>
            <li v-for="(entry, at) in board" :key="at" :class="{ mine: at === mine }">
              {{ t("scoreLine", { score: entry.score, day: dayText(entry.day) })
              }}<span v-if="at === mine" class="kt-mine"> {{ t("thisGame") }}</span>
            </li>
          </ol>
        </div>
        <FeedbackCard :state="state" :lang="lang" />
        <button type="button" class="kt-big" @click="send({ kind: 'action', name: 'again' })">{{ t("again") }}</button>
      </section>
    </div>

    <!-- paused -->
    <div v-else-if="state.phase === 'paused'" class="kt-table kt-center">
      <section class="kt-panel" :aria-label="t('pause')">
        <h2>{{ t("pause") }}</h2>
        <button type="button" class="kt-big" @click="send({ kind: 'action', name: 'resume' })">
          {{ t("resume") }}
        </button>
        <button type="button" class="kt-big kt-quiet" @click="send({ kind: 'action', name: 'quit' })">
          {{ t("quit") }}
        </button>
        <a class="kt-info" href="../">{{ t("info") }}</a>
      </section>
    </div>

    <!-- playing -->
    <div v-else class="kt-table">
      <div class="kt-bar">
        <span
          >{{ t("round") }} <b>{{ state.round }}</b> {{ t("of") }} {{ state.size }}</span
        >
        <span
          >{{ t("points") }} <b>{{ state.total }}</b></span
        >
        <button type="button" class="kt-pause" @click="send({ kind: 'action', name: 'pause' })">
          ⏸ {{ t("pause") }}
        </button>
      </div>
      <div class="kt-stage">
        <DiceRow :state="state" :lang="lang" @input="send" />
        <aside class="kt-side" :aria-label="t('help')">
          <CoachCard v-if="showCoach" :state="state" :lang="lang" @input="send" />
          <template v-if="showJoker">
            <JokerCard v-if="state.joker.level !== 0" :state="state" :lang="lang" @input="send" />
            <button
              v-else
              type="button"
              class="kt-joker-ask"
              @click="send({ kind: 'action', name: 'joker', value: 1 })"
            >
              🃏 {{ t("askJoker") }}
            </button>
          </template>
          <FeedbackCard v-if="state.route !== 'spielen'" :state="state" :lang="lang" />
        </aside>
        <SheetBlock :state="state" :lang="lang" :show-target="state.route === 'erklaeren'" @input="send" />
      </div>
    </div>
  </div>
</template>
