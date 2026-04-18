// world.js — Scene builder with proper Minecraft-quality pixel textures

import * as THREE from 'three';

// ── Texture helper ─────────────────────────────────────────────────────────
function makeTex(drawFn, size = 64) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  drawFn(ctx, size);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestMipmapNearestFilter;
  t.generateMipmaps = true;
  return t;
}

// Seeded RNG for reproducible textures
function rng(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function noisePixels(ctx, sz, baseR, baseG, baseB, variance) {
  const r = rng(baseR + baseG * 3 + baseB * 7);
  for (let x = 0; x < sz; x++) {
    for (let y = 0; y < sz; y++) {
      const n = (r() - 0.5) * variance;
      const R = Math.min(255, Math.max(0, baseR + n)) | 0;
      const G = Math.min(255, Math.max(0, baseG + n)) | 0;
      const B = Math.min(255, Math.max(0, baseB + n)) | 0;
      ctx.fillStyle = `rgb(${R},${G},${B})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

// ── Textures ───────────────────────────────────────────────────────────────

// Grass top — bright Minecraft green
const TEX_GRASS_TOP = makeTex((ctx, sz) => {
  noisePixels(ctx, sz, 95, 159, 53, 18);
});

// Grass side — green band on top, dirt below
const TEX_GRASS_SIDE = makeTex((ctx, sz) => {
  const r = rng(42);
  for (let x = 0; x < sz; x++) {
    for (let y = 0; y < sz; y++) {
      const n = (r() - 0.5) * 20;
      let R, G, B;
      if (y < sz * 0.22) {
        R = (95 + n) | 0;  G = (159 + n) | 0; B = (53 + n * 0.3) | 0;
      } else if (y < sz * 0.32) {
        const t = (y - sz * 0.22) / (sz * 0.1);
        R = (95 + t * (134 - 95) + n) | 0;
        G = (159 + t * (96 - 159) + n) | 0;
        B = (53 + t * (57 - 53)) | 0;
      } else {
        R = (134 + n) | 0; G = (96 + n * 0.7) | 0; B = (57 + n * 0.5) | 0;
      }
      ctx.fillStyle = `rgb(${Math.max(0,Math.min(255,R))},${Math.max(0,Math.min(255,G))},${Math.max(0,Math.min(255,B))})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

// Dirt
const TEX_DIRT = makeTex((ctx, sz) => noisePixels(ctx, sz, 134, 96, 57, 22));

// Stone — proper Minecraft grey
const TEX_STONE = makeTex((ctx, sz) => {
  const r = rng(7);
  for (let x = 0; x < sz; x++) {
    for (let y = 0; y < sz; y++) {
      const n = (r() - 0.5) * 30;
      const v = (125 + n) | 0;
      ctx.fillStyle = `rgb(${Math.max(0,Math.min(255,v))},${Math.max(0,Math.min(255,v))},${Math.max(0,Math.min(255,v+2))})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

// Oak Wood Planks — proper warm brown with grain
const TEX_PLANKS = makeTex((ctx, sz) => {
  const r = rng(13);
  for (let x = 0; x < sz; x++) {
    for (let y = 0; y < sz; y++) {
      const n = (r() - 0.5) * 20;
      // Grain: every 16px horizontal band shifts color
      const grain = Math.floor(y / 16) % 2 === 0 ? 8 : 0;
      ctx.fillStyle = `rgb(${(162 + n + grain) | 0},${(128 + n * 0.7 + grain) | 0},${(68 + n * 0.4) | 0})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  // Plank gap lines
  ctx.fillStyle = 'rgba(60,35,10,0.5)';
  for (let y = 15; y < sz; y += 16) ctx.fillRect(0, y, sz, 2);
  ctx.fillRect(0, 0, 1, sz);
  ctx.fillRect(sz - 1, 0, 1, sz);
});

// Cobblestone
const TEX_COBBLE = makeTex((ctx, sz) => {
  const r = rng(19);
  for (let x = 0; x < sz; x++) {
    for (let y = 0; y < sz; y++) {
      const n = (r() - 0.5) * 40;
      const v = (105 + n) | 0;
      ctx.fillStyle = `rgb(${Math.max(70,Math.min(200,v))},${Math.max(70,Math.min(200,v))},${Math.max(70,Math.min(200,v))})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  ctx.strokeStyle = 'rgba(50,50,50,0.7)'; ctx.lineWidth = 1;
  for (let row = 0; row < 4; row++) {
    const off = (row % 2) * 8;
    for (let col = 0; col < 4; col++) {
      ctx.strokeRect(off + col * 16, row * 16, 16, 16);
    }
  }
});

// Bookshelf
const TEX_BOOKSHELF = makeTex((ctx, sz) => {
  // Wood frame
  ctx.fillStyle = '#8b5e2d';
  ctx.fillRect(0, 0, sz, sz);
  ctx.fillStyle = '#5a3415';
  ctx.fillRect(0, 0, 4, sz);
  ctx.fillRect(sz-4, 0, 4, sz);
  for (let y = 15; y < sz; y += 16) { ctx.fillStyle = '#5a3415'; ctx.fillRect(0, y, sz, 2); }
  // Books — solid colored blocks
  const colors = ['#c0392b','#2980b9','#27ae60','#8e44ad','#d35400','#f39c12','#1a5276'];
  const r = rng(29);
  for (let row = 0; row < 4; row++) {
    let x = 5;
    while (x < sz - 5) {
      const w = 6 + Math.floor(r() * 6);
      const col = colors[Math.floor(r() * colors.length)];
      const yy = row * 16 + 2;
      ctx.fillStyle = col;
      ctx.fillRect(x, yy, w, 12);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(x, yy, 1, 12);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x + w - 1, yy, 1, 12);
      x += w + 1;
    }
  }
}, 64);

// Gold block
const TEX_GOLD = makeTex((ctx, sz) => {
  noisePixels(ctx, sz, 250, 200, 40, 15);
  ctx.strokeStyle = 'rgba(180,130,10,0.6)'; ctx.lineWidth = 1;
  for (let i = 16; i < sz; i += 16) {
    ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(sz,i);ctx.stroke();
    ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,sz);ctx.stroke();
  }
});

// Red/metallic block
const TEX_RED = makeTex((ctx, sz) => noisePixels(ctx, sz, 176, 35, 35, 20));

// Cake top
const TEX_CAKE = makeTex((ctx, sz) => {
  // Cream top
  ctx.fillStyle = '#f0e8d0'; ctx.fillRect(0, 0, sz, sz * 0.2);
  // Icing stripe
  ctx.fillStyle = '#e74c3c'; ctx.fillRect(0, sz * 0.2, sz, sz * 0.08);
  // Sponge
  noisePixels(ctx, sz * 0.8 | 0, sz, 210, 170, 100, 15);
  ctx.fillStyle = '#d4a558';
  const r = rng(37);
  for (let x = 0; x < sz; x++) for (let y = (sz * 0.28)|0; y < sz; y++) {
    const n = (r() - 0.5) * 25;
    ctx.fillStyle = `rgb(${(210+n)|0},${(170+n)|0},${(100+n)|0})`;
    ctx.fillRect(x, y, 1, 1);
  }
});

// Orange (cat fur)
const TEX_ORANGE = makeTex((ctx, sz) => noisePixels(ctx, sz, 232, 120, 40, 20));

// ── Material helpers ────────────────────────────────────────────────────────
function mat(tex, rough=0.95, metal=0.0) {
  return new THREE.MeshStandardMaterial({ map: tex, roughness: rough, metalness: metal });
}

export const Materials = {
  grassBlock: [
    mat(TEX_GRASS_SIDE), mat(TEX_GRASS_SIDE),
    mat(TEX_GRASS_TOP, 0.9), mat(TEX_DIRT),
    mat(TEX_GRASS_SIDE), mat(TEX_GRASS_SIDE),
  ],
  stone:  mat(TEX_STONE),
  planks: mat(TEX_PLANKS, 0.9),
  cobble: mat(TEX_COBBLE),
  bookshelf: mat(TEX_BOOKSHELF, 0.85),
  gold:   new THREE.MeshStandardMaterial({ map: TEX_GOLD, roughness: 0.25, metalness: 0.85 }),
  red:    mat(TEX_RED, 0.5, 0.6),
  cake:   mat(TEX_CAKE, 0.95),
  orange: mat(TEX_ORANGE, 0.95),
};

// ── World Map ──────────────────────────────────────────────────────────────
// # = wall,  + = spawn
// W=Table/Keys, T=Car, B=Diary, S=Cinema, D=Cafe, A=Academic, F=Flower, C=Cat
const MAP = [
  '####################',
  '#........#.........#',
  '#..C.....#.........#',
  '#........#.........#',
  '######.#####.#######',
  '#........#.........#',
  '#..B.....#.....S...#',
  '#........#.........#',
  '######.#####.#######',
  '#........#.........#',
  '#..W.....+.....T...#',
  '#........#.........#',
  '######.#####.#######',
  '#........#.........#',
  '#..D.....#.....A...#',
  '#........#.........#',
  '##########.#########',
  '#........F.........#',
  '#..................#',
  '####################',
];

export const BS = 5; // Block size

export function buildWorld(scene) {
  const walls = [];
  const objects = [];
  let spawnX = 0, spawnZ = 0;

  const rows = MAP.length;
  const cols = MAP.reduce((m, r) => Math.max(m, r.length), 0);
  const ox = -(cols * BS) / 2;
  const oz = -(rows * BS) / 2;

  const BOX_GEO = new THREE.BoxGeometry(BS, BS, BS);
  const FLOOR_GEO = new THREE.PlaneGeometry(BS, BS);
  const FLOOR_MAT = [
    mat(TEX_DIRT, 1.0),
    mat(TEX_GRASS_TOP, 0.9),
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < (MAP[r]?.length || 0); c++) {
      const ch = MAP[r][c];
      if (ch === ' ') continue;

      const wx = ox + c * BS + BS / 2;
      const wz = oz + r * BS + BS / 2;

      // Floor: dirt base, then grass on top
      for (let fi = 0; fi < 2; fi++) {
        const fm = new THREE.Mesh(FLOOR_GEO, FLOOR_MAT[fi]);
        fm.rotation.x = -Math.PI / 2;
        fm.position.set(wx, fi * 0.01, wz);
        fm.receiveShadow = true;
        scene.add(fm);
      }

      if (ch === '#') {
        // Wall: stone core topped with grass block
        for (let h = 0; h < 3; h++) {
          const wm = new THREE.Mesh(BOX_GEO, h === 2 ? Materials.grassBlock : Materials.stone);
          wm.position.set(wx, BS / 2 + h * BS, wz);
          wm.castShadow = true; wm.receiveShadow = true;
          scene.add(wm);
        }
        walls.push({ minX: wx - BS/2, maxX: wx + BS/2, minZ: wz - BS/2, maxZ: wz + BS/2 });
        continue;
      }

      if (ch === '+') { spawnX = wx; spawnZ = wz; }

      if ('WTBSDAFC'.includes(ch)) {
        const nodeMap = { W:1, T:6, B:8, S:30, D:40, A:60, F:11, C:13 };
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        // Build each object
        ({
          W: buildTable,
          T: buildCar,
          B: buildBookshelf,
          S: buildCinemaScreen,
          D: buildCafeTable,
          A: buildPodium,
          F: buildFlower,
          C: buildCat,
        })[ch](group);

        scene.add(group);

        // Invisible raycaster hitbox
        const hb = new THREE.Mesh(
          new THREE.BoxGeometry(BS * 0.85, BS, BS * 0.85),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        hb.position.set(wx, BS / 2, wz);
        hb.userData = { nodeId: nodeMap[ch], key: ch, group };
        scene.add(hb);
        objects.push(hb);

        if (ch !== 'F') {
          walls.push({ minX: wx - 1.8, maxX: wx + 1.8, minZ: wz - 1.8, maxZ: wz + 1.8 });
        }
      }
    }
  }

  // Large terrain floor beyond the map
  const terrainMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    mat(TEX_GRASS_TOP, 1.0)
  );
  terrainMesh.rotation.x = -Math.PI / 2;
  terrainMesh.position.y = -0.02;
  terrainMesh.receiveShadow = true;
  scene.add(terrainMesh);

  return { walls, objects, spawnX, spawnZ };
}

// ── Object Builders ────────────────────────────────────────────────────────

function mesh(geo, mat, x, y, z, parent) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m); return m;
}

const BOX   = (w=1, h=1, d=1) => new THREE.BoxGeometry(w, h, d);
const CYL   = (rt=0.5, rb=0.5, h=1, seg=16) => new THREE.CylinderGeometry(rt, rb, h, seg);
const CONE  = (r=0.5, h=1, seg=8) => new THREE.ConeGeometry(r, h, seg);
const SPHERE= (r=0.5, seg=16) => new THREE.SphereGeometry(r, seg, seg);

function buildTable(g) {
  mesh(BOX(2.8, 0.25, 2.2), Materials.planks, 0, 1.5, 0, g);
  for (const [x,z] of [[-1.1,-0.85],[1.1,-0.85],[-1.1,0.85],[1.1,0.85]])
    mesh(BOX(0.2, 1.5, 0.2), Materials.planks, x, 0.75, z, g);
  // Items on table
  mesh(BOX(0.5, 0.06, 0.2), Materials.cobble, -0.4, 1.64, 0, g);
  mesh(BOX(0.3, 0.06, 0.3), Materials.gold,    0.4, 1.64, 0, g);
}

function buildCar(g) {
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4, metalness: 0.7 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xbfdfff, roughness: 0.1, metalness: 0.0, transparent: true, opacity: 0.55 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
  mesh(BOX(3.8, 0.75, 2.0), bodyMat, 0, 0.68, 0, g);
  mesh(BOX(2.4, 0.75, 1.8), bodyMat, -0.3, 1.43, 0, g);
  const ws = new THREE.Mesh(BOX(0.06, 0.6, 1.5), glassMat);
  ws.position.set(0.88, 1.48, 0); ws.rotation.y = 0.25; g.add(ws);
  for (const [x,z] of [[-1.3,-0.95],[1.3,-0.95],[-1.3,0.95],[1.3,0.95]]) {
    const w = new THREE.Mesh(CYL(0.38,0.38,0.28,14), wheelMat);
    w.rotation.x = Math.PI/2; w.position.set(x, 0.37, z); w.castShadow=true; g.add(w);
  }
}

function buildBookshelf(g) {
  mesh(BOX(2.2, 2.6, 0.65), Materials.bookshelf, 0, 1.3, 0, g);
}

function buildCinemaScreen(g) {
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  const screenMat = new THREE.MeshStandardMaterial({ color: 0xe8d9a0, emissive: new THREE.Color(0xd4bc68), emissiveIntensity: 0.25 });
  mesh(BOX(4.2, 3.2, 0.12), frameMat, 0, 2.6, 0, g);
  mesh(BOX(3.8, 2.8, 0.12), screenMat, 0, 2.6, 0.05, g);
  mesh(BOX(0.5, 0.3, 0.4), Materials.stone, 0, 4.8, 2.2, g);
}

function buildCafeTable(g) {
  mesh(BOX(2.0, 0.12, 2.0), Materials.planks, 0, 1.12, 0, g);
  mesh(BOX(0.18, 1.12, 0.18), Materials.planks, 0, 0.56, 0, g);
  const cupMat = new THREE.MeshStandardMaterial({ color: 0xf8f8f0, roughness: 0.4 });
  const cup = new THREE.Mesh(CYL(0.16, 0.13, 0.38, 14), cupMat);
  cup.position.set(0.3, 1.38, 0.28); cup.castShadow = true; g.add(cup);
  const liquidMat = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.5, emissive: new THREE.Color(0x3a9140), emissiveIntensity: 0.3 });
  const liquid = new THREE.Mesh(CYL(0.13, 0.13, 0.04, 14), liquidMat);
  liquid.position.set(0.3, 1.56, 0.28); g.add(liquid);
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xf5ecd7, roughness: 0.7 });
  const plate = new THREE.Mesh(CYL(0.32, 0.32, 0.05, 20), plateMat);
  plate.position.set(-0.3, 1.17, -0.3); g.add(plate);
}

function buildPodium(g) {
  mesh(BOX(3.0, 0.3, 2.6), Materials.cobble, 0, 0.15, 0, g);
  mesh(BOX(2.4, 0.3, 2.0), Materials.cobble, 0, 0.45, 0, g);
  mesh(BOX(1.8, 0.3, 1.4), Materials.cobble, 0, 0.75, 0, g);
  mesh(BOX(1.8, 0.12, 1.4), Materials.gold, 0, 0.96, 0, g);
  const scrollMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.9 });
  const scroll = new THREE.Mesh(CYL(0.07, 0.07, 0.9, 12), scrollMat);
  scroll.rotation.z = 0.3; scroll.position.set(0.1, 1.56, 0); g.add(scroll);
}

function buildFlower(g) {
  // Add an elegant gold podium
  mesh(CYL(0.6, 0.7, 0.4, 16), Materials.gold, 0, 0.2, 0, g);
  mesh(CYL(0.4, 0.5, 0.2, 16), Materials.stone, 0, 0.5, 0, g);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x2d8a3e, roughness: 0.9 });
  mesh(CYL(0.05, 0.07, 1.6, 8), stemMat, 0, 1.4, 0, g);
  const petalMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.7, emissive: new THREE.Color(0xfbbf24), emissiveIntensity: 0.3 });
  const centerMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const p = new THREE.Mesh(SPHERE(0.2, 6), petalMat);
    p.position.set(Math.cos(a) * 0.45, 2.22, Math.sin(a) * 0.45); p.castShadow = true; g.add(p);
  }
  mesh(SPHERE(0.25, 10), centerMat, 0, 2.22, 0, g);
  const pl = new THREE.PointLight(0xffea00, 2.5, 15);
  pl.position.set(0, 2.5, 0); g.add(pl);
}

function buildCat(g) {
  const fur  = Materials.orange;
  const dark = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });
  mesh(BOX(1.0, 0.75, 1.4), fur, 0, 0.68, 0, g);
  mesh(BOX(0.75, 0.78, 0.7), fur, 0, 1.27, 0.42, g);
  for (const ex of [-0.22, 0.22]) {
    const ear = new THREE.Mesh(CONE(0.13, 0.28, 4), fur);
    ear.position.set(ex, 1.72, 0.42); g.add(ear);
  }
  for (const ex of [-0.16, 0.16]) {
    mesh(SPHERE(0.065, 8), dark, ex, 1.33, 0.77, g);
  }
  mesh(BOX(0.32, 0.18, 0.1), cream, 0, 1.22, 0.76, g);
  const tail = new THREE.Mesh(CYL(0.07, 0.04, 1.0, 8), fur);
  tail.rotation.x = Math.PI/3; tail.position.set(0, 0.72, -0.75); g.add(tail);
}
