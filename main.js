const canvas = document.getElementById("game");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// ===== ROAD =====
const road = new THREE.Mesh(
  new THREE.BoxGeometry(5, 0.1, 120),
  new THREE.MeshStandardMaterial({ color: 0x333333 })
);
road.position.z = -60;
scene.add(road);

// ===== WATER =====
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 200),
  new THREE.MeshBasicMaterial({
    color: 0x1e90ff,
    transparent: true,
    opacity: 0.7
  })
);
water.rotation.x = -Math.PI / 2;
water.position.y = -0.2;
water.position.z = -90;
scene.add(water);

// ===== BRIDGE =====
const bridge = new THREE.Mesh(
  new THREE.BoxGeometry(5, 0.15, 30),
  new THREE.MeshStandardMaterial({ color: 0x555555 })
);
bridge.position.set(0, 0.3, -70);
scene.add(bridge);

// ===== SLOPE UP =====
const upRoad = new THREE.Mesh(
  new THREE.BoxGeometry(5, 0.15, 30),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
upRoad.position.set(0, 1.5, -110);
upRoad.rotation.x = -0.25;
scene.add(upRoad);

// ===== SLOPE DOWN =====
const downRoad = new THREE.Mesh(
  new THREE.BoxGeometry(5, 0.15, 30),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
downRoad.position.set(0, 0.2, -150);
downRoad.rotation.x = 0.25;
scene.add(downRoad);

// ===== CAR =====
const car = new THREE.Mesh(
  new THREE.BoxGeometry(1, 0.5, 2),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
car.position.y = 0.5;
scene.add(car);

// Camera position
camera.position.set(0, 3, 6);
camera.lookAt(car.position);

// ===== TOUCH CONTROL =====
let targetX = 0;

window.addEventListener("touchmove", e => {
  targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 6;
});

// ===== ANIMATION LOOP =====
function animate() {
  requestAnimationFrame(animate);

  // Left / Right movement
  car.position.x += (targetX - car.position.x) * 0.1;

  // Forward movement
  car.position.z -= 0.25;

  // Slope height logic
  if (car.position.z < -100 && car.position.z > -130) {
    car.position.y = 0.5 + (-car.position.z - 100) * 0.03;
  } else if (car.position.z <= -130 && car.position.z > -160) {
    car.position.y = 1.4 - (-car.position.z - 130) * 0.03;
  } else {
    car.position.y = 0.5;
  }

  // Endless loop
  if (car.position.z < -180) {
    car.position.z = 0;
  }

  // Camera follow
  camera.position.z = car.position.z + 6;
  camera.position.x += (car.position.x - camera.position.x) * 0.05;
  camera.lookAt(car.position);

  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
