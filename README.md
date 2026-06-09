# Krost_Portfolio – Interactive 3D Portfolio

A single‑page, zero‑dependency portfolio built with **Vanilla HTML, CSS & JavaScript**, showcasing my experience in Unity, VR/AR, multiplayer, and 3D tool development.

## Highlights

- **Three.js + GSAP** powered horizontal carousel of 3D cards (BoxGeometry) that rotate, scale, and emit a subtle glow when active.
- **Dynamic textures**: real project screenshots (`Media/SmartRoom.webp`, `Media/SmartRoom1.webp`) appear on the front face of the selected card; other cards receive a procedurally generated gradient + cyber‑punk grid.
- **Language toggle** (EN/ES) – all UI text, education, and project descriptions switch instantly.
- **Responsive media gallery** beneath the canvas shows screenshots/videos for the chosen project, with a placeholder for future assets.
- **Custom color palette** and a larger, centered logo to give the site a premium, cohesive brand identity.
- **No build step** – all assets are loaded from CDNs (Three.js 0.160, GSAP 3.12.5, ScrollTrigger). Run locally with `python -m http.server` or `npx http-server .`.

## Project Structure

```
Krost_Portfolio/
├─ index.html          // entry point, import map & layout
├─ style.css          // custom design system, dark mode, logo, gallery
├─ main.js            // Three.js scene, carousel, UI logic, i18n, media handling
├─ Media/             // logo.png, SmartRoom.webp, SmartRoom1.webp, …
└─ .agents/…          // optional skill definitions (accessibility, SEO, etc.)
```

## Live Demo

Deployed with **GitHub Pages** at:
https://krost22.github.io/Krost_Portfolio/

## How to Run Locally

```bash
# Python (built‑in)
python -m http.server 8000

# Or Node
npx http-server .
```

Open `http://localhost:8000` (or the port you chose) in a modern browser.

---

*Feel free to fork, customize the carousel, or add your own projects. The code is deliberately lightweight, framework‑free, and ready for extension.*
