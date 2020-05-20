import { useEffect, useRef } from 'preact/hooks'
import Hexasphere from 'hexasphere.js'
import * as THREE from 'three'
import MAP_IMAGE from '../assets/equirectangle_projection.png'

const meshMaterials = [
  0x7cfc00,
  0x397d02,
  0x77ee00,
  0x61b329,
  0x83f52c,
  0x83f52c,
  0x4cbb17,
  0x00ee00,
  0x00aa11,
].map((color) => new THREE.MeshBasicMaterial({ color, transparent: true }))

const oceanMaterial = [0x0f2342, 0x0f1e38].map(
  (color) => new THREE.MeshBasicMaterial({ color, transparent: false })
)

const pentaMaterial = new THREE.MeshBasicMaterial({
  color: 0xd2320f,
  transparent: false,
})

function isLand(lat, lon, img, pixelData) {
  const x = parseInt((img.width * (lon + 180)) / 360)
  const y = parseInt((img.height * (lat + 90)) / 180)

  return pixelData.data[(y * pixelData.width + x) * 4] === 0
}

function randInt(max) {
  return Math.floor(Math.random() * max)
}

function constructScene(
  scene,
  img,
  pixelData,
  { radius, divisions, tileSize }
) {
  let material

  while (scene.children.length > 0) {
    scene.remove(scene.children[0])
  }
  const hexasphere = new Hexasphere(radius, divisions, tileSize)

  for (let i = 0; i < hexasphere.tiles.length; i++) {
    const t = hexasphere.tiles[i]
    const latLon = t.getLatLon(hexasphere.radius)
    let isHex = false

    const geometry = new THREE.Geometry()

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

    if (!isHex) {
      material = pentaMaterial
    } else if (isLand(latLon.lat, latLon.lon, img, pixelData)) {
      material = meshMaterials[randInt(meshMaterials.length)]
    } else {
      material = oceanMaterial[randInt(oceanMaterial.length)]
    }

    material.opacity = 0.75
    const mesh = new THREE.Mesh(geometry, material.clone())
    scene.add(mesh)
    hexasphere.tiles[i].mesh = mesh
  }

  return hexasphere
}

const useHexSphere = function (canvas, mountRef, canvasSize, hexOptions) {
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
  const sceneRef = useRef(new THREE.Scene())
  // const globeRef = useRef(new THREE.Group())
  // const textureLoaderRef = useRef(new THREE.TextureLoader())
  const pointLightRef = useRef(new THREE.PointLight(0xffffff))
  // const animationFrameID = useRef()

  useEffect(() => {
    // get current instances
    const mount = mountRef.current
    const renderer = rendererRef.current
    const camera = cameraRef.current
    const scene = sceneRef.current
    // const globe = globeRef.current
    // const textureLoader = textureLoaderRef.current
    const pointLight = pointLightRef.current

    //set update function to transform the scene and view
    function animate() {
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    // camera.position.z = -viewAngle

    // scene.fog = new THREE.Fog(0x000000, viewAngle * 1.5, viewAngle * 1.2)

    const img = document.createElement('img')
    img.src = MAP_IMAGE

    img.onload = function () {
      const projectionCanvas = document.createElement('canvas')
      const projectionContext = projectionCanvas.getContext('2d')

      projectionCanvas.width = img.width
      projectionCanvas.height = img.height
      projectionContext.drawImage(img, 0, 0, img.width, img.height)
      projectionCanvas.remove()

      let pixelData = projectionContext.getImageData(
        0,
        0,
        img.width,
        img.height
      )
      constructScene(scene, img, pixelData, hexOptions)
    }

    // const RADIUS = 300
    // const SEGMENTS = 50
    // const RINGS = 50

    // // build globe
    // textureLoader.load(
    //   'https://raw.githubusercontent.com/mrdoob/three.js/e7ff8ca1be184316132f28a7c48d6bfdf26e2db0/examples/textures/land_ocean_ice_cloud_2048.jpg',
    //   function (map) {
    //     const sphere = new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS)
    //     const material = new THREE.MeshBasicMaterial({
    //       map,
    //     })
    //     const mesh = new THREE.Mesh(sphere, material)
    //     globe.add(mesh)
    //   }
    // )
    // globe.position.z = -RADIUS

    // // position light and camera
    // pointLight.position.x = 50
    // pointLight.position.y = 50
    // pointLight.position.z = 150
    camera.position.set(0, 0, -80)
    camera.lookAt(0, 0, 0)

    // // update scene
    scene.add(camera)
    // scene.add(globe)
    // scene.add(pointLight)

    // mount element and animate
    mount.appendChild(renderer.domElement)
    animate()
  }, [mountRef])

  useEffect(() => {
    const renderer = rendererRef.current
    const camera = cameraRef.current
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }, [height, width])

  // const maxLat = -100
  // const maxLon = 0
  // const minLat = 0
  // const minLon = 0

  // const seenTiles = {}
  // let currentTiles = hexasphere.tiles.slice().splice(0, 12)

  // currentTiles.forEach(function (item) {
  //   seenTiles[item.toString()] = 1
  //   item.mesh.material.opacity = 1
  // })

  // return [renderRef]
}

export default useHexSphere

// const startTime = Date.now()
// const lastTime = Date.now()
// const cameraAngle = -Math.PI / 1.5

// const tick = function () {
//   const dt = Date.now() - lastTime

//   const rotateCameraBy = (2 * Math.PI) / (200000 / dt)
//   cameraAngle += rotateCameraBy

//   lastTime = Date.now()

//   camera.position.x = cameraDistance * Math.cos(cameraAngle)
//   camera.position.y = Math.sin(cameraAngle) * 10
//   camera.position.z = cameraDistance * Math.sin(cameraAngle)
//   camera.lookAt(scene.position)

//   renderer.render(scene, camera)

//   const nextTiles = []

//   currentTiles.forEach(function (item) {
//     item.neighbors.forEach(function (neighbor) {
//       if (!seenTiles[neighbor.toString()]) {
//         neighbor.mesh.material.opacity = 1
//         nextTiles.push(neighbor)
//         seenTiles[neighbor] = 1
//       }
//     })
//   })

//   currentTiles = nextTiles

//   requestAnimationFrame(tick)
// }

// function onWindowResize() {
//   camera.aspect = window.innerWidth / window.innerHeight
//   camera.updateProjectionMatrix()
//   renderer.setSize(window.innerWidth, window.innerHeight)
// }

// window.addEventListener('resize', onWindowResize, false)

/* Example */
// const radius = 15 // Radius used to calculate position of tiles
// const subDivisions = 5 // Divide each edge of the icosohedron into this many segments
// const tileWidth = 0.9 // Add padding (1.0 = no padding; 0.1 = mostly padding)

// const hexasphere = new Hexasphere(radius, subDivisions, tileWidth)

// for (let i = 0; i < hexasphere.tiles.length; i++) {
//   // hexasphere.tiles[i].centerPoint contains x,y,z of the tile
//   // hexasphere.tiles[i].boundary contains an ordered array of the boundary points
//   // hexasphere.tiles[i].neighbors contains a list of all the neighboring tiles
// }

// const jsonString = hexasphere.toJson() // export it as a json object
