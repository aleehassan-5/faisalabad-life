import * as THREE from 'three';
import { Car } from './car.js';
import { buildWorld } from './world.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd9c9a8); // hazy Punjab sky
scene.fog = new THREE.Fog(0xd9c9a8, 80, 450);
const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 800);

buildWorld(scene);
const car = new Car(scene);

const keys = {};
let camMode = 0;
addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'KeyC') camMode = (camMode + 1) % 2; });
addEventListener('keyup', e => keys[e.code] = false);
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const spd = document.getElementById('spd');
const clock = new THREE.Clock();
const camPos = new THREE.Vector3();

function loop() {
  const dt = Math.min(clock.getDelta(), 0.05);
  car.update(dt, keys);

  const fwd = new THREE.Vector3(Math.sin(car.heading), 0, Math.cos(car.heading));
  const target = camMode === 0
    ? car.pos.clone().addScaledVector(fwd, -9).add(new THREE.Vector3(0, 4, 0))
    : car.pos.clone().addScaledVector(fwd, 0.2).add(new THREE.Vector3(0, 1.3, 0));
  camPos.lerp(target, camMode === 0 ? 1 - Math.pow(0.001, dt) : 1);
  camera.position.copy(camPos);
  camera.lookAt(car.pos.clone().addScaledVector(fwd, camMode === 0 ? 4 : 20).add(new THREE.Vector3(0, 1.2, 0)));

  spd.textContent = Math.round(Math.abs(car.speed) * 3.6);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();
