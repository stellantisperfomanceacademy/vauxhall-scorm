# Vauxhall Product & Technology 2026 — SCORM 1.2

A self-contained, on-brand SCORM 1.2 eLearning module for the Vauxhall 2026 range.
Built with the official Vauxhall Neue fonts, griffin logos, and design-system tokens.

## What's inside

- **Cover + objectives** — branded title screen and 4 learning objectives
- **History** — name origin (Sir Falkes de Breauté / the Griffin) + full 1857→2026 timeline with fun facts
- **Cars** — Corsa, Frontera, Mokka, Astra, Grandland (pitch, key facts, head-to-head, fun fact, press quotes, stat highlights)
- **Vans** — Combo-e Life, Vivaro Electric, Movano Electric
- **Retired models** — Crossland, Insignia (with replacement guidance)
- **Cheat sheet** — full-range comparison table
- **Quiz** — 12 questions, instant feedback, pass mark 75%, retake on fail
- **Navigation** — Next / Previous, progress bar, keyboard arrows
- **Completion** — passing the quiz reports `passed`; the final **Finish & Mark Complete** button reports `completed` to the LMS

## Self-contained

Fonts, logos, CSS and JS are all bundled — no internet/CDN required. Vehicle photos
are optional: branded placeholders show until you drop images into `images/` (see
`images/README.txt`).

## SCORM data reported

| Element | Value |
|---|---|
| `cmi.core.lesson_status` | `incomplete` → `passed`/`failed` (quiz) → `completed` (finish button) |
| `cmi.core.score.raw` / `.max` | quiz score out of 12 |
| `cmi.core.lesson_location` | current slide index (resume support) |

## Build the zip

From this folder (PowerShell), zip the package contents (manifest at the root):

```powershell
Compress-Archive -Path imsmanifest.xml,index.html,css,js,assets,images -DestinationPath vauxhall-scorm.zip -Force
```

Upload `vauxhall-scorm.zip` to your LMS (Moodle, SCORM Cloud, TalentLMS, etc.) as a
SCORM 1.2 package.

## Local preview (no LMS)

Open `index.html` in a browser. Everything works; SCORM calls run in offline mode
(no tracking). For full tracking, test in an LMS or SCORM Cloud.

## Editing content

All copy lives in `js/content.js` (one editable data object). Design tokens are in
`css/styles.css`. The render engine is `js/engine.js`.
