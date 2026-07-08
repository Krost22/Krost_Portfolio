# Krost Portfolio

Static single-page portfolio site. No build step, no package manager, no tests.

## Stack

- Vanilla HTML/CSS/JS — **no bundler, no npm, no framework**
- Three.js + GSAP + ScrollTrigger — all loaded from CDN via `<script type="importmap">` in `index.html`
- Versions pinned in importmap: Three.js 0.160.0, GSAP 3.12.5

## Key files

| File | Purpose |
|------|---------|
| `index.html` | Entrypoint; contains importmap with CDN dependency URLs, SEO meta tags, and layout |
| `main.js` | All app logic: data, UI, Three.js scene, GSAP animations, i18n, drag/swipe, raycasting, audio, boot screen |
| `style.css` | All styles |
| `game.js` | Canvas minigame loaded on demand |
| `Media/` | Images (logo, project screenshots, videos) |

## Architecture notes

- **Translations**: EN/ES i18n is inline in `main.js` as two large dictionaries (`aboutTranslations`, per-project `en`/`es` fields). Toggled by `#lang-toggle` button.
- **3D scene**: An *infinite-loop* horizontal arc carousel of 8 cards inside `#canvas-container`. Cards distributed along a circular arc (radius 5.5, span 128° desktop / 70° touch). Active card at arc apex (center, largest, closest); neighbors curve backward along the arc with depth (z), reduced scale, and face toward camera via `atan2`. Seamless wrapping via `getWrappedOffset()`: diff normalized to `[-HALF_SPAN, HALF_SPAN]` where `HALF_SPAN = totalProjects / 2`.
- **Drag/swipe**: `pointerdown/pointermove/pointerup` on canvas for horizontal drag. Velocity-tracked inertia: fast flicks snap up to 3 cards.
- **Wheel**: `wheel` event on canvas navigates cards (700 ms throttle).
- **Raycasting hover**: `THREE.Raycaster` on `pointermove` — hovered card gains ~8 % scale bump via GSAP.
- **Idle floating**: Each card bobs subtly (`sin * 0.04`) at unique phase in the animation loop — GSAP is not involved. Disabled when `prefers-reduced-motion` is active.
- **Dynamic theming**: Each project has an auto-generated `palette` (bg, surface, accent, secondary, glow). `applyTheme()` sets CSS custom properties on `:root` — entire page recolors per project.
- **ACESFilmic tone mapping** on renderer for cinematic contrast.
- **Indicators**: 8 clickable dots below canvas, built dynamically in JS.
- **Keyboard**: ArrowLeft/ArrowRight navigates between projects.
- **Procedural audio**: Web Audio API project-specific chords, boot sweep, hover, flip, and minigame SFX.
- **WebGL fallback**: graceful message if WebGL is unavailable; renderer-dependent code is guarded.
- **No routing**: Hashless single page. Anchor `#about` scrolls to the about section.
- **No loading spinner**: The boot screen combines real texture progress with a minimum display time.

## OpenCode skills (`.agents/skills/`)

5 skills are installed and locked via `skills-lock.json`:
- `accessibility`, `frontend-design`, `seo`, `threejs-animation`, `threejs-fundamentals`

## Running

```powershell
# Python (built-in)
python -m http.server 8000
# or Node
npx serve .
```
Then open `http://localhost:8000`. No build step needed.
