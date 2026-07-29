# PROJECT_CONTEXT.MD – Krost Portfolio

> Single-page, zero-build, vanilla HTML/CSS/JS portfolio showcasing game-dev work.

## 1. Stack & Dependencies

- **Framework**: None (vanilla ES modules).
- **No package manager / no bundler**: dependencies are loaded via `<script type="importmap">` in `index.html`.
- **Pinned CDN versions**:
  - `three` → `https://unpkg.com/three@0.160.0/build/three.module.js`
  - `three/addons/` → `https://unpkg.com/three@0.160.0/examples/jsm/`
  - `gsap` → `https://unpkg.com/gsap@3.12.5/index.js`
  - `gsap/ScrollTrigger` → `https://unpkg.com/gsap@3.12.5/ScrollTrigger.js`
- **Fonts**: Google Fonts (`Space Grotesk`, `JetBrains Mono`), one combined request.
- **Hosting**: GitHub Pages at `https://krost22.github.io/Krost_Portfolio/`.

## 2. File Structure

```
Krost_Portfolio/
├─ index.html          # Entrypoint: importmap, SEO/JSON-LD, layout, boot screen, game overlay
├─ main.js             # Data, theming, Three.js shelf, i18n, audio, interaction, boot
├─ style.css           # Design tokens + all styles
├─ game.js             # Canvas/Three minigame, loaded on demand via import('./game.js')
├─ robots.txt          # Points at the sitemap
├─ sitemap.xml         # Single-URL sitemap
├─ .claude/launch.json # Dev-server config for the preview tooling
├─ Media/
│  ├─ logo.png, logo-256.webp, favicon-64.png
│  ├─ og-cover.jpg     # 1200x630 social card
│  └─ <Project>/       # Source PNG/JPG + .webp derivative + cover.webp (2:3 card art)
└─ README.md, AGENTS.md, PROJECT_CONTEXT.MD
```

### Media convention

Every source bitmap has a `.webp` sibling at ≤1600 px, and every project with
artwork has a `cover.webp` at 720×1080 used as the 3D card face. **The site
references only the `.webp` files**; the original PNG/JPGs are kept as archives
and are never fetched by the page (~29 MB of sources → ~2.3 MB of derivatives).

Derivatives were generated with `sharp`; regenerate them if you add source art.

## 3. Architecture

### 3.1 Data model

`projects` at the top of `main.js`:

```js
{
  id, category: 'game' | 'tool',
  color: '#hex',              // muted accent, ~35-50% saturation
  year, role, platform, company,
  tags: string[],
  cover: 'Media/.../cover.webp',
  posterCover: true,          // artwork already has its own title lockup
  images: string[],           // .webp paths for the detail gallery
  videos: [{ src, poster }],
  link, repo, linkLabel: { en, es },
  gallerySets: [...],         // optional; see below
  en: { title, subtitle, desc, highlights: string[] },
  es: { ... }
}
```

**`gallerySets`** turns the media panel into a folder browser, for a project
that is really a collection. Each entry is
`{ id, name, link?, cover, en, es, images[] }` and renders as a card with one
characteristic photo, the game's name and its photo count. Clicking expands that
set's shots in place; opening another closes the previous, so only one panel
ever exists. The panel is inserted directly after its own card with
`grid-column: 1 / -1`, which makes CSS Grid flow it onto the row below that
card rather than at the end of the list.

Only the Itch.io project uses this today. Its per-game copy is quoted from each
game's own Itch.io page where a tagline exists; otherwise it describes only what
the screenshots visibly show.

`skillGroups` and `ui` (EN/ES strings) sit alongside it. All copy lives in
`main.js`; `index.html` holds only fallback text.

### 3.2 Theming

`hexToHsl()` / `hsl()` do the colour maths in **plain sRGB**. Do not use
`THREE.Color` for CSS values — it works in linear space and gamma-converts on
output, which turns an `L=0.045` near-black into a mid grey.

`generatePalette(hex)` builds a neutral ramp (`bg`, `surface`, `surface-2`,
`surface-3`) carrying a *trace* of the project hue, plus `accent`,
`accent-soft` and `secondary`. `applyTheme()` writes them as CSS custom
properties and updates `<meta name="theme-color">`.

**Design rule:** the accent is a mark — a 2 px rule under the active tab, a
timeline dot, a bullet dash, the active card's frame. It is never a glow.
Elevation comes from layered directional shadows (`--shadow-1..3`).

### 3.3 Three.js shelf

- Infinite-loop horizontal arc of `PlaneGeometry` cards.
  `ARC_RADIUS = 5.0`, `ARC_SPAN_DEG` 108 desktop / 62 touch, `DEPTH_MULT 1.35`.
- `ANGLE_PER_CARD` and `HALF_SPAN` are recomputed from `filteredCount` whenever
  the category filter changes; `getWrappedOffset()` wraps over the filtered set.
- Each card carries three children: a **shadow** plane (radial-gradient
  texture, normal blending), a **frame** plane shown only on the active card,
  and a **back** face.
- Card faces are drawn to 640×960 canvases by `paintCover()`, which dispatches on
  the project's fields:
  - `coverLayout: 'list'` → `drawListCover()`: key art on top, then `coverList`
    typeset in two columns. For projects that are a collection rather than one
    thing (Itch.io).
  - `posterCover: true` → artwork full-bleed, no overlay type.
  - otherwise → `drawComposedCover()`: art in the top 66 %, typographic plate below.
  - no artwork at all → `drawTypographicCover()`: tinted field, ghosted monogram, title.
  - back → `drawCardBack()`: year/platform, title, description, highlights, tags.
- Every front then goes through `finishCard()` — vignette, raking sheen and a
  dark/light double edge. This is what makes bright artwork sit in a dark scene
  and gives the shelf its printed-box feel; don't skip it for new layouts.
- `refreshCardBacks()` **must** run on a language switch — back faces bake their
  text into a canvas.
- Every project keeps a `redrawCover()` handle. Canvas text silently falls back
  to a system sans when a webfont hasn't loaded, and these textures are drawn
  during module evaluation, so `document.fonts.ready` triggers a full repaint.
- `resizeRenderer()` calls `renderer.setSize(w, h)` with `updateStyle` left on.
  Passing `false` makes the canvas lay out at its backing-store size, i.e. 2× on
  every HiDPI display.

### 3.4 Interaction

| Input | Behaviour |
|-------|-----------|
| Drag / swipe | Velocity-tracked inertia; snaps 1–3 cards. |
| Wheel | Vertical scrolls the page; Shift+wheel or horizontal trackpad moves the shelf (620 ms throttle). |
| Click card | Focus if inactive, flip if already active. |
| Hover | Raycast scale bump, lift, deeper shadow, hover tone. |
| Arrow keys | Navigate — but only when `shelfHasFocus()`: not during the minigame, not with the lightbox open, not while a tab or field has focus. |
| Filter tabs | Full tablist keyboard model (arrows / Home / End) with roving tabindex. |
| Indicators | One dot per filtered project. |

`projectIndexForOffset()` maps a raw offset back through `filteredIndices` —
using `totalProjects` there is the bug that let a drag select a hidden card.

### 3.5 Performance

- No particle system. The render loop pauses when `#canvas-wrapper` leaves the
  viewport (IntersectionObserver) and on `visibilitychange`.
- Videos are `preload="none"` with a poster; the 45 MB and 85 MB captures are
  only fetched if someone presses play.
- Gallery images are `loading="lazy" decoding="async"`.

### 3.6 i18n

`ui.en` / `ui.es` plus per-project `en`/`es`. Language is resolved from
`localStorage` → `navigator.language` → `en`, and persisted on toggle. A switch
re-runs `renderStaticText()`, `updateProjectPanel()`, `refreshCardBacks()` and
`buildIndicators()`.

Note `renderSkills()` deliberately does **not** add `gs-reveal`: it re-renders
on every language switch and ScrollTriggers are only wired once at start-up.

### 3.7 Audio

Procedural Web Audio through one `tone()` helper. Muted by default, state in
`localStorage` under `krost-muted`. `window.KrostAudio` is the bridge for
`game.js`.

### 3.8 Boot screen

Quiet loader: logo, name, role, a 2 px progress rule, real percentage. Progress
is `coversDone / coversTotal` (70 %) blended with a 1.6 s minimum (30 %), and
force-completes after 8 s so a stalled asset can never strand a visitor.

### 3.9 Logo menu

`shuffle-accent` (curated pool, never random RGB), `attract-mode` (auto-advance
kiosk loop), `grain` (persisted), `colophon`. Any manual navigation calls
`stopAttract()`.

### 3.10 Minigame — Krost Arcade

`game.js`, loaded on demand via `import('./game.js')`. Visibility is driven by an
inline `display` style — keep `#game-screen` as a style toggle, not the `hidden`
attribute.

**Run structure.** One run rotates through all four modes, `ROUND_TIME` (18 s)
each, with `START_LIVES` (3) shared across the whole run. Losing a life is the
only cost of a mistake — no score penalty, so the final number reflects how far
you got. At zero lives the run ends on a real game-over panel with score, best,
and Play again. Difficulty scales off `round`, not `score`, so a good run isn't
punished into unplayability.

**Mode contract.** Every mode returns:

```js
{ control: 'follow' | 'swipe', enter(), update(dt, input), exit() }
```

Modes report outcomes by calling the shared `addScore(points, x, y, colour)` and
`hurt(x, y)` rather than by return value, so scoring, particles, shake and
life-loss stay in one place. `hurt()` returns `false` while the player is in
post-hit invulnerability (`INVULN_TIME`), but modes should still run their own
reset either way — bailing out early left the snake frozen mid-board.

`control` drives touch handling: `follow` modes track the finger/mouse
position, `swipe` modes turn drags into discrete direction taps.

**Shared systems.** A 120-quad particle pool (`burst()`), camera `shake()`, an
opaque board plate for the grid modes, and a background layer that scrolls the
CV past at ~5 % opacity behind everything.

**Things that were broken and must not regress:**
- The scene needs lights. `MeshStandardMaterial` asteroids rendered pure black
  without them.
- `pointermove` must be bound in `bindInput()`. It was written and never wired,
  so desktop players only ever had the keyboard.
- Cars, blocks, bullets and rocks are pooled. The old crossing mode allocated a
  fresh mesh per spawn and left every one in the group for the whole round.
- `keyState` is cleared in `unbindInput()`, otherwise a key held while exiting
  stays down for the next run.
- `window.resize` is handled; the canvas used to stay at its first size.

## 4. Running locally

```powershell
python -m http.server 8000
# or
npx serve .
```

## 5. Extension points

- **New project**: append to `projects`, add `Media/<Name>/`, generate the
  `.webp` derivatives and `cover.webp`, set `category` and `posterCover`.
- **New skill group**: append to `skillGroups` with `en`/`es`.
- **New accent**: keep saturation in the 35–50 % band so it stays a mark and not
  a neon light; add it to `ACCENT_POOL` too.
