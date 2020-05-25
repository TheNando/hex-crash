import Hexasphere from 'hexasphere.js'
import * as THREE from 'three'

import {
  getMapImage,
  getMaterial,
  pentaMaterial,
  randomMaterial,
} from './materials.js'
import { sampleOne } from './random.js'

export const GlobeMode = {
  Random: Symbol(),
  Monochrome: Symbol(),
  Earth: Symbol(),
}

class Globe {
  constructor(radius, divisions, tileSize, mode = GlobeMode.Random) {
    const globe = new Hexasphere(radius, divisions, tileSize)
    this.mode = mode

    Object.assign(this, globe)
    this.group = new THREE.Group()

    this.generateTiles()
  }

  async generateTiles() {
    let imageData

    if (this.mode !== GlobeMode.Random) {
      imageData = await getMapImage(this.mode === GlobeMode.Monochrome)
    }

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

      let material

      if (!isHex) {
        material = pentaMaterial
      } else if (this.mode === GlobeMode.Random) {
        material = sampleOne(randomMaterial)
      } else {
        material = await getMaterial(t.getLatLon(this.radius), imageData)
      }

      const mesh = new THREE.Mesh(geometry, material)

      this.group.add(mesh)
      this.tiles[i].mesh = mesh
    }
  }
}

export default Globe
