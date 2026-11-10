// Foundation lab: the student sets the load, soil and footing size, the
// checks update live, and the footing is built step by step in a cut-open pit.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { boxGeo } from './builder.js';
import { arrowGeometry } from './loadpath.js';
import { L } from './i18n.js';

const UP = new THREE.Vector3(0, 1, 0);
const FC = 30, FY = 420; // concrete f'c and steel fy in MPa (ACI 318)
const STEPS = 7;

export const SOILS = [
  { key: 'soil.soft', q: 75 }, { key: 'soil.stiff', q: 150 }, { key: 'soil.sand', q: 250 }, { key: 'soil.gravel', q: 350 },
];

export function computeLab(p) {
  const r = { type: p.type };
  const dia = p.dia / 1000, sp = p.sp / 1000, cover = 0.075;
  const barArea = (Math.PI * p.dia * p.dia) / 4; // mm²
  const kgPerM = (p.dia * p.dia) / 162;
  if (p.type === 'isolated') {
    const Ps = 1.1 * p.P, A = p.B * p.L;
    r.areaReq = Ps / p.q; r.areaProv = A; r.press = Ps / A; r.okBearing = r.press <= p.q + 1e-6;
    r.suggestB = Math.ceil(Math.sqrt(r.areaReq) * 10) / 10;
    const Pu = 1.5 * p.P, qu = Pu / A, d = p.h - cover - dia;
    const c = p.c, b0 = 4 * (c + d);
    const Vu = Pu - qu * (c + d) * (c + d);
    r.punch = Math.max(0, Vu) / (b0 * d) / 1000; // MPa
    r.punchCap = 0.75 * 0.33 * Math.sqrt(FC);
    r.okPunch = d > 0.1 && r.punch <= r.punchCap;
    const arm = Math.max(p.B, p.L) / 2 - c / 2, width = Math.min(p.B, p.L);
    const Mu = qu * width * arm * arm / 2; // kN·m on the critical section
    const As = (Mu * 1e6) / (0.9 * FY * 0.9 * d * 1000);
    const Amin = 0.0018 * width * 1000 * p.h * 1000;
    r.asReq = Math.max(As, Amin);
    r.nBars = Math.floor((width - 2 * cover) / sp) + 1;
    r.asProv = r.nBars * barArea; r.okSteel = r.asProv >= r.asReq;
    r.conc = A * p.h;
    const nX = Math.floor((p.L - 2 * cover) / sp) + 1, nZ = Math.floor((p.B - 2 * cover) / sp) + 1;
    r.steel = (nX * (p.B - 2 * cover + 0.6) + nZ * (p.L - 2 * cover + 0.6)) * kgPerM;
    r.ok = r.okBearing && r.okPunch && r.okSteel;
  } else if (p.type === 'strip') {
    const ws = 1.1 * p.w, t = 0.25;
    r.areaReq = ws / p.q; r.areaProv = p.B; r.press = ws / p.B; r.okBearing = r.press <= p.q + 1e-6;
    r.suggestB = Math.ceil(r.areaReq * 10) / 10;
    const wu = 1.5 * p.w, qu = wu / p.B, d = p.h - cover - dia, arm = (p.B - t) / 2;
    r.punch = Math.max(0, qu * (arm - d)) / d / 1000; // one-way shear, MPa
    r.punchCap = 0.75 * 0.17 * Math.sqrt(FC);
    r.okPunch = d > 0.1 && r.punch <= r.punchCap;
    const Mu = qu * arm * arm / 2;
    const As = (Mu * 1e6) / (0.9 * FY * 0.9 * d * 1000), Amin = 0.0018 * 1000 * p.h * 1000;
    r.asReq = Math.max(As, Amin);
    r.nBars = Math.floor(1 / sp) + 0; r.asProv = (1000 / p.sp) * barArea; r.okSteel = r.asProv >= r.asReq;
    r.conc = p.B * p.h * 1.0;
    r.steel = ((1 / sp) * (p.B - 2 * cover + 0.6) + 5 * 1.0) * kgPerM;
    r.ok = r.okBearing && r.okPunch && r.okSteel;
  } else {
    const Ps = 1.1 * p.P;
    r.nPiles = Math.max(2, Math.ceil(Ps / p.Qp));
    r.pileLoad = Ps / r.nPiles; r.okBearing = r.pileLoad <= p.Qp + 1e-6;
    const lay = pileLayout(r.nPiles, 1.5);
    r.layout = lay;
    r.capB = lay.w + 1.2; r.capL = lay.d + 1.2;
    r.okPunch = p.h >= Math.max(0.6, 1.5 / 2); // cap at least half the pile spacing deep
    r.conc = r.capB * r.capL * p.h + r.nPiles * Math.PI * 0.0625 * 8;
    r.steel = r.conc * 110;
    r.ok = r.okBearing && r.okPunch;
  }
  return r;
}

function pileLayout(n, s) {
  const pts = [];
  if (n === 2) pts.push([-s / 2, 0], [s / 2, 0]);
  else if (n === 3) { const h = (s * Math.sqrt(3)) / 2; pts.push([-s / 2, h / 3], [s / 2, h / 3], [0, -(2 * h) / 3]); }
  else if (n === 4) pts.push([-s / 2, -s / 2], [s / 2, -s / 2], [s / 2, s / 2], [-s / 2, s / 2]);
  else if (n === 5) pts.push([-s / 2, -s / 2], [s / 2, -s / 2], [s / 2, s / 2], [-s / 2, s / 2], [0, 0]);
  else if (n === 6) for (const x of [-s, 0, s]) for (const z of [-s / 2, s / 2]) pts.push([x, z]);
  else for (let i = 0; i < Math.min(n, 9); i++) pts.push([((i % 3) - 1) * s, (Math.floor(i / 3) - 1) * s]);
  const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
  return { pts, w: Math.max(...xs) - Math.min(...xs), d: Math.max(...zs) - Math.min(...zs) };
}

export class FoundationLab {
  constructor(M, env) {
    this.M = M;
    this.scene = new THREE.Scene(); this.scene.environment = env;
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.05, 300);
    this.root = new THREE.Group(); this.scene.add(this.root);
    this.mat = {};
    const keep = (m) => { const c = m.clone(); c.transparent = false; c.opacity = 1; c.depthWrite = true; c.side = THREE.FrontSide; c.userData = {}; return c; };
    for (const k of ['concrete', 'blinding', 'ground', 'soil2', 'soil3', 'soil4', 'plywood', 'steel', 'block', 'plaster', 'spacer']) this.mat[k] = keep(M[k]);
    this.mat.steel.envMapIntensity = 1;
    this.barGeo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true); this.barGeo.translate(0, 0.5, 0);
    this.arrowGeo = arrowGeometry();
    this.arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthTest: false });
    const hemi = new THREE.HemisphereLight(0xffffff, 0x8f887a, 0.65);
    const sun = new THREE.DirectionalLight(0xfff3df, 2.3); sun.position.set(-6, 10, 8); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 0.5, far: 40 });
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
    this.scene.add(hemi, sun);
    this.params = { type: 'isolated', P: 900, q: 150, B: 2.6, L: 2.6, h: 0.6, dia: 16, sp: 150, c: 0.4, w: 160, Qp: 600 };
    this.step = STEPS - 1; this.pour = 1; this.showArrows = true; this.time = 0; this.labels = [];
    this.rebuild();
  }

  get steps() { return STEPS; }

  clear() {
    for (const l of this.labels) l.element.remove();
    this.labels = [];
    this.root.traverse((o) => { if (o.geometry && o.geometry !== this.barGeo && o.geometry !== this.arrowGeo) o.geometry.dispose(); });
    this.root.clear();
  }

  box(size, at, mat, base = true) {
    const [w, h, d] = size, [x, y, z] = at;
    const g = boxGeo(w, h, d, x - w / 2, y, z - d / 2);
    if (!base) g.translate(0, -h / 2, 0);
    const m = new THREE.Mesh(g, this.mat[mat]); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
    this.root.add(m); return m;
  }

  bars(segs) {
    const im = new THREE.InstancedMesh(this.barGeo, this.mat.steel, Math.max(1, segs.length));
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), a = new THREE.Vector3(), d = new THREE.Vector3();
    segs.forEach(([A, B, dia], i) => {
      a.set(...A); d.set(B[0] - A[0], B[1] - A[1], B[2] - A[2]); const len = d.length() || 1e-4; d.multiplyScalar(1 / len);
      q.setFromUnitVectors(UP, d); s.set((dia / 2) * 1.2, len, (dia / 2) * 1.2); m.compose(a, q, s); im.setMatrixAt(i, m);
    });
    if (!segs.length) im.count = 0;
    im.castShadow = true; this.root.add(im); return im;
  }

  label(pos, text, cls = '') {
    const el = document.createElement('div'); el.className = 'tag3d ' + cls; el.innerHTML = '<i></i><span></span>';
    const o = new CSS2DObject(el); o.position.set(...pos); o.userData.text = text;
    el.querySelector('span').textContent = typeof text === 'string' ? text : L(text);
    this.root.add(o); this.labels.push(o); return o;
  }

  refreshLabels() {
    for (const l of this.labels) { const t = l.userData.text; l.element.querySelector('span').textContent = typeof t === 'string' ? t : L(t); }
  }

  rebuild() {
    this.clear();
    const p = this.params, r = computeLab(p); this.result = r;
    const yF = -1.5;
    let B, Lz, h = p.h;
    if (p.type === 'isolated') { B = p.B; Lz = p.L; }
    else if (p.type === 'strip') { B = 3.0; Lz = p.B; }
    else { B = r.capB; Lz = r.capL; }
    this.dims = { B, Lz, h, yF };

    // soil with an open pit; front side cut away
    const hx = B / 2 + 0.7, hz = Lz / 2 + 0.7, ex = 2.2, deep = p.type === 'pilecap' ? -9.5 : -3.6, pitY = yF - 0.1;
    const layers = [['ground', 0, -0.5], ['soil2', -0.5, -2.6], ['soil3', -2.6, -5.5], ['soil4', -5.5, -99]];
    for (const [mat, ya, yb0] of layers) {
      const yb = Math.max(deep, yb0); if (ya <= deep) break;
      const H = ya - yb, part = (x0, x1, z0, z1, top = ya, bot = yb) => {
        if (top - bot < 0.01) return; const m = this.box([x1 - x0, top - bot, z1 - z0], [(x0 + x1) / 2, bot, (z0 + z1) / 2], mat); m.castShadow = false;
      };
      void H;
      part(-hx - ex, hx + ex, -hz - ex, -hz);
      part(-hx - ex, -hx, -hz, hz + 0.8);
      part(hx, hx + ex, -hz, hz + 0.8);
      // the ground under the pit is sliced through the middle, so the
      // footing's underside and the soil reaction are visible from the front
      const ft = Math.min(ya, pitY);
      part(-hx, hx, -hz, 0, ft, yb);
    }

    const s = this.step;
    const vis = (k) => s >= k;
    // 1 blinding
    if (vis(1)) this.box([B + 0.3, 0.1, Lz + 0.3], [0, yF - 0.1, 0], 'blinding');
    // piles (step 0 for pile caps)
    if (p.type === 'pilecap') {
      const segs = [];
      for (const [px, pz] of r.layout.pts) {
        const g = new THREE.CylinderGeometry(0.25, 0.25, 7.5, 20); g.translate(0, -3.75 + 0.1, 0);
        const m = new THREE.Mesh(g, this.mat.concrete); m.position.set(px, yF, pz); m.castShadow = true; this.root.add(m);
        for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; segs.push([[px + Math.cos(a) * 0.17, yF + 0.1, pz + Math.sin(a) * 0.17], [px + Math.cos(a) * 0.17, yF + 0.65, pz + Math.sin(a) * 0.17], 0.018]); }
      }
      if (vis(2)) this.bars(segs);
    }
    // 2 bottom mesh
    const cv = 0.075, dia = p.dia / 1000, sp = p.sp / 1000, y = yF + cv, leg = Math.min(0.3, h - 0.15);
    if (vis(2)) {
      const segs = [];
      if (p.type === 'strip') {
        for (let x = -B / 2 + 0.05; x <= B / 2 - 0.05 + 1e-6; x += sp) segs.push([[x, y + leg, -Lz / 2 + cv], [x, y, -Lz / 2 + cv], dia], [[x, y, -Lz / 2 + cv], [x, y, Lz / 2 - cv], dia], [[x, y, Lz / 2 - cv], [x, y + leg, Lz / 2 - cv], dia]);
        for (let z = -Lz / 2 + cv; z <= Lz / 2 - cv + 1e-6; z += 0.25) segs.push([[-B / 2 + 0.03, y + dia, z], [B / 2 - 0.03, y + dia, z], 0.012]);
      } else {
        for (let z = -Lz / 2 + cv; z <= Lz / 2 - cv + 1e-6; z += sp) segs.push([[-B / 2 + cv, y + leg, z], [-B / 2 + cv, y, z], dia], [[-B / 2 + cv, y, z], [B / 2 - cv, y, z], dia], [[B / 2 - cv, y, z], [B / 2 - cv, y + leg, z], dia]);
        for (let x = -B / 2 + cv; x <= B / 2 - cv + 1e-6; x += sp) segs.push([[x, y + dia + leg, -Lz / 2 + cv], [x, y + dia, -Lz / 2 + cv], dia], [[x, y + dia, -Lz / 2 + cv], [x, y + dia, Lz / 2 - cv], dia], [[x, y + dia, Lz / 2 - cv], [x, y + dia + leg, Lz / 2 - cv], dia]);
        if (p.type === 'pilecap') { const yt = yF + h - cv; for (let z = -Lz / 2 + cv; z <= Lz / 2 - cv + 1e-6; z += 0.2) segs.push([[-B / 2 + cv, yt, z], [B / 2 - cv, yt, z], 0.016]); }
      }
      this.bars(segs);
      for (let x = -B / 2 + 0.4; x < B / 2; x += 0.8) for (let z = -Lz / 2 + 0.4; z < Lz / 2; z += 0.8) this.box([0.05, cv - 0.005, 0.05], [x, yF, z], 'spacer');
    }
    // 3 starter bars
    const c = p.c, topY = 1.4;
    if (vis(3)) {
      const segs = [];
      if (p.type === 'strip') {
        for (let x = -B / 2 + 0.15; x < B / 2; x += 0.3) for (const dz of [-0.07, 0.07]) segs.push([[x, y + 0.04, dz * 3], [x, y + 0.04, dz], 0.012], [[x, y + 0.04, dz], [x, yF + h + 0.6, dz], 0.012]);
      } else {
        const dx = c / 2 - 0.05;
        for (const [px, pz] of [[dx, dx], [-dx, dx], [dx, -dx], [-dx, -dx], [0, dx], [0, -dx], [dx, 0], [-dx, 0]]) {
          const l = Math.hypot(px, pz), fx = (px / l) * 0.3, fz = (pz / l) * 0.3;
          segs.push([[px + fx, y + 0.05, pz + fz], [px, y + 0.05, pz], 0.016], [[px, y + 0.05, pz], [px, topY, pz], 0.016]);
        }
        for (let yy = yF + h + 0.1; yy < topY - 0.05; yy += 0.15) {
          const a = c / 2 - 0.04; segs.push([[-a, yy, -a], [a, yy, -a], 0.008], [[a, yy, -a], [a, yy, a], 0.008], [[a, yy, a], [-a, yy, a], 0.008], [[-a, yy, a], [-a, yy, -a], 0.008]);
        }
      }
      this.bars(segs);
    }
    // 4 formwork (removed at the last step)
    if (vis(4) && s < 6) {
      const t = 0.03, fh = h + 0.08;
      this.box([B + 2 * t, fh, t], [0, yF, -Lz / 2 - t / 2], 'plywood'); this.box([B + 2 * t, fh, t], [0, yF, Lz / 2 + t / 2], 'plywood');
      this.box([t, fh, Lz], [-B / 2 - t / 2, yF, 0], 'plywood'); this.box([t, fh, Lz], [B / 2 + t / 2, yF, 0], 'plywood');
    }
    // 5 concrete
    this.footing = null;
    if (vis(5)) {
      const f = this.box([B, h, Lz], [0, yF, 0], 'concrete');
      f.scale.y = s === 5 ? Math.max(0.02, this.pour) : 1; this.footing = f;
    }
    // 6 column or wall above
    if (vis(6)) {
      if (p.type === 'strip') {
        this.box([B, 1.9, 0.25], [0, yF + h, 0], 'block');
      } else {
        this.box([c, 0.9, c], [0, yF + h, 0], 'concrete');
      }
    }

    // loads and soil pressure
    this.arrows = null;
    if (this.showArrows && s >= 5) this.buildArrows(r);

    // dimension labels
    const fmt = (v) => v.toFixed(2);
    if (p.type === 'isolated') {
      this.label([0, yF, Lz / 2 + 0.05], 'B = ' + fmt(B) + ' m', 'dim');
      this.label([B / 2 + 0.05, yF + h / 2, 0], 'h = ' + fmt(h) + ' m', 'dim');
      this.label([-B / 2, yF, 0], 'L = ' + fmt(Lz) + ' m', 'dim');
    } else if (p.type === 'strip') {
      this.label([B / 2, yF, 0], 'B = ' + fmt(Lz) + ' m', 'dim');
      this.label([-B / 2, yF + h / 2, Lz / 2], 'h = ' + fmt(h) + ' m', 'dim');
    } else {
      this.label([0, yF, Lz / 2 + 0.05], r.nPiles + ' × Ø0.50 m', 'dim');
      this.label([B / 2 + 0.05, yF + h / 2, 0], 'h = ' + fmt(h) + ' m', 'dim');
    }
    const loadTop = p.type === 'strip' ? yF + h + 1.9 : yF + h + 0.9;
    this.loadLabel = this.label([0, loadTop + 1.25, 0], p.type === 'strip' ? `w = ${p.w} kN/m` : `P = ${p.P} kN`, 'load');
    this.loadLabel.visible = this.showArrows && s >= 5;

    const span = Math.max(B, Lz);
    this.view = { target: new THREE.Vector3(0, p.type === 'pilecap' ? -2.4 : -1.2, 0), dist: 6.4 + span * 1.3 + (p.type === 'pilecap' ? 4 : 0), dir: new THREE.Vector3(-0.5, 0.36, 1).normalize() };
    return r;
  }

  buildArrows(r) {
    const p = this.params, { B, Lz, h, yF } = this.dims;
    const items = [];
    const ratio = p.type === 'pilecap' ? r.pileLoad / p.Qp : r.press / p.q;
    const col = new THREE.Color(ratio <= 1 ? 0x3fbf7f : 0xff5a4a);
    // soil reaction under the footing (or pile tips)
    if (p.type === 'pilecap') {
      for (const [px, pz] of r.layout.pts) items.push({ p: [px, yF - 7.6, pz], s: 1.2 * Math.min(1.6, ratio + 0.2), up: true, c: col, phase: Math.random() });
    } else {
      const nx = 5, nz = p.type === 'strip' ? 3 : 5;
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
        const x = -B / 2 + (B * (i + 0.5)) / nx, z = -Lz / 2 + (Lz * (j + 0.5)) / nz;
        items.push({ p: [x, yF - 0.12, z], s: 0.7 * Math.min(1.8, ratio + 0.15), up: true, c: col, phase: (i + j) * 0.15 });
      }
    }
    // the load coming down
    const top = p.type === 'strip' ? yF + h + 1.9 : yF + h + 0.9;
    if (p.type === 'strip') for (const x of [-1, 0, 1]) items.push({ p: [x, top + 0.6, 0], s: 1.5, up: false, c: new THREE.Color(0xffb43d), phase: 0 });
    else items.push({ p: [0, top + 0.6, 0], s: 2.4, up: false, c: new THREE.Color(0xffb43d), phase: 0 });
    // soil reaction is depth-tested (it sits under the footing); the applied
    // load draws on top so it always reads
    const groups = [items.filter((it) => it.up), items.filter((it) => !it.up)];
    const mats = [this.arrowMatSoil ||= new THREE.MeshBasicMaterial({ color: 0xffffff }), this.arrowMat];
    this.arrows = groups.map((list, gi) => {
      const im = new THREE.InstancedMesh(this.arrowGeo, mats[gi], Math.max(1, list.length));
      list.forEach((it, i) => im.setColorAt(i, it.c));
      if (!list.length) im.count = 0;
      im.renderOrder = gi ? 10 : 0; im.frustumCulled = false; this.root.add(im);
      return { im, items: list };
    });
    this.updateArrows();
  }

  updateArrows() {
    if (!this.arrows) return;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3();
    const down = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI), up = new THREE.Quaternion();
    for (const g of this.arrows) {
      g.items.forEach((it, i) => {
        const bob = Math.sin((this.time * 2.2 + it.phase * 6.28)) * 0.06;
        pos.set(it.p[0], it.p[1] + (it.up ? -0.35 * it.s + bob : bob), it.p[2]);
        q.copy(it.up ? up : down);
        s.set(it.s, it.s, it.s); m.compose(pos, q, s); g.im.setMatrixAt(i, m);
      });
      g.im.instanceMatrix.needsUpdate = true;
    }
  }

  setParams(np) { Object.assign(this.params, np); return this.rebuild(); }
  setStep(i) { this.step = Math.max(0, Math.min(STEPS - 1, i)); this.pour = this.step === 5 ? 0 : 1; this.rebuild(); }

  update(dt) {
    this.time += dt;
    let moving = false;
    if (this.step === 5 && this.pour < 1 && this.footing) {
      this.pour = Math.min(1, this.pour + dt * 0.6);
      this.footing.scale.y = Math.max(0.02, 1 - Math.pow(1 - this.pour, 2));
      moving = true;
    }
    if (this.arrows) { this.updateArrows(); moving = true; }
    return moving;
  }
}
