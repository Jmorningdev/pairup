---
doc: scope
status: approved
---

# PairUp

## The Unique Kernel

Paste two lists — mentees with their ranked mentor choices, mentors with how many mentees they can take — and get a **stable** pairing (no mentee and mentor would both rather be with each other) where **every person gets a one-line reason** for their result.

## Who It's For

Volunteers and coordinators who run small mentoring programs (10–200 people): community groups, meetups, alumni networks, internal company mentoring. They collect choices in a form or spreadsheet and today pair people by hand.

## The Core Loop

Paste mentees → paste mentors → press **Make pairs** → read who goes with whom and why → copy the result as CSV.

## Inspiration & Identity

Hand-pairing invites "why did they get their first choice and I didn't?" questions. The deferred-acceptance algorithm (Gale–Shapley) answers that question mathematically, but the tools found while scoping this that use it are paid mentoring platforms or code libraries. PairUp puts it on one free page with no login.

## Why This Matters to the Learner

A proof that a well-known, explainable algorithm can replace a spreadsheet afternoon — and a practice run of taking a small product from scope to shipping with an AI coding agent.

## What "Working" Looks Like

- The example fills, and **Make pairs** shows paired mentees, open seats, and unpaired mentees with reasons.
- No mentor is over capacity; no blocking pair exists (checked by `node test.mjs` on 300 random cases).
- Rows copied from a spreadsheet (tab-separated: name column, choice columns, optional header row, timestamp and capacity columns) are read correctly; names match regardless of capitalization and spacing; unknown names are flagged, not silently dropped.
- Known limit: an unquoted comma inside a name in comma-separated rows (Lopez, Ana) splits the name; quoted cells (as form exports write them) and tab-separated rows are fine.

## The POC Boundary

One static page, English only, everything computed in the browser. No accounts, no storage, no server code.

## Later

Ties shown explicitly; a "mentors propose" mode; importing a CSV file directly.

## Explicitly Cut

Accounts, saving programs, emailing results, analytics, a paid tier.
