# Cross-cutting Concepts

<!-- From @lernapps/app-templates 0.27.0 (the generic part and the interactive extension): lernapps update replaces this file except the app sections, between <!-- app: begin … --> and <!-- app: end … -->, which hold the app's own architecture. -->

The concepts every lernapps app implements. The extensions add their archetype's concepts.

## Generic architecture and extensions

The archetypes share their quality goals, so they share this architecture. The generic part defines the shared
runtime, the tooling and what every app keeps. Each extension adds its archetype's runtime and the parts its creator
writes, under ids the generic part names (`bb-archetype-runtime`, `bb-build`, `bb-render`, `bb-shell`, `bb-e2e`,
`if-archetype-content`, …). An app's architecture is the generic part followed by its extension, chapter by chapter.
An interactive app adds its own blocks below its extension's parts. The building blocks reach two levels, so every
interface fits in a view.

```arc42
:::concept
id: concept-archetype-extension
title: Generic architecture plus one extension per archetype
category: structure
:::
```

## Determinism by the seed in the address

Whatever an app draws at random comes from a seed in the address. So the same address gives the same order, task or
round. A learner, a teacher, a tutor and the tests can open it again. Each extension says how its archetype uses the
seed.

```arc42
:::concept
id: concept-determinism
title: Determinism by the seed in the address
category: testing
:::
```

## Readable without JavaScript

Every app has static pages that describe it without JavaScript. Links, language switch and footer are plain links.
What needs JavaScript says so. How much more reads without JavaScript depends on the archetype; each extension says.

```arc42
:::concept
id: concept-readable-without-js
title: Readable without JavaScript
category: accessibility
:::
```

## Languages

Every page exists once per declared language, German at the root. An app may declare only languages its runtime has
texts for. Learner texts live in the creator's data or message files, never as strings in code.

```arc42
:::concept
id: concept-languages
title: Languages
category: i18n
:::
```

## Accessibility by default

Pages meet WCAG 2.1 AA and work at 360 px by default. An app that cannot declares its limits in its entry
(`dec-accessibility-default`). Feedback is announced to screen readers, and the focus follows it. `lernapps check`
tests the built pages.

```arc42
:::concept
id: concept-accessibility
title: Accessibility by default, deviations declared
category: accessibility
:::
```

## Component rules

The build and the lint rules check an app's own Vue components and the modules they import:

- no network access;
- no code built from strings and no raw HTML;
- imports only from Vue, the runtime, the tooling's helpers and the app's own files; an interactive app may also use
  the libraries in its dependencies, never a URL;
- browser globals only after mounting, because the build renders without a browser.

```arc42
:::concept
id: concept-component-rules
title: Component rules
category: security
:::
```

## Device storage

What an app remembers goes through the storage wrapper, under the app's own prefix, because all apps share one
origin. When storage is blocked or full, the app remembers nothing and keeps working. A quota of 100 kB per app is
decided (`dec-small-storage`).

```arc42
:::concept
id: concept-device-storage
title: Device storage
category: persistence
:::
```

## Low stimulation (advice)

Advice, not a check. The skills recommend no flashing, calm motion and sound off by default, and say why: children,
attention, seizures. The creator's assistant follows them. A settings dialog is out of scope (`dec-no-settings`).

```arc42
:::concept
id: concept-low-stimulation
title: Low stimulation (advice)
category: accessibility
:::
```


The interactive archetype's concepts, besides the generic ones.

## Core and shell

The core is the app's logic in pure TypeScript without DOM, and its state is plain JSON.
It starts a round, takes one input at a time and, if it moves on its own, lets time pass (see the core contract).
Inputs are typed and extensible; the components turn any device input into them (`dec-typed-input`).
The shell keeps the state and hands it to the components, which only show it.
So the same core runs in Node at build and in the browser.

```arc42
:::concept
id: concept-core-and-shell
title: Core and shell
category: structure
:::
```

## Playthroughs

A playthrough is data: a seed, a route, the parameters of the address if any, and steps of inputs.
Each step names the state, or a part of it, or the announcement it expects.
The build plays it against the core, and the end-to-end tests play the same inputs in the browser.
So behaviour is specified once and checked in both places.
A step can let time pass in ticks. No other time passes, so a real-time core is checked deterministically.
Property tests of the core over fixed seeds are not built yet.

```arc42
:::concept
id: concept-playthroughs
title: Playthroughs as data
category: testing
:::
```

## Hash routes

Modes and levels are routes declared in `src/app.yaml`. Each has an address `app/#<id>`.
The start page and the app page link to them. The core starts with the route of the address, else the first route.
So a catalog entry's topics can point to a route, and `entry-links-resolve` can check it.

```arc42
:::concept
id: concept-hash-routes
title: Hash routes
category: navigation
:::
```

<!-- app: begin -->
<!-- app: end -->
