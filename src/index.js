import * as dat from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import Globe, { GlobeMode } from "./lib/Globe.js";
import { refreshRandomMaterials } from "./lib/materials.js";

import "./index.css";

const RADIUS = 25;
const DIVISIONS = 15;
const TILE_SIZE = 1;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const ASPECT = WIDTH / HEIGHT;
const VIEW_ANGLE = 45;
const NEAR = 20;
const FAR = 10000;

const renderer = new THREE.WebGLRenderer({ antialias: true });
const camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const intersects = [];
const lastHex = { object: null, material: null };
const glowMaterial = new THREE.MeshStandardMaterial({
  emissive: new THREE.Color(0xffd700),
  emissiveIntensity: 0.8,
});

const ambientLight = new THREE.AmbientLight(0x404040, 4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.minDistance = 50;
controls.maxDistance = 150;
controls.mouseButtons = {
  LEFT: THREE.MOUSE.RIGHT,
  MIDDLE: THREE.MOUSE.MIDDLE,
  RIGHT: THREE.MOUSE.LEFT,
};

const scene = new THREE.Scene();

const knobs = {
  radius: RADIUS,
  divisions: DIVISIONS,
  tileSize: TILE_SIZE,

  fogStart: 0.5,
  fogEnd: 3.5,
  viewAngle: VIEW_ANGLE,
  mode: "Earth",
  reroll: () => {
    if (knobs.mode !== "Random") {
      alert("Change mode to random to use this");
    }
  },

  autoRotate: false,
  autoRotateSpeed: 2,
  enableDamping: true,
  dampingFactor: 0.05,
};

global.knobs = knobs;

const gui = new dat.GUI();

const guiGlobe = gui.addFolder("Globe");
const radiusController = guiGlobe.add(knobs, "radius", 10, 40);
const divisionsController = guiGlobe.add(knobs, "divisions", 3, 50);
const tileSizeController = guiGlobe.add(knobs, "tileSize", 0.1, 1);
guiGlobe.open();

const guiRender = gui.addFolder("Render");

const modeController = guiRender.add(knobs, "mode", [
  "Earth",
  "Monochrome",
  "Random",
]);
guiRender.add(knobs, "fogStart", 0, 3.4);
guiRender.add(knobs, "fogEnd", 0, 4);
guiRender.open();

const rerollController = guiRender.add(knobs, "reroll");
rerollController.name("Reroll Random");

let globe = new Globe(
  Math.floor(knobs.radius),
  Math.floor(knobs.divisions),
  knobs.tileSize,
  GlobeMode[knobs.mode]
);

function makeGlobe() {
  scene.remove(globe.group);
  refreshRandomMaterials();
  globe = new Globe(
    Math.floor(knobs.radius),
    Math.floor(knobs.divisions),
    knobs.tileSize,
    GlobeMode[knobs.mode]
  );
  scene.add(globe.group);
}

scene.fog = new THREE.Fog(
  0x000000,
  VIEW_ANGLE * knobs.fogStart,
  VIEW_ANGLE * knobs.fogEnd
);

const guiControls = gui.addFolder("Controls");
guiControls.add(knobs, "autoRotate", false);
guiControls.add(knobs, "autoRotateSpeed", 0, 30);
guiControls.add(knobs, "enableDamping", false);
guiControls.add(knobs, "dampingFactor", 0.0, 1);
guiControls.open();

let timeoutId;
function debouncedMakeGlobe() {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(() => makeGlobe(), 300);
}

radiusController.onChange(debouncedMakeGlobe);
divisionsController.onChange(debouncedMakeGlobe);
tileSizeController.onChange(debouncedMakeGlobe);
modeController.onChange(makeGlobe);
rerollController.onChange(makeGlobe);

camera.position.set(0, 0, 80);
controls.update();

scene.add(camera);
scene.add(globe.group);
scene.add(ambientLight);

// Render scene
renderer.setSize(WIDTH, HEIGHT);
renderer.render(scene, camera);

document.getElementById("container").append(renderer.domElement);

function setMouse(event) {
  var x, y;

  if (event.changedTouches) {
    x = event.changedTouches[0].pageX;
    y = event.changedTouches[0].pageY;
  } else {
    x = event.clientX;
    y = event.clientY;
  }

  mouse.x = (x / window.innerWidth) * 2 - 1;
  mouse.y = -(y / window.innerHeight) * 2 + 1;

  checkIntersection();
}

function checkIntersection() {
  raycaster.setFromCamera(mouse, camera);
  raycaster.intersectObject(globe.group, true, intersects);

  // Highlight intersected hex, if found
  if (intersects.length && intersects[0].object !== lastHex.object) {
    // Set last highlighted hex back to original color
    if (lastHex.object) {
      lastHex.object.material = lastHex.material;
    }

    lastHex.object = intersects[0].object;
    lastHex.material = intersects[0].object.material;

    glowMaterial.color.set(lastHex.material.color);
    intersects[0].object.material = glowMaterial;
  }
  intersects.length = 0;
}

function animate() {
  scene.fog.near = VIEW_ANGLE * knobs.fogStart;
  scene.fog.far = VIEW_ANGLE * knobs.fogEnd;

  controls.autoRotate = knobs.autoRotate;
  controls.autoRotateSpeed = knobs.autoRotateSpeed;
  controls.enableDamping = knobs.enableDamping;
  controls.dampingFactor = knobs.dampingFactor;
  controls.update();

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

const MIN_ELAPSED = 33; // Milliseconds passed since last resize
let lastResize = Date.now();

const resizeObserver = new ResizeObserver((entries) => {
  // Prevent excessive resizes
  if (Date.now() - lastResize < MIN_ELAPSED) {
    return;
  }

  if (!entries || !entries.length) {
    return;
  }

  let { width, height } = entries[0].contentRect;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);

  lastResize = Date.now();
});

resizeObserver.observe(document.getElementById("container"));

// // Cleanup
// resizeObserver.unobserve(mount)

animate();

window.addEventListener("mousemove", setMouse);
