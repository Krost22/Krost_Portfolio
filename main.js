import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. Data
// ==========================================
// `cover` is the 2:3 art used for the 3D card. `posterCover: true` means the
// artwork already carries its own title lockup, so we render it full-bleed and
// skip the typographic block that composed covers get.
const projects = [
    {
        id: "vr-hotel-cartagena",
        category: "game",
        color: "#c2954e",
        year: "2025",
        role: "Unity developer",
        platform: "Meta Quest 3 · PICO 4",
        company: "LSV-TECH · EM Hotels",
        tags: ["Unity", "Meta Quest 3", "PICO 4", "VR"],
        cover: "Media/SmartRoom/cover.webp",
        posterCover: true,
        images: [
            "Media/SmartRoom/SmartRoom vertical.webp",
            "Media/SmartRoom/CardImagen.webp",
            "Media/SmartRoom/imagen.webp",
            "Media/SmartRoom/SmartRoom.webp",
            "Media/SmartRoom/SmartRoom1.webp"
        ],
        en: {
            title: "VR Hotel Experience",
            subtitle: "Cartagena",
            desc: "An immersive virtual reality room tour for a hotel in Cartagena, built in Unity for standalone headsets. Guests walk through rooms and common areas before they book.",
            highlights: [
                "Shipped to Meta Quest 3 and PICO 4 as a standalone Android build.",
                "Interactive room-tour and guest-simulation systems driven by hand and controller input.",
                "Held a stable framerate on mobile GPUs through draw-call batching and lightmap budgeting."
            ]
        },
        es: {
            title: "Experiencia VR en Hotel",
            subtitle: "Cartagena",
            desc: "Recorrido inmersivo de realidad virtual por las habitaciones de un hotel en Cartagena, hecho en Unity para visores autónomos. El huésped recorre habitaciones y zonas comunes antes de reservar.",
            highlights: [
                "Publicado en Meta Quest 3 y PICO 4 como build autónoma de Android.",
                "Sistemas interactivos de recorrido y simulación con entrada por manos y mandos.",
                "Framerate estable en GPU móvil mediante batching de draw calls y control del presupuesto de lightmaps."
            ]
        }
    },
    {
        id: "ar-hotel-cartagena",
        category: "game",
        color: "#6d94bf",
        year: "2026",
        role: "Unity developer",
        platform: "Android · ARCore",
        company: "LSV-TECH · EM Hotels",
        tags: ["Unity", "Android", "ARCore", "AR"],
        cover: "Media/AR Hotel/cover.webp",
        images: [
            "Media/AR Hotel/Main Menu AR Hotel.webp",
            "Media/AR Hotel/Hotel AR Card.webp",
            "Media/AR Hotel/Screenshot_2026-01-19-16-14-46-602_com.unity.AREMHotels.webp",
            "Media/AR Hotel/Screenshot_2026-01-19-16-15-47-462_com.unity.AREMHotels.webp",
            "Media/AR Hotel/Screenshot_2026-01-19-16-33-40-598_com.unity.AREMHotels.webp"
        ],
        en: {
            title: "AR Hotel Experience",
            subtitle: "Cartagena",
            desc: "An augmented reality companion app for the same hotel. Digital guides, maps and points of interest are anchored onto the guest's real surroundings through the phone camera.",
            highlights: [
                "Built on ARCore with Unity's AR Foundation for plane detection and image anchoring.",
                "Bilingual interface with in-app language switching for international guests.",
                "Runs on mid-range Android phones without a dedicated depth sensor."
            ]
        },
        es: {
            title: "Experiencia AR en Hotel",
            subtitle: "Cartagena",
            desc: "App de realidad aumentada complementaria para el mismo hotel. Guías digitales, mapas y puntos de interés se anclan al entorno real del huésped a través de la cámara.",
            highlights: [
                "Construido sobre ARCore con AR Foundation de Unity para detección de planos y anclaje por imagen.",
                "Interfaz bilingüe con cambio de idioma dentro de la app para huéspedes internacionales.",
                "Funciona en teléfonos Android de gama media sin sensor de profundidad dedicado."
            ]
        }
    },
    {
        id: "vr-multiplayer",
        category: "game",
        color: "#55a081",
        year: "2025",
        role: "Gameplay & networking",
        platform: "Standalone VR",
        company: "LSV-TECH · Guajira Corp",
        tags: ["Unity", "Multiplayer", "VR", "C#"],
        cover: "Media/VR Multiplayer - Guajira Corp/cover.webp",
        images: [
            "Media/VR Multiplayer - Guajira Corp/Guajira gameplay.webp",
            "Media/VR Multiplayer - Guajira Corp/Guajira Logo horizontal.webp"
        ],
        videos: [{
            src: "Media/VR Multiplayer - Guajira Corp/Montes De Oca Vr Gameplay.mp4",
            poster: "Media/VR Multiplayer - Guajira Corp/cover.webp"
        }],
        en: {
            title: "VR Multiplayer",
            subtitle: "Guajira Corp",
            desc: "A shared virtual reality environment for an environmental-education programme in La Guajira, where several users explore and interact in the same session.",
            highlights: [
                "Network synchronisation of avatars, transforms and interactable objects across sessions.",
                "Gameplay interactions designed to stay readable when multiple users share one space.",
                "Optimised for mobile VR headsets so added players do not cost framerate."
            ]
        },
        es: {
            title: "VR Multijugador",
            subtitle: "Guajira Corp",
            desc: "Entorno de realidad virtual compartido para un programa de educación ambiental en La Guajira, donde varios usuarios exploran e interactúan en la misma sesión.",
            highlights: [
                "Sincronización en red de avatares, transforms y objetos interactuables entre sesiones.",
                "Interacciones diseñadas para seguir siendo legibles cuando varios usuarios comparten el espacio.",
                "Optimizado para visores VR móviles: sumar jugadores no cuesta framerate."
            ]
        }
    },
    {
        id: "tts-tool",
        category: "tool",
        color: "#8b85c4",
        year: "2026",
        role: "Author",
        platform: "Unity Editor package",
        tags: ["Unity Editor", "Tooling", "C#"],
        cover: "Media/UnityLocalTTS/cover.webp",
        posterCover: true,
        images: [
            "Media/UnityLocalTTS/Unity-Local-TTS 3ss.webp",
            "Media/UnityLocalTTS/Unity-Local-TTS.webp",
            "Media/UnityLocalTTS/Unity-Local-TTS 2.webp",
            "Media/UnityLocalTTS/Unity-Local-TTS Icon.webp"
        ],
        link: "https://github.com/Krost22/Unity-Local-TTS/releases/tag/v1.0.0",
        repo: "https://github.com/Krost22/Unity-Local-TTS",
        en: {
            title: "Native TTS Editor Tool",
            subtitle: "Unity package",
            desc: "A Unity package that exposes the operating system's native text-to-speech engine inside the Editor, so teams can audition voice lines without leaving Unity or paying for a cloud service.",
            highlights: [
                "Runs entirely on-device — no API keys, no network calls, no per-character billing.",
                "Editor window for previewing lines and exporting generated clips into the project.",
                "Distributed as an installable Unity package with a tagged release."
            ]
        },
        es: {
            title: "Herramienta TTS Nativa",
            subtitle: "Paquete de Unity",
            desc: "Paquete de Unity que expone el motor de texto a voz nativo del sistema operativo dentro del Editor, para escuchar líneas de voz sin salir de Unity ni pagar un servicio en la nube.",
            highlights: [
                "Funciona totalmente en local: sin API keys, sin llamadas de red, sin cobro por carácter.",
                "Ventana de editor para previsualizar líneas y exportar los clips generados al proyecto.",
                "Se distribuye como paquete instalable de Unity con release etiquetada."
            ]
        }
    },
    {
        id: "audio-tool",
        category: "tool",
        color: "#4f97a8",
        year: "2026",
        role: "Author",
        platform: "Unity Editor package",
        tags: ["Unity Editor", "Audio", "Tooling"],
        cover: "Media/LoopClip/cover.webp",
        posterCover: true,
        images: [
            "Media/LoopClip/LoopClip 3.webp",
            "Media/LoopClip/Loopclip 1.webp",
            "Media/LoopClip/LoopClip 2.webp",
            "Media/LoopClip/LoopClip Icon.webp"
        ],
        link: "https://github.com/Krost22/Unity-ClipLoop/releases/tag/V1",
        repo: "https://github.com/Krost22/Unity-ClipLoop",
        en: {
            title: "ClipLoop",
            subtitle: "Audio loop & cut tool",
            desc: "An Editor tool for turning any audio clip into a seamless loop: set precise in and out points, snap to zero crossings to avoid clicks, crossfade, and export a clean WAV.",
            highlights: [
                "Sample-accurate in/out points with a waveform view and audition playback.",
                "Zero-crossing snapping and adjustable crossfade to remove loop clicks.",
                "WAV export with optional mono downmix, plus an EN/ES interface."
            ]
        },
        es: {
            title: "ClipLoop",
            subtitle: "Loops y corte de audio",
            desc: "Herramienta de editor para convertir cualquier clip de audio en un loop perfecto: puntos de entrada y salida precisos, ajuste a cruces por cero para evitar clics, crossfade y exportación a WAV.",
            highlights: [
                "Puntos de entrada y salida con precisión de sample, vista de forma de onda y escucha previa.",
                "Ajuste a cruces por cero y crossfade regulable para eliminar los clics del loop.",
                "Exportación WAV con downmix mono opcional e interfaz EN/ES."
            ]
        }
    },
    {
        id: "360-tours",
        category: "game",
        color: "#86a35c",
        year: "2025",
        role: "Unity developer",
        platform: "Web · VR headsets",
        company: "LSV-TECH · Terraviva",
        tags: ["360 Video", "VR", "Web"],
        cover: "Media/360 virtual tours/cover.webp",
        posterCover: true,
        images: [
            "Media/360 virtual tours/Terraviva 360 vertical.webp",
            "Media/360 virtual tours/Terraviva 360 recorridos 360.webp"
        ],
        videos: [{
            src: "Media/360 virtual tours/Montes De Oca 360 2025-06-12 14-14-30.mp4",
            poster: "Media/360 virtual tours/Terraviva 360 recorridos 360.webp"
        }],
        en: {
            title: "360 Virtual Tours",
            subtitle: "Terraviva",
            desc: "Interactive 360-degree walkthroughs of real locations, delivered both in the browser and on VR headsets so a site can be visited from anywhere.",
            highlights: [
                "One capture pipeline feeding two targets: browser playback and headset playback.",
                "Navigation hotspots that let visitors move between capture points.",
                "Streaming-friendly encoding to keep the web version watchable on modest connections."
            ]
        },
        es: {
            title: "Recorridos Virtuales 360",
            subtitle: "Terraviva",
            desc: "Recorridos interactivos de 360 grados de ubicaciones reales, entregados tanto en navegador como en visores VR para poder visitar un sitio desde cualquier lugar.",
            highlights: [
                "Un solo pipeline de captura alimentando dos destinos: navegador y visor.",
                "Hotspots de navegación para moverse entre puntos de captura.",
                "Codificación pensada para streaming, para que la versión web se vea bien en conexiones modestas."
            ]
        }
    },
    {
        id: "mobile-games",
        category: "game",
        color: "#c07f57",
        year: "2019 — 2021",
        role: "Freelance developer",
        platform: "Android",
        tags: ["Unity", "Android", "Mobile", "Gameplay"],
        images: [],
        en: {
            title: "Mobile Game Prototypes",
            subtitle: "Android",
            desc: "A run of Android prototypes built as a freelancer: core mechanics, particle work and UI systems, each taken far enough to be playable and profiled.",
            highlights: [
                "Core gameplay loops, physics interactions, particle effects and UI systems.",
                "Performance work aimed at low and mid-range devices: draw calls, batching, profiling.",
                "Fast iteration — prototypes measured by whether the loop was fun, then kept or dropped."
            ]
        },
        es: {
            title: "Prototipos de Juegos Móviles",
            subtitle: "Android",
            desc: "Una serie de prototipos para Android hechos como freelance: mecánicas principales, partículas y sistemas de UI, cada uno llevado hasta ser jugable y perfilable.",
            highlights: [
                "Loops de gameplay, interacciones físicas, efectos de partículas y sistemas de UI.",
                "Optimización orientada a dispositivos de gama baja y media: draw calls, batching, profiling.",
                "Iteración rápida: el prototipo se medía por si el loop era divertido, y se mantenía o se descartaba."
            ]
        }
    },
    {
        id: "itchio-games",
        category: "game",
        color: "#c4605a",
        year: "2020 — 2026",
        role: "Solo developer",
        platform: "WebGL · Itch.io",
        tags: ["Unity", "WebGL", "Itch.io", "Game Jams"],
        cover: "Media/Itchio/cover.webp",
        posterCover: true,
        images: [
            "Media/Itchio/Itchio logo.webp",
            "Media/Itchio/Itchio vertical.webp"
        ],
        link: "https://krostgames.itch.io/",
        linkLabel: { en: "Play on Itch.io", es: "Jugar en Itch.io" },
        en: {
            title: "Games on Itch.io",
            subtitle: "Eight WebGL builds",
            desc: "A shelf of small, finished Unity games published as WebGL builds: Lumber Drop, The Echo Loop, Sumo Eggs, Balloon Drop, Clic The Cube, Play Fetch, Soccer Shooter and Whack-a-Food.",
            highlights: [
                "Eight games shipped and playable in the browser — no download, no install.",
                "Each one scoped to a single mechanic and finished rather than left as a prototype.",
                "WebGL builds tuned for fast first load and keyboard or mouse-only input."
            ]
        },
        es: {
            title: "Juegos en Itch.io",
            subtitle: "Ocho builds WebGL",
            desc: "Una estantería de juegos Unity pequeños y terminados, publicados como builds WebGL: Lumber Drop, The Echo Loop, Sumo Eggs, Balloon Drop, Clic The Cube, Play Fetch, Soccer Shooter y Whack-a-Food.",
            highlights: [
                "Ocho juegos publicados y jugables en el navegador: sin descargas ni instalación.",
                "Cada uno acotado a una sola mecánica y terminado, no abandonado como prototipo.",
                "Builds WebGL ajustadas para carga inicial rápida y control con teclado o ratón."
            ]
        }
    }
];

// Only claims backed by the work above — no padding.
const skillGroups = [
    {
        en: { title: "Engine & language", items: ["Unity (2021 → 6)", "C#", "Gameplay programming", "Physics & particles", "UI / UX for games"] },
        es: { title: "Motor y lenguaje", items: ["Unity (2021 → 6)", "C#", "Programación de gameplay", "Físicas y partículas", "UI / UX para juegos"] }
    },
    {
        en: { title: "XR", items: ["Meta Quest 3", "PICO 4 Ultra Enterprise", "AR Foundation & ARCore", "Standalone Android VR", "360° video playback"] },
        es: { title: "XR", items: ["Meta Quest 3", "PICO 4 Ultra Enterprise", "AR Foundation y ARCore", "VR autónoma en Android", "Reproducción de vídeo 360°"] }
    },
    {
        en: { title: "Multiplayer", items: ["Network synchronisation", "Shared-session interaction", "State replication", "Multi-user VR spaces"] },
        es: { title: "Multijugador", items: ["Sincronización en red", "Interacción en sesión compartida", "Replicación de estado", "Espacios VR multiusuario"] }
    },
    {
        en: { title: "Tooling", items: ["Custom Editor windows", "Unity packages & releases", "Audio pipeline tools", "Git & GitHub"] },
        es: { title: "Herramientas", items: ["Ventanas de editor propias", "Paquetes y releases de Unity", "Herramientas de audio", "Git y GitHub"] }
    },
    {
        en: { title: "Performance", items: ["Draw calls & batching", "Unity Profiler", "Mobile GPU budgeting", "Build size & load time"] },
        es: { title: "Rendimiento", items: ["Draw calls y batching", "Unity Profiler", "Presupuesto de GPU móvil", "Tamaño de build y carga"] }
    },
    {
        en: { title: "Web", items: ["Unity WebGL builds", "Three.js", "GSAP", "Vanilla JS / CSS"] },
        es: { title: "Web", items: ["Builds WebGL de Unity", "Three.js", "GSAP", "JS / CSS sin frameworks"] }
    }
];

const ui = {
    en: {
        navProjects: "Projects",
        navSkills: "Skills",
        navAbout: "Experience",
        filterAll: "All",
        filterGames: "Games & experiences",
        filterTools: "Unity tools",
        menuShuffle: "Shuffle accent",
        menuAttract: "Attract mode",
        menuGrain: "Film grain",
        menuColophon: "About this build",
        heroRole: "Unity Game Developer",
        heroTagline: "VR and AR for standalone headsets, multiplayer, and Unity Editor tooling.",
        heroAvailable: "Available for work",
        heroBadgeDegree: "Systems Engineer",
        heroBadgeTools: "5 years in production",
        heroBadgeLocation: "Colombia · Remote",
        heroCtaContact: "Get in touch",
        heroCtaItch: "Play on Itch.io",
        heroCtaGithub: "GitHub",
        workHeading: "Selected work",
        carouselHint: "Drag, or use ← →",
        skillsHeading: "What I build with",
        metaYear: "Year",
        metaRole: "Role",
        metaPlatform: "Platform",
        metaClient: "Client",
        ctaOpen: "Open project",
        ctaDownload: "Download",
        ctaPlay: "Play",
        ctaRepo: "Source",
        aboutTitle: "Experience & education",
        profileTitle: "Profile",
        profileDesc: "Unity developer working on VR and AR experiences for standalone headsets, multiplayer environments, and Android games. I like the unglamorous half of the job: making an interaction feel obvious, and keeping the frame budget honest on hardware that has none to spare. I also build small Editor tools when a workflow gets in the way. Fully remote, used to multidisciplinary teams.",
        eduTitle: "Education",
        eduGenDegree: "Unity Developer Bootcamp",
        eduGen: "Generation · Jun 2026 — Sep 2026",
        eduGenStatus: "In progress",
        eduDegree: "Bachelor of Systems Engineering",
        eduUni: "Universidad del Sinú – Unisinú · Aug 2024",
        eduSenaDegree: "Video Game Development",
        eduSena: "Servicio Nacional de Aprendizaje – SENA",
        btnContact: "Contact me on LinkedIn",
        expTitle: "Work experience",
        exp1Role: "Game Developer",
        exp1Desc: "Virtual and augmented reality experiences in Unity for Android-based headsets — Meta Quest 3 and PICO 4 Ultra Enterprise. Real-time interaction systems, multiplayer sessions, and the performance work needed to ship on mobile hardware.",
        exp2Role: "Mobile Game Developer",
        exp2Desc: "Android game prototypes in Unity. Core mechanics, UI systems and particle effects, with performance tuned for low and mid-range devices.",
        footerNote: "Built with vanilla JavaScript, Three.js and GSAP. No framework, no build step.",
        goToProject: "Go to project",
        muteOn: "Sound on",
        muteOff: "Sound off",
        langSwitch: "Cambiar a español",
        attractOn: "Attract mode on — the shelf advances on its own.",
        attractOff: "Attract mode off.",
        grainOn: "Film grain on.",
        grainOff: "Film grain off.",
        shuffle: "Accent shuffled.",
        colophon: "Vanilla JS, Three.js and GSAP. Eight cards on an arc, procedural audio, and a minigame hiding behind the logo.",
        noWebGL: "This browser can't run WebGL, so the 3D shelf is unavailable. Every project is still listed below."
    },
    es: {
        navProjects: "Proyectos",
        navSkills: "Skills",
        navAbout: "Experiencia",
        filterAll: "Todo",
        filterGames: "Juegos y experiencias",
        filterTools: "Herramientas Unity",
        menuShuffle: "Cambiar acento",
        menuAttract: "Modo demo",
        menuGrain: "Grano de película",
        menuColophon: "Sobre esta web",
        heroRole: "Desarrollador de Videojuegos Unity",
        heroTagline: "VR y AR para visores autónomos, multijugador y herramientas para el editor de Unity.",
        heroAvailable: "Disponible para trabajar",
        heroBadgeDegree: "Ingeniero de Sistemas",
        heroBadgeTools: "5 años en producción",
        heroBadgeLocation: "Colombia · Remoto",
        heroCtaContact: "Hablemos",
        heroCtaItch: "Jugar en Itch.io",
        heroCtaGithub: "GitHub",
        workHeading: "Trabajo seleccionado",
        carouselHint: "Arrastra, o usa ← →",
        skillsHeading: "Con qué trabajo",
        metaYear: "Año",
        metaRole: "Rol",
        metaPlatform: "Plataforma",
        metaClient: "Cliente",
        ctaOpen: "Ver proyecto",
        ctaDownload: "Descargar",
        ctaPlay: "Jugar",
        ctaRepo: "Código",
        aboutTitle: "Experiencia y educación",
        profileTitle: "Perfil",
        profileDesc: "Desarrollador Unity trabajando en experiencias de VR y AR para visores autónomos, entornos multijugador y juegos Android. Me gusta la mitad menos vistosa del trabajo: que una interacción se sienta obvia y que el presupuesto de frame sea honesto en hardware que no tiene margen. También construyo pequeñas herramientas de editor cuando un flujo de trabajo estorba. Cien por ciento remoto, acostumbrado a equipos multidisciplinarios.",
        eduTitle: "Educación",
        eduGenDegree: "Bootcamp de Desarrollo Unity",
        eduGen: "Generation · Jun 2026 — Sep 2026",
        eduGenStatus: "En curso",
        eduDegree: "Ingeniero de Sistemas",
        eduUni: "Universidad del Sinú – Unisinú · Ago 2024",
        eduSenaDegree: "Desarrollo de Videojuegos",
        eduSena: "Servicio Nacional de Aprendizaje – SENA",
        btnContact: "Contáctame en LinkedIn",
        expTitle: "Experiencia laboral",
        exp1Role: "Desarrollador de Videojuegos",
        exp1Desc: "Experiencias de realidad virtual y aumentada en Unity para visores basados en Android — Meta Quest 3 y PICO 4 Ultra Enterprise. Sistemas de interacción en tiempo real, sesiones multijugador y el trabajo de rendimiento necesario para publicar en hardware móvil.",
        exp2Role: "Desarrollador de Juegos Móviles",
        exp2Desc: "Prototipos de juegos Android en Unity. Mecánicas principales, sistemas de UI y efectos de partículas, con rendimiento ajustado a dispositivos de gama baja y media.",
        footerNote: "Hecho con JavaScript, Three.js y GSAP. Sin framework, sin build.",
        goToProject: "Ir al proyecto",
        muteOn: "Sonido activado",
        muteOff: "Sonido desactivado",
        langSwitch: "Switch to English",
        attractOn: "Modo demo activo: la estantería avanza sola.",
        attractOff: "Modo demo desactivado.",
        grainOn: "Grano activado.",
        grainOff: "Grano desactivado.",
        shuffle: "Acento cambiado.",
        colophon: "JS sin frameworks, Three.js y GSAP. Ocho tarjetas en un arco, audio procedural y un minijuego escondido detrás del logo.",
        noWebGL: "Este navegador no puede ejecutar WebGL, así que la estantería 3D no está disponible. Todos los proyectos siguen listados abajo."
    }
};

// ==========================================
// 2. Theme
// ==========================================
// Colour maths stays in plain sRGB here. THREE.Color works in linear space and
// gamma-converts on the way out, which turned an L=0.045 "near black" into a
// mid grey the first time this ramp was generated.
function hexToHsl(hex) {
    const int = parseInt(hex.replace('#', ''), 16);
    const r = ((int >> 16) & 255) / 255;
    const g = ((int >> 8) & 255) / 255;
    const b = (int & 255) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;
    }
    return { h, s, l, rgb: [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)] };
}

function hsl(h, s, l) {
    return `hsl(${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%)`;
}

// The neutral ramp carries a trace of the project's hue rather than switching
// the page to a new colour scheme — the accent stays a mark, not a wash.
function generatePalette(hex) {
    const { h, s, rgb } = hexToHsl(hex);
    return {
        primary: hex,
        bg: hsl(h, 0.11, 0.045),
        surface: hsl(h, 0.10, 0.072),
        surface2: hsl(h, 0.10, 0.105),
        surface3: hsl(h, 0.09, 0.155),
        accent: hex,
        accentSoft: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.13)`,
        secondary: hsl(h, Math.min(s * 0.5, 0.4), 0.68)
    };
}

function applyTheme(palette) {
    const root = document.documentElement.style;
    root.setProperty('--bg', palette.bg);
    root.setProperty('--surface', palette.surface);
    root.setProperty('--surface-2', palette.surface2);
    root.setProperty('--surface-3', palette.surface3);
    root.setProperty('--accent', palette.accent);
    root.setProperty('--accent-soft', palette.accentSoft);
    root.setProperty('--secondary', palette.secondary);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', palette.bg);
}

projects.forEach((p) => {
    p.palette = generatePalette(p.color);
    p.link = p.link || '';
});

// ==========================================
// 3. State & DOM
// ==========================================
const STORAGE_LANG = 'krost-lang';
const STORAGE_MUTE = 'krost-muted';
const STORAGE_GRAIN = 'krost-grain';

function detectLang() {
    const saved = localStorage.getItem(STORAGE_LANG);
    if (saved === 'en' || saved === 'es') return saved;
    return (navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
}

let currentLang = detectLang();
let currentIndex = 0;
let currentOffset = 0;
const totalProjects = projects.length;
let activeCategory = 'all';
let filteredIndices = projects.map((_, i) => i);
let filteredCount = projects.length;

const titleEl = document.getElementById('project-title');
const descEl = document.getElementById('project-desc');
const tagsEl = document.getElementById('project-tags');
const metaEl = document.getElementById('project-meta');
const highlightsEl = document.getElementById('project-highlights');
const ctaEl = document.getElementById('project-cta');
const contentContainer = document.getElementById('content-container');
const langToggle = document.getElementById('lang-toggle');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const liveRegion = document.getElementById('carousel-live');
const canvasContainer = document.getElementById('canvas-container');

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function t(key) { return ui[currentLang][key]; }

// ==========================================
// 5. Static UI text
// ==========================================
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function renderStaticText() {
    const s = ui[currentLang];
    document.documentElement.lang = currentLang;

    setText('nav-projects', s.navProjects);
    setText('nav-skills', s.navSkills);
    setText('nav-about', s.navAbout);
    setText('hero-role', s.heroRole);
    setText('hero-tagline', s.heroTagline);
    setText('hero-available', s.heroAvailable);
    setText('hero-badge-degree', s.heroBadgeDegree);
    setText('hero-badge-tools', s.heroBadgeTools);
    setText('hero-badge-location', s.heroBadgeLocation);
    setText('hero-cta-contact', s.heroCtaContact);
    setText('hero-cta-itch', s.heroCtaItch);
    setText('hero-cta-github', s.heroCtaGithub);
    setText('work-heading', s.workHeading);
    setText('carousel-hint', s.carouselHint);
    setText('skills-heading', s.skillsHeading);
    setText('about-title', s.aboutTitle);
    setText('profile-title', s.profileTitle);
    setText('profile-desc', s.profileDesc);
    setText('edu-title', s.eduTitle);
    setText('edu-gen-degree', s.eduGenDegree);
    setText('edu-gen', s.eduGen);
    setText('edu-gen-status', s.eduGenStatus);
    // "In progress" is a claim with an expiry date — retire it on its own so a
    // stale badge can't sit on the page after the bootcamp ends.
    const genStatus = document.getElementById('edu-gen-status');
    if (genStatus) genStatus.hidden = Date.now() >= Date.parse('2026-10-01');
    setText('edu-degree', s.eduDegree);
    setText('edu-uni', s.eduUni);
    setText('edu-sena-degree', s.eduSenaDegree);
    setText('edu-sena', s.eduSena);
    setText('btn-contact', s.btnContact);
    setText('exp-title', s.expTitle);
    setText('exp1-role', s.exp1Role);
    setText('exp1-desc', s.exp1Desc);
    setText('exp2-role', s.exp2Role);
    setText('exp2-desc', s.exp2Desc);
    setText('footer-note', s.footerNote);

    const filterKeys = { all: 'filterAll', game: 'filterGames', tool: 'filterTools' };
    document.querySelectorAll('.filter-tab').forEach(btn => {
        const key = filterKeys[btn.dataset.filter];
        if (key && s[key]) btn.textContent = s[key];
    });
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (s[key]) el.textContent = s[key];
    });

    if (langToggle) {
        langToggle.textContent = currentLang === 'en' ? 'ES' : 'EN';
        langToggle.setAttribute('aria-label', s.langSwitch);
    }
    renderSkills();
}

function renderSkills() {
    const grid = document.getElementById('skills-grid');
    if (!grid) return;
    grid.innerHTML = '';
    skillGroups.forEach(group => {
        const data = group[currentLang];
        // No gs-reveal here: this list is rebuilt on every language switch, and
        // ScrollTriggers are only wired once at start-up.
        const box = document.createElement('div');
        box.className = 'skill-group';
        const h = document.createElement('h3');
        h.textContent = data.title;
        const list = document.createElement('ul');
        data.items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            list.appendChild(li);
        });
        box.append(h, list);
        grid.appendChild(box);
    });
}

// ==========================================
// 6. Project panel
// ==========================================
function ctaLabel(proj) {
    if (proj.linkLabel && proj.linkLabel[currentLang]) return proj.linkLabel[currentLang];
    if (proj.category === 'tool') return t('ctaDownload');
    return t('ctaPlay');
}

function renderMeta(proj) {
    metaEl.innerHTML = '';
    const rows = [
        [t('metaYear'), proj.year],
        [t('metaRole'), proj.role],
        [t('metaPlatform'), proj.platform],
        [t('metaClient'), proj.company]
    ];
    rows.forEach(([label, value]) => {
        if (!value) return;
        const wrap = document.createElement('div');
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = value;
        wrap.append(dt, dd);
        metaEl.appendChild(wrap);
    });
}

function renderMedia(proj, data) {
    const mediaEl = document.getElementById('project-media');
    if (!mediaEl) return;
    mediaEl.innerHTML = '';

    const images = (proj.images && proj.images.length) ? proj.images : [proj.placeholder];

    images.forEach((src, i) => {
        const figure = document.createElement('figure');
        figure.className = 'media-figure';
        const img = document.createElement('img');
        img.src = src;
        img.alt = `${data.title} — ${i + 1}`;
        img.className = 'project-media-img' + (src === proj.placeholder ? ' placeholder-img' : '');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = 640;
        img.height = 420;
        // Tall art (posters, phone screenshots) is contained rather than cropped.
        img.addEventListener('load', () => {
            if (img.naturalHeight > img.naturalWidth * 1.15) figure.classList.add('is-portrait');
        }, { once: true });
        if (src !== proj.placeholder) {
            img.addEventListener('click', () => openLightbox(img.src, img.alt));
        } else {
            img.style.cursor = 'default';
        }
        figure.appendChild(img);
        mediaEl.appendChild(figure);
    });

    (proj.videos || []).forEach(video => {
        const figure = document.createElement('figure');
        figure.className = 'media-figure';
        const el = document.createElement('video');
        el.src = video.src;
        if (video.poster) el.poster = video.poster;
        el.className = 'project-media-video';
        el.controls = true;
        // These captures are 45–85 MB; nothing is fetched until the user asks.
        el.preload = 'none';
        el.playsInline = true;
        el.setAttribute('aria-label', `${data.title} — video`);
        figure.appendChild(el);
        mediaEl.appendChild(figure);
    });
}

function updateProjectPanel() {
    const proj = projects[currentIndex];
    const data = proj[currentLang];

    applyTheme(proj.palette);
    document.title = `${data.title} — Eduardo Mogollón Salcedo`;

    const paint = () => {
        titleEl.textContent = data.title;
        descEl.textContent = data.desc;

        renderMeta(proj);

        tagsEl.innerHTML = '';
        proj.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = tag;
            tagsEl.appendChild(span);
        });

        highlightsEl.innerHTML = '';
        (data.highlights || []).forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            highlightsEl.appendChild(li);
        });

        if (proj.link) {
            ctaEl.href = proj.link;
            ctaEl.textContent = ctaLabel(proj);
            ctaEl.hidden = false;
        } else {
            ctaEl.hidden = true;
        }

        renderMedia(proj, data);
    };

    if (prefersReducedMotion) {
        paint();
        gsap.set(contentContainer, { opacity: 1, y: 0 });
    } else {
        gsap.killTweensOf(contentContainer);
        gsap.to(contentContainer, {
            opacity: 0,
            y: 14,
            duration: 0.22,
            ease: 'power2.in',
            onComplete: () => {
                paint();
                gsap.to(contentContainer, { opacity: 1, y: 0, duration: 0.42, ease: 'power3.out' });
            }
        });
    }

    // Blurred artwork behind the shelf
    const wrapper = document.getElementById('canvas-wrapper');
    if (wrapper) {
        wrapper.style.setProperty('--active-artwork', `url("${proj.cover || proj.placeholder}")`);
    }

    if (liveRegion) liveRegion.textContent = `${data.title}. ${filteredIndices.indexOf(currentIndex) + 1} / ${filteredCount}.`;

    tintScene(proj.color);
    updateIndicators();
}

// ==========================================
// 7. Section nav / scroll spy
// ==========================================
function updateNavPills(activeSection) {
    document.querySelectorAll('.nav-pill').forEach(pill => {
        pill.classList.toggle('active', pill.id === `nav-${activeSection}`);
    });
}

(function initScrollSpy() {
    const sections = [
        ['hero', 'projects'],
        ['work', 'projects'],
        ['skills', 'skills'],
        ['about', 'about']
    ];
    const map = new Map();
    const targets = [];
    sections.forEach(([id, pill]) => {
        const el = document.getElementById(id);
        if (!el) return;
        map.set(el, pill);
        targets.push(el);
    });
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter(e => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) updateNavPills(map.get(visible.target));
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    targets.forEach(el => observer.observe(el));
})();

// ==========================================
// 8. Logo menu
// ==========================================
let attractTimer = null;

(function initLogoDropdown() {
    const toggle = document.getElementById('logo-dropdown-toggle');
    const dropdown = document.getElementById('logo-dropdown');
    if (!toggle || !dropdown) return;

    function setOpen(isOpen) {
        toggle.setAttribute('aria-expanded', String(isOpen));
        dropdown.hidden = !isOpen;
        if (isOpen) dropdown.querySelector('.logo-dropdown-item')?.focus();
    }

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        setOpen(dropdown.hidden);
        enableAudio();
        playClickSound();
    });

    dropdown.addEventListener('click', (e) => {
        const item = e.target.closest('.logo-dropdown-item');
        if (!item) return;
        e.stopPropagation();
        setOpen(false);
        toggle.focus();
        enableAudio();
        playClickSound();
        runMenuAction(item.dataset.easterEgg);
    });

    document.addEventListener('click', () => { if (!dropdown.hidden) setOpen(false); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !dropdown.hidden) { setOpen(false); toggle.focus(); }
    });
})();

// A curated set, so "shuffle" can never land on mud.
const ACCENT_POOL = [
    '#c2954e', '#6d94bf', '#55a081', '#8b85c4', '#4f97a8',
    '#86a35c', '#c07f57', '#c4605a', '#a8879c', '#5f8f9e'
];

function runMenuAction(type) {
    if (type === 'shuffle-accent') {
        const pool = ACCENT_POOL.filter(c => c !== getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
        const color = pool[Math.floor(Math.random() * pool.length)];
        applyTheme(generatePalette(color));
        tintScene(color);
        showToast(t('shuffle'));
    } else if (type === 'attract-mode') {
        if (attractTimer) {
            clearInterval(attractTimer);
            attractTimer = null;
            showToast(t('attractOff'));
        } else {
            attractTimer = setInterval(() => navigateTo(getNextFilteredIndex(1)), 4200);
            showToast(t('attractOn'));
        }
    } else if (type === 'grain') {
        const grain = document.getElementById('grain-overlay');
        if (!grain) return;
        grain.classList.toggle('off');
        const off = grain.classList.contains('off');
        localStorage.setItem(STORAGE_GRAIN, off ? 'off' : 'on');
        showToast(off ? t('grainOff') : t('grainOn'));
    } else if (type === 'colophon') {
        showToast(t('colophon'));
    }
}

function stopAttract() {
    if (attractTimer) {
        clearInterval(attractTimer);
        attractTimer = null;
    }
}

function showToast(message) {
    let toast = document.getElementById('krost-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'krost-toast';
        toast.className = 'easter-egg-toast';
        toast.setAttribute('role', 'status');
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

if (localStorage.getItem(STORAGE_GRAIN) === 'off') {
    document.getElementById('grain-overlay')?.classList.add('off');
}

// ==========================================
// 9. Language toggle
// ==========================================
langToggle.addEventListener('click', () => {
    enableAudio();
    playClickSound();
    currentLang = currentLang === 'en' ? 'es' : 'en';
    localStorage.setItem(STORAGE_LANG, currentLang);
    renderStaticText();
    updateProjectPanel();
    refreshCardBacks();
    buildIndicators();
    updateMuteButton();
});

prevBtn.addEventListener('click', () => { stopAttract(); enableAudio(); playClickSound(); navigateTo(getNextFilteredIndex(-1)); });
nextBtn.addEventListener('click', () => { stopAttract(); enableAudio(); playClickSound(); navigateTo(getNextFilteredIndex(1)); });

// ==========================================
// 10. Three.js shelf
// ==========================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(0, 0.25, 5);
camera.lookAt(0, 0, 0);

function hasWebGL() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) return false;
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return true;
    } catch (e) {
        return false;
    }
}

let renderer = null;
if (hasWebGL()) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    canvasContainer.appendChild(renderer.domElement);
    resizeRenderer();
} else {
    canvasContainer.innerHTML = `<p class="webgl-fallback">${t('noWebGL')}</p>`;
}

function resizeRenderer() {
    if (!renderer) return;
    const w = canvasContainer.clientWidth || 1;
    const h = canvasContainer.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // updateStyle must stay on: without it the canvas lays out at its backing
    // store size, which is 2x the container on HiDPI screens.
    renderer.setSize(w, h);
}

// Neutral three-point lighting. No coloured rim lights, no additive bloom —
// the cards are lit like objects on a shelf.
scene.add(new THREE.AmbientLight(0xffffff, 0.62));

const keyLight = new THREE.DirectionalLight(0xfff6ec, 1.15);
keyLight.position.set(2.6, 4.2, 5.5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xd6e2f0, 0.42);
fillLight.position.set(-3.4, 1.2, 3.6);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
rimLight.position.set(-2.5, -1, -4);
scene.add(rimLight);

// A single soft key that follows the active card — the only place the project
// colour touches the lighting, and only faintly.
const accentLight = new THREE.PointLight(0xffffff, 0.55, 14, 2);
accentLight.position.set(0, 0.4, 2.4);
scene.add(accentLight);

function tintScene(hexColor) {
    const color = new THREE.Color(hexColor);
    gsap.to(accentLight.color, { r: color.r, g: color.g, b: color.b, duration: 0.7, overwrite: 'auto' });
    frameMeshes.forEach(frame => {
        if (frame) gsap.to(frame.material.color, { r: color.r, g: color.g, b: color.b, duration: 0.7, overwrite: 'auto' });
    });
}

// Cover-load counters drive the boot bar. Counting here rather than through a
// LoadingManager avoids the race where cached covers finish before the boot
// screen has attached its callbacks.
let coversTotal = 0;
let coversDone = 0;

// ---- Shared textures ------------------------------------------------------
const CARD_W = 640;
const CARD_H = 960;
const CARD_RADIUS = 26;

function roundedPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function makeCanvas(w = CARD_W, h = CARD_H) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
}

function canvasTexture(canvas, srgb = true) {
    const tex = new THREE.CanvasTexture(canvas);
    if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
    tex.needsUpdate = true;
    return tex;
}

// Rounded-corner mask, shared by every card face.
const roundedAlphaMap = (() => {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    roundedPath(ctx, 0, 0, CARD_W, CARD_H, CARD_RADIUS);
    ctx.fill();
    return canvasTexture(canvas, false);
})();

// Soft drop shadow — replaces the additive glow plane that used to sit behind
// every card. Dark and directional, so cards look placed rather than lit up.
const shadowTexture = (() => {
    const W = 512, H = 640;
    const canvas = makeCanvas(W, H);
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
    grad.addColorStop(0, 'rgba(0,0,0,0.62)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.32)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    return canvasTexture(canvas, false);
})();

// Selection frame for the active card: a hairline outline, nothing more.
const frameTexture = (() => {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 7;
    roundedPath(ctx, 4, 4, CARD_W - 8, CARD_H - 8, CARD_RADIUS);
    ctx.stroke();
    return canvasTexture(canvas, false);
})();

// ---- Card front ----------------------------------------------------------
function wrapLines(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    words.forEach((word, i) => {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && i > 0) {
            lines.push(line);
            line = word;
        } else {
            line = test;
        }
    });
    if (line) lines.push(line);
    return lines;
}

function drawCover(ctx, img, x, y, w, h) {
    const targetAspect = w / h;
    const imgAspect = img.width / img.height;
    let sx, sy, sw, sh;
    if (imgAspect > targetAspect) {
        sh = img.height;
        sw = sh * targetAspect;
        sy = 0;
        sx = (img.width - sw) / 2;
    } else {
        sw = img.width;
        sh = sw / targetAspect;
        sx = 0;
        sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

// Composed cover: artwork on top, a typographic plate below. This is what a
// project gets when its art is a screenshot rather than designed key art.
function drawComposedCover(ctx, proj, img) {
    const { h } = hexToHsl(proj.color);
    const plateTop = Math.round(CARD_H * 0.66);

    const plate = hsl(h, 0.16, 0.055);
    ctx.fillStyle = plate;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    if (img) {
        drawCover(ctx, img, 0, 0, CARD_W, plateTop);
        const fade = ctx.createLinearGradient(0, plateTop - 150, 0, plateTop);
        fade.addColorStop(0, 'rgba(0,0,0,0)');
        fade.addColorStop(1, plate);
        ctx.fillStyle = fade;
        ctx.fillRect(0, plateTop - 150, CARD_W, 150);
    }

    // accent rule
    ctx.fillStyle = proj.color;
    ctx.fillRect(44, plateTop + 34, 34, 3);

    const data = proj[currentLang] || proj.en;

    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.font = '500 22px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText((proj.year || '').toUpperCase(), 44, plateTop + 96);

    ctx.fillStyle = '#e8e6e3';
    ctx.font = '600 46px "Space Grotesk", sans-serif';
    const lines = wrapLines(ctx, data.title, CARD_W - 88).slice(0, 3);
    let y = plateTop + 158;
    lines.forEach(line => {
        ctx.fillText(line, 44, y);
        y += 54;
    });

    if (data.subtitle) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '400 26px "Space Grotesk", sans-serif';
        ctx.fillText(data.subtitle, 44, y + 8);
    }
}

// Typographic cover for projects with no artwork at all. A quiet field, a
// large ghosted monogram, and real type — no procedural confetti.
function drawTypographicCover(ctx, proj) {
    const { h } = hexToHsl(proj.color);

    const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    grad.addColorStop(0, hsl(h, 0.2, 0.115));
    grad.addColorStop(1, hsl(h, 0.18, 0.05));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    // ghosted monogram
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 460px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(proj.en.title.charAt(0), CARD_W / 2, CARD_H * 0.42);
    ctx.restore();

    // hairline grid, evenly spaced — structure, not decoration
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 80; x < CARD_W; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CARD_H);
        ctx.stroke();
    }

    const data = proj[currentLang] || proj.en;

    ctx.fillStyle = proj.color;
    ctx.fillRect(44, CARD_H - 268, 34, 3);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.font = '500 22px "JetBrains Mono", monospace';
    ctx.fillText(proj.year || '', 44, CARD_H - 208);

    ctx.fillStyle = '#e8e6e3';
    ctx.font = '600 46px "Space Grotesk", sans-serif';
    const lines = wrapLines(ctx, data.title, CARD_W - 88).slice(0, 3);
    let y = CARD_H - 148;
    lines.forEach(line => {
        ctx.fillText(line, 44, y);
        y += 54;
    });
}

function createCardFrontTexture(proj) {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    const texture = canvasTexture(canvas);

    if (!proj.cover) {
        drawTypographicCover(ctx, proj);
        proj.placeholder = canvas.toDataURL('image/png');
        texture.needsUpdate = true;
        return texture;
    }

    // Placeholder fill while the cover downloads, so nothing flashes white.
    drawTypographicCover(ctx, proj);
    texture.needsUpdate = true;

    const img = new Image();
    coversTotal++;
    img.decoding = 'async';
    img.onload = () => {
        ctx.clearRect(0, 0, CARD_W, CARD_H);
        if (proj.posterCover) {
            // Designed key art already carries its own title — show it whole.
            drawCover(ctx, img, 0, 0, CARD_W, CARD_H);
        } else {
            drawComposedCover(ctx, proj, img);
        }
        texture.needsUpdate = true;
        coversDone++;
    };
    img.onerror = () => { coversDone++; };
    img.src = proj.cover;

    return texture;
}

// ---- Card back -----------------------------------------------------------
function drawCardBack(ctx, proj) {
    const data = proj[currentLang] || proj.en;
    const { h } = hexToHsl(proj.color);

    ctx.clearRect(0, 0, CARD_W, CARD_H);
    ctx.fillStyle = hsl(h, 0.12, 0.062);
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    roundedPath(ctx, 22, 22, CARD_W - 44, CARD_H - 44, 14);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = proj.color;
    ctx.fillRect(56, 86, 34, 3);

    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.font = '500 21px "JetBrains Mono", monospace';
    ctx.fillText(`${proj.year || ''}${proj.platform ? '  ·  ' + proj.platform : ''}`, 56, 146);

    ctx.fillStyle = '#e8e6e3';
    ctx.font = '600 42px "Space Grotesk", sans-serif';
    let y = 216;
    wrapLines(ctx, data.title, CARD_W - 112).slice(0, 3).forEach(line => {
        ctx.fillText(line, 56, y);
        y += 50;
    });

    ctx.fillStyle = '#9ba3ad';
    ctx.font = '400 25px "Space Grotesk", sans-serif';
    y += 20;
    wrapLines(ctx, data.desc, CARD_W - 112).slice(0, 5).forEach(line => {
        ctx.fillText(line, 56, y);
        y += 36;
    });

    // What was actually built — the reason flipping a card is worth doing.
    y += 34;
    ctx.font = '400 23px "Space Grotesk", sans-serif';
    (data.highlights || []).slice(0, 3).forEach(item => {
        const lines = wrapLines(ctx, item, CARD_W - 138);
        ctx.fillStyle = proj.color;
        ctx.fillRect(56, y - 9, 12, 2);
        ctx.fillStyle = '#8b929c';
        lines.forEach((line, i) => {
            ctx.fillText(line, 84, y + i * 32);
        });
        y += lines.length * 32 + 18;
    });

    // tags, wrapped as chips
    ctx.font = '500 20px "JetBrains Mono", monospace';
    let cx = 56;
    let cy = Math.min(y + 42, CARD_H - 116);
    proj.tags.forEach(tag => {
        const w = ctx.measureText(tag).width + 26;
        if (cx + w > CARD_W - 56) { cx = 56; cy += 44; }
        ctx.strokeStyle = 'rgba(255,255,255,0.14)';
        ctx.lineWidth = 1.5;
        roundedPath(ctx, cx, cy - 24, w, 34, 5);
        ctx.stroke();
        ctx.fillStyle = '#9ba3ad';
        ctx.fillText(tag, cx + 13, cy);
        cx += w + 8;
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '500 20px "JetBrains Mono", monospace';
    ctx.fillText(currentLang === 'es' ? 'Clic para volver' : 'Click to flip back', CARD_W / 2, CARD_H - 56);
}

function createCardBackTexture(proj) {
    const canvas = makeCanvas();
    drawCardBack(canvas.getContext('2d'), proj);
    const tex = canvasTexture(canvas);
    tex.userData = { canvas, proj };
    return tex;
}

// Card backs bake their text into a canvas, so a language switch has to redraw
// them — otherwise Spanish visitors read English backs.
function refreshCardBacks() {
    carouselItems.forEach((mesh, i) => {
        const back = mesh.userData.backMesh;
        if (!back) return;
        const tex = back.material.map;
        if (!tex || !tex.userData || !tex.userData.canvas) return;
        drawCardBack(tex.userData.canvas.getContext('2d'), projects[i]);
        tex.needsUpdate = true;
    });
}

// ---- Build the shelf -----------------------------------------------------
const cardGeometry = new THREE.PlaneGeometry(2.24, 3.36);
const shadowGeometry = new THREE.PlaneGeometry(3.1, 4.3);
const carouselItems = [];
const frameMeshes = [];

const ARC_RADIUS = 5.0;
const ARC_SPAN_DEG = isTouchDevice ? 62 : 108;
const DEPTH_MULT = 1.35;
let ANGLE_PER_CARD = THREE.MathUtils.degToRad(ARC_SPAN_DEG / Math.max(1, filteredCount - 1));
let HALF_SPAN = filteredCount / 2;

function updateCarouselParams() {
    ANGLE_PER_CARD = THREE.MathUtils.degToRad(ARC_SPAN_DEG / Math.max(1, filteredCount - 1));
    HALF_SPAN = filteredCount / 2;
}

projects.forEach((proj, i) => {
    const frontMaterial = new THREE.MeshStandardMaterial({
        map: createCardFrontTexture(proj),
        roughness: 0.42,
        metalness: 0.02,
        alphaMap: roundedAlphaMap,
        transparent: true,
        alphaTest: 0.5
    });
    const mesh = new THREE.Mesh(cardGeometry, frontMaterial);

    const shadow = new THREE.Mesh(shadowGeometry, new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.6,
        depthWrite: false
    }));
    shadow.position.set(0, -0.22, -0.06);
    mesh.add(shadow);

    const frame = new THREE.Mesh(cardGeometry, new THREE.MeshBasicMaterial({
        map: frameTexture,
        color: new THREE.Color(proj.color),
        transparent: true,
        opacity: 0,
        depthWrite: false
    }));
    frame.position.z = 0.012;
    frame.scale.set(1.035, 1.028, 1);
    mesh.add(frame);
    frameMeshes.push(frame);

    const backMesh = new THREE.Mesh(cardGeometry, new THREE.MeshStandardMaterial({
        map: createCardBackTexture(proj),
        roughness: 0.5,
        metalness: 0.02,
        alphaMap: roundedAlphaMap,
        transparent: true,
        alphaTest: 0.5
    }));
    backMesh.position.z = -0.03;
    backMesh.rotation.y = Math.PI;
    mesh.add(backMesh);

    mesh.userData = { projectId: i, isFlipped: false, backMesh, shadow, frame, baseScale: 1 };
    scene.add(mesh);
    carouselItems.push(mesh);
});

function getWrappedOffset(i, offset, count = filteredCount) {
    const half = count / 2;
    let diff = i - offset;
    diff = ((diff + half) % count + count) % count - half;
    return diff;
}

let spacingBoost = 0;
const SPACING_DECAY = 0.92;

function getCardTransform(wrappedOffset) {
    const angle = wrappedOffset * ANGLE_PER_CARD * (1 + spacingBoost);
    const x = ARC_RADIUS * Math.sin(angle);
    const z = ARC_RADIUS * (Math.cos(angle) - 1) * DEPTH_MULT;
    const abs = Math.abs(wrappedOffset);
    const scale = Math.max(0.35, 1 - Math.pow(abs / 3, 1.35) * 0.36);
    const rotY = Math.atan2(-x, 5 - z);
    return { x, z, scale, rotY };
}

function updateCardPositions(animated = false) {
    carouselItems.forEach((mesh, originalIdx) => {
        const filteredIdx = filteredIndices.indexOf(originalIdx);

        if (filteredIdx === -1) {
            mesh.visible = false;
            mesh.userData.baseScale = 0;
            return;
        }
        mesh.visible = true;

        const wrapped = getWrappedOffset(filteredIdx, currentOffset);
        const tr = getCardTransform(wrapped);
        const isActive = Math.abs(wrapped) < 0.02;

        mesh.userData.baseScale = tr.scale;
        mesh.renderOrder = Math.round(100 - Math.abs(wrapped) * 10);

        const frame = mesh.userData.frame;
        if (frame) {
            const targetOpacity = isActive ? 0.85 : 0;
            if (animated && !prefersReducedMotion) {
                gsap.to(frame.material, { opacity: targetOpacity, duration: 0.3, overwrite: 'auto' });
            } else {
                frame.material.opacity = targetOpacity;
            }
        }
        if (mesh.userData.shadow) {
            mesh.userData.shadow.material.opacity = isActive ? 0.72 : 0.42;
        }

        if (animated && !prefersReducedMotion) {
            gsap.to(mesh.position, { x: tr.x, z: tr.z, duration: 0.7, ease: 'power3.inOut', overwrite: 'auto' });
            gsap.to(mesh.scale, { x: tr.scale, y: tr.scale, duration: 0.7, ease: 'power3.inOut', overwrite: 'auto' });
            gsap.to(mesh.rotation, { y: tr.rotY, duration: 0.7, ease: 'power3.inOut', overwrite: 'auto' });
        } else {
            mesh.position.x = tr.x;
            mesh.position.z = tr.z;
            mesh.scale.set(tr.scale, tr.scale, 1);
            mesh.rotation.y = tr.rotY;
        }
    });
}

// ==========================================
// 11. Navigation
// ==========================================
const offsetProxy = { value: 0 };

function animateOffsetTo(targetOffset) {
    gsap.killTweensOf(offsetProxy);
    if (prefersReducedMotion) {
        currentOffset = targetOffset;
        updateCardPositions(false);
        return;
    }
    offsetProxy.value = currentOffset;
    const dist = Math.abs(targetOffset - currentOffset);
    gsap.to(offsetProxy, {
        value: targetOffset,
        duration: Math.min(0.68, Math.max(0.34, dist * 0.24)),
        ease: 'power4.inOut',
        onUpdate: () => {
            currentOffset = offsetProxy.value;
            updateCardPositions(false);
        }
    });
}

function getNextFilteredIndex(delta) {
    const currentFi = filteredIndices.indexOf(currentIndex);
    if (currentFi === -1) return filteredIndices[0];
    return filteredIndices[(currentFi + delta + filteredCount) % filteredCount];
}

// Maps a raw carousel offset back to a project index *within the active
// filter* — the old code used the unfiltered project count here, so dragging
// with a filter on could select a hidden card.
function projectIndexForOffset(offset) {
    const fi = ((Math.round(offset) % filteredCount) + filteredCount) % filteredCount;
    return filteredIndices[fi];
}

function navigateTo(targetIdx, opts = {}) {
    let targetFilteredIndex = filteredIndices.indexOf(targetIdx);
    if (targetFilteredIndex === -1) {
        targetFilteredIndex = 0;
        targetIdx = filteredIndices[0];
    }
    if (targetIdx === currentIndex && !opts.force) return;

    const previous = currentIndex;
    currentIndex = targetIdx;

    const diff = targetFilteredIndex - currentOffset;
    const half = filteredCount / 2;
    const shortest = ((diff + half) % filteredCount + filteredCount) % filteredCount - half;
    animateOffsetTo(currentOffset + shortest);

    unflipAllCards();
    updateProjectPanel();

    if (currentIndex !== previous) {
        enableAudio();
        playProjectSound(currentIndex, 'navigate');
        hapticPulse();
    }
}

// ==========================================
// 12. Hover, flip, pointer
// ==========================================
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredIndex = -1;

function pickCard(clientX, clientY) {
    if (!renderer) return -1;
    const rect = canvasContainer.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(carouselItems, false);
    return hits.length ? hits[0].object.userData.projectId : -1;
}

function setCardHover(idx, active) {
    const mesh = carouselItems[idx];
    if (!mesh) return;
    const base = mesh.userData.baseScale || 1;
    const factor = active ? 1.055 : 1;
    gsap.to(mesh.scale, { x: base * factor, y: base * factor, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
    gsap.to(mesh.position, { y: active ? 0.06 : 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
    if (mesh.userData.shadow) {
        gsap.to(mesh.userData.shadow.material, { opacity: active ? 0.78 : 0.45, duration: 0.3, overwrite: 'auto' });
    }
    if (customCursor) customCursor.classList.toggle('hover', active);
    if (active && idx !== lastHoverSoundIdx) {
        lastHoverSoundIdx = idx;
        enableAudio();
        playProjectSound(idx, 'hover');
    }
    if (!active && idx === lastHoverSoundIdx) lastHoverSoundIdx = -1;
}
let lastHoverSoundIdx = -1;

function flipCard(idx) {
    const mesh = carouselItems[idx];
    if (!mesh) return;
    const isFlipped = mesh.userData.isFlipped;
    gsap.to(mesh.rotation, {
        y: mesh.rotation.y + (isFlipped ? -Math.PI : Math.PI),
        duration: 0.55,
        ease: 'power2.inOut',
        overwrite: 'auto'
    });
    mesh.userData.isFlipped = !isFlipped;
    enableAudio();
    playProjectSound(idx, 'flip');
}

function unflipAllCards() {
    carouselItems.forEach(mesh => {
        if (!mesh.userData.isFlipped) return;
        gsap.to(mesh.rotation, { y: mesh.rotation.y - Math.PI, duration: 0.4, ease: 'power2.inOut', overwrite: 'auto' });
        mesh.userData.isFlipped = false;
    });
}

canvasContainer.addEventListener('pointermove', (e) => {
    if (isDragging) return;
    const idx = pickCard(e.clientX, e.clientY);
    if (idx !== hoveredIndex) {
        if (hoveredIndex >= 0) setCardHover(hoveredIndex, false);
        hoveredIndex = idx;
        if (idx >= 0) setCardHover(idx, true);
    }
});

canvasContainer.addEventListener('pointerleave', () => {
    if (hoveredIndex >= 0) setCardHover(hoveredIndex, false);
    hoveredIndex = -1;
});

// ---- Wheel: vertical scrolls the page, horizontal/Shift moves the shelf
let wheelBlocked = false;
canvasContainer.addEventListener('wheel', (e) => {
    const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (!isHorizontal && !e.shiftKey) return;
    e.preventDefault();
    if (wheelBlocked) return;
    wheelBlocked = true;
    setTimeout(() => { wheelBlocked = false; }, 620);
    stopAttract();
    const delta = isHorizontal ? e.deltaX : e.deltaY;
    navigateTo(getNextFilteredIndex(delta > 0 ? 1 : -1));
}, { passive: false });

// ---- Drag / swipe
let isDragging = false;
let dragStartX = 0;
let dragStartOffset = 0;
let hasMoved = false;
let dragVelocity = 0;
let lastMoveX = 0;
let lastMoveTime = 0;
const DRAG_SENSITIVITY = isTouchDevice ? 70 : 110;

canvasContainer.addEventListener('pointerdown', (e) => {
    if (!renderer) return;
    gsap.killTweensOf(offsetProxy);
    stopAttract();
    isDragging = true;
    hasMoved = false;
    dragStartX = e.clientX;
    dragStartOffset = currentOffset;
    dragVelocity = 0;
    lastMoveX = e.clientX;
    lastMoveTime = performance.now();
    canvasContainer.classList.add('dragging');
    canvasContainer.setPointerCapture(e.pointerId);
});

canvasContainer.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    if (Math.abs(deltaX) > 6) hasMoved = true;

    const now = performance.now();
    const dt = now - lastMoveTime;
    if (dt > 0) dragVelocity = (e.clientX - lastMoveX) / dt;
    lastMoveX = e.clientX;
    lastMoveTime = now;

    currentOffset = dragStartOffset - (deltaX / DRAG_SENSITIVITY);
    spacingBoost = Math.min(Math.abs(dragVelocity) * 0.15, 0.4);
    updateCardPositions(false);
});

function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    canvasContainer.classList.remove('dragging');
    if (e && e.pointerId !== undefined && canvasContainer.hasPointerCapture(e.pointerId)) {
        canvasContainer.releasePointerCapture(e.pointerId);
    }

    if (e && !hasMoved) {
        const idx = pickCard(e.clientX, e.clientY);
        if (idx >= 0) {
            if (idx === currentIndex) flipCard(idx);
            else navigateTo(idx);
            return;
        }
        return;
    }

    const absVel = Math.abs(dragVelocity);
    let targetOffset;
    if (absVel > 0.25) {
        const dir = dragVelocity > 0 ? -1 : 1;
        targetOffset = Math.round(currentOffset + dir * Math.min(Math.floor(absVel * 3.5), 3));
    } else {
        targetOffset = Math.round(currentOffset);
    }

    const nextIndex = projectIndexForOffset(targetOffset);
    const changed = nextIndex !== currentIndex;
    currentIndex = nextIndex;
    animateOffsetTo(targetOffset);
    unflipAllCards();
    updateProjectPanel();
    if (changed) {
        enableAudio();
        playProjectSound(currentIndex, 'navigate');
        hapticPulse();
    }
}

canvasContainer.addEventListener('pointerup', endDrag);
canvasContainer.addEventListener('pointercancel', () => {
    if (!isDragging) return;
    isDragging = false;
    canvasContainer.classList.remove('dragging');
    currentIndex = projectIndexForOffset(currentOffset);
    animateOffsetTo(Math.round(currentOffset));
    updateProjectPanel();
});

// ==========================================
// 13. Render loop — paused when the shelf is off screen
// ==========================================
const clock = new THREE.Clock();
let shelfVisible = true;
let rafId = null;

function animate() {
    rafId = requestAnimationFrame(animate);
    if (!renderer || !shelfVisible) return;

    const elapsed = clock.getElapsedTime();
    spacingBoost *= SPACING_DECAY;

    if (!prefersReducedMotion) {
        carouselItems.forEach((mesh, i) => {
            if (!mesh.visible || isDragging) return;
            mesh.position.y = Math.sin(elapsed * 0.42 + i * 0.9) * 0.028
                + (hoveredIndex === i ? 0.06 : 0);
        });
    }

    const active = carouselItems[currentIndex];
    if (active) {
        accentLight.position.x += (active.position.x * 0.55 - accentLight.position.x) * 0.08;
    }

    renderer.render(scene, camera);
}

if (renderer) {
    const wrapper = document.getElementById('canvas-wrapper');
    if (wrapper && 'IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => { shelfVisible = entry.isIntersecting; }, { threshold: 0 })
            .observe(wrapper);
    }
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
        } else if (!rafId) {
            animate();
        }
    });
}

let resizeTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeRenderer, 120);
});

// ==========================================
// 14. Entrance
// ==========================================
function runEntrance() {
    if (!renderer) {
        gsap.set(contentContainer, { opacity: 1, y: 0 });
        updateCardPositions(false);
        return;
    }
    if (prefersReducedMotion) {
        updateCardPositions(false);
        gsap.set(contentContainer, { opacity: 1, y: 0 });
        return;
    }

    carouselItems.forEach((mesh, originalIdx) => {
        const filteredIdx = filteredIndices.indexOf(originalIdx);
        if (filteredIdx === -1) { mesh.visible = false; return; }

        const tr = getCardTransform(getWrappedOffset(filteredIdx, currentOffset));
        mesh.userData.baseScale = tr.scale;
        mesh.position.set(tr.x, -0.5, tr.z - 6);
        mesh.scale.set(tr.scale * 0.82, tr.scale * 0.82, 1);
        mesh.rotation.y = tr.rotY;

        const delay = filteredIdx * 0.055;
        gsap.to(mesh.position, { y: 0, z: tr.z, duration: 1, delay, ease: 'power3.out' });
        gsap.to(mesh.scale, { x: tr.scale, y: tr.scale, duration: 1, delay, ease: 'power3.out' });
    });

    updateCardPositions(false);
    gsap.fromTo(contentContainer,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.35, ease: 'power3.out' }
    );
}

contentContainer.style.opacity = '0';

// ==========================================
// 15. Scroll reveals
// ==========================================
function initScrollAnimations() {
    // Under reduced motion the CSS already reveals these; adding inline
    // opacity:0 here would only re-hide them behind a scroll trigger.
    if (prefersReducedMotion) {
        gsap.set('.gs-reveal', { opacity: 1, visibility: 'visible', y: 0 });
        return;
    }
    ScrollTrigger.getAll().forEach(st => st.kill());
    gsap.utils.toArray('.gs-reveal').forEach((elem, i) => {
        gsap.fromTo(elem,
            { y: 34, opacity: 0, autoAlpha: 0 },
            {
                y: 0, opacity: 1, autoAlpha: 1,
                duration: 0.7,
                delay: (i % 4) * 0.07,
                ease: 'power3.out',
                scrollTrigger: { trigger: elem, start: 'top 90%', toggleActions: 'play none none none' }
            }
        );
    });
}

// ==========================================
// 16. Indicators & filters
// ==========================================
const indicatorsContainer = document.getElementById('carousel-indicators');
let indicatorDots = [];

function buildIndicators() {
    if (!indicatorsContainer) return;
    indicatorsContainer.innerHTML = '';
    indicatorDots = [];
    filteredIndices.forEach((projIdx, fi) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (projIdx === currentIndex ? ' active' : '');
        dot.type = 'button';
        dot.setAttribute('aria-label', `${t('goToProject')} ${fi + 1}: ${projects[projIdx][currentLang].title}`);
        dot.addEventListener('click', () => {
            stopAttract();
            enableAudio();
            playClickSound();
            navigateTo(projIdx);
        });
        indicatorsContainer.appendChild(dot);
        indicatorDots.push(dot);
    });
}

function updateIndicators() {
    indicatorDots.forEach((dot, i) => {
        dot.classList.toggle('active', filteredIndices[i] === currentIndex);
    });
}

function setCategoryFilter(category) {
    activeCategory = category;
    filteredIndices = projects.reduce((acc, p, i) => {
        if (category === 'all' || p.category === category) acc.push(i);
        return acc;
    }, []);
    filteredCount = filteredIndices.length;
    if (!filteredCount) return;

    updateCarouselParams();
    currentIndex = filteredIndices[0];
    currentOffset = 0;

    updateCardPositions(true);
    unflipAllCards();
    buildIndicators();
    updateProjectPanel();

    document.querySelectorAll('.filter-tab').forEach(btn => {
        const isActive = btn.dataset.filter === category;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
        btn.tabIndex = isActive ? 0 : -1;
    });
}

const filterTabs = Array.from(document.querySelectorAll('.filter-tab'));
filterTabs.forEach((btn, i) => {
    btn.addEventListener('click', () => {
        stopAttract();
        enableAudio();
        playClickSound();
        setCategoryFilter(btn.dataset.filter);
    });
    // Proper tablist keyboard model: arrows move between tabs.
    btn.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowRight') next = filterTabs[(i + 1) % filterTabs.length];
        else if (e.key === 'ArrowLeft') next = filterTabs[(i - 1 + filterTabs.length) % filterTabs.length];
        else if (e.key === 'Home') next = filterTabs[0];
        else if (e.key === 'End') next = filterTabs[filterTabs.length - 1];
        if (!next) return;
        e.preventDefault();
        e.stopPropagation();
        next.focus();
        setCategoryFilter(next.dataset.filter);
    });
});

// ---- Global keyboard: only when the shelf owns the keys
function shelfHasFocus() {
    if (document.getElementById('game-screen')?.style.display !== 'none') return false;
    if (!lightbox.hidden) return false;
    const active = document.activeElement;
    if (active && active.closest('.filter-tab, input, textarea, select, [contenteditable="true"]')) return false;
    return true;
}

document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!shelfHasFocus()) return;
    if (e.key === 'ArrowLeft') {
        stopAttract();
        navigateTo(getNextFilteredIndex(-1));
    } else if (e.key === 'ArrowRight') {
        stopAttract();
        navigateTo(getNextFilteredIndex(1));
    }
});

// ==========================================
// 17. Audio (Web Audio API, all procedural)
// ==========================================
const muteToggle = document.getElementById('mute-toggle');
let audioCtx = null;
let isMuted = localStorage.getItem(STORAGE_MUTE) !== 'false';
let audioInitialized = false;

const ICON_SOUND_ON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const ICON_SOUND_OFF = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="m17 9 4 6M21 9l-4 6"/></svg>';

function updateMuteButton() {
    if (!muteToggle) return;
    muteToggle.innerHTML = isMuted ? ICON_SOUND_OFF : ICON_SOUND_ON;
    muteToggle.setAttribute('aria-pressed', String(!isMuted));
    muteToggle.setAttribute('aria-label', isMuted ? t('muteOff') : t('muteOn'));
    muteToggle.title = isMuted ? t('muteOff') : t('muteOn');
}

function initAudio() {
    if (audioInitialized) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();
    audioInitialized = true;
}

function enableAudio() {
    if (!audioInitialized) initAudio();
    if (audioCtx && audioCtx.state === 'suspended' && !isMuted) audioCtx.resume();
}

if (muteToggle) {
    updateMuteButton();
    muteToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        localStorage.setItem(STORAGE_MUTE, String(isMuted));
        updateMuteButton();
        enableAudio();
        if (!isMuted) playClickSound();
    });
}

// Softer than before: sine-led, low gain, short tails. Sound as punctuation.
const projectChords = [
    [261.63, 329.63, 392.00],
    [349.23, 440.00, 523.25],
    [220.00, 261.63, 329.63],
    [293.66, 349.23, 440.00],
    [196.00, 246.94, 293.66],
    [329.63, 392.00, 493.88],
    [440.00, 554.37, 659.25],
    [246.94, 293.66, 369.99]
];

function tone({ type = 'sine', from, to, gain = 0.05, attack = 0.006, duration = 0.2, filter }) {
    if (isMuted || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, now);
    if (to && to !== from) osc.frequency.exponentialRampToValueAtTime(to, now + duration * 0.7);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gain, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0008, now + duration);
    let node = osc;
    if (filter) {
        const biquad = audioCtx.createBiquadFilter();
        biquad.type = 'lowpass';
        biquad.frequency.setValueAtTime(filter.from, now);
        biquad.frequency.exponentialRampToValueAtTime(filter.to, now + duration * 0.8);
        osc.connect(biquad);
        node = biquad;
    }
    node.connect(g);
    g.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
}

function playProjectSound(idx, type = 'navigate') {
    if (isMuted || !audioCtx) return;
    const freqs = projectChords[idx % projectChords.length];
    if (type === 'navigate') {
        freqs.forEach((freq, i) => tone({
            type: i === 0 ? 'sine' : 'triangle',
            from: freq * 0.6, to: freq,
            gain: 0.038 / freqs.length * 2,
            duration: 0.48,
            filter: { from: 260, to: 1800 }
        }));
    } else if (type === 'hover') {
        tone({ from: freqs[2], gain: 0.018, duration: 0.13 });
    } else if (type === 'flip') {
        tone({ from: 720, to: 420, gain: 0.045, duration: 0.14 });
    }
}

function playClickSound() { tone({ from: 1100, to: 640, gain: 0.04, duration: 0.09 }); }
function playEnterSound() {
    tone({ from: 180, to: 540, gain: 0.05, duration: 0.42, filter: { from: 300, to: 2200 } });
    tone({ type: 'triangle', from: 360, to: 720, gain: 0.03, duration: 0.3 });
}

function playNoiseBurst(duration, gainValue) {
    if (isMuted || !audioCtx) return;
    const now = audioCtx.currentTime;
    const size = Math.floor(audioCtx.sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / size);
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(gainValue, now);
    g.gain.exponentialRampToValueAtTime(0.0008, now + duration);
    src.connect(g);
    g.connect(audioCtx.destination);
    src.start(now);
}

function playExplosionSound() { playNoiseBurst(0.2, 0.07); }
function playHitSound() { tone({ type: 'sawtooth', from: 200, to: 60, gain: 0.06, duration: 0.32 }); }

window.KrostAudio = { enableAudio, playExplosionSound, playHitSound };

function hapticPulse() {
    if (isTouchDevice && navigator.vibrate) navigator.vibrate(12);
}

// ==========================================
// 18. Lightbox
// ==========================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
let lightboxOpener = null;

function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxOpener = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    void lightbox.offsetWidth;
    lightbox.classList.add('active');
    lightboxClose?.focus();
}

function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
        lightbox.hidden = true;
        lightboxImg.src = '';
    }, 260);
    if (lightboxOpener && typeof lightboxOpener.focus === 'function') lightboxOpener.focus();
    lightboxOpener = null;
}

if (lightbox) {
    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) closeLightbox();
    });
    // Only two focusables exist in the dialog, so trapping is just: stay put.
    lightbox.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.stopPropagation(); closeLightbox(); }
        if (e.key === 'Tab') { e.preventDefault(); lightboxClose?.focus(); }
    });
}

// ==========================================
// 19. Cursor & controls auto-hide
// ==========================================
const controlsEl = document.querySelector('.controls');
const hintEl = document.getElementById('carousel-hint');
const customCursor = document.getElementById('custom-cursor');
let controlsHideTimer = null;

function showControls() {
    controlsEl?.classList.remove('hidden');
    hintEl?.classList.remove('hidden');
    clearTimeout(controlsHideTimer);
    controlsHideTimer = setTimeout(() => {
        controlsEl?.classList.add('hidden');
        hintEl?.classList.add('hidden');
    }, 2600);
}

['pointermove', 'pointerdown', 'pointerup'].forEach(evt =>
    canvasContainer.addEventListener(evt, showControls)
);
showControls();

if (!isTouchDevice && customCursor && window.matchMedia('(hover: hover)').matches) {
    canvasContainer.addEventListener('pointerenter', () => customCursor.classList.add('active'));
    canvasContainer.addEventListener('pointerleave', () => customCursor.classList.remove('active', 'hover'));
    document.addEventListener('pointermove', (e) => {
        gsap.to(customCursor, { x: e.clientX, y: e.clientY, duration: 0.12, ease: 'power2.out', overwrite: 'auto' });
    });
}

// iOS double-tap zoom guard
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
}, { passive: false });

// ==========================================
// 20. Boot
// ==========================================
function runBootSequence() {
    const bootScreen = document.getElementById('boot-screen');
    const bootStart = document.getElementById('boot-start');
    const bootPlay = document.getElementById('boot-play');
    const bootSkip = document.getElementById('boot-skip');
    const bootProgress = document.getElementById('boot-progress');
    const bootProgressText = document.getElementById('boot-progress-text');
    const bootStatus = document.getElementById('boot-status');

    if (!bootScreen) { runEntrance(); return; }

    let timeProgress = 0;
    let readyShown = false;
    let finished = false;
    const MIN_BOOT_MS = prefersReducedMotion ? 0 : 1600;
    const startTime = Date.now();

    function finishBoot() {
        if (finished) return;
        finished = true;
        clearInterval(timeInterval);
        document.body.classList.remove('booting');
        bootScreen.remove();
        runEntrance();
    }

    function startMinigame() {
        enableAudio();
        playEnterSound();
        document.body.classList.remove('booting');
        bootScreen.remove();
        import('./game.js').then(m => m.startGame());
    }

    function showReady() {
        if (readyShown) return;
        readyShown = true;
        if (bootStatus) bootStatus.textContent = currentLang === 'es' ? 'Listo' : 'Ready';
        [bootStart, bootPlay].forEach(btn => { if (btn) btn.hidden = false; });
        if (prefersReducedMotion) {
            gsap.set([bootStart, bootPlay], { opacity: 1 });
        } else {
            gsap.to([bootStart, bootPlay], { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' });
        }
        bootStart?.focus();
    }

    function updateProgress() {
        const stalled = Date.now() - startTime > 8000;
        const loadProgress = (coversTotal === 0 || stalled) ? 100 : (coversDone / coversTotal) * 100;
        const pct = Math.min(100, Math.round(loadProgress * 0.7 + timeProgress * 0.3));
        if (bootProgress) bootProgress.style.width = pct + '%';
        if (bootProgressText) bootProgressText.textContent = pct + '%';
        if (pct >= 100) showReady();
    }

    document.body.classList.add('booting');

    if (bootStatus) bootStatus.textContent = currentLang === 'es' ? 'Cargando ilustraciones' : 'Loading artwork';
    if (bootStart) bootStart.textContent = currentLang === 'es' ? 'Entrar al portafolio' : 'Enter portfolio';
    if (bootPlay) bootPlay.textContent = currentLang === 'es' ? 'Jugar al minijuego' : 'Play the minigame';

    if (!prefersReducedMotion) {
        gsap.to('.boot-logo', { opacity: 1, duration: 0.5, ease: 'power2.out' });
        gsap.to('.boot-name', { opacity: 1, y: 0, duration: 0.5, delay: 0.14 });
        gsap.to('.boot-role', { opacity: 1, duration: 0.5, delay: 0.24 });
    }

    // One tick drives both halves of the bar, and keeps running until the
    // covers are in — a stalled download can never strand the visitor because
    // updateProgress() force-completes after 8 s.
    const timeInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        timeProgress = MIN_BOOT_MS === 0 ? 100 : Math.min(100, (elapsed / MIN_BOOT_MS) * 100);
        updateProgress();
        if (readyShown) clearInterval(timeInterval);
    }, 60);

    bootSkip?.addEventListener('click', finishBoot);
    bootStart?.addEventListener('click', () => {
        enableAudio();
        playEnterSound();
        if (prefersReducedMotion) { finishBoot(); return; }
        gsap.to(bootScreen, { opacity: 0, duration: 0.4, ease: 'power2.inOut', onComplete: finishBoot });
    });
    bootPlay?.addEventListener('click', startMinigame);

    updateProgress();
}

// ==========================================
// 21. Bridges for game.js
// ==========================================
window.finishBootFromGame = function () {
    document.body.classList.remove('booting');
    document.getElementById('boot-screen')?.remove();
    runEntrance();
};

window.launchMinigame = function () {
    enableAudio();
    stopAttract();
    document.getElementById('boot-screen')?.remove();
    document.body.classList.remove('booting');
    import('./game.js').then(m => m.startGame());
};

document.getElementById('play-game-btn')?.addEventListener('click', () => window.launchMinigame());

// ==========================================
// 22. Init
// ==========================================
renderStaticText();
buildIndicators();
updateProjectPanel();
updateCardPositions(false);
initScrollAnimations();
if (renderer) animate();
runBootSequence();
