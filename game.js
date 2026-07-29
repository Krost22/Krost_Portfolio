import * as THREE from 'three';
import gsap from 'gsap';

// ==========================================================================
// KROST ARCADE — a four-mode arcade session
//
// One run rotates through every mode. Three lives are shared across the whole
// run, so a mode you're bad at costs you something; the run ends on a real
// game over with a score worth beating. Every mode shares the same contract:
//   { control, enter(), update(dt, input), exit() }
// and reports outcomes by calling addScore() / hurt() rather than by return
// value, so scoring, particles and shake stay in one place.
// ==========================================================================

const GAME_WIDTH = 20;
const ROUND_TIME = 18;
const START_LIVES = 3;
const INVULN_TIME = 1.1;

// Palette — the portfolio's, not an arcade neon set.
const C_PLAYER = 0xe2dfda;
const C_ACCENT = 0xc08a5a;
const C_THREAT = 0xc4605a;
const C_MUTED = 0x6b737e;
const C_BG = 0x0b0e12;

let gameHeight = 12;

let scene, camera, renderer, gameCanvas;
let gameScreenEl;
let animFrameId = null;

let score = 0;
let best = 0;
let lives = START_LIVES;
let round = 1;
let gameState = 'playing'; // playing | paused | transition | over
let lastTime = 0;
let roundTime = 0;
let invuln = 0;
let currentModeIdx = 0;
let currentMode = null;
let modeGroup = null;
let bgGroup = null;
let isTransitioning = false;
let lang = 'en';

// DOM
let hudScoreEl, hudBestEl, hudLivesEl, roundEl;
let pauseOverlayEl, overOverlayEl;
let modeLabelEl, modeBarEl, modeHintEl;
let nextUpEl, nextUpNameEl, nextUpHintEl;
let transitionEl;

// Input
const keyState = {};
let pointer = { x: 0, y: 0 };
let pointerActive = false;
let tapQueue = [];
let touchStart = null;

// ==========================================================================
// Copy
// ==========================================================================
const L = {
    en: {
        modes: {
            shooter: { name: 'Shooter', hintKeys: 'Move with WASD — you fire automatically', hintTouch: 'Drag to fly — you fire automatically' },
            crossy: { name: 'Crossing', hintKeys: 'WASD to hop — reach the far side', hintTouch: 'Swipe to hop — reach the far side' },
            snake: { name: 'Snake', hintKeys: 'WASD to turn — collect the nodes', hintTouch: 'Swipe to turn — collect the nodes' },
            dodge: { name: 'Dodge', hintKeys: 'WASD to move — survive the fall', hintTouch: 'Drag to move — survive the fall' }
        },
        nextUp: 'Next up',
        roundLabel: (n) => `Round ${n}`,
        paused: 'Paused',
        resume: 'Resume',
        exit: 'Exit',
        gameOver: 'Game over',
        newBest: 'New best score.',
        scoreLabel: 'Score',
        bestLabel: 'Best',
        retry: 'Play again',
        backToPortfolio: 'Back to portfolio',
        note: (n) => `You made it to round ${n}.`
    },
    es: {
        modes: {
            shooter: { name: 'Nave', hintKeys: 'Muévete con WASD — disparas solo', hintTouch: 'Arrastra para volar — disparas solo' },
            crossy: { name: 'Cruce', hintKeys: 'WASD para saltar — llega al otro lado', hintTouch: 'Desliza para saltar — llega al otro lado' },
            snake: { name: 'Serpiente', hintKeys: 'WASD para girar — recoge los nodos', hintTouch: 'Desliza para girar — recoge los nodos' },
            dodge: { name: 'Esquiva', hintKeys: 'WASD para moverte — sobrevive', hintTouch: 'Arrastra para moverte — sobrevive' }
        },
        nextUp: 'Siguiente',
        roundLabel: (n) => `Ronda ${n}`,
        paused: 'En pausa',
        resume: 'Continuar',
        exit: 'Salir',
        gameOver: 'Fin de la partida',
        newBest: 'Nuevo récord.',
        scoreLabel: 'Puntos',
        bestLabel: 'Récord',
        retry: 'Jugar otra vez',
        backToPortfolio: 'Volver al portafolio',
        note: (n) => `Llegaste a la ronda ${n}.`
    }
};

function tx() { return L[lang] || L.en; }

const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;

// ==========================================================================
// Audio
// ==========================================================================
function audio() { return window.KrostAudio || null; }
function sfxHit() { const a = audio(); if (a && a.playHitSound) a.playHitSound(); }
function sfxPop() { const a = audio(); if (a && a.playExplosionSound) a.playExplosionSound(); }

// ==========================================================================
// Shared feel: particles, shake, score
// ==========================================================================
const PARTICLE_COUNT = 120;
let particles = [];
let particleGroup = null;
let shakeAmount = 0;

function initParticles() {
    particleGroup = new THREE.Group();
    scene.add(particleGroup);
    const geo = new THREE.PlaneGeometry(0.16, 0.16);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true }));
        mesh.visible = false;
        particleGroup.add(mesh);
        particles.push({ mesh, life: 0, maxLife: 1, vx: 0, vy: 0, spin: 0 });
    }
}

function burst(x, y, color, count = 10, power = 5) {
    let spawned = 0;
    for (const p of particles) {
        if (spawned >= count) break;
        if (p.life > 0) continue;
        const angle = Math.random() * Math.PI * 2;
        const speed = power * (0.35 + Math.random() * 0.9);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.spin = (Math.random() - 0.5) * 12;
        p.maxLife = 0.35 + Math.random() * 0.4;
        p.life = p.maxLife;
        p.mesh.position.set(x, y, 0.5);
        p.mesh.rotation.z = Math.random() * Math.PI;
        p.mesh.scale.setScalar(0.7 + Math.random() * 0.9);
        p.mesh.material.color.setHex(color);
        p.mesh.material.opacity = 1;
        p.mesh.visible = true;
        spawned++;
    }
}

function updateParticles(dt) {
    for (const p of particles) {
        if (p.life <= 0) continue;
        p.life -= dt;
        if (p.life <= 0) { p.mesh.visible = false; continue; }
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;
        p.vy -= 9 * dt;
        p.vx *= 0.96;
        p.mesh.rotation.z += p.spin * dt;
        p.mesh.material.opacity = Math.max(0, p.life / p.maxLife);
    }
}

function clearParticles() {
    particles.forEach(p => { p.life = 0; p.mesh.visible = false; });
}

function shake(amount) {
    shakeAmount = Math.min(0.9, shakeAmount + amount);
}

function addScore(points, x, y, color = C_ACCENT) {
    score += points;
    if (x !== undefined) burst(x, y, color, 8, 4);
    sfxPop();
    if (hudScoreEl) {
        gsap.killTweensOf(hudScoreEl);
        gsap.fromTo(hudScoreEl, { scale: 1.18 }, { scale: 1, duration: 0.22, ease: 'power2.out' });
    }
}

// Returns true when the hit actually landed, so modes can skip their own
// reset while the player is still in post-hit invulnerability.
function hurt(x, y) {
    if (invuln > 0 || gameState !== 'playing') return false;
    // Losing a life is the whole cost of a mistake. Docking points as well
    // punished twice and made the final score say less about how far you got.
    lives--;
    invuln = INVULN_TIME;
    sfxHit();
    shake(0.55);
    if (x !== undefined) burst(x, y, C_THREAT, 16, 7);
    renderLives();
    if (hudScoreEl) {
        hudScoreEl.style.color = '#c4605a';
        gsap.fromTo(hudScoreEl, { scale: 1.3 }, {
            scale: 1, duration: 0.35, ease: 'power2.out',
            onComplete: () => { if (hudScoreEl) hudScoreEl.style.color = ''; }
        });
    }
    if (lives <= 0) endRun();
    return true;
}

// ==========================================================================
// Background: horizon grid + the CV scrolling past, very quietly
// ==========================================================================
const BG_TEXTS = [
    'Eduardo Mogollón Salcedo',
    'Game Developer · LSV-TECH S.A.S · 2021 — 2026',
    'Mobile Game Developer · Freelance · 2019 — 2021',
    'VR Hotel Experience — Cartagena',
    'AR Hotel Experience — Cartagena',
    'VR Multiplayer — Guajira Corp',
    'Native TTS Editor Tool',
    'ClipLoop — Audio loop & cut tool',
    '360 Virtual Tours — Terraviva',
    'Mobile Game Prototypes',
    'Games on Itch.io'
];

function createBackground() {
    bgGroup = new THREE.Group();
    scene.add(bgGroup);

    // Static grid, far back — gives the play field a floor without decorating it.
    const verts = [];
    const step = 2;
    for (let x = -GAME_WIDTH / 2; x <= GAME_WIDTH / 2; x += step) {
        verts.push(x, -gameHeight / 2, -6, x, gameHeight / 2, -6);
    }
    for (let y = -gameHeight / 2; y <= gameHeight / 2; y += step) {
        verts.push(-GAME_WIDTH / 2, y, -6, GAME_WIDTH / 2, y, -6);
    }
    const gGeo = new THREE.BufferGeometry();
    gGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
    bgGroup.add(new THREE.LineSegments(gGeo, new THREE.LineBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.045
    })));

    BG_TEXTS.forEach((text, i) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 96;
        const ctx = canvas.getContext('2d');
        ctx.font = '500 40px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(226, 223, 218, 0.055)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(17, 1.6),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false })
        );
        mesh.position.set((Math.random() - 0.5) * 6, gameHeight / 2 + 2 + i * 2.6, -5);
        mesh.userData.speed = 0.7 + Math.random() * 0.5;
        bgGroup.add(mesh);
    });
}

function updateBackground(dt) {
    if (!bgGroup) return;
    bgGroup.children.forEach(mesh => {
        if (!mesh.userData.speed) return;
        mesh.position.y -= mesh.userData.speed * dt;
        if (mesh.position.y < -gameHeight / 2 - 3) {
            mesh.position.y = gameHeight / 2 + 2 + Math.random() * 5;
            mesh.position.x = (Math.random() - 0.5) * 6;
        }
    });
}

function disposeGroup(group) {
    if (!group) return;
    group.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        }
    });
    scene.remove(group);
}

// ==========================================================================
// Renderer / scene
// ==========================================================================
function initRenderer() {
    gameCanvas = document.getElementById('game-canvas');
    renderer = new THREE.WebGLRenderer({ canvas: gameCanvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(C_BG, 1);
    sizeRenderer();
}

function sizeRenderer() {
    if (!renderer || !gameScreenEl) return;
    const rect = gameScreenEl.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    renderer.setSize(w, h);
    gameHeight = GAME_WIDTH / (w / h);
    if (camera) {
        camera.top = gameHeight / 2;
        camera.bottom = -gameHeight / 2;
        camera.updateProjectionMatrix();
    }
}

function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(
        -GAME_WIDTH / 2, GAME_WIDTH / 2,
        gameHeight / 2, -gameHeight / 2,
        0.1, 100
    );
    camera.position.z = 10;

    // The old build shaded asteroids with MeshStandardMaterial and never added
    // a light, so they rendered pure black. Lit properly now.
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xfff4e8, 1.5);
    key.position.set(3, 6, 8);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9fb4cc, 0.5);
    fill.position.set(-5, -2, 6);
    scene.add(fill);
}

function onResize() {
    sizeRenderer();
}

// ==========================================================================
// Input
// ==========================================================================
function onKeyDown(e) {
    if (e.code === 'Escape') {
        if (gameState === 'over') exitToPortfolio();
        else if (gameState === 'paused') pauseGame();
        else exitToPortfolio();
        return;
    }
    if (e.code === 'KeyP') {
        e.preventDefault();
        if (gameState === 'playing' || gameState === 'paused') pauseGame();
        return;
    }
    if (e.code === 'Enter' && gameState === 'over') {
        e.preventDefault();
        restartGame();
        return;
    }
    if (e.code === 'Space') e.preventDefault();

    keyState[e.code] = true;
    if (e.repeat) return;

    let d = null;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') d = { x: -1, y: 0 };
    else if (e.code === 'KeyD' || e.code === 'ArrowRight') d = { x: 1, y: 0 };
    else if (e.code === 'KeyW' || e.code === 'ArrowUp') d = { x: 0, y: 1 };
    else if (e.code === 'KeyS' || e.code === 'ArrowDown') d = { x: 0, y: -1 };
    if (d) {
        if (e.code.startsWith('Arrow')) e.preventDefault();
        tapQueue.push(d);
    }
}

function onKeyUp(e) { keyState[e.code] = false; }

function setPointerFromClient(clientX, clientY) {
    const rect = gameCanvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
}

// Mouse control was written but never bound in the previous build, so desktop
// players only ever had the keyboard.
function onPointerMove(e) {
    setPointerFromClient(e.clientX, e.clientY);
    pointerActive = true;
}
function onPointerLeave() { pointerActive = false; }

const SWIPE_MIN = 26;

function onTouchStart(e) {
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY, time: performance.now() };
    setPointerFromClient(t.clientX, t.clientY);
    pointerActive = true;
}

function onTouchMove(e) {
    e.preventDefault();
    const t = e.touches[0];
    setPointerFromClient(t.clientX, t.clientY);
    pointerActive = true;

    // Grid modes read swipes; emit one tap per swipe threshold crossed so a
    // long drag can chain hops without lifting the finger.
    if (currentMode && currentMode.control === 'swipe' && touchStart) {
        const dx = t.clientX - touchStart.x;
        const dy = t.clientY - touchStart.y;
        if (Math.abs(dx) > SWIPE_MIN || Math.abs(dy) > SWIPE_MIN) {
            tapQueue.push(Math.abs(dx) > Math.abs(dy)
                ? { x: Math.sign(dx), y: 0 }
                : { x: 0, y: -Math.sign(dy) });
            touchStart = { x: t.clientX, y: t.clientY, time: performance.now() };
        }
    }
}

function onTouchEnd(e) {
    // A quick stab with no travel still counts as a forward hop.
    if (currentMode && currentMode.control === 'swipe' && touchStart) {
        const elapsed = performance.now() - touchStart.time;
        const changed = e.changedTouches && e.changedTouches[0];
        if (changed && elapsed < 250) {
            const dx = changed.clientX - touchStart.x;
            const dy = changed.clientY - touchStart.y;
            if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN) tapQueue.push({ x: 0, y: 1 });
        }
    }
    touchStart = null;
    pointerActive = false;
}

function getInput() {
    const dir = { x: 0, y: 0 };
    if (keyState['ArrowLeft'] || keyState['KeyA']) dir.x -= 1;
    if (keyState['ArrowRight'] || keyState['KeyD']) dir.x += 1;
    if (keyState['ArrowUp'] || keyState['KeyW']) dir.y += 1;
    if (keyState['ArrowDown'] || keyState['KeyS']) dir.y -= 1;
    return { dir, taps: tapQueue, pointer, pointerActive };
}

function addModeMesh(mesh) { if (modeGroup) modeGroup.add(mesh); }

// Difficulty comes from the round, not the score, so a good run doesn't punish
// itself into unplayability while a bad one stays boring.
function difficulty() { return 1 + (round - 1) * 0.16; }

// ==========================================================================
// Mode: Shooter
// ==========================================================================
function ShooterMode() {
    const FIRE_INTERVAL = 0.17;
    const BULLET_SPEED = 26;
    const MAX_BULLETS = 48;
    const MAX_ROCKS = 22;

    let ship, thruster;
    const bullets = [];
    const rocks = [];
    let fireTimer = 0;
    let spawnTimer = 0;
    let tx = 0, ty = 0;

    function makeShip() {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
            0, 0.75, 0, -0.5, -0.6, 0, 0, -0.28, 0,
            0, 0.75, 0, 0, -0.28, 0, 0.5, -0.6, 0
        ]), 3));
        ship = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: C_PLAYER, side: THREE.DoubleSide }));
        ty = -gameHeight / 2 + 2;
        ship.position.set(0, ty, 0);
        addModeMesh(ship);

        thruster = new THREE.Mesh(
            new THREE.PlaneGeometry(0.22, 0.6),
            new THREE.MeshBasicMaterial({ color: C_ACCENT, transparent: true, opacity: 0.75 })
        );
        thruster.position.set(0, -0.75, -0.1);
        ship.add(thruster);
    }

    function fire() {
        const b = bullets.find(b => !b.active);
        if (!b) return;
        b.active = true;
        b.mesh.visible = true;
        b.mesh.position.set(ship.position.x, ship.position.y + 0.7, 0);
    }

    function spawnRock() {
        const r = rocks.find(r => !r.active);
        if (!r) return;
        const size = 0.55 + Math.random() * 0.85;
        r.mesh.scale.setScalar(size);
        r.radius = size;
        r.hp = size > 1.05 ? 3 : size > 0.8 ? 2 : 1;
        r.active = true;
        r.mesh.visible = true;
        r.mesh.position.set((Math.random() - 0.5) * (GAME_WIDTH - 2), gameHeight / 2 + 1.5, 0);
        r.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        r.spin = (Math.random() - 0.5) * 2.5;
        r.speed = 3.4 * (0.8 + Math.random() * 0.5) * difficulty();
        r.drift = (Math.random() - 0.5) * 1.4;
    }

    return {
        control: 'follow',
        enter() {
            makeShip();
            const bGeo = new THREE.PlaneGeometry(0.11, 0.62);
            const bMat = new THREE.MeshBasicMaterial({ color: C_ACCENT });
            for (let i = 0; i < MAX_BULLETS; i++) {
                const mesh = new THREE.Mesh(bGeo, bMat);
                mesh.visible = false;
                addModeMesh(mesh);
                bullets.push({ mesh, active: false });
            }
            const rGeo = new THREE.IcosahedronGeometry(1, 0);
            for (let i = 0; i < MAX_ROCKS; i++) {
                const mesh = new THREE.Mesh(rGeo, new THREE.MeshStandardMaterial({
                    color: 0x7b8087, flatShading: true, roughness: 0.85, metalness: 0.05
                }));
                mesh.visible = false;
                addModeMesh(mesh);
                rocks.push({ mesh, active: false, radius: 1, spin: 0, hp: 1, speed: 0, drift: 0 });
            }
        },
        update(dt, input) {
            const halfW = GAME_WIDTH / 2 - 0.7;
            const halfH = gameHeight / 2 - 1;

            if (input.pointerActive) {
                tx = input.pointer.x * halfW;
                ty = input.pointer.y * halfH;
            } else {
                tx += input.dir.x * 16 * dt;
                ty += input.dir.y * 16 * dt;
            }
            tx = Math.max(-halfW, Math.min(halfW, tx));
            ty = Math.max(-halfH, Math.min(halfH, ty));

            const prevX = ship.position.x;
            ship.position.x += (tx - ship.position.x) * 12 * dt;
            ship.position.y += (ty - ship.position.y) * 12 * dt;
            ship.rotation.z = THREE.MathUtils.clamp((prevX - ship.position.x) * 1.6, -0.45, 0.45);
            thruster.scale.y = 0.75 + Math.sin(performance.now() * 0.03) * 0.25;

            fireTimer += dt;
            if (fireTimer >= FIRE_INTERVAL) { fireTimer = 0; fire(); }

            spawnTimer += dt;
            const spawnEvery = Math.max(0.32, 1.0 - (difficulty() - 1) * 0.5);
            if (spawnTimer >= spawnEvery) { spawnTimer = 0; spawnRock(); }

            for (const b of bullets) {
                if (!b.active) continue;
                b.mesh.position.y += BULLET_SPEED * dt;
                if (b.mesh.position.y > gameHeight / 2 + 1) { b.active = false; b.mesh.visible = false; }
            }

            for (const r of rocks) {
                if (!r.active) continue;
                r.mesh.position.y -= r.speed * dt;
                r.mesh.position.x += r.drift * dt;
                r.mesh.rotation.x += r.spin * dt;
                r.mesh.rotation.y += r.spin * 0.7 * dt;
                if (r.mesh.position.y < -gameHeight / 2 - 2) { r.active = false; r.mesh.visible = false; }
            }

            for (const b of bullets) {
                if (!b.active) continue;
                for (const r of rocks) {
                    if (!r.active) continue;
                    const dx = b.mesh.position.x - r.mesh.position.x;
                    const dy = b.mesh.position.y - r.mesh.position.y;
                    if (dx * dx + dy * dy > (r.radius + 0.22) * (r.radius + 0.22)) continue;

                    b.active = false;
                    b.mesh.visible = false;
                    r.hp--;
                    if (r.hp <= 0) {
                        r.active = false;
                        r.mesh.visible = false;
                        addScore(Math.round(12 * difficulty()), r.mesh.position.x, r.mesh.position.y, C_ACCENT);
                        shake(0.1);
                    } else {
                        burst(b.mesh.position.x, b.mesh.position.y, C_MUTED, 3, 2.5);
                        gsap.fromTo(r.mesh.scale,
                            { x: r.radius * 1.18, y: r.radius * 1.18, z: r.radius * 1.18 },
                            { x: r.radius, y: r.radius, z: r.radius, duration: 0.16, ease: 'power2.out', overwrite: true });
                    }
                    break;
                }
            }

            for (const r of rocks) {
                if (!r.active) continue;
                const dx = ship.position.x - r.mesh.position.x;
                const dy = ship.position.y - r.mesh.position.y;
                if (dx * dx + dy * dy < (r.radius + 0.42) * (r.radius + 0.42)) {
                    r.active = false;
                    r.mesh.visible = false;
                    hurt(ship.position.x, ship.position.y);
                }
            }

            ship.visible = invuln <= 0 || Math.floor(invuln * 12) % 2 === 0;
        },
        exit() { bullets.length = 0; rocks.length = 0; }
    };
}

// ==========================================================================
// Mode: Crossing
// ==========================================================================
function CrossyMode() {
    const COLS = 11;
    const ROWS = 9;
    const CELL = 1.15;
    const MAX_CARS = 60;

    let player;
    let lanes = [];
    const carPool = [];
    let pc = Math.floor(COLS / 2);
    let pr = 0;
    let maxRow = 0;
    let guard = 0;

    const wx = (c) => (c - COLS / 2 + 0.5) * CELL;
    const wy = (r) => (r - ROWS / 2 + 0.5) * CELL;

    function makePlayer() {
        player = new THREE.Group();
        player.add(new THREE.Mesh(
            new THREE.BoxGeometry(CELL * 0.6, CELL * 0.6, CELL * 0.6),
            new THREE.MeshStandardMaterial({ color: C_PLAYER, roughness: 0.6, flatShading: true })
        ));
        player.position.set(wx(pc), wy(pr), 0.7);
        addModeMesh(player);
    }

    function buildBoard() {
        // Opaque plate first: without it the scrolling CV text reads straight
        // through the grid and competes with the cars.
        const plate = new THREE.Mesh(
            new THREE.PlaneGeometry(COLS * CELL, ROWS * CELL),
            new THREE.MeshBasicMaterial({ color: 0x11151a })
        );
        plate.position.z = -0.3;
        addModeMesh(plate);

        const verts = [];
        for (let c = 0; c <= COLS; c++) {
            const x = wx(c) - CELL / 2;
            verts.push(x, wy(0) - CELL / 2, -0.2, x, wy(ROWS) - CELL / 2, -0.2);
        }
        for (let r = 0; r <= ROWS; r++) {
            const y = wy(r) - CELL / 2;
            verts.push(wx(0) - CELL / 2, y, -0.2, wx(COLS) - CELL / 2, y, -0.2);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
        addModeMesh(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.09
        })));

        [0, ROWS - 1].forEach((r, i) => {
            const strip = new THREE.Mesh(
                new THREE.PlaneGeometry(COLS * CELL, CELL),
                new THREE.MeshBasicMaterial({ color: i === 1 ? C_ACCENT : C_PLAYER, transparent: true, opacity: i === 1 ? 0.14 : 0.06 })
            );
            strip.position.set(0, wy(r), -0.15);
            addModeMesh(strip);
        });
    }

    function buildLanes() {
        lanes = [];
        for (let r = 1; r < ROWS - 1; r++) {
            const dir = r % 2 === 0 ? 1 : -1;
            lanes.push({
                row: r,
                dir,
                speed: (2.4 + Math.random() * 2.2) * difficulty(),
                spacing: 1.5 + Math.random() * 1.6,
                timer: Math.random() * 2,
                cars: []
            });
        }
    }

    // Cars are pooled; the previous build allocated a fresh mesh per spawn and
    // left every one of them in the group for the whole round.
    function takeCar() {
        const free = carPool.find(c => !c.active);
        if (!free) return null;
        free.active = true;
        free.mesh.visible = true;
        return free;
    }

    function spawnCar(lane) {
        const car = takeCar();
        if (!car) return;
        car.mesh.material.color.setHex(Math.random() < 0.35 ? C_THREAT : C_MUTED);
        car.mesh.position.set(
            lane.dir > 0 ? wx(0) - CELL * 2.5 : wx(COLS - 1) + CELL * 2.5,
            wy(lane.row),
            0.2
        );
        car.lane = lane;
        lane.cars.push(car);
    }

    function respawn() {
        pc = Math.floor(COLS / 2);
        pr = 0;
        maxRow = 0;
        player.position.set(wx(pc), wy(pr), 0.7);
        guard = 0.45;
    }

    return {
        control: 'swipe',
        enter() {
            pc = Math.floor(COLS / 2); pr = 0; maxRow = 0; guard = 0.5;
            buildBoard();
            makePlayer();
            buildLanes();
            const geo = new THREE.BoxGeometry(CELL * 1.6, CELL * 0.5, CELL * 0.5);
            for (let i = 0; i < MAX_CARS; i++) {
                const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: C_MUTED, roughness: 0.7, flatShading: true }));
                mesh.visible = false;
                addModeMesh(mesh);
                carPool.push({ mesh, active: false, lane: null });
            }
        },
        update(dt, input) {
            if (guard > 0) guard -= dt;

            if (input.taps.length) {
                const t = input.taps[0];
                const nc = Math.max(0, Math.min(COLS - 1, pc + t.x));
                const nr = Math.max(0, Math.min(ROWS - 1, pr + t.y));
                if (nc !== pc || nr !== pr) {
                    pc = nc; pr = nr;
                    gsap.killTweensOf(player.position);
                    gsap.to(player.position, { x: wx(pc), y: wy(pr), duration: 0.11, ease: 'power2.out' });
                    gsap.fromTo(player.scale, { x: 0.75, y: 1.3, z: 1 }, { x: 1, y: 1, z: 1, duration: 0.2, ease: 'back.out(2)', overwrite: true });
                    if (pr > maxRow) { score += (pr - maxRow) * 5; maxRow = pr; }
                    if (pr === ROWS - 1) {
                        addScore(Math.round(40 * difficulty()), wx(pc), wy(pr), C_ACCENT);
                        shake(0.16);
                        respawn();
                    }
                }
            }

            lanes.forEach(lane => {
                lane.timer -= dt;
                if (lane.timer <= 0) { lane.timer = lane.spacing; spawnCar(lane); }
                for (let i = lane.cars.length - 1; i >= 0; i--) {
                    const c = lane.cars[i];
                    c.mesh.position.x += lane.dir * lane.speed * dt;
                    if (Math.abs(c.mesh.position.x) > COLS / 2 * CELL + 3) {
                        c.active = false;
                        c.mesh.visible = false;
                        lane.cars.splice(i, 1);
                        continue;
                    }
                    if (guard > 0 || invuln > 0 || lane.row !== pr) continue;
                    if (Math.abs(wx(pc) - c.mesh.position.x) < CELL * 0.82) {
                        c.active = false;
                        c.mesh.visible = false;
                        lane.cars.splice(i, 1);
                        hurt(player.position.x, player.position.y);
                        respawn();
                    }
                }
            });

            player.visible = invuln <= 0 || Math.floor(invuln * 12) % 2 === 0;
        },
        exit() { lanes = []; carPool.length = 0; }
    };
}

// ==========================================================================
// Mode: Snake
// ==========================================================================
function SnakeMode() {
    const COLS = 15;
    const ROWS = 11;
    const CELL = 1.0;
    const BASE_INTERVAL = 0.2;

    let snake = [];
    let food = null;
    let foodC = 0, foodR = 0;
    let dir = { x: 0, y: 1 };
    let nextDir = { x: 0, y: 1 };
    let moveTimer = 0;
    let grow = 0;
    let segGeo, headMat, bodyMat;

    const wx = (c) => (c - COLS / 2 + 0.5) * CELL;
    const wy = (r) => (r - ROWS / 2 + 0.5) * CELL;

    // Speeds up as it grows, which is what makes Snake a game and not a chore.
    function interval() {
        return Math.max(0.085, BASE_INTERVAL - (snake.length - 3) * 0.004 - (difficulty() - 1) * 0.02);
    }

    function addSegment(c, r, atHead) {
        const seg = new THREE.Mesh(segGeo, atHead ? headMat : bodyMat);
        seg.position.set(wx(c), wy(r), 0);
        addModeMesh(seg);
        const entry = { mesh: seg, c, r };
        if (atHead) snake.unshift(entry); else snake.push(entry);
        return entry;
    }

    function resetSnake() {
        snake.forEach(s => {
            modeGroup.remove(s.mesh);
        });
        snake = [];
        const sc = Math.floor(COLS / 2);
        for (let i = 0; i < 3; i++) addSegment(sc, 3 - i, false);
        snake.forEach((s, i) => { s.mesh.material = i === 0 ? headMat : bodyMat; });
        dir = { x: 0, y: 1 };
        nextDir = { x: 0, y: 1 };
        moveTimer = 0;
        grow = 0;
    }

    function placeFood() {
        let attempts = 0;
        do {
            foodC = Math.floor(Math.random() * COLS);
            foodR = Math.floor(Math.random() * ROWS);
            attempts++;
        } while (attempts < 120 && snake.some(s => s.c === foodC && s.r === foodR));
        food.position.set(wx(foodC), wy(foodR), 0);
        gsap.fromTo(food.scale, { x: 0.2, y: 0.2, z: 0.2 }, { x: 1, y: 1, z: 1, duration: 0.28, ease: 'back.out(2.5)', overwrite: true });
    }

    return {
        control: 'swipe',
        enter() {
            // Opaque plate first — see the note in CrossyMode.buildBoard().
            const plate = new THREE.Mesh(
                new THREE.PlaneGeometry(COLS * CELL, ROWS * CELL),
                new THREE.MeshBasicMaterial({ color: 0x11151a })
            );
            plate.position.z = -0.3;
            addModeMesh(plate);

            const verts = [];
            for (let c = 0; c <= COLS; c++) {
                const x = wx(c) - CELL / 2;
                verts.push(x, wy(0) - CELL / 2, -0.1, x, wy(ROWS) - CELL / 2, -0.1);
            }
            for (let r = 0; r <= ROWS; r++) {
                const y = wy(r) - CELL / 2;
                verts.push(wx(0) - CELL / 2, y, -0.1, wx(COLS) - CELL / 2, y, -0.1);
            }
            const gGeo = new THREE.BufferGeometry();
            gGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
            addModeMesh(new THREE.LineSegments(gGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07 })));

            segGeo = new THREE.BoxGeometry(CELL * 0.82, CELL * 0.82, CELL * 0.82);
            headMat = new THREE.MeshStandardMaterial({ color: C_PLAYER, roughness: 0.5, flatShading: true });
            bodyMat = new THREE.MeshStandardMaterial({ color: 0x9aa1a9, roughness: 0.7, flatShading: true });

            food = new THREE.Mesh(
                new THREE.OctahedronGeometry(CELL * 0.36, 0),
                new THREE.MeshStandardMaterial({ color: C_ACCENT, roughness: 0.4, flatShading: true })
            );
            addModeMesh(food);

            resetSnake();
            placeFood();
        },
        update(dt, input) {
            for (const t of input.taps) {
                if (t.x !== 0 && dir.x === 0) { nextDir = { x: t.x, y: 0 }; break; }
                if (t.y !== 0 && dir.y === 0) { nextDir = { x: 0, y: t.y }; break; }
            }

            food.rotation.y += dt * 2;
            food.rotation.x += dt * 1.2;

            moveTimer -= dt;
            if (moveTimer > 0) return;
            moveTimer = interval();
            dir = nextDir;

            const head = snake[0];
            const nc = head.c + dir.x;
            const nr = head.r + dir.y;
            const hitWall = nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS;
            const hitSelf = snake.some((s, i) => i > 0 && s.c === nc && s.r === nr);

            if (hitWall || hitSelf) {
                const hx = wx(Math.max(0, Math.min(COLS - 1, nc)));
                const hy = wy(Math.max(0, Math.min(ROWS - 1, nr)));
                // Always reset — hurt() decides whether it costs a life. Bailing
                // out on an invulnerable hit left the snake frozen mid-board.
                hurt(hx, hy);
                resetSnake();
                placeFood();
                return;
            }

            head.mesh.material = bodyMat;
            addSegment(nc, nr, true);

            if (nc === foodC && nr === foodR) {
                grow += 1;
                addScore(Math.round(18 * difficulty()), wx(nc), wy(nr), C_ACCENT);
                placeFood();
            }

            if (grow > 0) grow--;
            else {
                const tail = snake.pop();
                if (tail) modeGroup.remove(tail.mesh);
            }
        },
        exit() {
            snake = [];
            food = null;
            if (segGeo) segGeo.dispose();
            [headMat, bodyMat].forEach(m => m && m.dispose());
        }
    };
}

// ==========================================================================
// Mode: Dodge
// ==========================================================================
function DodgeMode() {
    const SIZE = 0.52;
    const SPEED = 12;
    const MAX_BLOCKS = 40;

    let player;
    const pool = [];
    let spawnTimer = 0;
    let surviveTimer = 0;

    return {
        control: 'follow',
        enter() {
            player = new THREE.Mesh(
                new THREE.BoxGeometry(SIZE, SIZE, SIZE),
                new THREE.MeshStandardMaterial({ color: C_PLAYER, roughness: 0.5, flatShading: true })
            );
            player.position.set(0, -gameHeight / 2 + 1.8, 0);
            addModeMesh(player);

            const geo = new THREE.BoxGeometry(1, 1, 0.4);
            for (let i = 0; i < MAX_BLOCKS; i++) {
                const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: C_THREAT, roughness: 0.75, flatShading: true }));
                mesh.visible = false;
                addModeMesh(mesh);
                pool.push({ mesh, active: false, speed: 0, w: 1, h: 1, spin: 0 });
            }
            spawnTimer = 0;
            surviveTimer = 0;
        },
        update(dt, input) {
            const halfW = GAME_WIDTH / 2 - SIZE;
            const halfH = gameHeight / 2 - 1;

            if (input.pointerActive) {
                player.position.x += (input.pointer.x * halfW - player.position.x) * 12 * dt;
                player.position.y += (input.pointer.y * halfH - player.position.y) * 12 * dt;
            } else {
                player.position.x += input.dir.x * SPEED * dt;
                player.position.y += input.dir.y * SPEED * dt;
            }
            player.position.x = Math.max(-halfW, Math.min(halfW, player.position.x));
            player.position.y = Math.max(-halfH, Math.min(halfH, player.position.y));
            player.rotation.z += dt * 0.8;

            spawnTimer -= dt;
            if (spawnTimer <= 0) {
                spawnTimer = Math.max(0.16, 0.55 - (difficulty() - 1) * 0.22);
                const b = pool.find(b => !b.active);
                if (b) {
                    b.w = 0.6 + Math.random() * 1.6;
                    b.h = 0.5 + Math.random() * 0.9;
                    b.mesh.scale.set(b.w, b.h, 1);
                    b.mesh.material.color.setHex(Math.random() < 0.3 ? C_MUTED : C_THREAT);
                    b.mesh.position.set((Math.random() - 0.5) * (GAME_WIDTH - b.w - 1), gameHeight / 2 + 1.5, 0);
                    b.mesh.rotation.z = 0;
                    b.spin = (Math.random() - 0.5) * 1.6;
                    b.speed = (3.2 + Math.random() * 3.2) * difficulty();
                    b.active = true;
                    b.mesh.visible = true;
                }
            }

            for (const b of pool) {
                if (!b.active) continue;
                b.mesh.position.y -= b.speed * dt;
                b.mesh.rotation.z += b.spin * dt;
                if (b.mesh.position.y < -gameHeight / 2 - 2) {
                    b.active = false;
                    b.mesh.visible = false;
                    continue;
                }
                if (invuln > 0) continue;
                const dx = Math.abs(player.position.x - b.mesh.position.x);
                const dy = Math.abs(player.position.y - b.mesh.position.y);
                if (dx < (SIZE + b.w) / 2 * 0.86 && dy < (SIZE + b.h) / 2 * 0.86) {
                    b.active = false;
                    b.mesh.visible = false;
                    hurt(player.position.x, player.position.y);
                }
            }

            surviveTimer += dt;
            if (surviveTimer >= 0.8) {
                surviveTimer -= 0.8;
                score += Math.round(4 * difficulty());
            }

            player.visible = invuln <= 0 || Math.floor(invuln * 12) % 2 === 0;
        },
        exit() { pool.length = 0; }
    };
}

// ==========================================================================
// Mode registry — every mode is playable on touch now that swipe exists.
// ==========================================================================
const MODES = [
    { key: 'shooter', build: ShooterMode },
    { key: 'crossy', build: CrossyMode },
    { key: 'snake', build: SnakeMode },
    { key: 'dodge', build: DodgeMode }
];

function modeCopy(key) {
    const m = tx().modes[key];
    return { name: m.name, hint: IS_TOUCH ? m.hintTouch : m.hintKeys };
}

// ==========================================================================
// Mode lifecycle
// ==========================================================================
function clearMode() {
    if (currentMode && currentMode.exit) currentMode.exit();
    if (modeGroup) {
        disposeGroup(modeGroup);
        modeGroup = null;
    }
    currentMode = null;
}

function switchMode(idx) {
    clearMode();
    clearParticles();
    currentModeIdx = idx;
    modeGroup = new THREE.Group();
    scene.add(modeGroup);
    currentMode = MODES[idx].build();
    currentMode.enter();
    roundTime = 0;
    tapQueue.length = 0;

    const copy = modeCopy(MODES[idx].key);
    if (modeLabelEl) modeLabelEl.textContent = copy.name;
    if (roundEl) roundEl.textContent = tx().roundLabel(round);
    showModeHint(copy.hint);
}

function showModeHint(text) {
    if (!modeHintEl) return;
    modeHintEl.textContent = text;
    modeHintEl.style.opacity = '1';
    clearTimeout(showModeHint._timer);
    showModeHint._timer = setTimeout(() => {
        if (modeHintEl) modeHintEl.style.opacity = '0';
    }, 3200);
}

// A "next up" card instead of a full-screen countdown that used to sit on top
// of the play field during the last three seconds of every round.
function startTransition(nextIdx) {
    if (isTransitioning) return;
    isTransitioning = true;
    gameState = 'transition';
    tapQueue.length = 0;

    const copy = modeCopy(MODES[nextIdx].key);
    if (nextUpNameEl) nextUpNameEl.textContent = copy.name;
    if (nextUpHintEl) nextUpHintEl.textContent = copy.hint;

    const finish = () => {
        switchMode(nextIdx);
        updateHUD();
        gsap.to([transitionEl, nextUpEl], {
            opacity: 0, duration: 0.3, ease: 'power2.out',
            onComplete: () => {
                if (transitionEl) transitionEl.style.display = 'none';
                if (nextUpEl) nextUpEl.style.display = 'none';
                tapQueue.length = 0;
                gameState = 'playing';
                isTransitioning = false;
                lastTime = performance.now() / 1000;
            }
        });
    };

    if (!transitionEl || !nextUpEl) { finish(); return; }

    transitionEl.style.display = 'block';
    nextUpEl.style.display = 'flex';
    gsap.fromTo([transitionEl, nextUpEl], { opacity: 0 }, {
        opacity: 1, duration: 0.28, ease: 'power2.in',
        onComplete: () => gsap.delayedCall(0.85, finish)
    });
}

// ==========================================================================
// Run lifecycle
// ==========================================================================
export function startGame() {
    gameScreenEl = document.getElementById('game-screen');
    if (!gameScreenEl) return;

    lang = document.documentElement.lang === 'es' ? 'es' : 'en';
    best = parseInt(localStorage.getItem('krost-high-score') || '0', 10) || 0;

    gameScreenEl.style.display = 'block';
    gameScreenEl.style.opacity = '1';
    document.body.classList.add('game-active');

    hudScoreEl = document.getElementById('game-hud-score');
    hudBestEl = document.getElementById('game-hud-high');
    hudLivesEl = document.getElementById('game-hud-lives');
    roundEl = document.getElementById('game-round');
    pauseOverlayEl = document.getElementById('game-pause');
    overOverlayEl = document.getElementById('game-over');
    modeLabelEl = document.getElementById('game-mode-label');
    modeBarEl = document.getElementById('game-mode-bar');
    modeHintEl = document.getElementById('game-mode-hint');
    nextUpEl = document.getElementById('game-nextup');
    nextUpNameEl = document.getElementById('game-nextup-name');
    nextUpHintEl = document.getElementById('game-nextup-hint');
    transitionEl = document.getElementById('game-transition');

    localiseChrome();
    initRenderer();
    initScene();
    sizeRenderer();
    createBackground();
    initParticles();

    resetRun();
    bindInput();
    lastTime = performance.now() / 1000;
    animFrameId = requestAnimationFrame(gameLoop);
}

function resetRun() {
    score = 0;
    lives = START_LIVES;
    round = 1;
    invuln = 0;
    shakeAmount = 0;
    isTransitioning = false;
    clearParticles();
    hidePause();
    hideGameOver();
    switchMode(0);
    gameState = 'playing';
    renderLives();
    updateHUD();
}

export function restartGame() {
    if (!scene) return;
    resetRun();
    lastTime = performance.now() / 1000;
}

function endRun() {
    gameState = 'over';
    shake(0.7);
    const isBest = score > best;
    if (isBest) {
        best = score;
        localStorage.setItem('krost-high-score', String(best));
    }
    updateHUD();
    showGameOver(isBest);
}

export function stopGame() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = null;

    unbindInput();
    clearMode();
    disposeGroup(bgGroup);
    bgGroup = null;
    disposeGroup(particleGroup);
    particleGroup = null;
    particles = [];

    if (renderer) { renderer.dispose(); renderer = null; }
    scene = null;
    camera = null;

    hidePause();
    hideGameOver();
    if (gameScreenEl) gameScreenEl.style.display = 'none';
    document.body.classList.remove('game-active');
}

function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
        showPause();
    } else if (gameState === 'paused') {
        gameState = 'playing';
        hidePause();
        lastTime = performance.now() / 1000;
    }
}

function exitToPortfolio() {
    if (score > best) {
        best = score;
        localStorage.setItem('krost-high-score', String(best));
    }
    gameState = 'over';
    hidePause();
    hideGameOver();
    const finish = () => {
        stopGame();
        if (window.finishBootFromGame) window.finishBootFromGame();
    };
    if (gameScreenEl) {
        gsap.to(gameScreenEl, { opacity: 0, duration: 0.45, ease: 'power2.inOut', onComplete: finish });
    } else {
        finish();
    }
}

// ==========================================================================
// Loop
// ==========================================================================
function gameLoop() {
    animFrameId = requestAnimationFrame(gameLoop);
    const now = performance.now() / 1000;
    const dt = Math.min(now - lastTime, 0.05);
    lastTime = now;

    if (gameState === 'playing') update(dt);
    if (gameState !== 'paused') {
        updateParticles(dt);
        updateBackground(dt);
    }

    if (camera) {
        if (shakeAmount > 0.001) {
            camera.position.x = (Math.random() - 0.5) * shakeAmount;
            camera.position.y = (Math.random() - 0.5) * shakeAmount;
            shakeAmount *= 0.86;
        } else {
            camera.position.x = 0;
            camera.position.y = 0;
            shakeAmount = 0;
        }
    }

    if (renderer && scene && camera) renderer.render(scene, camera);
}

function update(dt) {
    if (!currentMode) return;

    if (invuln > 0) invuln -= dt;

    roundTime += dt;
    const remaining = ROUND_TIME - roundTime;

    if (modeBarEl) {
        modeBarEl.style.width = Math.max(0, (remaining / ROUND_TIME) * 100) + '%';
        modeBarEl.classList.toggle('is-ending', remaining <= 3);
    }

    if (roundTime >= ROUND_TIME) {
        round++;
        startTransition((currentModeIdx + 1) % MODES.length);
        return;
    }

    currentMode.update(dt, getInput());
    tapQueue.length = 0;
    updateHUD();
}

// ==========================================================================
// HUD & overlays
// ==========================================================================
function updateHUD() {
    if (hudScoreEl) hudScoreEl.textContent = String(score).padStart(5, '0');
    if (hudBestEl) hudBestEl.textContent = `${tx().bestLabel.toUpperCase()} ${String(Math.max(best, score)).padStart(5, '0')}`;
}

function renderLives() {
    if (!hudLivesEl) return;
    hudLivesEl.innerHTML = '';
    for (let i = 0; i < START_LIVES; i++) {
        const dot = document.createElement('span');
        dot.className = 'game-life' + (i < lives ? '' : ' is-lost');
        hudLivesEl.appendChild(dot);
    }
}

function localiseChrome() {
    const s = tx();
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set('game-pause-title', s.paused);
    set('game-resume-btn', s.resume);
    set('game-pause-exit-btn', s.exit);
    set('game-exit-btn', s.exit);
    set('game-nextup-label', s.nextUp);
    set('game-over-title', s.gameOver);
    set('game-over-score-label', s.scoreLabel);
    set('game-over-best-label', s.bestLabel);
    set('game-retry-btn', s.retry);
    set('game-over-exit-btn', s.backToPortfolio);
}

function showPause() {
    if (!pauseOverlayEl) return;
    pauseOverlayEl.style.display = 'flex';
    gsap.fromTo(pauseOverlayEl, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    document.getElementById('game-resume-btn')?.focus();
}
function hidePause() { if (pauseOverlayEl) pauseOverlayEl.style.display = 'none'; }

function showGameOver(isBest) {
    if (!overOverlayEl) return;
    const s = tx();
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set('game-over-score', String(score));
    set('game-over-best', String(best));
    set('game-over-note', isBest ? s.newBest : s.note(round));
    overOverlayEl.style.display = 'flex';
    gsap.fromTo(overOverlayEl, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(overOverlayEl.querySelector('.game-panel'),
        { y: 16, scale: 0.97 }, { y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.6)' });
    document.getElementById('game-retry-btn')?.focus();
}
function hideGameOver() { if (overOverlayEl) overOverlayEl.style.display = 'none'; }

// ==========================================================================
// Input binding
// ==========================================================================
function bindInput() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);
    gameCanvas.addEventListener('pointermove', onPointerMove);
    gameCanvas.addEventListener('pointerleave', onPointerLeave);
    gameCanvas.addEventListener('touchstart', onTouchStart, { passive: false });
    gameCanvas.addEventListener('touchmove', onTouchMove, { passive: false });
    gameCanvas.addEventListener('touchend', onTouchEnd);
    gameCanvas.addEventListener('touchcancel', onTouchEnd);
}

function unbindInput() {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('resize', onResize);
    if (gameCanvas) {
        gameCanvas.removeEventListener('pointermove', onPointerMove);
        gameCanvas.removeEventListener('pointerleave', onPointerLeave);
        gameCanvas.removeEventListener('touchstart', onTouchStart);
        gameCanvas.removeEventListener('touchmove', onTouchMove);
        gameCanvas.removeEventListener('touchend', onTouchEnd);
        gameCanvas.removeEventListener('touchcancel', onTouchEnd);
    }
    // A key held while exiting would otherwise stay "down" for the next run.
    Object.keys(keyState).forEach(k => delete keyState[k]);
    tapQueue.length = 0;
    pointerActive = false;
    touchStart = null;
}

window.KrostGame = { startGame, stopGame, pauseGame, restartGame, exitToPortfolio };
