---
doc: spec
status: approved
---

# PairUp — Technical Spec

## How This Works, In Plain Language

Each mentee "asks" their top remaining mentor. A mentor holds on to the best askers up to capacity and turns away the rest. Turned-away mentees ask their next choice. Repeat until nobody can ask again. The result is stable: no mentee and mentor would both prefer each other over what they got.

## The Core Journey Through the System

`index.html` → `app.js` reads both text areas → `parseList()` turns lines into people → `match()` runs deferred acceptance and records who turned each mentee away → `app.js` renders summary, mentor cards, warnings and CSV.

## Stack

Plain HTML, CSS and JavaScript modules. No framework, no build step, no runtime dependencies. Tests use Node's built-in `assert`.

## Where It Runs and How Someone Tries It

- Live: https://pairup.waitlab.workers.dev (Cloudflare Workers static assets).
- Locally: `cd public && python3 -m http.server 8799`, then open http://localhost:8799 (any static server works).
- Tests: `node test.mjs` (Node 18+).
- Deploy: `npx wrangler deploy` (uses `wrangler.jsonc`).

## Look and Feel

CSS custom properties on `:root`, redefined under `prefers-color-scheme: dark`. Two-column grid collapses to one column below 700px.

## Components

### `public/match.js`
`parseList(text, withCapacity)` → `{ people, warnings }`; `match(mentees, mentors)` → `{ pairs, unmatched, openSeats, warnings }`; `blockingPairs()` for tests.

### `public/app.js`
DOM wiring: example data, rendering, HTML escaping, CSV copy.

## Data Model

Person: `{ name, prefs: string[], capacity }`. Pair: `{ mentee, mentor, choice, passedOver: string[] }`. Unmatched: `{ mentee, passedOver, noChoices }`. Nothing is persisted.

## File Structure

```
public/index.html   page and styles
public/app.js       UI
public/match.js     parsing and matching (no DOM)
test.mjs            assertions, incl. 300 random stability checks
wrangler.jsonc      deploy config (static assets only)
devpost/            scope, PRD, spec, checklist
```

## External Services and Dependencies

Cloudflare Workers (free plan) for hosting only. No APIs, no analytics, no cookies.

## Important Failure Modes

- Names spelled differently between lists → shown as warnings so the coordinator can fix them.
- Very large inputs: the algorithm is O(mentees × mentors) proposals; thousands of lines are fine in a browser.
- Clipboard blocked by the browser → the CSV button fails silently (acceptable for the POC).

## What Was Simplified and Why

No mentor-proposing option and no tie display, to keep one clear result. English only, for the hackathon audience.

## Decisions and Open Issues

- Unranked mentors break ties by the mentee's own ranking of them, then by list order — deterministic, so the same input always gives the same pairs.
