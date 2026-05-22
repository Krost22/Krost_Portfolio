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
        color: "#9CD5FF",
        tags: ["Unity", "Meta Quest 3", "PICO 4", "VR"],
        images: ["Media/SmartRoom.webp", "Media/SmartRoom1.webp"],
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
        color: "#7AAACE",
        tags: ["Unity", "Android", "ARCore", "AR"],
        images: [],
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
        color: "#5281A5",
        tags: ["Unity", "Multiplayer", "VR", "C#"],
        images: [],
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
        color: "#F7F8F0",
        tags: ["Unity Editor", "Tools", "C#"],
        images: [],
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
        color: "#E5E7DC",
        tags: ["Unity Editor", "Audio", "Tools"],
        images: [],
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
        color: "#AEE0FF",
        tags: ["360 Video", "VR", "Web"],
        images: [],
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
        color: "#355872",
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
    }
];

const aboutTranslations = {
    en: {
        navAbout: "Experience",
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
        navAbout: "Experiencia",
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
    return {
        primary: hex,
        bg: new THREE.Color().setHSL(hsl.h, Math.min(hsl.s * 1.2, 1), 0.06).getStyle(),
        surface: new THREE.Color().setHSL(hsl.h, hsl.s * 0.8, 0.12).getStyle(),
        surface2: new THREE.Color().setHSL(hsl.h, hsl.s * 0.6, 0.2).getStyle(),
        accent: hex,
        secondary: new THREE.Color().setHSL((hsl.h + 0.04) % 1, hsl.s * 0.9, 0.5).getStyle(),
        glow: `rgba(${c.r * 255 | 0}, ${c.g * 255 | 0}, ${c.b * 255 | 0}, 0.25)`
    };
}

projects.forEach(p => p.palette = generatePalette(p.color));

projects[3].palette.bg = '#1a1a1a';
projects[3].palette.surface = '#2a2a2a';
projects[3].palette.surface2 = '#3a3a3a';
projects[3].palette.secondary = '#c0c0c0';
projects[4].palette.bg = '#1a1a1a';
projects[4].palette.surface = '#2a2a2a';
projects[4].palette.surface2 = '#3a3a3a';
projects[4].palette.secondary = '#c0c0c0';

let currentLang = 'en';
let currentIndex = 0;
let currentOffset = 0;
const totalProjects = projects.length;

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

    applyTheme(proj.palette);

    document.title = `${data.title} — Eduardo Mogollón Salcedo`;

    gsap.to(contentContainer, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        onComplete: () => {
            titleEl.textContent = data.title;
            titleEl.style.background = `linear-gradient(135deg, #fff 0%, ${proj.color} 80%)`;
            titleEl.style.webkitBackgroundClip = 'text';
            titleEl.style.webkitTextFillColor = 'transparent';

            descEl.textContent = data.desc;

            tagsEl.innerHTML = '';
            proj.tags.forEach(t => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = t;
                tagsEl.appendChild(span);
            });

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
                mediaEl.appendChild(img);
            });
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'no-media-placeholder';
            placeholder.textContent = currentLang === 'en' ? 'Screenshots & video coming soon' : 'Capturas y video próximamente';
            mediaEl.appendChild(placeholder);
        }
    }

    const aboutData = aboutTranslations[currentLang];
    document.getElementById('nav-about').textContent = aboutData.navAbout;
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
}

langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'es' : 'en';
    langToggle.textContent = currentLang === 'en' ? 'ES' : 'EN';
    updateUI();
});

prevBtn.addEventListener('click', () => navigateTo(currentIndex - 1));
nextBtn.addEventListener('click', () => navigateTo(currentIndex + 1));

// ==========================================
// 4. Three.js Arc Carousel — Infinite Loop
// ==========================================
const canvasContainer = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 100);
camera.position.set(0, 0.3, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
canvasContainer.appendChild(renderer.domElement);

// Lighting — cinematic contrast
const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
keyLight.position.set(3, 5, 6);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xbbccff, 0.4);
fillLight.position.set(-3, 2, 4);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(-4, 0, -3);
scene.add(rimLight);

const pointLight = new THREE.PointLight(0xffffff, 1.5, 15);
pointLight.position.set(0, 0, 2);
scene.add(pointLight);

// Shared rounded-rect alpha map for all cards
function createRoundedAlphaMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(0, 0, 512, 320, 24);
    ctx.fill();
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
}
const roundedAlphaMap = createRoundedAlphaMap();

function createCardMaterial(proj) {
    const textureLoader = new THREE.TextureLoader();

    const baseOpts = {
        roughness: 0.25,
        metalness: 0.1,
        side: THREE.DoubleSide,
        alphaMap: roundedAlphaMap,
        transparent: true,
        alphaTest: 0.5
    };

    if (proj.images && proj.images.length > 0) {
        const texture = textureLoader.load(proj.images[0]);
        return new THREE.MeshStandardMaterial({
            ...baseOpts,
            map: texture
        });
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 320);
    grad.addColorStop(0, '#0f1724');
    grad.addColorStop(1, proj.color);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(0, 0, 512, 320, 24);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const title = proj.en.title;
    const words = title.split(" ");
    if (words.length > 3) {
        ctx.fillText(words.slice(0, 3).join(" "), 256, 140);
        ctx.fillText(words.slice(3).join(" "), 256, 185);
    } else {
        ctx.fillText(title, 256, 160);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({
        ...baseOpts,
        map: texture
    });
}

function createGlowMaterial(proj) {
    return new THREE.MeshBasicMaterial({
        color: proj.color,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        alphaMap: roundedAlphaMap,
        alphaTest: 0.5
    });
}

const cardGeometry = new THREE.PlaneGeometry(4.0, 2.5);
const carouselItems = [];
const glowMeshes = [];

// Arc parameters — cinematic wide arc
const ARC_RADIUS = 5.5;
const ARC_SPAN_DEG = 128;
const DEPTH_MULT = 1.45;
const ANGLE_PER_CARD = THREE.MathUtils.degToRad(ARC_SPAN_DEG / (totalProjects - 1));
const HALF_SPAN = totalProjects / 2; // 3.5

// Dynamic spacing — expands during fast drag for responsive feel
let spacingBoost = 0;
const SPACING_DECAY = 0.92;

// Wraps arbitrary offset into [-HALF_SPAN, HALF_SPAN] for seamless infinite loop
function getWrappedOffset(i, offset) {
    let diff = i - offset;
    diff = ((diff + HALF_SPAN) % totalProjects + totalProjects) % totalProjects - HALF_SPAN;
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
    carouselItems.forEach((mesh, i) => {
        const wrapped = getWrappedOffset(i, currentOffset);
        const t = getCardTransform(wrapped);

        mesh.userData.baseScale = t.scale;
        mesh.renderOrder = 100 - Math.abs(wrapped);

        if (animated) {
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

// Build cards
projects.forEach((proj, i) => {
    const material = createCardMaterial(proj);
    const mesh = new THREE.Mesh(cardGeometry, material);

    // Glow edge card behind
    const glowMat = createGlowMaterial(proj);
    const glow = new THREE.Mesh(cardGeometry.clone(), glowMat);
    glow.position.z = -0.05;
    glow.scale.set(1.06, 1.06, 1);
    mesh.add(glow);
    glowMeshes.push(glow);

    mesh.userData.projectId = i;

    scene.add(mesh);
    carouselItems.push(mesh);
});

// Initial positioning
updateCardPositions(true);

// Particles
const particlesCount = 1500;
const particlesGeometry = new THREE.BufferGeometry();
const posArray = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 40;
}
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
    glowMeshes.forEach((g, i) => {
        gsap.to(g.material.color, { r: color.r, g: color.g, b: color.b, duration: d, overwrite: 'auto' });
    });
}

// GSAP offset animator — single proxy tween replaces per-card GSAP during navigation
const offsetAnimProxy = { value: 0 };

function animateOffsetTo(targetOffset) {
    gsap.killTweensOf(offsetAnimProxy);
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

function navigateTo(targetIdx) {
    const targetIndex = ((targetIdx % totalProjects) + totalProjects) % totalProjects;
    if (targetIndex === currentIndex) return;
    currentIndex = targetIndex;

    const diff = targetIndex - currentOffset;
    const half = totalProjects / 2;
    let shortest = ((diff + half) % totalProjects + totalProjects) % totalProjects - half;
    const targetOffset = currentOffset + shortest;

    animateOffsetTo(targetOffset);
    updateUI();
}

// ==========================================
// Raycasting Hover
// ==========================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredIndex = -1;

canvasContainer.addEventListener('pointermove', (e) => {
    if (isDragging) return;

    const rect = canvasContainer.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
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
        x: base * (active ? 1.05 : 1),
        y: base * (active ? 1.05 : 1),
        duration: 0.3,
        ease: "power2.out",
        overwrite: 'auto'
    });

    gsap.to(mesh.rotation, {
        z: active ? 0.008 : 0,
        duration: 0.3,
        ease: "power2.out"
    });
}

// ==========================================
// Mouse Wheel Navigation
// ==========================================
let wheelBlocked = false;
canvasContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (wheelBlocked) return;
    wheelBlocked = true;
    setTimeout(() => { wheelBlocked = false; }, 700);

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta > 0) navigateTo(currentIndex + 1);
    else navigateTo(currentIndex - 1);
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
const DRAG_SENSITIVITY = 110;

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
        // Click-to-focus via raycasting
        const rect = canvasContainer.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(carouselItems);
        if (intersects.length > 0) {
            const idx = intersects[0].object.userData.projectId;
            if (idx !== undefined && idx !== currentIndex) {
                navigateTo(idx);
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
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    spacingBoost *= SPACING_DECAY;

    carouselItems.forEach((mesh, i) => {
        const floatY = Math.sin(elapsed * 0.5 + i * 0.9) * 0.04;
        mesh.position.y = floatY;
    });

    particlesMesh.rotation.y = elapsed * 0.008;

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
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
const indicatorDots = [];

projects.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to project ${i + 1}`);
    dot.addEventListener('click', () => navigateTo(i));
    indicatorsContainer.appendChild(dot);
    indicatorDots.push(dot);
});

function updateIndicators() {
    indicatorDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
    });
}

// Patch navigateTo to also update indicators
const _origNavigateTo = navigateTo;
navigateTo = function(index) {
    _origNavigateTo(index);
    updateIndicators();
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') navigateTo(currentIndex - 1);
    if (e.key === 'ArrowRight') navigateTo(currentIndex + 1);
});

// ==========================================
// Initialize
// ==========================================
updateIndicators();
updateUI();
animate();
initScrollAnimations();
