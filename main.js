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
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

/* ================= LIGHT ================= */
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5, 10, 5);
scene.add(sun);

/* ================= ROAD ================= */
const ROAD_WIDTH = 5;
const ROAD_LENGTH = 120;
const roadSegments = [];

for (let i = 0; i < 3; i++) {
  const road = new THREE.Mesh(
    new THREE.BoxGeometry(ROAD_WIDTH, 0.1, ROAD_LENGTH),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  road.position.z = -i * ROAD_LENGTH;
  scene.add(road);
  roadSegments.push(road);
}

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

/* ================= ENVIRONMENT GROUP ================= */
const envGroup = new THREE.Group();
scene.add(envGroup);

/* ================= ENVIRONMENT CREATOR ================= */
function createEnvironment(type, zPos) {
  const group = new THREE.Group();

  if (type === "grass") {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 120),
      new THREE.MeshBasicMaterial({ color: 0x2e8b57 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = zPos;
    group.add(ground);
  }

  if (type === "water") {
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 120),
      new THREE.MeshBasicMaterial({ color: 0x1e90ff, transparent: true, opacity: 0.8 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.2;
    water.position.z = zPos;
    group.add(water);
  }

  if (type === "jungle") {
    for (let i = 0; i < 15; i++) {
      const tree = new THREE.Mesh(
        new THREE.ConeGeometry(0.7, 2, 6),
        new THREE.MeshStandardMaterial({ color: 0x006400 })
      );
      tree.position.set(
        (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 5),
        1,
        zPos - Math.random() * 100
      );
      group.add(tree);
    }
  }

  if (type === "houses") {
    for (let i = 0; i < 8; i++) {
      const house = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.5, 1.5),
        new THREE.MeshStandardMaterial({ color: 0xb5651d })
      );
      house.position.set(
        (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 4),
        0.75,
        zPos - Math.random() * 100
      );
      group.add(house);
    }
  }

  return group;
}

/* ================= ENVIRONMENT SETUP ================= */
const envTypes = ["grass", "jungle", "houses", "water"];
const envSegments = [];

for (let i = 0; i < 4; i++) {
  const env = createEnvironment(envTypes[i], -i * 120);
  env.position.z = -i * 120;
  envGroup.add(env);
  envSegments.push(env);
}

/* ================= CONTROLS ================= */
let isPressing = false;
let targetX = 0;

canvas.addEventListener("pointerdown", () => {
  isPressing = true;
});
canvas.addEventListener("pointerup", () => {
  isPressing = false;
});
canvas.addEventListener("pointermove", e => {
  if (!isPressing) return;
  targetX = (e.clientX / window.innerWidth - 0.5) * 4;
});

/* ================= ANIMATION LOOP ================= */
function animate() {
  requestAnimationFrame(animate);

  /* Move */
  car.position.x += (targetX - car.position.x) * 0.12;
  if (car.position.x > 2) car.position.x = 2;
  if (car.position.x < -2) car.position.x = -2;

  if (isPressing) car.position.z -= 0.25;

  /* Road Loop */
  roadSegments.forEach(r => {
    if (r.position.z - car.position.z > ROAD_LENGTH) {
      r.position.z -= ROAD_LENGTH * roadSegments.length;
    }
  });

  /* Environment Loop */
  envSegments.forEach((env, i) => {
    if (env.position.z - car.position.z > 120) {
      env.position.z -= 120 * envSegments.length;
    }
  });

  /* Camera Follow */
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
