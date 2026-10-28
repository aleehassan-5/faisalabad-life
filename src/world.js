import * as THREE from 'three';

// Chunk 1: placeholder test world (flat ground, crossing roads, lane markings, trees).
// Real Faisalabad geometry will replace this in later chunks.
export function buildWorld(scene) {
  scene.add(new THREE.HemisphereLight(0xfff1d0, 0x6b6050, 0.9));
  const sun = new THREE.DirectionalLight(0xffe2b0, 2.2);
  sun.position.set(80, 120, 40); sun.castShadow = true;
  sun.shadow.camera.left = -80; sun.shadow.camera.right = 80;
  sun.shadow.camera.top = 80; sun.shadow.camera.bottom = -80;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshStandardMaterial({ color: 0x8a7e63, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  const asphalt = new THREE.MeshStandardMaterial({ color: 0x2b2b2e, roughness: 0.9 });
  const line = new THREE.MeshBasicMaterial({ color: 0xe8e8e8 });
  for (const [w, l, rot] of [[14, 1200, 0], [14, 1200, Math.PI / 2]]) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(w, l), asphalt);
    r.rotation.set(-Math.PI / 2, 0, rot); r.position.y = 0.02; r.receiveShadow = true; scene.add(r);
    for (let i = -l / 2 + 5; i < l / 2; i += 10) {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 4), line);
      d.rotation.set(-Math.PI / 2, 0, rot);
      d.position.set(rot ? i : 0, 0.03, rot ? 0 : i); scene.add(d);
    }
  }
  const trunk = new THREE.CylinderGeometry(0.2, 0.3, 3), crown = new THREE.SphereGeometry(1.8, 8, 6);
  const tm = new THREE.MeshStandardMaterial({ color: 0x5a4028 }), cm = new THREE.MeshStandardMaterial({ color: 0x3f6b2e });
  for (let i = -300; i <= 300; i += 15) for (const s of [-10, 10]) for (const axis of [0, 1]) {
    if (Math.abs(i) < 12) continue;
    const g = new THREE.Group();
    const t = new THREE.Mesh(trunk, tm); t.position.y = 1.5;
    const c = new THREE.Mesh(crown, cm); c.position.y = 4;
    g.add(t, c); g.position.set(axis ? i : s, 0, axis ? s : i); scene.add(g);
  }
}
