// Leonida Legend — hand-in program for gta6-trophy-guide-01.
//
// The guide itself is the static web app in app/ (open app/index.html in a
// browser; it needs no network and no build step). This program copies app/
// and screenshots/ into the output directory and writes dossier.json with
// the vendored make.fun library, byte for byte as the scorer's copy writes
// it — vendor/makefun-frontend.ts is left exactly as the kit shipped it.
//
// Run locally:  MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Pre-flight: the gate refuses a guide whose data file does not name every
// trophy with a guide of its own, or whose screenshots fall outside 3-4.
// Fail here, in the open, rather than at the scorer.
const data = JSON.parse(readFileSync(join(here, "app", "data", "trophies.json"), "utf8"));
const trophies = Array.isArray(data) ? data : data.trophies;
if (!Array.isArray(trophies) || trophies.length !== 55) {
  throw new Error(`trophies.json must list 55 trophies, found ${trophies?.length}`);
}
for (const t of trophies) {
  if (!t.name || !t.guide || !String(t.guide).trim()) {
    throw new Error(`trophy ${t.id ?? "?"} is missing a name or a guide`);
  }
}
const shots = existsSync(join(here, "screenshots"))
  ? readdirSync(join(here, "screenshots")).filter((f) => /\.(png|jpe?g)$/i.test(f))
  : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shots.length}`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, "app"), join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });
}

// The scorer's caps (reference/gate.json): at most 4 screenshots of at most
// 256 KiB each, at most 993 files and 48 MiB under app/.
writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
console.log(`dossier written to ${out}`);
