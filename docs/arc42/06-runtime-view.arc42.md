# Runtime View

<!-- From @lernapps/app-templates 0.27.0 (the generic part and the interactive extension): lernapps update replaces this file except the app sections, between <!-- app: begin … --> and <!-- app: end … -->, which hold the app's own architecture. -->

Six scenarios that every app shares. Each extension adds its archetype's own scenarios.

## Opening the pages

A learner, teacher or parent opens the app's address. The host serves static pages that the build rendered. What a
page shows without JavaScript depends on the archetype. The language switch is a plain link to the same page in the
other language. An unknown address gets the 404 page, which leads to the start page.

```arc42
:::runtime-scenario
id: scenario-pages
title: Opening the pages
trigger: A learner, teacher or parent opens the app's address
involves: bb-render, bb-runtime
:::
```

## Learning in the browser

The page starts the archetype's code. Where the archetype draws at random, it takes the seed from the address. The
code shows the learner's progress and announces changes to screen readers. Its texts are in the page's language.

```arc42
:::runtime-scenario
id: scenario-learn
title: Learning in the browser
trigger: The learner opens a page with JavaScript and answers, practises or plays
involves: bb-shell, bb-tooling
:::
```

## Remembering on the device, storage blocked or full

The app loads and saves values through the storage wrapper. When storage is blocked or full, loading gives nothing
and saving fails. The app keeps working and remembers nothing.

```arc42
:::runtime-scenario
id: scenario-device-storage
title: Remembering on the device, storage blocked or full
trigger: The archetype's code loads or saves a value
involves: bb-shell, bb-tooling
:::
```

## Working with the skills

The creator's assistant loads the app's skills. It writes what the archetype allows and runs `lernapps check`.
`lernapps update` brings new versions of the platform's skills.

```arc42
:::runtime-scenario
id: scenario-skills
title: Working with the skills
trigger: The creator's assistant starts work on the app
involves: bb-skills, bb-tooling
:::
```

## Building with the checks

The build first validates what the creator wrote and runs the archetype's checks. Only then does it write every page
in every language. Any problem fails the build with one line per problem.

```arc42
:::runtime-scenario
id: scenario-build
title: Building with the checks
trigger: The creator, a git hook or CI runs the build
involves: bb-tooling, bb-archetype-runtime, bb-build, bb-validation, bb-render, bb-runtime-texts, bb-runtime
:::
```

## End-to-end tests before a push

The pre-push hook and CI serve the built app and run the archetype's tests in a browser, at desktop width and at
360 px. The test cases come from what the creator wrote. `lernapps check` also tests accessibility, width and requests
on every page it visits.

```arc42
:::runtime-scenario
id: scenario-e2e
title: End-to-end tests before a push
trigger: The pre-push hook or CI runs lernapps check --pre-push
involves: bb-tooling, bb-e2e, bb-render, bb-shell, bb-runtime-texts
:::
```


The interactive archetype's own scenarios, besides the generic ones.

## Playing on the app page

The learner opens the app page, possibly with a seed, a route or data from another app in the address.
The app starts in that round and route; without a seed it starts a random round.
The learner plays with keys, pointer or touch. Each input changes the state, and the app shows the new state.
When the app moves on its own, its state changes with time too.
A route link starts the same round in another mode or level.
The language switch opens the same round in the other language.
Texts follow the page's language, and screen readers announce changes.

```arc42
:::runtime-scenario
id: scenario-play
title: Playing on the app page (input, ticks, route change)
trigger: The learner opens the app page, gives an input, or follows a route link
involves: bb-render, bb-shell, bb-interactive-core, bb-interactive-data, bb-interactive-ui, bb-interactive-messages, bb-tooling
:::
```

## Building with the playthroughs

The creator, a git hook or CI runs the build. It checks the description, the playthroughs and the UI.
It checks that the core keeps its contract and that every route starts.
It plays every playthrough twice and compares both plays with each other and with the expected states.
Only when all of this passes does it write the pages.

```arc42
:::runtime-scenario
id: scenario-interactive-build
title: Building with the playthroughs
trigger: The creator, a git hook or CI runs the build
involves: bb-build, bb-validation, bb-component-rules, bb-interactive-description, bb-interactive-core, bb-interactive-playthroughs, bb-render, bb-runtime-texts
:::
```

## Browser playthroughs

Before a push and in CI, the end-to-end tests check both pages without JavaScript in every language.
Then they play each playthrough in the browser at its address, with no time passing but its ticks.
After each step they compare the state and the announcement with the expected ones.
They also check that a route change and back gives the starting state again.
In an app with more languages they check that the other language shows the same state.

```arc42
:::runtime-scenario
id: scenario-browser-playthroughs
title: Browser playthroughs in the end-to-end tests
trigger: The pre-push hook or CI runs lernapps check --pre-push
involves: bb-e2e, bb-interactive-description, bb-interactive-playthroughs, bb-shell, bb-interactive-core, bb-interactive-ui, bb-runtime-texts, bb-tooling
:::
```

<!-- app: begin -->

## Playing a round with help

A round runs on the core's state alone: a throw takes the next dice from the seed, the trainer works out its advice
for the open fields, and entering a field rates the move against the best field. The table keeps the best five games
per length in the device storage when a plain game ends; the coach and the joker only show what the trainer worked out.

```arc42
:::runtime-scenario
id: scenario-kt-round
title: Playing a round, rating the move and keeping a high score
trigger: The learner throws, holds, enters a field or finishes a plain game
involves: bb-interactive-core, bb-kt-game, bb-kt-trainer, bb-kt-engine, bb-kt-scoring, bb-kt-table, bb-kt-help, bb-kt-tree, bb-tooling
:::
```

<!-- app: end -->
