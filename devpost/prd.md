---
doc: prd
status: approved
---

# PairUp — Product Requirements

## The Core Journey

1. A coordinator opens the page (no sign-in).
2. They paste mentees as `Name: 1st choice, 2nd choice, …` or as spreadsheet rows.
3. They paste mentors as `Name (capacity)`, optionally followed by `: ranked mentees`.
4. They press **Make pairs**.
5. They see a summary (paired / got 1st choice / not paired), each mentor's mentees with "their Nth choice" and, when relevant, which higher choices were already full, open seats, and a "Not paired" list with reasons.
6. They press **Copy as CSV** and paste into their spreadsheet.

## Screens and Layout

A single page: title and one-paragraph explanation; two text areas side by side (stacked under 700px); buttons (Make pairs, Fill with an example, Copy as CSV after a result); results below.

## Look and Feel

Calm and plain, like a well-made utility: warm off-white background, one green accent, system fonts, monospace for the input areas. Follows the system dark mode.

## Features and Behavior

- **Parsing**: `:` separates name from choices; without `:`, tabs or commas do. Choices may be separated by `,` `;` tab or `>`. A first line that is a header ("Name", "Mentee", "Mentor name"…) is skipped. Blank lines and `#` lines are skipped. Names match ignoring capitalization and extra spaces. Rows copied from a spreadsheet are tab-separated: a header row (if any) marks timestamp, e-mail and capacity columns, which are not read as choices.
- **Capacity**: `(2)` after a mentor name, a capacity column, or a number cell in a mentor's row; default 1.
- **Matching**: mentee-proposing deferred acceptance. When a mentor gave no ranking, they prefer mentees who ranked them higher, then whoever appears first in the list.
- **Warnings**: duplicate names (first kept), choices that are not on the other list (skipped) — shown in a "Check these lines" box.
- Editing either list clears the old result.

## States and Boundaries

- Empty lists → "Add at least one mentee and one mentor first."
- A mentee with no choices → Not paired, "listed no mentors"; with choices that match nobody → "none of their choices matches a name on the mentor list".
- More mentees than seats → the rest are Not paired, naming the mentors that filled up.

## Product Decisions

- Mentee-proposing, because it is the best stable result for mentees (the side that asks).
- Explanations name only facts the algorithm used ("Priya filled up with mentees ahead of them"), and the page explains what "ahead" means, including the tie rule for mentors who gave no ranking.
- Nothing is sent to a server: names of real participants stay on the coordinator's computer.

## What We're Building

The page, the matching module, and a test script.

## Deferred From the POC

Mentors-propose mode, showing ties, importing a CSV file.

## Possible Later Enhancements

Minimum-one-mentee-per-mentor constraint; group mentoring (several mentees per session).

## Non-Goals

Scheduling meetings, messaging participants, storing programs.

## Open Questions

Do coordinators want mentor preferences to weigh more than mentee preferences? (Collect feedback after launch.)
