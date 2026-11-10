// Four-storey reinforced concrete frame, shown mid-construction: exposed
// concrete, red brick infill, stair, shear wall and the service risers.
import * as THREE from 'three';
import { Model } from './builder.js';
import { buildFoundation, buildSoil } from './foundations.js';

const XS = [0, 5, 10, 15], ZS = [0, 4.5, 9];
const H = 3.2, N = 4, COL = 0.4, BW = 0.25, BD = 0.6, ST = 0.15;
const L = (i) => 'ABCD'[i], R = (j) => String(j + 1);
const lv = (i) => 0.15 + i * H; // top of slab at level i (0 = ground floor)

export function buildBuilding(M, opts = {}) {
  const m = new Model(M, 'building');
  const type = opts.foundation || 'isolated';
  m.storeys = N;

  const f = buildFoundation(m, {
    type, xs: XS, zs: ZS, colA: COL, L, R, colBars: 8, colDia: 0.016,
    fnd: { B: 2.0, h: 0.6, y0: -1.6, dia: 0.016, sp: 0.15, stripB: 1.8, raftH: 0.9 },
    tie: { w: 0.3, d: 0.6 },
    pile: { d: 0.5, s: 1.5, len: 11, capH: 1.0 },
    extraStrips: type === 'isolated' ? [{ x: 15, z: 2.25, B: 1.4, L: 2.5, code: 'D/1-2' }] : [],
  });

  const depth = type === 'piles' ? 14 : 4.8;
  buildSoil(m, { x0: -7, x1: 22, z0: -6, z1: 14, depth,
    pit: { x0: -2.2, x1: 17.2, z0: 7.1, y: type === 'piles' ? -depth : f.lowest } });

  // ground floor slab on grade
  const sGs = m.stage('groundslab');
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const x0 = XS[i] - (i === 0 ? 0.2 : 0), x1 = XS[i + 1] + (i === 2 ? 0.2 : 0);
    const z0 = ZS[j] - (j === 0 ? 0.2 : 0), z1 = ZS[j + 1] + (j === 1 ? 0.2 : 0);
    m.slab({ key: 'groundslab', x0, x1, z0, z1, yb: 0, yt: 0.15, floor: 0, stage: sGs, code: `GS-${L(i)}${L(i + 1)}/${R(j)}${R(j + 1)}`,
      sp: 0.2, dia: 0.008, cover: 0.06, level: 1, cast: false });
  }

  for (let s = 1; s <= N; s++) {
    const sc = m.stage('col' + s, 'columns', { lvl: s });
    const ss = m.stage('slab' + s, s === N ? 'roofslab' : 'slab', { lvl: s });
    const yb0 = s === 1 ? 0 : lv(s - 1), yTop = lv(s);
    XS.forEach((x, i) => ZS.forEach((z, j) => m.column({ x, z, y0: yb0, y1: yTop - ST, a: COL, floor: s, stage: sc, code: `C-${L(i)}${R(j)}`, level: s })));

    // shear wall on grid D between 1 and 2
    const swH = yTop - ST - yb0;
    m.box({ key: 'shearwall', code: 'SW-D/1-2', size: [0.3, swH, 4.5 - COL], at: [15, yb0, 2.25], floor: s, stage: sc, level: s });
    for (let z = 0.3; z <= 4.2; z += 0.2) for (const dx of [-0.1, 0.1]) m.bar([15 + dx, yb0, z], [15 + dx, yTop + 0.4, z], 0.012, s, sc);
    for (let y = yb0 + 0.1; y < yTop - ST; y += 0.25) for (const dx of [-0.112, 0.112]) m.bar([15 + dx, y, 0.15], [15 + dx, y, 4.35], 0.01, s, sc);

    // beams on every grid line
    ZS.forEach((z, j) => { for (let i = 0; i < 3; i++)
      m.beam({ axis: 'x', a0: XS[i], a1: XS[i + 1], c: z, yb: yTop - BD, yt: yTop - ST, barTop: yTop - 0.045, w: BW, floor: s, stage: ss,
        code: `B${s}-${R(j)}/${L(i)}-${L(i + 1)}`, level: s }); });
    XS.forEach((x, i) => { for (let j = 0; j < 2; j++)
      m.beam({ axis: 'z', a0: ZS[j], a1: ZS[j + 1], c: x, yb: yTop - BD, yt: yTop - ST, barTop: yTop - 0.045, w: BW, floor: s, stage: ss,
        code: `B${s}-${L(i)}/${R(j)}-${R(j + 1)}`, level: s }); });

    // slabs; bay B-C / 1-2 is the stair well below the roof
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      const x0 = XS[i] - (i === 0 ? 0.2 : 0), x1 = XS[i + 1] + (i === 2 ? 0.2 : 0);
      const z0 = ZS[j] - (j === 0 ? 0.2 : 0), z1 = ZS[j + 1] + (j === 1 ? 0.2 : 0);
      const stairWell = s < N && i === 1 && j === 0;
      if (stairWell) m.slab({ x0, x1, z0: 3.85, z1, yb: yTop - ST, yt: yTop, floor: s, stage: ss, code: `S${s}-STAIR`, level: s, sp: 0.15 });
      else m.slab({ x0, x1, z0, z1, yb: yTop - ST, yt: yTop, floor: s, stage: ss, code: `S${s}-${L(i)}${L(i + 1)}/${R(j)}${R(j + 1)}`,
        top: true, bay: [XS[i], XS[i + 1], ZS[j], ZS[j + 1]], level: s });
    }
    // stair from level s-1 up to level s
    if (s < N) {
      const y0 = lv(s - 1);
      m.stairFlight({ xL: 5.3, y: y0, z0: 3.85, dir: -1, width: 1.2, floor: s, stage: ss, code: `ST${s}-1`, level: s });
      m.box({ key: 'stair', code: `ST${s}-LND`, size: [4.4, 0.16, 1.05], at: [7.5, y0 + 1.6 - 0.16, 0.65], floor: s, stage: ss, level: s });
      m.stairFlight({ xL: 8.5, y: y0 + 1.6, z0: 1.15, dir: 1, width: 1.2, floor: s, stage: ss, code: `ST${s}-2`, level: s });
    }
  }

  // ---------- masonry ----------
  const sW = m.stage('walls');
  const winX = 1.6, winZ = 1.4, sill = 0.9, head = 2.2, lb = 0.2, lh = 0.2;
  const addWall = (axis, a0, a1, c, s, t, opening, code, key = 'brickwall') => {
    const y0 = lv(s - 1), y1 = lv(s) - BD;
    const open = opening ? [{ ...opening, lb, lh }] : [];
    m.wall({ key, axis, a0, a1, c, y0, y1, t, mat: 'brick', open, floor: s, stage: sW, code, level: s });
    if (!opening) return;
    m.beam({ key: 'lintel', axis, a0: a0 + opening.u0 - lb, a1: a0 + opening.u1 + lb, c, yb: y0 + opening.head, yt: y0 + opening.head + lh,
      w: t, floor: s, stage: sW, layer: 'masonry', code: code.replace(/^W/, 'L'), bottomBars: 2, dia: 0.012, topDia: 0.01, ext: -0.03, skip: 0.06, level: s });
    m.frame({ axis, a0, c, y0, u0: opening.u0, u1: opening.u1, v0: opening.v0, v1: opening.head, door: opening.door, floor: s,
      stage: m.stage('openings'), code: code.replace(/^W/, opening.door ? 'D' : 'WN'), level: s });
  };
  const sOpen = m.stage('openings');
  for (let s = 1; s <= N; s++) {
    for (let i = 0; i < 3; i++) {
      const a0 = XS[i] + COL / 2, a1 = XS[i + 1] - COL / 2, len = a1 - a0;
      const win = { u0: (len - winX) / 2, u1: (len + winX) / 2, v0: sill, head };
      const front = s === 1 && i === 1 ? { u0: (len - 1.4) / 2, u1: (len + 1.4) / 2, v0: 0, head: 2.3, door: true } : win;
      addWall('x', a0, a1, 9, s, 0.25, front, `W${s}-3/${L(i)}-${L(i + 1)}`);
      addWall('x', a0, a1, 0, s, 0.25, i === 1 ? null : win, `W${s}-1/${L(i)}-${L(i + 1)}`);
    }
    for (let j = 0; j < 2; j++) {
      const a0 = ZS[j] + COL / 2, a1 = ZS[j + 1] - COL / 2, len = a1 - a0;
      const win = { u0: (len - winZ) / 2, u1: (len + winZ) / 2, v0: sill, head };
      addWall('z', a0, a1, 0, s, 0.25, win, `W${s}-A/${R(j)}-${R(j + 1)}`);
      if (j === 1) addWall('z', a0, a1, 15, s, 0.25, win, `W${s}-D/${R(j)}-${R(j + 1)}`);
    }
    // interior partitions with door openings
    addWall('x', COL / 2, 5 - COL / 2, 4.5, s, 0.12, { u0: 3.2, u1: 4.1, v0: 0, head: 2.1, door: true }, `W${s}-2/A-B`, 'partition');
    addWall('z', 4.5 + COL / 2, 9 - COL / 2, 5, s, 0.12, { u0: 0.4, u1: 1.3, v0: 0, head: 2.1, door: true }, `W${s}-B/2-3`, 'partition');
  }

  // ---------- roof ----------
  const sRf = m.stage('roof');
  const yR = lv(N);
  m.box({ key: 'roof', code: 'RF-1', mat: 'roofFinish', size: [15.16, 0.14, 9.16], at: [7.5, yR, 4.5], floor: N, stage: sRf, layer: 'roof', level: 5, pour: true });
  const par = (axis, a0, a1, c, code) => m.wall({ key: 'parapet', axis, a0, a1, c, y0: yR, y1: yR + 1.05, t: 0.12, mat: 'brick', floor: N, stage: sRf, layer: 'roof', code, level: 5 });
  par('x', -0.2, 15.2, 9.14, 'PR-3'); par('x', -0.2, 15.2, -0.14, 'PR-1');
  par('z', -0.08, 9.08, -0.14, 'PR-A'); par('z', -0.08, 9.08, 15.14, 'PR-D');

  // ---------- services ----------
  const sMep = m.stage('mep');
  const tank = new THREE.Group();
  const tg = new THREE.CylinderGeometry(0.6, 0.6, 1.25, 28); tg.translate(0, 0.625, 0);
  const tankMesh = new THREE.Mesh(tg, M.tank); tankMesh.position.set(11.6, yR + 0.14 + 0.7, 1.4);
  m.reg(tankMesh, { key: 'tank', code: 'WT-1', layer: 'mep', floor: N, stage: sMep, dims: [1.2, 1.25, 1.2], volume: 0, level: 5 });
  for (const [dx, dz] of [[-0.45, -0.45], [0.45, -0.45], [0.45, 0.45], [-0.45, 0.45]])
    m.pipe({ key: 'tank', code: 'WT-1', a: [11.6 + dx, yR + 0.14, 1.4 + dz], b: [11.6 + dx, yR + 0.86, 1.4 + dz], r: 0.03, mat: 'steelPaint', floor: N, stage: sMep, seg: 6, level: 5 });
  tank.clear();

  const PX = 10.5, PZ = 0.42; // riser shaft next to column C1
  for (let s = 1; s <= N; s++) {
    const y0 = lv(s - 1), y1 = lv(s);
    m.pipe({ key: 'waterpipe', code: `WS-${s}`, a: [PX, y0, PZ], b: [PX, y1, PZ], r: 0.018, mat: 'pipeSupply', floor: s, stage: sMep, level: s });
    m.pipe({ key: 'waterpipe', code: `WS-${s}a`, a: [PX, y0 + 0.5, PZ], b: [13.6, y0 + 0.5, PZ], r: 0.014, mat: 'pipeSupply', floor: s, stage: sMep, level: s });
    m.pipe({ key: 'drainpipe', code: `DS-${s}`, a: [PX + 0.32, y0, PZ + 0.05], b: [PX + 0.32, y1, PZ + 0.05], r: 0.055, mat: 'pipeDrain', floor: s, stage: sMep, level: s });
    m.pipe({ key: 'drainpipe', code: `DB-${s}`, a: [PX + 0.36, y1 - ST - 0.16, PZ + 0.05], b: [13.4, y1 - ST - 0.12, PZ + 0.05], r: 0.04, mat: 'pipeDrain', floor: s, stage: sMep, level: s });
    m.pipe({ key: 'conduit', code: `EC-${s}`, a: [PX - 0.18, y0, PZ + 0.22], b: [PX - 0.18, y1, PZ + 0.22], r: 0.012, mat: 'conduit', floor: s, stage: sMep, seg: 8, level: s });
    m.pipe({ key: 'conduit', code: `EC-${s}x`, a: [PX - 0.18, y1 - 0.07, PZ + 0.22], b: [14.4, y1 - 0.07, PZ + 0.22], r: 0.011, mat: 'conduit', floor: s, stage: sMep, seg: 8, level: s });
    m.pipe({ key: 'conduit', code: `EC-${s}z`, a: [PX - 0.18, y1 - 0.075, PZ + 0.22], b: [PX - 0.18, y1 - 0.075, 8.6], r: 0.011, mat: 'conduit', floor: s, stage: sMep, seg: 8, level: s });
    m.box({ key: 'dbpanel', code: `DB-${s}`, mat: 'panel', size: [0.42, 0.55, 0.1], at: [11.6, y0 + 1.35, 0.18], floor: s, stage: sMep, layer: 'mep', level: s, pour: false });
  }
  m.pipe({ key: 'waterpipe', code: 'WS-R', a: [PX, yR, PZ], b: [PX, yR + 0.5, PZ], r: 0.018, mat: 'pipeSupply', floor: N, stage: sMep, level: 5 });
  m.pipe({ key: 'waterpipe', code: 'WS-R', a: [PX, yR + 0.5, PZ], b: [11.6, yR + 0.5, 1.4], r: 0.018, mat: 'pipeSupply', floor: N, stage: sMep, level: 5 });
  m.pipe({ key: 'drainpipe', code: 'DS-V', a: [PX + 0.32, yR, PZ + 0.05], b: [PX + 0.32, yR + 1.4, PZ + 0.05], r: 0.055, mat: 'pipeDrain', floor: N, stage: sMep, level: 5 });
  m.pipe({ key: 'drainpipe', code: 'DS-0', a: [PX + 0.32, -0.8, PZ + 0.05], b: [PX + 0.32, 0.15, PZ + 0.05], r: 0.055, mat: 'pipeBuried', floor: 0, stage: sMep, level: 0 });
  m.pipe({ key: 'drainpipe', code: 'DH-0', a: [PX + 0.32, -0.8, PZ + 0.05], b: [PX + 0.32, -0.86, -1.6], r: 0.055, mat: 'pipeBuried', floor: 0, stage: sMep, level: 0 });
  m.box({ key: 'chamber', code: 'IC-1', size: [0.9, 1.1, 0.9], at: [PX + 0.32, -1.08, -1.95], floor: 0, stage: sMep, layer: 'mep', level: 0, pour: false });
  m.box({ key: 'chamber', code: 'IC-1', mat: 'cover', size: [0.7, 0.05, 0.7], at: [PX + 0.32, 0.0, -1.95], floor: 0, stage: sMep, layer: 'mep', level: 0, pour: false });

  m.finalize();
  m.center = new THREE.Vector3(7.5, 5.5, 4.5);
  m.view = { pos: new THREE.Vector3(-14, 15, 31), target: new THREE.Vector3(7.5, 4.2, 4.5) };
  m.explodeGap = 2.4;
  void sOpen;
  return m;
}
