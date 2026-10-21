# PairUp

Fair mentor–mentee matching from ranked choices, on one page. Paste your mentees' ranked mentor choices and each mentor's capacity; PairUp returns a **stable** pairing (no mentee and mentor would both rather be with each other) and tells every person why they got their result.

**Live:** https://pairup.waitlab.workers.dev — nothing you paste leaves your browser.

## Run

```sh
cd public && python3 -m http.server 8799   # open http://localhost:8799
node test.mjs                              # tests, Node 18+
npx wrangler deploy                        # deploy to Cloudflare Workers
```

## How it works

Mentee-proposing deferred acceptance (Gale–Shapley) with mentor capacities. See [`devpost/spec.md`](devpost/spec.md).

## Planning docs

Made with the Devpost *Build With AI: Basics* Skill Pack: [scope](devpost/scope.md) · [PRD](devpost/prd.md) · [spec](devpost/spec.md) · [checklist](devpost/checklist.md).

## How this was built

Built with an AI coding agent (Claude Code), which wrote the code and docs; the human entrant chose to enter and reviews the submission.

## License

[MIT](LICENSE)
