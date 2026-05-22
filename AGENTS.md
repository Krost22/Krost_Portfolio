# Krost Portfolio

Static single-page portfolio site. No build step, no package manager, no tests.

## Stack

- Vanilla HTML/CSS/JS — **no bundler, no npm, no framework**
- Three.js + GSAP + ScrollTrigger — all loaded from CDN via `<script type="importmap">` in `index.html`
- Versions pinned in importmap: Three.js 0.160.0, GSAP 3.12.5

## Key files

| File | Purpose |
|------|---------|
| `index.html` | Entrypoint; contains importmap with CDN dependency URLs |
| `main.js` | All app logic: data, UI, Three.js scene, GSAP animations, i18n, drag/swipe, raycasting |
| `style.css` | All styles |
| `style.css` | All styles |
| `Media/` | Images (logo, project screenshots) |

## Architecture notes

- **Translations**: EN/ES i18n is inline in `main.js` as two large dictionaries (`aboutTranslations`, per-project `en`/`es` fields). Toggled by `#lang-toggle` button.
- **3D scene**: An *infinite-loop* horizontal arc carousel of 7 cards inside `#canvas-container`. Cards distributed along a circular arc (radius 3.8, span 100°). Active card at arc apex (center, largest, closest); neighbors curve backward along the arc with depth (z), reduced scale, and face toward camera via `atan2`. Seamless wrapping via `getWrappedOffset()`: diff normalized to `[-3.5, 3.5]`.
- **Drag/swipe**: `pointerdown/pointermove/pointerup` on canvas for horizontal drag. Velocity-tracked inertia: fast flicks snap 1–2 cards with `power3.inOut` easing.
- **Wheel**: `wheel` event on canvas navigates cards (700ms throttle).
- **Raycasting hover**: `THREE.Raycaster` on `pointermove` — hovered card gains 5% scale bump via GSAP.
- **Idle floating**: Each card bobs subtly (`sin * 0.03`) at unique phase in the animation loop — GSAP is not involved.
- **Dynamic theming**: Each project has an auto-generated `palette` (bg, surface, accent, secondary, glow). `applyTheme()` sets CSS custom properties on `:root` — entire page recolors per project.
- **ACESFilmic tone mapping** on renderer for cinematic contrast.
- **Indicators**: 7 clickable dots below canvas, built dynamically in JS.
- **Keyboard**: ArrowLeft/ArrowRight navigates between projects.
- **No routing**: Hashless single page. Anchor `#about` scrolls to the about section.
- **No loading spinner**: The scene relies on CDN availability.

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
