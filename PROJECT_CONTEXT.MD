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
- **Fonts**: Google Fonts (`Space Grotesk`, `JetBrains Mono`).
- **Hosting**: GitHub Pages at `https://krost22.github.io/Krost_Portfolio/`.

## 2. File Structure

```
Krost_Portfolio/
├─ index.html          # Entrypoint, importmap, layout, boot screen, about section, game screen
├─ main.js             # App logic: data, Three.js arc carousel, GSAP animations, i18n, audio, drag/wheel/keyboard, raycasting, lightbox
├─ style.css           # All styles and CSS custom properties for dynamic theming
├─ game.js             # Canvas minigame loaded on demand (import('./game.js'))
├─ Media/              # logo.png, project screenshots/videos, placeholder folder Itchio/
│  ├─ logo.png
│  ├─ SmartRoom/
│  ├─ AR Hotel/
│  ├─ VR Multiplayer - Guajira Corp/
│  ├─ UnityLocalTTS/
│  ├─ LoopClip/
│  ├─ 360 virtual tours/
│  └─ Itchio/          # Placeholder for future itch.io card screenshots
├─ README.md           # High-level overview (currently outdated)
├─ AGENTS.md           # Agent memory / architecture notes
├─ PROJECT_CONTEXT.MD  # This file
└─ repomix-output.xml  # Large context file; should not be deployed
```

## 3. Architecture

### 3.1 Data Model

All projects live in the `projects` array declared at the top of `main.js`.
Each object has:

```js
{
  id: string,
  color: string,           // hex color used for palette and card theme
  tags: string[],
  images: string[],        // file paths, first image is used as 3D card texture
  videos?: string[],       // optional, shown in the bottom info panel
  link?: string,           // optional, external download / profile link
  linkLabel?: { en: string, es: string }, // optional, custom CTA text
  en: { title: string, desc: string },
  es: { title: string, desc: string }
}
```

At runtime, `main.js` augments each project with:
- `palette` — generated via `generatePalette(color)` (bg, surface, surface2, accent, secondary, glow)
- `placeholder` — procedural geometric PNG used when no images exist
- default values for `date`, `role`, `link`, `company`

### 3.2 Three.js Carousel

- **Infinite-loop horizontal arc carousel** of `PlaneGeometry` cards.
- Cards are distributed along a circular arc with:
  - `ARC_RADIUS = 5.5`
  - `ARC_SPAN_DEG = 128` desktop / `70` touch
  - `ANGLE_PER_CARD = ARC_SPAN_DEG / (totalProjects - 1)`
  - `HALF_SPAN = totalProjects / 2` (used for seamless wrapping)
- Active card sits at the apex (center, largest, closest); neighbors curve back along the arc with depth (`z`), reduced scale, and face toward the camera via `Math.atan2`.
- Seamless wrapping via `getWrappedOffset(i, offset)` which normalizes the difference into `[-HALF_SPAN, HALF_SPAN]`.
- Each card has a front texture (project screenshot or placeholder), a back face (`createCardBackMaterial`) with title/description snippet, and a glow plane behind it.

### 3.3 Interaction

| Input | Behavior |
|-------|----------|
| Drag / swipe | Pointer-driven horizontal offset; velocity-tracked inertia snaps 1–3 cards. |
| Wheel | 700 ms throttle; scrolls to next/prev project. |
| Click card | Focus card if not active; flip card if already active. |
| Hover | Raycaster scale bump + audio hover tone. |
| Arrow keys | Navigate left/right. |
| Indicators | Clickable dots below the canvas. |
| Prev/Next buttons | Visible controls. |

### 3.4 Theming

`applyTheme(palette)` writes CSS custom properties to `document.documentElement.style`, causing the entire page to recolor based on the active project. Tone mapping is `ACESFilmicToneMapping` with exposure `1.25`.

### 3.5 Audio

Procedural Web Audio API sounds: boot sweep, click, project-specific chords (one per project), hover, flip, shoot, explosion, hit. Mute state persists in `localStorage`. Audio context is created on first user interaction (`enableAudio`).

### 3.6 i18n

Inline dictionaries:
- `projects[i].en` / `projects[i].es` for each project.
- `aboutTranslations.en` / `aboutTranslations.es` for the About section.
Toggle button `#lang-toggle` switches `currentLang` and re-renders text.

### 3.7 Boot Screen

`#boot-screen` shows a retro terminal sequence: animated logo, logs, progress bar that combines real texture loading (`THREE.LoadingManager`) with a minimum time of 2.5 s. Buttons `PRESS START` and `PLAY MINIGAME` appear at 100 %. Reduced-motion users get static buttons immediately.

### 3.8 Minigame

A canvas shooter loaded on demand from `game.js`. Launched via `window.launchMinigame()` (header button or boot screen). Exposes `window.finishBootFromGame()` to return to the portfolio.

## 4. Assets & Naming Conventions

- Project media folders use the project name; spaces are allowed (e.g., `AR Hotel/`, `360 virtual tours/`).
- Images are referenced with relative paths from the repo root.
- If a project has no `images` array, the procedural placeholder is used for both the 3D card and the bottom panel.

## 5. Running Locally

```powershell
# Python (built-in)
python -m http.server 8000
# or Node
npx serve .
# or npx http-server .
```

Open `http://localhost:8000`.

## 6. Known Extension Points

- Adding a new project only requires appending to the `projects` array and optionally adding media. Carousel math is fully dynamic.
- To customize the CTA button text for a project, add `linkLabel: { en: '...', es: '...' }`.
- To add a new social link, add an SVG icon in `index.html` and style it in `style.css`.
