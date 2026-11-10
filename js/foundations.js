// Foundation systems shared by the building and the house, plus the soil
// diorama with a cut face so the strata and the footings stay visible.
import { boxGeo } from './builder.js';
import * as THREE from 'three';

export const FOUNDATION_TYPES = ['isolated', 'strip', 'raft', 'piles'];

// o: { type, xs, zs, colA, gridCode(i,j), fnd: {B, h, y0}, tie: {w, d}, pile: {...} }
export function buildFoundation(m, o) {
  const { xs, zs, colA } = o, type = o.type;
  const F = o.fnd, tie = o.tie;
  const sBl = m.stage('blinding');
  let sPile = null;
  if (type === 'piles') sPile = m.stage('piles');
  const sFt = m.stage('footings', type === 'raft' ? 'raft' : type === 'piles' ? 'pilecaps' : type === 'strip' ? 'strips' : 'footings');
  const sNk = m.stage('necks');
  const sTb = m.stage('tiebeams');
  const tieTop = 0;
  let top = F.y0 + F.h; // top of the foundation concrete
  const lowest = { y: F.y0 - 0.1 };

  if (type === 'isolated') {
    xs.forEach((x, i) => zs.forEach((z, j) => {
      const code = (o.L(i) + o.R(j));
      const B = (o.sizeAt?.(i, j)) ?? F.B;
      m.blinding({ x, z, B: B + 0.3, L: B + 0.3, y0: F.y0 - 0.1, stage: sBl, code: 'PL-' + code });
      m.footing({ x, z, B, h: F.h, y0: F.y0, stage: sFt, code: 'F-' + code, dia: F.dia, sp: F.sp });
      m.starters({ x, z, a: colA, b: colA, yb: F.y0 + 0.1, yt: tieTop + 0.6, stage: sFt, bars: o.colBars, dia: o.colDia });
    }));
    for (const w of o.extraStrips || []) {
      m.blinding({ x: w.x, z: w.z, B: w.B + 0.3, L: w.L + 0.3, y0: F.y0 - 0.1, stage: sBl, code: 'PL-' + w.code });
      m.footing({ x: w.x, z: w.z, B: w.B, L: w.L, h: F.h, y0: F.y0, stage: sFt, code: 'F-' + w.code, key: 'strip', meta: false });
    }
  } else if (type === 'strip') {
    const B = F.stripB ?? F.B * 0.8;
    const x0 = xs[0] - B / 2 - 0.2, x1 = xs[xs.length - 1] + B / 2 + 0.2, cx = (x0 + x1) / 2, L = x1 - x0;
    zs.forEach((z, j) => {
      m.blinding({ x: cx, z, B: L + 0.3, L: B + 0.3, y0: F.y0 - 0.1, stage: sBl, code: 'PL-S' + (j + 1) });
      // main bars run across the strip (short direction), distribution bars along it
      m.footing({ x: cx, z, B: L, L: B, h: F.h, y0: F.y0, stage: sFt, code: 'SF-' + (j + 1), key: 'strip', spX: 0.15, spZ: 0.25, meta: false });
      xs.forEach((x, i) => {
        m.meta.footings.push({ x, z, y: F.y0, B: Math.min(B * 1.6, 2.4), L: B });
        m.starters({ x, z, a: colA, b: colA, yb: F.y0 + 0.1, yt: tieTop + 0.6, stage: sFt, bars: o.colBars, dia: o.colDia });
      });
    });
  } else if (type === 'raft') {
    const h = F.raftH ?? 0.8, mg = 1.0;
    const x0 = xs[0] - mg, x1 = xs[xs.length - 1] + mg, z0 = zs[0] - mg, z1 = zs[zs.length - 1] + mg;
    F.y0r = F.y0 + F.h - h;
    m.blinding({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, B: x1 - x0 + 0.3, L: z1 - z0 + 0.3, y0: F.y0r - 0.1, stage: sBl, code: 'PL-R' });
    m.footing({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, B: x1 - x0, L: z1 - z0, h, y0: F.y0r, stage: sFt, code: 'R-1', key: 'raft', sp: 0.2, top: true, meta: false, dia: 0.018 });
    xs.forEach((x) => zs.forEach((z) => {
      m.meta.footings.push({ x, z, y: F.y0r, B: 2.6, L: 2.6 });
      m.starters({ x, z, a: colA, b: colA, yb: F.y0r + 0.1, yt: tieTop + 0.6, stage: sFt, bars: o.colBars, dia: o.colDia });
    }));
    lowest.y = F.y0r - 0.1;
  } else if (type === 'piles') {
    const P = o.pile, capH = P.capH, capB = P.s + P.d + 0.5, capY = F.y0 + F.h - capH;
    xs.forEach((x, i) => zs.forEach((z, j) => {
      const code = (o.L(i) + o.R(j));
      m.blinding({ x, z, B: capB + 0.3, L: capB + 0.3, y0: capY - 0.1, stage: sBl, code: 'PL-' + code });
      for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const cx = x + (px * P.s) / 2, cz = z + (pz * P.s) / 2, yTop = capY + 0.1, yBot = capY - P.len;
        const g = new THREE.CylinderGeometry(P.d / 2, P.d / 2, yTop - yBot, 20);
        g.translate(0, (yTop - yBot) / 2, 0);
        const mesh = new THREE.Mesh(g, m.M.concrete); mesh.position.set(cx, yBot, cz);
        m.reg(mesh, { key: 'pile', code: 'P-' + code + '-' + (pz < 0 ? (px < 0 ? 'a' : 'b') : px > 0 ? 'c' : 'd'), layer: 'foundation', floor: 0, stage: sPile,
          dims: [P.d, yTop - yBot, P.d], volume: Math.PI * (P.d / 2) ** 2 * (yTop - yBot), pour: true });
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2, r = P.d / 2 - 0.075;
          m.bar([cx + Math.cos(a) * r, yBot + 0.1, cz + Math.sin(a) * r], [cx + Math.cos(a) * r, yTop + 0.55, cz + Math.sin(a) * r], 0.018, 0, sPile);
        }
        for (let y = yBot + 0.3; y < yTop; y += 0.9) m.ring(cx, y, cz, P.d / 2 - 0.065, 10, 0.008, 0, sPile);
        m.meta.piles.push({ x: cx, z: cz, yTop: capY, yBot });
      }
      m.footing({ x, z, B: capB, h: capH, y0: capY, stage: sFt, code: 'CAP-' + code, key: 'pilecap', top: true, meta: false, dia: 0.018 });
      m.meta.footings.push({ x, z, y: capY, B: capB, L: capB, cap: true });
      m.starters({ x, z, a: colA, b: colA, yb: capY + 0.12, yt: tieTop + 0.6, stage: sFt, bars: o.colBars, dia: o.colDia });
    }));
    lowest.y = capY - P.len;
    top = F.y0 + F.h;
  }

  // neck columns: foundation top to underside of the ground floor
  xs.forEach((x, i) => zs.forEach((z, j) => {
    m.column({ key: 'neck', code: 'N-' + (o.L(i) + o.R(j)), x, z, y0: top, y1: tieTop, a: colA, floor: 0, stage: sNk,
      layer: 'foundation', bars: o.colBars, dia: o.colDia, meta: false, lap: 0.45 });
  }));
  // tie beams on every grid line
  const yb = tieTop - tie.d;
  zs.forEach((z, j) => {
    for (let i = 0; i < xs.length - 1; i++)
      m.beam({ key: 'tiebeam', axis: 'x', a0: xs[i], a1: xs[i + 1], c: z, yb, yt: tieTop, w: tie.w, floor: 0, stage: sTb,
        layer: 'foundation', code: `TB-${o.R(j)}/${o.L(i)}-${o.L(i + 1)}`, barTop: tieTop - 0.045, bottomBars: 3 });
  });
  xs.forEach((x, i) => {
    for (let j = 0; j < zs.length - 1; j++)
      m.beam({ key: 'tiebeam', axis: 'z', a0: zs[j], a1: zs[j + 1], c: x, yb, yt: tieTop, w: tie.w, floor: 0, stage: sTb,
        layer: 'foundation', code: `TB-${o.L(i)}/${o.R(j)}-${o.R(j + 1)}`, barTop: tieTop - 0.045, bottomBars: 3 });
  });
  return { lowest: lowest.y };
}

// Layered soil block with an open pit in front of the building.
export function buildSoil(m, o) {
  const { x0, x1, z0, z1, pit, depth } = o;
  const layers = [
    { mat: 'ground', t: 0.5 }, { mat: 'soil2', t: 1.7 }, { mat: 'soil3', t: 1.6 }, { mat: 'soil4', t: 99 },
  ];
  let y = 0; const parts = [];
  for (const L of layers) {
    const ya = y, yb = Math.max(-depth, y - L.t); y = yb;
    if (ya <= -depth + 1e-6) break;
    // back block, two side blocks in front, and the pit floor
    parts.push([L.mat, x0, x1, z0, pit.z0, ya, yb]);
    parts.push([L.mat, x0, pit.x0, pit.z0, z1, ya, yb]);
    parts.push([L.mat, pit.x1, x1, pit.z0, z1, ya, yb]);
    const fy = Math.min(ya, pit.y);
    if (fy > yb + 1e-3) parts.push([L.mat, pit.x0, pit.x1, pit.z0, z1, fy, yb]);
    if (yb <= -depth + 1e-6) break;
  }
  for (const [mat, a0, a1, b0, b1, ya, yb] of parts) {
    if (a1 - a0 < 0.01 || b1 - b0 < 0.01) continue;
    const w = a1 - a0, h = ya - yb, d = b1 - b0;
    const mesh = new THREE.Mesh(boxGeo(w, h, d, a0, yb, b0), m.M[mat]);
    mesh.position.set((a0 + a1) / 2, yb, (b0 + b1) / 2);
    m.reg(mesh, { key: 'soil', layer: 'soil', floor: 0, stage: 0, static: true, cast: false, dims: [w, h, d], volume: w * h * d, code: 'GL' });
  }
  return { bottom: -depth };
}
