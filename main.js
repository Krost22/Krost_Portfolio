import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. Data Dictionary & State
// ==========================================
const projects = [
    {
        id: "vr-hotel-cartagena",
        category: "game",
        color: "#FF7A59",
        tags: ["Unity", "Meta Quest 3", "PICO 4", "VR"],
        images: ["Media/SmartRoom/CardImagen.png", "Media/SmartRoom/SmartRoom.webp", "Media/SmartRoom/SmartRoom1.webp"],
        en: {
            title: "VR Hotel Experience (Cartagena)",
            desc: "Developed an immersive Virtual Reality experience for a hotel in Cartagena using Unity. Compatible with standalone headsets like Meta Quest 3 and PICO 4. Implemented interactive systems for room tours and guest simulations, optimizing performance to maintain a stable, high framerate."
        },
        es: {
            title: "Experiencia VR en Hotel (Cartagena)",
            desc: "Desarrollo de una experiencia inmersiva de Realidad Virtual para habitaciones de un hotel en Cartagena usando Unity. Compatible con visores autónomos como Meta Quest 3 y PICO 4. Implementación de sistemas interactivos para recorridos y simulaciones, optimizando el rendimiento."
        }
    },
    {
        id: "ar-hotel-cartagena",
        category: "game",
        color: "#00D4C8",
        tags: ["Unity", "Android", "ARCore", "AR"],
        images: ["Media/AR Hotel/Hotel AR Card.png", "Media/AR Hotel/Main Menu AR Hotel.jpg", "Media/AR Hotel/Screenshot_2026-01-19-16-14-46-602_com.unity.AREMHotels.jpg", "Media/AR Hotel/Screenshot_2026-01-19-16-15-47-462_com.unity.AREMHotels.jpg", "Media/AR Hotel/Screenshot_2026-01-19-16-33-40-598_com.unity.AREMHotels.jpg"],
        en: {
            title: "AR Hotel Experience (Cartagena)",
            desc: "Created an Augmented Reality experience for the same hotel in Cartagena, enabling users to visualize interactive digital elements, virtual guides, and maps superimposed on their real-world environment."
        },
        es: {
            title: "Experiencia AR en Hotel (Cartagena)",
            desc: "Creación de una experiencia de Realidad Aumentada para el mismo hotel en Cartagena, permitiendo a los usuarios visualizar elementos digitales interactivos, guías virtuales y mapas superpuestos en su entorno real."
        }
    },
    {
        id: "vr-multiplayer",
        category: "game",
        color: "#FFB84D",
        tags: ["Unity", "Multiplayer", "VR", "C#"],
        images: ["Media/VR Multiplayer - Guajira Corp/Guajira Logo horizontal.png", "Media/VR Multiplayer - Guajira Corp/Guajira gameplay.png"],
        videos: ["Media/VR Multiplayer - Guajira Corp/Montes De Oca Vr Gameplay.mp4"],
        en: {
            title: "VR Multiplayer - Guajira Corp",
            desc: "Built a multiplayer virtual reality project for a corporation in La Guajira. Handled network synchronization, interactive gameplay mechanics, and optimization for mobile VR devices to ensure smooth performance across multiple users."
        },
        es: {
            title: "VR Multijugador - Corp Guajira",
            desc: "Creación de un proyecto multijugador en realidad virtual para una corporación en La Guajira. Manejo de sincronización de red, mecánicas de juego interactivas y optimización para dispositivos VR móviles asegurando un rendimiento fluido."
        }
    },
    {
        id: "tts-tool",
        category: "tool",
        color: "#8B7FFF",
        tags: ["Unity Editor", "Tools", "C#"],
        images: ["Media/UnityLocalTTS/Unity-Local-TTS.png", "Media/UnityLocalTTS/Unity-Local-TTS 2.png", "Media/UnityLocalTTS/Unity-Local-TTS 3ss.png", "Media/UnityLocalTTS/Unity-Local-TTS Icon.png"],
        link: "https://github.com/Krost22/Unity-Local-TTS/releases/tag/v1.0.0",
        en: {
            title: "Native TTS Editor Tool",
            desc: "A custom Unity Package tool designed to improve the developer experience by providing native Text-to-Speech (TTS) capabilities directly within the Unity Editor."
        },
        es: {
            title: "Herramienta Editor TTS Nativo",
            desc: "Una herramienta custom (Unity Package) diseñada para mejorar la experiencia de desarrollo proporcionando capacidades nativas de Text-to-Speech (TTS) directamente dentro del Unity Editor."
        }
    },
    {
        id: "audio-tool",
        category: "tool",
        color: "#E855A0",
        tags: ["Unity Editor", "Audio", "Tools"],
        images: ["Media/LoopClip/LoopClip Icon.png", "Media/LoopClip/LoopClip.png", "Media/LoopClip/Loopclip 1.png", "Media/LoopClip/LoopClip 2.png", "Media/LoopClip/LoopClip 3.png"],
        link: "https://github.com/Krost22/Unity-ClipLoop/releases/tag/V1",
        en: {
            title: "Audio Loop & Cut Tool",
            desc: "Developed a specialized Unity tool for music and audio loop generation. Includes features for precise audio cutting and looping directly within the editor environment to streamline sound design workflows."
        },
        es: {
            title: "Herramienta de Loops y Corte de Audio",
            desc: "Desarrollo de una herramienta especializada en Unity para la generación de loops de música y audio. Incluye funciones para corte preciso de audio directamente en el editor para optimizar el flujo de trabajo de diseño de sonido."
        }
    },
    {
        id: "360-tours",
        category: "game",
        color: "#4ECDC4",
        tags: ["360 Video", "VR", "Web"],
        images: ["Media/360 virtual tours/Terraviva 360 recorridos 360.png"],
        videos: ["Media/360 virtual tours/Montes De Oca 360 2025-06-12 14-14-30.mp4"],
        en: {
            title: "360 Virtual Tours",
            desc: "Created interactive 360-degree virtual tours targeted for both web platforms and Virtual Reality headsets. Designed to provide realistic walkthroughs and digital presence."
        },
        es: {
            title: "Recorridos Virtuales 360",
            desc: "Creación de recorridos virtuales 360 interactivos dirigidos tanto a plataformas web como a visores de Realidad Virtual. Diseñado para proporcionar visitas realistas y presencia digital."
        }
    },
    {
        id: "mobile-games",
        category: "game",
        color: "#A8E063",
        tags: ["Unity", "Android", "Mobile", "Gameplay"],
        images: [],
        en: {
            title: "Mobile Game Prototypes",
            desc: "Designed and implemented core gameplay mechanics, particle effects, and UI systems for various Android mobile game prototypes. Focused heavily on performance optimization (draw calls, batching, profiling) for low to mid-range devices."
        },
        es: {
            title: "Prototipos de Juegos Móviles",
            desc: "Diseño e implementación de mecánicas de juego principales, efectos de partículas y sistemas de UI para varios prototipos de juegos móviles en Android. Enfoque en optimización de rendimiento para dispositivos de gama baja y media."
        }
    },
    {
        id: "itchio-games",
        category: "game",
        color: "#FA5C5C",
        tags: ["Unity", "WebGL", "Itch.io", "Game Jams"],
        images: [],
        link: "https://krostgames.itch.io/",
        linkLabel: { en: "Visit Itch.io", es: "Ver en Itch.io" },
        en: {
            title: "Games on Itch.io",
            desc: "Collection of playable Unity games published on Itch.io: Lumber Drop, The Echo Loop, Sumo Eggs, Balloon Drop, Clic The Cube, Play Fetch, Soccer Shooter, and Whack-a-Food! WebGL builds ready to play in the browser."
        },
        es: {
            title: "Juegos en Itch.io",
            desc: "Colección de juegos Unity jugables publicados en Itch.io: Lumber Drop, The Echo Loop, Sumo Eggs, Balloon Drop, Clic The Cube, Play Fetch, Soccer Shooter y Whack-a-Food!. Builds WebGL listos para jugar en el navegador."
        }
    }
];

const aboutTranslations = {
    en: {
        navProjects: "Projects",
        navAbout: "Experience",
        filterAll: "All",
        filterGames: "Games & Experiences",
        filterTools: "Unity Tools",
        heroRole: "Unity Game Developer",
        heroTagline: "Virtual Reality and Augmented Reality · Multiplayer · Mobile",
        heroAvailable: "● Available for work",
        heroBadgeDegree: "Bachelor of Systems Engineering",
        heroBadgeTools: "Custom Unity Editor Tools",
        heroBadgeLocation: "Colombia · Remote",
        heroCtaContact: "Contact on LinkedIn",
        heroCtaItch: "Games on Itch.io",
        heroCtaGithub: "View GitHub",
        aboutTitle: "Experience & Education",
        profileTitle: "Profile",
        profileDesc: "Unity Game Developer focused on mobile games and interactive experiences. Experienced with gameplay programming, physics, particles, UI/UX for games and performance optimization for Android. Comfortable working 100% remote and collaborating with multidisciplinary teams.",
        eduTitle: "Education",
        eduDegree: "Bachelor of Systems Engineering",
        eduUni: "Universidad del Sinú – Unisinú | Aug 2024",
        eduSenaDegree: "Video Game Development",
        eduSena: "Servicio Nacional de Aprendizaje – SENA",
        btnContact: "Contact Me on LinkedIn",
        expTitle: "Work Experience",
        exp1Role: "Game Developer",
        exp1Desc: "Focused on the development of Virtual Reality (VR) and Augmented Reality (AR) experiences using Unity for Android-based headsets such as Meta Quest 3 and PICO 4 Ultra Enterprise. Implemented real-time interaction systems and optimized performance.",
        exp2Role: "Mobile Game Developer",
        exp2Desc: "Developed mobile game prototypes using Unity for Android. Designed and implemented core gameplay mechanics, UI systems, and particle effects. Optimized performance for low and mid-range mobile devices."
    },
    es: {
        navProjects: "Proyectos",
        navAbout: "Experiencia",
        filterAll: "Todo",
        filterGames: "Juegos y Experiencias",
        filterTools: "Herramientas Unity",
        heroRole: "Desarrollador de Videojuegos Unity",
        heroTagline: "Realidad virtual y realidad aumentada · Multijugador · Móvil",
        heroAvailable: "● Disponible para trabajar",
        heroBadgeDegree: "Ingeniero de Sistemas",
        heroBadgeTools: "Herramientas personalizadas en Unity",
        heroBadgeLocation: "Colombia · Remoto",
        heroCtaContact: "Contactar en LinkedIn",
        heroCtaItch: "Juegos en Itch.io",
        heroCtaGithub: "Ver GitHub",
        aboutTitle: "Experiencia y Educación",
        profileTitle: "Perfil",
        profileDesc: "Desarrollador de Videojuegos Unity enfocado en juegos móviles y experiencias interactivas. Con experiencia en programación de gameplay, físicas, partículas, UI/UX para juegos y optimización de rendimiento para Android. Capacidad para trabajar 100% remoto y colaborar con equipos multidisciplinarios.",
        eduTitle: "Educación",
        eduDegree: "Ingeniero de Sistemas",
        eduUni: "Universidad del Sinú – Unisinú | Ago 2024",
        eduSenaDegree: "Desarrollo de Videojuegos",
        eduSena: "Servicio Nacional de Aprendizaje – SENA",
        btnContact: "Contáctame en LinkedIn",
        expTitle: "Experiencia Laboral",
        exp1Role: "Desarrollador de Videojuegos",
        exp1Desc: "Enfocado en el desarrollo de experiencias de Realidad Virtual (VR) y Realidad Aumentada (AR) usando Unity para visores basados en Android como Meta Quest 3 y PICO 4 Ultra Enterprise. Implementación de sistemas de interacción en tiempo real y optimización de rendimiento.",
        exp2Role: "Desarrollador de Juegos Móviles",
        exp2Desc: "Desarrollo de prototipos de juegos móviles usando Unity para Android. Diseño e implementación de mecánicas de juego principales, sistemas de UI y efectos de partículas. Optimización de rendimiento para dispositivos móviles de gama baja y media."
    }
};

function generatePalette(hex) {
    const c = new THREE.Color(hex);
    const hsl = {};
    c.getHSL(hsl);
    // Steam Big Picture: base stays dark blue-ish, accent inherits project color
    return {
        primary: hex,
        bg: new THREE.Color().setHSL(0.58, 0.35, 0.06).getStyle(),
        surface: new THREE.Color().setHSL(0.58, 0.35, 0.11).getStyle(),
        surface2: new THREE.Color().setHSL(0.58, 0.35, 0.17).getStyle(),
        accent: hex,
        secondary: new THREE.Color().setHSL((hsl.h + 0.04) % 1, Math.min(hsl.s * 0.85, 1), 0.55).getStyle(),
        glow: `rgba(${c.r * 255 | 0}, ${c.g * 255 | 0}, ${c.b * 255 | 0}, 0.28)`
    };
}

function generateGeometricPlaceholder(color, seed = 0) {
    const W = 512;
    const H = 768;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const c = new THREE.Color(color);

    // Dark background derived from color
    ctx.fillStyle = `rgb(${Math.floor(c.r * 18)}, ${Math.floor(c.g * 18)}, ${Math.floor(c.b * 18)})`;
    ctx.fillRect(0, 0, W, H);

    // Geometric pattern: triangles, squares, hexagons
    const shapes = 50;
    for (let i = 0; i < shapes; i++) {
        const x = ((Math.sin(i * 1.618 + seed) * 0.5 + 0.5) * 0.85 + 0.075) * W;
        const y = ((Math.cos(i * 2.718 + seed) * 0.5 + 0.5) * 0.85 + 0.075) * H;
        const size = 18 + ((Math.sin(i * 0.7) * 0.5 + 0.5) * 65);
        const alpha = 0.04 + ((Math.sin(i * 0.3 + seed) * 0.5 + 0.5) * 0.2);
        const rotation = i * 0.5 + seed;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        const sides = 3 + (i % 3);
        ctx.beginPath();
        for (let j = 0; j < sides; j++) {
            const angle = (j / sides) * Math.PI * 2;
            const px = Math.cos(angle) * size;
            const py = Math.sin(angle) * size;
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();

        ctx.fillStyle = `rgba(${Math.floor(c.r * 255)}, ${Math.floor(c.g * 255)}, ${Math.floor(c.b * 255)}, ${alpha})`;
        ctx.fill();

        ctx.strokeStyle = `rgba(${Math.floor(c.r * 255)}, ${Math.floor(c.g * 255)}, ${Math.floor(c.b * 255)}, ${alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    // Central glow dot
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 70, 0, Math.PI * 2);
    const glowGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 70);
    glowGrad.addColorStop(0, `rgba(${Math.floor(c.r * 255)}, ${Math.floor(c.g * 255)}, ${Math.floor(c.b * 255)}, 0.22)`);
    glowGrad.addColorStop(1, `rgba(${Math.floor(c.r * 255)}, ${Math.floor(c.g * 255)}, ${Math.floor(c.b * 255)}, 0)`);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // Project title watermark
    ctx.fillStyle = `rgba(255,255,255,0.06)`;
    ctx.font = 'bold 22px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('KROSTGAMES', W / 2, H / 2);

    return canvas.toDataURL('image/png');
}

projects.forEach((p, i) => {
    p.palette = generatePalette(p.color);
    p.placeholder = generateGeometricPlaceholder(p.color, i);
    p.date = p.date || '';
    p.role = p.role || '';
    p.link = p.link || '';
    p.company = p.company || '';
});

let currentLang = 'en';
let currentIndex = 0;
let currentOffset = 0;
const totalProjects = projects.length;
let activeCategory = 'all';
let filteredIndices = projects.map((_, i) => i);
let filteredCount = projects.length;

// ==========================================
// 2. DOM Elements
// ==========================================
const titleEl = document.getElementById('project-title');
const descEl = document.getElementById('project-desc');
const tagsEl = document.getElementById('project-tags');
const contentContainer = document.getElementById('content-container');
const langToggle = document.getElementById('lang-toggle');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// BPM live clock
function updateClock() {
    const clock = document.getElementById('bpm-clock');
    if (!clock) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    clock.textContent = `${h}:${m}`;
}
updateClock();
setInterval(updateClock, 1000);

// ==========================================
// 3. Theme & UI Update
// ==========================================
function applyTheme(palette) {
    const root = document.documentElement.style;
    root.setProperty('--bg', palette.bg);
    root.setProperty('--surface', palette.surface);
    root.setProperty('--surface2', palette.surface2);
    root.setProperty('--accent', palette.accent);
    root.setProperty('--secondary', palette.secondary);
    root.setProperty('--glow', palette.glow);
}

function updateUI() {
    const proj = projects[currentIndex];
    const data = proj[currentLang];

    document.documentElement.lang = currentLang;
    applyTheme(proj.palette);

    document.title = `${data.title} — Eduardo Mogollón Salcedo`;

    gsap.to(contentContainer, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        onComplete: () => {
            titleEl.textContent = data.title;
            titleEl.style.background = 'none';
            titleEl.style.webkitBackgroundClip = 'unset';
            titleEl.style.webkitTextFillColor = 'unset';
            titleEl.style.color = '#fff';

            descEl.textContent = data.desc;

            tagsEl.innerHTML = '';
            const tagSpans = [];
            proj.tags.forEach(t => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = t;
                tagsEl.appendChild(span);
                tagSpans.push(span);
            });

            gsap.fromTo(tagSpans,
                { opacity: 0, x: -15 },
                { opacity: 1, x: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
            );

            gsap.to(contentContainer, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power3.out"
            });
        }
    });

    changeEnvironmentColor(proj.color);

    const mediaEl = document.getElementById('project-media');
    if (mediaEl) {
        mediaEl.innerHTML = '';
        if (proj.images && proj.images.length > 0) {
            proj.images.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = data.title;
                img.className = 'project-media-img';
                img.loading = 'lazy';
                img.onerror = () => { img.src = proj.placeholder; };
                img.addEventListener('click', () => openLightbox(img.src));
                mediaEl.appendChild(img);
            });
        } else {
            const img = document.createElement('img');
            img.src = proj.placeholder;
            img.alt = data.title;
            img.className = 'project-media-img placeholder-img';
            mediaEl.appendChild(img);
        }
        if (proj.videos && proj.videos.length > 0) {
            proj.videos.forEach(vidSrc => {
                const video = document.createElement('video');
                video.src = vidSrc;
                video.className = 'project-media-video';
                video.controls = true;
                video.preload = 'metadata';
                video.setAttribute('aria-label', data.title + ' video');
                mediaEl.appendChild(video);
            });
        }
        if (proj.link) {
            const btn = document.createElement('a');
            btn.href = proj.link;
            btn.target = '_blank';
            btn.className = 'project-download-btn';
            if (proj.linkLabel && proj.linkLabel[currentLang]) {
                btn.textContent = proj.linkLabel[currentLang];
            } else {
                const isTool = proj.category === 'tool';
                btn.textContent = currentLang === 'es'
                    ? (isTool ? 'Descargar' : 'Jugar')
                    : (isTool ? 'Download' : 'Play');
            }
            mediaEl.appendChild(btn);
        }
    }

    // Hero + Header i18n
    const aboutData = aboutTranslations[currentLang];
    document.getElementById('nav-projects').textContent = aboutData.navProjects;
    document.getElementById('nav-about').textContent = aboutData.navAbout;
    document.getElementById('hero-role').textContent = aboutData.heroRole;
    document.getElementById('hero-tagline').textContent = aboutData.heroTagline;
    document.getElementById('hero-available').textContent = aboutData.heroAvailable;
    document.getElementById('hero-badge-degree').textContent = aboutData.heroBadgeDegree;
    document.getElementById('hero-badge-tools').textContent = aboutData.heroBadgeTools;
    document.getElementById('hero-badge-location').textContent = aboutData.heroBadgeLocation;
    document.getElementById('hero-cta-contact').textContent = aboutData.heroCtaContact;
    document.getElementById('hero-cta-itch').textContent = aboutData.heroCtaItch;
    document.getElementById('hero-cta-github').textContent = aboutData.heroCtaGithub;

    // Filter tabs i18n
    document.querySelectorAll('.filter-tab').forEach(btn => {
        const key = 'filter' + btn.dataset.filter.charAt(0).toUpperCase() + btn.dataset.filter.slice(1);
        if (aboutData[key]) btn.textContent = aboutData[key];
    });

    // Nav pills active state
    updateNavPills();

    // Canvas wrapper blurred background based on active project
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const artwork = proj.images && proj.images.length > 0 ? proj.images[0] : proj.placeholder;
    if (canvasWrapper) {
        canvasWrapper.style.setProperty('--active-artwork', `url("${artwork}")`);
    }

    // Hero backdrop tint
    const heroBackdrop = document.getElementById('hero-backdrop');
    if (heroBackdrop) {
        heroBackdrop.style.background = `
            radial-gradient(ellipse 90% 120% at 70% 20%, ${proj.palette.glow} 0%, transparent 55%),
            linear-gradient(135deg, var(--surface) 0%, var(--bg) 60%)
        `;
    }

    document.getElementById('about-title').textContent = aboutData.aboutTitle;
    document.getElementById('profile-title').textContent = aboutData.profileTitle;
    document.getElementById('profile-desc').textContent = aboutData.profileDesc;
    document.getElementById('edu-title').textContent = aboutData.eduTitle;
    document.getElementById('edu-degree').textContent = aboutData.eduDegree;
    document.getElementById('edu-uni').textContent = aboutData.eduUni;
    document.getElementById('edu-sena-degree').textContent = aboutData.eduSenaDegree;
    document.getElementById('edu-sena').textContent = aboutData.eduSena;
    document.getElementById('btn-contact').textContent = aboutData.btnContact;
    document.getElementById('exp-title').textContent = aboutData.expTitle;
    document.getElementById('exp1-role').textContent = aboutData.exp1Role;
    document.getElementById('exp1-desc').textContent = aboutData.exp1Desc;
    document.getElementById('exp2-role').textContent = aboutData.exp2Role;
    document.getElementById('exp2-desc').textContent = aboutData.exp2Desc;

    const indicatorLabel = currentLang === 'es' ? 'Ir al proyecto' : 'Go to project';
    indicatorDots.forEach((dot, i) => {
        dot.setAttribute('aria-label', `${indicatorLabel} ${i + 1}`);
    });
}

function updateNavPills(activeSection = 'projects') {
    const projectsPill = document.getElementById('nav-projects');
    const aboutPill = document.getElementById('nav-about');
    if (!projectsPill || !aboutPill) return;
    if (activeSection === 'about') {
        projectsPill.classList.remove('active');
        aboutPill.classList.add('active');
    } else {
        projectsPill.classList.add('active');
        aboutPill.classList.remove('active');
    }
}

window.addEventListener('hashchange', () => {
    updateNavPills(window.location.hash === '#about' ? 'about' : 'projects');
});

// Scroll spy for header pills: detect which section is in viewport
(function initScrollSpy() {
    const heroSection = document.getElementById('hero');
    const aboutSection = document.getElementById('about');
    if (!heroSection || !aboutSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                updateNavPills(id === 'about' ? 'about' : 'projects');
                // sync URL hash smoothly without jumping
                if (window.location.hash !== '#' + id) {
                    history.replaceState(null, null, '#' + id);
                }
            }
        });
    }, {
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0
    });

    observer.observe(heroSection);
    observer.observe(aboutSection);
})();

// Logo dropdown — easter egg menu
(function initLogoDropdown() {
    const toggle = document.getElementById('logo-dropdown-toggle');
    const dropdown = document.getElementById('logo-dropdown');
    if (!toggle || !dropdown) return;

    function setOpen(isOpen) {
        toggle.setAttribute('aria-expanded', String(isOpen));
        dropdown.classList.toggle('open', isOpen);
        dropdown.setAttribute('aria-hidden', String(!isOpen));
    }

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        setOpen(!dropdown.classList.contains('open'));
        enableAudio();
        playClickSound();
    });

    dropdown.addEventListener('click', (e) => {
        const item = e.target.closest('.logo-dropdown-item');
        if (!item) return;
        e.stopPropagation();
        setOpen(false);
        enableAudio();
        playClickSound();
        runEasterEgg(item.dataset.easterEgg);
    });

    document.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setOpen(false);
    });
})();

function runEasterEgg(type) {
    if (type === 'random-theme') {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        const palette = generatePalette(randomColor);
        applyTheme(palette);
        changeEnvironmentColor(randomColor);
        showEasterEggToast('Random theme applied!');
    } else if (type === 'party-mode') {
        document.body.classList.add('party-mode');
        setTimeout(() => document.body.classList.remove('party-mode'), 4000);
        showEasterEggToast('Party mode! 🎉');
    } else if (type === 'secret-message') {
        const msgs = {
            en: "Krost engine v2.0.26 — made with caffeine and code.",
            es: "Krost engine v2.0.26 — hecho con cafeína y código."
        };
        showEasterEggToast(msgs[currentLang] || msgs.en);
    } else if (type === 'scanlines') {
        document.body.classList.toggle('scanlines-overlay');
        showEasterEggToast(document.body.classList.contains('scanlines-overlay') ? 'Scanlines ON' : 'Scanlines OFF');
    }
}

function showEasterEggToast(message) {
    let toast = document.getElementById('easter-egg-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'easter-egg-toast';
        toast.className = 'easter-egg-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

langToggle.addEventListener('click', () => {
    enableAudio();
    playClickSound();
    currentLang = currentLang === 'en' ? 'es' : 'en';
    langToggle.textContent = currentLang === 'en' ? 'ES' : 'EN';
    updateUI();
});

prevBtn.addEventListener('click', () => { enableAudio(); playClickSound(); navigateTo(getNextFilteredIndex(-1)); });
nextBtn.addEventListener('click', () => { enableAudio(); playClickSound(); navigateTo(getNextFilteredIndex(1)); });

// ==========================================
// 4. Three.js Arc Carousel — Infinite Loop
// ==========================================
const canvasContainer = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 100);
camera.position.set(0, 0.3, 5);
camera.lookAt(0, 0, 0);

function hasWebGL() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

let renderer;
if (hasWebGL()) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    canvasContainer.appendChild(renderer.domElement);
} else {
    canvasContainer.innerHTML = '<div class="webgl-fallback">WebGL is not available in this browser. Please use a modern browser or device to view the 3D carousel.</div>';
}

// LoadingManager for boot screen progress
const loadingManager = new THREE.LoadingManager();
let loadedCount = 0;
let totalToLoad = 0;

// Lighting — cinematic contrast
const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(3, 5, 6);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xbbccff, 0.6);
fillLight.position.set(-3, 2, 4);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(-4, 0, -3);
scene.add(rimLight);

const pointLight = new THREE.PointLight(0xffffff, 0.9, 15);
pointLight.position.set(0, 0, 3);
scene.add(pointLight);

// Spotlight targeting active card
const spotLight = new THREE.SpotLight(0xffffff, 2.2, 20, Math.PI / 6, 0.5, 1);
spotLight.position.set(0, 4, 8);
spotLight.target.position.set(0, 0, 0);
scene.add(spotLight);
scene.add(spotLight.target);

function moveSpotlightToCard(idx) {
    const mesh = carouselItems[idx];
    if (!mesh) return;
    gsap.to(spotLight.target.position, {
        x: mesh.position.x,
        y: mesh.position.y,
        z: mesh.position.z,
        duration: 0.75,
        ease: "power3.inOut",
        overwrite: 'auto'
    });
    gsap.to(spotLight.position, {
        x: mesh.position.x * 0.5,
        duration: 0.75,
        ease: "power3.inOut",
        overwrite: 'auto'
    });
}

// Shared rounded-rect alpha map for all cards (portrait 2:3)
function createRoundedAlphaMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(0, 0, 512, 768, 28);
    ctx.fill();
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
}
const roundedAlphaMap = createRoundedAlphaMap();

// Compose a vertical box-art cover from project image (or placeholder)
function createBoxArtTexture(proj, onLoad) {
    const W = 512;
    const H = 768;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const c = new THREE.Color(proj.color);
    const imageSrc = proj.images && proj.images.length > 0 ? proj.images[0] : proj.placeholder;

    function drawBase() {
        // Dark base from project color
        ctx.fillStyle = `rgb(${Math.floor(c.r * 22)}, ${Math.floor(c.g * 22)}, ${Math.floor(c.b * 22)})`;
        ctx.fillRect(0, 0, W, H);
    }

    function finalize() {
        // Bottom gradient for text readability
        const grad = ctx.createLinearGradient(0, 420, 0, H);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.25, `rgba(${c.r * 80 | 0}, ${c.g * 80 | 0}, ${c.b * 80 | 0}, 0.55)`);
        grad.addColorStop(1, `rgba(${c.r * 60 | 0}, ${c.g * 60 | 0}, ${c.b * 60 | 0}, 0.95)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Top small tag badge
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath();
        ctx.roundRect(18, 18, ctx.measureText(proj.tags[0] || 'Unity').width + 24, 24, 999);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.font = 'bold 12px "Space Grotesk", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(proj.tags[0] || 'Unity', 30, 31);

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';

        function wrapTitle(text, maxWidth) {
            const words = text.split(' ');
            let line = '';
            const lines = [];
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                if (ctx.measureText(testLine).width > maxWidth && n > 0) {
                    lines.push(line.trim());
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line.trim());
            return lines;
        }

        const title = proj.en.title;
        ctx.font = 'bold 34px "Space Grotesk", sans-serif';
        const lines = wrapTitle(title, W - 48);
        let y = H - 90;
        for (let i = lines.length - 1; i >= 0; i--) {
            ctx.fillText(lines[i], 24, y);
            y -= 42;
        }

        // Subtle top line accent
        ctx.fillStyle = proj.color;
        ctx.fillRect(24, 0, 3, 36);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        if (onLoad) onLoad(tex);
        return tex;
    }

    drawBase();

    const img = new Image();
    if (loadingManager) {
        loadingManager.itemStart(imageSrc);
    }
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        // Cover-crop: fit shortest side to fill portrait 2:3
        const coverAspect = W / H;
        const imgAspect = img.width / img.height;
        let sx, sy, sw, sh;
        if (imgAspect > coverAspect) {
            sh = img.height;
            sw = sh * coverAspect;
            sy = 0;
            sx = (img.width - sw) / 2;
        } else {
            sw = img.width;
            sh = sw / coverAspect;
            sx = 0;
            sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
        if (loadingManager) loadingManager.itemEnd(imageSrc);
        finalize();
    };
    img.onerror = () => {
        drawBase();
        if (loadingManager) loadingManager.itemEnd(imageSrc);
        finalize();
    };
    img.src = imageSrc;

    // Return immediate texture (will update once image loads)
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
}

function createCardMaterial(proj) {
    const baseOpts = {
        roughness: 0.35,
        metalness: 0.05,
        side: THREE.DoubleSide,
        alphaMap: roundedAlphaMap,
        transparent: true,
        alphaTest: 0.5
    };

    const texture = createBoxArtTexture(proj, (loadedTex) => {
        if (texture) {
            texture.image = loadedTex.image;
            texture.needsUpdate = true;
        }
    });
    return new THREE.MeshStandardMaterial({
        ...baseOpts,
        map: texture
    });
}

function createCardBackMaterial(proj) {
    const W = 512;
    const H = 768;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const c = new THREE.Color(proj.color);

    // Dark background with subtle tint
    ctx.fillStyle = '#0e141b';
    ctx.fillRect(0, 0, W, H);

    // Geometric pattern
    const shapes = 30;
    ctx.fillStyle = `rgba(${c.r * 255 | 0}, ${c.g * 255 | 0}, ${c.b * 255 | 0}, 0.06)`;
    for (let i = 0; i < shapes; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const size = 20 + Math.random() * 80;
        ctx.beginPath();
        const sides = 3 + (i % 3);
        for (let j = 0; j < sides; j++) {
            const angle = (j / sides) * Math.PI * 2;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }

    // Accent border line
    ctx.strokeStyle = proj.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, W - 16, H - 16);

    // Header title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    function wrapTitleBack(text, maxWidth) {
        const words = text.split(' ');
        let line = '';
        const lines = [];
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            if (ctx.measureText(testLine).width > maxWidth && n > 0) {
                lines.push(line.trim());
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());
        return lines;
    }

    const titleLines = wrapTitleBack(proj.en.title.toUpperCase(), W - 60);
    let titleY = 48;
    ctx.fillStyle = proj.color;
    titleLines.forEach(line => {
        ctx.fillText(line, W / 2, titleY);
        titleY += 34;
    });

    // Description snippet (localized)
    const snippet = ((proj[currentLang] && proj[currentLang].desc) || proj.en.desc).slice(0, 180);
    ctx.fillStyle = '#c9d1d9';
    ctx.font = '14px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    function wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let cy = y;
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, cy);
                line = words[n] + ' ';
                cy += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, cy);
        return cy + lineHeight;
    }

    wrapText(snippet, 36, titleY + 24, W - 72, 22);

    // Tags
    ctx.fillStyle = '#8b949e';
    ctx.font = '13px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(proj.tags.join('  ·  '), W / 2, H - 88);

    // Click hint
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.font = '12px "Space Grotesk", sans-serif';
    ctx.fillText('Click to flip back', W / 2, H - 44);

    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({
        roughness: 0.4,
        metalness: 0.05,
        side: THREE.DoubleSide,
        alphaMap: roundedAlphaMap,
        transparent: true,
        alphaTest: 0.5,
        map: texture
    });
}

function createBorderMaterial(proj) {
    return new THREE.MeshBasicMaterial({
        color: proj.color,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        alphaMap: roundedAlphaMap,
        alphaTest: 0.5
    });
}

const cardGeometry = new THREE.PlaneGeometry(2.3, 3.45);
const carouselItems = [];
const borderMeshes = [];

// Arc parameters — tighter shelf for portrait cards
const ARC_RADIUS = 5.0;
const ARC_SPAN_DEG = isTouchDevice ? 62 : 108;
const DEPTH_MULT = 1.35;
let ANGLE_PER_CARD = THREE.MathUtils.degToRad(ARC_SPAN_DEG / (filteredCount - 1));
let HALF_SPAN = filteredCount / 2; // half the visible project count, used for wrap-around

function updateCarouselParams() {
    ANGLE_PER_CARD = THREE.MathUtils.degToRad(ARC_SPAN_DEG / Math.max(1, filteredCount - 1));
    HALF_SPAN = filteredCount / 2;
}

// Dynamic spacing — expands during fast drag for responsive feel
let spacingBoost = 0;
const SPACING_DECAY = 0.92;

// Wraps arbitrary offset into [-HALF_SPAN, HALF_SPAN] for seamless infinite loop
function getWrappedOffset(i, offset, count = filteredCount) {
    const half = count / 2;
    let diff = i - offset;
    diff = ((diff + half) % count + count) % count - half;
    return diff;
}

function getCardTransform(wrappedOffset) {
    const angle = wrappedOffset * ANGLE_PER_CARD * (1 + spacingBoost);

    const x = ARC_RADIUS * Math.sin(angle);
    const z = ARC_RADIUS * (Math.cos(angle) - 1) * DEPTH_MULT;

    const abs = Math.abs(wrappedOffset);
    const t = abs / 3;
    const scale = Math.max(0.35, 1 - Math.pow(t, 1.35) * 0.36);

    const rotY = Math.atan2(-x, 5 - z);

    return { x, z, scale, rotY };
}

function updateCardPositions(animated = false) {
    carouselItems.forEach((mesh, originalIdx) => {
        const filteredIdx = filteredIndices.indexOf(originalIdx);

        // Hide cards excluded by the active filter
        if (filteredIdx === -1) {
            mesh.visible = false;
            mesh.userData.baseScale = 0;
            const border = borderMeshes[originalIdx];
            if (border) border.visible = false;
            return;
        }

        mesh.visible = true;
        const wrapped = getWrappedOffset(filteredIdx, currentOffset);
        const t = getCardTransform(wrapped);
        const isActive = Math.abs(wrapped) < 0.001;

        mesh.userData.baseScale = t.scale;
        mesh.renderOrder = 100 - Math.abs(wrapped);

        const border = borderMeshes[originalIdx];
        if (border) {
            border.visible = isActive;
            const targetScale = isActive ? 1.05 : 1.02;
            if (animated && !prefersReducedMotion) {
                gsap.to(border.scale, { x: targetScale, y: targetScale, duration: 0.35, ease: "power2.out", overwrite: 'auto' });
            } else {
                border.scale.set(targetScale, targetScale, 1);
            }
            border.material.opacity = isActive ? 0.95 : 0.4;
        }

        if (animated && !prefersReducedMotion) {
            gsap.to(mesh.position, { x: t.x, z: t.z, duration: 0.75, ease: "power3.inOut", overwrite: 'auto' });
            gsap.to(mesh.scale, { x: t.scale, y: t.scale, duration: 0.75, ease: "power3.inOut", overwrite: 'auto' });
            gsap.to(mesh.rotation, { y: t.rotY, duration: 0.75, ease: "power3.inOut", overwrite: 'auto' });
        } else {
            mesh.position.x = t.x;
            mesh.position.z = t.z;
            mesh.scale.set(t.scale, t.scale, 1);
            mesh.rotation.y = t.rotY;
        }
    });
}

// Count real textures to load for boot progress (now tracked via createBoxArtTexture ImageLoader)
totalToLoad = projects.filter(p => p.images && p.images.length > 0).length;

// Build cards
projects.forEach((proj, i) => {
    const material = createCardMaterial(proj);
    const mesh = new THREE.Mesh(cardGeometry, material);

    // Active card highlight border (initially hidden)
    const borderMat = createBorderMaterial(proj);
    const border = new THREE.Mesh(cardGeometry.clone(), borderMat);
    border.position.z = 0.02;
    border.visible = false;
    border.scale.set(1.05, 1.05, 1);
    mesh.add(border);
    borderMeshes.push(border);

    // Back face for flip
    const backMat = createCardBackMaterial(proj);
    const backMesh = new THREE.Mesh(cardGeometry.clone(), backMat);
    backMesh.position.z = -0.04;
    backMesh.rotation.y = Math.PI;
    mesh.add(backMesh);

    mesh.userData.projectId = i;
    mesh.userData.isFlipped = false;

    scene.add(mesh);
    carouselItems.push(mesh);
});

// Cinematic entrance — deferred until boot completes
function runCinematicEntrance() {
    if (!renderer) {
        gsap.set(contentContainer, { opacity: 1, y: 0 });
        return;
    }
    carouselItems.forEach((mesh, originalIdx) => {
        const filteredIdx = filteredIndices.indexOf(originalIdx);
        if (filteredIdx === -1) {
            mesh.visible = false;
            return;
        }

        const wrapped = getWrappedOffset(filteredIdx, currentOffset);
        const t = getCardTransform(wrapped);

        mesh.userData.baseScale = t.scale;
        mesh.renderOrder = 100 - Math.abs(wrapped);

        // Start far back
        mesh.position.set(t.x, 0, t.z - 15);
        mesh.scale.set(0.1, 0.1, 1);
        mesh.rotation.y = t.rotY;

        // Animate to final position with stagger
        gsap.to(mesh.position, {
            x: t.x,
            z: t.z,
            duration: 1.2,
            delay: filteredIdx * 0.08,
            ease: "power3.out"
        });
        gsap.to(mesh.scale, {
            x: t.scale,
            y: t.scale,
            duration: 1.2,
            delay: filteredIdx * 0.08,
            ease: "power3.out"
        });
        gsap.to(mesh.rotation, {
            y: t.rotY,
            duration: 1.2,
            delay: filteredIdx * 0.08,
            ease: "power3.out",
            onComplete: () => {
                if (filteredIdx === filteredCount - 1) {
                    // Reveal title after all cards are in place
                    gsap.fromTo(contentContainer,
                        { opacity: 0, y: 30 },
                        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
                    );
                }
            }
        });
    });
}

// Hide UI until boot finishes
contentContainer.style.opacity = '0';

// Particles — lower count on touch devices or reduced motion
const particlesCount = (isTouchDevice || prefersReducedMotion) ? 600 : 1500;
const particlesGeometry = new THREE.BufferGeometry();
const posArray = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 40;
}
const originalPositions = new Float32Array(posArray);
const particleOffsets = new Float32Array(particlesCount * 3);
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: 0.035,
    color: 0x888888,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const particlesMesh = new THREE.Points(particlesGeometry, particleMaterial);
scene.add(particlesMesh);

function changeEnvironmentColor(hexColor) {
    const color = new THREE.Color(hexColor);
    const d = 0.6;
    gsap.to(pointLight.color, { r: color.r, g: color.g, b: color.b, duration: d, overwrite: 'auto' });
    gsap.to(particleMaterial.color, { r: color.r, g: color.g, b: color.b, duration: d, overwrite: 'auto' });
    borderMeshes.forEach((b) => {
        gsap.to(b.material.color, { r: color.r, g: color.g, b: color.b, duration: d, overwrite: 'auto' });
    });
}

// GSAP offset animator — single proxy tween replaces per-card GSAP during navigation
const offsetAnimProxy = { value: 0 };

function animateOffsetTo(targetOffset) {
    gsap.killTweensOf(offsetAnimProxy);
    if (prefersReducedMotion) {
        currentOffset = targetOffset;
        updateCardPositions(false);
        return;
    }
    offsetAnimProxy.value = currentOffset;
    const dist = Math.abs(targetOffset - currentOffset);
    const duration = Math.min(0.7, Math.max(0.35, dist * 0.25));
    gsap.to(offsetAnimProxy, {
        value: targetOffset,
        duration: duration,
        ease: "power4.inOut",
        onUpdate: () => {
            currentOffset = offsetAnimProxy.value;
            updateCardPositions(false);
        }
    });
}

function getNextFilteredIndex(delta) {
    const currentFi = filteredIndices.indexOf(currentIndex);
    if (currentFi === -1) return filteredIndices[0];
    const nextFi = (currentFi + delta + filteredCount) % filteredCount;
    return filteredIndices[nextFi];
}

function navigateTo(targetIdx) {
    let targetFilteredIndex = filteredIndices.indexOf(targetIdx);
    if (targetFilteredIndex === -1) {
        targetFilteredIndex = 0;
        targetIdx = filteredIndices[0];
    }
    if (targetIdx === currentIndex) return;
    currentIndex = targetIdx;

    const diff = targetFilteredIndex - currentOffset;
    const half = filteredCount / 2;
    let shortest = ((diff + half) % filteredCount + filteredCount) % filteredCount - half;
    const targetOffset = currentOffset + shortest;

    animateOffsetTo(targetOffset);
    moveSpotlightToCard(currentIndex);
    unflipAllCards();
    updateUI();
}

// ==========================================
// Raycasting Hover
// ==========================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const mouseWorldPos = new THREE.Vector3();
let hoveredIndex = -1;

canvasContainer.addEventListener('pointermove', (e) => {
    if (isDragging) return;

    const rect = canvasContainer.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    raycaster.ray.intersectPlane(plane, mouseWorldPos);
    const intersects = raycaster.intersectObjects(carouselItems);

    if (intersects.length > 0) {
        const idx = intersects[0].object.userData.projectId;
        if (idx !== undefined && idx !== hoveredIndex) {
            if (hoveredIndex >= 0) setCardHover(hoveredIndex, false);
            hoveredIndex = idx;
            setCardHover(idx, true);
        }
    } else {
        if (hoveredIndex >= 0) {
            setCardHover(hoveredIndex, false);
            hoveredIndex = -1;
        }
    }
});

function setCardHover(idx, active) {
    const mesh = carouselItems[idx];
    if (!mesh) return;
    const base = mesh.userData.baseScale || 1;

    gsap.to(mesh.scale, {
        x: base * (active ? 1.08 : 1),
        y: base * (active ? 1.08 : 1),
        duration: 0.35,
        ease: "power2.out",
        overwrite: 'auto'
    });

    gsap.to(mesh.rotation, {
        x: active ? 0.08 : 0,
        z: active ? 0.015 : 0,
        duration: 0.35,
        ease: "power2.out"
    });

    const glow = mesh.children[0];
    if (glow) {
        gsap.to(glow.material, {
            opacity: active ? 0.4 : 0.12,
            duration: 0.35,
            ease: "power2.out"
        });
    }
}

function flipCard(idx) {
    const mesh = carouselItems[idx];
    if (!mesh) return;
    const isFlipped = mesh.userData.isFlipped;
    gsap.to(mesh.rotation, {
        y: mesh.rotation.y + (isFlipped ? -Math.PI : Math.PI),
        duration: 0.5,
        ease: "power2.inOut"
    });
    mesh.userData.isFlipped = !isFlipped;
}

function unflipAllCards() {
    carouselItems.forEach(mesh => {
        if (mesh.userData.isFlipped) {
            gsap.to(mesh.rotation, {
                y: mesh.rotation.y - Math.PI,
                duration: 0.4,
                ease: "power2.inOut"
            });
            mesh.userData.isFlipped = false;
        }
    });
}

// ==========================================
// Mouse Wheel Navigation
// ==========================================
let wheelBlocked = false;
canvasContainer.addEventListener('wheel', (e) => {
    // Horizontal wheel / Shift+wheel navigates the carousel;
    // vertical wheel lets the page scroll normally.
    const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const shouldNavigate = isHorizontal || e.shiftKey;
    if (!shouldNavigate) return;

    e.preventDefault();
    if (wheelBlocked) return;
    wheelBlocked = true;
    setTimeout(() => { wheelBlocked = false; }, 700);

    const delta = isHorizontal ? e.deltaX : e.deltaY;
    if (delta > 0) navigateTo(getNextFilteredIndex(1));
    else navigateTo(getNextFilteredIndex(-1));
}, { passive: false });

// ==========================================
// Drag / Swipe — continuous offset + inertia
// ==========================================
let isDragging = false;
let dragStartX = 0;
let dragStartOffset = 0;
let hasMoved = false;
let dragVelocity = 0;
let lastMoveX = 0;
let lastMoveTime = 0;
const DRAG_SENSITIVITY = isTouchDevice ? 70 : 110;

canvasContainer.addEventListener('pointerdown', (e) => {
    gsap.killTweensOf(offsetAnimProxy);
    isDragging = true;
    hasMoved = false;
    dragStartX = e.clientX;
    dragStartOffset = currentOffset;
    dragVelocity = 0;
    lastMoveX = e.clientX;
    lastMoveTime = performance.now();
    canvasContainer.setPointerCapture(e.pointerId);
});

canvasContainer.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    if (Math.abs(deltaX) > 6) hasMoved = true;

    const now = performance.now();
    const dt = now - lastMoveTime;
    if (dt > 0) {
        dragVelocity = (e.clientX - lastMoveX) / dt;
    }
    lastMoveX = e.clientX;
    lastMoveTime = now;

    currentOffset = dragStartOffset - (deltaX / DRAG_SENSITIVITY);
    spacingBoost = Math.abs(dragVelocity) * 0.15;
    updateCardPositions(false);
});

canvasContainer.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    canvasContainer.releasePointerCapture(e.pointerId);

    if (!hasMoved) {
        // Click-to-focus or flip via raycasting
        const rect = canvasContainer.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(carouselItems);
        if (intersects.length > 0) {
            const idx = intersects[0].object.userData.projectId;
            if (idx !== undefined) {
                if (idx === currentIndex) {
                    flipCard(idx);
                } else {
                    navigateTo(idx);
                }
                return;
            }
        }
        return;
    }

    const absVel = Math.abs(dragVelocity);
    let targetOffset;

    if (absVel > 0.25) {
        const dir = dragVelocity > 0 ? -1 : 1;
        const dist = Math.min(Math.floor(absVel * 3.5), 3);
        targetOffset = Math.round(currentOffset + dir * dist);
    } else {
        targetOffset = Math.round(currentOffset);
    }

    currentIndex = ((Math.round(targetOffset) % totalProjects) + totalProjects) % totalProjects;
    animateOffsetTo(targetOffset);
    updateUI();
    updateIndicators();
});

canvasContainer.addEventListener('pointercancel', () => {
    if (isDragging) {
        isDragging = false;
        currentIndex = ((Math.round(currentOffset) % totalProjects) + totalProjects) % totalProjects;
        animateOffsetTo(Math.round(currentOffset));
        updateUI();
        updateIndicators();
    }
});

// ==========================================
// 5. Animation Loop (idle floating)
// ==========================================
const clock = new THREE.Clock();

function animate() {
    if (!renderer) return;
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    spacingBoost *= SPACING_DECAY;

    carouselItems.forEach((mesh, i) => {
        if (prefersReducedMotion) {
            mesh.position.y = 0;
        } else {
            const floatY = Math.sin(elapsed * 0.5 + i * 0.9) * 0.04;
            mesh.position.y = floatY;
        }
    });

    particlesMesh.rotation.y = elapsed * 0.008;

    // Particle mouse interaction
    const interactionRadius = 6;
    const interactionStrength = 0.06;
    const mx = mouseWorldPos.x;
    const my = mouseWorldPos.y;
    for (let i = 0; i < particlesCount; i++) {
        const ix = i * 3;
        const ox = originalPositions[ix];
        const oy = originalPositions[ix + 1];

        const dx = ox - mx;
        const dy = oy - my;
        const distSq = dx * dx + dy * dy;

        if (distSq < interactionRadius * interactionRadius && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / interactionRadius) * interactionStrength;
            particleOffsets[ix] += (dx / dist) * force;
            particleOffsets[ix + 1] += (dy / dist) * force;
            particleOffsets[ix + 2] += force * 2;
        }

        particleOffsets[ix] *= 0.94;
        particleOffsets[ix + 1] *= 0.94;
        particleOffsets[ix + 2] *= 0.94;

        posArray[ix] = ox + particleOffsets[ix];
        posArray[ix + 1] = oy + particleOffsets[ix + 1];
        posArray[ix + 2] = originalPositions[ix + 2] + particleOffsets[ix + 2];
    }
    particlesGeometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    if (!renderer) return;
    const w = canvasContainer.clientWidth;
    const h = canvasContainer.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
});

// ==========================================
// 6. Scroll Animations
// ==========================================
function initScrollAnimations() {
    gsap.utils.toArray('.gs-reveal').forEach((elem, i) => {
        gsap.fromTo(elem,
            { y: 60, opacity: 0, autoAlpha: 0 },
            {
                y: 0,
                opacity: 1,
                autoAlpha: 1,
                duration: 0.8,
                delay: i * 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: elem,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });
}

// ==========================================
// 7. Carousel Indicators
// ==========================================
const indicatorsContainer = document.getElementById('carousel-indicators');
let indicatorDots = [];

function buildIndicators() {
    indicatorsContainer.innerHTML = '';
    indicatorDots = [];
    filteredIndices.forEach((projIdx, fi) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (projIdx === currentIndex ? ' active' : '');
        const labelBase = currentLang === 'es' ? 'Ir al proyecto' : 'Go to project';
        dot.setAttribute('aria-label', `${labelBase} ${fi + 1}`);
        dot.addEventListener('click', () => { enableAudio(); playClickSound(); navigateTo(projIdx); });
        indicatorsContainer.appendChild(dot);
        indicatorDots.push(dot);
    });
}

function updateIndicators() {
    indicatorDots.forEach((dot, i) => {
        dot.classList.toggle('active', filteredIndices[i] === currentIndex);
    });
}

// Patch navigateTo to also update indicators
const _origNavigateTo = navigateTo;
navigateTo = function(index) {
    _origNavigateTo(index);
    updateIndicators();
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') navigateTo(getNextFilteredIndex(-1));
    if (e.key === 'ArrowRight') navigateTo(getNextFilteredIndex(1));
});

buildIndicators();

function setCategoryFilter(category) {
    activeCategory = category;
    filteredIndices = projects
        .map((p, i) => ({ p, i }))
        .filter(({ p }) => category === 'all' || p.category === category)
        .map(({ i }) => i);
    filteredCount = filteredIndices.length;
    updateCarouselParams();

    if (filteredCount === 0) return;

    currentIndex = filteredIndices[0];
    currentOffset = 0;

    updateCardPositions(true);
    moveSpotlightToCard(currentIndex);
    unflipAllCards();
    buildIndicators();
    updateUI();

    // Update tab UI active state
    document.querySelectorAll('.filter-tab').forEach(btn => {
        const isActive = btn.dataset.filter === category;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
    });
}

// Filter tabs
document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        enableAudio();
        playClickSound();
        setCategoryFilter(btn.dataset.filter);
    });
});

// ==========================================
// 8. Procedural Sound (Web Audio API)
// ==========================================
const muteToggle = document.getElementById('mute-toggle');
let audioCtx = null;
let isMuted = true;
let audioInitialized = false;

const savedMute = localStorage.getItem('krost-muted');
if (savedMute === 'false') {
    isMuted = false;
    muteToggle.textContent = '🔊';
    muteToggle.classList.remove('muted');
} else {
    muteToggle.textContent = '🔇';
    muteToggle.classList.add('muted');
}

function initAudio() {
    if (audioInitialized) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioInitialized = true;
}

function resumeAudio() {
    if (!audioCtx) initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

muteToggle.addEventListener('click', () => {
    enableAudio();
    // Play feedback before toggling so it always sounds
    if (audioCtx) {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }
    isMuted = !isMuted;
    muteToggle.textContent = isMuted ? '🔇' : '🔊';
    muteToggle.classList.toggle('muted', isMuted);
    localStorage.setItem('krost-muted', isMuted);
    if (!isMuted) resumeAudio();
});

// Project-specific chord frequencies (root + third + fifth variations)
const projectChords = [
    [261.63, 329.63, 392.00],   // VR Hotel — warm major
    [349.23, 440.00, 523.25],   // AR Hotel — bright major
    [220.00, 261.63, 329.63],   // Multiplayer — darker minor
    [293.66, 349.23, 440.00],   // TTS Tool — neutral
    [196.00, 246.94, 293.66],   // Audio Tool — low
    [329.63, 392.00, 493.88],   // 360 Tours — airy
    [440.00, 554.37, 659.25],   // Mobile Games — energetic
    [246.94, 293.66, 369.99]    // Itch.io Games — playful red major
];

function playProjectSound(idx, type = 'navigate') {
    if (isMuted || !audioCtx) return;

    const now = audioCtx.currentTime;
    const freqs = projectChords[idx % projectChords.length];

    if (type === 'navigate') {
        // Chord sweep on project change
        freqs.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();

            osc.type = i === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq * 0.5, now);
            osc.frequency.exponentialRampToValueAtTime(freq, now + 0.3);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, now);
            filter.frequency.exponentialRampToValueAtTime(2000, now + 0.4);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.06 / freqs.length, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.7);
        });
    } else if (type === 'hover') {
        // Short tone on hover
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freqs[0] * (1 + idx * 0.03), now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
    } else if (type === 'flip') {
        // Subtle click on card flip
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

function playClickSound() {
    if (isMuted || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
}

function playBootSound() {
    if (isMuted || !audioCtx) return;
    const now = audioCtx.currentTime;
    // Power-on sweep: low to high with slight reverb feel via multiple oscillators
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.4);
    osc2.frequency.setValueAtTime(300, now);
    osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
}

function playShootSound() {
    if (isMuted || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.04);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
}

function playExplosionSound() {
    if (isMuted || !audioCtx) return;
    const now = audioCtx.currentTime;
    const bufferSize = audioCtx.sampleRate * 0.2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    noise.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);
}

function playHitSound() {
    if (isMuted || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
}

// Expose audio API for game.js
window.KrostAudio = {
    enableAudio,
    playExplosionSound,
    playHitSound
};

// Resume audio on first user interaction
function enableAudio() {
    if (!audioInitialized) {
        initAudio();
        isMuted = savedMute !== 'false';
        if (!isMuted) resumeAudio();
    }
}

// Haptic feedback on mobile
function hapticPulse() {
    if (isTouchDevice && navigator.vibrate) {
        navigator.vibrate(15);
    }
}

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

function openLightbox(src) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.style.display = 'flex';
    // force reflow
    void lightbox.offsetWidth;
    lightbox.classList.add('active');
}

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    setTimeout(() => {
        lightbox.style.display = 'none';
        lightboxImg.src = '';
    }, 300);
}

if (lightbox) {
    lightboxClose && lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

// Patch navigateTo to trigger sound + haptic
const _origNavigateTo2 = navigateTo;
navigateTo = function(index) {
    const prev = currentIndex;
    _origNavigateTo2(index);
    if (currentIndex !== prev) {
        enableAudio();
        playProjectSound(currentIndex, 'navigate');
        hapticPulse();
    }
};

// Patch setCardHover to trigger hover sound
const _origSetCardHover2 = setCardHover;
let lastHoverSoundIdx = -1;
setCardHover = function(idx, active) {
    _origSetCardHover2(idx, active);
    if (active && idx !== lastHoverSoundIdx) {
        lastHoverSoundIdx = idx;
        enableAudio();
        playProjectSound(idx, 'hover');
    }
    if (!active && idx === lastHoverSoundIdx) {
        lastHoverSoundIdx = -1;
    }
};

// Patch flipCard to trigger flip sound
const _origFlipCard = flipCard;
flipCard = function(idx) {
    _origFlipCard(idx);
    enableAudio();
    playProjectSound(idx, 'flip');
};

// ==========================================
// 9. Auto-hide arrows & Custom cursor
// ==========================================
const controlsEl = document.querySelector('.controls');
const customCursor = document.getElementById('custom-cursor');
let controlsHideTimer = null;

function showControls() {
    if (controlsEl) controlsEl.classList.remove('hidden');
    clearTimeout(controlsHideTimer);
    controlsHideTimer = setTimeout(() => {
        if (controlsEl) controlsEl.classList.add('hidden');
    }, 2500);
}

canvasContainer.addEventListener('pointermove', showControls);
canvasContainer.addEventListener('pointerdown', showControls);
canvasContainer.addEventListener('pointerup', showControls);
showControls();

// Custom cursor (desktop only)
if (!isTouchDevice && customCursor) {
    customCursor.classList.add('active');
    document.addEventListener('mousemove', (e) => {
        gsap.to(customCursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.15,
            ease: 'power2.out'
        });
    });

    const _origSetCardHover = setCardHover;
    setCardHover = function(idx, active) {
        _origSetCardHover(idx, active);
        customCursor.classList.toggle('hover', active);
    };
}

// Double-tap zoom prevention (iOS Safari)
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });

// ==========================================
// 10. Boot Screen Sequence
// ==========================================
function runBootSequence() {
    const bootScreen = document.getElementById('boot-screen');
    const bootStart = document.getElementById('boot-start');
    const bootPlay = document.getElementById('boot-play');
    const bootSkip = document.getElementById('boot-skip');
    const bootProgress = document.getElementById('boot-progress');
    const bootProgressText = document.getElementById('boot-progress-text');
    const bootLogs = document.querySelectorAll('.boot-log');

    if (!bootScreen) {
        runCinematicEntrance();
        return;
    }

    function startMinigame() {
        enableAudio();
        playBootSound();
        // Hide boot, load game module
        gsap.to(bootScreen, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
                bootScreen.style.display = 'none';
                document.body.classList.remove('booting');
                import('./game.js').then(m => m.startGame());
            }
        });
    }

    // Reduced motion: static display, immediate buttons
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        bootLogs.forEach(l => l.classList.add('ok'));
        bootProgress.style.width = '100%';
        bootProgressText.textContent = '100%';
        bootStart.style.display = 'block';
        if (bootPlay) bootPlay.style.display = 'block';
        gsap.set([bootStart, bootPlay], { opacity: 1, scale: 1 });
        bootStart.addEventListener('click', () => {
            enableAudio();
            playBootSound();
            finishBoot();
        });
        if (bootPlay) bootPlay.addEventListener('click', startMinigame);
        return;
    }

    // Hide main content during boot
    document.body.classList.add('booting');

    // Animate logo + title
    gsap.to('.boot-logo', { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" });
    gsap.to('.boot-title', { opacity: 1, duration: 0.5, delay: 0.3 });

    // Stagger logs in, then mark OK
    gsap.to(bootLogs, {
        opacity: 1,
        x: 0,
        duration: 0.3,
        stagger: 0.15,
        delay: 0.5,
        onComplete: () => {
            bootLogs.forEach(l => l.classList.add('ok'));
        }
    });

    // Progress tracking: combines real texture load + minimum time
    let loadProgress = totalToLoad === 0 ? 100 : 0;
    let timeProgress = 0;
    const minBootTime = 2500; // ms
    const startTime = Date.now();
    let readyShown = false;

    function updateProgress() {
        const combined = (loadProgress * 0.6) + (timeProgress * 0.4);
        const pct = Math.min(100, Math.round(combined));
        if (bootProgress) bootProgress.style.width = pct + '%';
        if (bootProgressText) bootProgressText.textContent = pct + '%';

        if (pct >= 100 && !readyShown && bootStart) {
            readyShown = true;
            bootStart.style.display = 'block';
            if (bootPlay) bootPlay.style.display = 'block';
            gsap.to([bootStart, bootPlay], { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)", stagger: 0.08 });
        }
    }

    // Time progress tick
    const timeInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        timeProgress = Math.min(100, (elapsed / minBootTime) * 100);
        updateProgress();
        if (elapsed >= minBootTime) clearInterval(timeInterval);
    }, 50);

    // Texture loading progress
    if (totalToLoad > 0) {
        loadingManager.onProgress = (url, loaded, total) => {
            loadProgress = total > 0 ? (loaded / total) * 100 : 0;
            updateProgress();
        };
        loadingManager.onLoad = () => {
            loadProgress = 100;
            updateProgress();
        };
    }

    // Skip button
    if (bootSkip) {
        bootSkip.addEventListener('click', () => {
            clearInterval(timeInterval);
            finishBoot();
        });
    }

    // Start button → glitch transition → site
    if (bootStart) {
        bootStart.addEventListener('click', () => {
            enableAudio();
            playBootSound();

            // Glitch sweep overlay
            const glitch = document.createElement('div');
            glitch.className = 'boot-glitch';
            if (bootScreen) bootScreen.appendChild(glitch);

            gsap.to(bootScreen, {
                opacity: 0,
                duration: 0.5,
                delay: 0.3,
                ease: "power2.inOut",
                onComplete: finishBoot
            });
        });
    }

    // Play minigame button
    if (bootPlay) {
        bootPlay.addEventListener('click', startMinigame);
    }

    function finishBoot() {
        document.body.classList.remove('booting');
        if (bootScreen && bootScreen.parentNode) {
            bootScreen.parentNode.removeChild(bootScreen);
        }
        runCinematicEntrance();
    }
}

// ==========================================
// Initialize
// ==========================================
updateIndicators();
updateUI();
animate();
initScrollAnimations();
runBootSequence();

// Global hook for game.js to return to portfolio
window.finishBootFromGame = function() {
    document.body.classList.remove('booting');
    const bs = document.getElementById('boot-screen');
    if (bs && bs.parentNode) bs.parentNode.removeChild(bs);
    runCinematicEntrance();
};

// Launch the minigame from anywhere in the portfolio (header button)
window.launchMinigame = function() {
    enableAudio();
    const bs = document.getElementById('boot-screen');
    if (bs && bs.parentNode) bs.parentNode.removeChild(bs);
    document.body.classList.remove('booting');
    import('./game.js').then(m => m.startGame());
};

const playGameBtn = document.getElementById('play-game-btn');
if (playGameBtn) {
    playGameBtn.addEventListener('click', () => window.launchMinigame());
}
