// Haykal Structure Lab: app shell. One WebGL canvas, three scenes (model,
// close-up detail, foundation lab), CSS2D labels on top, and the UI around it.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createMaterials, setGhost } from './textures.js';
import { disposeModel } from './builder.js';
import { buildBuilding } from './building.js';
import { buildHouse } from './house.js';
import { FOUNDATION_TYPES } from './foundations.js';
import { LoadPath } from './loadpath.js';
import { DetailStudio } from './detail.js';
import { FoundationLab, SOILS } from './lab.js';
import { DATA, CAT } from './data.js';
import { t, L, lang, setLang, num } from './i18n.js';
import { icon } from './icons.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const easeIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const app = $('#app'), canvas = $('#gl'), stageEl = $('#stage');
for (const el of $$('[data-icon]')) el.innerHTML = icon(el.dataset.icon);

// ---------- renderer and scenes ----------
const small = Math.min(screen.width, screen.height) < 700;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.6 : 2));
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const labelRenderer = new CSS2DRenderer({ element: $('#labels') });
const env = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const M = createMaterials();

const scene = new THREE.Scene(); scene.environment = env;
const hemi = new THREE.HemisphereLight(0xf4f6ff, 0x8a7f6a, 0.55);
const sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
sun.castShadow = true; sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 120 });
sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
scene.add(hemi, sun, sun.target);
const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 600);
const mkControls = (cam) => {
  const c = new OrbitControls(cam, canvas);
  Object.assign(c, { enableDamping: true, dampingFactor: 0.08, screenSpacePanning: true, enabled: false });
  c.addEventListener('change', () => invalidate());
  return c;
};
const controls = mkControls(camera);
controls.maxPolarAngle = 1.68; controls.minDistance = 1.0; controls.maxDistance = 95;

function radialTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, '#fff'); gr.addColorStop(0.5, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c);
}
const floorMat = new THREE.MeshStandardMaterial({ color: 0xc9cec8, roughness: 1, transparent: true, alphaMap: radialTex(), depthWrite: false });
const floor = new THREE.Mesh(new THREE.CircleGeometry(75, 48), floorMat);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

const loadPath = new LoadPath(); loadPath.group.visible = false; scene.add(loadPath.group);
const detail = new DetailStudio(M, env);
const detailControls = mkControls(detail.camera);
const lab = new FoundationLab(M, env);
const labControls = mkControls(lab.camera);
labControls.maxPolarAngle = 1.62;

const selTagEl = document.createElement('div'); selTagEl.className = 'seltag';
const selTag = new CSS2DObject(selTagEl); selTag.visible = false; scene.add(selTag);

const views = {
  main: { scene, camera, controls },
  detail: { scene: detail.scene, camera: detail.camera, controls: detailControls },
  lab: { scene: lab.scene, camera: lab.camera, controls: labControls },
};
let view = 'main';
let needs = 3;
function invalidate(n = 2) { needs = Math.max(needs, n); }

// ---------- state ----------
const LAYERS = ['soil', 'foundation', 'structure', 'masonry', 'openings', 'mep', 'roof'];
const S = {
  mode: 'building', fnd: { building: 'isolated', house: 'isolated' },
  layers: Object.fromEntries(LAYERS.map((k) => [k, true])),
  xray: false, ghost: 0, zoomGhost: 0, section: { mode: 'off', v: 0.55 }, explode: 0, loads: false,
  build: { on: false, t: 0, playing: false, goal: null }, quiz: null, sel: null, hovered: null,
  pop: null, tween: null, detailAnim: null, labType: null, hintGone: false,
};
let model = null;

// ---------- model ----------
function loadModel(keepCamera = false) {
  clearSelection();
  if (model) { scene.remove(model.group); disposeModel(model); }
  model = S.mode === 'house' ? buildHouse(M, { foundation: S.fnd.house }) : buildBuilding(M, { foundation: S.fnd.building });
  scene.add(model.group);
  const all = new THREE.Box3().setFromObject(model.group);
  floor.position.y = all.min.y - 0.02;
  sun.target.position.copy(model.center);
  sun.position.copy(model.center).add(new THREE.Vector3(-20, 34, 24));
  loadPath.build(model);
  if (S.build.on) S.build.t = Math.min(S.build.t, model.stages.length);
  if (!keepCamera) resetView(false);
  applySection(); applyModel(); renderInspector(); renderPop(); updateTimeline();
  invalidate(3);
}

function resetView(animate = true) {
  const b = model.bounds, sphere = b.getBoundingSphere(new THREE.Sphere());
  const target = sphere.center.clone(); target.y -= (b.max.y - b.min.y) * 0.06;
  const dir = model.view.pos.clone().sub(model.view.target).normalize();
  const pos = target.clone().addScaledVector(dir, fitDistance(sphere.radius, camera) * 0.9);
  if (animate && !reduceMotion) tweenTo(views.main, target, pos);
  else { camera.position.copy(pos); controls.target.copy(target); controls.update(); }
}

function applyModel() {
  if (!model) return;
  const tb = S.build.on ? S.build.t : Infinity;
  for (const e of model.elements) {
    const ud = e.userData;
    let vis = S.layers[ud.layer] !== false, sy = 1;
    if (S.build.on && !ud.static) {
      const p = tb - ud.stage;
      if (p <= 0) vis = false;
      else if (ud.pour) { const q = (p - 0.35) / 0.6; if (q <= 0) vis = false; else sy = ease(q); }
      else sy = ease(p * 1.6);
    }
    e.visible = vis;
    if (vis) e.scale.y = Math.max(0.001, sy);
    if (ud.finishMat) {
      ud.baseMat = !S.build.on || tb >= ud.finishStage + 0.3 ? ud.finishMat : ud.roughMat;
      paint(e);
    }
  }
  applyRebar();
  model.floors.forEach((f, i) => { if (f) f.position.y = i > 0 ? i * model.explodeGap * S.explode : 0; });
  loadPath.group.visible = S.loads && S.explode < 0.01;
  invalidate();
}

function applyRebar() {
  if (!model) return;
  const tb = S.build.on ? S.build.t : Infinity, g = S.ghost;
  for (const r of model.rebar) {
    const ud = r.userData;
    let vis = S.layers[ud.layer] !== false;
    if (vis) { const p = tb - ud.stage; vis = S.build.on ? p > 0 && (g > 0.08 || p < 1) : g > 0.08; }
    r.visible = vis;
  }
}

const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
function applySection() {
  if (!model || view !== 'main' || S.section.mode === 'off') renderer.clippingPlanes = [];
  else {
    const b = model.bounds;
    if (S.section.mode === 'h') { clipPlane.normal.set(0, -1, 0); clipPlane.constant = THREE.MathUtils.lerp(b.min.y - 0.4, b.max.y + 0.3, S.section.v); }
    else { clipPlane.normal.set(0, 0, -1); clipPlane.constant = THREE.MathUtils.lerp(b.min.z - 0.4, b.max.z + 0.4, S.section.v); }
    renderer.clippingPlanes = [clipPlane];
  }
  setGhost(M, S.ghost, S.section.mode !== 'off' ? THREE.DoubleSide : THREE.FrontSide);
  invalidate();
}
const passClip = (p) => renderer.clippingPlanes.length === 0 || clipPlane.distanceToPoint(p) >= -0.01;

// ---------- picking and highlight ----------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
const shown = (o) => { while (o) { if (!o.visible) return false; o = o.parent; } return true; };
const isGhostMat = (o) => !!(o.userData.baseMat || o.material)?.userData?.ghost;

function pickAt(cx, cy, hover = false) {
  if (!model) return null;
  const r = canvas.getBoundingClientRect();
  ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const list = model.pick.filter((o) => (!hover || !o.isInstancedMesh) && shown(o));
  const hits = ray.intersectObjects(list, false).filter((h) => passClip(h.point));
  if (!hits.length) return null;
  if (S.ghost > 0.45) {
    const solid = hits.find((h) => !isGhostMat(h.object));
    if (solid && solid.distance - hits[0].distance < 1.2) return solid.object;
  }
  return hits[0].object;
}

const hlCache = new Map();
function hlMat(base, kind) {
  const k = base.uuid + kind;
  let m = hlCache.get(k);
  if (!m) {
    m = base.clone();
    m.emissive = new THREE.Color(kind === 'sel' ? 0xf2a516 : 0xffffff);
    m.emissiveIntensity = kind === 'sel' ? 0.45 : 0.14;
    hlCache.set(k, m);
  }
  const glass = base === M.glass;
  const wantT = kind === 'hover' || glass ? base.transparent : false;
  if (m.transparent !== wantT || m.side !== base.side) { m.transparent = wantT; m.side = base.side; m.needsUpdate = true; }
  m.opacity = wantT ? base.opacity : 1; m.depthWrite = wantT ? base.depthWrite : true;
  return m;
}
function paint(mesh) {
  if (!mesh || mesh.isInstancedMesh) return;
  const ud = mesh.userData;
  if (!ud.baseMat) ud.baseMat = mesh.material;
  const selected = S.sel?.set.has(mesh);
  mesh.material = selected ? hlMat(ud.baseMat, 'sel') : mesh === S.hovered ? hlMat(ud.baseMat, 'hover') : ud.baseMat;
}
function setHover(o) {
  if (o === S.hovered) return;
  const prev = S.hovered; S.hovered = o;
  paint(prev); paint(o);
  canvas.style.cursor = o ? 'pointer' : '';
  invalidate();
}

function clearSelection() {
  if (!S.sel) return;
  const old = S.sel; S.sel = null;
  for (const m of old.set) paint(m);
  selTag.visible = false;
  app.classList.remove('has-sel');
  invalidate();
}

function select(obj) {
  clearSelection();
  if (!obj) { renderInspector(); return; }
  const ud = obj.userData, key = ud.key;
  let set;
  if (obj.isInstancedMesh) set = new Set([obj]);
  else if (ud.code && key !== 'soil') set = new Set(model.elements.filter((e) => e.userData.code === ud.code && e.userData.key === key && e.userData.floor === ud.floor));
  else if (key === 'soil') set = new Set(model.elements.filter((e) => e.userData.key === 'soil'));
  else set = new Set([obj]);
  S.sel = { key, obj, set };
  for (const m of set) paint(m);
  const box = new THREE.Box3(); for (const m of set) if (!m.isInstancedMesh) box.expandByObject(m);
  if (!box.isEmpty()) {
    selTag.position.set((box.min.x + box.max.x) / 2, box.max.y + 0.15, (box.min.z + box.max.z) / 2);
    selTag.visible = true;
  }
  renderSelTag();
  app.classList.add('has-sel'); $('#inspector').classList.remove('expanded');
  renderInspector();
  invalidate();
}
function renderSelTag() {
  if (!S.sel) return;
  const d = DATA[S.sel.key];
  selTagEl.innerHTML = `${S.sel.obj.userData.code && S.sel.key !== 'soil' ? `<b>${esc(S.sel.obj.userData.code)}</b>` : ''}<span>${esc(L(d?.name))}</span>`;
}

// ---------- inspector ----------
const fmtDims = (d) => d ? d.map((v) => num(v, 2)).join(' × ') + ' m' : '';
function renderInspector() {
  const el = $('#inspBody');
  if (!S.sel) {
    el.innerHTML = `<div class="ins-empty"><div class="empty-mark">${icon('focus')}</div><h2>${esc(t('insp.emptyT'))}</h2><p>${esc(t('insp.emptyB'))}</p>
      <ul class="legend">${['column', 'tiebeam', 'footing', 'brickwall', 'waterpipe'].map((k) => `<li><button class="chip" data-find="${k}">${esc(L(DATA[k].name))}</button></li>`).join('')}</ul></div>`;
    return;
  }
  const { key, obj } = S.sel, d = DATA[key] || { name: { en: key, ar: key } }, ud = obj.userData;
  const rows = [];
  if (key === 'rebar') {
    rows.push([t('this.level'), t('lvl.' + (ud.floor === 0 ? 0 : Math.min(5, ud.floor)))]);
    rows.push([t('this.bars'), num(ud.count, 0)]);
  } else {
    if (key !== 'soil') rows.push([t('this.level'), t('lvl.' + clamp(ud.level ?? 0, 0, 5))]);
    if (ud.length) rows.push([t('this.length'), num(ud.length, 2) + ' m']);
    else if (ud.dims) rows.push([t('this.size'), fmtDims(ud.dims)]);
    let vol = 0; for (const m of S.sel.set) vol += m.userData.volume || 0;
    if (key === 'soil') vol = 0;
    if (vol > 0.001) {
      rows.push([ud.pour && (ud.baseMat || obj.material) !== M.brick ? t('this.volume') : t('this.vol'), num(vol, 2) + ' m³']);
      if (d.density) rows.push([t('this.weight'), num(vol * d.density, 2) + ' t']);
    }
  }
  const nums = (d.nums || []).map((r) => `<div><dt>${esc(L(r))}</dt><dd>${esc((lang() === 'ar' ? r.va : r.v).replace('{bars}', num(model?.rebarCount || 0, 0)))}</dd></div>`).join('');
  const made = (d.made || []).map((m) => `<li><span class="sw" style="--sw:${m.c}"></span><div><b>${esc(lang() === 'ar' ? m.ar : m.en)}</b><span>${esc(lang() === 'ar' ? m.dar : m.den)}</span></div></li>`).join('');
  const hasDetail = d.detail && detail.has(d.detail);
  el.innerHTML = `
    <header class="ins-head">
      <div class="tagrow">${ud.code && key !== 'soil' && key !== 'rebar' ? `<span class="rtag">${esc(ud.code)}</span>` : ''}<span class="cat">${esc(L(CAT[d.cat]))}</span>
        <button class="icon-btn ins-close" data-act="close" aria-label="${esc(t('insp.close'))}">${icon('close')}</button></div>
      <h2>${esc(L(d.name))}</h2>
      ${rows.length ? `<dl class="titleblock">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
      <div class="ins-actions">
        ${hasDetail ? `<button class="btn primary" data-act="inside">${icon('inside')}<span>${esc(t('insp.inside'))}</span></button>` : ''}
        <button class="btn" data-act="focus">${icon('focus')}<span>${esc(t('insp.focus'))}</span></button>
      </div>
    </header>
    <div class="ins-scroll">
      <p class="sum">${esc(L(d.sum))}</p>
      ${made ? `<section><h3>${esc(t('insp.made'))}</h3><ul class="made">${made}</ul></section>` : ''}
      ${nums ? `<section><h3>${esc(t('insp.nums'))}</h3><dl class="nums">${nums}</dl></section>` : ''}
      ${d.load ? `<section class="loadsec"><h3>${esc(t('insp.load'))}</h3><p>${esc(L(d.load))}</p></section>` : ''}
      ${d.mistake ? `<section class="mistake"><h3>${icon('alert')}<span>${esc(t('insp.mistake'))}</span></h3><p>${esc(L(d.mistake))}</p></section>` : ''}
    </div>`;
}

$('#inspector').addEventListener('click', (e) => {
  const b = e.target.closest('[data-act],[data-find]');
  if (!b) return;
  if (b.dataset.find) {
    // pick the matching element nearest the camera, so the zoom lands on one the student can see
    let best = null, bestD = Infinity; const c = new THREE.Vector3();
    for (const m of model.elements) {
      if (m.userData.key !== b.dataset.find || !shown(m)) continue;
      new THREE.Box3().setFromObject(m).getCenter(c);
      const d = c.distanceTo(camera.position);
      if (d < bestD) { bestD = d; best = m; }
    }
    if (best) { select(best); focusOn(S.sel.set); }
    return;
  }
  const act = b.dataset.act;
  if (act === 'close') { clearSelection(); renderInspector(); }
  else if (act === 'focus') focusOn(S.sel.set);
  else if (act === 'inside') openDetail(DATA[S.sel.key].detail, L(DATA[S.sel.key].name));
});
$('#sheetHandle').addEventListener('click', () => $('#inspector').classList.toggle('expanded'));

function focusOn(set) {
  const box = new THREE.Box3();
  for (const m of set) { if (m.isInstancedMesh) continue; box.expandByObject(m); }
  if (box.isEmpty()) return;
  const c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3()).length();
  const dist = clamp(size * 1.5 + 1.8, 2.4, 45);
  const dir = camera.position.clone().sub(controls.target).normalize();
  tweenTo(views.main, c, c.clone().addScaledVector(dir, dist));
}

function tweenTo(v, target, pos, dur = 0.9) {
  if (reduceMotion) { v.controls.target.copy(target); v.camera.position.copy(pos); v.controls.update(); invalidate(); return; }
  S.tween = { v, t: 0, dur, t0: v.controls.target.clone(), p0: v.camera.position.clone(), t1: target, p1: pos };
}

// ---------- pointer ----------
const pointers = new Set();
let down = null, hoverReq = null;
canvas.addEventListener('pointerdown', (e) => {
  pointers.add(e.pointerId);
  down = { x: e.clientX, y: e.clientY, t: performance.now(), multi: pointers.size > 1 || (down && down.multi) };
  S.tween = null; S.build.follow = false;
  hideHint(); closePop();
});
const endPointer = (e) => {
  pointers.delete(e.pointerId);
  if (!down) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t, multi = down.multi;
  if (pointers.size === 0) down = null;
  if (!multi && moved < 7 && dt < 650 && e.type === 'pointerup') onTap(e.clientX, e.clientY);
};
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('pointermove', (e) => { if (!coarse && e.pointerType === 'mouse' && !down && view === 'main') hoverReq = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerleave', () => setHover(null));

function onTap(x, y) {
  if (view !== 'main') return;
  const o = pickAt(x, y);
  if (S.quiz) { quizCheck(o); return; }
  select(o);
}

// ---------- hint, toast ----------
function hideHint() { if (S.hintGone) return; S.hintGone = true; $('#hint').classList.add('gone'); }
let toastTimer = null;
function toast(msg, kind = '') {
  const el = $('#toast'); el.textContent = msg; el.className = 'toast show ' + kind;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.className = 'toast'; }, 2600);
}

// ---------- tools and popovers ----------
$('#dock').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tool]'); if (!b) return;
  const tool = b.dataset.tool;
  if (['layers', 'section', 'explode', 'foundation'].includes(tool)) { S.pop === tool ? closePop() : openPop(tool, b); return; }
  closePop();
  if (tool === 'xray') { S.xray = !S.xray; syncDock(); }
  else if (tool === 'loads') { S.loads = !S.loads; if (S.loads) { S.explode = 0; if (S.build.on) stopBuild(); } applyModel(); syncDock(); if (S.loads) toast(L({ en: 'Follow the arrows: slab → beam → column → footing → soil', ar: 'تابع الأسهم: البلاطة ← الجائز ← العمود ← القاعدة ← التربة' })); }
  else if (tool === 'build') { S.build.on ? stopBuild() : startBuild(); }
  else if (tool === 'quiz') { S.quiz ? stopQuiz() : startQuiz(); }
  else if (tool === 'reset') { resetView(true); }
});

function syncDock() {
  const on = { xray: S.xray, loads: S.loads, build: S.build.on, quiz: !!S.quiz, section: S.section.mode !== 'off', explode: S.explode > 0.01,
    layers: LAYERS.some((k) => !S.layers[k]), foundation: false };
  for (const b of $$('#dock [data-tool]')) {
    const k = b.dataset.tool;
    if (k in on) b.setAttribute('aria-pressed', String(!!on[k] || S.pop === k));
  }
  invalidate();
}

function openPop(kind, btn) {
  S.pop = kind; S.popBtn = btn; renderPop(); syncDock();
}
function closePop() { if (!S.pop) return; S.pop = null; $('#pop').hidden = true; syncDock(); }
function placePop() {
  const pop = $('#pop'), btn = S.popBtn; if (!btn || pop.hidden) return;
  const r = btn.getBoundingClientRect(), pr = pop.getBoundingClientRect(), W = innerWidth;
  const left = clamp(r.left + r.width / 2 - pr.width / 2, 12, W - pr.width - 12);
  pop.style.left = left + 'px'; pop.style.right = 'auto';
  pop.style.bottom = (innerHeight - r.top + 10) + 'px';
}
function renderPop() {
  const pop = $('#pop');
  if (!S.pop || !model) { pop.hidden = true; return; }
  let h = '';
  if (S.pop === 'layers') {
    const present = new Set(model.elements.map((e) => e.userData.layer));
    h = `<h3>${esc(t('layers.title'))}</h3><div class="checks">${LAYERS.filter((k) => present.has(k)).map((k) => `
      <label class="check"><input type="checkbox" id="ly-${k}" data-layer="${k}" ${S.layers[k] ? 'checked' : ''}><span class="box"></span><span>${esc(t('layer.' + k))}</span></label>`).join('')}</div>`;
  } else if (S.pop === 'section') {
    h = `<h3>${esc(t('sec.title'))}</h3><div class="seg" role="radiogroup">${['off', 'h', 'v'].map((m) => `<button role="radio" aria-checked="${S.section.mode === m}" data-sec="${m}">${esc(t('sec.' + m))}</button>`).join('')}</div>
      <label class="range ${S.section.mode === 'off' ? 'dim' : ''}"><span>${esc(t('sec.pos'))}</span><input id="secRange" type="range" min="0" max="1" step="0.005" value="${S.section.v}" ${S.section.mode === 'off' ? 'disabled' : ''}></label>`;
  } else if (S.pop === 'explode') {
    h = `<h3>${esc(t('exp.title'))}</h3><label class="range"><span>${esc(t('exp.amount'))}</span><input id="expRange" type="range" min="0" max="1" step="0.01" value="${S.explode}"></label>`;
  } else if (S.pop === 'foundation') {
    const cur = S.fnd[S.mode];
    h = `<h3>${esc(t('fnd.title'))}</h3><div class="radios">${FOUNDATION_TYPES.map((k) => `
      <label class="radio"><input type="radio" name="fnd" id="fnd-${k}" value="${k}" ${cur === k ? 'checked' : ''}><span class="dot"></span><span><b>${esc(t('fnd.' + k))}</b><small>${esc(t('fnd.' + k + 'D'))}</small></span></label>`).join('')}</div>`;
  }
  pop.innerHTML = h; pop.hidden = false;
  requestAnimationFrame(placePop);
}
$('#pop').addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.layer) { S.layers[el.dataset.layer] = el.checked; if (S.sel && !shown(S.sel.obj)) { clearSelection(); renderInspector(); } applyModel(); syncDock(); }
  else if (el.id === 'secRange') { S.section.v = +el.value; applySection(); }
  else if (el.id === 'expRange') { S.explode = +el.value; if (S.explode > 0.01 && S.loads) { S.loads = false; } applyModel(); syncDock(); }
  else if (el.name === 'fnd') {
    S.fnd[S.mode] = el.value; loadModel(true);
    toast(t('toast.fnd', { name: t('fnd.' + el.value) }));
  }
});
$('#pop').addEventListener('click', (e) => {
  const b = e.target.closest('[data-sec]'); if (!b) return;
  S.section.mode = b.dataset.sec; applySection(); renderPop(); syncDock();
});
document.addEventListener('pointerdown', (e) => {
  if (S.pop && !e.target.closest('#pop') && !e.target.closest('#dock')) closePop();
});
addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (S.pop) closePop();
  else if (view === 'detail') closeDetail();
  else if (S.sel) { clearSelection(); renderInspector(); }
});

// ---------- build sequence ----------
function startBuild() {
  S.build.on = true; S.build.t = 0; S.build.playing = !reduceMotion; S.build.goal = null; S.build.follow = true;
  hideHint();
  S.loads = false; S.explode = 0; clearSelection(); renderInspector();
  $('#timeline').hidden = false; app.classList.add('building-on');
  applyModel(); updateTimeline(); syncDock();
}
function stopBuild() {
  S.build.on = false; S.build.playing = false;
  $('#timeline').hidden = true; app.classList.remove('building-on');
  applyModel(); syncDock();
}
function updateTimeline() {
  if (!S.build.on || !model) return;
  const total = model.stages.length, k = clamp(Math.floor(S.build.t - 1e-6), 0, total - 1), st = model.stages[k];
  $('#tlStep').textContent = t('build.step', { n: k + 1, total });
  $('#tlCap').textContent = t('st.' + st.key, st.params.lvl ? { lvl: t('lvl.' + st.params.lvl) } : undefined);
  const r = $('#tlRange'); r.max = total; r.value = S.build.t;
  r.style.setProperty('--p', (S.build.t / total) * 100 + '%');
  const pb = $('#tlPlay'); pb.innerHTML = icon(S.build.playing ? 'pause' : 'play'); pb.setAttribute('aria-label', t(S.build.playing ? 'build.pause' : 'build.play'));
}
$('#timeline').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b || !model) return;
  const total = model.stages.length;
  if (b.id === 'tlPlay') { if (S.build.t >= total) S.build.t = 0; S.build.playing = !S.build.playing; S.build.goal = null; }
  else if (b.id === 'tlNext') { S.build.goal = Math.min(total, Math.floor(S.build.t + 1e-6) + 1); S.build.playing = true; }
  else if (b.id === 'tlPrev') { S.build.t = Math.max(0, Math.ceil(S.build.t - 1e-6) - 1); S.build.playing = false; applyModel(); }
  else if (b.id === 'tlClose') { stopBuild(); return; }
  updateTimeline(); invalidate();
});
$('#tlRange').addEventListener('input', (e) => { S.build.t = +e.target.value; S.build.playing = false; applyModel(); updateTimeline(); });

// ---------- quiz ----------
function startQuiz() {
  if (S.build.on) stopBuild();
  clearSelection(); renderInspector();
  const keys = [...new Set(model.elements.filter((e) => shown(e) && e.userData.key !== 'soil').map((e) => e.userData.key))].filter((k) => DATA[k]);
  for (let i = keys.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [keys[i], keys[j]] = [keys[j], keys[i]]; }
  S.quiz = { list: keys.slice(0, 8), i: 0, score: 0, tries: 0, done: false };
  $('#quizBar').hidden = false; app.classList.add('quiz-on');
  updateQuizBar(); syncDock();
}
function stopQuiz() { S.quiz = null; $('#quizBar').hidden = true; app.classList.remove('quiz-on'); syncDock(); }
function updateQuizBar() {
  const q = S.quiz, el = $('#quizBar'); if (!q) return;
  if (q.done) {
    el.innerHTML = `<div class="qz-q"><b>${esc(t('quiz.end', { s: q.score, n: q.list.length }))}</b></div>
      <div class="qz-act"><button class="btn primary" data-q="again">${esc(t('quiz.again'))}</button><button class="btn" data-q="exit">${esc(t('quiz.exit'))}</button></div>`;
    return;
  }
  const name = L(DATA[q.list[q.i]].name);
  el.innerHTML = `<div class="qz-q"><span>${esc(t('quiz.find'))}</span> <b>${esc(name)}</b>${lang() === 'ar' ? '؟' : '?'}</div>
    <div class="qz-act"><span class="qz-score" aria-label="score">${esc(t('quiz.score', { s: q.score, n: q.list.length }))}</span>
    <button class="btn" data-q="skip">${esc(t('quiz.skip'))}</button><button class="icon-btn" data-q="exit" aria-label="${esc(t('quiz.exit'))}">${icon('close')}</button></div>`;
}
$('#quizBar').addEventListener('click', (e) => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  if (b.dataset.q === 'exit') stopQuiz();
  else if (b.dataset.q === 'again') startQuiz();
  else if (b.dataset.q === 'skip') nextQuiz();
});
function nextQuiz() {
  const q = S.quiz; q.i++; q.tries = 0;
  if (q.i >= q.list.length) q.done = true;
  updateQuizBar();
}
function quizCheck(o) {
  const q = S.quiz; if (!o || q.done) return;
  const key = o.userData.key, target = q.list[q.i];
  select(o);
  if (key === target) { if (q.tries === 0) q.score++; toast(t('quiz.right', { name: L(DATA[key].name) }), 'ok'); setTimeout(() => { clearSelection(); renderInspector(); }, 900); nextQuiz(); }
  else { q.tries++; toast(t('quiz.wrong', { name: L(DATA[key]?.name) }), 'bad'); }
}

// ---------- detail studio ----------
function openDetail(type, title) {
  if (!detail.open(type)) { toast(t('toast.noDetail')); return; }
  closePop();
  $('#detailTitle').textContent = title;
  const v = detail.view;
  // frame the parts as they sit when pulled apart, so nothing leaves the screen
  detail.setExplode(0.6); detail.root.updateMatrixWorld(true);
  const sph = new THREE.Box3().setFromObject(detail.root).getBoundingSphere(new THREE.Sphere());
  detail.setExplode(0);
  const dist = Math.max(v.dist, fitDistance(sph.radius, detail.camera) * 0.92);
  const target = v.target.clone().lerp(sph.center, 0.6);
  detail.camera.position.copy(target).addScaledVector(v.dir, dist);
  detailControls.target.copy(target);
  detailControls.minDistance = dist * 0.15; detailControls.maxDistance = dist * 3;
  detailControls.update();
  $('#explodeRange').value = 0;
  S.detailAnim = reduceMotion ? null : { t: 0 };
  if (reduceMotion) { detail.setExplode(0.5); $('#explodeRange').value = 0.5; }
  app.classList.add('in-detail');
  setView('detail');
}
function closeDetail() {
  detail.clear(); S.detailAnim = null;
  app.classList.remove('in-detail');
  setView(S.mode === 'lab' ? 'lab' : 'main');
}
$('#detailBack').addEventListener('click', closeDetail);
$('#explodeRange').addEventListener('input', (e) => { S.detailAnim = null; detail.setExplode(+e.target.value); invalidate(); });

// ---------- foundation lab ----------
const LAB_FIELDS = [
  ['P', 200, 3000, 50, 'kN', 'lab.load', ['isolated', 'pilecap'], 0],
  ['w', 40, 400, 10, 'kN/m', 'lab.wload', ['strip'], 0],
  ['q', 50, 400, 5, 'kN/m²', 'lab.q', ['isolated', 'strip'], 0],
  ['Qp', 300, 1500, 50, 'kN', 'lab.pileQ', ['pilecap'], 0],
  ['c', 0.25, 0.8, 0.05, 'm', 'lab.col', ['isolated', 'pilecap'], 2],
  ['B', 0.8, 5, 0.1, 'm', 'lab.B', ['isolated', 'strip'], 2],
  ['L', 0.8, 5, 0.1, 'm', 'lab.L', ['isolated'], 2],
  ['h', 0.3, 1.5, 0.05, 'm', 'lab.h', ['isolated', 'strip', 'pilecap'], 2],
  ['sp', 100, 300, 25, 'mm', 'lab.sp', ['isolated', 'strip'], 0],
];
function renderLab() {
  const p = lab.params, el = $('#labPanel');
  const types = ['isolated', 'strip', 'pilecap'];
  const fields = LAB_FIELDS.filter((f) => f[6].includes(p.type)).map(([k, mn, mx, st, u, lb, , d]) => `
    <label class="field"><span class="f-l">${esc(t(lb))}</span><output id="o-${k}">${num(p[k], d)} ${u}</output>
      <input type="range" id="f-${k}" data-k="${k}" min="${mn}" max="${mx}" step="${st}" value="${p[k]}"></label>`).join('');
  const soil = p.type !== 'pilecap' ? `<div class="field"><span class="f-l">${esc(t('lab.soil'))}</span><div class="chips">${SOILS.map((s) => `<button class="chip ${Math.abs(p.q - s.q) < 1 ? 'on' : ''}" data-soil="${s.q}">${esc(t(s.key))}<small>${s.q}</small></button>`).join('')}</div></div>` : '';
  const dia = p.type !== 'pilecap' ? `<div class="field"><span class="f-l">${esc(t('lab.dia'))}</span><div class="chips">${[12, 14, 16, 18, 20, 25].map((dd) => `<button class="chip ${p.dia === dd ? 'on' : ''}" data-dia="${dd}">Ø${dd}</button>`).join('')}</div></div>` : '';
  el.innerHTML = `
    <header class="lab-head"><h2>${esc(t('lab.title'))}</h2>
      <div class="seg" role="radiogroup" aria-label="${esc(t('lab.type'))}">${types.map((k) => `<button role="radio" aria-checked="${p.type === k}" data-type="${k}">${esc(t('lab.' + k))}</button>`).join('')}</div></header>
    <div class="lab-scroll">
      <div class="fields">${fields.slice(0, fields.indexOf('</label>') + 8)}${soil}${fields.slice(fields.indexOf('</label>') + 8)}${dia}</div>
      <section class="results" id="labResults"></section>
      <p class="note">${esc(t('lab.note'))}</p>
    </div>`;
  renderLabResults();
}
function pill(ok, txt) { return `<span class="pill ${ok ? 'ok' : 'bad'}">${icon(ok ? 'check' : 'alert')}${esc(txt ?? t(ok ? 'lab.ok' : 'lab.fail'))}</span>`; }
function renderLabResults() {
  const r = lab.result, p = lab.params, el = $('#labResults'); if (!el || !r) return;
  const row = (k, v, extra = '') => `<div class="rrow"><dt>${esc(k)}</dt><dd>${v}${extra}</dd></div>`;
  let h = `<h3>${esc(t('lab.results'))}</h3><dl>`;
  if (p.type === 'pilecap') {
    h += row(t('lab.piles'), `<b>${r.nPiles}</b>`);
    h += row(t('lab.pileLoad'), `${num(r.pileLoad, 0)} / ${num(p.Qp, 0)} kN `, pill(r.okBearing));
    h += row(t('lab.capH'), `${num(p.h, 2)} m `, pill(r.okPunch, r.okPunch ? t('lab.ok') : t('lab.thick')));
    h += `</dl><h3>${esc(t('lab.qty'))}</h3><dl>` + row(t('lab.conc'), `${num(r.conc, 2)} m³`) + row(t('lab.rebarW'), `≈ ${num(r.steel, 0)} kg`);
  } else {
    const strip = p.type === 'strip', u = strip ? ' m' : ' m²';
    h += row(t('lab.areaReq'), `${num(r.areaReq, 2)}${u}`);
    h += row(t('lab.areaProv'), `${num(r.areaProv, 2)}${u} `, pill(r.okBearing, r.okBearing ? t('lab.ok') : t('lab.suggest', { b: num(r.suggestB, 1) })));
    h += row(t('lab.press'), `${num(r.press, 0)} / ${num(p.q, 0)} kN/m²`);
    h += row(t(strip ? 'lab.shear' : 'lab.punch'), `${num(r.punch, 2)} / ${num(r.punchCap, 2)} MPa `, pill(r.okPunch, r.okPunch ? t('lab.ok') : t('lab.thick')));
    h += row(t('lab.steel') + (strip ? ' · ' + t('lab.perm') : ''), `${num(r.asProv, 0)} / ${num(r.asReq, 0)} mm² `, pill(r.okSteel, r.okSteel ? t('lab.ok') : t('lab.moreSteel')));
    h += `</dl><h3>${esc(t('lab.qty'))}</h3><dl>` + row(t('lab.conc') + (strip ? ' · ' + t('lab.perm') : ''), `${num(r.conc, 2)} m³`) + row(t('lab.rebarW') + (strip ? ' · ' + t('lab.perm') : ''), `≈ ${num(r.steel, 0)} kg`);
    if (!strip) h += row(t('lab.bars'), `${r.nBars} × Ø${p.dia}`);
  }
  el.innerHTML = h + '</dl>';
  $('#labPanel').classList.toggle('all-ok', !!r.ok);
}
let labQueued = false;
$('#labPanel').addEventListener('input', (e) => {
  const k = e.target.dataset.k; if (!k) return;
  const f = LAB_FIELDS.find((x) => x[0] === k);
  lab.params[k] = +e.target.value;
  $('#o-' + k).textContent = `${num(lab.params[k], f[7])} ${f[4]}`;
  if (k === 'q') $$('#labPanel [data-soil]').forEach((b) => b.classList.toggle('on', Math.abs(+b.dataset.soil - lab.params.q) < 1));
  if (!labQueued) { labQueued = true; requestAnimationFrame(() => { labQueued = false; lab.rebuild(); renderLabResults(); invalidate(); }); }
});
$('#labPanel').addEventListener('click', (e) => {
  const b = e.target.closest('[data-type],[data-soil],[data-dia]'); if (!b) return;
  if (b.dataset.type) {
    // each type starts from a sensible, passing design the student can then break
    const start = { isolated: { B: 2.6, L: 2.6, h: 0.6 }, strip: { B: 1.4, h: 0.45 }, pilecap: { h: 0.9 } };
    Object.assign(lab.params, { type: b.dataset.type }, start[b.dataset.type]);
    lab.rebuild(); frameLab(); renderLab();
  }
  else if (b.dataset.soil) { lab.params.q = +b.dataset.soil; lab.rebuild(); renderLab(); }
  else if (b.dataset.dia) { lab.params.dia = +b.dataset.dia; lab.rebuild(); renderLab(); }
  invalidate();
});
function labPose() {
  const v = lab.view, d = lab.dims, r = Math.hypot(Math.max(d.B, d.Lz) / 2 + 0.6, lab.params.type === 'pilecap' ? 4.2 : 1.9);
  const dist = Math.max(v.dist * (sidePx ? 1 : 0.8), fitDistance(r, lab.camera));
  return { target: v.target.clone(), pos: v.target.clone().addScaledVector(v.dir, dist) };
}
function frameLab(animate = true) {
  const p = labPose();
  if (animate) tweenTo(views.lab, p.target, p.pos, 0.7);
  else { lab.camera.position.copy(p.pos); labControls.target.copy(p.target); labControls.update(); }
}
function renderLabSteps() {
  const el = $('#labSteps'), s = lab.step;
  el.innerHTML = `
    <div class="ls-cap"><b>${esc(t('ls.' + s))}</b><span>${esc(t('ls.d' + s))}</span></div>
    <div class="ls-row">
      <button class="icon-btn" id="lsPrev" aria-label="${esc(t('build.prev'))}" ${s === 0 ? 'disabled' : ''}>${icon('prev', 'flip')}</button>
      <ol class="ls-dots">${Array.from({ length: lab.steps }, (_, i) => `<li><button class="${i === s ? 'on' : i < s ? 'done' : ''}" data-step="${i}" aria-label="${esc(t('ls.' + i))}">${i + 1}</button></li>`).join('')}</ol>
      <button class="icon-btn" id="lsNext" aria-label="${esc(t('build.next'))}" ${s === lab.steps - 1 ? 'disabled' : ''}>${icon('next', 'flip')}</button>
      <label class="check small"><input type="checkbox" id="lsArrows" ${lab.showArrows ? 'checked' : ''}><span class="box"></span><span>${esc(t('lab.arrows'))}</span></label>
    </div>`;
}
$('#labSteps').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.id === 'lsPrev') lab.setStep(lab.step - 1);
  else if (b.id === 'lsNext') lab.setStep(lab.step + 1);
  else if (b.dataset.step) lab.setStep(+b.dataset.step);
  renderLabSteps(); invalidate();
});
$('#labSteps').addEventListener('change', (e) => { if (e.target.id === 'lsArrows') { lab.showArrows = e.target.checked; lab.rebuild(); invalidate(); } });

// ---------- modes, views, language, theme ----------
function setView(v) {
  view = v;
  for (const [k, o] of Object.entries(views)) o.controls.enabled = k === v;
  for (const el of $('#labels').children) el.style.display = 'none';
  applySection(); setHover(null);
  invalidate(3);
}

function setMode(mode, push = true) {
  if (!['building', 'house', 'lab'].includes(mode)) mode = 'building';
  if (view === 'detail') { detail.clear(); app.classList.remove('in-detail'); }
  const prev = S.mode; S.mode = mode;
  app.dataset.mode = mode;
  for (const b of $$('.modes [data-mode]')) b.setAttribute('aria-selected', String(b.dataset.mode === mode));
  closePop(); if (S.quiz) stopQuiz(); if (S.build.on) stopBuild();
  if (mode === 'lab') {
    clearSelection();
    $('#labPanel').hidden = false; $('#labSteps').hidden = false;
    setView('lab'); renderLab(); renderLabSteps();
    if (!S.labFramed) { requestAnimationFrame(() => frameLab(false)); S.labFramed = true; }
  } else {
    $('#labPanel').hidden = true; $('#labSteps').hidden = true;
    setView('main');
    if (!model || model.kind !== mode) loadModel();
    void prev;
  }
  if (push && location.hash.slice(1) !== mode) location.hash = mode;
  updateCanvasLabel();
}
$$('.modes [data-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
addEventListener('hashchange', () => { const m = location.hash.slice(1); if (m && m !== S.mode) setMode(m, false); });

function updateCanvasLabel() {
  canvas.setAttribute('aria-label', `${t('mode.' + S.mode)}. ${t('hint.drag')}. ${t('hint.zoom')}. ${t('hint.tap')}.`);
}

function applyLang() {
  const l = lang();
  document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  for (const el of $$('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of $$('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
  for (const el of $$('[data-i18n-title]')) el.title = t(el.dataset.i18nTitle);
  renderInspector(); renderPop(); updateTimeline(); updateQuizBar(); renderSelTag();
  detail.refreshLabels(); lab.refreshLabels();
  if (S.mode === 'lab') { renderLab(); renderLabSteps(); }
  updateCanvasLabel(); resize(); invalidate();
}
$('#langBtn').addEventListener('click', () => { setLang(lang() === 'ar' ? 'en' : 'ar'); applyLang(); });

const darkMQ = matchMedia('(prefers-color-scheme: dark)');
function isDark() { const a = document.documentElement.dataset.theme; return a === 'dark' || (a !== 'light' && darkMQ.matches); }
function applyTheme() {
  const dark = isDark();
  floorMat.color.set(dark ? 0x0d1012 : 0xc4c9c3);
  hemi.intensity = dark ? 0.45 : 0.55;
  renderer.toneMappingExposure = dark ? 0.98 : 1.05;
  detail.setTheme(dark);
  invalidate(3);
}
$('#themeBtn').addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('haykal.theme', next); } catch { /* storage may be blocked */ }
});
try { const th = localStorage.getItem('haykal.theme'); if (th === 'dark' || th === 'light') document.documentElement.dataset.theme = th; } catch { /* ignore */ }
darkMQ.addEventListener('change', applyTheme);
new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

// ---------- resize and render loop ----------
// On wide screens the side panel covers part of the canvas, so the projection
// is shifted to centre the model in the free area instead of behind the card.
let sidePx = 0;
function resize() {
  const w = stageEl.clientWidth, h = stageEl.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false); labelRenderer.setSize(w, h);
  sidePx = w > 820 ? Math.min(384, w * 0.36) + 32 : 0;
  applyOffsets();
  if (S.pop) placePop();
  invalidate(3);
}
// On phones the bottom sheet or lab panel covers the lower part of the screen,
// so the projection shifts up by that amount (S.bOff eases toward it each frame).
function applyOffsets() {
  const w = stageEl.clientWidth, h = stageEl.clientHeight, rtl = document.documentElement.dir === 'rtl', b = sidePx ? 0 : S.bOff || 0;
  for (const v of Object.values(views)) {
    const cam = v.camera, fov0 = (cam.userData.fov0 ??= cam.fov);
    cam.fov = fov0;
    if (sidePx) { cam.aspect = (w + sidePx) / h; cam.setViewOffset(w + sidePx, h, rtl ? 0 : sidePx, 0, w, h); }
    else if (Math.abs(b) > 1) {
      // the sub-view crops the full image, so widen the full fov to keep the same zoom
      const a = Math.abs(b);
      cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(fov0) / 2) * (h + a) / h));
      cam.aspect = w / (h + a); cam.setViewOffset(w, h + a, 0, b > 0 ? a : 0, w, h);
    } else { cam.aspect = w / h; cam.clearViewOffset(); }
    cam.updateProjectionMatrix();
  }
}
// what covers the top and bottom of the canvas on a phone
function covers() {
  if (sidePx) return { top: 0, bottom: 0 };
  const h = stageEl.clientHeight; let top = h;
  const els = view === 'lab' ? [$('#labPanel'), $('#labSteps')] : view === 'main' ? [$('#dock'), S.sel ? $('#inspector') : null] : [$('.detailctl')];
  for (const el of els) { if (!el || el.hidden) continue; const r = el.getBoundingClientRect(); if (r.height > 0) top = Math.min(top, r.top); }
  const head = view === 'detail' ? $('.detailbar') : $('.top');
  const hb = head ? head.getBoundingClientRect().bottom : 0;
  return { top: Math.max(0, hb), bottom: Math.max(0, h - top) };
}
// signed shift that centres the view between the header and the bottom panels
function bottomCover() { const c = covers(); return (c.bottom - c.top) * 0.9; }
// distance that fits a sphere of radius r into the free part of the view
function fitDistance(r, cam) {
  // the canvas height always spans fov0; the free strip gets its share of that angle
  const c = covers(), W = stageEl.clientWidth || 1, H = stageEl.clientHeight || 1;
  const hFree = Math.max(120, H - c.top - c.bottom), wFree = Math.max(120, W - sidePx);
  const tv = Math.tan(THREE.MathUtils.degToRad(cam.userData.fov0 ?? cam.fov) / 2);
  const vh = Math.atan(tv * hFree / H), hh = Math.atan(tv * wFree / H);
  return r / Math.sin(Math.min(vh, hh));
}
new ResizeObserver(resize).observe(stageEl);

let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const v = views[view];
  let anim = false;
  if (S.tween) {
    const tw = S.tween; tw.t += dt / tw.dur; const k = easeIO(clamp(tw.t, 0, 1));
    tw.v.controls.target.lerpVectors(tw.t0, tw.t1, k); tw.v.camera.position.lerpVectors(tw.p0, tw.p1, k);
    if (tw.t >= 1) S.tween = null; anim = true;
  }
  if (!sidePx) {
    const bt = bottomCover();
    if (Math.abs(bt - (S.bOff || 0)) > 0.5) { S.bOff = (S.bOff || 0) + (bt - (S.bOff || 0)) * Math.min(1, dt * 8); applyOffsets(); anim = true; }
  }
  const moving = v.controls.update();
  if (view === 'main' && model) {
    const d = camera.position.distanceTo(controls.target);
    const zg = clamp((7.5 - d) / (7.5 - 2.8), 0, 1);
    S.zoomGhost = zg;
    const target = Math.max(S.xray ? 1 : 0, zg, S.loads ? 0.55 : 0);
    if (Math.abs(target - S.ghost) > 0.002) {
      S.ghost += (target - S.ghost) * Math.min(1, dt * 7);
      if (Math.abs(target - S.ghost) < 0.004) S.ghost = target;
      setGhost(M, S.ghost, S.section.mode !== 'off' ? THREE.DoubleSide : THREE.FrontSide);
      applyRebar(); anim = true;
    }
    $('#zoomNote').classList.toggle('show', zg > 0.35 && !S.xray && !S.build.on);
    if (S.build.on && S.build.playing) {
      const total = model.stages.length, goal = S.build.goal ?? total;
      S.build.t = Math.min(goal, S.build.t + dt * 0.55);
      if (S.build.t >= goal) { S.build.playing = false; S.build.goal = null; }
      applyModel(); updateTimeline(); anim = true;
    }
    // camera follows the work: close on the foundations first, then pulls back
    if (S.build.on && S.build.follow && !S.tween) {
      const total = model.stages.length, k = clamp((S.build.t - 3) / Math.max(1, total - 8), 0, 1), e = easeIO(k);
      const b = model.bounds, sph = b.getBoundingSphere(new THREE.Sphere());
      const full = fitDistance(sph.radius, camera) * 0.9;
      const tgt = new THREE.Vector3(sph.center.x, THREE.MathUtils.lerp(b.min.y + 1.2, sph.center.y - (b.max.y - b.min.y) * 0.06, e), sph.center.z);
      const dir = model.view.pos.clone().sub(model.view.target).normalize();
      const pos = tgt.clone().addScaledVector(dir, THREE.MathUtils.lerp(full * 0.62, full, e));
      const a = Math.min(1, dt * 2.5);
      controls.target.lerp(tgt, a); camera.position.lerp(pos, a);
      if (controls.target.distanceTo(tgt) > 0.01) anim = true;
    }
    if (loadPath.group.visible) { loadPath.update(dt); anim = true; }
    if (hoverReq && !down) { const [x, y] = hoverReq; hoverReq = null; setHover(pickAt(x, y, true)); }
  } else if (view === 'detail') {
    if (S.detailAnim) {
      S.detailAnim.t += dt / 1.5; const e = easeIO(clamp(S.detailAnim.t, 0, 1)) * 0.6;
      detail.setExplode(e); $('#explodeRange').value = e;
      if (S.detailAnim.t >= 1) S.detailAnim = null; anim = true;
    }
    if (detail.update(dt)) anim = true;
  } else if (view === 'lab') {
    if (lab.update(dt)) anim = true;
  }
  if (anim || moving || needs > 0) {
    renderer.render(v.scene, v.camera);
    labelRenderer.render(v.scene, v.camera);
    needs = Math.max(0, needs - 1);
  }
}

// ---------- install as an app ----------
// Chrome, Edge and Android fire beforeinstallprompt; iPhone and iPad need the
// Share menu, so the button explains that instead. Inside the shared claude.ai
// page (an iframe) and in the double-click file there is nothing to install.
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const topLevel = (() => { try { return window.top === window.self; } catch { return false; } })();
const installable = topLevel && /^https?:$/.test(location.protocol) && !standalone;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let installEvt = null;
if (installable && 'serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => { /* no offline cache */ });
if (installable && isIOS) $('#installBtn').hidden = false;
addEventListener('beforeinstallprompt', (e) => { if (!installable) return; e.preventDefault(); installEvt = e; $('#installBtn').hidden = false; });
addEventListener('appinstalled', () => { installEvt = null; $('#installBtn').hidden = true; toast(t('install.done'), 'ok'); });
$('#installBtn').addEventListener('click', async () => {
  if (installEvt) { installEvt.prompt(); try { await installEvt.userChoice; } catch { /* dismissed */ } installEvt = null; $('#installBtn').hidden = !isIOS; }
  else toast(t('install.ios'));
});

// ---------- start ----------
function start() {
  applyTheme(); resize();
  const m = location.hash.slice(1);
  S.mode = ['building', 'house', 'lab'].includes(m) ? m : 'building';
  if (S.mode === 'lab') { S.mode = 'building'; loadModel(); setMode('lab', false); }
  else setMode(S.mode, false);
  applyLang(); syncDock(); resize();
  requestAnimationFrame((n) => { last = n; frame(n); });
  setTimeout(() => $('#loader').classList.add('done'), 120);
}
start();
