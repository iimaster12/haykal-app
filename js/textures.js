// Procedural textures and shared materials. Everything is drawn on canvas at
// load time, so the app ships no image files and stays light on phones.
import * as THREE from 'three';

function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function rng(seed = 7) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

// draw a shape at its position and at wrapped copies so the texture tiles cleanly
function wrapped(w, h, x, y, r, fn) {
  for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
    if (x + ox + r < 0 || x + ox - r > w || y + oy + r < 0 || y + oy - r > h) continue;
    fn(x + ox, y + oy);
  }
}

function speckle(g, w, h, n, colors, rmin, rmax, r, amin = 0.15, amax = 0.5) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = colors[(r() * colors.length) | 0];
    const rad = rmin + r() * (rmax - rmin);
    g.globalAlpha = amin + r() * (amax - amin);
    const x = r() * w, y = r() * h;
    wrapped(w, h, x, y, rad, (px, py) => { g.beginPath(); g.arc(px, py, rad, 0, Math.PI * 2); g.fill(); });
  }
  g.globalAlpha = 1;
}

function blotch(g, w, h, n, color, r, rmin = 30, rmax = 140, amax = 0.16) {
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, rad = rmin + r() * (rmax - rmin);
    g.globalAlpha = 0.05 + r() * amax;
    wrapped(w, h, x, y, rad, (px, py) => {
      const gr = g.createRadialGradient(px, py, 0, px, py, rad);
      gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    });
  }
  g.globalAlpha = 1;
}

function toTex(canvas, worldW, worldH) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / worldW, 1 / worldH);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Fair-faced concrete: plywood formwork joints every 1.2 m, tie holes, pinholes.
function concreteCanvas(base = '#a9aaa5', seed = 3) {
  const S = 512, [c, g] = mk(S, S), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, S, S);
  blotch(g, S, S, 26, '#6f716c', r);
  blotch(g, S, S, 18, '#d4d5cf', r);
  speckle(g, S, S, 9000, ['#7b7d78', '#c9cac4', '#8f908b', '#b5b6b0'], 0.4, 1.3, r);
  speckle(g, S, S, 260, ['#4c4e4b'], 0.6, 1.6, r, 0.4, 0.8);
  g.strokeStyle = 'rgba(60,62,60,0.35)'; g.lineWidth = 2;
  for (const p of [1, S / 2]) {
    g.beginPath(); g.moveTo(p, 0); g.lineTo(p, S); g.stroke();
    g.beginPath(); g.moveTo(0, p); g.lineTo(S, p); g.stroke();
  }
  g.fillStyle = 'rgba(55,57,55,0.55)';
  for (const x of [64, 192, 320, 448]) for (const y of [128, 384]) { g.beginPath(); g.arc(x, y, 4.5, 0, Math.PI * 2); g.fill(); }
  return c;
}

// Perforated red clay brick, 25 x 12 x 6.5 cm, 1 cm joints, running bond.
function brickCanvas() {
  const W = 512, H = 296, [c, g] = mk(W, H), r = rng(11);
  g.fillStyle = '#b3aa9c'; g.fillRect(0, 0, W, H);
  speckle(g, W, H, 2500, ['#9d9486', '#cfc7b9'], 0.4, 1.2, r);
  const bw = 128, bh = 37, j = 5;
  const reds = ['#9b4a33', '#a85439', '#8f4430', '#b25f40', '#a0503a', '#7f3c2b', '#b86a48'];
  for (let row = 0; row < 8; row++) {
    const off = row % 2 ? bw / 2 : 0;
    for (let k = -1; k < 5; k++) {
      const x = k * bw + off + j / 2, y = row * bh + j / 2, w = bw - j, h = bh - j;
      g.fillStyle = reds[(r() * reds.length) | 0];
      g.fillRect(x, y, w, h);
      const gr = g.createLinearGradient(0, y, 0, y + h);
      gr.addColorStop(0, 'rgba(255,220,190,0.10)'); gr.addColorStop(1, 'rgba(40,10,0,0.18)');
      g.fillStyle = gr; g.fillRect(x, y, w, h);
    }
  }
  speckle(g, W, H, 4000, ['#6e3324', '#c4775a', '#5b2a1d'], 0.4, 1.1, r, 0.1, 0.35);
  return c;
}

function plasterCanvas(base, seed) {
  const S = 256, [c, g] = mk(S, S), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, S, S);
  blotch(g, S, S, 14, 'rgba(120,105,85,1)', r, 20, 80, 0.06);
  speckle(g, S, S, 3000, ['rgba(0,0,0,0.25)', 'rgba(255,255,255,0.5)'], 0.3, 0.9, r, 0.05, 0.2);
  return c;
}

function soilCanvas(base, pebbles, seed, density = 1) {
  const S = 256, [c, g] = mk(S, S), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, S, S);
  blotch(g, S, S, 18, 'rgba(30,20,10,1)', r, 15, 60, 0.18);
  blotch(g, S, S, 10, 'rgba(255,240,210,1)', r, 15, 50, 0.08);
  speckle(g, S, S, 5000 * density, ['rgba(20,12,6,1)', 'rgba(240,225,200,1)'], 0.3, 1.0, r, 0.08, 0.3);
  speckle(g, S, S, 120 * density, pebbles, 1.2, 3.6, r, 0.5, 0.9);
  return c;
}

function tileCanvas() {
  // clay roof tiles: two courses of barrel tiles per 0.6 m
  const S = 256, [c, g] = mk(S, S), r = rng(5);
  g.fillStyle = '#5e2a19'; g.fillRect(0, 0, S, S);
  const cols = 4, rows = 2, tw = S / cols, th = S / rows;
  for (let row = 0; row < rows; row++) for (let k = 0; k < cols; k++) {
    const x = k * tw + (row % 2 ? tw / 2 : 0), y = row * th;
    for (const ox of [0, -S]) {
      const gr = g.createLinearGradient(x + ox, 0, x + ox + tw, 0);
      const base = ['#a24f2d', '#ad5a35', '#97462a', '#b4643c'][(r() * 4) | 0];
      gr.addColorStop(0, '#5c2817'); gr.addColorStop(0.2, base); gr.addColorStop(0.55, '#c77a50'); gr.addColorStop(0.85, base); gr.addColorStop(1, '#5c2817');
      g.fillStyle = gr; g.fillRect(x + ox + 1, y + 2, tw - 2, th - 4);
    }
    g.fillStyle = 'rgba(30,10,5,0.35)'; g.fillRect(0, y + th - 8, S, 8);
  }
  speckle(g, S, S, 1500, ['#3e1a0e', '#e19a70'], 0.3, 1, r, 0.1, 0.3);
  return c;
}

function woodCanvas() {
  const S = 256, [c, g] = mk(S, S), r = rng(9);
  g.fillStyle = '#a27a4f'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 70; i++) {
    const y = r() * S;
    g.strokeStyle = r() > 0.5 ? 'rgba(90,55,25,0.35)' : 'rgba(210,170,120,0.25)';
    g.lineWidth = 0.6 + r() * 1.6;
    g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= S; x += 16) g.lineTo(x, y + Math.sin(x / 30 + i) * 2.5);
    g.stroke();
  }
  return c;
}

function plywoodCanvas() {
  const S = 256, [c, g] = mk(S, S), r = rng(21);
  g.fillStyle = '#c9a46a'; g.fillRect(0, 0, S, S);
  blotch(g, S, S, 12, 'rgba(120,80,30,1)', r, 30, 90, 0.12);
  for (let i = 0; i < 40; i++) {
    const y = r() * S; g.strokeStyle = 'rgba(120,80,35,0.25)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(80, y + 6, 170, y - 6, S, y); g.stroke();
  }
  return c;
}

function groundCanvas() {
  return soilCanvas('#8b7a5f', ['#6e655a', '#a89c86', '#5a4b3a', '#c0b39a'], 31, 1.4);
}

function std(params) {
  const m = new THREE.MeshStandardMaterial(params);
  m.envMapIntensity = params.envMapIntensity ?? 0.55;
  return m;
}

export function createMaterials() {
  const M = {};
  M.concrete = std({ map: toTex(concreteCanvas(), 2.4, 2.4), roughness: 0.9 });
  M.blinding = std({ map: toTex(concreteCanvas('#8d8b83', 17), 1.2, 1.2), roughness: 1 });
  M.brick = std({ map: toTex(brickCanvas(), 1.04, 0.6), roughness: 0.95 });
  M.plaster = std({ map: toTex(plasterCanvas('#dccdb3', 4), 2, 2), roughness: 0.95 });
  M.plasterIn = std({ map: toTex(plasterCanvas('#ece8df', 8), 2, 2), roughness: 0.95 });
  M.block = std({ map: toTex(concreteCanvas('#8f918d', 41), 0.8, 0.8), roughness: 1 });
  M.ground = std({ map: toTex(groundCanvas(), 3, 3), roughness: 1 });
  M.soil1 = std({ map: toTex(soilCanvas('#6b5641', ['#4b3b2c', '#9c8a6d'], 12), 2, 2), roughness: 1 });
  M.soil2 = std({ map: toTex(soilCanvas('#8a6b4a', ['#5d452f', '#b0906a'], 13, 0.6), 2, 2), roughness: 1 });
  M.soil3 = std({ map: toTex(soilCanvas('#bfa070', ['#8d7550', '#e0c594'], 14, 1.2), 2, 2), roughness: 1 });
  M.soil4 = std({ map: toTex(soilCanvas('#77746c', ['#4e4c47', '#a9a59b', '#353431'], 15, 2.2), 2, 2), roughness: 1 });
  M.roofTile = std({ map: toTex(tileCanvas(), 0.6, 0.6), roughness: 0.7 });
  M.wood = std({ map: toTex(woodCanvas(), 1.2, 0.3), roughness: 0.8 });
  M.plywood = std({ map: toTex(plywoodCanvas(), 1.2, 1.2), roughness: 0.85 });
  M.steel = std({ color: 0x5d544c, metalness: 0.55, roughness: 0.42, envMapIntensity: 0.9 });
  M.steelPaint = std({ color: 0x2c3134, metalness: 0.4, roughness: 0.5 });
  M.pipeCold = std({ color: 0x2f74c8, roughness: 0.35 });
  M.pipeHot = std({ color: 0xc8432f, roughness: 0.35 });
  M.pipeSupply = std({ color: 0x3f8f5a, roughness: 0.35 });
  M.pipeDrain = std({ color: 0xcfd2cf, roughness: 0.45 });
  M.pipeBuried = std({ color: 0xd06a2c, roughness: 0.5 });
  M.conduit = std({ color: 0xf0b429, roughness: 0.55 });
  M.glass = std({ color: 0x9fc3d6, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.38, envMapIntensity: 1.4, depthWrite: false });
  M.frame = std({ color: 0x3a4043, metalness: 0.5, roughness: 0.4 });
  M.doorWood = std({ map: toTex(woodCanvas(), 0.9, 0.9), color: 0x9a6a45, roughness: 0.7 });
  M.tank = std({ color: 0x25292c, roughness: 0.6 });
  M.membrane = std({ color: 0x2a2c2e, roughness: 0.9 });
  M.insulation = std({ color: 0x6fa8d6, roughness: 0.8 });
  M.sand = std({ map: toTex(soilCanvas('#d4bb8a', ['#b09468', '#efdcb2'], 19, 1.5), 1, 1), roughness: 1 });
  M.mortar = std({ map: toTex(soilCanvas('#b2ab9f', ['#8f887c', '#d6cfc1'], 23, 1), 1, 1), roughness: 1 });
  M.tile = std({ color: 0xd8d2c6, roughness: 0.35 });
  M.roofFinish = std({ map: toTex(concreteCanvas('#c6c1b6', 29), 1.2, 1.2), roughness: 0.85 });
  M.cover = std({ color: 0x3a3d40, metalness: 0.6, roughness: 0.5 });
  M.panel = std({ color: 0xd9dcd7, roughness: 0.5 });
  M.white = std({ color: 0xf1f1ee, roughness: 0.3 });
  M.spacer = std({ color: 0x9b9a92, roughness: 0.9 });

  // which materials fade in X-ray, and how far
  const ghost = { concrete: 0.14, blinding: 0.2, brick: 0.1, plaster: 0.1, plasterIn: 0.1, block: 0.12,
    ground: 0.08, soil1: 0.07, soil2: 0.07, soil3: 0.07, soil4: 0.07, roofTile: 0.25, roofFinish: 0.15,
    sand: 0.15, mortar: 0.15, tile: 0.2, membrane: 0.2, insulation: 0.25 };
  for (const [k, min] of Object.entries(ghost)) { M[k].userData.ghostMin = min; M[k].userData.ghost = true; }
  return M;
}

let lastGhost = -1, lastSide = THREE.FrontSide;
export function setGhost(M, amount, side = THREE.FrontSide) {
  if (Math.abs(amount - lastGhost) < 0.004 && side === lastSide) return false;
  lastGhost = amount; lastSide = side;
  for (const m of Object.values(M)) {
    if (!m.userData.ghost) continue;
    const want = amount > 0.01;
    if (m.transparent !== want || m.side !== side) { m.transparent = want; m.side = side; m.needsUpdate = true; }
    m.opacity = want ? 1 - (1 - m.userData.ghostMin) * amount : 1;
    m.depthWrite = amount < 0.35;
  }
  return true;
}
