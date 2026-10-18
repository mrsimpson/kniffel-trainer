---
# Read by the hooks, the review, the evals. Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json
# archetype: explainer | interactive | quiz; null until chosen in Explore.
archetype: interactive
# phase: code | plan | code | commit. Set it on entering a phase.
phase: explore
# prePushFailures: written by the pre-push hook. Never change it.
prePushFailures: 0
---

# Plan: Kniffel-Trainer, first version

<!--
For you, the assistant.
- Path: .vibe/plans/01-<short name>.md. Later changes: increment template, own plan.
- Read this plan before each step. One phase at a time, tasks in order.
- Done → tick `[x]` at once, move it to "Completed" of its phase. Unticked boxes count as not done.
- New task found → add it.
- Read every skill and page named here in full, from its file (curl, cat). Never a summarising fetch tool.
- Checkpoint task: stop, ask, wait for the creator's answer.
- Work on the branch `work` until the first publish; push only `work`. Commit brings `work` into `main`.
- GitHub step fails → skill `lernapps-github`.
- Plan in the creator's language. Keep headings and front matter keys.
- Delete a comment once its part is filled.
-->

*Started <date>. Explore, Plan, Code, Commit.*

## Goal

Kinder spielen Kniffel und lernen dabei, Chancen als Bruch und Prozent zu bestimmen und damit gute Entscheidungen zu treffen (welche Würfel behalten, welches Feld wählen). Drei Spielarten: Erklärmodus, Spiel mit Trainer als Joker, reines Spiel mit Highscore.

## Key decisions

- Archetyp `interactive`: Lernende handeln in einer App-Seite (Spiel/Trainer); passt zu drei Spielmodi.
- Drei Modi: (1) Erklärmodus mit allen Hilfen, (2) Spiel mit Trainer-Joker, der außerdem alle anderen Züge beobachtet und bewertet, (3) reines Spiel mit Highscore-Liste.
- Highscores nur auf dem Gerät (`storage-through-wrapper`, kein Server, `no-tracking`). (guess: nur lokal, wegen `no-tracking`)
- Chancen und erwartete Punkte werden berechnet (exakte Brüche), nicht von Hand geschrieben; Tests prüfen sie (`correct-content-support`).
- Zwei Spielumfänge: obere Hälfte (6 Runden) und ganzes Blatt (13 Runden), in allen Modi wählbar (guess: in allen drei Modi).
- Mehrsprachig Deutsch und Englisch: Texte aus `src/messages/` über `translator`; `app.yaml` führt Sprachen, Deutsch zuerst, jede vollständig (`interactive-app-valid`, `learner-text-german`).
- Startseite = nur Factsheet (ruhig, statisch, ohne Skript): was geübt wird, für wen, wie man beginnt. Die App selbst fühlt sich nach dem Start wie ein Spiel an und sieht ansprechend aus (Wunsch des Erstellers).
- Spielgefühl: Vollbild-Overlay während des Spiels (Rahmen-Regeln `frame.md`), Würfel mit Wurf-Animation, Punkte-Hochzählen, farbige Felder, Pause-Knopf. Aus Rücksicht (Empfehlung Low stimulation, ohne Blitzen): ruhige Bewegung, weniger bei reduzierter Bewegung (`prefersReducedMotion`), Ton standardmäßig aus (guess).
- Optik: Im Zentrum liegt ein Kniffelblock wie aus Papier (Zettel mit Zeilen, Spalten, Stiftschrift, Schatten, Würfel darüber auf dem Tisch). Coach (Erklärmodus) und Joker (Spiel mit Joker) erscheinen als deutlich abgesetzte Textkarten mit kräftigen Hintergrundfarben, je eine eigene Farbe pro Rolle; Text bleibt auf jedem Hintergrund kontraststark (WCAG 2.1 AA).
- Coach (Erklärmodus): kurz und bildhaft. Ansicht "Chancen": drei große Prozent-Ringe mit Bruch ("11 von 36"). Ansicht "So geht's": Baumdiagramm mit Wahrscheinlichkeiten an den Ästen, Wege mit Produkten, Zusammenzählen oder Gegenereignis (1 minus ...), danach Schritt "2 Würfe". Bruch und Prozent stehen immer nebeneinander.
- Joker: nutzt nur den Baum; die drei Stufen sind zugleich die Schwierigkeit: 1 Baum leer (Kind trägt Äste selbst ein), 2 Äste gefüllt (Kind rechnet Wege und zählt zusammen), 3 Lösung mit Tipp. Das Kind wählt, wie viel Hilfe es will.
- Bäume werden aus dem aktuellen Wurf berechnet; für schwierige Ziele (z. B. Straße, Full House) vereinfachte Fassung und offen gesagt, was fehlt.
- Plan und Methode vom Ersteller ausdrücklich bestätigt („sehr geil. Leg los."). Zusatz: Docs-Webseite, in der Screenshots aus den E2E-Tests die Anwendung erklären.
- Kein Lehrplan: Bundesland/Schulform nicht genannt, Lehrplan ist nur Orientierung.

## Notes

**Curriculum:** Kein Bundesland und keine Schulform genannt; kein Lehrplan zitiert. Orientierung am Wunsch des Erstellers: geeignet nach guter Bruchrechnung, Brüche und Prozente bekannt, Stochastik noch nicht im Unterricht.

**Fähigkeiten nach Kapiteln (Entwurf, ungeprüft vom Ersteller):**

Kapitel 1: Chancen beim Würfeln
- Ich kann alle möglichen Ergebnisse eines Würfels nennen.
- Ich kann die Chance für eine bestimmte Augenzahl bei einem Würfel als Bruch und als Prozent angeben.
- Ich kann die Chance berechnen, dass bei zwei Würfeln beide eine bestimmte Zahl zeigen.

Kapitel 2: Mehrere Würfel, mehrere Würfe
- Ich kann berechnen, wie wahrscheinlich es ist, dass bei einem Wurf mit mehreren Würfeln mindestens eine gewünschte Zahl dabei ist.
- Ich kann die Chance auf ein gewünschtes Ergebnis nach dem ersten und nach dem zweiten Nachwürfeln vergleichen.
- Ich kann erklären, warum das Behalten von Würfeln die Chance verbessert.

Kapitel 3: Gut entscheiden
- Ich kann zwei mögliche Züge anhand ihrer Chancen vergleichen.
- Ich kann die Punkte, die ein Feld bringt, mit der Chance darauf verbinden (erwartete Punkte).
- Ich kann begründen, welche Würfel ich behalte und welches Feld ich wähle.
- Ich kann erklären, wann man ein Feld streicht.

**Quellen (geprüft durch Öffnen):**
- Kniffel-Regeln und Wertung (Full House 25, Kleine Straße 30, Große Straße 40, Kniffel 50): https://de.wikipedia.org/wiki/Kniffel (geöffnet, HTTP 200; Wertungstabelle gelesen). Bonus-Regel (Grenzwert, Höhe): Seite nennt einen Bonus, Werte nicht gelesen: ungeprüft.
- Laplace-Wahrscheinlichkeit: https://de.wikipedia.org/wiki/Laplace-Experiment geöffnet; die Seite behandelt die diskrete Gleichverteilung (Würfel), enthält aber nicht die Schulformulierung "günstige durch mögliche Fälle"; als Zweitquelle nur bedingt geeignet.
- Erwartungswert: https://de.wikipedia.org/wiki/Erwartungswert geöffnet; Gliederung nennt Beispiel "Würfeln"; für Kinder zu abstrakt, nur als Hintergrund.
- serlo.org: Adresse `https://de.serlo.org/mathe/wahrscheinlichkeit` liefert 404; keine serlo-Seite gefunden. Noch offen.

**Offen:** Genaue Spielregeln für Kniffel-Vereinfachungen (Anzahl Runden, Bonus, mehrere Kniffel), Entry-Schema (per GET holen).

## Explore

<!--
- Ask; write no code; run no `create`.
- Max 2 questions per message. Skip what earlier answers tell.
- Each answer → "Answers".
-->

### Tasks

- [ ] Install the skills, if missing: `npx skills add lernapps/tooling#exp/compact-guidance`. The app commits them.
- [x] Tell the creator where the app lives: GitHub Pages of their own repo, free, public, own address (usually
      `https://<owner>.github.io/<repo>/`). Offer a short explanation of GitHub; say they need not know it. Page for
      them: <https://lernapps.net/tooling/github/>. Example: "Deine App wird über GitHub veröffentlicht, kostenlos
      und öffentlich, unter deiner eigenen Adresse. Soll ich dir kurz erklären, was GitHub ist?"
- [ ] Set up the branches before anything else is pushed:
      - settle the repo name with the creator first (a rename can cost your access);
      - no git repo: `git init --initial-branch=main`;
      - no `main` (`git ls-remote --heads origin main`, `git branch --list main` empty): `git switch --orphan main`,
        `git commit --allow-empty -m "chore: start"`, `git push -u origin main`;
      - missing `gh-pages`: `git switch --orphan gh-pages`, `git commit --allow-empty -m "chore: gh-pages"`;
      - missing `work`: `git switch -c work main`;
      - `git push -u origin gh-pages work`. No remote yet: push all three later, `main` first;
      - Pages from `gh-pages`, root (`pages-from-gh-pages`): `gh api -X POST repos/<owner>/<repo>/pages
        -f build_type=legacy -f "source[branch]=gh-pages" -f "source[path]=/"`; refused → put the click from skill
        `lernapps-github` into your next question;
      - default branch not `main` (`gh api repos/<owner>/<repo> --jq .default_branch`) → skill `lernapps-github`.
- [x] Ask: what do learners do in the app, what do they learn?
- [x] Ask: who are the learners (subject, school year, prior knowledge)?
- [x] Ask: where does the content come from (own, or others' with source and licence)?
- [x] Research: load skill `lernapps-content-research` and follow it (filled-in `app-content` first). Write under
      "Notes": curriculum orientation (Lehrplan cited where used), competencies by chapter as Ich-kann-Sätze,
      verified sources. No competencies written = task not done.
- [x] Fetch https://lernapps.net/apps/schemas/entry.v1.schema.json; read every property's description. Ask what
      helps teachers and parents find the app. Fill "Entry draft".
- [x] Choose the archetype; write it with its reason under "Key decisions"; set `archetype`:
      - `interactive`: learners act in one app page (game, trainer, simulation; e.g. a typing game);
      - `explainer`: many pages of explanation, each with exercises;
      - `quiz`: questions with options and feedback.
- [x] **Checkpoint:** research. Show in plain words: curriculum orientation, competencies by chapter, sources and
      how checked, what is unchecked, archetype and reason. Stop and wait. Changes → change, ask again.
- [x] Set `phase: plan`.

### Answers

<!-- Creator's answers, their words, one bullet each. -->
- Wünscht Spielform: Erklärmodus mit allen Optionen; unterstütztes eigenes Spielen, in dem man den Trainer bei Bedarf als Joker wie bei einer Quizshow fragen kann (hilft, das Sinnvolle herzuleiten), der Trainer überwacht aber die anderen Züge und gibt Rückmeldung, was sinnvoll war; und reines Spielen mit Highscore-Sammlung.

- Will Stochastik mit einem Kniffel-Trainer erfahrbar machen: Das Kind spielt das bekannte Kniffel/Yahtzee und bekommt auf unterschiedliche Art Hilfe und Erklärungen, welche Entscheidungen auf Basis des Wurfs sinnvoll wären.
- Lernende: Brüche und Prozente sind bekannt; Stochastik kommt im Unterricht erst viel später, die App ist aber schon nach guter Bruchrechnung geeignet.
- Repo mrsimpson/kniffel-trainer ist angelegt (öffentlich, leer).
- Zwei Spielumfänge gewünscht: nur obere Hälfte (6 Runden) oder ganzes Blatt (13 Runden).
- Soll mehrsprachig sein (Deutsch und Englisch); auf Englisch heißt Kniffel „Yahtzee".
- Bestätigt Recherche, Fähigkeiten, Archetyp, Klassenstufen 7 und 8 und die vorgeschlagenen Suchwörter („Die Vorschläge klingen sinnvoll").
- Kennt GitHub schon (wollte nur die Erklärung sehen). GitHub-Konto: mrsimpson. Repo-Name: kniffel-trainer (Vorschlag, nicht widersprochen).
- Bundesland/Schulform: will er nicht angeben; es geht um Inhalt und Fähigkeit. Lehrplan nur Orientierung, daher ohne.

### Entry draft

<!-- YAML valid against the entry schema; its property names. Only known values, never invented. -->

```yaml
title: Kniffel-Trainer
subject: Mathematik
grades: [7, 8]
summary: >-
  Du spielst Kniffel und lernst dabei, Chancen als Bruch und Prozent zu bestimmen.
  Im Erklärmodus siehst du zu jedem Wurf die Chancen. Im Spiel mit Trainer kannst du
  einen Joker nutzen. Zum Schluss spielst du allein und sammelst Punkte.
# url: nach der Veröffentlichung, vermutlich https://mrsimpson.github.io/kniffel-trainer/
# topics: nach dem Bau, Pfade der App-Routen
keywords: [Wahrscheinlichkeit, Würfel, Kniffel, Yahtzee, Chancen, Brüche, Prozent]
creator:
  name: mrsimpson
  url: https://github.com/mrsimpson
source: https://github.com/mrsimpson/kniffel-trainer
fitness:
  account: false
  install: false
  storage: device
  thirdParty: none
  checked: false
```

### Completed

## Plan

<!-- Confirmable in one read. After the confirmation: work on your own (creator turns to the listing: max 3). -->

### Tasks

- [x] Write the Code tasks under "Code": pages or screens, content, what each shows; each ends in a commit.
- [x] Load the archetype's skill and skill `lernapps-exercise-patterns`. Write "Content method".
- [x] Show the creator, short: goal, competencies by chapter, entry draft, tasks; the content method in plain words
      (what learners see and do, what it cannot do). Max 2 questions.
- [x] Each component or interactive exercise: show a sketch (static SVG or image, or the steps with what learners
      see after each). Words alone are not enough.
- [x] **Checkpoint:** confirm the plan and the content method. Stop and wait for an explicit yes. Changes → change,
      ask again. No `create` before the yes.
- [x] Set `phase: code`.

### Content method

<!-- One line each: exercise patterns and where; figures and how made; data files; each component, what it checks
and cannot; how a later agent adds a chapter. Becomes the content guide in Code. -->

- **Muster 1, berechnen:** Chancen bestimmt das Kind nicht nur ablesen. In `erklaeren` und `joker` kommt gelegentlich eine kurze Rechenfrage („Wie groß ist die Chance auf eine 6 mit einem Würfel?") mit Bruch- und Prozenteingabe; Zahlen kommen aus dem Spielstand (gezogener Wurf), Fehler werden erklärt.
- **Muster 2, entscheiden:** Der Zug ist die Übung. Das Kind wählt Haltemenge und Feld; der Trainer vergleicht mit dem besten Zug (nach erwarteten Punkten) und begründet, auch bei gleich guten Zügen.
- **Muster 3, begründen (Joker):** Der Joker fragt zuerst („Welche Zahl hast du am häufigsten?"), zeigt dann Chancen, erst zuletzt die Empfehlung. Das Kind kann stoppen.
- **Daten:** `src/data/categories.ts` (Felder, Regeln, Punkte), `src/data/hints.ts` (Hinweisstufen je Lage), `src/messages/de.json`, `en.json` (alle Texte).
- **Abbildungen:** Würfelbilder und Chancenbalken als SVG, im Zustand berechnet; Text-Alternative für jedes Bild (`accessible`).
- **Komponenten:** Kniffelblock (Zentrum, zeigt Felder und Punkte, meldet die Aktion Feld wählen); Coach-Karte und Joker-Karte (kräftige Farbe, zeigen nur Text); Würfelreihe (zeigt Zustand, meldet Aktion „halten"); Punktezettel (zeigt Felder, Aktion „wählen"); Chancen-Panel (zeigt Bruch und Prozent, prüft nichts); Trainer-Panel (zeigt Empfehlung, Begründung); Bestenliste (zeigt gespeicherte Ergebnisse).
- **Was der Trainer nicht kann:** Er rechnet nach erwarteten Punkten für den laufenden Zug (höchstens zwei Nachwürfe und ein Feld), nicht den perfekten Plan für das ganze Spiel. Das sagt die Start- und Hilfeseite offen.
- **Neues Kapitel / neue Hilfe:** Neue Hinweisstufe = Eintrag in `src/data/hints.ts` und Texte in beiden Sprachen; neues Feld = Eintrag in `categories.ts` samt Test.
- **Rechnen statt Behaupten:** Alle Chancen und Wertungen werden vom Kern berechnet und mit Playthroughs und Tests geprüft, nie von Hand in Texte geschrieben.

### Completed

## Code

<!--
- Commit after each task; the hooks check. Pre-commit fails → read node_modules/.cache/lernapps/pre-commit.log.
- Fix from the message; never bypass a hook.
- Undecidable → choose, mark "(guess)" under "Key decisions", go on.
- `create` needs git, Node ≥ 22.18, github.com, codeload.github.com, registry.npmjs.org. Blocked → ask the creator
  to allow it, rerun. Never write the app by hand.
-->

### Tasks

- [ ] Only after the confirmation: in this plan's folder, `npx --yes github:lernapps/tooling#exp/compact-guidance create
      --archetype <archetype>`. Keeps this plan.
- [ ] `git switch work`, then `npm install` (dependencies, git hooks). From now on: `npx lernapps check`.
- [ ] Commit the generated app with this plan on `work`.
- [ ] Load skill `lernapps-app` and the archetype's skill.
- [ ] Fill the content guide `.agents/skills/app-content/SKILL.md` from the plan and its content method: replace
      every placeholder comment with concrete instructions (files, ids, data files, one example). Delete its top
      comment. `grep -c "FILL IN" .agents/skills/app-content/SKILL.md` must print 0. Commit it before any content.
- [ ] **Kern: Würfel, Wertung, Daten.** `src/core/` mit Startwert-Zufall (Seed), Würfeln, Halten, Wertung aller 13 Felder; `src/data/categories.ts` (Felder, Punkte). Playthrough `wertung`. Commit.
- [ ] **Kern: Chancen-Rechner.** Exakte Brüche durch Aufzählen aller Wurfausgänge; Chance auf ein Feld bei 0, 1 oder 2 Nachwürfen und gegebener Haltemenge. Playthrough `chancen`. Commit.
- [ ] **Kern: Trainer.** Bewertet alle Haltemengen und Felder nach erwarteten Punkten, wählt den besten Zug, liefert Begründung als Schlüssel plus Zahlen. Playthrough `trainer`. Commit.
- [ ] **Kern: Spielablauf und drei Routen.** `erklaeren`, `joker`, `spielen`; Umfang 6 oder 13 Runden; Joker-Schritte; Bewertung jedes Zuges. Playthroughs je Route. Commit.
- [ ] **Optik und Spielgefühl.** Eigene Gestaltung der App-Seite: Kniffelblock wie aus Papier im Zentrum (Zettel, Zeilen, Stiftschrift, Schatten), Würfel als SVG mit Wurf-Animation auf dem Tisch, Spielbrett im Vollbild-Overlay mit Pause-Knopf (Escape), Coach- und Joker-Karten als deutlich abgesetzte Texte mit kräftigen Farben und Hintergründen (je eine Farbe pro Rolle, Kontrast WCAG AA, nicht nur Farbe als Unterscheidung), Belohnungsmomente (Punkte zählen hoch, Kniffel-Moment) ohne Blitzen. Contrast und 360 px bleiben erfüllt. Commit.
- [ ] **Oberfläche: Würfel und Zettel.** Fünf Würfel (halten per Taste/Tipp), Wurf-Knopf, Punktezettel mit allen Feldern, Spielende. Commit.
- [ ] **Oberfläche: Erklärmodus.** Coach mit Chancen-Ringen (Bruch und Prozent) und Ansicht So geht's mit Baum; Vergleich der Felder, Begründung zum besten Zug. Commit.
- [ ] **Oberfläche: Baum.** Baumdiagramm-Komponente (SVG), die aus dem Zustand gezeichnet wird: Äste, Wege, Beschriftungen je Stufe; Text-Alternative. Commit.
- [ ] **Oberfläche: Joker-Modus.** Joker-Knopf mit 3 Stufen am Baum (leer, Äste, Lösung), Eingabefelder für Brüche; Rückmeldung nach jedem Zug. Commit.
- [ ] **Oberfläche: Spiel mit Highscore.** Keine Hilfe; Bestenliste (Punkte, Datum, getrennt nach 6 und 13 Runden, ohne Namen) über `createStorage`. Commit.
- [ ] **Texte Deutsch und Englisch.** `src/messages/de.json`, `en.json`; `src/app.yaml` mit Sprachen, Fähigkeiten, Startseite. Commit.
- [ ] **Barrierefreiheit und 360 px.** Tastatur für alles, `announce` bei Wurf, Zug und Ergebnis, Kontrast, Fokus. Commit.
- [ ] **Docs-Webseite mit Screenshots.** Seite in `docs/`, die die Anwendung Schritt für Schritt erklärt; die Bilder entstehen in den E2E-Tests (Browser-Screenshots je Modus, Desktop und 360 px) und werden beim Testlauf neu erzeugt; Text-Alternativen, Deutsch und Englisch. Prüfen, wie sich das mit Build, `pages-reachable` und den Vorgaben des Tooling verträgt (vorher Skill/Regeln lesen). Commit.
- [ ] **Architektur (arc42) und `npx lernapps check`.** Commit.
- [ ] Content guide still matches what was built (`app-content-matches`); `grep -c "FILL IN"` prints 0.
- [ ] `npx lernapps check` passes.
- [ ] Every box of Explore, Plan and Code ticked.
- [ ] Set `phase: commit`.

### Completed

## Commit

<!--
- Push to `main` = publish (workflow `Pages`, job `deploy`). Until the creator's yes: branch `work`.
- Only `main` publishes; it must be the default branch. Explore set up branches and Pages; here: verify.
- A push of only `.vibe/` publishes nothing; push the plan when a task says so.
- Every push to `main` needs a run of `Pages`: none after a minute
  (`gh run list --workflow Pages --branch main --commit <commit>`) → `gh workflow run Pages --ref main`.
- "403 Resource not accessible by integration" → a click for the creator (skill `lernapps-github`). Never push to
  trigger a run.
-->

### Tasks

- [ ] `git push -u origin work` (not `main`). Pre-push runs the heavy checks; fix failures.
- [ ] Verify over REST: default branch `main` (`gh api repos/<owner>/<repo> --jq .default_branch`); Pages serves
      `gh-pages` from `/` (`gh api repos/<owner>/<repo>/pages`; "Not Found" = off). Not right and not yours to
      change → note the creator's click (skill `lernapps-github`).
- [ ] **Checkpoint:** publish. Ask before the app goes online; wait for the yes. Put the noted clicks into the same
      question.
- [ ] `git switch main`, `git merge --ff-only work`, `git push origin main`. Run started?
      `gh run list --workflow Pages --branch main --commit "$(git rev-parse HEAD)"`; none after a minute →
      `gh workflow run Pages --ref main` (refused: creator clicks Actions → Pages → Run workflow). Watch it
      (`gh run watch`). Fails → read the failed step, fix, push. Admin-only Pages setting → the run deployed
      anyway; after the creator's click the app appears without a new run.
- [ ] Open the address the job `deploy` printed ("published at ...", also in the run summary); confirm the app shows.
      Use that address, never a derived one; follow redirects. Do not wait for it yourself.
- [ ] Load skill `lernapps-listing`.
- [ ] Complete the entry draft (e.g. the address).
- [ ] **Checkpoint:** list. Ask before opening the listing pull request; wait for the yes.
- [ ] Fill the retrospective.
- [ ] Commit this plan on `main` and push it (listing check and review read it there).
- [ ] Open the listing pull request as the skill says; see it to "bestanden" (not "nicht bestanden") in the results
      comment.
- [ ] Plan changed since its last push → commit on `main`, push again.

### Completed

## Retrospective

<!-- At the end of Commit, before the listing pull request. Facts, short, no names. Read by review and evals. -->

### Phases reached

<!-- Last phase completed, checkpoints passed. E.g. "commit; confirmed, published". -->

### Failed checks

<!-- Each failed check: rule id, count. E.g. "`no-request-before-click`: 2". Not the pre-push count. -->

### Creator turns after the plan

<!-- Number of creator messages after the confirmation, topic of each. Target: max 3. -->

### Where I had to guess

<!-- Each gap in plan, skills, messages or answers, and your choice. "None" if none. -->
