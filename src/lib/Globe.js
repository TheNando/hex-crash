import Hexasphere from 'hexasphere.js'
import * as THREE from 'three'

import { pentaMaterial, randomMaterial } from './materials.js'
import { sampleOne } from './random.js'

class Globe {
  constructor(radius, divisions, tileSize) {
    const globe = new Hexasphere(radius, divisions, tileSize)

    Object.assign(this, globe)
    this.group = new THREE.Group()

    for (let i = 0; i < this.tiles.length; i++) {
      const geometry = new THREE.Geometry()
      const t = this.tiles[i]
      let isHex = false

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

      // const latLon = t.getLatLon(this.radius)
      // let material

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
      const mesh = new THREE.Mesh(
        geometry,
        isHex ? sampleOne(randomMaterial) : pentaMaterial
      )
      this.group.add(mesh)
      this.tiles[i].mesh = mesh
    }
  }
}

export default Globe
