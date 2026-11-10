// Animated load path: arrows flow slab → beam → column → footing → soil.
// Drawn on top of everything (no depth test) so the path reads through walls.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const UP = new THREE.Vector3(0, 1, 0);

export function arrowGeometry() {
  const shaft = new THREE.CylinderGeometry(0.035, 0.035, 0.26, 8); shaft.translate(0, 0.13, 0);
  const head = new THREE.ConeGeometry(0.095, 0.22, 12); head.translate(0, 0.37, 0);
  const g = mergeGeometries([shaft, head]);
  g.translate(0, -0.24, 0);
  return g;
}

export class LoadPath {
  constructor() {
    this.group = new THREE.Group();
    this.group.renderOrder = 10;
    this.mat = new THREE.MeshBasicMaterial({ color: 0xffb43d, transparent: true, opacity: 0.95, depthTest: false, depthWrite: false });
    this.geo = arrowGeometry();
    this.paths = []; this.mesh = null; this.time = 0;
  }

  addPath(pts, scale = 1, spacing = 0.9, speed = 1.1) {
    const v = pts.map((p) => new THREE.Vector3(...p));
    const seg = []; let len = 0;
    for (let i = 0; i < v.length - 1; i++) { const l = v[i].distanceTo(v[i + 1]); seg.push(l); len += l; }
    if (len < 0.05) return;
    this.paths.push({ v, seg, len, scale, spacing, speed, count: Math.max(1, Math.floor(len / spacing)) });
  }

  build(model) {
    this.dispose();
    this.paths = [];
    const meta = model.meta;
    // columns: merge storeys by grid position, then run from the top to the foundation
    const cols = new Map();
    for (const c of meta.columns) {
      const k = c.x.toFixed(2) + ',' + c.z.toFixed(2);
      const e = cols.get(k) || { x: c.x, z: c.z, top: -Infinity };
      e.top = Math.max(e.top, c.y1); cols.set(k, e);
    }
    const footAt = (x, z) => meta.footings.find((f) => Math.abs(f.x - x) < 0.05 && Math.abs(f.z - z) < 0.05);
    for (const c of cols.values()) {
      const f = footAt(c.x, c.z);
      const bottom = f ? f.y + 0.15 : -1.2;
      this.addPath([[c.x, c.top, c.z], [c.x, bottom, c.z]], 1.25, 0.85, 1.3);
    }
    // slabs → beams → columns, for every bay at every level
    for (const b of meta.bays) {
      const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, y = b.y + 0.25;
      const edges = [
        [[cx, y, b.z0], [[b.x0, y, b.z0], [b.x1, y, b.z0]]], [[cx, y, b.z1], [[b.x0, y, b.z1], [b.x1, y, b.z1]]],
        [[b.x0, y, cz], [[b.x0, y, b.z0], [b.x0, y, b.z1]]], [[b.x1, y, cz], [[b.x1, y, b.z0], [b.x1, y, b.z1]]],
      ];
      for (const [mid, ends] of edges) {
        this.addPath([[cx, y, cz], mid], 0.6, 0.7, 0.8);
        for (const e of ends) this.addPath([mid, e], 0.6, 0.7, 0.8);
      }
    }
    // piles: column → cap → each pile down to its tip
    for (const p of meta.piles) this.addPath([[p.x, p.yTop + 0.6, p.z], [p.x, p.yBot + 0.3, p.z]], 1.0, 1.1, 1.3);
    // footing base → spreading into the soil
    for (const f of meta.footings) {
      if (f.cap) continue;
      const r = Math.min(f.B, f.L) * 0.45;
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2, dx = Math.cos(a), dz = Math.sin(a);
        this.addPath([[f.x + dx * 0.25, f.y, f.z + dz * 0.25], [f.x + dx * (r + 0.6), f.y - 1.1, f.z + dz * (r + 0.6)]], 0.8, 0.55, 0.7);
      }
    }
    const total = this.paths.reduce((a, p) => a + p.count, 0);
    this.mesh = new THREE.InstancedMesh(this.geo, this.mat, total);
    this.mesh.frustumCulled = false; this.mesh.renderOrder = 10;
    this.group.add(this.mesh);
    this.update(0);
  }

  update(dt) {
    if (!this.mesh) return;
    this.time += dt;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), d = new THREE.Vector3();
    let i = 0;
    for (const path of this.paths) {
      const off = (this.time * path.speed) % path.spacing;
      for (let k = 0; k < path.count; k++) {
        let dist = off + k * path.spacing;
        if (dist > path.len) dist -= path.count * path.spacing;
        if (dist < 0) dist = 0;
        let acc = 0, si = 0;
        while (si < path.seg.length - 1 && acc + path.seg[si] < dist) { acc += path.seg[si]; si++; }
        const t = path.seg[si] ? (dist - acc) / path.seg[si] : 0;
        p.lerpVectors(path.v[si], path.v[si + 1], Math.min(1, t));
        d.subVectors(path.v[si + 1], path.v[si]).normalize();
        q.setFromUnitVectors(UP, d);
        const fade = Math.min(1, dist / 0.35, (path.len - dist) / 0.35);
        const sc = path.scale * Math.max(0.05, fade);
        s.set(sc, sc, sc);
        m.compose(p, q, s); this.mesh.setMatrixAt(i++, m);
      }
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    if (this.mesh) { this.group.remove(this.mesh); this.mesh.dispose(); this.mesh = null; }
  }
}
