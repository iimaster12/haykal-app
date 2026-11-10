// Model builder: every structural element is registered with a data key, a
// drawing code, a layer, a construction stage and a floor. Rebar is collected
// per (floor, stage) and turned into one InstancedMesh each at the end.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const UP = new THREE.Vector3(0, 1, 0);

// Box with its base at the origin and UVs in metres, offset by world position
// so textures (brick courses, formwork joints) line up across neighbours.
export function boxGeo(w, h, d, ox = 0, oy = 0, oz = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(0, h / 2, 0);
  const uv = g.attributes.uv;
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) {
    const i = f * 4 + k; let u = uv.getX(i), v = uv.getY(i);
    if (f < 2) { u = u * d + oz; v = v * h + oy; }
    else if (f < 4) { u = u * w + ox; v = v * d + oz; }
    else { u = u * w + ox; v = v * h + oy; }
    uv.setXY(i, u, v);
  }
  return g;
}

export class Model {
  constructor(M, kind) {
    this.M = M; this.kind = kind;
    this.group = new THREE.Group();
    this.floors = []; this.pick = []; this.elements = []; this.rebar = [];
    this.bars = new Map();
    this.stages = []; this.stageIdx = {};
    this.meta = { columns: [], bays: [], footings: [], piles: [] };
    this.bounds = new THREE.Box3();
    this.levels = {};
  }

  // stages are created in call order; captions come from i18n key 'st.<key>'
  stage(id, key = id, params = {}) {
    if (!(id in this.stageIdx)) { this.stageIdx[id] = this.stages.length; this.stages.push({ id, key, params }); }
    return this.stageIdx[id];
  }

  floor(i) {
    if (!this.floors[i]) {
      const g = new THREE.Group(); g.userData.floor = i;
      this.group.add(g); this.floors[i] = g;
    }
    return this.floors[i];
  }

  reg(mesh, o) {
    Object.assign(mesh.userData, {
      key: o.key, code: o.code || '', layer: o.layer || 'structure', stage: o.stage ?? 0,
      floor: o.floor || 0, dims: o.dims || null, volume: o.volume || 0, length: o.length || 0,
      pour: !!o.pour, level: o.level ?? o.floor ?? 0, static: !!o.static, density: o.density,
    });
    mesh.castShadow = o.cast !== false; mesh.receiveShadow = true;
    this.floor(mesh.userData.floor).add(mesh);
    if (o.pick !== false) this.pick.push(mesh);
    this.elements.push(mesh);
    return mesh;
  }

  box(o) {
    const [w, h, d] = o.size, [x, y, z] = o.at;
    const mat = o.mat || 'concrete';
    const mesh = new THREE.Mesh(boxGeo(w, h, d, x - w / 2, y, z - d / 2), this.M[mat]);
    mesh.position.set(x, y, z);
    return this.reg(mesh, { ...o, dims: o.dims || [w, h, d], volume: o.volume ?? w * h * d,
      pour: o.pour ?? (mat === 'concrete' || mat === 'blinding') });
  }

  // ---------- rebar primitives ----------
  bar(a, b, dia, floor, stage) {
    const k = floor + '|' + stage;
    let l = this.bars.get(k); if (!l) { l = []; this.bars.set(k, l); }
    l.push(a[0], a[1], a[2], b[0], b[1], b[2], (dia / 2) * 1.15);
  }
  poly(pts, dia, floor, stage, closed = false) {
    for (let i = 0; i < pts.length - 1; i++) this.bar(pts[i], pts[i + 1], dia, floor, stage);
    if (closed) this.bar(pts[pts.length - 1], pts[0], dia, floor, stage);
  }
  hoopY(cx, y, cz, a, b, dia, f, s) { // rectangle in a horizontal plane
    const x0 = cx - a / 2, x1 = cx + a / 2, z0 = cz - b / 2, z1 = cz + b / 2;
    this.poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], dia, f, s, true);
  }
  hoopX(x, cy, cz, bz, hy, dia, f, s) { // rectangle in the plane x = const
    const y0 = cy - hy / 2, y1 = cy + hy / 2, z0 = cz - bz / 2, z1 = cz + bz / 2;
    this.poly([[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]], dia, f, s, true);
  }
  hoopZ(z, cx, cy, ax, hy, dia, f, s) { // rectangle in the plane z = const
    const y0 = cy - hy / 2, y1 = cy + hy / 2, x0 = cx - ax / 2, x1 = cx + ax / 2;
    this.poly([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], dia, f, s, true);
  }
  ring(cx, y, cz, r, n, dia, f, s) {
    const pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; pts.push([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]); }
    this.poly(pts, dia, f, s, true);
  }

  // ---------- structural elements ----------
  column(o) {
    const { x, z, y0, y1 } = o, a = o.a ?? 0.4, b = o.b ?? a;
    const mesh = this.box({ key: o.key || 'column', code: o.code, size: [a, y1 - y0, b], at: [x, y0, z],
      floor: o.floor, stage: o.stage, layer: o.layer || 'structure', level: o.level });
    const c = 0.035, dx = a / 2 - c - 0.008, dz = b / 2 - c - 0.008, dia = o.dia || 0.016;
    const pts = [[dx, dz], [-dx, dz], [dx, -dz], [-dx, -dz]];
    if ((o.bars ?? 8) > 4) pts.push([0, dz], [0, -dz], [dx, 0], [-dx, 0]);
    const top = y1 + (o.lap ?? 0.45);
    for (const [px, pz] of pts) this.bar([x + px, y0, z + pz], [x + px, top, z + pz], dia, o.floor, o.stage);
    for (let y = y0 + 0.05; y < y1 - 0.02; y += o.sp || 0.15) this.hoopY(x, y, z, 2 * dx + 0.012, 2 * dz + 0.012, 0.008, o.floor, o.stage);
    if (o.meta !== false) this.meta.columns.push({ x, z, y0, y1, a, b });
    return mesh;
  }

  beam(o) {
    const w = o.w ?? 0.25, L = o.a1 - o.a0, mid = (o.a0 + o.a1) / 2, h = o.yt - o.yb;
    const size = o.axis === 'x' ? [L, h, w] : [w, h, L];
    const at = o.axis === 'x' ? [mid, o.yb, o.c] : [o.c, o.yb, mid];
    const mesh = this.box({ key: o.key || 'beam', code: o.code, size, at, floor: o.floor, stage: o.stage,
      layer: o.layer || 'structure', level: o.level, dims: [L, h, w], cast: o.cast });
    const cov = 0.035, bt = o.barTop ?? (o.yt - 0.045), bb = o.yb + 0.045, n = w / 2 - cov - 0.008;
    const dia = o.dia || 0.016;
    const P = (u, y, nn) => (o.axis === 'x' ? [u, y, o.c + nn] : [o.c + nn, y, u]);
    const ext = o.ext ?? 0.12, u0 = o.a0 - ext, u1 = o.a1 + ext;
    const nb = o.bottomBars ?? 3;
    for (let i = 0; i < nb; i++) {
      const nn = nb === 1 ? 0 : -n + (2 * n * i) / (nb - 1);
      this.bar(P(u0, bb, nn), P(u1, bb, nn), dia, o.floor, o.stage);
    }
    for (const nn of [-n, n]) this.bar(P(u0, bt, nn), P(u1, bt, nn), o.topDia || dia, o.floor, o.stage);
    const sh = bt - bb + 0.02, sw = 2 * n + 0.016, skip = o.skip ?? 0.22;
    for (let u = o.a0 + skip; u <= o.a1 - skip + 1e-6; u += o.sp || 0.2) {
      if (o.axis === 'x') this.hoopX(u, (bt + bb) / 2, o.c, sw, sh, 0.008, o.floor, o.stage);
      else this.hoopZ(u, o.c, (bt + bb) / 2, sw, sh, 0.008, o.floor, o.stage);
    }
    return mesh;
  }

  slab(o) {
    const w = o.x1 - o.x0, d = o.z1 - o.z0, h = o.yt - o.yb;
    const mesh = this.box({ key: o.key || 'slab', code: o.code, size: [w, h, d], at: [(o.x0 + o.x1) / 2, o.yb, (o.z0 + o.z1) / 2],
      floor: o.floor, stage: o.stage, layer: o.layer || 'structure', level: o.level, cast: o.cast, mat: o.mat });
    if (o.rebar !== false) {
      const sp = o.sp || 0.15, dia = o.dia || 0.01, m = 0.05;
      const y1 = o.yb + (o.cover ?? 0.025), y2 = y1 + dia;
      for (let z = o.z0 + m; z <= o.z1 - m + 1e-6; z += sp) this.bar([o.x0 + m, y1, z], [o.x1 - m, y1, z], dia, o.floor, o.stage);
      for (let x = o.x0 + m; x <= o.x1 - m + 1e-6; x += sp) this.bar([x, y2, o.z0 + m], [x, y2, o.z1 - m], dia, o.floor, o.stage);
      if (o.top) {
        const yt = o.yt - 0.025, L = Math.min(1.1, w / 4, d / 4), tsp = 0.2;
        for (let x = o.x0 + m; x <= o.x1 - m + 1e-6; x += tsp) {
          this.bar([x, yt, o.z0 + m], [x, yt, o.z0 + L], dia, o.floor, o.stage);
          this.bar([x, yt, o.z1 - L], [x, yt, o.z1 - m], dia, o.floor, o.stage);
        }
        for (let z = o.z0 + m; z <= o.z1 - m + 1e-6; z += tsp) {
          this.bar([o.x0 + m, yt - dia, z], [o.x0 + L, yt - dia, z], dia, o.floor, o.stage);
          this.bar([o.x1 - L, yt - dia, z], [o.x1 - m, yt - dia, z], dia, o.floor, o.stage);
        }
      }
    }
    if (o.bay) this.meta.bays.push({ x0: o.bay[0], x1: o.bay[1], z0: o.bay[2], z1: o.bay[3], y: o.yt, floor: o.floor });
    return mesh;
  }

  blinding(o) {
    return this.box({ key: 'blinding', code: o.code, mat: 'blinding', size: [o.B, o.t ?? 0.1, o.L], at: [o.x, o.y0, o.z],
      floor: 0, stage: o.stage, layer: 'foundation' });
  }

  footing(o) {
    const B = o.B, L = o.L ?? o.B, h = o.h;
    const mesh = this.box({ key: o.key || 'footing', code: o.code, size: [B, h, L], at: [o.x, o.y0, o.z],
      floor: 0, stage: o.stage, layer: 'foundation' });
    const c = 0.07, y = o.y0 + c, dia = o.dia || 0.016, sp = o.sp || 0.15, leg = Math.min(0.3, h - 0.15);
    const sx = o.spX || sp, sz = o.spZ || sp;
    for (let z = o.z - L / 2 + c; z <= o.z + L / 2 - c + 1e-6; z += sz)
      this.poly([[o.x - B / 2 + c, y + leg, z], [o.x - B / 2 + c, y, z], [o.x + B / 2 - c, y, z], [o.x + B / 2 - c, y + leg, z]], dia, 0, o.stage);
    for (let x = o.x - B / 2 + c; x <= o.x + B / 2 - c + 1e-6; x += sx)
      this.poly([[x, y + dia + leg, o.z - L / 2 + c], [x, y + dia, o.z - L / 2 + c], [x, y + dia, o.z + L / 2 - c], [x, y + dia + leg, o.z + L / 2 - c]], dia, 0, o.stage);
    if (o.top) { // top mesh for raft and thick caps
      const yt = o.y0 + h - c;
      for (let z = o.z - L / 2 + c; z <= o.z + L / 2 - c + 1e-6; z += sz) this.bar([o.x - B / 2 + c, yt, z], [o.x + B / 2 - c, yt, z], dia, 0, o.stage);
      for (let x = o.x - B / 2 + c; x <= o.x + B / 2 - c + 1e-6; x += sx) this.bar([x, yt - dia, o.z - L / 2 + c], [x, yt - dia, o.z + L / 2 - c], dia, 0, o.stage);
    }
    if (o.meta !== false) this.meta.footings.push({ x: o.x, z: o.z, y: o.y0, B, L });
    return mesh;
  }

  // L-shaped column dowels anchored in a footing, raft or cap
  starters(o) {
    const { x, z, a, b, yb, yt } = o, c = 0.035, dx = a / 2 - c - 0.008, dz = b / 2 - c - 0.008;
    const pts = [[dx, dz], [-dx, dz], [dx, -dz], [-dx, -dz]];
    if ((o.bars ?? 8) > 4) pts.push([0, dz], [0, -dz], [dx, 0], [-dx, 0]);
    for (const [px, pz] of pts) {
      const l = Math.hypot(px, pz) || 1, fx = (px / l) * 0.3, fz = (pz / l) * 0.3;
      this.poly([[x + px + fx, yb, z + pz + fz], [x + px, yb, z + pz], [x + px, yt, z + pz]], o.dia || 0.016, 0, o.stage);
    }
  }

  // openings: { u0, u1, v0, head, lb, lh } in wall-local metres. lb/lh carve a
  // T-shaped pocket for the lintel. An opening with v0 = 0 (a door) is cut
  // out of the bottom edge instead of being a hole.
  wall(o) {
    const L = o.a1 - o.a0, H = o.y1 - o.y0, t = o.t;
    const holePts = (op) => {
      const { u0, u1, v0, head: hd } = op, lb = op.lb || 0, lh = op.lh || 0;
      if (!lb) return [[u0, v0], [u1, v0], [u1, hd], [u0, hd]];
      return [[u0, v0], [u1, v0], [u1, hd], [u1 + lb, hd], [u1 + lb, hd + lh], [u0 - lb, hd + lh], [u0 - lb, hd], [u0, hd]];
    };
    const ops = (o.open || []).slice().sort((a, b) => a.u0 - b.u0);
    const outer = [[0, 0]];
    let openA = 0;
    for (const op of ops) {
      openA += (op.u1 - op.u0) * (op.head - op.v0) + (op.lb ? (op.u1 - op.u0 + 2 * op.lb) * op.lh : 0);
      if (op.v0 > 0.001) continue;
      const hp = holePts(op);
      outer.push(hp[0], ...hp.slice(1).reverse());
    }
    outer.push([L, 0], [L, H], [0, H]);
    const s = new THREE.Shape(outer.map(([x, y]) => new THREE.Vector2(x, y)));
    for (const op of ops) {
      if (op.v0 <= 0.001) continue;
      s.holes.push(new THREE.Path(holePts(op).map(([x, y]) => new THREE.Vector2(x, y))));
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 1 });
    g.translate(0, 0, -t / 2);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) + o.a0, uv.getY(i) + o.y0);
    const mesh = new THREE.Mesh(g, this.M[o.mat || 'brick']);
    if (o.axis === 'x') mesh.position.set(o.a0, o.y0, o.c);
    else { mesh.position.set(o.c, o.y0, o.a0); mesh.rotation.y = -Math.PI / 2; }
    return this.reg(mesh, { ...o, layer: o.layer || 'masonry', dims: [L, H, t], volume: (L * H - openA) * t, pour: true });
  }

  // window or door frame placed in an opening; coordinates match wall()
  frame(o) {
    const w = o.u1 - o.u0, h = o.v1 - o.v0, p = 0.06, dep = 0.07, parts = [];
    const add = (bw, bh, x, y, z = 0, bd = dep) => { const g = new THREE.BoxGeometry(bw, bh, bd); g.translate(x, y, z); parts.push(g); };
    add(w, p, w / 2, p / 2); add(w, p, w / 2, h - p / 2); add(p, h, p / 2, h / 2); add(p, h, w - p / 2, h / 2);
    if (o.door) add(w - 2 * p, h - p, w / 2, (h - p) / 2, 0, 0.045);
    else add(p * 0.8, h, w / 2, h / 2);
    const fg = mergeGeometries(parts);
    const mesh = new THREE.Mesh(fg, o.door ? this.M.doorWood : this.M.frame);
    const place = (m) => {
      if (o.axis === 'x') m.position.set(o.a0 + o.u0, o.y0 + o.v0, o.c + (o.off || 0));
      else { m.position.set(o.c + (o.off || 0), o.y0 + o.v0, o.a0 + o.u0); m.rotation.y = -Math.PI / 2; }
    };
    place(mesh);
    this.reg(mesh, { key: o.door ? 'door' : 'window', code: o.code, layer: 'openings', floor: o.floor, stage: o.stage, dims: [w, h, dep], level: o.level });
    if (!o.door) {
      const gg = new THREE.BoxGeometry(w - 2 * p, h - 2 * p, 0.012); gg.translate(w / 2, h / 2, 0);
      const glass = new THREE.Mesh(gg, this.M.glass);
      place(glass);
      this.reg(glass, { key: 'window', code: o.code, layer: 'openings', floor: o.floor, stage: o.stage, cast: false, dims: [w, h, dep], level: o.level });
    }
    return mesh;
  }

  pipe(o) {
    const a = new THREE.Vector3(...o.a), b = new THREE.Vector3(...o.b);
    const d = b.clone().sub(a), len = d.length();
    const g = new THREE.CylinderGeometry(o.r, o.r, len, o.seg || 14, 1, false);
    g.translate(0, len / 2, 0);
    const mesh = new THREE.Mesh(g, this.M[o.mat]);
    mesh.position.copy(a);
    mesh.quaternion.setFromUnitVectors(UP, d.normalize());
    return this.reg(mesh, { ...o, layer: o.layer || 'mep', length: len, dims: [o.r * 2, len, o.r * 2], cast: false });
  }

  stairFlight(o) {
    const { xL, y, z0, dir, width } = o, n = o.n || 10, R = o.R || 0.16, T = o.T || 0.3, waist = o.waist || 0.15;
    const wv = waist / Math.cos(Math.atan2(R, T));
    const s = new THREE.Shape(); s.moveTo(0, 0);
    for (let i = 0; i < n; i++) { s.lineTo(i * T, (i + 1) * R); if (i < n - 1) s.lineTo((i + 1) * T, (i + 1) * R); }
    const uEnd = (n - 1) * T, u0 = Math.max(0.001, uEnd - (n * R - wv) * (T / R));
    s.lineTo(uEnd, n * R - wv); s.lineTo(u0, 0); s.lineTo(0, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: width, bevelEnabled: false });
    const mesh = new THREE.Mesh(g, this.M.concrete);
    mesh.rotation.y = dir < 0 ? Math.PI / 2 : -Math.PI / 2;
    mesh.position.set(dir < 0 ? xL : xL + width, y, z0);
    for (let w = 0.07; w < width - 0.05; w += 0.15)
      this.bar([xL + w, y + 0.04, z0 + dir * (u0 + 0.05)], [xL + w, y + n * R - wv + 0.04, z0 + dir * uEnd], 0.012, o.floor, o.stage);
    const vol = (Math.hypot(uEnd, n * R) * waist + n * R * T * 0.5) * width;
    return this.reg(mesh, { key: 'stair', code: o.code, floor: o.floor, stage: o.stage, layer: 'structure', dims: [width, n * R, uEnd], volume: vol, pour: true, level: o.level });
  }

  // ---------- finish ----------
  finalize() {
    const geo = new THREE.CylinderGeometry(1, 1, 1, 5, 1, true); geo.translate(0, 0.5, 0);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), d = new THREE.Vector3();
    for (const [k, l] of this.bars) {
      const [f, st] = k.split('|').map(Number), n = l.length / 7;
      const im = new THREE.InstancedMesh(geo, this.M.steel, n);
      for (let i = 0; i < n; i++) {
        const o = i * 7;
        p.set(l[o], l[o + 1], l[o + 2]);
        d.set(l[o + 3] - l[o], l[o + 4] - l[o + 1], l[o + 5] - l[o + 2]);
        const len = d.length() || 1e-4; d.multiplyScalar(1 / len);
        q.setFromUnitVectors(UP, d); s.set(l[o + 6], len, l[o + 6]);
        m.compose(p, q, s); im.setMatrixAt(i, m);
      }
      im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; im.castShadow = false;
      im.userData = { key: 'rebar', isRebar: true, floor: f, stage: st, layer: f === 0 ? 'foundation' : 'structure', count: n };
      this.floor(f).add(im); this.rebar.push(im); this.pick.push(im);
    }
    this.bars.clear();
    this.group.updateMatrixWorld(true);
    this.bounds.makeEmpty();
    for (const e of this.elements) if (!e.userData.static) this.bounds.expandByObject(e);
    this.rebarCount = this.rebar.reduce((a, r) => a + r.userData.count, 0);
    return this;
  }
}

export function disposeModel(model) {
  model.group.traverse((o) => { if (o.geometry && !o.isInstancedMesh) o.geometry.dispose(); });
  if (model.rebar[0]) model.rebar[0].geometry.dispose();
}
