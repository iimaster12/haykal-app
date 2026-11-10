// Detail studio: a close-up of one element type with its concrete shown as a
// translucent shell, its steel cage, and labelled parts that pull apart.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { boxGeo } from './builder.js';
import { L } from './i18n.js';

const UP = new THREE.Vector3(0, 1, 0);
const S = (a, b, d) => [a, b, d];
const T = (en, ar) => ({ en, ar });

function hoopY(o, cx, y, cz, a, b, d, hook = true) {
  const x0 = cx - a / 2, x1 = cx + a / 2, z0 = cz - b / 2, z1 = cz + b / 2;
  o.push(S([x0, y, z0], [x1, y, z0], d), S([x1, y, z0], [x1, y, z1], d), S([x1, y, z1], [x0, y, z1], d), S([x0, y, z1], [x0, y, z0], d));
  if (hook) o.push(S([x0, y, z0], [x0 + 0.06, y + 0.004, z0 + 0.06], d), S([x0, y + 0.01, z0], [x0 + 0.055, y + 0.012, z0 + 0.065], d));
}
function hoopX(o, x, cy, cz, bz, hy, d) {
  const y0 = cy - hy / 2, y1 = cy + hy / 2, z0 = cz - bz / 2, z1 = cz + bz / 2;
  o.push(S([x, y0, z0], [x, y0, z1], d), S([x, y0, z1], [x, y1, z1], d), S([x, y1, z1], [x, y1, z0], d), S([x, y1, z0], [x, y0, z0], d));
  o.push(S([x, y1, z0], [x + 0.004, y1 - 0.06, z0 + 0.06], d));
}
function ringY(o, cx, y, cz, r, n, d) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2;
    o.push(S([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r], [cx + Math.cos(b) * r, y, cz + Math.sin(b) * r], d));
  }
}

class Ctx {
  constructor(st) { this.st = st; this.M = st.mat; }
  part(dir = [0, 0, 0], o = {}) {
    const g = new THREE.Group(); this.st.root.add(g);
    const p = { g, dir: new THREE.Vector3(...dir), fade: o.fade || 0, mats: [], tick: null };
    this.st.parts.push(p); return p;
  }
  add(p, mesh) { mesh.castShadow = true; mesh.receiveShadow = true; p.g.add(mesh); return mesh; }
  mat(p, key) {
    if (key !== 'ghost') return this.M[key];
    if (!p.ghost) { p.ghost = this.M.ghost.clone(); p.ghost.userData.base = this.M.ghost.opacity; p.mats.push(p.ghost); }
    return p.ghost;
  }
  box(p, size, c, key = 'concrete') {
    const [w, h, d] = size, [x, y, z] = c;
    const g = boxGeo(w, h, d, x - w / 2, y - h / 2, z - d / 2); g.translate(0, -h / 2, 0);
    const m = new THREE.Mesh(g, this.mat(p, key)); m.position.set(x, y, z);
    return this.add(p, m);
  }
  edges(p, mesh) {
    if (!p.edge) { p.edge = new THREE.LineBasicMaterial({ color: 0x27302f, transparent: true, opacity: 0.6 }); p.edge.userData.base = 0.6; p.mats.push(p.edge); }
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 25), p.edge));
    mesh.castShadow = false; return mesh;
  }
  shell(p, size, c) { return this.edges(p, this.box(p, size, c, 'ghost')); }
  geo(p, geometry, key, pos = [0, 0, 0], rot = [0, 0, 0]) {
    const m = new THREE.Mesh(geometry, this.mat(p, key)); m.position.set(...pos); m.rotation.set(...rot);
    if (key === 'ghost') this.edges(p, m);
    return this.add(p, m);
  }
  cyl(p, r, len, c, axis = 'y', key = 'concrete', seg = 16) {
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    if (axis === 'x') g.rotateZ(Math.PI / 2); else if (axis === 'z') g.rotateX(Math.PI / 2);
    return this.geo(p, g, key, c);
  }
  bars(p, segs, key = 'steel') {
    const im = new THREE.InstancedMesh(this.st.barGeo, this.M[key], segs.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), a = new THREE.Vector3(), d = new THREE.Vector3();
    segs.forEach(([A, B, dia], i) => {
      a.set(...A); d.set(B[0] - A[0], B[1] - A[1], B[2] - A[2]);
      const len = d.length() || 1e-4; d.multiplyScalar(1 / len); q.setFromUnitVectors(UP, d);
      s.set(dia / 2, len, dia / 2); m.compose(a, q, s); im.setMatrixAt(i, m);
    });
    im.castShadow = true; return this.add(p, im);
  }
  label(p, pos, text, cls = '') {
    const el = document.createElement('div');
    el.className = 'tag3d ' + cls; el.innerHTML = '<i></i><span></span>';
    const o = new CSS2DObject(el); o.position.set(...pos); o.userData.text = text;
    el.querySelector('span').textContent = L(text);
    p.g.add(o); this.st.labels.push(o); return o;
  }
  frame(target, dist, dir = [-0.55, 0.45, 1]) {
    this.st.view = { target: new THREE.Vector3(...target), dist, dir: new THREE.Vector3(...dir).normalize() };
  }
}

const B = {};

B.column = (c) => {
  const H = 1.8, a = 0.4, dx = a / 2 - 0.035 - 0.008;
  const shell = c.part([1.0, 0, 0], { fade: 0.7 });
  c.shell(shell, [a, H, a], [0, H / 2, 0]);
  c.label(shell, [a / 2, H * 0.82, a / 2], T('Concrete C30 (shown see-through)', 'خرسانة C30 (معروضة شفافة)'));
  const cage = c.part(), s = [];
  const pts = [[dx, dx], [-dx, dx], [dx, -dx], [-dx, -dx], [0, dx], [0, -dx], [dx, 0], [-dx, 0]];
  for (const [x, z] of pts) s.push(S([x, 0, z], [x, H + 0.45, z], 0.016));
  for (let y = 0.08; y < H; y += 0.15) hoopY(s, 0, y, 0, 2 * dx + 0.012, 2 * dx + 0.012, 0.008);
  c.bars(cage, s);
  c.label(cage, [dx, H + 0.42, dx], T('8Ø16 main bars, left long to lap with the next floor', '8Ø16 قضبان رئيسية تُترك طويلة لتتراكب مع الطابق التالي'));
  c.label(cage, [-dx, 0.38, dx], T('Stirrups Ø8 @ 150', 'أساور Ø8 كل 15 سم'));
  const one = c.part([-0.85, 0.1, 0.45]), s2 = [];
  hoopY(s2, 0, 1.05, 0, 2 * dx + 0.012, 2 * dx + 0.012, 0.008); c.bars(one, s2);
  c.label(one, [-dx, 1.05, -dx], T('One stirrup: closed loop, 135° hooks', 'سوار واحد: حلقة مغلقة بخطافات 135°'));
  const sp = c.part([1.0, 0, 0], { fade: 0.7 });
  for (const y of [0.45, 1.25]) { c.cyl(sp, 0.022, 0.026, [dx + 0.024, y, 0], 'x', 'spacer'); c.cyl(sp, 0.022, 0.026, [0, y, dx + 0.024], 'z', 'spacer'); }
  c.label(sp, [dx + 0.03, 0.45, 0.03], T('Spacer block keeps 25 mm of cover', 'المباعِد يحافظ على غطاء 2.5 سم'));
  c.frame([0, 1.05, 0], 3.7);
};

B.beam = (c) => {
  const Lb = 2.4, w = 0.25, h = 0.6, fl = 0.15, fw = 1.2;
  const shell = c.part([0, 0.95, 0], { fade: 0.7 });
  c.shell(shell, [Lb, h - fl, w], [0, (h - fl) / 2, 0]); c.shell(shell, [Lb, fl, fw], [0, h - fl / 2, 0]);
  c.label(shell, [Lb / 2, h, -fw / 2], T('The slab acts as the top flange (T-beam)', 'البلاطة تعمل كشفة علوية للجائز (مقطع T)'));
  const cage = c.part(), s = [], n = w / 2 - 0.043, bb = 0.045, bt = h - 0.045;
  for (const z of [-n, 0, n]) s.push(S([-Lb / 2, bb, z], [Lb / 2, bb, z], 0.016));
  for (const z of [-n, n]) s.push(S([-Lb / 2, bt, z], [Lb / 2, bt, z], 0.016));
  for (let x = -Lb / 2 + 0.1; x < Lb / 2; x += 0.2) hoopX(s, x, (bb + bt) / 2, 0, 2 * n + 0.016, bt - bb + 0.02, 0.008);
  for (let x = -Lb / 2 + 0.1; x < Lb / 2; x += 0.2) s.push(S([x, h - 0.03, -fw / 2 + 0.03], [x, h - 0.03, fw / 2 - 0.03], 0.01));
  c.bars(cage, s);
  c.label(cage, [Lb / 2 - 0.15, bb, n], T('3Ø16 bottom bars carry the tension', '3Ø16 تسليح سفلي يتحمل الشد'));
  c.label(cage, [-Lb / 2 + 0.15, bt, n], T('2Ø16 top bars', '2Ø16 تسليح علوي'));
  c.label(cage, [-0.1, 0.25, n + 0.01], T('Stirrups Ø8 @ 200 resist shear', 'أساور Ø8 كل 20 سم تقاوم القص'));
  c.frame([0, 0.3, 0], 3.5);
};

B.slab = (c) => {
  const W = 1.8, t = 0.15;
  const bm = c.part([0, -0.25, 0], { fade: 0.5 });
  c.shell(bm, [W, 0.45, 0.25], [0, -0.225, -W / 2 + 0.125]);
  c.label(bm, [W / 2, -0.3, -W / 2 + 0.125], T('Supporting beam', 'الجائز الحامل'));
  const shell = c.part([0, 0.75, 0], { fade: 0.7 });
  c.shell(shell, [W, t, W], [0, t / 2, 0]);
  c.label(shell, [W / 2, t, W / 2], T('Slab 15 cm', 'بلاطة 15 سم'));
  const bot = c.part(), s = [];
  for (let z = -W / 2 + 0.05; z <= W / 2 - 0.05; z += 0.15) s.push(S([-W / 2 + 0.03, 0.025, z], [W / 2 - 0.03, 0.025, z], 0.01));
  for (let x = -W / 2 + 0.05; x <= W / 2 - 0.05; x += 0.15) s.push(S([x, 0.035, -W / 2 + 0.03], [x, 0.035, W / 2 - 0.03], 0.01));
  c.bars(bot, s);
  c.cyl(bot, 0.011, W - 0.1, [0, 0.075, 0.35], 'x', 'conduit', 8);
  c.box(bot, [0.09, 0.09, 0.09], [0.25, 0.07, 0.35], 'conduit');
  c.label(bot, [W / 2 - 0.05, 0.03, W / 2 - 0.05], T('Bottom mesh Ø10 @ 150, both ways', 'شبكة سفلية Ø10 كل 15 سم في الاتجاهين'));
  c.label(bot, [-0.5, 0.075, 0.35], T('Electrical conduit laid before the pour', 'أنبوب كهرباء مرن يُمد قبل الصب'));
  const top = c.part([0, 0.35, 0]), s2 = [];
  for (let x = -W / 2 + 0.06; x <= W / 2 - 0.05; x += 0.2) s2.push(S([x, t - 0.025, -W / 2 + 0.04], [x, t - 0.025, -W / 2 + 0.85], 0.01));
  for (const z of [-W / 2 + 0.2, -W / 2 + 0.6]) s2.push(S([-W / 2 + 0.04, t - 0.035, z], [W / 2 - 0.04, t - 0.035, z], 0.008));
  for (const x of [-0.6, 0, 0.6]) s2.push(S([x - 0.08, 0.04, -W / 2 + 0.4], [x - 0.08, t - 0.04, -W / 2 + 0.4], 0.008), S([x - 0.08, t - 0.04, -W / 2 + 0.4], [x + 0.08, t - 0.04, -W / 2 + 0.4], 0.008), S([x + 0.08, t - 0.04, -W / 2 + 0.4], [x + 0.08, 0.04, -W / 2 + 0.4], 0.008));
  c.bars(top, s2);
  c.label(top, [-W / 2 + 0.06, t - 0.02, -W / 2 + 0.85], T('Top bars over the beam, on chairs', 'تسليح علوي فوق الجائز على كراسٍ'));
  const fin = [['sand', 0.05, T('Sand 5 cm', 'رمل 5 سم')], ['mortar', 0.03, T('Mortar 3 cm', 'ملاط 3 سم')], ['tile', 0.02, T('Tiles 2 cm', 'بلاط 2 سم')]];
  let y = t;
  fin.forEach(([k, th, lab], i) => {
    const p = c.part([0, 1.0 + i * 0.22, 0]);
    c.box(p, [W, th, W], [0, y + th / 2, 0], k); c.label(p, [W / 2, y + th / 2, W / 2], lab); y += th;
  });
  c.frame([0, 0.25, 0], 3.9);
};

B.footing = (c) => {
  const Bf = 2.0, h = 0.6;
  const soil = c.part([0, -0.55, 0]);
  c.box(soil, [2.9, 0.45, 2.9], [0, -0.325, 0], 'soil2');
  c.label(soil, [1.45, -0.3, 1.45], T('Compacted soil at founding level', 'تربة مدكوكة عند منسوب التأسيس'));
  const bl = c.part([0, -0.25, 0]);
  c.box(bl, [Bf + 0.3, 0.1, Bf + 0.3], [0, -0.05, 0], 'blinding');
  c.label(bl, [Bf / 2 + 0.15, -0.05, Bf / 2 + 0.15], T('Plain concrete 10 cm', 'خرسانة نظافة 10 سم'));
  const shell = c.part([0, 1.3, 0], { fade: 0.7 });
  c.shell(shell, [Bf, h, Bf], [0, h / 2, 0]); c.shell(shell, [0.4, 1.0, 0.4], [0, h + 0.5, 0]);
  c.label(shell, [Bf / 2, h, Bf / 2], T('Footing 2.0 × 2.0 × 0.6 m', 'قاعدة 2.0 × 2.0 × 0.6 م'));
  const cage = c.part(), s = [], cv = 0.07, y = cv, leg = 0.3, dx = 0.157;
  for (let z = -Bf / 2 + cv; z <= Bf / 2 - cv + 1e-6; z += 0.15) s.push(S([-Bf / 2 + cv, y + leg, z], [-Bf / 2 + cv, y, z], 0.016), S([-Bf / 2 + cv, y, z], [Bf / 2 - cv, y, z], 0.016), S([Bf / 2 - cv, y, z], [Bf / 2 - cv, y + leg, z], 0.016));
  for (let x = -Bf / 2 + cv; x <= Bf / 2 - cv + 1e-6; x += 0.15) s.push(S([x, y + 0.016 + leg, -Bf / 2 + cv], [x, y + 0.016, -Bf / 2 + cv], 0.016), S([x, y + 0.016, -Bf / 2 + cv], [x, y + 0.016, Bf / 2 - cv], 0.016), S([x, y + 0.016, Bf / 2 - cv], [x, y + 0.016 + leg, Bf / 2 - cv], 0.016));
  c.bars(cage, s);
  c.label(cage, [Bf / 2 - cv, y + leg, Bf / 2 - cv - 0.3], T('Bottom mesh Ø16 @ 150 with turned-up ends', 'شبكة سفلية Ø16 كل 15 سم بأطراف مثنية'));
  const st = c.part([0, 0.35, 0]), s2 = [];
  for (const [px, pz] of [[dx, dx], [-dx, dx], [dx, -dx], [-dx, -dx], [0, dx], [0, -dx], [dx, 0], [-dx, 0]]) {
    const l = Math.hypot(px, pz), fx = (px / l) * 0.3, fz = (pz / l) * 0.3;
    s2.push(S([px + fx, y + 0.04, pz + fz], [px, y + 0.04, pz], 0.016), S([px, y + 0.04, pz], [px, h + 1.35, pz], 0.016));
  }
  for (let yy = h + 0.05; yy < h + 1.0; yy += 0.15) hoopY(s2, 0, yy, 0, 2 * dx + 0.012, 2 * dx + 0.012, 0.008, false);
  hoopY(s2, 0, h - 0.1, 0, 2 * dx + 0.012, 2 * dx + 0.012, 0.008, false);
  c.bars(st, s2);
  c.label(st, [dx, h + 1.33, dx], T('Starter bars 8Ø16 with L-shaped feet', 'قضبان انتظار العمود 8Ø16 بأرجل على شكل L'));
  const sp = c.part([0, -0.1, 0]);
  for (const x of [-0.6, 0, 0.6]) for (const z of [-0.6, 0.6]) c.box(sp, [0.05, 0.05, 0.05], [x, 0.025 + 0.005, z], 'spacer');
  c.label(sp, [0.6, 0.03, 0.6], T('Spacer blocks: 7 cm cover', 'مباعدات: غطاء 7 سم'));
  c.frame([0, 0.55, 0], 5.0);
};

function stack(c, layers, o = {}) {
  const W = o.size || 1.6; let y = 0;
  layers.forEach((Ly, k) => {
    const p = c.part([0, k * (o.gap ?? 0.17), 0]);
    const w = W - k * 0.15, cx = -k * 0.075;
    c.box(p, [w, Ly.t, W], [cx, y + Ly.t / 2, 0], Ly.m);
    if (Ly.mesh) {
      const s = [];
      for (let z = -W / 2 + 0.06; z < W / 2; z += 0.15) s.push(S([cx - w / 2 + 0.03, y + 0.04, z], [cx + w / 2 - 0.03, y + 0.04, z], 0.01));
      c.bars(p, s);
    }
    c.label(p, [cx + w / 2, y + Ly.t / 2, W / 2], Ly.text);
    y += Ly.t;
  });
  c.frame([0, y / 2 + (o.lift || 0), 0], o.dist || 3.6);
}

B.roof = (c) => stack(c, [
  { m: 'concrete', t: 0.15, text: T('RC roof slab 15 cm', 'بلاطة السطح 15 سم') },
  { m: 'roofFinish', t: 0.05, text: T('Screed to falls, 1 % slope', 'خرسانة ميول 1 %') },
  { m: 'membrane', t: 0.025, text: T('Waterproofing: 2 layers bitumen', 'عزل مائي: طبقتان بيتومينيتان') },
  { m: 'insulation', t: 0.05, text: T('Thermal insulation 5 cm', 'عزل حراري 5 سم') },
  { m: 'sand', t: 0.05, text: T('Sand 5 cm', 'رمل 5 سم') },
  { m: 'mortar', t: 0.03, text: T('Mortar 3 cm', 'ملاط 3 سم') },
  { m: 'tile', t: 0.025, text: T('Roof tiles 2 cm', 'بلاط السطح 2 سم') },
], { gap: 0.2 });

B.floor = (c) => stack(c, [
  { m: 'soil2', t: 0.25, text: T('Compacted fill, 25 cm layers', 'ردم مدكوك على طبقات 25 سم') },
  { m: 'membrane', t: 0.015, text: T('Polyethylene sheet against damp', 'غشاء بولي إيثيلين ضد الرطوبة') },
  { m: 'concrete', t: 0.15, mesh: true, text: T('Slab 15 cm, mesh Ø8 @ 200', 'بلاطة 15 سم، شبكة Ø8 كل 20 سم') },
  { m: 'sand', t: 0.05, text: T('Sand 5 cm', 'رمل 5 سم') },
  { m: 'mortar', t: 0.025, text: T('Mortar bed', 'ملاط التثبيت') },
  { m: 'tile', t: 0.02, text: T('Floor tiles', 'بلاط الأرضية') },
], { gap: 0.2 });

B.soil = (c) => stack(c, [
  { m: 'soil4', t: 0.5, text: T('Gravel: over 300 kN/m²', 'حصى: أكثر من 300 كيلونيوتن/م²') },
  { m: 'soil3', t: 0.45, text: T('Dense sand: 200 – 300 kN/m²', 'رمل كثيف: 200 – 300 كيلونيوتن/م²') },
  { m: 'soil2', t: 0.5, text: T('Stiff clay: 100 – 150 kN/m², we found here', 'طين متماسك: 100 – 150 كيلونيوتن/م²، التأسيس هنا') },
  { m: 'ground', t: 0.3, text: T('Fill and topsoil: never found on it', 'ردم وتربة سطحية: لا يُؤسس عليها') },
], { gap: 0.25, size: 1.8, dist: 4.6 });

B.stair = (c) => {
  const n = 7, R = 0.16, Tr = 0.3, W = 1.0, waist = 0.15, wv = waist / Math.cos(Math.atan2(R, Tr));
  const sh = new THREE.Shape(); sh.moveTo(0, 0);
  for (let i = 0; i < n; i++) { sh.lineTo(i * Tr, (i + 1) * R); if (i < n - 1) sh.lineTo((i + 1) * Tr, (i + 1) * R); }
  const uEnd = (n - 1) * Tr, u0 = Math.max(0.001, uEnd - (n * R - wv) * (Tr / R));
  sh.lineTo(uEnd + 0.9, n * R); sh.lineTo(uEnd + 0.9, n * R - 0.16); sh.lineTo(uEnd, n * R - wv); sh.lineTo(u0, 0); sh.lineTo(0, 0);
  const g = new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false }); g.translate(-1.2, 0, -W / 2);
  const shell = c.part([0, 0.9, 0], { fade: 0.7 }); c.geo(shell, g, 'ghost');
  const cage = c.part(), s = [], slope = Math.atan2(R, Tr), off = 0.035 / Math.cos(slope);
  for (let z = -W / 2 + 0.06; z < W / 2; z += 0.15) s.push(S([u0 + 0.02 - 1.2, off, z], [uEnd - 1.2, n * R - wv + off, z], 0.012), S([uEnd - 1.2, n * R - wv + off, z], [uEnd + 0.85 - 1.2, n * R - 0.13, z], 0.012));
  for (let u = u0 + 0.15; u < uEnd; u += 0.2) { const yy = (u - u0) * Math.tan(slope) + off + 0.014; s.push(S([u - 1.2, yy, -W / 2 + 0.04], [u - 1.2, yy, W / 2 - 0.04], 0.008)); }
  c.bars(cage, s);
  c.label(shell, [Tr * 0.5 - 1.2, R, W / 2], T('Tread 30 cm', 'عمق الدرجة 30 سم'));
  c.label(shell, [Tr * 3 - 1.2, R * 3.5, W / 2], T('Riser 16 cm', 'ارتفاع الدرجة 16 سم'));
  c.label(cage, [Tr * 2 - 1.2, 0.2, W / 2 - 0.06], T('Main bars Ø12 @ 150 along the waist', 'تسليح رئيسي Ø12 كل 15 سم باتجاه الميل'));
  c.label(cage, [uEnd + 0.5 - 1.2, n * R - 0.13, -W / 2 + 0.06], T('Landing', 'البسطة'));
  c.frame([0, 0.6, 0], 4.2, [-0.25, 0.35, 1]);
};

B.shearwall = (c) => {
  const Lw = 2.0, Hw = 2.0, t = 0.3;
  const shell = c.part([0, 0, -1.2], { fade: 0.7 });
  c.shell(shell, [Lw, Hw, t], [0, Hw / 2, 0]);
  c.label(shell, [Lw / 2, Hw, -t / 2], T('Wall 30 cm thick', 'جدار بسماكة 30 سم'));
  const cage = c.part(), s = [];
  for (let x = -Lw / 2 + 0.2; x <= Lw / 2 - 0.2 + 1e-6; x += 0.2) for (const z of [-0.1, 0.1]) s.push(S([x, 0, z], [x, Hw + 0.4, z], 0.012));
  for (let y = 0.1; y < Hw; y += 0.25) for (const z of [-0.113, 0.113]) s.push(S([-Lw / 2 + 0.05, y, z], [Lw / 2 - 0.05, y, z], 0.01));
  for (const ex of [-Lw / 2 + 0.08, Lw / 2 - 0.08]) {
    for (const dz of [-0.1, 0.1]) for (const dx of [-0.04, 0.04]) s.push(S([ex + dx, 0, dz], [ex + dx, Hw + 0.4, dz], 0.016));
    for (let y = 0.08; y < Hw; y += 0.15) hoopY(s, ex, y, 0, 0.1, 0.22, 0.008, false);
  }
  for (let x = -0.6; x <= 0.6; x += 0.4) for (let y = 0.35; y < Hw; y += 0.5) s.push(S([x, y, -0.12], [x, y, 0.12], 0.008));
  c.bars(cage, s);
  c.label(cage, [0.2, Hw + 0.38, 0.1], T('Vertical bars Ø12 @ 200, both faces', 'تسليح رأسي Ø12 كل 20 سم في الوجهين'));
  c.label(cage, [-0.4, 0.6, 0.113], T('Horizontal bars Ø10 @ 250', 'تسليح أفقي Ø10 كل 25 سم'));
  c.label(cage, [Lw / 2 - 0.08, 1.4, 0.1], T('Boundary element: closer bars and ties', 'عنصر طرفي: تسليح أكثف وأساور'));
  c.frame([0, 1.1, 0], 4.2);
};

function brickGeo() {
  const w = 0.25, d = 0.12, h = 0.065;
  const s = new THREE.Shape(); s.moveTo(-w / 2, -d / 2); s.lineTo(w / 2, -d / 2); s.lineTo(w / 2, d / 2); s.lineTo(-w / 2, d / 2); s.lineTo(-w / 2, -d / 2);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) {
    const p = new THREE.Path(); p.absarc(-0.08 + i * 0.04, -0.025 + j * 0.05, 0.011, 0, Math.PI * 2, false); s.holes.push(p);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  return g;
}

B.brick = (c) => {
  const geo = brickGeo(), courses = 6, per = 4, cw = 0.26, ch = 0.075;
  const wall = c.part(), mats = [];
  for (let r = 0; r < courses; r++) for (let k = -1; k < per; k++) {
    const x = k * cw + (r % 2 ? cw / 2 : 0) + cw / 2 - (per * cw) / 2;
    if (x < -(per * cw) / 2 + 0.01 || x > (per * cw) / 2 - 0.01) continue;
    if (r === courses - 1 && k === 1) continue; // this brick lifts out
    mats.push([x, r * ch + 0.005]);
  }
  const im = new THREE.InstancedMesh(geo, c.M.clay, mats.length);
  const m4 = new THREE.Matrix4();
  mats.forEach(([x, y], i) => { m4.makeTranslation(x, y, 0); im.setMatrixAt(i, m4); });
  c.add(wall, im);
  const mortar = c.part([0, 0, -0.35]);
  c.box(mortar, [per * cw - 0.01, courses * ch - 0.006, 0.1], [0, (courses * ch) / 2, 0], 'mortar');
  c.label(mortar, [-per * cw / 2 + 0.05, ch * 2, -0.05], T('Mortar 1 : 3, 1 cm joints', 'ملاط 1 : 3، فواصل 1 سم'));
  const one = c.part([0, 0.35, 0.45]);
  const b = new THREE.Mesh(geo, c.M.clay); b.position.set(1 * cw + cw / 2 - (per * cw) / 2 + (5 % 2 ? cw / 2 : 0), (courses - 1) * ch + 0.005, 0); c.add(one, b);
  c.label(one, [b.position.x + 0.12, b.position.y + 0.06, 0.06], T('Perforated clay brick 25 × 12 × 6.5 cm', 'طوب طيني مثقب 25 × 12 × 6.5 سم'));
  c.label(wall, [per * cw / 2 - 0.05, ch * 1.5, 0.06], T('Running bond: joints offset by half a brick', 'ترابط بنصف طوبة: الفواصل الرأسية متخالفة'));
  c.label(one, [b.position.x - 0.05, b.position.y + 0.065, -0.02], T('Holes cut weight and help the mortar key in', 'الثقوب تقلل الوزن وتساعد الملاط على التماسك'));
  c.frame([0, 0.25, 0], 1.6, [-0.5, 0.55, 1]);
};

function blockGeo() {
  const w = 0.39, d = 0.19, h = 0.19;
  const s = new THREE.Shape(); s.moveTo(-w / 2, -d / 2); s.lineTo(w / 2, -d / 2); s.lineTo(w / 2, d / 2); s.lineTo(-w / 2, d / 2); s.lineTo(-w / 2, -d / 2);
  for (const cx of [-0.09, 0.09]) { const p = new THREE.Path(); p.moveTo(cx - 0.065, -0.05); p.lineTo(cx + 0.065, -0.05); p.lineTo(cx + 0.065, 0.05); p.lineTo(cx - 0.065, 0.05); p.lineTo(cx - 0.065, -0.05); s.holes.push(p); }
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
  return g;
}

B.block = (c) => {
  const geo = blockGeo(), W = 1.2, Hh = 0.6;
  const core = c.part(), pos = [];
  for (let r = 0; r < 3; r++) for (let k = -1; k < 3; k++) {
    const x = k * 0.4 + (r % 2 ? 0.2 : 0) - 0.4;
    if (x < -W / 2 + 0.15 || x > W / 2 - 0.15) continue;
    if (r === 2 && k === 0) continue;
    pos.push([x, r * 0.2 + 0.005]);
  }
  const im = new THREE.InstancedMesh(geo, c.M.block, pos.length);
  const m4 = new THREE.Matrix4(); pos.forEach(([x, y], i) => { m4.makeTranslation(x, y, 0); im.setMatrixAt(i, m4); });
  c.add(core, im);
  c.label(core, [W / 2 - 0.25, 0.3, 0.1], T('Hollow block 40 × 20 × 20 cm', 'طوب خرساني مفرغ 40 × 20 × 20 سم'));
  const one = c.part([0, 0.45, 0.55]);
  const b = new THREE.Mesh(geo, c.M.block); b.position.set(-0.4, 0.405, 0); c.add(one, b);
  c.label(one, [-0.4, 0.6, 0], T('Two hollow cores per block', 'تجويفان في كل طوبة'));
  const ext = c.part([0, 0, 0.5]); c.box(ext, [W, Hh, 0.025], [0, Hh / 2, 0.1125], 'plaster');
  c.label(ext, [W / 2, Hh * 0.7, 0.125], T('Outside plaster 2 cm', 'لياسة خارجية 2 سم'));
  const paint = c.part([0, 0, 0.8]); c.box(paint, [W, Hh, 0.006], [0, Hh / 2, 0.13], 'white');
  c.label(paint, [W / 2, Hh * 0.45, 0.134], T('Paint', 'طلاء'));
  const int = c.part([0, 0, -0.5]); c.box(int, [W, Hh, 0.025], [0, Hh / 2, -0.1125], 'plasterIn');
  c.label(int, [-W / 2, Hh * 0.6, -0.125], T('Inside plaster 2 cm', 'لياسة داخلية 2 سم'));
  c.frame([0, 0.3, 0], 2.6, [-0.75, 0.45, 1]);
};

B.lintel = (c) => {
  const t = 0.25, op = 0.9, hOp = 1.3, lh = 0.2, lb = 0.2, Wt = 2.4, Ht = 2.1;
  const wall = c.part();
  const side = (Wt - op) / 2;
  c.box(wall, [side, Ht, t], [-op / 2 - side / 2, Ht / 2, 0], 'brick');
  c.box(wall, [side - lb, Ht - hOp - lh, t], [op / 2 + lb + (side - lb) / 2, hOp + lh + (Ht - hOp - lh) / 2, t * 0].map((v, i) => (i === 0 ? v : v)), 'brick');
  c.box(wall, [side, hOp + lh, t], [op / 2 + side / 2, (hOp + lh) / 2, 0], 'brick');
  const above = c.part([0, 0.75, 0]);
  c.box(above, [op + 2 * lb, Ht - hOp - lh, t], [0, hOp + lh + (Ht - hOp - lh) / 2, 0], 'brick');
  c.label(above, [0, Ht, t / 2], T('Masonry above the opening', 'البناء فوق الفتحة'));
  const shell = c.part([0, 0.4, 0], { fade: 0.75 });
  c.shell(shell, [op + 2 * lb, lh, t], [0, hOp + lh / 2, 0]);
  c.label(shell, [-op / 2 - lb, hOp + lh, t / 2], T('Bears 20 cm on the wall', 'يرتكز 20 سم على الجدار'));
  c.label(shell, [op / 2 + lb, hOp + lh, t / 2], T('20 cm', '20 سم'));
  const cage = c.part(), s = [], n = t / 2 - 0.04;
  for (const z of [-n, n]) { s.push(S([-op / 2 - lb + 0.03, hOp + 0.035, z], [op / 2 + lb - 0.03, hOp + 0.035, z], 0.012)); s.push(S([-op / 2 - lb + 0.03, hOp + lh - 0.035, z], [op / 2 + lb - 0.03, hOp + lh - 0.035, z], 0.01)); }
  for (let x = -op / 2 - lb + 0.08; x < op / 2 + lb - 0.05; x += 0.2) hoopX(s, x, hOp + lh / 2, 0, 2 * n + 0.012, lh - 0.05, 0.006);
  c.bars(cage, s);
  c.label(cage, [0.2, hOp + 0.035, n], T('2Ø12 bottom, 2Ø10 top, stirrups Ø6 @ 200', '2Ø12 سفلي، 2Ø10 علوي، أساور Ø6 كل 20 سم'));
  const fr = c.part();
  const parts = [[op, 0.05, 0.07, 0, hOp - 0.025], [op, 0.05, 0.07, 0, 0.025 + 0.4], [0.05, hOp - 0.4, 0.07, -op / 2 + 0.025, 0.4 + (hOp - 0.4) / 2], [0.05, hOp - 0.4, 0.07, op / 2 - 0.025, 0.4 + (hOp - 0.4) / 2]];
  for (const [w, h, d, x, y] of parts) c.box(fr, [w, h, d], [x, y, 0], 'frame');
  c.box(fr, [op - 0.1, hOp - 0.5, 0.01], [0, 0.4 + (hOp - 0.4) / 2, 0], 'glass');
  c.frame([0, 1.2, 0], 4.4);
};

B.window = (c) => {
  const W = 1.2, Hh = 1.0, p = 0.06;
  const fr = c.part();
  for (const [w, h, x, y] of [[W, p, 0, p / 2], [W, p, 0, Hh - p / 2], [p, Hh, -W / 2 + p / 2, Hh / 2], [p, Hh, W / 2 - p / 2, Hh / 2]]) c.box(fr, [w, h, 0.07], [x, y, 0], 'frame');
  c.label(fr, [-W / 2, Hh * 0.8, 0.035], T('Aluminium frame', 'إطار ألمنيوم'));
  const g1 = c.part([0, 0, 0.45]); c.box(g1, [W - 2 * p, Hh - 2 * p, 0.006], [0, Hh / 2, 0.012], 'glass');
  c.label(g1, [W / 2 - p, Hh - p, 0.015], T('Outer pane 6 mm', 'لوح خارجي 6 مم'));
  const sp = c.part([0, 0, 0.2]);
  for (const [w, h, x, y] of [[W - 2 * p, 0.012, 0, p + 0.006], [W - 2 * p, 0.012, 0, Hh - p - 0.006], [0.012, Hh - 2 * p, -W / 2 + p + 0.006, Hh / 2], [0.012, Hh - 2 * p, W / 2 - p - 0.006, Hh / 2]]) c.box(sp, [w, h, 0.012], [x, y, 0], 'frame');
  c.label(sp, [0, p + 0.01, 0.006], T('Spacer bar and 12 mm sealed air gap', 'فاصل وفراغ هوائي محكم 12 مم'));
  const g2 = c.part([0, 0, -0.3]); c.box(g2, [W - 2 * p, Hh - 2 * p, 0.006], [0, Hh / 2, -0.012], 'glass');
  c.label(g2, [-W / 2 + p, p + 0.05, -0.015], T('Inner pane 6 mm', 'لوح داخلي 6 مم'));
  const gk = c.part([0, 0, 0.65]);
  for (const [w, h, x, y] of [[W + 0.02, 0.012, 0, -0.004], [W + 0.02, 0.012, 0, Hh + 0.004], [0.012, Hh, -W / 2 - 0.004, Hh / 2], [0.012, Hh, W / 2 + 0.004, Hh / 2]]) c.box(gk, [w, h, 0.03], [x, y, 0.02], 'membrane');
  c.label(gk, [W / 2 + 0.01, Hh * 0.3, 0.035], T('Rubber gasket and silicone seal', 'حشوة مطاطية وسيليكون'));
  c.frame([0, 0.5, 0], 2.8, [-0.8, 0.35, 1]);
};

function ringTube(ro, ri, len, cut = true) {
  const pts = [new THREE.Vector2(ri, 0), new THREE.Vector2(ro, 0), new THREE.Vector2(ro, len), new THREE.Vector2(ri, len), new THREE.Vector2(ri, 0)];
  const g = new THREE.LatheGeometry(pts, 40, 0, cut ? Math.PI * 1.5 : Math.PI * 2);
  const parts = [g];
  if (cut) {
    const a = new THREE.BoxGeometry(0.0008, len, ro - ri); a.translate(0, len / 2, (ro + ri) / 2); parts.push(a);
    const b = new THREE.BoxGeometry(ro - ri, len, 0.0008); b.translate(-(ro + ri) / 2, len / 2, 0); parts.push(b);
  }
  return parts;
}

function pipeDetail(c, o) {
  const { ro, ri, len, key, flow } = o;
  const mkTube = (p, x0, l, cut, r1 = ro, r2 = ri, k = key) => {
    for (const g of ringTube(r1, r2, l, cut)) { g.rotateZ(-Math.PI / 2); g.translate(x0, 0, 0); const m = new THREE.Mesh(g, c.M[k]); c.add(p, m); }
  };
  const A = c.part([-o.slide, 0, 0]); mkTube(A, -len, len - o.gap, true);
  const fit = c.part(); mkTube(fit, -o.sock, o.sock * 2, true, ro + o.sockT, ro, o.fitKey || key);
  const Bp = c.part([o.slide, 0, 0]); mkTube(Bp, o.gap, len - o.gap, false);
  if (o.ring) { const tr = new THREE.Mesh(new THREE.TorusGeometry(ro + 0.002, o.ring, 8, 32), c.M.membrane); tr.rotation.y = Math.PI / 2; tr.position.x = -o.sock * 0.4; c.add(fit, tr); }
  if (flow) {
    const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(ri * 0.22, 8, 6), c.M.pipeCold, 18);
    c.add(A, dots); const m4 = new THREE.Matrix4();
    A.tick = (time) => {
      for (let i = 0; i < 18; i++) {
        const u = ((time * 0.06 + i / 18) % 1), ang = i * 2.3, r = ri * 0.55 * ((i % 3) / 3);
        m4.makeTranslation(-len + u * (len - o.gap), Math.cos(ang) * r, Math.sin(ang) * r); dots.setMatrixAt(i, m4);
      }
      dots.instanceMatrix.needsUpdate = true;
    };
  }
  return { A, fit, Bp };
}

B.pipe = (c) => {
  const ro = 0.0125, ri = 0.0083;
  const { A, fit, Bp } = pipeDetail(c, { ro, ri, len: 0.26, gap: 0.012, sock: 0.018, sockT: 0.005, slide: 0.07, key: 'pipeSupply', flow: true });
  c.label(A, [-0.2, ro, ro], T('PPR pipe Ø25 mm, PN20', 'أنبوب PPR قطر 25 مم، PN20'));
  c.label(A, [-0.12, ro * 0.7, ro * 0.7], T('Wall 4.2 mm', 'سماكة الجدار 4.2 مم'));
  c.label(fit, [0, ro + 0.005, 0], T('Socket fusion joint at 260 °C', 'وصلة بالصهر الحراري عند 260 °م'));
  c.label(Bp, [0.2, ro, 0], T('After fusing, pipe and fitting are one piece', 'بعد الصهر يصبح الأنبوب والقطعة جسمًا واحدًا'));
  c.frame([0, 0, 0], 0.62, [-0.35, 0.55, 1]);
};

B.drain = (c) => {
  const ro = 0.055, ri = 0.0518;
  const { A, fit, Bp } = pipeDetail(c, { ro, ri, len: 0.7, gap: 0.01, sock: 0.07, sockT: 0.006, slide: 0.18, key: 'pipeDrain', ring: 0.004 });
  c.label(A, [-0.5, ro, ro * 0.3], T('uPVC Ø110 mm, wall 3.2 mm', 'uPVC قطر 110 مم، سماكة 3.2 مم'));
  c.label(fit, [-0.03, ro + 0.006, 0], T('Socket with rubber ring seal', 'وصلة تداخل بحلقة مطاطية'));
  c.label(Bp, [0.5, ro, 0], T('Lay branches at a 1 – 2 % fall', 'الفروع بميل 1 – 2 %'));
  A.g.rotation.z = Bp.g.rotation.z = fit.g.rotation.z = -0.02;
  c.frame([0, 0, 0], 1.6, [-0.35, 0.5, 1]);
};

B.pilecap = (c) => {
  const s = 1.5, d = 0.5, capH = 1.0, capB = 2.5, Lp = 3.0;
  const piles = c.part([0, -0.6, 0], { fade: 0.4 }), cage = c.part([0, -0.6, 0]), bars = [];
  for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const x = (px * s) / 2, z = (pz * s) / 2;
    c.cyl(piles, d / 2, Lp, [x, -Lp / 2 + 0.1, z], 'y', 'ghost', 24);
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, r = d / 2 - 0.075; bars.push(S([x + Math.cos(a) * r, -Lp + 0.2, z + Math.sin(a) * r], [x + Math.cos(a) * r, 0.65, z + Math.sin(a) * r], 0.018)); }
    for (let y = -Lp + 0.4; y < 0.1; y += 0.3) ringY(bars, x, y, z, d / 2 - 0.065, 12, 0.008);
  }
  c.bars(cage, bars);
  c.label(piles, [s / 2 + d / 2, -1.6, s / 2], T('Bored piles Ø50 cm, 1.5 m apart', 'خوازيق قطر 50 سم على مسافة 1.5 م'));
  c.label(cage, [-s / 2, -1.0, s / 2 + 0.2], T('Pile cage 8Ø18, hoops Ø8', 'قفص الخازوق 8Ø18 وأساور Ø8'));
  const shell = c.part([0, 1.3, 0], { fade: 0.7 });
  c.shell(shell, [capB, capH, capB], [0, capH / 2, 0]);
  c.shell(shell, [0.4, 0.8, 0.4], [0, capH + 0.4, 0]);
  c.label(shell, [capB / 2, capH, capB / 2], T('Pile cap 2.5 × 2.5 × 1.0 m', 'غطاء الخوازيق 2.5 × 2.5 × 1.0 م'));
  const mesh = c.part(), m2 = [];
  for (let z = -capB / 2 + 0.08; z <= capB / 2 - 0.08; z += 0.15) { m2.push(S([-capB / 2 + 0.08, 0.15, z], [capB / 2 - 0.08, 0.15, z], 0.018)); m2.push(S([-capB / 2 + 0.08, capH - 0.08, z], [capB / 2 - 0.08, capH - 0.08, z], 0.016)); }
  for (let x = -capB / 2 + 0.08; x <= capB / 2 - 0.08; x += 0.15) { m2.push(S([x, 0.168, -capB / 2 + 0.08], [x, 0.168, capB / 2 - 0.08], 0.018)); m2.push(S([x, capH - 0.096, -capB / 2 + 0.08], [x, capH - 0.096, capB / 2 - 0.08], 0.016)); }
  const dx = 0.157;
  for (const [px, pz] of [[dx, dx], [-dx, dx], [dx, -dx], [-dx, -dx]]) { const l = Math.hypot(px, pz); m2.push(S([px + (px / l) * 0.3, 0.2, pz + (pz / l) * 0.3], [px, 0.2, pz], 0.016), S([px, 0.2, pz], [px, capH + 1.1, pz], 0.016)); }
  c.bars(mesh, m2);
  c.label(mesh, [capB / 2 - 0.08, 0.15, 0], T('Bottom mesh runs over the pile heads', 'الشبكة السفلية تمر فوق رؤوس الخوازيق'));
  c.label(mesh, [-capB / 2 + 0.08, capH - 0.08, 0], T('Top mesh', 'الشبكة العلوية'));
  c.frame([0, 0.2, 0], 7.4);
};

B.balcony = (c) => {
  const W = 2.0, t = 0.12, proj = 1.3, back = 1.4;
  const shell = c.part([0, 0.8, 0], { fade: 0.75 });
  c.shell(shell, [W, t, back], [0, -t / 2, -back / 2]);
  c.shell(shell, [W, t, proj], [0, -t / 2, proj / 2 + 0.125]);
  c.shell(shell, [W, 0.5, 0.25], [0, -0.25, 0]);
  c.label(shell, [W / 2, 0, proj + 0.125], T('Free edge: nothing holds it up', 'الطرف الحر: لا توجد ركيزة'));
  c.label(shell, [W / 2, -0.4, 0.125], T('Beam on the grid line', 'الجائز على محور الأعمدة'));
  const top = c.part(), s = [];
  for (let x = -W / 2 + 0.06; x <= W / 2 - 0.05; x += 0.15) s.push(S([x, -0.03, -back + 0.05], [x, -0.03, proj + 0.09], 0.012), S([x, -0.03, proj + 0.09], [x, -0.09, proj + 0.09], 0.012));
  for (let z = -back + 0.2; z < proj + 0.1; z += 0.25) s.push(S([-W / 2 + 0.04, -0.043, z], [W / 2 - 0.04, -0.043, z], 0.008));
  c.bars(top, s);
  c.label(top, [-W / 2 + 0.06, -0.02, proj * 0.6], T('Main steel at the TOP: Ø12 @ 150', 'التسليح الرئيسي في الأعلى: Ø12 كل 15 سم'), 'warn');
  c.label(top, [W / 2 - 0.06, -0.02, -back + 0.1], T('Anchored 1.5 m back into the slab', 'مثبت 1.5 م داخل البلاطة الخلفية'));
  const bot = c.part([0, -0.25, 0]), s2 = [];
  for (let x = -W / 2 + 0.06; x <= W / 2 - 0.05; x += 0.2) s2.push(S([x, -t + 0.025, 0.2], [x, -t + 0.025, proj + 0.08], 0.008));
  c.bars(bot, s2);
  c.label(bot, [W / 2 - 0.06, -t + 0.025, proj * 0.8], T('Light bottom mesh Ø8 @ 200', 'شبكة سفلية خفيفة Ø8 كل 20 سم'));
  c.frame([0, -0.1, 0.2], 3.8, [-0.7, 0.55, 1]);
};

function stick(a, b, w, h) {
  const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), len = A.distanceTo(Bv);
  const g = new THREE.BoxGeometry(w, h, len);
  const o = new THREE.Object3D(); o.position.copy(A).add(Bv).multiplyScalar(0.5); o.lookAt(Bv); o.updateMatrix(); g.applyMatrix4(o.matrix);
  return g;
}

B.truss = (c) => {
  const span = 8, rise = span / 2 * Math.tan(Math.PI / 6);
  const tr = c.part();
  const mem = [[[0, 0, -span / 2], [0, 0, span / 2]], [[0, 0, -span / 2], [0, rise, 0]], [[0, 0, span / 2], [0, rise, 0]], [[0, 0, 0], [0, rise, 0]],
    [[0, 0.05, 0], [0, rise / 2, -span / 4]], [[0, 0.05, 0], [0, rise / 2, span / 4]]];
  for (const [a, b] of mem) c.geo(tr, stick(a, b, 0.06, 0.16), 'wood');
  for (const p of [[0, 0, -span / 2], [0, 0, span / 2], [0, rise, 0], [0, 0, 0]]) c.box(tr, [0.075, 0.28, 0.32], p, 'frame');
  c.label(tr, [0, rise / 2, -span / 4 - 0.4], T('Rafter: compression', 'الرافدة المائلة: ضغط'));
  c.label(tr, [0, -0.05, span / 4], T('Bottom tie: tension', 'الرابط السفلي: شد'));
  c.label(tr, [0, rise * 0.7, 0], T('King post', 'القائم الأوسط'));
  c.label(tr, [0, rise * 0.25, span / 8], T('Strut', 'دعامة'));
  c.label(tr, [0, rise + 0.1, 0], T('Steel nail plate at each joint', 'صفيحة معدنية عند كل عقدة'));
  const pu = c.part([0, 0.5, 0]);
  for (let k = 1; k < 4; k++) { const z = -span / 2 + (k * span) / 8, y = (k * rise) / 4 + 0.13; c.geo(pu, stick([-1.6, y, z], [1.6, y, z], 0.075, 0.06), 'wood'); }
  c.label(pu, [1.6, rise / 2 + 0.13, -span / 4], T('Purlins carry the tiles between trusses', 'العوارض الأفقية تحمل القرميد بين الجملونات'));
  const tl = c.part([0, 1.1, 0]);
  const slope = Math.hypot(span / 2, rise), g = boxGeo(3.4, 0.03, slope);
  const tile = new THREE.Mesh(g, c.M.roofTile);
  tile.position.set(0, rise / 2 + 0.22, -span / 4); tile.lookAt(0, rise + 0.22, 0); c.add(tl, tile);
  c.label(tl, [1.7, rise / 2 + 0.25, -span / 4], T('Clay tiles at 30°', 'قرميد بميل 30°'));
  c.frame([0, rise / 2, 0], 10.5, [-1, 0.35, 0.35]);
};

export class DetailStudio {
  constructor(M, env) {
    this.scene = new THREE.Scene(); this.scene.environment = env;
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.01, 200);
    this.root = new THREE.Group(); this.scene.add(this.root);
    this.parts = []; this.labels = []; this.view = null; this.time = 0;
    this.barGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true); this.barGeo.translate(0, 0.5, 0);
    const keep = (m) => { const c = m.clone(); c.transparent = false; c.opacity = 1; c.depthWrite = true; c.side = THREE.FrontSide; c.userData = {}; return c; };
    this.mat = {};
    for (const [k, m] of Object.entries(M)) this.mat[k] = k === 'glass' ? m.clone() : keep(m);
    this.mat.ghost = keep(M.concrete); Object.assign(this.mat.ghost, { transparent: true, opacity: 0.3, depthWrite: false });
    this.mat.clay = new THREE.MeshStandardMaterial({ color: 0xa5503a, roughness: 0.9, envMapIntensity: 0.5 });
    this.mat.steel.envMapIntensity = 1;
    const hemi = new THREE.HemisphereLight(0xffffff, 0x8f887a, 0.7);
    const sun = new THREE.DirectionalLight(0xfff3df, 2.2); sun.position.set(-4, 8, 6); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 30 });
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.01;
    this.scene.add(hemi, sun);
    this.floorShadow = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.16 }));
    this.floorShadow.rotation.x = -Math.PI / 2; this.floorShadow.receiveShadow = true; this.scene.add(this.floorShadow);
    this.grid = new THREE.GridHelper(20, 80, 0x808a88, 0x808a88);
    this.grid.material.transparent = true; this.grid.material.opacity = 0.18; this.scene.add(this.grid);
  }

  has(type) { return !!B[type]; }

  open(type) {
    this.clear();
    if (!B[type]) return false;
    B[type](new Ctx(this));
    this.root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.root);
    const y = box.min.y - 0.002;
    this.floorShadow.position.y = y; this.grid.position.y = y - 0.001;
    this.setExplode(0);
    return true;
  }

  clear() {
    for (const l of this.labels) l.element.remove();
    this.root.traverse((o) => { if (o.geometry && o.geometry !== this.barGeo) o.geometry.dispose(); });
    this.root.clear(); this.parts = []; this.labels = []; this.view = null;
  }

  setExplode(e) {
    this.explode = e;
    for (const p of this.parts) {
      p.g.position.copy(p.dir).multiplyScalar(e);
      if (p.fade) for (const m of p.mats) m.opacity = m.userData.base * (1 - p.fade * e);
    }
  }

  refreshLabels() { for (const l of this.labels) l.element.querySelector('span').textContent = L(l.userData.text); }

  setTheme(dark) {
    this.grid.material.color.set(dark ? 0x9fb0ad : 0x5d6866);
    this.grid.material.opacity = dark ? 0.14 : 0.2;
    this.floorShadow.material.opacity = dark ? 0.35 : 0.16;
  }

  update(dt) {
    this.time += dt;
    let moving = false;
    for (const p of this.parts) if (p.tick) { p.tick(this.time); moving = true; }
    return moving;
  }
}
