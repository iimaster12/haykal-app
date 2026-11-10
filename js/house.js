// Two-storey house: RC frame on isolated footings and tie beams (the system in
// the reference clip), block walls, a cantilever balcony, a timber truss roof.
// Concrete and block switch to plaster in the last build stage.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Model, boxGeo } from './builder.js';
import { buildFoundation, buildSoil } from './foundations.js';

const XS = [0, 4.5, 9], ZS = [0, 4, 8];
const H = 3.0, N = 2, COL = 0.25, BW = 0.25, BD = 0.5, ST = 0.12;
const L = (i) => 'ABC'[i], R = (j) => String(j + 1);
const lv = (i) => 0.15 + i * H;
const PITCH = Math.PI / 6;

function stick(a, b, w, h) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const len = A.distanceTo(B);
  const g = new THREE.BoxGeometry(w, h, len);
  const o = new THREE.Object3D(); o.position.copy(A).add(B).multiplyScalar(0.5); o.lookAt(B); o.updateMatrix();
  g.applyMatrix4(o.matrix);
  return g;
}

export function buildHouse(M, opts = {}) {
  const m = new Model(M, 'house');
  const type = opts.foundation || 'isolated';
  m.storeys = N;
  const finish = [];
  const plaster = (mesh) => { finish.push(mesh); return mesh; };

  const f = buildFoundation(m, {
    type, xs: XS, zs: ZS, colA: COL, L, R, colBars: 4, colDia: 0.012,
    fnd: { B: 1.4, h: 0.45, y0: -1.2, dia: 0.012, sp: 0.15, stripB: 1.1, raftH: 0.6 },
    tie: { w: 0.25, d: 0.5 },
    pile: { d: 0.4, s: 1.2, len: 8, capH: 0.7 },
  });
  const depth = type === 'piles' ? 10.5 : 4.2;
  buildSoil(m, { x0: -6, x1: 15, z0: -5.5, z1: 12.5, depth,
    pit: { x0: -1.8, x1: 10.8, z0: 6.9, y: type === 'piles' ? -depth : f.lowest } });

  const sGs = m.stage('groundslab');
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const x0 = XS[i] - (i === 0 ? 0.125 : 0), x1 = XS[i + 1] + (i === 1 ? 0.125 : 0);
    const z0 = ZS[j] - (j === 0 ? 0.125 : 0), z1 = ZS[j + 1] + (j === 1 ? 0.125 : 0);
    m.slab({ key: 'groundslab', x0, x1, z0, z1, yb: 0, yt: 0.15, floor: 0, stage: sGs, code: `GS-${L(i)}${L(i + 1)}/${R(j)}${R(j + 1)}`,
      sp: 0.2, dia: 0.008, cover: 0.06, level: 1, cast: false });
  }

  for (let s = 1; s <= N; s++) {
    const sc = m.stage('col' + s, 'columns', { lvl: s });
    const ss = m.stage('slab' + s, s === N ? 'ringbeam' : 'slab', { lvl: s });
    const yb0 = s === 1 ? 0 : lv(s - 1), yTop = lv(s), hasSlab = s < N;
    const beamTop = hasSlab ? yTop - ST : yTop;
    XS.forEach((x, i) => ZS.forEach((z, j) => plaster(m.column({ x, z, y0: yb0, y1: beamTop, a: COL, bars: 4, dia: 0.012, sp: 0.2,
      floor: s, stage: sc, code: `C-${L(i)}${R(j)}`, level: s }))));
    ZS.forEach((z, j) => { for (let i = 0; i < 2; i++)
      plaster(m.beam({ axis: 'x', a0: XS[i], a1: XS[i + 1], c: z, yb: yTop - BD, yt: beamTop, barTop: yTop - 0.04, w: BW, floor: s, stage: ss,
        code: `B${s}-${R(j)}/${L(i)}-${L(i + 1)}`, level: s, dia: 0.014, bottomBars: 3 })); });
    XS.forEach((x, i) => { for (let j = 0; j < 2; j++)
      plaster(m.beam({ axis: 'z', a0: ZS[j], a1: ZS[j + 1], c: x, yb: yTop - BD, yt: beamTop, barTop: yTop - 0.04, w: BW, floor: s, stage: ss,
        code: `B${s}-${L(i)}/${R(j)}-${R(j + 1)}`, level: s, dia: 0.014, bottomBars: 3 })); });
    if (hasSlab) {
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const x0 = XS[i] - (i === 0 ? 0.125 : 0), x1 = XS[i + 1] + (i === 1 ? 0.125 : 0);
        const z0 = ZS[j] - (j === 0 ? 0.125 : 0), z1 = ZS[j + 1] + (j === 1 ? 0.125 : 0);
        m.slab({ x0, x1, z0, z1, yb: yTop - ST, yt: yTop, floor: s, stage: ss, code: `S${s}-${L(i)}${L(i + 1)}/${R(j)}${R(j + 1)}`,
          top: true, bay: [XS[i], XS[i + 1], ZS[j], ZS[j + 1]], level: s, sp: 0.15 });
      }
      // cantilever balcony: main steel on top, anchored back into the slab
      const bx0 = 4.6, bx1 = 8.9, bz0 = 8.125, bz1 = 9.45;
      m.box({ key: 'balcony', code: `BL${s}-1`, size: [bx1 - bx0, ST, bz1 - bz0], at: [(bx0 + bx1) / 2, yTop - ST, (bz0 + bz1) / 2], floor: s, stage: ss, level: s });
      for (let x = bx0 + 0.05; x <= bx1 - 0.05; x += 0.15) m.poly([[x, yTop - 0.03, 6.6], [x, yTop - 0.03, bz1 - 0.04], [x, yTop - 0.09, bz1 - 0.04]], 0.012, s, ss);
      for (let z = 8.3; z <= bz1 - 0.05; z += 0.2) m.bar([bx0 + 0.04, yTop - 0.045, z], [bx1 - 0.04, yTop - 0.045, z], 0.008, s, ss);
      for (let z = 8.2; z <= bz1 - 0.05; z += 0.2) m.bar([bx0 + 0.04, yTop - ST + 0.03, z], [bx1 - 0.04, yTop - ST + 0.03, z], 0.008, s, ss);
    }
  }

  // ---------- block walls ----------
  const sW = m.stage('walls');
  const sOp = m.stage('openings');
  const lb = 0.2, lh = 0.2;
  const addWall = (axis, a0, a1, c, s, t, opens, code, key = 'blockwall') => {
    const y0 = lv(s - 1), y1 = lv(s) - BD;
    const open = opens.map((o) => ({ ...o, lb, lh }));
    plaster(m.wall({ key, axis, a0, a1, c, y0, y1, t, mat: 'block', open, floor: s, stage: sW, code, level: s }));
    open.forEach((o, k) => {
      plaster(m.beam({ key: 'lintel', axis, a0: a0 + o.u0 - lb, a1: a0 + o.u1 + lb, c, yb: y0 + o.head, yt: y0 + o.head + lh, w: t, floor: s, stage: sW,
        layer: 'masonry', code: code.replace(/^W/, 'L') + (k ? '-' + k : ''), bottomBars: 2, dia: 0.012, topDia: 0.01, ext: -0.03, skip: 0.06, level: s }));
      m.frame({ axis, a0, c, y0, u0: o.u0, u1: o.u1, v0: o.v0, v1: o.head, door: o.door, floor: s, stage: sOp,
        code: code.replace(/^W/, o.door ? 'D' : 'WN') + (k ? '-' + k : ''), level: s });
    });
  };
  const win = (len, w, sill = 0.9, head = 2.1) => ({ u0: (len - w) / 2, u1: (len + w) / 2, v0: sill, head });
  const xa = (i) => [XS[i] + COL / 2, XS[i + 1] - COL / 2], za = (j) => [ZS[j] + COL / 2, ZS[j + 1] - COL / 2];
  for (let s = 1; s <= N; s++) {
    for (let i = 0; i < 2; i++) {
      const [a0, a1] = xa(i), len = a1 - a0;
      let front;
      if (s === 1) front = i === 0 ? [{ u0: 1.6, u1: 2.6, v0: 0, head: 2.2, door: true }] : [win(len, 1.8)];
      else front = i === 0 ? [win(len, 1.6)] : [{ u0: 0.4, u1: 1.4, v0: 0, head: 2.2 }, { u0: 2.2, u1: 3.6, v0: 0.9, head: 2.1 }];
      addWall('x', a0, a1, 8, s, 0.24, front, `W${s}-3/${L(i)}-${L(i + 1)}`);
      addWall('x', a0, a1, 0, s, 0.24, [i === 1 ? win(len, 0.6, 1.5, 2.1) : win(len, 1.2)], `W${s}-1/${L(i)}-${L(i + 1)}`);
    }
    for (let j = 0; j < 2; j++) {
      const [a0, a1] = za(j), len = a1 - a0;
      addWall('z', a0, a1, 0, s, 0.24, [win(len, 1.2)], `W${s}-A/${R(j)}-${R(j + 1)}`);
      addWall('z', a0, a1, 9, s, 0.24, [win(len, j === 0 ? 0.6 : 1.2, j === 0 ? 1.5 : 0.9)], `W${s}-C/${R(j)}-${R(j + 1)}`);
    }
  }
  addWall('x', ...xa(0), 4, 1, 0.12, [{ u0: 2.9, u1: 3.75, v0: 0, head: 2.1, door: true }], 'W1-2/A-B', 'partition');
  addWall('z', ...za(1), 4.5, 2, 0.12, [{ u0: 0.4, u1: 1.25, v0: 0, head: 2.1, door: true }], 'W2-B/2-3', 'partition');

  // balcony railing
  {
    const y0 = lv(1), parts = [], hgt = 1.05;
    const post = (x, z) => { const g = new THREE.BoxGeometry(0.04, hgt, 0.04); g.translate(x, y0 + hgt / 2, z); parts.push(g); };
    for (let x = 4.65; x <= 8.86; x += 0.12) post(x, 9.4);
    for (let z = 8.3; z <= 9.4; z += 0.12) { post(4.65, z); post(8.85, z); }
    parts.push(stick([4.62, y0 + hgt, 9.4], [8.88, y0 + hgt, 9.4], 0.06, 0.04));
    parts.push(stick([4.65, y0 + hgt, 8.2], [4.65, y0 + hgt, 9.4], 0.06, 0.04));
    parts.push(stick([8.85, y0 + hgt, 8.2], [8.85, y0 + hgt, 9.4], 0.06, 0.04));
    const rail = new THREE.Mesh(mergeGeometries(parts), M.steelPaint);
    m.reg(rail, { key: 'railing', code: 'RL-1', layer: 'openings', floor: 1, stage: sOp, dims: [4.25, hgt, 1.2], level: 1 });
  }

  // ---------- timber roof ----------
  const sRf = m.stage('truss');
  const yE = lv(N), rise = 4 * Math.tan(PITCH), chordY = yE + 0.08, ridgeY = chordY + rise, ov = 0.6;
  const slopeY = (z) => chordY + (z <= 4 ? z : 8 - z) * Math.tan(PITCH);
  for (let k = 0; k <= 9; k++) {
    const x = k * 1.0, parts = [];
    parts.push(stick([x, chordY, -0.1], [x, chordY, 8.1], 0.05, 0.16));
    parts.push(stick([x, slopeY(0) - ov * Math.tan(PITCH) + 0.08, -ov], [x, ridgeY + 0.08, 4], 0.05, 0.16));
    parts.push(stick([x, slopeY(8) - ov * Math.tan(PITCH) + 0.08, 8 + ov], [x, ridgeY + 0.08, 4], 0.05, 0.16));
    parts.push(stick([x, chordY, 4], [x, ridgeY, 4], 0.05, 0.14));
    parts.push(stick([x, chordY + 0.05, 4], [x, slopeY(2), 2], 0.05, 0.1));
    parts.push(stick([x, chordY + 0.05, 4], [x, slopeY(6), 6], 0.05, 0.1));
    const t = new THREE.Mesh(mergeGeometries(parts), M.wood);
    m.reg(t, { key: 'truss', code: `TR-${k + 1}`, layer: 'roof', floor: N, stage: sRf, dims: [0.05, rise, 8], level: 5 });
  }
  const purl = [];
  for (const side of [0, 1]) for (let d = 0.2; d <= 4.6; d += 0.9) {
    const z = side ? 8 + ov - d : -ov + d, zz = Math.min(Math.max(z, -ov), 8 + ov);
    const y = (zz < 0 || zz > 8 ? slopeY(zz < 0 ? 0 : 8) - Math.abs(zz < 0 ? zz : zz - 8) * Math.tan(PITCH) : slopeY(zz)) + 0.2;
    purl.push(stick([-0.45, y, zz], [9.45, y, zz], 0.075, 0.06));
  }
  m.reg(new THREE.Mesh(mergeGeometries(purl), M.wood), { key: 'purlin', code: 'PU-1', layer: 'roof', floor: N, stage: sRf, dims: [9.9, 0.06, 0.075], level: 5 });

  const sTl = m.stage('tiles');
  const slopeLen = Math.hypot(4 + ov, (4 + ov) * Math.tan(PITCH));
  for (const side of [0, 1]) {
    const g = boxGeo(10.0, 0.035, slopeLen); g.translate(0, 0, 0);
    const tile = new THREE.Mesh(g, M.roofTile);
    const e = side ? 8 + ov : -ov, eY = chordY - ov * Math.tan(PITCH) + 0.24;
    const top = new THREE.Vector3(4.5, ridgeY + 0.24, 4), eave = new THREE.Vector3(4.5, eY, e);
    tile.position.copy(eave).add(top).multiplyScalar(0.5);
    tile.lookAt(top); tile.translateZ(-slopeLen / 2 + slopeLen / 2);
    // boxGeo puts the base at y = 0 and centres z; shift back to centre on z
    tile.geometry.translate(0, 0, 0);
    m.reg(tile, { key: 'rooftiles', code: side ? 'RT-S' : 'RT-N', layer: 'roof', floor: N, stage: sTl, dims: [10, 0.035, slopeLen], level: 5 });
  }
  m.reg(new THREE.Mesh(stick([-0.5, ridgeY + 0.27, 4], [9.5, ridgeY + 0.27, 4], 0.22, 0.12), M.roofTile),
    { key: 'rooftiles', code: 'RT-RG', layer: 'roof', floor: N, stage: sTl, dims: [10, 0.12, 0.22], level: 5 });
  // gable walls
  for (const x of [0, 9]) {
    const s = new THREE.Shape([new THREE.Vector2(-0.12, 0), new THREE.Vector2(8.12, 0), new THREE.Vector2(4, rise + 0.08)]);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.24, bevelEnabled: false }); g.translate(0, 0, -0.12);
    const gm = new THREE.Mesh(g, M.block); gm.position.set(x, yE, 0); gm.rotation.y = -Math.PI / 2;
    plaster(m.reg(gm, { key: 'gable', code: x ? 'GW-C' : 'GW-A', layer: 'masonry', floor: N, stage: sW, dims: [8, rise, 0.24], volume: 4 * rise * 0.24, pour: true, level: 5 }));
  }

  // ---------- services ----------
  const sMep = m.stage('mep');
  const px = 8.55, pz = 0.3;
  for (let s = 1; s <= N; s++) {
    const y0 = lv(s - 1), y1 = s < N ? lv(s) : lv(s) - 0.6;
    m.pipe({ key: 'waterpipe', code: `CW-${s}`, a: [px, y0, pz], b: [px, y1, pz], r: 0.0125, mat: 'pipeCold', floor: s, stage: sMep, level: s });
    m.pipe({ key: 'waterpipe', code: `CW-${s}h`, a: [px, y0 + 0.9, pz], b: [6.2, y0 + 0.9, pz], r: 0.0125, mat: 'pipeCold', floor: s, stage: sMep, level: s });
    m.pipe({ key: 'hotpipe', code: `HW-${s}`, a: [px - 0.1, y0 + 0.6, pz], b: [px - 0.1, y1, pz], r: 0.0125, mat: 'pipeHot', floor: s, stage: sMep, level: s });
    m.pipe({ key: 'hotpipe', code: `HW-${s}h`, a: [px - 0.1, y0 + 0.75, pz], b: [6.2, y0 + 0.75, pz], r: 0.0125, mat: 'pipeHot', floor: s, stage: sMep, level: s });
    m.pipe({ key: 'drainpipe', code: `DS-${s}`, a: [px + 0.2, y0, pz + 0.05], b: [px + 0.2, s < N ? lv(s) : ridgeY - 0.9, pz + 0.05], r: 0.055, mat: 'pipeDrain', floor: s, stage: sMep, level: s });
  }
  m.pipe({ key: 'drainpipe', code: 'DS-0', a: [px + 0.2, -0.68, pz + 0.05], b: [px + 0.2, 0.15, pz + 0.05], r: 0.055, mat: 'pipeBuried', floor: 0, stage: sMep, level: 0 });
  m.pipe({ key: 'drainpipe', code: 'DH-0', a: [px + 0.2, -0.68, pz + 0.05], b: [px + 0.2, -0.74, -1.45], r: 0.055, mat: 'pipeBuried', floor: 0, stage: sMep, level: 0 });
  m.box({ key: 'chamber', code: 'IC-1', size: [0.8, 1.0, 0.8], at: [px + 0.2, -0.98, -1.8], floor: 0, stage: sMep, layer: 'mep', level: 0, pour: false });
  m.box({ key: 'chamber', code: 'IC-1', mat: 'cover', size: [0.6, 0.05, 0.6], at: [px + 0.2, 0, -1.8], floor: 0, stage: sMep, layer: 'mep', level: 0, pour: false });
  m.box({ key: 'dbpanel', code: 'DB-1', mat: 'panel', size: [0.4, 0.5, 0.1], at: [0.9, 1.4, 7.82], floor: 1, stage: sMep, layer: 'mep', level: 1, pour: false });
  m.pipe({ key: 'conduit', code: 'EC-1', a: [0.9, 1.9, 7.84], b: [0.9, lv(1) - 0.06, 7.84], r: 0.011, mat: 'conduit', floor: 1, stage: sMep, seg: 8, level: 1 });
  m.pipe({ key: 'conduit', code: 'EC-1x', a: [0.9, lv(1) - 0.06, 7.84], b: [8.2, lv(1) - 0.06, 7.84], r: 0.011, mat: 'conduit', floor: 1, stage: sMep, seg: 8, level: 1 });
  m.pipe({ key: 'conduit', code: 'EC-1z', a: [2.2, lv(1) - 0.06, 7.84], b: [2.2, lv(1) - 0.06, 1.0], r: 0.011, mat: 'conduit', floor: 1, stage: sMep, seg: 8, level: 1 });
  m.pipe({ key: 'conduit', code: 'EC-1z2', a: [6.7, lv(1) - 0.06, 7.84], b: [6.7, lv(1) - 0.06, 1.0], r: 0.011, mat: 'conduit', floor: 1, stage: sMep, seg: 8, level: 1 });

  // ---------- plaster and paint ----------
  const sFin = m.stage('finish');
  for (const mesh of finish) {
    mesh.userData.roughMat = mesh.material;
    mesh.userData.finishMat = M.plaster;
    mesh.userData.finishStage = sFin;
    mesh.material = M.plaster;
  }

  m.finalize();
  m.center = new THREE.Vector3(4.5, 3.5, 4);
  m.view = { pos: new THREE.Vector3(-9.5, 9.5, 19), target: new THREE.Vector3(4.5, 2.8, 4) };
  m.explodeGap = 2.2;
  return m;
}
