import { useEffect, useRef } from 'preact/hooks'
import Hexasphere from 'hexasphere.js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import useAnimationFrame from './useAnimationFrame.js'
import { sampleOne } from '../lib/random.js'
import { pentaMaterial, randomMaterial } from '../lib/materials.js'

function constructScene(
  group,
  { radius, divisions, tileSize },
  img,
  pixelData
) {
  let material

  while (group.children.length > 0) {
    group.remove(group.children[0])
  }
  const hexasphere = new Hexasphere(radius, divisions, tileSize)

  for (let i = 0; i < hexasphere.tiles.length; i++) {
    const t = hexasphere.tiles[i]
    // const latLon = t.getLatLon(hexasphere.radius)
    let isHex = false

    let geometry = new THREE.Geometry()

    for (let j = 0; j < t.boundary.length; j++) {
      const bp = t.boundary[j]
      geometry.vertices.push(new THREE.Vector3(bp.x, bp.y, bp.z))
    }

    geometry.faces.push(new THREE.Face3(0, 1, 2))
    geometry.faces.push(new THREE.Face3(0, 2, 3))
    geometry.faces.push(new THREE.Face3(0, 3, 4))

    if (geometry.vertices.length > 5) {
      geometry.faces.push(new THREE.Face3(0, 4, 5))
      isHex = true
    }

    // // Monochrome Blue Green
    // if (!isHex) {
    //   material = pentaMaterial
    // } else if (isLand(latLon.lat, latLon.lon, img, pixelData)) {
    //   material = sampleOne(meshMaterials)
    // } else {
    //   material = sampleOne(oceanMaterial)
    // }

    // // Clamped Colorized
    // material = isHex
    //   ? getMaterial(latLon.lat, latLon.lon, img, pixelData)
    //   : pentaMaterial

    // Random Colorized
    material = isHex ? sampleOne(randomMaterial) : pentaMaterial

    material.opacity = 0.95
    const mesh = new THREE.Mesh(geometry, material.clone())
    group.add(mesh)
    hexasphere.tiles[i].mesh = mesh
  }

  return hexasphere
}

function useHexSphere(canvas, mountRef, canvasSize, hexOptions) {
  // Constants

  const [width, height] = canvasSize
  const aspect = height ? width / height : 1
  const viewAngle = 45 // or 65?
  const near = 0.1
  const far = 10000

  const rendererRef = useRef(
    new THREE.WebGLRenderer({ canvas, antialias: true })
  )
  const cameraRef = useRef(
    new THREE.PerspectiveCamera(viewAngle, aspect, near, far)
  )
  const controlsRef = useRef(
    new OrbitControls(cameraRef.current, rendererRef.current.domElement)
  )
  const sceneRef = useRef(new THREE.Scene())
  const globeRef = useRef(new THREE.Group())
  const pointLightRef = useRef(new THREE.PointLight(0xffffff))
  // const textureLoaderRef = useRef(new THREE.TextureLoader())
  // const animationFrameID = useRef()

  useEffect(() => {
    // get current instances
    const mount = mountRef.current
    const renderer = rendererRef.current
    const camera = cameraRef.current
    const scene = sceneRef.current
    const globe = globeRef.current
    const pointLight = pointLightRef.current
    const controls = controlsRef.current
    // const textureLoader = textureLoaderRef.current

    scene.fog = new THREE.Fog(0x000000, viewAngle * 1.3, viewAngle * 1.7)
    constructScene(globe, hexOptions)

    // // position light and camera
    // pointLight.position.x = 50
    // pointLight.position.y = 50
    // pointLight.position.z = 150

    camera.position.set(0, 0, -80)
    camera.lookAt(0, 0, 0)
    controls.update()

    // // update scene
    scene.add(camera)
    scene.add(globe)
    // scene.add(pointLight)

    // mount element and animate
    mount.appendChild(renderer.domElement)
  }, [mountRef])

  useEffect(() => {
    const camera = cameraRef.current
    const renderer = rendererRef.current
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }, [height, width])

  useAnimationFrame(deltaTime => {
    const camera = cameraRef.current
    const controls = controlsRef.current
    const renderer = rendererRef.current
    const scene = sceneRef.current
    // controls.update()
    renderer.render(scene, camera)
  })
}

export default useHexSphere
