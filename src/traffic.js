import * as THREE from 'three';

// Left-side driving. Lane offsets: +Z travel -> x=+3.5, -Z -> x=-3.5, +X travel -> z=-3.5, -X -> z=+3.5
const COLORS = [0xffffff, 0xc0c0c0, 0x222222, 0x8b1a1a, 0x1f3b7a, 0xd8d2c4];
const HALF = 450;

export class Traffic {
  constructor(scene, count = 18) {
    this.cars = [];
    const bg = new THREE.BoxGeometry(1.8, 0.6, 4.2), cg = new THREE.BoxGeometry(1.5, 0.5, 2);
    const cm = new THREE.MeshStandardMaterial({ color: 0x1a2230 });
    for (let i = 0; i < count; i++) {
      const axis = i % 2;                 // 0 = along Z road, 1 = along X road
      const dir = (i >> 1) % 2 ? 1 : -1;
      const lane = axis === 0 ? (dir > 0 ? 3.5 : -3.5) : (dir > 0 ? -3.5 : 3.5);
      const m = new THREE.Group();
      const b = new THREE.Mesh(bg, new THREE.MeshStandardMaterial({ color: COLORS[i % COLORS.length], metalness: .4, roughness: .45 }));
      b.position.y = 0.55; b.castShadow = true;
      const c = new THREE.Mesh(cg, cm); c.position.set(0, 1.05, -0.2);
      m.add(b, c); scene.add(m);
      const along = (Math.random() * 2 - 1) * HALF;
      const maxV = 9 + Math.random() * 6;
      this.cars.push({ m, axis, dir, lane, along, v: maxV, maxV });
    }
  }

  worldPos(c) {
    return c.axis === 0 ? new THREE.Vector3(c.lane, 0, c.along) : new THREE.Vector3(c.along, 0, c.lane);
  }

  update(dt, player) {
    for (const c of this.cars) {
      // look ahead for car in same lane (traffic or player)
      let gap = Infinity;
      const p = this.worldPos(c);
      const check = (q) => {
        const d = c.axis === 0 ? (q.z - p.z) * c.dir : (q.x - p.x) * c.dir;
        const off = c.axis === 0 ? Math.abs(q.x - p.x) : Math.abs(q.z - p.z);
        if (d > 0 && off < 2.2 && d < gap) gap = d;
      };
      for (const o of this.cars) if (o !== c && o.axis === c.axis && o.lane === c.lane) check(this.worldPos(o));
      check(player.pos);

      const want = gap < 8 ? 0 : gap < 18 ? c.maxV * 0.4 : c.maxV;
      c.v += (want - c.v) * Math.min(1, (want < c.v ? 4 : 1) * dt);
      c.along += c.dir * c.v * dt;
      if (c.along > HALF) c.along = -HALF; else if (c.along < -HALF) c.along = HALF;

      const w = this.worldPos(c);
      c.m.position.copy(w);
      c.m.rotation.y = c.axis === 0 ? (c.dir > 0 ? 0 : Math.PI) : (c.dir > 0 ? Math.PI / 2 : -Math.PI / 2);

      // simple collision with player: bleed speed and shove apart
      const dx = player.pos.x - w.x, dz = player.pos.z - w.z, d2 = dx * dx + dz * dz;
      if (d2 < 9) {
        const d = Math.sqrt(d2) || 0.01;
        player.pos.x += dx / d * (3 - d) * 0.5; player.pos.z += dz / d * (3 - d) * 0.5;
        player.vel.multiplyScalar(0.9);
      }
    }
  }
}
