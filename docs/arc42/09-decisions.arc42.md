# Architecture Decisions

<!-- From @lernapps/app-templates 0.27.0 (the generic part and the interactive extension): lernapps update replaces this file except the app sections, between <!-- app: begin … --> and <!-- app: end … -->, which hold the app's own architecture. -->

<!--
Arc42 chapter 9. Document the significant architecture decisions as Architecture Decision
Records (ADRs). Capture any choice that was expensive, risky, or that future maintainers
will wonder about.

Avoid redundancy with section 4 (solution strategy) — refer to it for the highest-level
choices and use this chapter for detail and rationale.

For each decision, write a ## section with a prose paragraph explaining the context,
the alternatives considered, and the rationale for the chosen option, followed by a DSL block.
Document rejected alternatives so future readers understand what was considered.

Status values:
  proposed   — under discussion, not yet in force
  accepted   — in force
  deprecated — no longer recommended but not yet replaced
  superseded — replaced by another decision

When a new decision replaces an old one, set status: superseded on the old decision
and add supersedes: <old-id> on the new decision.

The `date` field should be ISO 8601 (YYYY-MM-DD).
The `addresses` field links to quality goals and constraints this decision responds to.

See https://docs.arc42.org/section-9/ for further guidance.

Example:

## Stateless Token Authentication

The team evaluated session-based (server-side store) and token-based (stateless) authentication.
Stateless tokens were chosen to avoid a shared session store that would introduce a single point
of failure and complicate horizontal scaling.

```arc42
:::decision
id: dec-auth-stateless
title: Stateless Token Authentication
status: accepted
date: 2025-07-01
addresses: qg-security, qg-performance
:::
```

To supersede a decision, mark the old one and point to it from the new one:

```arc42
:::decision
id: dec-auth-old
title: Session-based Authentication
status: superseded
date: 2024-01-15
:::
```

```arc42
:::decision
id: dec-auth-new
title: OAuth2 Token Authentication
status: accepted
date: 2025-09-01
supersedes: dec-auth-old
:::
```
-->

The decisions every lernapps app shares. Owner decisions carry their date. Decisions made while building the runtime
are accepted because they are in force. Each extension adds its archetype's decisions; an interactive app adds its
own below these.

## Generic Architecture with One Extension per Archetype

Quiz, explainer and interactive app stay separate archetypes but share their quality goals. So they follow one
architecture: this generic part, plus one extension per archetype that adds only its own blocks and decisions. An
app's architecture is both together.

Rejected: one architecture per archetype, because it repeats the frame three times; one architecture with every
archetype's detail, because no app could take it as its own.

```arc42
:::decision
id: dec-generic-plus-extensions
title: A generic architecture plus one extension per archetype
status: accepted
date: 2026-10-16
addresses: qg-understandable, con-architecture-current
:::
```

## What Archetypes Share Lives in the Shared Runtime

The archetypes use some things alike, above all the questions: the quiz asks them, and the explainer's exercises use
the same types. Such shared things live in the shared runtime. The archetypes build on it, never on each other, and
the shared runtime depends on no archetype. The package's public paths stay stable when code moves, so generated apps
keep building. A test enforces both rules.

Rejected: archetypes importing each other, because that makes two archetypes one; copying the questions into
each archetype.

```arc42
:::decision
id: dec-shared-runtime-direction
title: Archetypes build on the shared runtime and never on each other
status: accepted
date: 2026-10-20
addresses: qg-understandable, con-runtime-unchanged
:::
```

## Vue Is Fixed for Components

An app's own components are Vue with TypeScript. So one set of component rules and checks holds for every app. What a
component draws stays free.

Rejected: a free choice of framework, because each framework would need rules of its own.

```arc42
:::decision
id: dec-vue-fixed
title: Vue with TypeScript is fixed for an app's components
status: accepted
date: 2026-10-16
addresses: con-vue-typescript, con-component-rules, qg-checkable
:::
```

## Small Storage with a Quota

All apps share the origin's `localStorage`. The only storage is the tooling's wrapper, under the app's prefix, with a
quota of 100 kB per app. The shared origin is accepted as a risk. The quota is not built yet.

Left out: a second, larger storage (IndexedDB).

```arc42
:::decision
id: dec-small-storage
title: localStorage through the wrapper with a 100 kB quota
status: accepted
date: 2026-10-16
addresses: con-state-on-device, con-storage-quota, con-frontend-only, qg-privacy, risk-shared-origin-storage, risk-storage-quota-not-built
:::
```

## No Size Limit, the Size in the Entry

The frame does not limit an app's size. The app's catalog entry states it. A page may show a loading indicator (not
built). An archetype may still limit the size of its own parts.

Rejected: a size budget for every app, because it would keep large interactive apps out.

```arc42
:::decision
id: dec-no-size-limit
title: No size limit; the size in the entry, an optional loading indicator
status: accepted
date: 2026-10-16
addresses: qg-accessibility
:::
```

## Accessibility by Default, Limits Declared

WCAG 2.1 AA and 360 px are platform rules. An app follows them by default. It may deviate where its idea needs it,
such as a game against the clock, and says so in its entry. Then the two checks only warn for it. Pages the runtime
renders from the creator's data always meet both. Low stimulation is advice in a skill, not a check.

Rejected: the rules as errors for every app, because that would exclude real-time games.

```arc42
:::decision
id: dec-accessibility-default
title: Accessibility as default with declared limits
status: accepted
date: 2026-10-16
addresses: con-accessibility-default, qg-accessibility, risk-accessibility-limits-not-built
:::
```

## No Settings Now

A settings dialog (time limit off, less motion, sound, pause) is out of scope for now. An app that needs one later
adds it to the frame, not on its own.

```arc42
:::ignore H001 a scoping decision of the owner (2026-10-16): it leaves something out and serves no quality goal of its own
:::
:::decision
id: dec-no-settings
title: No settings dialog for now
status: accepted
date: 2026-10-16
:::
```

## arc42 in the App, Only for Interactive Apps

Every app gets the generic architecture and its archetype's extension. Only an interactive app, whose code is free,
writes a part of its own. A quiz or explainer app writes none, because its archetype's data format fixes its
structure. Only what arc42 checks itself is checked: the architecture against the staged code before a commit, and
its validity in `lernapps check`. Neither is wired into apps yet. This repository already validates the generic part
with each extension, in its pre-commit hook and in CI.

Rejected: framework-specific conformance checks.

```arc42
:::decision
id: dec-arc42-in-app
title: arc42 in the app; only interactive apps add their own part
status: accepted
date: 2026-10-16
addresses: con-architecture-current, con-language, qg-understandable, risk-arc42-checks-not-wired
:::
```

## The Skill as the Interface to the Creator's Assistant

The guidance for the creator's assistant is a set of skills: one for every app and one per archetype. The assistant
loads and follows them. Advice that no check can give, such as how to write a good question, lives there, not in the
runtime.

```arc42
:::decision
id: dec-skill-interface
title: Skills as the interface used by the creator's assistant
status: accepted
date: 2026-10-16
addresses: qg-understandable
:::
```

## A New App Gets the Scaffold, Not the Example

Occasion: a new app used to copy the whole example app. The example's structure, topic and tone stayed long after the
plan said otherwise.

Decision: `lernapps create` copies only the archetype's scaffold: configuration, entry points and a placeholder as
start content. The template folder stays a complete example that the assistant can look up in the installed package.
This package lists the scaffold's files, because only it knows what is configuration and what is example. CI checks
the scaffold as an app, so a new app passes `lernapps check` from its first commit. `lernapps update` never writes
the scaffold again.

Rejected: a scaffold function exported by the package, because a clone of the templates would need the built package;
start content inside the template folder, because the template's checks would read it as part of the example.

```arc42
:::decision
id: dec-scaffold
title: A new app gets the scaffold and a placeholder, not the example app
status: accepted
date: 2026-11-02
addresses: qg-understandable
:::
```

## Tutor Variant

The optional tutor hands the task to the learner's own assistant after a click. A prompt and a static tutor page per
content page give it the task. It is built for the explainer only; its extension models it.

Rejected: a model running in the browser.

```arc42
:::decision
id: dec-tutor-variant
title: Tutor as a handoff to the learner's own assistant
status: accepted
date: 2026-10-16
addresses: risk-tutor-not-built, con-no-request-before-click, qg-privacy
:::
```


The interactive archetype's decisions, besides the generic ones. The decisions the runtime made when it was built
are accepted because they are in force. An app adds its own below these, for example canvas or DOM.

## One Archetype for All Kinds

Typing game, Kniffel trainer and proofreading app run differently: frame loop, turns, tasks.
But they share the frame and the rules. So one archetype carries them all, and its skill gives the shared principles.
Rejected: one archetype per kind, because each would repeat the same frame.
An app that needs explanation pages is an explainer with a component instead.

```arc42
:::decision
id: dec-one-archetype
title: One interactive archetype for every kind of app
status: accepted
date: 2026-10-16
addresses: con-runtime-unchanged, qg-understandable
:::
```

## The Runtime Owns the State and the Clock

The core should play the same in Node and in the browser.
So the core is pure TypeScript without DOM. The shell holds its state, starts it, passes it inputs and lets time pass
in fixed ticks. The components only show the state. A real-time app needs no loop of its own.
Rejected: state kept in components, because the build could not play it; a variable frame time, because it is not
deterministic.

```arc42
:::decision
id: dec-runtime-owns-state
title: The runtime holds the core's state and ticks it every 20 ms
status: accepted
date: 2026-10-16
addresses: qg-checkable, con-runtime-unchanged
:::
```

## Keys Are the Core's Input

Superseded by `dec-typed-input`. The first runtime took only keys as the core's input.
Pointer input reached the core disguised as a key.

```arc42
:::decision
id: dec-keys-as-input
title: Keys as the core's only input
status: superseded
date: 2026-10-16
addresses: qg-checkable, qg-accessibility
:::
```

## A Typed Input for the Core

Interactive apps will use more than keys and mouse: touch, gestures and more later.
So the core takes a typed input, such as a key or a pointer or touch action, and new kinds can be added.
Playthroughs record such inputs, and the components turn any device input into them.
So the build and the browser play the same steps. A core ignores a kind it does not know.
Rejected: keys as the only input, because pointer and touch would have to pose as keys.

```arc42
:::decision
id: dec-typed-input
title: The core's input is typed and extensible (key, pointer, touch, …)
status: accepted
date: 2026-10-16
supersedes: dec-keys-as-input
addresses: qg-checkable, qg-accessibility
:::
```

## start(seed, route)

Each mode or level needs an address that a catalog entry can point to.
So the core starts from a seed and the route of the address. The seed comes from the address, else at random.
So a round can be replayed and tested at its address.

```arc42
:::decision
id: dec-start-seed-route
title: The core starts from a seed and a route of the address
status: accepted
date: 2026-10-16
addresses: qg-checkable
:::
```

## Parameters of the Address as Data for the Core

Another app links to an interactive app with data the app starts from, such as a challenge for the coding workshop
(lernapps/coding).
So the core gets every parameter of the address except the seed as data when it starts, and again on a new route.
The runtime only passes them through. It does not check, log or store them. The core checks them and ignores what does
not fit. They are data, not routes: the routes stay in the hash.
A playthrough can name them, so they are tested like any start.
A core that needs no parameters stays as it is.

The language switch keeps the parameters, the seed and the route, so the other language opens the same round
(lernapps/app-templates#210). The links in the page without JavaScript stay plain.

Rejected: the root component reads the address and sends an action, because the core would start without the data and
lose it on every new route. Rejected: a fixed list of parameter names in the runtime, because each app has its own.
A back channel between apps is not part of this.

```arc42
:::decision
id: dec-address-params
title: The core gets the parameters of the address as data
status: accepted
date: 2026-11-26
addresses: qg-checkable
:::
```

## Playthroughs as Data

Every app needs its behaviour and its determinism checked, without writing test code.
So a playthrough is data: a seed, a route and steps of inputs with the state or announcement expected after them.
The build plays each against the core twice, and the browser plays the same inputs.
A step can let ticks pass. In the browser the tests' own clock counts them, because the browser's fake clock would also
stop the announcements. Property tests of the core are not built; until then the double play checks determinism.
Rejected: free test code as the only behaviour check, because each app would write and maintain its own.

```arc42
:::decision
id: dec-playthroughs-as-data
title: Playthroughs as data, played in the build and in the browser
status: accepted
date: 2026-10-16
addresses: qg-checkable, risk-no-core-property-tests
:::
```

## Libraries in the Dependencies

An interactive app may use libraries. Its code may import the packages in its dependencies, and the build bundles
them. `lernapps check` checks their licences. Imports from a URL, network APIs and unsafe HTML stay forbidden.
The explainer's components keep their narrower scope.
Rejected: only Vue, the runtime and the tooling helpers, because every app would then rewrite what a library does well.

```arc42
:::decision
id: dec-libraries
title: An interactive app may import the libraries in its dependencies
status: accepted
date: 2026-10-16
addresses: qg-privacy
:::
```

<!-- app: begin -->

## The Trainer Compares a Field With Its Average

The trainer aims for the field whose expected points are furthest above what that field brings on average (its par,
in `src/data/categories.json`), looking at one turn: two more throws and one field. Comparing only points would always
recommend the Chance, and a whole-game optimum is too heavy to explain to learners. The par values are approximations,
not a proven strategy; the start page says so.

```arc42
:::decision
id: dec-kt-par
title: The trainer compares a field with its average
status: accepted
date: 2026-10-18
addresses: qg-understandable
:::
```

## Highscores Stay on the Device

The best five games per length are kept in the learner's own browser, as points and day without a name. A shared
ranking would need a server, which the platform forbids.

```arc42
:::decision
id: dec-kt-highscores-local
title: Highscores stay on the device
status: accepted
date: 2026-10-18
addresses: qg-privacy
:::
```

<!-- app: end -->
