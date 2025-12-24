const canvas = document.getElementById("game");

// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// ===== CAMERA =====
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// ===== RENDERER =====
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// ===== LIGHT =====
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// ===== ROAD =====
const road = new THREE.Mesh(
  new THREE.BoxGeometry(5, 0.1, 140),
  new THREE.MeshStandardMaterial({ color: 0x333333 })
);
road.position.z = -70;
scene.add(road);

// ===== WATER =====
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 200),
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
bridge.position.set(0, 0.3, -60);
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
car.position.set(0, 0.5, 0);
scene.add(car);

// ===== CAMERA POSITION =====
camera.position.set(0, 3, 6);
camera.lookAt(car.position);

// ===== CONTROL VARIABLES =====
let targetX = 0;
let speed = 0;
let isTouching = false;

// ===== TOUCH CONTROLS =====
window.addEventListener("touchstart", () => {
  isTouching = true;
  speed = 0.25;
});

window.addEventListener("touchend", () => {
  isTouching = false;
  speed = 0;
});

window.addEventListener("touchmove", (e) => {
  targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 4;
});

// ===== ANIMATION LOOP =====
function animate() {
  requestAnimationFrame(animate);

  // Left / Right smooth movement
  car.position.x += (targetX - car.position.x) * 0.1;

  // Road boundary (water me jane se roke)
  if (car.position.x > 2) car.position.x = 2;
  if (car.position.x < -2) car.position.x = -2;

  // Forward movement ONLY on touch
  if (isTouching) {
    car.position.z -= speed;
  }

  // Slope height logic
  if (car.position.z < -100 && car.position.z > -130) {
    car.position.y = 0.5 + (-car.position.z - 100) * 0.03;
  } else if (car.position.z <= -130 && car.position.z > -160) {
    car.position.y = 1.4 - (-car.position.z - 130) * 0.03;
  } else {
    car.position.y = 0.5;
  }

  // Endless road loop
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

// ===== RESIZE =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
