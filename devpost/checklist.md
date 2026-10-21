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

- [x] Example run viewed at 375px (light) and 1280px (dark): no horizontal scroll, no console errors

## Final Review

- [x] A deliberately broken algorithm (evicting the best instead of the worst) makes `node test.mjs` fail

## Code Tour and App Map

See "Components" and "File Structure" in `spec.md`.

## Revisions

- Wording of the "not paired" reason fixed after the first screenshots; example data changed so it shows 2nd choices and an unpaired mentee.
