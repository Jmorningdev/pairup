---
doc: checklist
status: approved
---

# Build Checklist

## Slices

- [x] Parse pasted lists (colon form, spreadsheet rows, header row, capacities, duplicates)
- [x] Deferred acceptance with capacities and "passed over" reasons
- [x] Page: inputs, example, results, warnings, CSV copy
- [x] Tests: fixed cases + 300 random stability checks (`node test.mjs`)
- [x] Deploy to Cloudflare Workers

## Hands-on Checkpoints

- [x] Example viewed at 375px and 1280px, light and dark: no horizontal scroll, no console errors, results scrolled into view
- [x] Spreadsheet header rows ("Name / Mentor 1 / Mentor 2", "Your name / Preferred mentor / Backup mentor", "Mentor / Capacity"), a form CSV export with timestamps, e-mails and a quoted "Lopez, Ana", and capacities of 0, "2 mentees" and "two" — each run in the browser and in `test.mjs`; CSV read back from the clipboard

## Final Review

- [x] Two independent review passes over the page and the docs; their findings were fixed and re-run
- [x] A deliberately broken algorithm (evicting the best instead of the worst) makes `node test.mjs` fail

## Code Tour and App Map

See "Components" and "File Structure" in `spec.md`.

## Revisions

- Wording of the "not paired" reason fixed after the first screenshots; example data changed so it shows 2nd choices and an unpaired mentee.
- Spreadsheet and form-export rows read by header; the `x2` capacity form removed (it misread names like "Alex 2").
- Reasons say "filled up with mentees ahead of them" or "has no seats", matching what the algorithm did; seats shown per mentor.
- CSV gains a reason column and formula-safe cells; results scroll into view.
