import * as THREE from 'three';
import gsap from 'gsap';

// ==========================================
// KROST ARCADE — Multi-genre mini-game engine
// ==========================================

const GAME_WIDTH = 20;
let gameHeight = 12;
const MODE_DURATION = 15;
const COUNTDOWN_AT = 12;

let scene, camera, renderer, gameCanvas;
let gameScreenEl;
let animFrameId = null;

// Shared game state
let score = 0, highScore = 0;
let gameState = 'menu'; // menu, playing, paused, transition
let lastTime = 0;
let modeTime = 0;
let countdownPhase = 0; // 0=none, 3,2,1
let currentModeIdx = 0;
let currentMode = null;
let modeGroup = null; // THREE.Group for current mode meshes
let bgTextGroup = null;
let isTransitioning = false;

// DOM refs
let hudScoreEl, hudHighEl;
let pauseOverlayEl;
let modeLabelEl, modeBarEl, modeHintEl;
let countdownEl, countdownTextEl;
let transitionEl;

// Input
const keyState = {};
let pointerX = 0, pointerY = 0; // normalized [-1,1]
let touchActive = false;
let tapQueue = []; // discrete direction presses for grid-based modes

// ==========================================
// Audio helpers
// ==========================================
function getAudio() {
    return window.KrostAudio || null;
}
function playExplosion() {
    const a = getAudio();
    if (a && a.playExplosionSound) a.playExplosionSound();
}
function playHit() {
    const a = getAudio();
    if (a && a.playHitSound) a.playHitSound();
}

// ==========================================
// Background text (shared across all modes)
// ==========================================
const BG_TEXTS = [
    'Eduardo Mogollón Salcedo',
    'Game Developer @ LSV-TECH S.A.S   2021 — 2026',
    'Mobile Game Developer @ Freelance   2019 — 2021',
    'VR Hotel Experience (Cartagena)',
    'AR Hotel Experience (Cartagena)',
    'VR Multiplayer — Guajira Corp',
    'Native TTS Editor Tool',
    'Audio Loop & Cut Tool',
    '360 Virtual Tours',
    'Mobile Game Prototypes'
];

function createBgText() {
    bgTextGroup = new THREE.Group();
    BG_TEXTS.forEach((text, i) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1024; canvas.height = 128;
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 48px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(168, 224, 99, 0.07)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(18, 2.25), mat);
        mesh.position.set((Math.random() - 0.5) * 8, gameHeight / 2 + 2 + i * 2.5, -4);
        mesh.userData.speed = 0.8 + Math.random() * 0.6;
        mesh.userData.initialY = mesh.position.y;
        bgTextGroup.add(mesh);
    });
    scene.add(bgTextGroup);
}

function updateBgText(dt) {
    if (!bgTextGroup) return;
    bgTextGroup.children.forEach(mesh => {
        mesh.position.y -= mesh.userData.speed * dt;
        if (mesh.position.y < -gameHeight / 2 - 3) {
            mesh.position.y = gameHeight / 2 + 2 + Math.random() * 4;
            mesh.position.x = (Math.random() - 0.5) * 8;
        }
    });
}

function removeBgText() {
    if (!bgTextGroup) return;
    bgTextGroup.children.forEach(mesh => {
        if (mesh.material.map) mesh.material.map.dispose();
        mesh.material.dispose();
        mesh.geometry.dispose();
    });
    scene.remove(bgTextGroup);
    bgTextGroup = null;
}

// ==========================================
// Engine helpers
// ==========================================
function initRenderer() {
    gameCanvas = document.getElementById('game-canvas');
    const rect = gameScreenEl.getBoundingClientRect();
    gameCanvas.width = rect.width * Math.min(window.devicePixelRatio, 2);
    gameCanvas.height = rect.height * Math.min(window.devicePixelRatio, 2);
    renderer = new THREE.WebGLRenderer({ canvas: gameCanvas, antialias: true, alpha: false });
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a0a, 1);
}

function initScene() {
    scene = new THREE.Scene();
    const aspect = gameCanvas.width / gameCanvas.height;
    gameHeight = GAME_WIDTH / aspect;
    camera = new THREE.OrthographicCamera(
        -GAME_WIDTH / 2, GAME_WIDTH / 2,
        gameHeight / 2, -gameHeight / 2,
        0.1, 100
    );
    camera.position.z = 10;
}

function addModeMesh(mesh) {
    if (modeGroup) modeGroup.add(mesh);
}

function clearMode() {
    if (currentMode && currentMode.exit) currentMode.exit();
    if (modeGroup) {
        while (modeGroup.children.length > 0) {
            const child = modeGroup.children[0];
            modeGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    if (child.material.map) child.material.map.dispose();
                    child.material.dispose();
                }
            }
        }
        scene.remove(modeGroup);
        modeGroup = null;
    }
    currentMode = null;
}

function switchMode(nextIdx) {
    clearMode();
    currentModeIdx = nextIdx;
    const def = ACTIVE_MODES[currentModeIdx];
    modeGroup = new THREE.Group();
    scene.add(modeGroup);
    currentMode = def.build();
    if (currentMode.enter) currentMode.enter();
    modeTime = 0;
    countdownPhase = 0;
    hideCountdown();
    if (modeLabelEl) modeLabelEl.textContent = def.name;
    showModeHint(def.hint);
}

function showModeHint(text) {
    if (!modeHintEl) return;
    modeHintEl.textContent = text;
    modeHintEl.style.opacity = '1';
    setTimeout(() => { if (modeHintEl) modeHintEl.style.opacity = '0'; }, 3500);
}

function showCountdown(n) {
    if (!countdownEl || !countdownTextEl) return;
    countdownEl.style.display = 'flex';
    countdownTextEl.textContent = String(n);
    gsap.fromTo(countdownTextEl, { scale: 1.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.7)' });
}
function hideCountdown() {
    if (countdownEl) countdownEl.style.display = 'none';
}

// ==========================================
// Input
// ==========================================
function onKeyDown(e) {
    keyState[e.code] = true;
    if (e.code === 'Escape') {
        if (gameState === 'paused') pauseGame();
        else exitToPortfolio();
        return;
    }
    if (e.code === 'KeyP' || e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing' || gameState === 'paused') pauseGame();
        return;
    }
    // Discrete direction taps for grid-based modes (ignore auto-repeat)
    if (!e.repeat) {
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
}
function onKeyUp(e) { keyState[e.code] = false; }

function onPointerMove(e) {
    const rect = gameCanvas.getBoundingClientRect();
    pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
}
function onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = gameCanvas.getBoundingClientRect();
    pointerX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    pointerY = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
    touchActive = true;
}
function onTouchStart(e) { touchActive = true; onTouchMove(e); }
function onTouchEnd() { touchActive = false; }

function getInput() {
    const dir = { x: 0, y: 0 };
    if (keyState['ArrowLeft'] || keyState['KeyA']) dir.x -= 1;
    if (keyState['ArrowRight'] || keyState['KeyD']) dir.x += 1;
    if (keyState['ArrowUp'] || keyState['KeyW']) dir.y += 1;
    if (keyState['ArrowDown'] || keyState['KeyS']) dir.y -= 1;
    return { dir, taps: tapQueue, pointerX, pointerY, touchActive };
}

// ==========================================
// Shooter Mode
// ==========================================
function ShooterMode() {
    const AUTO_FIRE = 0.5;
    const BULLET_SPEED = 22;
    const AST_BASE_SPEED = 3.5;
    const MAX_BULLETS = 40;
    const MAX_ASTEROIDS = 18;
    let ship, shipGlow;
    let bullets = [];
    let asteroids = [];
    let fireTimer = 0;
    let spawnTimer = 0;
    let spawnRate = 1.2;
    let difficulty = 1;
    let targetShipX = 0;
    let targetShipY = -gameHeight / 2 + 1.5;

    function makeShip() {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0.7,0, -0.45,-0.55,0, 0.45,-0.55,0]), 3));
        geo.computeVertexNormals();
        const mat = new THREE.MeshBasicMaterial({ color: 0xA8E063, side: THREE.DoubleSide });
        ship = new THREE.Mesh(geo, mat);
        ship.position.set(0, targetShipY, 0);
        addModeMesh(ship);

        const gGeo = new THREE.BufferGeometry();
        gGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0.9,0, -0.55,-0.65,0, 0.55,-0.65,0]), 3));
        const gMat = new THREE.MeshBasicMaterial({ color: 0xA8E063, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
        shipGlow = new THREE.Mesh(gGeo, gMat);
        shipGlow.position.copy(ship.position);
        shipGlow.position.z = -0.1;
        addModeMesh(shipGlow);
    }

    function spawnBullet(x, y) {
        const b = bullets.find(b => !b.active);
        if (!b) return;
        b.active = true; b.mesh.visible = true;
        b.mesh.position.set(x, y, 0);
    }

    function spawnAsteroid() {
        const a = asteroids.find(a => !a.active);
        if (!a) return;
        const sizeVar = 0.6 + Math.random() * 0.8;
        a.mesh.scale.setScalar(sizeVar);
        a.radius = sizeVar;
        a.hp = Math.ceil(sizeVar);
        a.active = true; a.mesh.visible = true;
        const x = (Math.random() - 0.5) * (GAME_WIDTH - 2);
        a.mesh.position.set(x, gameHeight / 2 + 1, 0);
        a.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        a.rotSpeed = (Math.random() - 0.5) * 3;
        a.speed = AST_BASE_SPEED * (0.8 + Math.random() * 0.6) * difficulty;
    }

    return {
        enter() {
            makeShip();
            const bGeo = new THREE.PlaneGeometry(0.12, 0.5);
            const bMat = new THREE.MeshBasicMaterial({ color: 0x00D4C8, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
            for (let i = 0; i < MAX_BULLETS; i++) {
                const mesh = new THREE.Mesh(bGeo.clone(), bMat.clone());
                mesh.visible = false;
                addModeMesh(mesh);
                bullets.push({ mesh, active: false });
            }
            const aGeo = new THREE.IcosahedronGeometry(1, 0);
            for (let i = 0; i < MAX_ASTEROIDS; i++) {
                const mat = new THREE.MeshStandardMaterial({ color: 0x555555, flatShading: true, roughness: 0.8, metalness: 0.2 });
                const mesh = new THREE.Mesh(aGeo.clone(), mat);
                mesh.visible = false;
                addModeMesh(mesh);
                asteroids.push({ mesh, active: false, radius: 1, rotSpeed: 0, hp: 1, speed: 0 });
            }
            fireTimer = 0; spawnTimer = 0;
        },
        update(dt, input) {
            difficulty = 1 + score / 500;
            spawnRate = Math.max(0.35, 1.2 - score / 1500);
            const halfW = GAME_WIDTH / 2 - 0.5;
            const halfH = gameHeight / 2 - 1;

            // Touch follows finger (mobile); otherwise WASD / arrows
            if (input.touchActive) {
                targetShipX = input.pointerX * halfW;
                targetShipY = input.pointerY * halfH;
            } else {
                targetShipX += input.dir.x * 14 * dt;
                targetShipY += input.dir.y * 14 * dt;
            }
            targetShipX = Math.max(-halfW, Math.min(halfW, targetShipX));
            targetShipY = Math.max(-halfH + 2, Math.min(halfH - 1, targetShipY));
            ship.position.x += (targetShipX - ship.position.x) * 10 * dt;
            ship.position.y += (targetShipY - ship.position.y) * 10 * dt;
            shipGlow.position.copy(ship.position); shipGlow.position.z = -0.1;
            ship.rotation.z = -(ship.position.x - targetShipX) * 0.3;

            fireTimer += dt;
            if (fireTimer >= AUTO_FIRE) {
                fireTimer = 0;
                spawnBullet(ship.position.x, ship.position.y + 0.6);
            }
            spawnTimer += dt;
            if (spawnTimer >= spawnRate) { spawnTimer = 0; spawnAsteroid(); }

            bullets.forEach(b => {
                if (!b.active) return;
                b.mesh.position.y += BULLET_SPEED * dt;
                if (b.mesh.position.y > gameHeight / 2 + 1) { b.active = false; b.mesh.visible = false; }
            });
            asteroids.forEach(a => {
                if (!a.active) return;
                a.mesh.position.y -= a.speed * dt;
                a.mesh.rotation.x += a.rotSpeed * dt;
                a.mesh.rotation.y += a.rotSpeed * dt * 0.7;
                if (a.mesh.position.y < -gameHeight / 2 - 2) { a.active = false; a.mesh.visible = false; }
            });

            // Bullet vs asteroid
            bullets.forEach(b => {
                if (!b.active) return;
                asteroids.forEach(a => {
                    if (!a.active) return;
                    const dx = b.mesh.position.x - a.mesh.position.x;
                    const dy = b.mesh.position.y - a.mesh.position.y;
                    if (Math.sqrt(dx*dx + dy*dy) < a.radius + 0.2) {
                        b.active = false; b.mesh.visible = false;
                        a.hp--;
                        if (a.hp <= 0) {
                            a.active = false; a.mesh.visible = false;
                            score += Math.round(10 * difficulty);
                            playExplosion();
                            return { scoreChange: true, damage: false };
                        } else {
                            a.mesh.material.emissive.setHex(0xA8E063);
                            setTimeout(() => { if (a.mesh) a.mesh.material.emissive.setHex(0x000000); }, 80);
                        }
                    }
                });
            });

            // Ship vs asteroid
            let damage = false;
            asteroids.forEach(a => {
                if (!a.active) return;
                const dx = ship.position.x - a.mesh.position.x;
                const dy = ship.position.y - a.mesh.position.y;
                if (Math.sqrt(dx*dx + dy*dy) < a.radius + 0.4) {
                    a.active = false; a.mesh.visible = false;
                    damage = true;
                }
            });
            if (damage) {
                ship.material.color.setHex(0xff4444);
                setTimeout(() => { if (ship) ship.material.color.setHex(0xA8E063); }, 150);
            }
            return { damage };
        },
        exit() {
            bullets = []; asteroids = [];
        }
    };
}

// ==========================================
// Crossy Mode
// ==========================================
function CrossyMode() {
    const COLS = 9;
    const ROWS = 9;
    const CELL = 1.1;
    const PLAYER_Z = 0.6;
    let player;
    let lanes = [];
    let pc = Math.floor(COLS / 2); // player grid column
    let pr = 0;                    // player grid row
    let maxRow = 0;
    let hopGuard = 0;              // brief invuln after hop/respawn

    function worldX(col) { return (col - COLS / 2 + 0.5) * CELL; }
    function worldY(row) { return (row - ROWS / 2 + 0.5) * CELL; }

    function makePlayer() {
        const g = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(CELL * 0.66, CELL * 0.66, CELL * 0.66),
            new THREE.MeshBasicMaterial({ color: 0xA8E063 })
        );
        g.add(body);
        const top = new THREE.Mesh(
            new THREE.BoxGeometry(CELL * 0.7, CELL * 0.7, CELL * 0.7),
            new THREE.MeshBasicMaterial({ color: 0xA8E063, wireframe: true, transparent: true, opacity: 0.5 })
        );
        g.add(top);
        player = g;
        player.position.set(worldX(pc), worldY(pr), PLAYER_Z);
        addModeMesh(player);
    }

    function buildLanes() {
        lanes = [];
        // Rows 0 and ROWS-1 are safe zones (no cars)
        for (let r = 1; r < ROWS - 1; r++) {
            const dir = r % 2 === 0 ? 1 : -1;
            const speed = (2.2 + Math.random() * 2.0) * (1 + score / 1200);
            const spacing = 2.0 + Math.random() * 1.8;
            lanes.push({ row: r, dir, speed, spacing, timer: Math.random() * spacing, cars: [] });
        }
    }

    function spawnCar(lane) {
        const geo = new THREE.BoxGeometry(CELL * 1.5, CELL * 0.55, CELL * 0.55);
        const color = [0x00D4C8, 0xff5f5f, 0x8b949e, 0xF7F8F0][Math.floor(Math.random() * 4)];
        const mat = new THREE.MeshBasicMaterial({ color });
        const car = new THREE.Mesh(geo, mat);
        const startX = lane.dir > 0 ? -COLS / 2 * CELL - 2 : COLS / 2 * CELL + 2;
        car.position.set(startX, worldY(lane.row), 0);
        addModeMesh(car);
        lane.cars.push({ mesh: car, active: true });
    }

    function makeGrid() {
        const verts = [];
        for (let c = 0; c <= COLS; c++) {
            const x = worldX(c) - CELL / 2;
            verts.push(x, worldY(0) - CELL / 2, -0.2, x, worldY(ROWS) - CELL / 2, -0.2);
        }
        for (let r = 0; r <= ROWS; r++) {
            const y = worldY(r) - CELL / 2;
            verts.push(worldX(0) - CELL / 2, y, -0.2, worldX(COLS) - CELL / 2, y, -0.2);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
        const grid = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x2a3530, transparent: true, opacity: 0.5 }));
        addModeMesh(grid);

        // Safe-zone tint at bottom and top
        [0, ROWS - 1].forEach(r => {
            const strip = new THREE.Mesh(
                new THREE.PlaneGeometry(COLS * CELL, CELL),
                new THREE.MeshBasicMaterial({ color: 0xA8E063, transparent: true, opacity: 0.06 })
            );
            strip.position.set(0, worldY(r), -0.15);
            addModeMesh(strip);
        });
    }

    function snapPlayer() {
        gsap.to(player.position, { x: worldX(pc), y: worldY(pr), duration: 0.1, ease: 'power2.out' });
    }

    function respawn() {
        pc = Math.floor(COLS / 2); pr = 0; maxRow = 0;
        player.position.set(worldX(pc), worldY(pr), PLAYER_Z);
        hopGuard = 0.3;
    }

    return {
        enter() {
            pc = Math.floor(COLS / 2); pr = 0; maxRow = 0; hopGuard = 0.4;
            makeGrid();
            makePlayer();
            buildLanes();
        },
        update(dt, input) {
            let damage = false;
            if (hopGuard > 0) hopGuard -= dt;

            // Discrete tap movement (one cell per press)
            if (input.taps.length) {
                const t = input.taps[0];
                let nc = Math.max(0, Math.min(COLS - 1, pc + t.x));
                let nr = Math.max(0, Math.min(ROWS - 1, pr + t.y));
                if (nc !== pc || nr !== pr) {
                    pc = nc; pr = nr;
                    snapPlayer();
                    if (pr > maxRow) { score += (pr - maxRow) * 6; maxRow = pr; }
                    // Reached the top safe row → new crossing + bonus
                    if (pr === ROWS - 1) {
                        score += 20;
                        playExplosion();
                        respawn();
                    }
                }
            }

            lanes.forEach(lane => {
                lane.timer -= dt;
                if (lane.timer <= 0) { lane.timer = lane.spacing; spawnCar(lane); }
                lane.cars.forEach(c => {
                    if (!c.active) return;
                    c.mesh.position.x += lane.dir * lane.speed * dt;
                    if (Math.abs(c.mesh.position.x) > COLS / 2 * CELL + 3) {
                        c.active = false; c.mesh.visible = false;
                        return;
                    }
                    if (hopGuard > 0) return;
                    const dx = player.position.x - c.mesh.position.x;
                    const dy = worldY(pr) - c.mesh.position.y;
                    if (Math.abs(dx) < CELL * 0.85 && Math.abs(dy) < CELL * 0.45) {
                        damage = true;
                        c.active = false; c.mesh.visible = false;
                    }
                });
            });

            if (damage) respawn();
            return { damage };
        },
        exit() { lanes = []; }
    };
}

// ==========================================
// Snake Mode
// ==========================================
function SnakeMode() {
    const COLS = 12;
    const ROWS = 10;
    const CELL = 1.0;
    let snake = [];
    let food = null;
    let foodC = 0, foodR = 0;
    let dir = { x: 0, y: 1 };
    let nextDir = { x: 0, y: 1 };
    let moveTimer = 0;
    const MOVE_INTERVAL = 0.24;
    let growPending = 0;

    function worldX(c) { return (c - COLS/2 + 0.5) * CELL; }
    function worldY(r) { return (r - ROWS/2 + 0.5) * CELL; }

    function makeSnake() {
        const startC = Math.floor(COLS/2);
        const startR = 2;
        const geo = new THREE.BoxGeometry(CELL*0.85, CELL*0.85, CELL*0.85);
        const mat = new THREE.MeshBasicMaterial({ color: 0xA8E063 });
        for (let i = 0; i < 3; i++) {
            const seg = new THREE.Mesh(geo.clone(), mat.clone());
            seg.position.set(worldX(startC), worldY(startR - i), 0);
            addModeMesh(seg);
            snake.push({ mesh: seg, c: startC, r: startR - i });
        }
    }

    function spawnFood() {
        if (food) { modeGroup.remove(food); food.geometry.dispose(); food.material.dispose(); food = null; }
        const geo = new THREE.BoxGeometry(CELL*0.55, CELL*0.55, CELL*0.55);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00D4C8, transparent: true, opacity: 0.95 });
        const mesh = new THREE.Mesh(geo, mat);
        let attempts = 0;
        do {
            foodC = Math.floor(Math.random() * COLS);
            foodR = Math.floor(Math.random() * ROWS);
            attempts++;
        } while (attempts < 80 && snake.some(s => s.c === foodC && s.r === foodR));
        mesh.position.set(worldX(foodC), worldY(foodR), 0);
        addModeMesh(mesh);
        food = mesh;
    }

    function makeGrid() {
        const geo = new THREE.BufferGeometry();
        const verts = [];
        for (let c = 0; c <= COLS; c++) {
            const x = worldX(c) - CELL/2;
            verts.push(x, worldY(0) - CELL/2, -0.1, x, worldY(ROWS) - CELL/2, -0.1);
        }
        for (let r = 0; r <= ROWS; r++) {
            const y = worldY(r) - CELL/2;
            verts.push(worldX(0) - CELL/2, y, -0.1, worldX(COLS) - CELL/2, y, -0.1);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
        const mat = new THREE.LineBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.25 });
        const grid = new THREE.LineSegments(geo, mat);
        addModeMesh(grid);
    }

    return {
        enter() {
            makeGrid();
            makeSnake();
            spawnFood();
            dir = { x: 0, y: 1 };
            nextDir = { x: 0, y: 1 };
            moveTimer = 0; growPending = 0;
        },
        update(dt, input) {
            let damage = false;
            // Tap-based turning (cannot reverse onto self)
            for (const t of input.taps) {
                if (t.x !== 0 && dir.x === 0) { nextDir = { x: t.x, y: 0 }; break; }
                if (t.y !== 0 && dir.y === 0) { nextDir = { x: 0, y: t.y }; break; }
            }

            moveTimer -= dt;
            if (moveTimer <= 0) {
                moveTimer = MOVE_INTERVAL;
                dir = nextDir;
                const head = snake[0];
                const nc = head.c + dir.x;
                const nr = head.r + dir.y;

                if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS || snake.some((s, i) => i > 0 && s.c === nc && s.r === nr)) {
                    damage = true;
                } else {
                    const geo = new THREE.BoxGeometry(CELL*0.85, CELL*0.85, CELL*0.85);
                    const mat = new THREE.MeshBasicMaterial({ color: 0xA8E063 });
                    const seg = new THREE.Mesh(geo, mat);
                    seg.position.set(worldX(nc), worldY(nr), 0);
                    addModeMesh(seg);
                    snake.unshift({ mesh: seg, c: nc, r: nr });

                    if (nc === foodC && nr === foodR) {
                        growPending += 1;
                        score += 15;
                        playExplosion();
                        spawnFood();
                    }
                    if (growPending > 0) { growPending--; }
                    else {
                        const tail = snake.pop();
                        if (tail && tail.mesh) {
                            modeGroup.remove(tail.mesh);
                            tail.mesh.geometry.dispose();
                            tail.mesh.material.dispose();
                        }
                    }
                }
            }
            if (damage) {
                snake.forEach(s => {
                    modeGroup.remove(s.mesh);
                    s.mesh.geometry.dispose();
                    s.mesh.material.dispose();
                });
                snake = [];
                makeSnake();
                dir = { x: 0, y: 1 }; nextDir = { x: 0, y: 1 };
                if (food) { modeGroup.remove(food); food.geometry.dispose(); food.material.dispose(); food = null; }
                spawnFood();
            }
            return { damage };
        },
        exit() { snake = []; food = null; }
    };
}

// ==========================================
// Dodge Mode
// ==========================================
function DodgeMode() {
    const PLAYER_SIZE = 0.5;
    const SPEED = 10;
    let player;
    let blocks = [];
    let spawnTimer = 0;
    let survivalTimer = 0;
    let difficulty = 1;

    function makePlayer() {
        const geo = new THREE.BoxGeometry(PLAYER_SIZE, PLAYER_SIZE, PLAYER_SIZE);
        const mat = new THREE.MeshBasicMaterial({ color: 0xA8E063 });
        player = new THREE.Mesh(geo, mat);
        player.position.set(0, -gameHeight/2 + 1.5, 0);
        addModeMesh(player);
    }

    function spawnBlock() {
        const w = 0.6 + Math.random() * 1.2;
        const h = 0.6 + Math.random() * 1.0;
        const geo = new THREE.BoxGeometry(w, h, 0.4);
        const color = [0xff5f5f, 0x00D4C8, 0xF7F8F0, 0x8b949e][Math.floor(Math.random()*4)];
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 });
        const mesh = new THREE.Mesh(geo, mat);
        const x = (Math.random() - 0.5) * (GAME_WIDTH - w - 1);
        mesh.position.set(x, gameHeight/2 + 1, 0);
        addModeMesh(mesh);
        blocks.push({ mesh, speed: (2 + Math.random() * 3) * difficulty, w, h, active: true });
    }

    return {
        enter() {
            makePlayer();
            blocks = [];
            spawnTimer = 0; survivalTimer = 0;
            difficulty = 1 + score / 600;
        },
        update(dt, input) {
            let damage = false;
            difficulty = 1 + score / 600;
            const halfW = GAME_WIDTH/2 - PLAYER_SIZE;
            const halfH = gameHeight/2 - 1;

            if (input.touchActive) {
                player.position.x += (input.pointerX * halfW - player.position.x) * 10 * dt;
                player.position.y += (input.pointerY * halfH - player.position.y) * 10 * dt;
            } else {
                player.position.x += input.dir.x * SPEED * dt;
                player.position.y += input.dir.y * SPEED * dt;
            }
            player.position.x = Math.max(-halfW, Math.min(halfW, player.position.x));
            player.position.y = Math.max(-halfH + 1, Math.min(halfH - 1, player.position.y));

            spawnTimer -= dt;
            if (spawnTimer <= 0) {
                spawnTimer = Math.max(0.3, 0.9 - difficulty * 0.15);
                spawnBlock();
            }
            blocks.forEach(b => {
                if (!b.active) return;
                b.mesh.position.y -= b.speed * dt;
                if (b.mesh.position.y < -gameHeight/2 - 2) { b.active = false; b.mesh.visible = false; }
            });
            blocks.forEach(b => {
                if (!b.active) return;
                const dx = Math.abs(player.position.x - b.mesh.position.x);
                const dy = Math.abs(player.position.y - b.mesh.position.y);
                if (dx < (PLAYER_SIZE + b.w)/2 && dy < (PLAYER_SIZE + b.h)/2) {
                    b.active = false; b.mesh.visible = false;
                    damage = true;
                }
            });
            survivalTimer += dt;
            if (survivalTimer >= 1) { survivalTimer -= 1; score += Math.round(2 * difficulty); }
            return { damage };
        },
        exit() { blocks = []; }
    };
}

// ==========================================
// Mode Registry
// ==========================================
const MODE_DEFS = [
    { name: 'SHOOTER', hint: 'WASD — Auto-fire asteroids', build: () => new ShooterMode() },
    { name: 'CROSSY',  hint: 'WASD — Tap to cross the road', build: () => new CrossyMode() },
    { name: 'SNAKE',   hint: 'WASD — Eat data nodes',      build: () => new SnakeMode() },
    { name: 'DODGE',   hint: 'WASD — Dodge the blocks',    build: () => new DodgeMode() }
];

const IS_MOBILE = window.matchMedia('(pointer: coarse)').matches;
const ACTIVE_MODES = IS_MOBILE
    ? [MODE_DEFS[0], MODE_DEFS[3]] // Shooter + Dodge only on mobile
    : MODE_DEFS;

let modesCompleted = 0;

// ==========================================
// Engine: Start / Stop
// ==========================================
export function startGame() {
    highScore = parseInt(localStorage.getItem('krost-high-score') || '0');

    gameScreenEl = document.getElementById('game-screen');
    if (!gameScreenEl) return;
    gameScreenEl.style.display = 'block';
    gameScreenEl.style.opacity = '1';
    document.body.classList.add('game-active');

    // Cache DOM refs
    hudScoreEl = document.getElementById('game-hud-score');
    hudHighEl = document.getElementById('game-hud-high');
    pauseOverlayEl = document.getElementById('game-pause');
    modeLabelEl = document.getElementById('game-mode-label');
    modeBarEl = document.getElementById('game-mode-bar');
    modeHintEl = document.getElementById('game-mode-hint');
    countdownEl = document.getElementById('game-countdown');
    countdownTextEl = document.getElementById('game-countdown-text');
    transitionEl = document.getElementById('game-transition');

    initRenderer();
    initScene();
    createBgText();

    score = 0;
    isTransitioning = false;
    currentModeIdx = 0;
    modesCompleted = 0;
    const exitBtn = document.getElementById('game-exit-btn');
    if (exitBtn) exitBtn.classList.remove('exit-prominent');
    switchMode(0);

    gameState = 'playing';
    updateHUD();
    hidePause();

    lastTime = performance.now() / 1000;
    animFrameId = requestAnimationFrame(gameLoop);
    bindInput();
}

export function stopGame() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = null;

    unbindInput();
    clearMode();
    removeBgText();

    if (renderer) { renderer.dispose(); renderer = null; }
    scene = null; camera = null;

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

// ==========================================
// Smooth mode transition
// ==========================================
function startTransition(nextIdx) {
    if (isTransitioning) return;
    isTransitioning = true;
    gameState = 'transition';
    tapQueue.length = 0;
    hideCountdown();
    countdownPhase = 0;

    modesCompleted++;
    if (modesCompleted >= 1) {
        const exitBtn = document.getElementById('game-exit-btn');
        if (exitBtn) exitBtn.classList.add('exit-prominent');
    }

    if (!transitionEl) {
        switchMode(nextIdx);
        gameState = 'playing';
        isTransitioning = false;
        lastTime = performance.now() / 1000;
        return;
    }

    transitionEl.style.display = 'flex';
    gsap.fromTo(transitionEl, { opacity: 0 }, {
        opacity: 1, duration: 0.32, ease: 'power2.in',
        onComplete: () => {
            switchMode(nextIdx);
            updateHUD();
            gsap.to(transitionEl, {
                opacity: 0, duration: 0.32, delay: 0.25, ease: 'power2.out',
                onComplete: () => {
                    if (transitionEl) transitionEl.style.display = 'none';
                    tapQueue.length = 0;
                    gameState = 'playing';
                    isTransitioning = false;
                    lastTime = performance.now() / 1000;
                }
            });
        }
    });
}

// ==========================================
// Game Loop
// ==========================================
function gameLoop() {
    animFrameId = requestAnimationFrame(gameLoop);
    const now = performance.now() / 1000;
    const dt = Math.min(now - lastTime, 0.05);
    lastTime = now;

    if (gameState === 'playing') {
        update(dt);
    }
    if (renderer && scene && camera) renderer.render(scene, camera);
}

function update(dt) {
    if (!currentMode) return;

    // Update mode timer and countdown
    modeTime += dt;
    const remaining = MODE_DURATION - modeTime;

    if (modeBarEl) {
        const pct = Math.max(0, (remaining / MODE_DURATION) * 100);
        modeBarEl.style.width = pct + '%';
    }

    // Countdown overlay (last 3s)
    if (remaining <= 3 && remaining > 0) {
        const phase = Math.ceil(remaining);
        if (countdownPhase !== phase) {
            countdownPhase = phase;
            showCountdown(phase);
        }
    } else if (countdownPhase !== 0) {
        countdownPhase = 0;
        hideCountdown();
    }

    // Switch mode at end → smooth transition
    if (modeTime >= MODE_DURATION) {
        startTransition((currentModeIdx + 1) % ACTIVE_MODES.length);
        return;
    }

    updateBgText(dt);

    // Mode update
    const input = getInput();
    const result = currentMode.update(dt, input);

    // Consume discrete taps each frame
    tapQueue.length = 0;

    if (result && result.damage) {
        applyDamage();
    }
    updateHUD();
}

// Damage: never die — subtract 10 points (floor 0) with feedback
function applyDamage() {
    score = Math.max(0, score - 10);
    playHit();
    flashDamage();
}

function flashDamage() {
    if (!hudScoreEl) return;
    hudScoreEl.style.color = '#ff5f5f';
    gsap.fromTo(hudScoreEl, { scale: 1.25 }, {
        scale: 1, duration: 0.3, ease: 'power2.out',
        onComplete: () => { if (hudScoreEl) hudScoreEl.style.color = '#A8E063'; }
    });
}

// ==========================================
// HUD
// ==========================================
function updateHUD() {
    if (hudScoreEl) hudScoreEl.textContent = String(score).padStart(5, '0');
    if (hudHighEl) hudHighEl.textContent = 'HI ' + String(Math.max(highScore, score)).padStart(5, '0');
}

function showPause() {
    if (pauseOverlayEl) {
        pauseOverlayEl.style.display = 'flex';
        gsap.fromTo(pauseOverlayEl, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }
}
function hidePause() {
    if (pauseOverlayEl) pauseOverlayEl.style.display = 'none';
}

// ==========================================
// Input binding
// ==========================================
function bindInput() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    gameCanvas.addEventListener('touchmove', onTouchMove, { passive: false });
    gameCanvas.addEventListener('touchstart', onTouchStart, { passive: false });
    gameCanvas.addEventListener('touchend', onTouchEnd);
}
function unbindInput() {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    if (gameCanvas) {
        gameCanvas.removeEventListener('touchmove', onTouchMove);
        gameCanvas.removeEventListener('touchstart', onTouchStart);
        gameCanvas.removeEventListener('touchend', onTouchEnd);
    }
}

// Save high score, then smoothly fade out and return to the portfolio
function exitToPortfolio() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('krost-high-score', String(highScore));
    }
    gameState = 'paused';
    hidePause();
    const finish = () => {
        stopGame();
        if (window.finishBootFromGame) window.finishBootFromGame();
    };
    if (gameScreenEl) {
        gsap.to(gameScreenEl, { opacity: 0, duration: 0.5, ease: 'power2.inOut', onComplete: finish });
    } else {
        finish();
    }
}

// Expose for HTML onclick handlers
window.KrostGame = {
    startGame,
    stopGame,
    pauseGame,
    exitToPortfolio
};
