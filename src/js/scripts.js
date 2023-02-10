import * as THREE from "three";
import * as YUKA from "yuka";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

renderer.setClearColor(0x00db00);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(0, 10, 15);
camera.lookAt(scene.position);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

const vehicle = new YUKA.Vehicle();

function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix);
}

const path = new YUKA.Path();
path.add(new YUKA.Vector3(-6, 0, 4));
path.add(new YUKA.Vector3(-12, 0, 0));
path.add(new YUKA.Vector3(-6, 0, -12));
path.add(new YUKA.Vector3(0, 0, 0));
path.add(new YUKA.Vector3(8, 0, -8));
path.add(new YUKA.Vector3(10, 0, 0));
path.add(new YUKA.Vector3(4, 0, 4));
path.add(new YUKA.Vector3(0, 0, 6));

path.loop = true;

vehicle.position.copy(path.current());

vehicle.maxSpeed = 3;

const followPathBehavior = new YUKA.FollowPathBehavior(path, 2.5);
vehicle.steering.add(followPathBehavior);

const onPathBehavior = new YUKA.OnPathBehavior(path);
//onPathBehavior.radius = 2;
vehicle.steering.add(onPathBehavior);

const entityManager = new YUKA.EntityManager();
entityManager.add(vehicle);

/*
var suv;
const loader = new GLTFLoader();
loader.load("./assets/moskwitch.glb", function (glb) {
  const model = glb.scene;
  //model.scale.set(0.5, 0.5, 0.5);
  glb.scene.position.x = 0; //Position (x = right+ left-)
  glb.scene.position.y = 0; //Position (y = up+, down-)
  glb.scene.position.z = 0;
  model.name = "suv";
  scene.add(model);
  suv = model;
  model.matrixAutoUpdate = false;
  vehicle.scale = new YUKA.Vector3(0.6, 0.6, 0.6);
  vehicle.setRenderComponent(model, sync);
});
*/
var carModel;
const changeCar = (str) => {
  var suv;
  const loader = new GLTFLoader();
  loader.load(`./assets/${str}.glb`, function (glb) {
    const model = glb.scene;
    carModel = model;
    //model.scale.set(0.5, 0.5, 0.5);
    glb.scene.position.x = 0; //Position (x = right+ left-)
    glb.scene.position.y = 0; //Position (y = up+, down-)
    glb.scene.position.z = 0;
    model.name = "suv";
    scene.add(carModel);
    suv = model;
    model.matrixAutoUpdate = false;
    vehicle.scale = new YUKA.Vector3(0.6, 0.6, 0.6);
    vehicle.setRenderComponent(model, sync);
  });
};

function onKeyDown(e) {
  var key = e.which;
  if (key == 88) {
    scene.remove(carModel);
    changeCar("SUV");
  } else {
    scene.remove(carModel);
    changeCar("moskwitch");
  }
}

document.addEventListener("keydown", onKeyDown, false);

// const vehicleGeometry = new THREE.ConeBufferGeometry(0.1, 0.5, 8);
// vehicleGeometry.rotateX(Math.PI * 0.5);
// const vehicleMaterial = new THREE.MeshNormalMaterial();
// const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
// vehicleMesh.matrixAutoUpdate = false;
// scene.add(vehicleMesh);

const position = [];
for (let i = 0; i < path._waypoints.length; i++) {
  const waypoint = path._waypoints[i];
  position.push(waypoint.x, waypoint.y, waypoint.z);
}

const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(position, 3)
);

const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
const lines = new THREE.LineLoop(lineGeometry, lineMaterial);
scene.add(lines);

const time = new YUKA.Time();

/////////////

const closedSpline = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-6, 0, 4),
  new THREE.Vector3(-12, 0, 0),
  new THREE.Vector3(-6, 0, -12),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(8, 0, -8),
  new THREE.Vector3(10, 0, 0),
  new THREE.Vector3(4, 0, 4),
  new THREE.Vector3(0, 0, 6),
]);

closedSpline.curveType = "chordal";
closedSpline.closed = true;

const extrudeSettings1 = {
  steps: 200,
  bevelEnabled: false,
  radiusSegments: 3,
  extrudePath: closedSpline,
};

const pts1 = [],
  count = 8;

for (let i = 0; i < count; i++) {
  const l = 2;

  const a = ((3 * i) / count) * Math.PI;

  pts1.push(new THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l));
}

const shape1 = new THREE.Shape(pts1);

const geometry1 = new THREE.ExtrudeGeometry(shape1, extrudeSettings1);

geometry1.scale(0.86, 0.011, 0.95);

const material1 = new THREE.MeshLambertMaterial({
  color: 0x606060,
  wireframe: false,
});

const mesh1 = new THREE.Mesh(geometry1, material1);

scene.add(mesh1);

const closedSpline1 = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-6, 0, 4),
  new THREE.Vector3(-12, 0, 0),
  new THREE.Vector3(-6, 0, -12),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(8, 0, -8),
  new THREE.Vector3(10, 0, 0),
  new THREE.Vector3(4, 0, 4),
  new THREE.Vector3(0, 0, 6),
]);

closedSpline1.curveType = "chordal";
closedSpline1.closed = true;

const extrudeSettings2 = {
  steps: 300,
  bevelEnabled: false,
  radiusSegments: 10,
  extrudePath: closedSpline,
};

const pts2 = [],
  count1 = 8;

for (let i = 0; i < count1; i++) {
  const l = 0.2;

  const a = ((3 * i) / count1) * Math.PI;

  pts2.push(new THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l));
}

const shape2 = new THREE.Shape(pts2);

const geometry2 = new THREE.ExtrudeGeometry(shape2, extrudeSettings2);

geometry2.scale(0.86, 0.02, 0.95);
geometry2.translate(0, 0.017, 0);

const material2 = new THREE.MeshLambertMaterial({
  color: 0xffffff,
  wireframe: false,
});

const mesh2 = new THREE.Mesh(geometry2, material2);

scene.add(mesh2);

const gui = new GUI();

const speedFolder = gui.addFolder("speed");

const keyFolder = gui.addFolder("CHANGE CAR: PRESS W OR X");

speedFolder.add(vehicle, "maxSpeed", 0, 4);
speedFolder.open();

function animate() {
  const delta = time.update().getDelta();
  entityManager.update(delta);
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
