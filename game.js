import * as THREE from 'three';
import gsap from 'gsap';

// ==========================================================================
// KROST ARCADE — three games, three bosses, one run
//
// A run is six stages: each game is played against the clock, then its boss
// is played until it's beaten. Three lives are shared across the whole run.
// Beating the last boss — or losing the last life — ends on the finale: the
// world dissolves, the camera cranes overhead and a result card flips up off
// the floor, the same way cards flip on the portfolio shelf.
//
// Every mode shares one contract:
//   { control, duration?, enter(), update(dt, input), exit(), bar?(), stats?() }
// Timed modes set `duration`; bosses leave it out, report progress through
// bar() and call stageClear() when beaten. Outcomes go through addScore() /
// hurt(), so scoring, combo, particles, hit-stop and shake stay in one place.
//
// The play field is a flat XY plane seen through a tilted perspective camera,
// so gameplay stays 2D while everything casts real shadows onto the floor.
// ==========================================================================

const GAME_WIDTH = 20;
const ROUND_TIME = 18;
const START_LIVES = 3;
const INVULN_TIME = 1.1;
const COMBO_WINDOW = 2.4;
const FLOOR_Z = -1.8;
const PLATE_Z = -0.3;
const TILT = 0.52;
const FINALE_TILT = 0.1;

// Palette — the portfolio's, not an arcade neon set.
const C_PLAYER = 0xe2dfda;
const C_ACCENT = 0xc08a5a;
const C_THREAT = 0xc4605a;
const C_MUTED = 0x6b737e;
const C_BG = 0x0b0e12;

let gameHeight = 12;
let spawnTop = 8;
let groundZ = FLOOR_Z;

let scene, camera, renderer, gameCanvas, keyLight;
let gameScreenEl;
let animFrameId = null;
let transitionCall = null;
let gameOpener = null;

// Camera rig: fitCamera() solves `dist`; the finale tweens tilt and zoom.
const cam = { tilt: TILT, zoom: 1, dist: 30 };

let score = 0;
let best = 0;
let lives = START_LIVES;
let round = 1;
let stageIdx = 0;
let stageDone = false;
let bossesDown = 0;
let combo = 0;
let comboTimer = 0;
let bestMult = 1;
let hitStop = 0;
let timeScale = 1;
let elapsed = 0;
let gameState = 'playing'; // playing | paused | transition | finale | over
let lastTime = 0;
let roundTime = 0;
let invuln = 0;
let currentMode = null;
let modeGroup = null;
let bgGroup = null;
let isTransitioning = false;
let lang = 'en';

// DOM
let hudScoreEl, hudBestEl, hudLivesEl, roundEl;
let comboEl, comboMultEl, comboBarEl;
let objectiveEl, objectiveTextEl, objectiveBarEl;
let statsEl, statsBtnEl;
let pauseOverlayEl, overOverlayEl;
let modeLabelEl, modeBarEl, modeHintEl;
let nextUpEl, nextUpLabelEl, nextUpNameEl, nextUpHintEl;
let transitionEl;

// Input
const keyState = {};
let pointer = { x: 0, y: 0 };
const pointerWorld = new THREE.Vector3();
let pointerActive = false;
let fireQueued = false;
let tapQueue = [];
let touchStart = null;
let touchMoved = false;

const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const tmpV = new THREE.Vector3();
const tmpColor = new THREE.Color();
const tmpM4 = new THREE.Matrix4();
const tmpBox = new THREE.Box3();

// ==========================================================================
// Copy
// ==========================================================================
const L = {
    en: {
        modes: {
            shooter: { name: 'Shooter', hintKeys: 'Move with WASD — you fire automatically', hintTouch: 'Drag to fly — you fire automatically' },
            shooterBoss: { name: 'Boss · The Core', hintKeys: 'Click or Space fires a missile — missiles break the shield', hintTouch: 'Tap to fire a missile — missiles break the shield' },
            crossy: { name: 'Crossing', hintKeys: 'WASD to hop — the ground is falling behind you', hintTouch: 'Swipe to hop — the ground is falling behind you' },
            crossyBoss: { name: 'Boss · The Devourer', hintKeys: 'Outrun it to the gate — it lunges when it reddens', hintTouch: 'Outrun it to the gate — it lunges when it reddens' },
            snake: { name: 'Snake', hintKeys: 'WASD to turn — collect the nodes', hintTouch: 'Swipe to turn — collect the nodes' },
            snakeBoss: { name: 'Boss · The Rival', hintKeys: 'Eat 8 nodes — the red snake is hunting you', hintTouch: 'Eat 8 nodes — the red snake is hunting you' }
        },
        nextUp: 'Next up',
        bossIncoming: 'Boss',
        bossDown: 'Boss down',
        stageLabel: (n, total) => `Stage ${n}/${total}`,
        missile: 'Missile',
        nodes: (n, goal) => `Nodes ${n}/${goal}`,
        gate: (n, goal) => `Gate ${n}/${goal}`,
        paused: 'Paused',
        resume: 'Resume',
        exit: 'Exit',
        gameOver: 'Game over',
        runComplete: 'Run complete',
        victorySub: 'All three bosses down',
        defeatSub: (n, total) => `Stopped at stage ${n} of ${total}`,
        newBest: 'New best',
        scoreLabel: 'Score',
        bestLabel: 'Best',
        bossesLabel: 'Bosses',
        comboLabel: 'Best combo',
        retry: 'Play again',
        backToPortfolio: 'Back to portfolio',
        note: (n, m) => `Stage ${n} · best combo x${m}`
    },
    es: {
        modes: {
            shooter: { name: 'Nave', hintKeys: 'Muévete con WASD — disparas solo', hintTouch: 'Arrastra para volar — disparas solo' },
            shooterBoss: { name: 'Jefe · El Núcleo', hintKeys: 'Clic o Espacio lanza un misil — los misiles rompen el escudo', hintTouch: 'Toca para lanzar un misil — los misiles rompen el escudo' },
            crossy: { name: 'Cruce', hintKeys: 'WASD para saltar — el suelo se cae detrás de ti', hintTouch: 'Desliza para saltar — el suelo se cae detrás de ti' },
            crossyBoss: { name: 'Jefe · El Devorador', hintKeys: 'Huye hasta la puerta — embiste cuando se enrojece', hintTouch: 'Huye hasta la puerta — embiste cuando se enrojece' },
            snake: { name: 'Serpiente', hintKeys: 'WASD para girar — recoge los nodos', hintTouch: 'Desliza para girar — recoge los nodos' },
            snakeBoss: { name: 'Jefe · La Rival', hintKeys: 'Come 8 nodos — la serpiente roja te está cazando', hintTouch: 'Come 8 nodos — la serpiente roja te está cazando' }
        },
        nextUp: 'Siguiente',
        bossIncoming: 'Jefe',
        bossDown: 'Jefe vencido',
        stageLabel: (n, total) => `Etapa ${n}/${total}`,
        missile: 'Misil',
        nodes: (n, goal) => `Nodos ${n}/${goal}`,
        gate: (n, goal) => `Puerta ${n}/${goal}`,
        paused: 'En pausa',
        resume: 'Continuar',
        exit: 'Salir',
        gameOver: 'Fin de la partida',
        runComplete: 'Partida completada',
        victorySub: 'Los tres jefes vencidos',
        defeatSub: (n, total) => `Llegaste a la etapa ${n} de ${total}`,
        newBest: 'Nuevo récord',
        scoreLabel: 'Puntos',
        bestLabel: 'Récord',
        bossesLabel: 'Jefes',
        comboLabel: 'Mejor combo',
        retry: 'Jugar otra vez',
        backToPortfolio: 'Volver al portafolio',
        note: (n, m) => `Etapa ${n} · mejor combo x${m}`
    }
};

function tx() { return L[lang] || L.en; }

const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SHADOW_SIZE = IS_TOUCH ? 1024 : 2048;

function storageGet(key, fallback = null) {
    if (window.KrostStorage) return window.KrostStorage.get(key, fallback);
    try { return localStorage.getItem(key) ?? fallback; }
    catch { return fallback; }
}

function storageSet(key, value) {
    if (window.KrostStorage) return window.KrostStorage.set(key, value);
    try { localStorage.setItem(key, value); }
    catch { return false; }
    return true;
}

// In-place filter: keeps entity arrays allocation-free while things die.
function sweep(list, keep) {
    let j = 0;
    for (let i = 0; i < list.length; i++) if (keep(list[i], i)) list[j++] = list[i];
    list.length = j;
}

// ==========================================================================
// Audio
// ==========================================================================
function audio() { return window.KrostAudio || null; }
function sfxHit() { const a = audio(); if (a && a.playHitSound) a.playHitSound(); }
function sfxPop() { const a = audio(); if (a && a.playExplosionSound) a.playExplosionSound(); }
function sfxTone(opts) { const a = audio(); if (a && a.tone) a.tone(opts); }
function chime(notes) {
    notes.forEach((from, i) => setTimeout(() => sfxTone({ type: 'triangle', from, gain: 0.04, duration: 0.55 }), i * 130));
}

// ==========================================================================
// Particles — one InstancedMesh, one draw call, real bounces on the floor
// ==========================================================================
const PARTICLE_COUNT = 400;
const pState = [];
const dummy = new THREE.Object3D();
let particleGroup = null;
let particleMesh = null;
let particleCursor = 0;
let liveParticles = 0;
let shakeAmount = 0;

function initParticles() {
    particleGroup = new THREE.Group();
    scene.add(particleGroup);
    particleMesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.16, 0.16, 0.16),
        new THREE.MeshStandardMaterial({ roughness: 0.55, flatShading: true }),
        PARTICLE_COUNT
    );
    particleMesh.castShadow = true;
    particleMesh.frustumCulled = false;
    tmpColor.setHex(0xffffff);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        pState.push({ life: 0, max: 1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, size: 1, rot: 0, spin: 0, g: 1 });
        particleMesh.setColorAt(i, tmpColor);
        hideParticle(i);
    }
    particleGroup.add(particleMesh);
}

function hideParticle(i) {
    dummy.position.set(0, 0, -50);
    dummy.scale.setScalar(0);
    dummy.updateMatrix();
    particleMesh.setMatrixAt(i, dummy.matrix);
}

// Ring buffer: a new spark overwrites the oldest one, so a big burst never
// silently drops because the pool happened to be busy.
function spark(x, y, z, vx, vy, vz, life, size, color, g = 1) {
    if (!particleMesh) return;
    const i = particleCursor;
    particleCursor = (particleCursor + 1) % PARTICLE_COUNT;
    Object.assign(pState[i], {
        x, y, z, vx, vy, vz, life, max: life, size, g,
        rot: Math.random() * 6, spin: (Math.random() - 0.5) * 14
    });
    tmpColor.setHex(color);
    particleMesh.setColorAt(i, tmpColor);
    particleMesh.instanceColor.needsUpdate = true;
}

function burst(x, y, color, count = 10, power = 5) {
    if (REDUCED_MOTION) return;
    for (let n = 0; n < count; n++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = power * (0.35 + Math.random() * 0.9);
        spark(x, y, 0.3,
            Math.cos(angle) * speed, Math.sin(angle) * speed, power * (0.5 + Math.random() * 0.9),
            0.9 + Math.random() * 0.6, 0.7 + Math.random() * 0.9, color);
    }
}

function updateParticles(dt) {
    if (!particleMesh) return;
    let live = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = pState[i];
        if (p.life <= 0) continue;
        p.life -= dt;
        if (p.life <= 0) { hideParticle(i); continue; }
        live++;
        p.vz -= 24 * dt * p.g;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        const floor = groundZ + 0.08 * p.size;
        if (p.z < floor) {
            p.z = floor;
            p.vz = Math.abs(p.vz) * 0.38;
            p.vx *= 0.62;
            p.vy *= 0.62;
            p.spin *= 0.6;
        }
        p.rot += p.spin * dt;
        dummy.position.set(p.x, p.y, p.z);
        dummy.rotation.set(p.rot, p.rot * 0.7, 0);
        dummy.scale.setScalar(p.size * Math.min(1, p.life / 0.3));
        dummy.updateMatrix();
        particleMesh.setMatrixAt(i, dummy.matrix);
    }
    particleMesh.instanceMatrix.needsUpdate = true;
    liveParticles = live;
}

function clearParticles() {
    if (!particleMesh) return;
    pState.forEach((p, i) => { p.life = 0; hideParticle(i); });
    particleMesh.instanceMatrix.needsUpdate = true;
}

function shake(amount) {
    if (REDUCED_MOTION) return;
    shakeAmount = Math.min(0.9, shakeAmount + amount);
}

// Hit-stop: a few frames of near-freeze on impact. Cheap, and it is most of
// what makes a hit feel like it landed.
function freeze(seconds) { hitStop = Math.max(hitStop, seconds); }

// ==========================================================================
// Immediate-mode instancing
//
// Entities live in plain arrays; every frame each mode re-emits what is
// visible into a batch. One draw call per batch and no free lists to manage.
// ==========================================================================
function makeBatch(geo, mat, max, colored = false) {
    const mesh = new THREE.InstancedMesh(geo, mat, max);
    mesh.frustumCulled = false;
    mesh.count = 0;
    if (colored) {
        tmpColor.setHex(0xffffff);
        for (let i = 0; i < max; i++) mesh.setColorAt(i, tmpColor);
    }
    addModeMesh(mesh);
    let n = 0;
    return {
        mesh,
        get count() { return n; },
        begin() { n = 0; },
        push(x, y, z, s = 1, rx = 0, ry = 0, rz = 0, color) {
            if (n >= max) return;
            dummy.position.set(x, y, z);
            dummy.rotation.set(rx, ry, rz);
            if (typeof s === 'number') dummy.scale.setScalar(s);
            else dummy.scale.set(s[0], s[1], s[2]);
            dummy.updateMatrix();
            mesh.setMatrixAt(n, dummy.matrix);
            if (colored && color !== undefined) {
                mesh.setColorAt(n, typeof color === 'number' ? tmpColor.setHex(color) : color);
            }
            n++;
        },
        end() {
            mesh.count = n;
            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        }
    };
}

// ==========================================================================
// Scoring, combo, popups, objective
// ==========================================================================
function multiplier() { return 1 + Math.min(3, Math.floor(combo / 4) * 0.5); }

function addScore(points, x, y, color = C_ACCENT) {
    combo++;
    comboTimer = COMBO_WINDOW;
    const mult = multiplier();
    bestMult = Math.max(bestMult, mult);
    const gained = Math.round(points * mult);
    score += gained;
    if (x !== undefined) {
        burst(x, y, color, 8, 4);
        ripple(x, y, 0.5);
        popup(`+${gained}`, x, y);
    }
    sfxPop();
    if (hudScoreEl) {
        gsap.killTweensOf(hudScoreEl);
        gsap.fromTo(hudScoreEl, { scale: 1.18 }, { scale: 1, duration: 0.22, ease: 'power2.out' });
    }
}

// Returns true when the hit actually landed, so modes can skip their own
// reset while the player is still in post-hit invulnerability.
function hurt(x, y) {
    if (invuln > 0 || gameState !== 'playing' || stageDone) return false;
    // Losing a life (and the combo) is the whole cost of a mistake.
    lives--;
    invuln = INVULN_TIME;
    combo = 0;
    comboTimer = 0;
    sfxHit();
    shake(0.55);
    freeze(0.14);
    if (x !== undefined) {
        burst(x, y, C_THREAT, 16, 7);
        ripple(x, y, 1.5);
    }
    renderLives();
    if (hudScoreEl) {
        hudScoreEl.style.color = '#c4605a';
        gsap.fromTo(hudScoreEl, { scale: 1.3 }, {
            scale: 1, duration: 0.35, ease: 'power2.out',
            onComplete: () => { if (hudScoreEl) hudScoreEl.style.color = ''; }
        });
    }
    if (lives <= 0) finale(false);
    return true;
}

function popup(text, x, y) {
    if (!gameScreenEl || !camera) return;
    tmpV.set(x, y, 0.6).project(camera);
    const el = document.createElement('span');
    el.className = 'game-pop';
    el.textContent = text;
    el.style.left = `${(tmpV.x + 1) * 50}%`;
    el.style.top = `${(1 - tmpV.y) * 50}%`;
    gameScreenEl.appendChild(el);
    gsap.fromTo(el, { y: 0, opacity: 1 }, {
        y: -38, opacity: 0, duration: REDUCED_MOTION ? 0.01 : 0.7, ease: 'power2.out',
        onComplete: () => el.remove()
    });
}

function setObjective(text, fraction = 0, ready = false) {
    if (!objectiveEl) return;
    objectiveEl.hidden = !text;
    if (!text) return;
    if (objectiveTextEl.textContent !== text) objectiveTextEl.textContent = text;
    objectiveBarEl.style.transform = `scaleX(${THREE.MathUtils.clamp(fraction, 0, 1)})`;
    objectiveEl.classList.toggle('is-ready', ready);
}

// ==========================================================================
// Floor: a grid shader that ripples outward from every hit
// ==========================================================================
const RIPPLES = 8;
let rippleIdx = 0;
let floorMat = null;

const FLOOR_VERT = /* glsl */`
varying vec2 vPos;
void main() {
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FLOOR_FRAG = /* glsl */`
uniform float uTime;
uniform vec4 uRipples[${RIPPLES}];
uniform vec3 uBg;
uniform vec3 uBase;
uniform vec3 uLine;
varying vec2 vPos;

float grid(vec2 p, float cell) {
    vec2 q = p / cell;
    vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
    return 1.0 - min(min(g.x, g.y), 1.0);
}

void main() {
    vec2 p = vPos;
    float wave = 0.0;
    for (int i = 0; i < ${RIPPLES}; i++) {
        vec4 r = uRipples[i];
        float age = uTime - r.z;
        if (age < 0.0 || age > 1.6) continue;
        vec2 d = p - r.xy;
        float dist = length(d);
        float ring = exp(-pow((dist - age * 14.0) * 1.6, 2.0)) * (1.0 - age / 1.6) * r.w;
        wave += ring;
        p += d / max(dist, 0.001) * ring * 0.35;
    }
    float lines = max(grid(p, 1.0) * 0.28, grid(p, 4.0) * 0.8);
    float fade = 1.0 - smoothstep(12.0, 42.0, length(vPos * vec2(0.8, 1.0)));
    vec3 col = mix(uBg, uBase, fade);
    col += uLine * lines * (0.035 + wave * 0.6) * fade;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
}`;

function ripple(x, y, strength = 1) {
    if (REDUCED_MOTION || !floorMat) return;
    floorMat.uniforms.uRipples.value[rippleIdx].set(x, y, elapsed, strength);
    rippleIdx = (rippleIdx + 1) % RIPPLES;
}

// ==========================================================================
// Background: shader floor + the CV scrolling past on it, very quietly
// ==========================================================================
const BG_TEXTS = [
    'Eduardo Mogollón Salcedo',
    'Game Developer · LSV-TECH S.A.S · 2021 — 2026',
    'GridGuard — Tower defense x 2048',
    'Mobile Game Developer · Freelance · 2019 — 2021',
    'VR Hotel Experience — Cartagena',
    'AR Hotel Experience — Cartagena',
    'VR Multiplayer — Guajira Corp',
    'Native TTS Editor Tool',
    'ClipLoop — Audio loop & cut tool',
    '360 Virtual Tours — Terraviva',
    'Games on Itch.io'
];

function createBackground() {
    bgGroup = new THREE.Group();
    scene.add(bgGroup);

    floorMat = new THREE.ShaderMaterial({
        vertexShader: FLOOR_VERT,
        fragmentShader: FLOOR_FRAG,
        uniforms: {
            uTime: { value: 0 },
            uRipples: { value: Array.from({ length: RIPPLES }, () => new THREE.Vector4(0, 0, -10, 0)) },
            uBg: { value: new THREE.Color(C_BG) },
            uBase: { value: new THREE.Color(0x161b22) },
            uLine: { value: new THREE.Color(0xffffff) }
        }
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), floorMat);
    floor.position.z = FLOOR_Z - 0.02;
    bgGroup.add(floor);

    // Shadows land on a transparent catcher above the shader floor.
    const catcher = new THREE.Mesh(
        new THREE.PlaneGeometry(160, 160),
        new THREE.ShadowMaterial({ opacity: 0.5, depthWrite: false })
    );
    catcher.position.z = FLOOR_Z;
    catcher.receiveShadow = true;
    catcher.renderOrder = 2;
    bgGroup.add(catcher);

    BG_TEXTS.forEach((text, i) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 96;
        const ctx = canvas.getContext('2d');
        ctx.font = '500 40px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(226, 223, 218, 0.07)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(17, 1.6),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false })
        );
        mesh.position.set((Math.random() - 0.5) * 6, spawnTop + i * 2.6, FLOOR_Z + 0.01);
        mesh.renderOrder = 1;
        mesh.userData.speed = 0.7 + Math.random() * 0.5;
        bgGroup.add(mesh);
    });
}

function updateBackground(dt) {
    if (floorMat) floorMat.uniforms.uTime.value = elapsed;
    if (!bgGroup || REDUCED_MOTION) return;
    bgGroup.children.forEach(mesh => {
        if (!mesh.userData.speed) return;
        mesh.position.y -= mesh.userData.speed * dt;
        if (mesh.position.y < -gameHeight / 2 - 4) {
            mesh.position.y = spawnTop + Math.random() * 5;
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
            mats.forEach(m => {
                if (m.map) m.map.dispose();
                if (m.alphaMap) m.alphaMap.dispose();
                m.dispose();
            });
        }
    });
    if (scene) scene.remove(group);
}

// ==========================================================================
// Renderer / scene / camera
// ==========================================================================
function initRenderer() {
    gameCanvas = document.getElementById('game-canvas');
    renderer = new THREE.WebGLRenderer({ canvas: gameCanvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(C_BG, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function placeCamera(dist, tilt = cam.tilt) {
    camera.position.set(0, -Math.sin(tilt) * dist, Math.cos(tilt) * dist);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
}

function worldAtNdc(x, y, out) {
    raycaster.setFromCamera({ x, y }, camera);
    return raycaster.ray.intersectPlane(groundPlane, out);
}

// Perspective makes the near edge of the field the widest thing on screen, so
// the camera distance is solved for: back off until every corner of the
// GAME_WIDTH x gameHeight rectangle is inside the frame.
function fitCamera() {
    let lo = 5, hi = 300;
    for (let i = 0; i < 26; i++) {
        const mid = (lo + hi) / 2;
        placeCamera(mid, TILT);
        const fits = [[-1, -1], [1, -1], [-1, 1], [1, 1]].every(([sx, sy]) => {
            tmpV.set(sx * GAME_WIDTH / 2, sy * gameHeight / 2, 0).project(camera);
            return Math.abs(tmpV.x) <= 0.95 && Math.abs(tmpV.y) <= 0.9;
        });
        if (fits) hi = mid; else lo = mid;
    }
    cam.dist = hi;
    const top = worldAtNdc(0, 1.05, tmpV);
    spawnTop = (top ? top.y : gameHeight / 2) + 1.5;
    placeCamera(cam.dist * cam.zoom);

    if (keyLight) {
        const size = Math.max(GAME_WIDTH, spawnTop * 2) / 2 + 8;
        const shadowCam = keyLight.shadow.camera;
        shadowCam.left = -size; shadowCam.right = size; shadowCam.top = size; shadowCam.bottom = -size;
        shadowCam.updateProjectionMatrix();
    }
}

function sizeRenderer() {
    if (!renderer || !gameScreenEl) return;
    const rect = gameScreenEl.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    renderer.setSize(w, h);
    gameHeight = GAME_WIDTH / (w / h);
    if (camera) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        fitCamera();
    }
}

function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, 1, 1, 160);

    // The old build shaded asteroids with MeshStandardMaterial and never added
    // a light, so they rendered pure black. Lit properly now.
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    keyLight = new THREE.DirectionalLight(0xfff4e8, 1.7);
    keyLight.position.set(-5, -8, 16);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(SHADOW_SIZE, SHADOW_SIZE);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 60;
    keyLight.shadow.bias = -0.0006;
    scene.add(keyLight);
    const fill = new THREE.DirectionalLight(0x9fb4cc, 0.45);
    fill.position.set(6, 4, 8);
    scene.add(fill);
}

function onResize() {
    sizeRenderer();
}

// ==========================================================================
// Input
// ==========================================================================
function onKeyDown(e) {
    if (e.code === 'F3' || e.code === 'Backquote') {
        e.preventDefault();
        toggleStats();
        return;
    }
    if (e.code === 'Tab' && (gameState === 'paused' || gameState === 'over')) {
        const overlay = gameState === 'paused' ? pauseOverlayEl : overOverlayEl;
        const focusable = Array.from(overlay?.querySelectorAll('button:not([disabled])') || []);
        if (focusable.length) {
            e.preventDefault();
            const current = focusable.indexOf(document.activeElement);
            const next = e.shiftKey
                ? focusable[(current - 1 + focusable.length) % focusable.length]
                : focusable[(current + 1) % focusable.length];
            next.focus();
        }
        return;
    }
    if (e.code === 'Escape') {
        if (gameState === 'paused') pauseGame();
        else exitToPortfolio();
        return;
    }
    if (e.target instanceof Element && e.target.closest('button, a, input, textarea, select')) return;
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
    if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) fireQueued = true;
    }

    keyState[e.code] = true;
    if (e.repeat) return;

    let d = null;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') d = { x: -1, y: 0 };
    else if (e.code === 'KeyD' || e.code === 'ArrowRight') d = { x: 1, y: 0 };
    else if (e.code === 'KeyW' || e.code === 'ArrowUp') d = { x: 0, y: 1 };
    else if (e.code === 'KeyS' || e.code === 'ArrowDown') d = { x: 0, y: -1 };
    if (d) {
        if (e.code.startsWith('Arrow')) e.preventDefault();
        pointerActive = false;
        tapQueue.push(d);
    }
}

function onKeyUp(e) { keyState[e.code] = false; }

function clearInputState() {
    Object.keys(keyState).forEach(key => delete keyState[key]);
    tapQueue.length = 0;
    fireQueued = false;
    pointerActive = false;
    touchStart = null;
    touchMoved = false;
}

function onVisibilityLost() {
    clearInputState();
    if (gameState === 'playing') pauseGame();
}

function onVisibilityChange() {
    if (document.hidden) onVisibilityLost();
}

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

function onPointerDown(e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    setPointerFromClient(e.clientX, e.clientY);
    pointerActive = true;
    fireQueued = true;
}

const SWIPE_MIN = 26;

function onTouchStart(e) {
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY, time: performance.now() };
    touchMoved = false;
    setPointerFromClient(t.clientX, t.clientY);
    pointerActive = true;
}

function onTouchMove(e) {
    e.preventDefault();
    const t = e.touches[0];
    setPointerFromClient(t.clientX, t.clientY);
    pointerActive = true;
    if (!touchStart) return;

    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    if (Math.abs(dx) <= SWIPE_MIN && Math.abs(dy) <= SWIPE_MIN) return;
    touchMoved = true;
    // Grid modes read swipes; emit one tap per swipe threshold crossed so a
    // long drag can chain hops without lifting the finger.
    if (currentMode && currentMode.control === 'swipe') {
        tapQueue.push(Math.abs(dx) > Math.abs(dy)
            ? { x: Math.sign(dx), y: 0 }
            : { x: 0, y: -Math.sign(dy) });
        touchStart = { x: t.clientX, y: t.clientY, time: performance.now() };
    }
}

function onTouchEnd() {
    // A quick stab with no travel: a forward hop in grid modes, a missile in
    // follow modes.
    if (currentMode && touchStart && !touchMoved && performance.now() - touchStart.time < 250) {
        if (currentMode.control === 'swipe') tapQueue.push({ x: 0, y: 1 });
        else fireQueued = true;
    }
    touchStart = null;
    touchMoved = false;
    pointerActive = false;
}

function getInput() {
    const dir = { x: 0, y: 0 };
    if (keyState['ArrowLeft'] || keyState['KeyA']) dir.x -= 1;
    if (keyState['ArrowRight'] || keyState['KeyD']) dir.x += 1;
    if (keyState['ArrowUp'] || keyState['KeyW']) dir.y += 1;
    if (keyState['ArrowDown'] || keyState['KeyS']) dir.y -= 1;
    // The pointer is a screen position; follow modes want the point on the
    // play plane under it, which perspective makes a raycast, not a scale.
    const onPlane = pointerActive && camera && worldAtNdc(pointer.x, pointer.y, pointerWorld);
    return { dir, taps: tapQueue, fire: fireQueued, world: pointerWorld, pointerActive: !!onPlane };
}

function addModeMesh(mesh) {
    if (!modeGroup) return;
    mesh.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    modeGroup.add(mesh);
}

// Difficulty comes from the stage, not the score, so a good run doesn't punish
// itself into unplayability while a bad one stays boring.
function difficulty() { return 1 + (round - 1) * 0.12; }

function blink() { return REDUCED_MOTION || invuln <= 0 || Math.floor(invuln * 12) % 2 === 0; }

// ==========================================================================
// Shared ship — flown by Shooter and its boss
// ==========================================================================
function buildShip() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.75);
    shape.lineTo(0.5, -0.6);
    shape.lineTo(0, -0.28);
    shape.lineTo(-0.5, -0.6);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.18, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.04, bevelSegments: 1
    });
    geo.translate(0, 0, -0.09);
    const ship = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        color: C_PLAYER, roughness: 0.45, metalness: 0.1, flatShading: true
    }));
    const thruster = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.5, 0.12),
        new THREE.MeshBasicMaterial({ color: C_ACCENT })
    );
    thruster.position.set(0, -0.62, 0);
    ship.add(thruster);
    ship.position.set(0, -gameHeight / 2 + 2, 0);
    addModeMesh(ship);
    return { ship, thruster, tx: 0, ty: ship.position.y };
}

// Eased follow plus a roll into the turn: the ship banks by its own velocity,
// so direction changes read before the position does.
function flyShip(s, input, dt) {
    const halfW = GAME_WIDTH / 2 - 0.7;
    const halfH = gameHeight / 2 - 1;
    if (input.pointerActive) {
        s.tx = input.world.x;
        s.ty = input.world.y;
    } else {
        s.tx += input.dir.x * 16 * dt;
        s.ty += input.dir.y * 16 * dt;
    }
    s.tx = THREE.MathUtils.clamp(s.tx, -halfW, halfW);
    s.ty = THREE.MathUtils.clamp(s.ty, -halfH, halfH);

    const p = s.ship.position;
    const prevX = p.x;
    const k = Math.min(1, 12 * dt);
    p.x += (s.tx - p.x) * k;
    p.y += (s.ty - p.y) * k;
    const bank = THREE.MathUtils.clamp((p.x - prevX) / Math.max(dt, 1e-3) * 0.05, -0.7, 0.7);
    s.ship.rotation.y += (bank - s.ship.rotation.y) * Math.min(1, dt * 10);
    s.thruster.scale.y = 0.75 + Math.sin(performance.now() * 0.03) * 0.25;
    if (!REDUCED_MOTION) {
        spark(p.x + (Math.random() - 0.5) * 0.12, p.y - 0.85, 0,
            (Math.random() - 0.5) * 0.6, -3, 0, 0.26, 0.45, C_ACCENT, 0);
    }
    s.ship.visible = blink();
}

// ==========================================================================
// Stage 1: Shooter
// ==========================================================================
function ShooterMode() {
    const FIRE_INTERVAL = 0.17;
    const BULLET_SPEED = 26;
    const MAX_BULLETS = 48;
    const MAX_ROCKS = 28;

    let flyer;
    const bullets = [];
    const rocks = [];
    let fireTimer = 0;
    let spawnTimer = 0;

    function fire() {
        const b = bullets.find(b => !b.active);
        if (!b) return;
        b.active = true;
        b.mesh.visible = true;
        b.mesh.position.set(flyer.ship.position.x, flyer.ship.position.y + 0.7, 0);
    }

    function spawnRock(size, x, y, drift) {
        const r = rocks.find(r => !r.active);
        if (!r) return;
        r.mesh.scale.setScalar(size);
        r.radius = size;
        r.hp = size > 1.05 ? 3 : size > 0.8 ? 2 : 1;
        r.flash = 0;
        r.active = true;
        r.mesh.visible = true;
        r.mesh.position.set(x, y, 0);
        r.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        r.spin = (Math.random() - 0.5) * 2.5;
        r.speed = 3.4 * (0.8 + Math.random() * 0.5) * difficulty();
        r.drift = drift;
    }

    function killRock(r) {
        const { x, y } = r.mesh.position;
        r.active = false;
        r.mesh.visible = false;
        addScore(Math.round(12 * difficulty()), x, y, C_ACCENT);
        shake(0.12);
        freeze(0.035);
        // Big rocks split, the way they should.
        if (r.radius > 1.0) {
            [-1, 1].forEach(side => spawnRock(r.radius * 0.55, x + side * 0.4, y, side * 2.4));
        }
    }

    return {
        control: 'follow',
        duration: ROUND_TIME,
        enter() {
            flyer = buildShip();
            const bGeo = new THREE.BoxGeometry(0.11, 0.62, 0.11);
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
                rocks.push({ mesh, active: false, radius: 1, spin: 0, hp: 1, speed: 0, drift: 0, flash: 0 });
            }
        },
        update(dt, input) {
            flyShip(flyer, input, dt);
            const ship = flyer.ship;

            fireTimer += dt;
            if (fireTimer >= FIRE_INTERVAL) { fireTimer = 0; fire(); }

            spawnTimer += dt;
            const spawnEvery = Math.max(0.32, 1.0 - (difficulty() - 1) * 0.5);
            if (spawnTimer >= spawnEvery) {
                spawnTimer = 0;
                spawnRock(0.55 + Math.random() * 0.85, (Math.random() - 0.5) * (GAME_WIDTH - 2), spawnTop, (Math.random() - 0.5) * 1.4);
            }

            for (const b of bullets) {
                if (!b.active) continue;
                b.mesh.position.y += BULLET_SPEED * dt;
                if (b.mesh.position.y > spawnTop) { b.active = false; b.mesh.visible = false; }
            }

            for (const r of rocks) {
                if (!r.active) continue;
                r.mesh.position.y -= r.speed * dt;
                r.mesh.position.x += r.drift * dt;
                r.mesh.rotation.x += r.spin * dt;
                r.mesh.rotation.y += r.spin * 0.7 * dt;
                r.flash = Math.max(0, r.flash - dt * 8);
                r.mesh.material.emissive.setScalar(r.flash * 0.55);
                if (r.mesh.position.y < -gameHeight / 2 - 3) { r.active = false; r.mesh.visible = false; }
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
                        killRock(r);
                    } else {
                        r.flash = 1;
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
        },
        stats() {
            return [
                ['Rocks', `${rocks.filter(r => r.active).length}/${MAX_ROCKS} pooled`],
                ['Bullets', `${bullets.filter(b => b.active).length}/${MAX_BULLETS} pooled`]
            ];
        },
        exit() { bullets.length = 0; rocks.length = 0; }
    };
}

// ==========================================================================
// Stage 2: The Core — telegraphed bullet patterns, a shield, homing missiles
// ==========================================================================
function ShooterBoss() {
    const MAX_SHOTS = 40;
    const MAX_ORBS = 260;
    const MAX_MISSILES = 4;
    const CORE_R = 1.25;
    const SHIELD_R = 2.05;
    const SHIELD_SEGS = 5;
    const FIRE_INTERVAL = 0.13;
    const MISSILE_COOLDOWN = 1.1;
    const MISSILE_DAMAGE = 6;
    const SEG_DOWN_TIME = 5;
    const PATTERNS = ['ring', 'spiral', 'aimed'];

    let flyer, boss, core, shield, hpFill;
    let shotBatch, orbBatch, missileBatch;
    const shots = [];
    const orbs = [];
    const missiles = [];
    const segs = [];
    let fireTimer = 0;
    let missileCd = 0;
    let t = 0;
    let hp = 1, maxHp = 1;
    let alive = true;
    let state = 'idle';
    let stateTimer = 1.4;
    let patternIdx = 0;
    let volleyTimer = 0;
    let volleysLeft = 0;
    let spiralAngle = 0;
    let flash = 0;
    let tell = 0;
    const accentColor = new THREE.Color(C_ACCENT);

    const bossY = () => gameHeight / 2 - 3.4;

    function fireOrb(angle, speed) {
        if (orbs.length >= MAX_ORBS) return;
        orbs.push({ x: boss.position.x, y: boss.position.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
    }

    // Each attack is announced first: the core swells and warms towards the
    // accent. Readable tells are what make a bullet pattern fair.
    function startAttack() {
        const pattern = PATTERNS[patternIdx++ % PATTERNS.length];
        const speed = difficulty();
        if (pattern === 'ring') {
            const n = 18;
            const offset = Math.random() * Math.PI;
            for (let k = 0; k < n; k++) fireOrb(offset + (k / n) * Math.PI * 2, 4.2 * speed);
            state = 'idle';
            stateTimer = 1.3;
        } else if (pattern === 'spiral') {
            state = 'spiral';
            stateTimer = 2.4;
            volleyTimer = 0;
        } else {
            state = 'aimed';
            volleysLeft = 3;
            volleyTimer = 0;
        }
    }

    function hitSegment(x, y, r) {
        return segs.find(s => s.alive && (x - s.pos.x) ** 2 + (y - s.pos.y) ** 2 < (0.45 + r) ** 2);
    }

    function hitsCore(x, y, r) {
        return (x - boss.position.x) ** 2 + (y - boss.position.y) ** 2 < (CORE_R + r) ** 2;
    }

    function explode(x, y, power) {
        burst(x, y, C_ACCENT, Math.round(12 * power), 6 * power);
        burst(x, y, C_PLAYER, 5, 4);
        ripple(x, y, 0.9 * power);
        shake(0.18 * power);
        sfxPop();
    }

    // A missile knocks a shield block out for a few seconds, which is the
    // opening your regular fire needs.
    function breakSegment(seg) {
        seg.alive = false;
        seg.down = SEG_DOWN_TIME;
        seg.mesh.visible = false;
        burst(seg.pos.x, seg.pos.y, 0x5c636c, 10, 5);
    }

    function damage(amount, x, y) {
        hp -= amount;
        flash = 1;
        burst(x, y, C_PLAYER, 2, 3);
        if (hp <= 0) killBoss();
    }

    function killBoss() {
        const { x, y } = boss.position;
        alive = false;
        boss.visible = false;
        orbs.length = 0;
        burst(x, y, C_ACCENT, 40, 10);
        burst(x, y, C_PLAYER, 30, 7);
        shake(0.7);
        freeze(0.2);
        ripple(x, y, 2.4);
        addScore(Math.round(260 * difficulty()), x, y, C_ACCENT);
        stageClear();
    }

    function launchMissile(from) {
        if (missileCd > 0 || missiles.length >= MAX_MISSILES || !alive) return;
        missileCd = MISSILE_COOLDOWN;
        // Launched sideways, then they curve in — the arc is the point.
        const side = missiles.length % 2 ? 1 : -1;
        missiles.push({ x: from.x + side * 0.4, y: from.y, vx: side * 6, vy: 2, ang: 0, life: 0 });
        sfxTone({ type: 'triangle', from: 220, to: 880, gain: 0.04, duration: 0.25 });
    }

    return {
        control: 'follow',
        enter() {
            flyer = buildShip();
            maxHp = hp = Math.round(80 * difficulty());

            boss = new THREE.Group();
            core = new THREE.Mesh(
                new THREE.IcosahedronGeometry(CORE_R, 1),
                new THREE.MeshStandardMaterial({ color: 0x8a8f96, roughness: 0.4, metalness: 0.3, flatShading: true })
            );
            boss.add(core);

            shield = new THREE.Group();
            const segGeo = new THREE.BoxGeometry(0.5, 0.9, 0.5);
            const segMat = new THREE.MeshStandardMaterial({ color: 0x5c636c, roughness: 0.6, flatShading: true });
            for (let i = 0; i < SHIELD_SEGS; i++) {
                const a = (i / SHIELD_SEGS) * Math.PI * 2;
                const mesh = new THREE.Mesh(segGeo, segMat);
                mesh.position.set(Math.cos(a) * SHIELD_R, Math.sin(a) * SHIELD_R, 0);
                mesh.rotation.z = a;
                shield.add(mesh);
                segs.push({ mesh, alive: true, down: 0, pos: new THREE.Vector3() });
            }
            boss.add(shield);

            const barBg = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 }));
            barBg.position.set(0, -SHIELD_R - 0.8, 0);
            boss.add(barBg);
            const fillGeo = new THREE.PlaneGeometry(4, 0.12);
            fillGeo.translate(2, 0, 0);
            hpFill = new THREE.Mesh(fillGeo, new THREE.MeshBasicMaterial({ color: C_PLAYER }));
            hpFill.position.set(-2, -SHIELD_R - 0.8, 0.01);
            boss.add(hpFill);

            boss.position.set(0, bossY(), 0);
            addModeMesh(boss);
            gsap.fromTo(boss.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: 1, y: 1, z: 1, duration: 0.7, ease: 'back.out(1.8)' });

            // Player fire, missiles and boss fire are one InstancedMesh each:
            // hundreds of bullets, three draw calls.
            shotBatch = makeBatch(new THREE.BoxGeometry(0.1, 0.6, 0.1), new THREE.MeshBasicMaterial({ color: C_ACCENT }), MAX_SHOTS);
            missileBatch = makeBatch(new THREE.BoxGeometry(0.18, 0.55, 0.18), new THREE.MeshStandardMaterial({ color: C_PLAYER, roughness: 0.4, flatShading: true }), MAX_MISSILES);
            orbBatch = makeBatch(
                new THREE.IcosahedronGeometry(0.22, 1),
                new THREE.MeshStandardMaterial({ color: C_THREAT, emissive: C_THREAT, emissiveIntensity: 0.25, roughness: 0.4 }),
                MAX_ORBS
            );
        },
        update(dt, input) {
            t += dt;
            flyShip(flyer, input, dt);
            const ship = flyer.ship.position;

            missileCd = Math.max(0, missileCd - dt);
            if (input.fire) launchMissile(ship);
            setObjective(tx().missile, 1 - missileCd / MISSILE_COOLDOWN, missileCd <= 0);

            // --- boss ---------------------------------------------------------
            if (alive) {
                boss.position.x = Math.sin(t * 0.55) * (GAME_WIDTH / 2 - 3.5);
                boss.position.y = bossY() + Math.sin(t * 1.3) * 0.3;
                shield.rotation.z += dt * (state === 'tell' ? 3.2 : 1.1);
                core.rotation.x += dt * 0.6;
                core.rotation.y += dt * 0.9;

                stateTimer -= dt;
                if (state === 'idle' && stateTimer <= 0) {
                    state = 'tell';
                    stateTimer = 0.55;
                } else if (state === 'tell' && stateTimer <= 0) {
                    startAttack();
                } else if (state === 'spiral') {
                    volleyTimer -= dt;
                    if (volleyTimer <= 0) {
                        volleyTimer = 0.06;
                        spiralAngle += 0.37;
                        for (let k = 0; k < 3; k++) fireOrb(spiralAngle + (k / 3) * Math.PI * 2, 4.6 * difficulty());
                    }
                    if (stateTimer <= 0) { state = 'idle'; stateTimer = 1.1; }
                } else if (state === 'aimed') {
                    volleyTimer -= dt;
                    if (volleyTimer <= 0) {
                        volleyTimer = 0.32;
                        const aim = Math.atan2(ship.y - boss.position.y, ship.x - boss.position.x);
                        for (let k = -2; k <= 2; k++) fireOrb(aim + k * 0.16, 7 * difficulty());
                        if (--volleysLeft <= 0) { state = 'idle'; stateTimer = 1.2; }
                    }
                }

                tell += ((state === 'tell' ? 1 : 0) - tell) * Math.min(1, dt * 12);
                flash = Math.max(0, flash - dt * 7);
                core.scale.setScalar(1 + tell * 0.22 + flash * 0.06);
                core.material.emissive.copy(accentColor).multiplyScalar(tell * 0.6).addScalar(flash * 0.7);
                hpFill.scale.x = Math.max(0.001, hp / maxHp);

                segs.forEach(seg => {
                    if (!seg.alive) {
                        seg.down -= dt;
                        if (seg.down <= 0) {
                            seg.alive = true;
                            seg.mesh.visible = true;
                            gsap.fromTo(seg.mesh.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'back.out(2)' });
                        }
                    }
                    seg.mesh.getWorldPosition(seg.pos);
                });
            }

            // --- player fire ----------------------------------------------------
            fireTimer += dt;
            if (fireTimer >= FIRE_INTERVAL && shots.length < MAX_SHOTS) {
                fireTimer = 0;
                shots.push({ x: ship.x, y: ship.y + 0.7 });
            }
            sweep(shots, s => {
                s.y += 26 * dt;
                if (s.y > spawnTop) return false;
                if (!alive) return true;
                if (hitSegment(s.x, s.y, 0.05)) { burst(s.x, s.y, C_MUTED, 2, 2); return false; }
                if (hitsCore(s.x, s.y, 0.2)) { score += 1; damage(1, s.x, s.y); return false; }
                return true;
            });

            // --- missiles: accelerate, then home with a capped turn rate --------
            sweep(missiles, m => {
                m.life += dt;
                const speed = Math.min(20, 6 + m.life * 18);
                let ang = Math.atan2(m.vy, m.vx);
                if (alive && m.life > 0.12) {
                    const want = Math.atan2(boss.position.y - m.y, boss.position.x - m.x);
                    const delta = Math.atan2(Math.sin(want - ang), Math.cos(want - ang));
                    ang += THREE.MathUtils.clamp(delta, -7 * dt, 7 * dt);
                }
                m.vx = Math.cos(ang) * speed;
                m.vy = Math.sin(ang) * speed;
                m.x += m.vx * dt;
                m.y += m.vy * dt;
                m.ang = ang;
                if (!REDUCED_MOTION) {
                    spark(m.x - Math.cos(ang) * 0.3, m.y - Math.sin(ang) * 0.3, 0.1,
                        Math.random() - 0.5, Math.random() - 0.5, 0.6, 0.45, 0.55,
                        Math.random() < 0.5 ? C_ACCENT : C_MUTED, 0.15);
                }
                if (m.life > 3.5 || Math.abs(m.x) > GAME_WIDTH / 2 + 3 || m.y > spawnTop) return false;
                if (!alive) return true;
                const seg = hitSegment(m.x, m.y, 0.3);
                if (seg) { breakSegment(seg); explode(m.x, m.y, 0.8); return false; }
                if (hitsCore(m.x, m.y, 0.3)) {
                    explode(m.x, m.y, 1.2);
                    freeze(0.06);
                    damage(MISSILE_DAMAGE, m.x, m.y);
                    return false;
                }
                return true;
            });

            // --- boss fire ------------------------------------------------------
            const outX = GAME_WIDTH / 2 + 3;
            let hit = false;
            sweep(orbs, o => {
                o.x += o.vx * dt;
                o.y += o.vy * dt;
                if (Math.abs(o.x) > outX || o.y < -gameHeight / 2 - 3 || o.y > spawnTop) return false;
                if ((o.x - ship.x) ** 2 + (o.y - ship.y) ** 2 < 0.27) { hit = true; return false; }
                return true;
            });
            // A hit clears the screen: getting tagged once shouldn't chain into
            // losing a second life to the same wall of bullets.
            if (hit && hurt(ship.x, ship.y)) orbs.length = 0;

            shotBatch.begin();
            shots.forEach(s => shotBatch.push(s.x, s.y, 0));
            shotBatch.end();
            missileBatch.begin();
            missiles.forEach(m => missileBatch.push(m.x, m.y, 0.1, 1, 0, 0, m.ang - Math.PI / 2));
            missileBatch.end();
            orbBatch.begin();
            orbs.forEach((o, i) => orbBatch.push(o.x, o.y, 0, 1, t * 3 + i, t * 2, 0));
            orbBatch.end();
        },
        bar() { return hp / maxHp; },
        stats() {
            return [
                ['Orbs', `${orbs.length}/${MAX_ORBS} · 1 call`],
                ['Missiles', `${missiles.length}/${MAX_MISSILES} · homing`],
                ['Boss', alive ? `${Math.max(0, hp)}/${maxHp} · ${state}` : 'down']
            ];
        },
        exit() { shots.length = 0; orbs.length = 0; missiles.length = 0; segs.length = 0; }
    };
}

// ==========================================================================
// Stages 3–4: Crossing (endless) and The Devourer
//
// The road never ends. Rows are generated ahead of the camera and crumble off
// the back edge, which rises on its own. The boss version is the same road
// with a grinder eating it, faster, lunging, and a gate to reach.
// ==========================================================================
function CrossyMode(isBoss) {
    const COLS = 11;
    const CELL = 1.15;
    const PW = GAME_WIDTH + 8;
    const CHUNKS = 7;
    const CHUNK_W = PW / CHUNKS;
    const BASE_Z = PLATE_Z + CELL * 0.3;
    const SLAB_Z = PLATE_Z - 0.15;
    const LAND_Z = FLOOR_Z + 0.15;
    const GOAL = 36;
    const LAG = isBoss ? 6 : 9;
    const MAW_TEETH = 9;
    const C_GRASS = [0x252d36, 0x28313a];
    const C_ROAD = [0x0f1215, 0x111418];
    const C_GOAL = 0x3a2e24;

    const rows = new Map();
    const pos = { x: 0, r: 0 };
    const hop = { z: 0 };
    const edge = { row: -5 };
    let player, chunkBatch, dashBatch, carBatch, cabinBatch, trunkBatch, crownBatch, mawBatch, gateBatch;
    let pc = Math.floor(COLS / 2);
    let pr = 0;
    let maxRow = 0;
    let camRow = 0;
    let t = 0;
    let lungeTimer = 5;
    let telling = 0;
    let tell = 0;
    let mawDead = false;
    const threatColor = new THREE.Color(C_THREAT);
    const mawColor = new THREE.Color();

    const wx = (c) => (c - COLS / 2 + 0.5) * CELL;
    const sy = (r) => (r - camRow) * CELL;
    const mawY = () => sy(edge.row) - CELL * 0.9;
    const toothX = (i) => -GAME_WIDTH / 2 - 1 + (i + 0.5) * (GAME_WIDTH + 2) / MAW_TEETH;
    const isGoal = (r) => isBoss && r === GOAL;

    function makeRow(r) {
        const prev = rows.get(r - 1);
        const run = prev && prev.type === 'road' ? prev.run : 0;
        let type = 'grass';
        if (r > 1 && !isGoal(r)) {
            // Roads come in runs of up to three, with a breather between.
            type = run >= 3 || (run >= 1 && Math.random() < 0.3) ? 'grass' : Math.random() < 0.78 ? 'road' : 'grass';
        }
        const row = {
            r, type, run: type === 'road' ? run + 1 : 0,
            fall: r < edge.row - 1 ? 99 : -1,
            seeds: Array.from({ length: CHUNKS }, Math.random),
            trees: new Set(), cars: []
        };
        if (type === 'grass' && r > 2 && !isGoal(r)) {
            const n = Math.floor(Math.random() * 3);
            for (let i = 0; i < n; i++) row.trees.add(Math.floor(Math.random() * COLS));
        }
        if (type === 'road') {
            row.dir = Math.random() < 0.5 ? 1 : -1;
            row.speed = (2.2 + Math.random() * 2.4) * difficulty() * (isBoss ? 1.15 : 1);
            row.spacing = 1.6 + Math.random() * 1.8;
            row.timer = row.spacing;
            for (let x = -PW / 2 + Math.random() * 3; x < PW / 2; x += row.speed * row.spacing * (0.8 + Math.random() * 0.5)) {
                row.cars.push({ x, color: Math.random() < 0.35 ? C_THREAT : C_MUTED });
            }
        }
        rows.set(r, row);
        return row;
    }

    function ensureRows() {
        const from = Math.floor(camRow - gameHeight / 2 / CELL) - 3;
        const to = Math.ceil(camRow + spawnTop / CELL) + 2;
        for (let r = from; r <= to; r++) if (!rows.has(r)) makeRow(r);
        for (const r of rows.keys()) if (r < from - 2) rows.delete(r);
    }

    function crumbleFx(row) {
        if (REDUCED_MOTION) return;
        const y = sy(row.r);
        const color = row.type === 'road' ? 0x2a3038 : 0x323a44;
        for (let i = 0; i < 5; i++) {
            spark((Math.random() - 0.5) * GAME_WIDTH, y, PLATE_Z,
                (Math.random() - 0.5) * 2, -Math.random() * 2, 2 + Math.random() * 3,
                0.8 + Math.random() * 0.5, 0.9 + Math.random() * 0.8, color);
        }
    }

    function moveTo(c, r, instant = false) {
        pc = c;
        pr = r;
        gsap.killTweensOf(pos);
        if (instant) { pos.x = wx(c); pos.r = r; return; }
        gsap.to(pos, { x: wx(c), r, duration: 0.12, ease: 'power2.out' });
        gsap.fromTo(hop, { z: 0 }, { z: 0.9, duration: 0.06, ease: 'power2.out', yoyo: true, repeat: 1 });
        gsap.fromTo(player.scale, { x: 0.8, y: 0.8, z: 1.35 }, { x: 1, y: 1, z: 1, duration: 0.22, ease: 'back.out(2)', overwrite: true });
    }

    function tryMove(tap) {
        const nc = THREE.MathUtils.clamp(pc + tap.x, 0, COLS - 1);
        const nr = pr + tap.y;
        if (nc === pc && nr === pr) return;
        const row = rows.get(nr);
        if (row && row.trees.has(nc)) {
            gsap.fromTo(player.scale, { x: 1.2, y: 1.2, z: 0.8 }, { x: 1, y: 1, z: 1, duration: 0.2, ease: 'back.out(2)', overwrite: true });
            return;
        }
        moveTo(nc, nr);
        if (pr > maxRow) {
            score += (pr - maxRow) * 5;
            maxRow = pr;
            if (!isBoss && maxRow % 10 === 0) addScore(Math.round(25 * difficulty()), wx(pc), sy(pr));
        }
    }

    // Caught by the edge: land a few rows ahead, on grass, clear of trees.
    function respawnAhead() {
        let r = Math.max(pr, Math.ceil(edge.row) + 3);
        let row = rows.get(r) || makeRow(r);
        for (let i = 0; i < 12 && row.type !== 'grass'; i++) row = rows.get(++r) || makeRow(r);
        let c = Math.floor(COLS / 2);
        if (row.trees.has(c)) c = [...Array(COLS).keys()].find(k => !row.trees.has(k));
        moveTo(c, r, true);
    }

    function lunge() {
        gsap.to(edge, {
            row: edge.row + 2.4, duration: REDUCED_MOTION ? 0 : 0.35, ease: 'power3.in',
            onComplete: () => { shake(0.35); ripple(0, mawY(), 1.2); sfxHit(); }
        });
    }

    function winBoss() {
        mawDead = true;
        gsap.killTweensOf(edge);
        const y = mawY();
        for (let i = 0; i < MAW_TEETH; i++) burst(toothX(i), y, i % 2 ? C_THREAT : C_MUTED, 10, 8);
        mawBatch.begin();
        mawBatch.end();
        shake(0.7);
        freeze(0.2);
        ripple(pos.x, sy(pos.r), 2.4);
        addScore(Math.round(300 * difficulty()), pos.x, sy(pos.r), C_ACCENT);
        stageClear();
    }

    function render() {
        chunkBatch.begin(); dashBatch.begin(); carBatch.begin(); cabinBatch.begin(); trunkBatch.begin(); crownBatch.begin();
        const bottom = -gameHeight / 2 - 3;
        for (const row of rows.values()) {
            const y = sy(row.r);
            if (y < bottom || y > spawnTop + 1 || row.fall > 2.4) continue;
            const base = isGoal(row.r) ? C_GOAL : (row.type === 'grass' ? C_GRASS : C_ROAD)[row.r & 1];
            for (let k = 0; k < CHUNKS; k++) {
                let z = SLAB_Z, s = 1, rx = 0;
                if (row.fall >= 0) {
                    // Chunks drop one by one, land on the floor and dissolve.
                    const tk = Math.max(0, row.fall - row.seeds[k] * 0.4);
                    z = SLAB_Z - 6 * tk * tk;
                    if (z < LAND_Z) {
                        z = LAND_Z;
                        s = Math.max(0, 1 - (tk - Math.sqrt((SLAB_Z - LAND_Z) / 6)) * 1.6);
                    }
                    rx = tk * (row.seeds[k] - 0.5) * 3;
                }
                if (s > 0.01) chunkBatch.push(-PW / 2 + (k + 0.5) * CHUNK_W, y, z, s, rx, rx * 0.6, 0, base);
            }
            if (row.fall > 0.25) continue;
            // Lane dashes between two roads.
            const above = rows.get(row.r + 1);
            if (row.type === 'road' && above && above.type === 'road' && above.fall < 0) {
                for (let x = -PW / 2 + 0.8; x < PW / 2; x += 1.6) dashBatch.push(x, y + CELL / 2, PLATE_Z + 0.01);
            }
            const drop = row.fall > 0 ? 6 * row.fall * row.fall : 0;
            for (const car of row.cars) {
                carBatch.push(car.x, y, PLATE_Z + CELL * 0.21 - drop, 1, 0, 0, 0, car.color);
                cabinBatch.push(car.x, y, PLATE_Z + CELL * 0.51 - drop);
            }
            for (const c of row.trees) {
                trunkBatch.push(wx(c), y, PLATE_Z + 0.25 - drop);
                crownBatch.push(wx(c), y, PLATE_Z + 0.8 - drop, 1, row.r, c, 0);
            }
        }
        chunkBatch.end(); dashBatch.end(); carBatch.end(); cabinBatch.end(); trunkBatch.end(); crownBatch.end();

        player.position.set(pos.x, sy(pos.r), BASE_Z + hop.z);
        player.visible = blink();

        if (isBoss && !mawDead) {
            const y = mawY();
            mawColor.setHex(0x3a4048).lerp(threatColor, tell);
            mawBatch.begin();
            for (let i = 0; i < MAW_TEETH; i++) {
                const bob = Math.sin(t * 6 + i * 1.3);
                mawBatch.push(toothX(i), y + bob * 0.08, PLATE_Z + 0.5 + bob * 0.25, 1 + tell * 0.25, t * 2 + i, t * 1.3 + i, 0, mawColor);
            }
            mawBatch.end();
        }
        if (gateBatch) {
            const y = sy(GOAL);
            const side = COLS * CELL / 2 + 0.35;
            gateBatch.begin();
            gateBatch.push(-side, y, PLATE_Z + 0.9, [0.3, 0.3, 1.8]);
            gateBatch.push(side, y, PLATE_Z + 0.9, [0.3, 0.3, 1.8]);
            gateBatch.push(0, y, PLATE_Z + 1.9, [side * 2 + 0.3, 0.22, 0.22]);
            gateBatch.end();
        }
    }

    return {
        control: 'swipe',
        duration: isBoss ? undefined : ROUND_TIME,
        enter() {
            groundZ = PLATE_Z;
            camRow = 0.25 * gameHeight / CELL;
            edge.row = -5;

            player = new THREE.Mesh(
                new THREE.BoxGeometry(CELL * 0.6, CELL * 0.6, CELL * 0.6),
                new THREE.MeshStandardMaterial({ color: C_PLAYER, roughness: 0.6, flatShading: true })
            );
            addModeMesh(player);
            moveTo(pc, 0, true);

            // Terrain, traffic and trees are all instanced: the whole road is
            // a handful of draw calls however many rows are on screen.
            chunkBatch = makeBatch(new THREE.BoxGeometry(CHUNK_W * 0.985, CELL * 0.94, 0.3), new THREE.MeshStandardMaterial({ roughness: 0.9 }), 480, true);
            dashBatch = makeBatch(new THREE.PlaneGeometry(0.7, 0.06), new THREE.MeshBasicMaterial({ color: 0x4a525c }), 700);
            dashBatch.mesh.castShadow = false;
            carBatch = makeBatch(new THREE.BoxGeometry(CELL * 1.6, CELL * 0.62, CELL * 0.42), new THREE.MeshStandardMaterial({ roughness: 0.7, flatShading: true }), 180, true);
            cabinBatch = makeBatch(new THREE.BoxGeometry(CELL * 0.8, CELL * 0.5, CELL * 0.3), new THREE.MeshStandardMaterial({ color: 0x3a4048, roughness: 0.35, metalness: 0.2 }), 180);
            trunkBatch = makeBatch(new THREE.BoxGeometry(0.22, 0.22, 0.5), new THREE.MeshStandardMaterial({ color: 0x4d4238, roughness: 0.9 }), 120);
            crownBatch = makeBatch(new THREE.IcosahedronGeometry(0.44, 0), new THREE.MeshStandardMaterial({ color: 0x566b54, roughness: 0.8, flatShading: true }), 120);
            if (isBoss) {
                mawBatch = makeBatch(new THREE.IcosahedronGeometry(1.1, 0), new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.3, flatShading: true }), MAW_TEETH, true);
                gateBatch = makeBatch(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: C_ACCENT, roughness: 0.5 }), 3);
            }
            ensureRows();
        },
        update(dt, input) {
            t += dt;
            if (input.taps.length) tryMove(input.taps[0]);

            // The edge rises on its own, and never lets you get too far ahead.
            if (!mawDead) {
                const speed = isBoss ? 0.6 + t * 0.04 : 0.45 * difficulty();
                edge.row = Math.max(edge.row + speed * dt, pr - LAG);
            }
            if (isBoss && !mawDead) {
                if (telling > 0) {
                    telling -= dt;
                    if (telling <= 0) lunge();
                } else if ((lungeTimer -= dt) <= 0) {
                    telling = 0.7;
                    lungeTimer = Math.max(2.6, 4.5 - t * 0.03);
                }
                tell += ((telling > 0 ? 1 : 0) - tell) * Math.min(1, dt * 10);
                shake(0.006);
                if (!REDUCED_MOTION && Math.random() < 0.6) {
                    spark((Math.random() - 0.5) * GAME_WIDTH, mawY(), PLATE_Z + 0.3,
                        (Math.random() - 0.5) * 2, -Math.random() * 2, 3 + Math.random() * 3,
                        0.6, 0.6, Math.random() < tell ? C_THREAT : C_MUTED);
                }
            }

            camRow += (pos.r + 0.25 * gameHeight / CELL - camRow) * Math.min(1, dt * 5);
            ensureRows();

            for (const row of rows.values()) {
                if (row.fall < 0 && row.r < edge.row) { row.fall = 0; crumbleFx(row); }
                if (row.fall >= 0) { row.fall += dt; continue; }
                if (row.type !== 'road') continue;
                row.timer -= dt;
                if (row.timer <= 0) {
                    row.timer = row.spacing * (0.7 + Math.random() * 0.6);
                    row.cars.push({ x: row.dir > 0 ? -PW / 2 - 1.2 : PW / 2 + 1.2, color: Math.random() < 0.35 ? C_THREAT : C_MUTED });
                }
                const limit = PW / 2 + 1.5;
                sweep(row.cars, car => {
                    car.x += row.dir * row.speed * dt;
                    if (Math.abs(car.x) > limit) return false;
                    if (row.r === pr && invuln <= 0 && Math.abs(car.x - wx(pc)) < CELL * 0.82) {
                        hurt(pos.x, sy(pos.r));
                        return false;
                    }
                    return true;
                });
            }

            if (pr < edge.row - 0.15) {
                hurt(pos.x, sy(pos.r));
                respawnAhead();
            }
            if (isBoss && !mawDead && pr >= GOAL) winBoss();
            if (isBoss) setObjective(tx().gate(Math.min(maxRow, GOAL), GOAL), maxRow / GOAL, true);

            render();
        },
        bar() { return 1 - Math.min(maxRow, GOAL) / GOAL; },
        stats() {
            let live = 0;
            rows.forEach(r => { if (r.fall < 0) live++; });
            return [
                ['Terrain', `${chunkBatch.count} chunks · 1 call`],
                ['Traffic', `${carBatch.count} cars · 2 calls`],
                ['Rows', `${live} live · edge ${edge.row.toFixed(1)}`]
            ];
        },
        exit() { rows.clear(); gsap.killTweensOf([pos, hop, edge]); }
    };
}

// ==========================================================================
// Grid board (Snake) — an opaque plate floating over the floor
// ==========================================================================
function buildBoard(cols, rows, cell) {
    // Opaque plate first: without it the scrolling CV text reads straight
    // through the grid and competes with the pieces.
    const plate = new THREE.Mesh(
        new THREE.BoxGeometry(cols * cell + 0.3, rows * cell + 0.3, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x161b22, roughness: 0.9 })
    );
    plate.position.z = PLATE_Z - 0.15;
    addModeMesh(plate);

    const x0 = -cols * cell / 2, y0 = -rows * cell / 2;
    const verts = [];
    for (let c = 0; c <= cols; c++) verts.push(x0 + c * cell, y0, PLATE_Z + 0.01, x0 + c * cell, -y0, PLATE_Z + 0.01);
    for (let r = 0; r <= rows; r++) verts.push(x0, y0 + r * cell, PLATE_Z + 0.01, -x0, y0 + r * cell, PLATE_Z + 0.01);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
    modeGroup.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.08
    })));
    groundZ = PLATE_Z;
}

// ==========================================================================
// Stages 5–6: Snake and The Rival
//
// The rival is a second snake that hunts you with a breadth-first search on
// the grid, aiming a couple of cells ahead of your head to cut you off. Its
// planned path is drawn on the board, so you can read it and bait it.
// ==========================================================================
function SnakeMode(isBoss) {
    const COLS = 15;
    const ROWS = 11;
    const CELL = 1.0;
    const BASE_INTERVAL = 0.2;
    const SEG_Z = PLATE_Z + CELL * 0.41;
    const GOAL = 8;
    const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    let me = [];
    let rival = [];
    let rivalPath = [];
    let food = null;
    let foodC = 0, foodR = 0;
    let dir = { x: 0, y: 1 };
    let nextDir = { x: 0, y: 1 };
    let moveTimer = 0;
    let rivalTimer = 0;
    let rivalWait = 0;
    let grow = 0;
    let rivalGrow = 0;
    let eaten = 0;
    let bfsMs = 0;
    let segBatch, pathBatch;

    const blocked = new Uint8Array(COLS * ROWS);
    const prev = new Int16Array(COLS * ROWS);
    const queue = new Int16Array(COLS * ROWS);

    const wx = (c) => (c - COLS / 2 + 0.5) * CELL;
    const wy = (r) => (r - ROWS / 2 + 0.5) * CELL;
    const inBoard = (c, r) => c >= 0 && c < COLS && r >= 0 && r < ROWS;
    const on = (snake, c, r, from = 0) => snake.some((s, i) => i >= from && s.c === c && s.r === r);

    // Speeds up as it grows, which is what makes Snake a game and not a chore.
    function interval() {
        return Math.max(0.085, BASE_INTERVAL - (me.length - 3) * 0.004 - (difficulty() - 1) * 0.02);
    }
    function rivalInterval() {
        return Math.max(0.1, 0.27 - eaten * 0.018) / Math.sqrt(difficulty());
    }

    function makeSnake(c, r, len, dc, dr) {
        return Array.from({ length: len }, (_, i) => {
            const sc = c - dc * i, sr = r - dr * i;
            return { c: sc, r: sr, x: wx(sc), y: wy(sr) };
        });
    }

    function spawnRival() {
        // Start in whichever top corner is farther from the player.
        const c = me[0].c < COLS / 2 ? COLS - 3 : 2;
        rival = makeSnake(c, ROWS - 4, 4, 0, -1);
        rivalPath = [];
        rivalGrow = 0;
        rivalTimer = 0;
        rivalWait = 1.2;
    }

    function resetSnakes() {
        me = makeSnake(Math.floor(COLS / 2), 3, 3, 0, 1);
        dir = { x: 0, y: 1 };
        nextDir = { x: 0, y: 1 };
        moveTimer = 0;
        grow = 0;
        if (isBoss) spawnRival();
    }

    function placeFood() {
        let attempts = 0;
        do {
            foodC = Math.floor(Math.random() * COLS);
            foodR = Math.floor(Math.random() * ROWS);
            attempts++;
        } while (attempts < 150 && (on(me, foodC, foodR) || on(rival, foodC, foodR)));
        food.position.set(wx(foodC), wy(foodR), SEG_Z);
        gsap.fromTo(food.scale, { x: 0.2, y: 0.2, z: 0.2 }, { x: 1, y: 1, z: 1, duration: 0.28, ease: 'back.out(2.5)', overwrite: true });
    }

    // Every segment takes the cell of the one ahead; positions glide there.
    function advance(snake, c, r, growing) {
        const tail = snake[snake.length - 1];
        const tc = tail.c, tr = tail.r;
        for (let i = snake.length - 1; i > 0; i--) {
            snake[i].c = snake[i - 1].c;
            snake[i].r = snake[i - 1].r;
        }
        snake[0].c = c;
        snake[0].r = r;
        if (growing) snake.push({ c: tc, r: tr, x: wx(tc), y: wy(tr) });
    }

    function bfs(from, to) {
        blocked.fill(0);
        // The rival's own tail moves out of the way this step, so it's free.
        for (let i = 0; i < rival.length - 1; i++) blocked[rival[i].r * COLS + rival[i].c] = 1;
        const start = from.r * COLS + from.c;
        const goal = to.r * COLS + to.c;
        if (goal === start || blocked[goal]) return null;
        prev.fill(-1);
        prev[start] = start;
        let head = 0, tail = 0;
        queue[tail++] = start;
        while (head < tail) {
            const cur = queue[head++];
            if (cur === goal) break;
            const c = cur % COLS, r = (cur / COLS) | 0;
            for (const [dc, dr] of DIRS) {
                const nc = c + dc, nr = r + dr;
                if (!inBoard(nc, nr)) continue;
                const ni = nr * COLS + nc;
                if (blocked[ni] || prev[ni] !== -1) continue;
                prev[ni] = cur;
                queue[tail++] = ni;
            }
        }
        if (prev[goal] === -1) return null;
        const path = [];
        for (let cur = goal; cur !== start; cur = prev[cur]) path.push({ c: cur % COLS, r: (cur / COLS) | 0 });
        return path.reverse();
    }

    function hitAndReset(x, y) {
        hurt(x, y);
        resetSnakes();
        placeFood();
    }

    function rivalStep() {
        const head = rival[0];
        const aheadC = THREE.MathUtils.clamp(me[0].c + dir.x * 2, 0, COLS - 1);
        const aheadR = THREE.MathUtils.clamp(me[0].r + dir.y * 2, 0, ROWS - 1);
        const t0 = performance.now();
        const path = bfs(head, { c: aheadC, r: aheadR }) || bfs(head, me[0]);
        bfsMs = performance.now() - t0;
        rivalPath = path || [];

        let next = path && path[0];
        if (!next) {
            next = DIRS.map(([dc, dr]) => ({ c: head.c + dc, r: head.r + dr }))
                .find(n => inBoard(n.c, n.r) && !on(rival, n.c, n.r));
        }
        if (!next) {
            // Boxed itself in: it breaks apart and comes back from a corner.
            rival.forEach(s => burst(s.x, s.y, C_THREAT, 3, 4));
            spawnRival();
            return;
        }
        if (on(me, next.c, next.r)) { hitAndReset(wx(next.c), wy(next.r)); return; }

        // It competes for the same food: a stolen node makes it longer.
        if (next.c === foodC && next.r === foodR) {
            rivalGrow++;
            burst(wx(foodC), wy(foodR), C_THREAT, 8, 4);
            placeFood();
        }
        advance(rival, next.c, next.r, rivalGrow > 0);
        if (rivalGrow > 0) rivalGrow--;
    }

    function win() {
        const doomed = rival;
        rival = [];
        rivalPath = [];
        doomed.forEach((s, i) => gsap.delayedCall(REDUCED_MOTION ? 0 : i * 0.05, () => burst(s.x, s.y, C_THREAT, 8, 6)));
        shake(0.6);
        freeze(0.15);
        ripple(wx(me[0].c), wy(me[0].r), 2.2);
        addScore(Math.round(300 * difficulty()), wx(me[0].c), wy(me[0].r), C_ACCENT);
        stageClear();
        render();
    }

    function render() {
        segBatch.begin();
        me.forEach((s, i) => segBatch.push(s.x, s.y, SEG_Z, 1, 0, 0, 0, i === 0 ? C_PLAYER : 0x9aa1a9));
        rival.forEach((s, i) => segBatch.push(s.x, s.y, SEG_Z, i === 0 ? 1.08 : 0.94, 0, 0, 0, i === 0 ? C_THREAT : 0x8a4d49));
        segBatch.end();
        if (pathBatch) {
            pathBatch.begin();
            rivalPath.forEach(p => pathBatch.push(wx(p.c), wy(p.r), PLATE_Z + 0.02));
            pathBatch.end();
        }
    }

    return {
        control: 'swipe',
        duration: isBoss ? undefined : ROUND_TIME,
        enter() {
            buildBoard(COLS, ROWS, CELL);
            segBatch = makeBatch(new THREE.BoxGeometry(CELL * 0.82, CELL * 0.82, CELL * 0.82), new THREE.MeshStandardMaterial({ roughness: 0.6, flatShading: true }), COLS * ROWS, true);
            if (isBoss) {
                pathBatch = makeBatch(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshBasicMaterial({ color: C_THREAT, transparent: true, opacity: 0.35, depthWrite: false }), COLS * ROWS);
                pathBatch.mesh.castShadow = false;
            }
            food = new THREE.Mesh(
                new THREE.OctahedronGeometry(CELL * 0.36, 0),
                new THREE.MeshStandardMaterial({ color: C_ACCENT, roughness: 0.4, flatShading: true })
            );
            addModeMesh(food);
            resetSnakes();
            placeFood();
        },
        update(dt, input) {
            for (const t of input.taps) {
                if (t.x !== 0 && dir.x === 0) { nextDir = { x: t.x, y: 0 }; break; }
                if (t.y !== 0 && dir.y === 0) { nextDir = { x: 0, y: t.y }; break; }
            }

            food.rotation.y += dt * 2;
            food.rotation.x += dt * 1.2;
            food.position.z = SEG_Z + 0.25 + Math.sin(elapsed * 3) * 0.15;

            const k = Math.min(1, dt * 22);
            [me, rival].forEach(snake => snake.forEach(s => {
                s.x += (wx(s.c) - s.x) * k;
                s.y += (wy(s.r) - s.y) * k;
            }));
            if (isBoss) setObjective(tx().nodes(eaten, GOAL), eaten / GOAL, true);

            if (isBoss && rival.length) {
                if (rivalWait > 0) rivalWait -= dt;
                else if ((rivalTimer -= dt) <= 0) {
                    rivalTimer = rivalInterval();
                    rivalStep();
                }
            }

            moveTimer -= dt;
            if (moveTimer <= 0) {
                moveTimer = interval();
                dir = nextDir;
                const head = me[0];
                const nc = head.c + dir.x;
                const nr = head.r + dir.y;
                if (!inBoard(nc, nr) || on(me, nc, nr, 1) || on(rival, nc, nr)) {
                    // Always reset — hurt() decides whether it costs a life.
                    // Bailing out on an invulnerable hit froze the snake.
                    hitAndReset(wx(THREE.MathUtils.clamp(nc, 0, COLS - 1)), wy(THREE.MathUtils.clamp(nr, 0, ROWS - 1)));
                } else {
                    const ate = nc === foodC && nr === foodR;
                    if (ate) grow++;
                    advance(me, nc, nr, grow > 0);
                    if (grow > 0) grow--;
                    if (ate) {
                        addScore(Math.round(18 * difficulty()), wx(nc), wy(nr), C_ACCENT);
                        freeze(0.03);
                        placeFood();
                        if (isBoss && ++eaten >= GOAL) { win(); return; }
                    }
                }
            }
            render();
        },
        bar() { return 1 - eaten / GOAL; },
        stats() {
            const rows = [['Segments', `${segBatch.count} · 1 call`]];
            if (isBoss) rows.push(['Rival AI', `BFS · ${rivalPath.length} cells · ${bfsMs.toFixed(2)} ms`]);
            return rows;
        },
        exit() { me = []; rival = []; food = null; }
    };
}

// ==========================================================================
// Stage registry
// ==========================================================================
const STAGES = [
    { key: 'shooter', build: ShooterMode },
    { key: 'shooterBoss', build: ShooterBoss, boss: true },
    { key: 'crossy', build: () => CrossyMode(false) },
    { key: 'crossyBoss', build: () => CrossyMode(true), boss: true },
    { key: 'snake', build: () => SnakeMode(false) },
    { key: 'snakeBoss', build: () => SnakeMode(true), boss: true }
];
const BOSS_COUNT = STAGES.filter(s => s.boss).length;

function stageCopy(idx) {
    const m = tx().modes[STAGES[idx].key];
    return { name: m.name, hint: IS_TOUCH ? m.hintTouch : m.hintKeys };
}

// ==========================================================================
// Stage lifecycle
// ==========================================================================
function clearMode() {
    if (currentMode && currentMode.exit) currentMode.exit();
    if (modeGroup) {
        disposeGroup(modeGroup);
        modeGroup = null;
    }
    currentMode = null;
}

function switchStage(idx) {
    clearMode();
    clearParticles();
    groundZ = FLOOR_Z;
    stageIdx = idx;
    round = idx + 1;
    stageDone = false;
    timeScale = 1;
    setObjective(null);
    modeGroup = new THREE.Group();
    scene.add(modeGroup);
    currentMode = STAGES[idx].build();
    currentMode.enter();
    roundTime = 0;
    tapQueue.length = 0;
    fireQueued = false;

    const copy = stageCopy(idx);
    if (modeLabelEl) {
        modeLabelEl.textContent = copy.name;
        modeLabelEl.classList.toggle('is-boss', !!STAGES[idx].boss);
    }
    if (roundEl) roundEl.textContent = tx().stageLabel(round, STAGES.length);
    showModeHint(copy.hint);
}

// Bosses call this when beaten. The world slows for a beat, then moves on.
function stageClear() {
    if (stageDone) return;
    stageDone = true;
    bossesDown++;
    timeScale = 0.4;
    showModeHint(tx().bossDown);
    chime([392, 523.25]);
    transitionCall?.kill();
    transitionCall = gsap.delayedCall(REDUCED_MOTION ? 0.3 : 1.6, () => {
        transitionCall = null;
        advanceStage();
    });
}

function advanceStage() {
    if (gameState !== 'playing') return;
    if (stageIdx + 1 >= STAGES.length) finale(true);
    else startTransition(stageIdx + 1);
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

// A "next up" card between stages; bosses get their own label.
function startTransition(nextIdx) {
    if (isTransitioning) return;
    isTransitioning = true;
    gameState = 'transition';
    tapQueue.length = 0;

    const copy = stageCopy(nextIdx);
    const isBoss = !!STAGES[nextIdx].boss;
    if (nextUpLabelEl) {
        nextUpLabelEl.textContent = isBoss ? tx().bossIncoming : tx().nextUp;
        nextUpLabelEl.classList.toggle('is-boss', isBoss);
    }
    if (nextUpNameEl) nextUpNameEl.textContent = copy.name;
    if (nextUpHintEl) nextUpHintEl.textContent = copy.hint;

    const finish = () => {
        transitionCall = null;
        if (!scene || gameState !== 'transition') return;
        switchStage(nextIdx);
        updateHUD();
        gsap.to([transitionEl, nextUpEl], {
            opacity: 0, duration: REDUCED_MOTION ? 0 : 0.3, ease: 'power2.out',
            onComplete: () => {
                if (transitionEl) transitionEl.style.display = 'none';
                if (nextUpEl) nextUpEl.style.display = 'none';
                tapQueue.length = 0;
                if (gameState === 'transition') gameState = 'playing';
                isTransitioning = false;
                lastTime = performance.now() / 1000;
            }
        });
    };

    if (!transitionEl || !nextUpEl) { finish(); return; }

    transitionEl.style.display = 'block';
    nextUpEl.style.display = 'flex';
    gsap.fromTo([transitionEl, nextUpEl], { opacity: 0 }, {
        opacity: 1, duration: REDUCED_MOTION ? 0 : 0.28, ease: 'power2.in',
        onComplete: () => {
            transitionCall?.kill();
            transitionCall = gsap.delayedCall(REDUCED_MOTION ? 0 : (isBoss ? 1.2 : 0.85), finish);
        }
    });
}

// ==========================================================================
// Finale
//
// 1. The last frame is captured for the card's artwork.
// 2. Everything on the field breaks into physics cubes, from the centre out.
// 3. The camera cranes overhead while the floor ripples.
// 4. A result card rises off the floor and flips face-up — the shelf's own
//    flip — then leans toward the pointer the way shelf cards do on hover.
// ==========================================================================
let finaleGroup = null;
let finaleCard = null;
let finaleTl = null;
let finaleReady = false;
let shatterQueue = [];
let shatterClock = 0;

function collectShatterPoints() {
    const pts = [];
    if (!modeGroup) return pts;
    modeGroup.updateMatrixWorld(true);
    modeGroup.traverseVisible(o => {
        if (!o.isMesh || !o.material || !o.material.color) return;
        const base = o.material.color;
        if (o.isInstancedMesh) {
            for (let i = 0; i < o.count; i++) {
                o.getMatrixAt(i, tmpM4);
                tmpM4.premultiply(o.matrixWorld);
                tmpV.setFromMatrixPosition(tmpM4);
                if (o.instanceColor) { o.getColorAt(i, tmpColor); tmpColor.multiply(base); }
                else tmpColor.copy(base);
                pts.push({ x: tmpV.x, y: tmpV.y, z: tmpV.z, color: tmpColor.getHex() });
            }
            return;
        }
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        tmpBox.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
        const color = base.getHex();
        const w = tmpBox.max.x - tmpBox.min.x;
        const h = tmpBox.max.y - tmpBox.min.y;
        if (w > 2.5 || h > 2.5) {
            // Big slabs break into many pieces rather than one.
            const step = Math.max(1.2, Math.sqrt(w * h / 60));
            for (let x = tmpBox.min.x + step / 2; x < tmpBox.max.x; x += step) {
                for (let y = tmpBox.min.y + step / 2; y < tmpBox.max.y; y += step) {
                    pts.push({ x, y, z: tmpBox.max.z, color });
                }
            }
        } else {
            tmpBox.getCenter(tmpV);
            pts.push({ x: tmpV.x, y: tmpV.y, z: tmpV.z, color });
        }
    });
    // Nearest the centre goes first, so the dissolve travels outward as a wave.
    pts.forEach(p => { p.d = Math.hypot(p.x, p.y); });
    pts.sort((a, b) => a.d - b.d);
    const stride = Math.ceil(pts.length / 380) || 1;
    const kept = pts.filter((_, i) => i % stride === 0);
    const maxD = (kept.length && kept[kept.length - 1].d) || 1;
    kept.forEach(p => { p.delay = (p.d / maxD) * 0.9; });
    return kept;
}

function snapshotFrame() {
    const c = document.createElement('canvas');
    c.width = 640;
    c.height = 442;
    const src = renderer.domElement;
    const aspect = c.width / c.height;
    let sw = src.width, sh = sw / aspect;
    if (sh > src.height) { sh = src.height; sw = sh * aspect; }
    c.getContext('2d').drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, 0, 0, c.width, c.height);
    return c;
}

function finale(victory) {
    if (gameState === 'finale' || gameState === 'over' || !scene) return;
    gameState = 'finale';
    stageDone = true;
    finaleReady = false;
    timeScale = 1;
    transitionCall?.kill();
    transitionCall = null;
    isTransitioning = false;
    if (transitionEl) transitionEl.style.display = 'none';
    if (nextUpEl) nextUpEl.style.display = 'none';

    const isBest = score > best;
    if (isBest) {
        best = score;
        storageSet('krost-high-score', String(best));
    }
    updateHUD();
    setObjective(null);

    // Read the WebGL canvas straight after a render, while the frame is still there.
    renderer.render(scene, camera);
    const art = snapshotFrame();

    shatterQueue = collectShatterPoints();
    shatterClock = 0;
    if (modeGroup) modeGroup.visible = false;
    groundZ = FLOOR_Z;
    ripple(0, 0, 2.6);
    shake(0.35);
    chime(victory ? [392, 493.88, 587.33, 783.99] : [392, 329.63, 261.63]);

    gsap.to(cam, { tilt: FINALE_TILT, zoom: 1.08, duration: REDUCED_MOTION ? 0 : 2.4, ease: 'power2.inOut' });
    transitionCall = gsap.delayedCall(REDUCED_MOTION ? 0 : 1.0, () => {
        transitionCall = null;
        showResultCard(victory, isBest, art);
    });
}

function updateFinale(dt) {
    shatterClock += dt;
    while (shatterQueue.length && shatterQueue[0].delay <= shatterClock) {
        const p = shatterQueue.shift();
        if (REDUCED_MOTION) continue;
        const a = Math.atan2(p.y, p.x);
        const out = 1 + Math.random() * 2.5;
        spark(p.x, p.y, p.z, Math.cos(a) * out, Math.sin(a) * out, 4 + Math.random() * 5,
            1.6 + Math.random() * 1.2, 1 + Math.random() * 0.9, p.color);
    }
    if (finaleCard && finaleReady) {
        const px = pointerActive ? pointer.x : 0;
        const py = pointerActive ? pointer.y : 0;
        const k = Math.min(1, dt * 4);
        finaleCard.rotation.y += (px * 0.22 - finaleCard.rotation.y) * k;
        finaleCard.rotation.x += (-py * 0.16 - finaleCard.rotation.x) * k;
        finaleCard.position.z = 1.2 + Math.sin(performance.now() * 0.0014) * 0.08;
    }
}

function cardCanvas() {
    const c = document.createElement('canvas');
    c.width = 640;
    c.height = 960;
    return c;
}

function roundedPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// Same finishing pass as the shelf cards: vignette, raking sheen, double edge.
function finishCardFace(ctx) {
    const vignette = ctx.createRadialGradient(320, 422, 166, 320, 480, 710);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(0.62, 'rgba(0,0,0,0.11)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.36)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 640, 960);
    const sheen = ctx.createLinearGradient(0, 0, 480, 576);
    sheen.addColorStop(0, 'rgba(255,255,255,0.075)');
    sheen.addColorStop(0.38, 'rgba(255,255,255,0.012)');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, 640, 960);
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 4;
    roundedPath(ctx, 2, 2, 636, 956, 26);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.13)';
    ctx.lineWidth = 1.5;
    roundedPath(ctx, 5.5, 5.5, 629, 949, 23);
    ctx.stroke();
}

function drawResultFront(victory, isBest, art) {
    const c = cardCanvas();
    const ctx = c.getContext('2d');
    const s = tx();
    const hue = victory ? 28 : 4;
    const mark = victory ? '#c08a5a' : '#c4605a';
    const artBottom = 442;

    const plate = ctx.createLinearGradient(0, artBottom - 60, 0, 960);
    plate.addColorStop(0, `hsl(${hue} 42% 21%)`);
    plate.addColorStop(1, `hsl(${hue} 30% 7%)`);
    ctx.fillStyle = plate;
    ctx.fillRect(0, 0, 640, 960);
    if (art) ctx.drawImage(art, 0, 0, 640, artBottom);
    const fade = ctx.createLinearGradient(0, artBottom - 130, 0, artBottom);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(1, `hsl(${hue} 42% 21%)`);
    ctx.fillStyle = fade;
    ctx.fillRect(0, artBottom - 130, 640, 130);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = mark;
    ctx.fillRect(44, artBottom + 40, 34, 3);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '500 21px "JetBrains Mono", monospace';
    ctx.fillText(`KROST ARCADE · ${new Date().getFullYear()}`, 44, artBottom + 100);

    if (isBest) {
        const label = s.newBest.toUpperCase();
        ctx.font = '600 17px "JetBrains Mono", monospace';
        const w = ctx.measureText(label).width + 28;
        ctx.fillStyle = mark;
        roundedPath(ctx, 596 - w, artBottom + 74, w, 36, 6);
        ctx.fill();
        ctx.fillStyle = 'rgba(12,14,17,0.92)';
        ctx.fillText(label, 610 - w, artBottom + 98);
    }

    ctx.fillStyle = '#e8e6e3';
    ctx.font = '600 52px "Space Grotesk", sans-serif';
    ctx.fillText(victory ? s.runComplete : s.gameOver, 44, artBottom + 162);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '400 24px "Space Grotesk", sans-serif';
    ctx.fillText(victory ? s.victorySub : s.defeatSub(round, STAGES.length), 44, artBottom + 204);

    const cells = [
        [s.scoreLabel, String(score)],
        [s.bestLabel, String(best)],
        [s.bossesLabel, `${bossesDown}/${BOSS_COUNT}`],
        [s.comboLabel, `x${bestMult.toFixed(1)}`]
    ];
    cells.forEach(([label, value], i) => {
        const x = 44 + (i % 2) * 296;
        const y = artBottom + 270 + Math.floor(i / 2) * 90;
        ctx.fillStyle = 'rgba(255,255,255,0.42)';
        ctx.font = '500 17px "JetBrains Mono", monospace';
        ctx.fillText(label.toUpperCase(), x, y);
        ctx.fillStyle = '#e8e6e3';
        ctx.font = '600 38px "Space Grotesk", sans-serif';
        ctx.fillText(value, x, y + 42);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(44, 880, 552, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.font = '500 18px "JetBrains Mono", monospace';
    ctx.fillText('EDUARDO MOGOLLÓN · THREE.JS', 44, 918);

    finishCardFace(ctx);
    return c;
}

function drawResultBack(victory) {
    const c = cardCanvas();
    const ctx = c.getContext('2d');
    const hue = victory ? 28 : 4;
    ctx.fillStyle = `hsl(${hue} 22% 8%)`;
    ctx.fillRect(0, 0, 640, 960);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    roundedPath(ctx, 22, 22, 596, 916, 14);
    ctx.stroke();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 460px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('K', 320, 440);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '500 22px "JetBrains Mono", monospace';
    ctx.fillText('KROST ARCADE', 320, 800);
    finishCardFace(ctx);
    return c;
}

function cardMask(stroke) {
    const c = cardCanvas();
    const ctx = c.getContext('2d');
    if (stroke) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 7;
        roundedPath(ctx, 4, 4, 632, 952, 26);
        ctx.stroke();
    } else {
        ctx.fillStyle = '#fff';
        roundedPath(ctx, 0, 0, 640, 960, 26);
        ctx.fill();
    }
    return new THREE.CanvasTexture(c);
}

function showResultCard(victory, isBest, art) {
    if (!scene) return;
    finaleGroup = new THREE.Group();
    scene.add(finaleGroup);

    const cardW = Math.min(GAME_WIDTH * 0.5, gameHeight * 0.64 / 1.5);
    const geo = new THREE.PlaneGeometry(cardW, cardW * 1.5);
    const face = (canvas) => {
        const map = new THREE.CanvasTexture(canvas);
        map.colorSpace = THREE.SRGBColorSpace;
        map.anisotropy = renderer.capabilities.getMaxAnisotropy();
        return new THREE.MeshStandardMaterial({ map, alphaMap: cardMask(false), transparent: true, alphaTest: 0.5, roughness: 0.5, metalness: 0.02 });
    };

    finaleCard = new THREE.Group();
    const front = new THREE.Mesh(geo, face(drawResultFront(victory, isBest, art)));
    const back = new THREE.Mesh(geo, face(drawResultBack(victory)));
    back.rotation.y = Math.PI;
    back.position.z = -0.02;
    const frame = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        map: cardMask(true), color: victory ? C_ACCENT : C_THREAT, transparent: true, opacity: 0.85, depthWrite: false
    }));
    frame.scale.set(1.035, 1.024, 1);
    frame.position.z = 0.012;
    front.castShadow = back.castShadow = true;
    finaleCard.add(front, back, frame);

    // Tilted to face the craned camera, lifted to leave room for the buttons.
    const holder = new THREE.Group();
    holder.rotation.x = FINALE_TILT;
    holder.position.y = gameHeight * 0.06;
    holder.add(finaleCard);
    finaleGroup.add(holder);

    finaleCard.position.z = FLOOR_Z + 0.05;
    finaleCard.rotation.y = Math.PI;
    finaleCard.scale.setScalar(0.7);

    finaleTl = gsap.timeline({
        onComplete: () => {
            finaleTl = null;
            finaleReady = true;
            gameState = 'over';
            showGameOver(isBest);
        }
    });
    finaleTl
        .to(finaleCard.position, { z: 1.2, duration: 0.8, ease: 'power3.out' }, 0)
        .to(finaleCard.scale, { x: 1, y: 1, z: 1, duration: 0.8, ease: 'power3.out' }, 0)
        .to(finaleCard.rotation, {
            y: 0, duration: 1.0, ease: 'power3.inOut',
            onStart: () => sfxTone({ from: 720, to: 420, gain: 0.045, duration: 0.14 })
        }, 0.2)
        .add(() => ripple(0, holder.position.y, 1.2), 0.9);
    if (REDUCED_MOTION) finaleTl.progress(1);
}

function clearFinale() {
    finaleTl?.kill();
    finaleTl = null;
    gsap.killTweensOf(cam);
    cam.tilt = TILT;
    cam.zoom = 1;
    disposeGroup(finaleGroup);
    finaleGroup = null;
    finaleCard = null;
    finaleReady = false;
    shatterQueue = [];
}

// ==========================================================================
// Run lifecycle
// ==========================================================================
export function startGame() {
    if (animFrameId !== null || scene) return;
    gameScreenEl = document.getElementById('game-screen');
    if (!gameScreenEl) return;

    gameOpener = document.activeElement;
    lang = document.documentElement.lang === 'es' ? 'es' : 'en';
    best = parseInt(storageGet('krost-high-score', '0'), 10) || 0;

    gameScreenEl.style.display = 'block';
    gameScreenEl.style.opacity = '1';
    document.body.classList.add('game-active');

    hudScoreEl = document.getElementById('game-hud-score');
    hudBestEl = document.getElementById('game-hud-high');
    hudLivesEl = document.getElementById('game-hud-lives');
    roundEl = document.getElementById('game-round');
    comboEl = document.getElementById('game-combo');
    comboMultEl = document.getElementById('game-combo-mult');
    comboBarEl = document.querySelector('#game-combo-bar span');
    objectiveEl = document.getElementById('game-objective');
    objectiveTextEl = document.getElementById('game-objective-text');
    objectiveBarEl = document.querySelector('#game-objective-bar span');
    statsEl = document.getElementById('game-stats');
    statsBtnEl = document.getElementById('game-stats-btn');
    pauseOverlayEl = document.getElementById('game-pause');
    overOverlayEl = document.getElementById('game-over');
    modeLabelEl = document.getElementById('game-mode-label');
    modeBarEl = document.getElementById('game-mode-bar');
    modeHintEl = document.getElementById('game-mode-hint');
    nextUpEl = document.getElementById('game-nextup');
    nextUpLabelEl = document.getElementById('game-nextup-label');
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
    document.getElementById('game-pause-btn')?.focus();
    lastTime = performance.now() / 1000;
    animFrameId = requestAnimationFrame(gameLoop);
}

function resetRun() {
    transitionCall?.kill();
    transitionCall = null;
    clearFinale();
    score = 0;
    lives = START_LIVES;
    bossesDown = 0;
    combo = 0;
    comboTimer = 0;
    bestMult = 1;
    invuln = 0;
    hitStop = 0;
    shakeAmount = 0;
    isTransitioning = false;
    clearParticles();
    hidePause();
    hideGameOver();
    gameState = 'playing';
    switchStage(0);
    renderLives();
    updateHUD();
}

export function restartGame() {
    if (!scene) return;
    resetRun();
    lastTime = performance.now() / 1000;
}

export function stopGame() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = null;
    transitionCall?.kill();
    transitionCall = null;
    clearTimeout(showModeHint._timer);
    gsap.killTweensOf([transitionEl, nextUpEl, gameScreenEl].filter(Boolean));
    isTransitioning = false;
    gameState = 'over';

    unbindInput();
    clearFinale();
    clearMode();
    disposeGroup(bgGroup);
    bgGroup = null;
    floorMat = null;
    disposeGroup(particleGroup);
    particleGroup = null;
    particleMesh = null;
    pState.length = 0;
    gameScreenEl?.querySelectorAll('.game-pop').forEach(el => el.remove());

    if (renderer) { renderer.dispose(); renderer = null; }
    scene = null;
    camera = null;
    keyLight = null;

    hidePause();
    hideGameOver();
    setObjective(null);
    if (transitionEl) transitionEl.style.display = 'none';
    if (nextUpEl) nextUpEl.style.display = 'none';
    if (gameScreenEl) gameScreenEl.style.display = 'none';
    document.body.classList.remove('game-active');
    if (gameOpener?.isConnected) gameOpener.focus();
    gameOpener = null;
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
    transitionCall?.kill();
    transitionCall = null;
    finaleTl?.kill();
    finaleTl = null;
    gsap.killTweensOf([transitionEl, nextUpEl].filter(Boolean));
    isTransitioning = false;
    if (score > best) {
        best = score;
        storageSet('krost-high-score', String(best));
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
    const rawDt = now - lastTime;
    const dt = Math.min(rawDt, 0.05);
    lastTime = now;

    let simDt = dt * timeScale;
    if (hitStop > 0) {
        hitStop -= dt;
        simDt *= 0.06;
    }

    if (gameState === 'playing') update(simDt);
    if (gameState === 'finale' || gameState === 'over') updateFinale(dt);
    if (gameState !== 'paused') {
        elapsed += simDt;
        updateParticles(simDt);
        updateBackground(dt);
    }

    if (camera) {
        placeCamera(cam.dist * cam.zoom);
        // Shake only slides the camera sideways; the rig owns the rest.
        if (shakeAmount > 0.001) {
            camera.position.x += (Math.random() - 0.5) * shakeAmount;
            shakeAmount *= 0.86;
        } else {
            shakeAmount = 0;
        }
    }

    if (renderer && scene && camera) renderer.render(scene, camera);
    updateStats(rawDt);
}

function update(dt) {
    if (!currentMode) return;

    if (invuln > 0) invuln -= dt;
    if (comboTimer > 0) {
        comboTimer -= dt;
        if (comboTimer <= 0) combo = 0;
    }

    roundTime += dt;
    const duration = currentMode.duration;
    const fraction = duration
        ? Math.max(0, 1 - roundTime / duration)
        : (currentMode.bar ? currentMode.bar() : 1);
    if (modeBarEl) {
        modeBarEl.style.width = `${THREE.MathUtils.clamp(fraction, 0, 1) * 100}%`;
        modeBarEl.classList.toggle('is-ending', !!duration && duration - roundTime <= 3);
    }

    if (duration && roundTime >= duration && !stageDone) {
        stageDone = true;
        advanceStage();
        return;
    }

    // A beaten boss holds its last frame in slow motion until the next stage.
    if (!stageDone) currentMode.update(dt, getInput());
    tapQueue.length = 0;
    fireQueued = false;
    updateHUD();
}

// ==========================================================================
// Stats overlay — the numbers a profiler would show, live
// ==========================================================================
let statsOn = false;
let statsTimer = 0;
let frameAcc = 0;
let frameCount = 0;

function toggleStats() {
    statsOn = !statsOn;
    if (statsEl) statsEl.hidden = !statsOn;
    statsBtnEl?.setAttribute('aria-pressed', String(statsOn));
    statsTimer = frameAcc = frameCount = 0;
}

function updateStats(dt) {
    if (!statsOn || !statsEl || !renderer) return;
    frameAcc += dt;
    frameCount++;
    statsTimer += dt;
    if (statsTimer < 0.25) return;
    const info = renderer.info;
    const inStage = currentMode?.stats && (gameState === 'playing' || gameState === 'paused');
    const rows = [
        ['FPS', String(Math.round(frameCount / frameAcc))],
        ['Frame', `${(frameAcc / frameCount * 1000).toFixed(1)} ms`],
        ['Draw calls', String(info.render.calls)],
        ['Triangles', info.render.triangles.toLocaleString('en')],
        ['Geometries', String(info.memory.geometries)],
        ['Particles', `${liveParticles}/${PARTICLE_COUNT} · 1 call`],
        ['Stage', `${round}/${STAGES.length} · ${STAGES[stageIdx].key}`],
        ...(inStage ? currentMode.stats() : []),
        ['Shadows', `PCF soft · ${SHADOW_SIZE}²`],
        ['Hit-stop', hitStop > 0 ? 'on' : '—']
    ];
    statsEl.textContent = rows.map(([k, v]) => k.padEnd(12) + v).join('\n');
    statsTimer = frameAcc = frameCount = 0;
}

// ==========================================================================
// HUD & overlays
// ==========================================================================
function updateHUD() {
    if (hudScoreEl) hudScoreEl.textContent = String(score).padStart(5, '0');
    if (hudBestEl) hudBestEl.textContent = `${tx().bestLabel.toUpperCase()} ${String(Math.max(best, score)).padStart(5, '0')}`;
    if (comboEl) {
        const mult = multiplier();
        comboEl.classList.toggle('is-live', mult > 1);
        comboMultEl.textContent = `x${mult.toFixed(1)}`;
        if (comboBarEl) comboBarEl.style.transform = `scaleX(${Math.max(0, comboTimer / COMBO_WINDOW)})`;
    }
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
    gsap.fromTo(pauseOverlayEl, { opacity: 0 }, { opacity: 1, duration: REDUCED_MOTION ? 0 : 0.25 });
    document.getElementById('game-resume-btn')?.focus();
}
function hidePause() {
    if (!pauseOverlayEl) return;
    const restoreFocus = pauseOverlayEl.contains(document.activeElement);
    pauseOverlayEl.style.display = 'none';
    if (restoreFocus) document.getElementById('game-pause-btn')?.focus();
}

// The visible result is the 3D card; this overlay carries the actions and the
// same numbers for screen readers.
function showGameOver(isBest) {
    if (!overOverlayEl) return;
    const s = tx();
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set('game-over-title', bossesDown >= BOSS_COUNT ? s.runComplete : s.gameOver);
    set('game-over-score', String(score));
    set('game-over-best', String(best));
    set('game-over-note', isBest ? s.newBest : s.note(round, bestMult.toFixed(1)));
    overOverlayEl.style.display = 'flex';
    gsap.fromTo(overOverlayEl, { opacity: 0 }, { opacity: 1, duration: REDUCED_MOTION ? 0 : 0.4 });
    gsap.fromTo(overOverlayEl.querySelector('.game-panel'),
        { y: REDUCED_MOTION ? 0 : 14 },
        { y: 0, duration: REDUCED_MOTION ? 0 : 0.4, ease: 'power3.out' });
    document.getElementById('game-retry-btn')?.focus();
}
function hideGameOver() {
    if (!overOverlayEl) return;
    const restoreFocus = overOverlayEl.contains(document.activeElement);
    overOverlayEl.style.display = 'none';
    if (restoreFocus) document.getElementById('game-pause-btn')?.focus();
}

// ==========================================================================
// Input binding
// ==========================================================================
function bindInput() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);
    window.addEventListener('blur', onVisibilityLost);
    document.addEventListener('visibilitychange', onVisibilityChange);
    gameCanvas.addEventListener('pointermove', onPointerMove);
    gameCanvas.addEventListener('pointerdown', onPointerDown);
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
    window.removeEventListener('blur', onVisibilityLost);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (gameCanvas) {
        gameCanvas.removeEventListener('pointermove', onPointerMove);
        gameCanvas.removeEventListener('pointerdown', onPointerDown);
        gameCanvas.removeEventListener('pointerleave', onPointerLeave);
        gameCanvas.removeEventListener('touchstart', onTouchStart);
        gameCanvas.removeEventListener('touchmove', onTouchMove);
        gameCanvas.removeEventListener('touchend', onTouchEnd);
        gameCanvas.removeEventListener('touchcancel', onTouchEnd);
    }
    // A key held while exiting would otherwise stay "down" for the next run.
    clearInputState();
}

window.KrostGame = { startGame, stopGame, pauseGame, restartGame, exitToPortfolio, toggleStats };
