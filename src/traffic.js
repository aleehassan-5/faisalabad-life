import * as THREE from 'three';

// Left-side driving. Lane centres: +Z travel x=+3.5, -Z x=-3.5, +X travel z=-3.5, -X z=+3.5
const HALF = 450, STOP = 11;
const PAINT = [0xffffff, 0xc0c0c0, 0x222222, 0x8b1a1a, 0x1f3b7a, 0xd8d2c4, 0x5a6b5a];
const TRUCK_PAINT = [0xd9381e, 0x1e7fd9, 0xe8b923, 0x2fa84f, 0xd9531e];
const rnd = a => a[Math.floor(Math.random() * a.length)];
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, metalness: .3, roughness: .5, ...o });
const box = (w, h, l, m, y, z = 0, x = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), m); b.position.set(x, y, z); b.castShadow = true; return b; };
const glass = mat(0x1a2230, { metalness: .6, roughness: .2 });
const headM = new THREE.MeshBasicMaterial({ color: 0xfff4c8 }), tailM = new THREE.MeshBasicMaterial({ color: 0xff2a1a });
const lights = (g, w, y, l) => { for (const s of [-1, 1]) { g.add(box(.25, .18, .08, headM, y, l / 2, s * w * .35)); g.add(box(.25, .18, .08, tailM, y, -l / 2, s * w * .35)); } };

const TYPES = {
  car: { w: 1.8, l: 4.2, v: [10, 16], make() { const g = new THREE.Group(), m = mat(rnd(PAINT), { metalness: .5 });
    g.add(box(1.8, .6, 4.2, m, .55), box(1.5, .5, 2, glass, 1.05, -.2)); lights(g, 1.8, .6, 4.2); return g; } },
  rickshaw: { w: 1.4, l: 2.7, v: [6, 9], make() { const g = new THREE.Group(), c = Math.random() < .7 ? 0x1f8a3a : 0xe8c21e;
    g.add(box(1.4, .7, 2.6, mat(c), .6), box(1.3, .9, 1.4, mat(0x151515), 1.4, -.3), box(1.45, .08, 1.6, mat(c), 1.9, -.3)); lights(g, 1.4, .6, 2.6); return g; } },
  bike: { w: .6, l: 2, v: [12, 20], make() { const g = new THREE.Group();
    g.add(box(.35, .5, 1.8, mat(rnd([0x111111, 0xaa1111, 0x1144aa])), .6), box(.45, .7, .4, mat(rnd([0x2c3e50, 0x7f6a4a, 0x444444])), 1.2, -.1)); lights(g, .6, .7, 2); return g; } },
  bus: { w: 2.5, l: 10, v: [7, 11], make() { const g = new THREE.Group(), c = rnd([0xe8e8e8, 0x2f6fd0, 0xd8a31e]);
    g.add(box(2.5, 2.6, 10, mat(c), 1.6), box(2.55, .8, 9, glass, 2.1)); lights(g, 2.5, .8, 10); return g; } },
  truck: { w: 2.5, l: 8.5, v: [6, 10], make() { const g = new THREE.Group(), c = rnd(TRUCK_PAINT);
    g.add(box(2.4, 2.2, 2.2, mat(c), 1.5, 3.1), box(2.5, 2.6, 5.8, mat(rnd(TRUCK_PAINT)), 1.9, -1.2), box(2.2, .3, 8.4, mat(0x222222), .6)); lights(g, 2.4, .8, 8.5); return g; } },
};
const MIX = ['car','car','car','car','car','car','rickshaw','rickshaw','rickshaw','bike','bike','bike','bus','truck','truck'];

export class Traffic {
  constructor(scene, count = 70) {
    this.cars = []; this.t = 0;
    for (let i = 0; i < count; i++) {
      const type = MIX[i % MIX.length], T = TYPES[type];
      const axis = i % 2, dir = (i >> 1) % 2 ? 1 : -1;
      const base = axis === 0 ? (dir > 0 ? 3.5 : -3.5) : (dir > 0 ? -3.5 : 3.5);
      const sgn = Math.sign(base);
      const lane = type === 'bike' ? base + sgn * 1.9 : base;      // bikes hug the kerb so cars can pass
      const m = T.make(); scene.add(m);
      const maxV = T.v[0] + Math.random() * (T.v[1] - T.v[0]);
      this.cars.push({ m, type, axis, dir, lane, along: (Math.random() * 2 - 1) * HALF, v: maxV, maxV, w: T.w, l: T.l });
    }
    // traffic signals at the origin junction
    this.heads = [];
    const poleM = mat(0x333333), hm = c => new THREE.MeshBasicMaterial({ color: c });
    for (const [x, z, ax] of [[9, -9, 0], [-9, 9, 0], [9, 9, 1], [-9, -9, 1]]) {
      const pole = box(.2, 5, .2, poleM, 2.5, z, x), head = new THREE.Mesh(new THREE.SphereGeometry(.45, 8, 6), hm(0x00ff00));
      head.position.set(x, 5.3, z); scene.add(pole, head); this.heads.push({ head, ax });
    }
  }

  // returns 'g' | 'y' | 'r' for axis
  signal(ax) {
    const c = this.t % 32, a = ax === 0 ? c : (c + 16) % 32;
    return a < 12 ? 'g' : a < 14 ? 'y' : 'r';
  }

  worldPos(c) { return c.axis === 0 ? new THREE.Vector3(c.lane, 0, c.along) : new THREE.Vector3(c.along, 0, c.lane); }

  update(dt, player) {
    this.t += dt;
    for (const h of this.heads) h.head.material.color.set({ g: 0x00ff00, y: 0xffc800, r: 0xff2200 }[this.signal(h.ax)]);

    for (const c of this.cars) {
      const p = this.worldPos(c); let gap = Infinity;
      const look = (q, ow, ol) => {
        const d = (c.axis === 0 ? q.z - p.z : q.x - p.x) * c.dir;
        const off = c.axis === 0 ? Math.abs(q.x - p.x) : Math.abs(q.z - p.z);
        if (d > 0 && off < (c.w + ow) / 2 + .3) gap = Math.min(gap, d - (c.l + ol) / 2);
      };
      for (const o of this.cars) if (o !== c && o.axis === c.axis && o.dir === c.dir) look(this.worldPos(o), o.w, o.l);
      look(player.pos, 1.9, 4.4);

      const dc = -c.along * c.dir;                 // distance to junction centre along travel
      if (dc > STOP && dc < 45 && this.signal(c.axis) !== 'g') gap = Math.min(gap, dc - STOP + 5);

      const want = gap < 5 ? 0 : gap < 18 ? c.maxV * (gap - 5) / 13 : c.maxV;
      c.v += (want - c.v) * Math.min(1, (want < c.v ? 4 : 1) * dt);
      c.along += c.dir * c.v * dt;
      if (c.along > HALF) c.along = -HALF; else if (c.along < -HALF) c.along = HALF;

      const w = this.worldPos(c);
      c.m.position.copy(w);
      c.m.rotation.y = c.axis === 0 ? (c.dir > 0 ? 0 : Math.PI) : (c.dir > 0 ? Math.PI / 2 : -Math.PI / 2);

      // player collision (oriented box, resolve on shallowest axis)
      const ea = c.axis === 0 ? player.pos.z - w.z : player.pos.x - w.x, la = c.axis === 0 ? player.pos.x - w.x : player.pos.z - w.z;
      const pa = c.l / 2 + 2.2 - Math.abs(ea), pl = c.w / 2 + 1 - Math.abs(la);
      if (pa > 0 && pl > 0) {
        const s = pa < pl ? ['a', Math.sign(ea) * pa] : ['l', Math.sign(la) * pl];
        const dx = (c.axis === 0) === (s[0] === 'l') ? s[1] : 0, dz = (c.axis === 0) === (s[0] === 'a') ? s[1] : 0;
        player.pos.x += dx; player.pos.z += dz;
        player.vel.multiplyScalar(0.85); c.v *= 0.7;
      }
    }
  }
}
