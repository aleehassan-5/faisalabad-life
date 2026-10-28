import * as THREE from 'three';

// Arcade car model: heading-based steering with lateral grip and drift via handbrake.
export class Car {
  constructor(scene) {
    this.pos = new THREE.Vector3(0, 0.5, 0);
    this.heading = 0;           // radians, 0 = +Z
    this.vel = new THREE.Vector3();
    this.speed = 0;             // forward speed m/s
    this.steer = 0;
    this.maxSpeed = 45; this.accel = 14; this.brake = 28;

    this.mesh = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.6, 4.4),
      new THREE.MeshStandardMaterial({ color: 0xf2f2f2, metalness: 0.5, roughness: 0.35 }));
    body.position.y = 0.55; body.castShadow = true;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x1a2230, metalness: 0.6, roughness: 0.2 }));
    cabin.position.set(0, 1.1, -0.2); cabin.castShadow = true;
    this.mesh.add(body, cabin);
    this.wheels = [];
    const wg = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 16); wg.rotateZ(Math.PI / 2);
    const wm = new THREE.MeshStandardMaterial({ color: 0x111111 });
    for (const [x, z] of [[-0.95, 1.4], [0.95, 1.4], [-0.95, -1.4], [0.95, -1.4]]) {
      const w = new THREE.Mesh(wg, wm); w.position.set(x, 0.38, z);
      this.mesh.add(w); this.wheels.push(w);
    }
    scene.add(this.mesh);
  }

  update(dt, k) {
    const gas = (k.KeyW || k.ArrowUp) ? 1 : 0;
    const brk = (k.KeyS || k.ArrowDown) ? 1 : 0;
    const hb = k.Space;
    const left = (k.KeyA || k.ArrowLeft) ? 1 : 0, right = (k.KeyD || k.ArrowRight) ? 1 : 0;

    if (gas) this.speed += this.accel * dt * (1 - Math.max(0, this.speed) / this.maxSpeed);
    if (brk) this.speed -= (this.speed > 0 ? this.brake : this.accel * 0.6) * dt;
    if (!gas && !brk) this.speed -= Math.sign(this.speed) * Math.min(Math.abs(this.speed), 4 * dt);
    if (hb) this.speed -= Math.sign(this.speed) * Math.min(Math.abs(this.speed), 18 * dt);
    this.speed = THREE.MathUtils.clamp(this.speed, -12, this.maxSpeed);

    // steering eases in/out, reduced at high speed
    const target = (left - right) * 0.6 / (1 + Math.abs(this.speed) / 18);
    this.steer += (target - this.steer) * Math.min(1, 8 * dt);
    const turn = this.steer * (this.speed / 4.4) * (hb ? 1.6 : 1);
    this.heading += turn * dt * 4.4 / 2.6;

    // velocity follows heading with grip (lower grip while handbraking = drift)
    const fwd = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading));
    const desired = fwd.multiplyScalar(this.speed);
    const grip = hb ? 1.2 : 8;
    this.vel.lerp(desired, Math.min(1, grip * dt));
    this.pos.addScaledVector(this.vel, dt);
    this.speed = this.vel.dot(new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading)));

    this.mesh.position.copy(this.pos); this.mesh.position.y = 0;
    this.mesh.rotation.y = this.heading;
    // body roll
    const lat = this.vel.dot(new THREE.Vector3(Math.cos(this.heading), 0, -Math.sin(this.heading)));
    this.mesh.rotation.z = THREE.MathUtils.clamp(-lat * 0.01, -0.06, 0.06);
    for (const w of this.wheels) w.rotation.x += this.speed * dt / 0.38;
  }
}
