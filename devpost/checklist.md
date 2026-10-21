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

- [x] Example and a spreadsheet-export paste viewed at 375px and 1280px, light and dark (4 conditions): no horizontal scroll, no console errors, results scrolled into view, CSV checked from the clipboard

## Final Review

- [x] An independent review pass (reviewer not told what changed) found spreadsheet-paste and wording problems; fixed and re-checked
- [x] A deliberately broken algorithm (evicting the best instead of the worst) makes `node test.mjs` fail

## Code Tour and App Map

See "Components" and "File Structure" in `spec.md`.

## Revisions

- Wording of the "not paired" reason fixed after the first screenshots; example data changed so it shows 2nd choices and an unpaired mentee.
- After review: spreadsheet exports (timestamp, capacity columns), `x2` capacity removed (it misread names like "Alex 2"), reasons say "filled up with mentees ahead of them" instead of "was already full", seats shown per mentor, CSV gets a reason column and formula-safe cells, results scroll into view.
