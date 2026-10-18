---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- No Land, Schulform or Lehrplan was named; no Lehrplan is cited. Orientation is the creator's wish: grades 7 and 8
  (entry `grades: [7, 8]`), after good fractions and percentages; probability is not yet taught in class.
- The app teaches chances with fractions, products of chances along a way and the opposite event, using Kniffel
  (Yahtzee) as the game. It follows the creator's wish, not a Lehrplan.

## Competencies

Each as "Ich kann …", by chapter; they are also in `src/app.yaml` (`competencies`) in German and English.

- Chapter 1, chances with dice:
  - name all results of a die; give the chance of one number as fraction and percent; the chance that two dice both
    show the wanted number. Played in the coach's tree (`src/ui/CoachCard.vue`, view "So geht's") and the joker's
    level 1 (`src/ui/JokerCard.vue`, fields `hit` and `miss`).
- Chapter 2, several dice and throws:
  - "at least one" among several dice; compare one and two throws; explain why keeping dice helps. Coach rings
    `one`, `two`, `all` (`src/core/odds.ts`, `ringsOf`) and the tree's second step (`tree.again`).
- Chapter 3, deciding well:
  - compare two moves by their chances, connect points with chances, justify what to keep and which field to take.
    The coach's list of fields (`look.options` from `lookAt` in `src/core/advice.ts`) and the feedback card
    (`src/ui/FeedbackCard.vue`, `last` in the state).

## Content structure

- Three modes are the routes of `src/app.yaml`: `erklaeren` (coach), `joker` (joker and feedback), `spielen` (no
  help, high scores). A game has 6 rounds (the upper half) or 13 (the whole sheet); the learner chooses at the start
  (action `size`, value 6 or 13).
- Fields and their averages ("par") are `src/data/categories.json` (id, part, face, par). A new field there needs a
  case in `score()` in `src/core/scoring.ts` and a test in a playthrough.
- Texts are in `src/messages/de.json` and `en.json`, with the same keys in both; German first and complete,
  English complete (`learner-text-german`). Field names are the keys `cat_<id>`.

## Terminology

- German: Chance, Wurf, Würfel, "Treffer" is avoided; say "mindestens eine 4". The learner is addressed as "du".
- Fractions are written as `11/36`, in words "11 von 36"; percentages are rounded to whole numbers.
- English: "Yahtzee" for Kniffel, "field" for a row of the sheet, "throw" for rolling the dice.
- Terms: Kniffelblock, oberer und unterer Block, Bonus ab 63 Punkten (35 Punkte; ungeprüft, siehe Sources),
  Coach, Joker, Trainer.
- The average: say "im Schnitt" and explain it with the spread (100 tries as bars), never "Erwartungswert" or
  "erwartete Punkte"; learners do not know them.

## Exercise patterns

- Pattern "decide a move" (judge, decide): the move itself is the exercise; the trainer rates it. Example: round 1 of
  `src/playthroughs/erklaeren.yaml`. Data: `src/data/categories.json`.
- Pattern "compute a chance" (compute): the joker asks for fractions the learner types. Fields `hit`, `miss`
  (level 1) and `path`, `sum` (level 2), checked by exact fraction equality (`answer()` in `src/core/index.ts`; the
  learner may type `2/12` for `1/6`). Example: `src/playthroughs/joker.yaml`.
- Pattern "explain" (explain): the coach's tree and its calculation. Example: `src/playthroughs/erklaeren.yaml`,
  steps `coachView` and `coachStep`.
- The coach is a companion, not an instructor: it rates the dice the learner keeps (`state.coach`, from `lookAt`),
  names the field those dice aim for (the field the most kept dice are on the way to: a number held, a pair for a
  pasch, a run for a straight; of equal ones the best above its par), and marks no dice to keep. How the points come
  out is shown as 100 tries in bars (`src/ui/SpreadView.vue`, `spread` from `distribution` in
  `src/core/engine.ts`); the average is the sentence below it. Only the joker's level 3 shows a recommendation
  (`advice`), as the learner asked for it. Example: `src/playthroughs/coach-sechser.yaml`.
- Numbers come from the seed and are never written by hand: the core counts every chance exactly
  (`src/core/engine.ts`, `src/core/odds.ts`).

## Figures

- Dice as pips drawn by CSS grid (`src/ui/DiceRow.vue`); rings as a conic gradient with the percent in the middle
  (`src/ui/CoachCard.vue`); the probability tree as SVG (`src/ui/TreeView.vue`, layout in `src/ui/treeLayout.ts`).
- Colours: felt green table, paper block, coach blue with yellow, joker violet with orange, hit green, miss dark
  red; pairs checked for contrast. Coach and joker also differ by heading and symbol.
- Every picture has a text alternative (`aria-label`); the tree says how many dice and which number.
- All figures are drawn by the app: no pictures from others, no licence needed.
- The pictures of the guide `docs/anleitung.md` are screenshots from `e2e/anleitung.e2e.ts`; run the tests after a
  change of the look and commit the new pictures in `docs/anleitung/img/`.

## Sources

- Kniffel rules and scores (full house 25, small straight 30, large straight 40, Kniffel 50, chance): German
  Wikipedia "Kniffel", opened and read for the table. Bonus (35 points from 63): not read from that page, marked
  unchecked; the value is the common one.
- Averages per field ("par" in `categories.json`): common values for good play, approximations from memory of
  published analyses, not verified; they only rank moves and the start page says so.
- Laplace experiment and expected value (German Wikipedia) are background only, too abstract for learners.
- No material of the creator beyond the idea; nothing to keep local.

## Adding a chapter or round

- A new help or mode: add the route to `src/app.yaml` (id, title, description in both languages), handle it in
  `src/core/index.ts` (`MODES`, `start`, `advice`), add the texts to both message files, and write a playthrough in
  `src/playthroughs/<route>.yaml` that plays it; then show it in `src/ui/App.vue`.
- A new field: entry in `src/data/categories.json`, a case in `score()`, `par` from a simulation, texts `cat_<id>`.
- A new competency: add it to `competencies` in `src/app.yaml` (both languages) and to this guide, with the screen
  that practises it; update the entry topics if it gets its own route; run `npx lernapps check`; commit.

## Rules learned from mistakes

- Never pass fractions to the translator as numbers: it formats `1296` as `1.296`. Pass `String(n)`.
- The trainer compares a field with its average (par), not with its points: comparing points always advises the
  Chance.
- Held dice stay held after a throw; the learner releases them (a first version reset them).
