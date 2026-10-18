---
# Read by the hooks, the review, the evals. Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json
archetype: interactive
# phase: explore | plan | code | commit. Set it on entering a phase.
phase: plan
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
- Die Feldliste zeigt, was jedes Feld mit diesem Halten im Mittel bringt, und nennt zuerst das Ziel. (guess)
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
- [ ] **Checkpoint:** Plan bestätigen lassen. Stop und auf ein ausdrückliches Ja warten.
- [ ] Set `phase: code`.

### Content method

- Muster "entscheiden" und "erklären" des Inhaltsführers bleiben. Keine neue Komponente. Zahlen kommen aus dem Kern,
  nie von Hand.

### Completed

## Code

### Tasks

- [ ] Kern: `adviseFor` bekommt die gehaltene Maske des Kindes; liefert Ziel, Optionen, Ringe und Baum für diese
      Maske. Ziel nach dem Passen der gehaltenen Würfel. Der beste Zug bleibt nur für die Rückmeldung im Kern.
- [ ] Spielzustand: Bei jeder Änderung der gehaltenen Würfel den Rat neu berechnen.
- [ ] `CoachCard.vue`: sagt, dass er die gehaltenen Würfel bewertet; Beobachtung "ziele auf …" statt Tipp. `DiceRow.vue`:
      keine Hervorhebung der empfohlenen Würfel. Texte in `de.json` und `en.json`.
- [ ] Tests und Playthrough: zwei Sechser im ersten Wurf → Ziel Sechser; Vierer gehalten → Vierer in der Liste und
      Ringe für 4.
- [ ] `app-content` prüfen, ggf. anpassen. `npx lernapps check` besteht.
- [ ] Alle Kästchen von Explore, Plan und Code abhaken. Set `phase: commit`.

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
