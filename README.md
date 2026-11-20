# Leonida Legend — GTA VI Trophy Guide & Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![make.fun rank](https://make.fun/badge/gta6-trophy-guide-01/ngadukun/leonida-legend-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![make.fun reward](https://make.fun/badge/gta6-trophy-guide-01/ngadukun/leonida-legend-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Entry for make.fun's
[gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01)
bounty: a free, open-source, fully offline trophy guide and tracker for
Grand Theft Auto VI on PS5.

## What it is

A static web app (open `app/index.html`, or `node serve.ts` and visit
localhost:8080) with:

- **All 55 official trophies** — name, description, tier and PSN points in
  `app/data/trophies.json`, matching the official PSN list exactly.
- **A guide to every trophy**, written from its official description: what
  to do, where and when, and what can go wrong — each guide names its
  source, and the cryptic hidden trophies are flagged as exactly that
  rather than dressed up with invented walkthroughs.
- **A tracker**: tick trophies off as you earn them; progress, points and
  percentage update live and persist in the browser (localStorage), with
  JSON export/import to move progress between machines.
- **Filters and a spoiler setting**: search, filter by kind (story,
  strands, activities, crime, partners, money…) or tier, hide what you
  have earned, and keep the 28 hidden trophies masked until you choose to
  reveal them.
- **A roadmap to the platinum** in five phases — story, strands before the
  finale, the open-world grind, crime/partners/money, then 100% — plus a
  **Watch-outs** view collecting the 16 trophies that can go wrong: strand
  finales, the choice to save before, the failure not to reload away, and
  the one clean-run robbery.

No network, no build step, no accounts, no artwork but CSS. Unofficial fan
work; not affiliated with Rockstar Games or Take-Two Interactive.

## Hand-in

`node main.ts` copies `app/` and `screenshots/` to the output directory
and writes `dossier.json` with the vendored make.fun library
(`vendor/makefun-frontend.ts`, shipped byte-for-byte as the scorer
requires). Screenshots are listed in `shots.json`.
