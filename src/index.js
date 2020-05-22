import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import Globe, { GlobeMode } from './lib/Globe.js'

import './index.css'

const RADIUS = 25
const DIVISIONS = 10
const TILE_SIZE = 1

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const ASPECT = WIDTH / HEIGHT
const VIEW_ANGLE = 45
const NEAR = 0.1
const FAR = 10000

const renderer = new THREE.WebGLRenderer({ antialias: true })
const camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR)
const controls = new OrbitControls(camera, renderer.domElement)
const scene = new THREE.Scene()
// const pointLight = new THREE.PointLight(0xffffff)

const globe = new Globe(RADIUS, DIVISIONS, TILE_SIZE, GlobeMode.Earth)

scene.fog = new THREE.Fog(0x000000, VIEW_ANGLE * 1.3, VIEW_ANGLE * 1.7)

// pointLight.position.x = 50
// pointLight.position.y = 50
// pointLight.position.z = 150

camera.position.set(0, 0, -80)
camera.lookAt(0, 0, 0)
controls.update()

scene.add(camera)
scene.add(globe.group)

renderer.setSize(WIDTH, HEIGHT)
renderer.render(scene, camera)

document.getElementById('container').append(renderer.domElement)

function animate() {
  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(animate)
}

const MIN_ELAPSED = 33 // Milliseconds passed since last resize
let lastResize = Date.now()

const resizeObserver = new ResizeObserver(entries => {
  // Prevent excessive resizes
  if (Date.now() - lastResize < MIN_ELAPSED) {
    return
  }

  if (!entries || !entries.length) {
    return
  }

  let { width, height } = entries[0].contentRect

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)

  lastResize = Date.now()
})

resizeObserver.observe(document.getElementById('container'))

// // Cleanup
// resizeObserver.unobserve(mount)

animate()
