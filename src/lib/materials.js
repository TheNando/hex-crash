import { MeshStandardMaterial } from 'three'
import { randColorLow, sampleOne } from '../lib/random.js'

import MAP_IMAGE_MONO from '../assets/images/equirectangle_projection.png'
import MAP_IMAGE_COLOR from '../assets/images/colored_projection.png'

const hexMats = {}

function toClampedHex(num) {
  return Number(Math.floor(num / 32) * 32)
    .toString(16)
    .padStart(2, '0')
}

export const meshMaterials = [
  0x7cfc00,
  0x397d02,
  0x77ee00,
  0x61b329,
  0x83f52c,
  0x83f52c,
  0x4cbb17,
  0x00ee00,
  0x00aa11,
].map(color => new MeshStandardMaterial({ color }))

export const oceanMaterial = [0x0f2342, 0x0f1e38].map(
  color => new MeshStandardMaterial({ color })
)

export const pentaMaterial = new MeshStandardMaterial({ color: 0xd2320f })

export let randomMaterial = Array(6)
  .fill(0)
  .map(() => new MeshStandardMaterial({ color: randColorLow() }))

export function refreshRandomMaterials() {
  randomMaterial = Array(6)
    .fill(0)
    .map(() => new MeshStandardMaterial({ color: randColorLow() }))
}

export async function getMapImage(mono = false) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  const image = new Image()
  image.src = mono ? MAP_IMAGE_MONO : MAP_IMAGE_COLOR
  await image.decode()

  canvas.width = image.width
  canvas.height = image.height
  context.drawImage(image, 0, 0, image.width, image.height)
  canvas.remove()

  const pixelData = context.getImageData(0, 0, image.width, image.height)
  return { image, pixelData, isMono: mono }
}

export async function getMaterial({ lat, lon }, { image, isMono, pixelData }) {
  const x = parseInt((image.width * (lon + 180)) / 360, 10)
  const y = parseInt((image.height * (lat + 90)) / 180, 10)

  if (isMono) {
    const isLand = pixelData.data[(y * pixelData.width + x) * 4] === 0
    return isLand ? sampleOne(meshMaterials) : sampleOne(oceanMaterial)
  }

  const last = (y * pixelData.width + x) * 4
  const hex = pixelData.data
    .slice(last - 4, last - 1)
    .reduce((str, item) => str + toClampedHex(item), '0x')

  if (!hexMats[hex]) {
    hexMats[hex] = new MeshStandardMaterial({ color: Number(hex) })
  }

  return hex === '0x000020' ? sampleOne(oceanMaterial) : hexMats[hex]
}
