---
# Read by the hooks, the review, the evals. Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json
archetype: interactive
# phase: explore | plan | code | commit. Set it on entering a phase.
phase: commit
# prePushFailures: failed pre-push runs of this increment, written by the hook. Never change it.
prePushFailures: 0
---

# Increment: Coach gibt sinnvolle Tipps

*Started 2026-10-18. Explore, Plan, Code, Commit.*

## Goal

Der Coach ist Begleiter, nicht Instructor: Er bewertet die Würfel, die das Kind selbst hält, und sagt klar, dass er das
tut. Er hebt keinen eigenen Haltevorschlag hervor. Zwei Sechser gehalten führen zu "Mit 6 6 zielst du auf Sechser:
etwa 17,5 Punkte", nicht zu "nimm Einser".

## Key decisions

- Ursache 1 (Screenshot 1): `adviseFor` (`src/core/advice.ts`) rechnet nur mit der Haltemenge des besten Zugs. Der Coach
  zeigt Karte, Ringe, "Du hältst" und Feldliste immer für den Rat (hier 2 2), nicht für das, was das Kind hält (4 4).
  Die Vierer fehlen deshalb in der Liste, und "Du hältst 2 2" stimmt nicht mit den blau markierten Würfeln überein.
  Neu: Der Coach zeigt Ringe, Baum und Feldliste für die gehaltenen Würfel des Kindes, und die Karte sagt das
  ausdrücklich ("Das hast du gehalten: … So gut wird es."). Ist nichts gehalten, rechnet er für alle fünf neu zu
  würfelnden Würfel und sagt das auch.
- Kein Haltevorschlag mehr (Wunsch des Erstellers): Die gestrichelte Hervorhebung der empfohlenen Würfel
  (`DiceRow.vue`) und der Satz "Halte … und nimm am Ende …" entfallen. Der Coach vergleicht, er gibt keine Anweisung.
  Die Rückmeldung nach dem Wurf und nach dem Eintragen (`FeedbackCard.vue`) bleibt. (guess)
- Ursache 2 (Screenshot 2, Tipp "nimm Einser"): Das Ziel ist das Feld mit dem größten Wert über seinem Durchschnitt ("par") bei der
  gehaltenen Menge. Mit 6 6 liegt Einser bei 1,3 − 2,1 = −0,8, Sechser bei 17,5 − 19,2 = −1,7, also gewinnt Einser
  als "Ziel". Einser ist aber nur die Notlösung, falls es nicht klappt; die gehaltenen Würfel zielen auf Sechser.
  Neu: Ziel = bestes Feld unter denen, zu denen die gehaltenen Würfel passen (Zahlfeld: gehaltene Zahl; Pasch, Kniffel:
  gehaltene Gleiche). Die Karte nennt es als Beobachtung: "Mit 6 6 zielst du auf Sechser: etwa 17,5 Punkte".
- Die Feldliste zeigt, was jedes Feld mit diesem Halten im Schnitt bringt: zuerst das Ziel, dann die Felder, zu denen die
  gehaltenen Würfel auch passen, dann der Rest in der Reihenfolge des Blocks; fünf sichtbar, der Rest unter "Alle Felder".
  Die erste Sortierung nach "über dem Durchschnitt" brachte Einser, Zweier, Dreier nach vorn und wurde dafür ersetzt. (guess)
- Der Satz "Halte 2 2 und nimm am Ende Zweier: etwa 5 Punkte" ist für Kinder unverständlich (Erwartungswert unbekannt).
  Neu: Die Punkteverteilung zeigt, wie oft welche Punkte herauskommen; der Durchschnitt ist ein Strich darin. Das Wort
  "erwartet" fällt nicht. (Wunsch des Erstellers)
- Zwei Commits in diesem Inkrement: (1) Grundkorrektur mit Punkteverteilung, (2) Zahlenleiste und Ergebnisgitter für
  Full House und Straßen (Wunsch des Erstellers).
- Die Rechnung nach "par" bleibt für die Wahl der Haltemenge. Sie ist eine Näherung für den laufenden Zug; ein
  Spielplan für das ganze Blatt (Bonus) bleibt unberücksichtigt und wird offen gesagt.

## Notes

- Keine neuen Fähigkeiten, Korrektur an Kapitel 3 ("begründen, welche Würfel ich behalte").
- Inhaltsführer `app-content` ändert sich nur, wenn sich die Regel für das Ziel in der Beschreibung des Coachs ändert.

## Explore

### Tasks

- [x] Ursachen im Code finden (`src/core/advice.ts`, `src/ui/CoachCard.vue`).
- [x] Set `phase: plan`.

### Answers

- Ersteller: Coach gibt seltsame Tipps: (1) Vierer, die das Kind hält, fehlen in der Bewertung; (2) bei zwei Sechsern
  im ersten Wurf empfiehlt er "nimm am Ende Einser: etwa 1,3 Punkte".

### Completed

## Plan

### Tasks

- [x] Code-Aufgaben schreiben.
- [x] **Checkpoint:** Plan bestätigt ("mach das in zwei Commit in diesem Inkrement"), dazu: Erwartungswert muss aus der
      Visualisierung hervorgehen (Punkteverteilung).
- [x] Set `phase: code`.

### Content method

- Muster "entscheiden" und "erklären" des Inhaltsführers bleiben. Keine neue Komponente. Zahlen kommen aus dem Kern,
  nie von Hand.

### Completed

## Code

### Tasks

Commit 1: Der Coach begleitet (Grundkorrektur).

- [x] Kern (`src/core/advice.ts`, `engine.ts`): `lookAt(würfel, haltemaske, würfe, offeneFelder)` bewertet die gehaltenen
      Würfel: Ziel nach Passen (Zahlfeld, Pasch/Kniffel, Full House, Straßen; Chance nur als Rückfall), Feldliste mit
      dem Ziel zuerst, Ringe und Baum für einfache Ziele, **Punkteverteilung** (wie oft welche Punkte herauskommen,
      Durchschnitt markiert) aus der Rechenmaschine. `adviseFor` nutzt dieselbe Ziel-Logik (Joker, Rückmeldung).
- [x] Spielzustand: `coach` im Zustand, neu berechnet nach jedem Wurf und bei jedem Halten/Loslassen.
- [x] `CoachCard.vue`: sagt, dass er die gehaltenen Würfel bewertet ("Du hältst … Das wird daraus."); Beobachtung
      statt Anweisung; Punkteverteilung als Säulen mit Satz "Spielst du diese Lage 100-mal, kommen so viele Punkte
      heraus; im Schnitt etwa …". Kein "nimm am Ende …". `DiceRow.vue`: keine Hervorhebung beim Coach. Auch der Satz des
      Jokers (Stufe 3) sagt "im Schnitt" und zeigt die Punkteverteilung. Texte in `de.json` und `en.json`.
- [x] Tests und Playthrough: zwei Sechser gehalten → Ziel Sechser; Vierer gehalten → Vierer in Liste und Ringen;
      Punkteverteilung summiert sich auf 100 %.
- [x] `npx lernapps check` besteht; Commit 1.

Commit 2: Untere Hälfte sichtbar machen.

- [x] Kern: Chance, dass ein Feld klappt (exakt für einen Wurf, Prozent für zwei Würfe) für Full House, Straßen,
      Chance-Rückfall; **Zahlenleiste** (was gehalten wird, was hilft); **Ergebnisgitter** für 1 bis 2 freie Würfel
      (6 oder 36 Kästchen, günstige gefärbt).
- [x] `CoachCard.vue`: Ringe, Zahlenleiste und Ergebnisgitter statt Baum bei Full House und Straßen; bei 3 oder mehr
      freien Würfeln sagt der Coach offen, dass das Abzählen zu groß ist. Textversion für das Gitter. Texte DE/EN.
- [x] Tests und Playthrough (3 4 5 gehalten, Kleine Straße: 20 von 36); `app-content` (Coach, Ziel, Punkteverteilung,
      Gitter) beschreiben.
- [x] `npx lernapps check` besteht; Commit 2.

Zum Schluss:

- [x] Alle Kästchen von Explore, Plan und Code abhaken. Set `phase: commit`.

### Completed

## Commit

### Tasks

- [ ] Push auf den Arbeitszweig; Checks grün.
- [ ] **Checkpoint:** veröffentlichen? Auf das Ja warten.
- [ ] Retrospektive füllen.

### Completed

## Retrospective

### Phases reached

### Failed checks

### Creator turns after the plan

### Where I had to guess
