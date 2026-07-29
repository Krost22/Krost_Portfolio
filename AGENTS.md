# Krost Portfolio

Static single-page portfolio. No build step, no package manager, no tests.

## Stack

- Vanilla HTML/CSS/JS — **no bundler, no npm, no framework**
- Three.js 0.160.0 + GSAP 3.12.5 + ScrollTrigger, from CDN via the importmap in `index.html`

## Key files

| File | Purpose |
|------|---------|
| `index.html` | Entrypoint; importmap, SEO meta + JSON-LD, layout, boot screen, game overlay |
| `main.js` | Data, theming, Three.js shelf, i18n, audio, interaction, boot sequence |
| `style.css` | Design tokens and all styles |
| `game.js` | Minigame, loaded on demand |
| `Media/` | Source art plus `.webp` derivatives and `cover.webp` card faces |

See `PROJECT_CONTEXT.MD` for the full architecture. The notes below are the
things that will bite you.

## Design rules

The visual system is deliberately **not** neon. When adding UI:

- Depth comes from layered directional shadows (`--shadow-1..3`), never from
  `box-shadow: 0 0 Npx <colour>` or `text-shadow` halos.
- The per-project accent is a **mark** — a 2 px rule, a dot, a dash, a frame.
  It is not a light source and it does not tint whole surfaces.
- Text is warm off-white (`--text: #e6e4e1`), not `#fff`. Borders are hairlines.
- One pill shape only (the header nav). Everything else uses `--r-xs/sm/md/lg`.
- Accents live in a 35–50 % saturation band. High-saturation lime/cyan/magenta
  is what this design was moved away from — don't reintroduce it.

## Gotchas

- **Colour maths for CSS must not go through `THREE.Color`.** It works in linear
  space and gamma-converts in `getStyle()`, so `setHSL(h, s, 0.045)` comes out a
  mid grey. Use `hexToHsl()` / `hsl()` in `main.js`.
- **`renderer.setSize(w, h)` — never pass `updateStyle: false`.** Without the
  style update the canvas lays out at its backing-store size, i.e. double width
  on every HiDPI screen.
- **Card faces are canvases.** Anything with baked text (`drawCardBack`) needs
  `refreshCardBacks()` on a language switch.
- **Filtered indices are not project indices.** Use `projectIndexForOffset()` and
  `getNextFilteredIndex()`; reaching for `totalProjects` is how a drag ends up
  selecting a card the active filter hides.
- **`renderSkills()` must not emit `gs-reveal`.** It re-renders on every language
  switch, and ScrollTriggers are only created once at start-up.
- **`#game-screen` visibility is an inline `display` style**, because `game.js`
  sets it directly. Don't convert it to the `hidden` attribute.
- **The minigame scene needs lights.** Its asteroids use `MeshStandardMaterial`;
  with no light in the scene they render pure black, which is how they shipped
  before.
- **Minigame modes never return outcomes.** They call the shared `addScore()` /
  `hurt()` helpers so scoring, particles, shake and lives stay in one place.
- **The header play button must survive small screens.** Once the boot screen is
  skipped it is the only way back into the minigame.
- **Media paths in `main.js` point at `.webp` only.** The PNG/JPG originals stay
  in the repo as archives and must never be referenced by the page.

## Running

```powershell
python -m http.server 8000
# or
npx serve .
```
