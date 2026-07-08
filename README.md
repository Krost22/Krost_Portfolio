# Krost_Portfolio – Interactive 3D Portfolio

A single-page, zero-dependency portfolio built with **Vanilla HTML, CSS & JavaScript** (ES modules), showcasing Unity, VR/AR, multiplayer, Unity tools, and Itch.io game development.

## Highlights

- **Three.js + GSAP** infinite-loop horizontal arc carousel of 8 project cards (`PlaneGeometry`) that rotate, scale, and emit a subtle glow.
- **Dynamic theming**: each project auto-generates a color palette that recolors the entire page via CSS custom properties.
- **Procedural placeholders**: projects without screenshots get a generated geometric card texture instead of a broken image.
- **Language toggle** (EN/ES) — project descriptions, about section, and accessibility labels switch instantly.
- **Responsive media gallery** beneath the canvas shows screenshots, videos, and external links for the selected project.
- **Boot screen** with terminal-style loading sequence and real texture progress tracking.
- **Built-in canvas minigame** loaded on demand from `game.js`.
- **Procedural audio** via Web Audio API (boot sweep, project chords, hover, flip, shooting).
- **Accessibility & performance**: keyboard navigation, reduced-motion support, lazy-loaded gallery images, lower particle count on mobile.
- **SEO**: meta description, Open Graph, Twitter Card, JSON-LD Person, favicon, and canonical URL.
- **No build step** — dependencies are loaded from pinned CDNs via `importmap`. Run locally with `python -m http.server` or `npx serve .`.

## Project Structure

```
Krost_Portfolio/
├─ index.html          // Entry point, importmap, SEO meta tags, layout
├─ style.css           // Design system, dynamic CSS variables, responsive styles
├─ main.js             // Three.js scene, carousel, i18n, audio, boot, UI logic
├─ game.js             // Canvas minigame (loaded on demand)
├─ Media/              // logo.png, project screenshots/videos, Itchio/ folder
├─ PROJECT_CONTEXT.MD  // Detailed architecture and extension notes
├─ README.md           // This file
├─ AGENTS.md           # Agent memory / architecture notes
└─ .agents/            # Optional skill definitions (accessibility, SEO, etc.)
```

## Live Demo

Deployed with **GitHub Pages** at:
https://krost22.github.io/Krost_Portfolio/

## How to Run Locally

```bash
# Python (built-in)
python -m http.server 8000

# Or Node
npx serve .
# or
npx http-server .
```

Open `http://localhost:8000` in a modern browser.

---

*Feel free to fork, customize the carousel, or add your own projects. The code is deliberately lightweight, framework-free, and ready for extension.*
