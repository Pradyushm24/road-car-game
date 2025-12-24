const canvas = document.getElementById("game");

/* ================= SCENE ================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

/* ================= CAMERA ================= */
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

/* ================= RENDERER ================= */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

/* ================= LIGHT ================= */
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

/* ================= ROAD (ENDLESS SEGMENTS) ================= */
const roadSegments = [];
const ROAD_WIDTH = 5;
const ROAD_LENGTH = 120;
const ROAD_COUNT = 3;

for (let i = 0; i < ROAD_COUNT; i++) {
  const road = new THREE.Mesh(
    new THREE.BoxGeometry(ROAD_WIDTH, 0.1, ROAD_LENGTH),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  road.position.z = -i * ROAD_LENGTH;
  scene.add(road);
  roadSegments.push(road);
}

/* ================= WATER ================= */
const waterMaterial = new THREE.MeshBasicMaterial({
  color: 0x1e90ff,
  transparent: true,
  opacity: 0.7
});

const water = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 300),
  waterMaterial
);
water.rotation.x = -Math.PI / 2;
water.position.y = -0.2;
water.position.z = -150;
scene.add(water);

/* ================= BRIDGE ================= */
const bridge = new THREE.Mesh(
  new THREE.BoxGeometry(ROAD_WIDTH, 0.15, 30),
  new THREE.MeshStandardMaterial({ color: 0x555555 })
);
bridge.position.set(0, 0.3, -60);
scene.add(bridge);

/* ================= SLOPE UP ================= */
const upRoad = new THREE.Mesh(
  new THREE.BoxGeometry(ROAD_WIDTH, 0.15, 30),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
upRoad.position.set(0, 1.5, -110);
upRoad.rotation.x = -0.25;
scene.add(upRoad);

/* ================= SLOPE DOWN ================= */
const downRoad = new THREE.Mesh(
  new THREE.BoxGeometry(ROAD_WIDTH, 0.15, 30),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
downRoad.position.set(0, 0.2, -150);
downRoad.rotation.x = 0.25;
scene.add(downRoad);

/* ================= CAR ================= */
const car = new THREE.Mesh(
  new THREE.BoxGeometry(1, 0.5, 2),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
car.position.set(0, 0.5, 0);
scene.add(car);

/* ================= CAMERA POSITION ================= */
camera.position.set(0, 3, 6);
camera.lookAt(car.position);

/* ================= CONTROL VARIABLES ================= */
let isPressing = false;
let targetX = 0;
let speed = 0;

/* ================= POINTER (TOUCH) CONTROLS ================= */
canvas.addEventListener("pointerdown", () => {
  isPressing = true;
  speed = 0.22;
});

canvas.addEventListener("pointerup", () => {
  isPressing = false;
  speed = 0;
});

canvas.addEventListener("pointermove", (e) => {
  if (!isPressing) return;
  targetX = (e.clientX / window.innerWidth - 0.5) * 4;
});

/* ================= WATER COLOR ANIMATION ================= */
let waterHue = 0.55;

/* ================= ANIMATION LOOP ================= */
function animate() {
  requestAnimationFrame(animate);

  /* ---- Left / Right ---- */
  car.position.x += (targetX - car.position.x) * 0.12;

  /* ---- Road Boundary (Water me jaane se roke) ---- */
  if (car.position.x > 2) car.position.x = 2;
  if (car.position.x < -2) car.position.x = -2;

  /* ---- Forward (ONLY when pressing) ---- */
  if (isPressing) {
    car.position.z -= speed;
  }

  /* ---- Slope Height Logic ---- */
  if (car.position.z < -100 && car.position.z > -130) {
    car.position.y = 0.5 + (-car.position.z - 100) * 0.03;
  } else if (car.position.z <= -130 && car.position.z > -160) {
    car.position.y = 1.4 - (-car.position.z - 130) * 0.03;
  } else {
    car.position.y = 0.5;
  }

  /* ---- Endless Road Reposition ---- */
  roadSegments.forEach(r => {
    if (r.position.z - car.position.z > ROAD_LENGTH) {
      r.position.z -= ROAD_LENGTH * roadSegments.length;
    }
  });

  /* ---- Water Color Slow Change ---- */
  waterHue += 0.0002;
  if (waterHue > 0.75) waterHue = 0.55;
  water.material.color.setHSL(waterHue, 0.6, 0.5);

  /* ---- Camera Follow ---- */
  camera.position.z = car.position.z + 6;
  camera.position.x += (car.position.x - camera.position.x) * 0.05;
  camera.lookAt(car.position);

  renderer.render(scene, camera);
}

animate();

/* ================= RESIZE ================= */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
