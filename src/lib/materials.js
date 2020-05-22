import { MeshBasicMaterial } from 'three'
import { randColorLow } from '../lib/random.js'

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
].map(color => new MeshBasicMaterial({ color }))

export const oceanMaterial = [0x0f2342, 0x0f1e38].map(
  color => new MeshBasicMaterial({ color })
)

export const pentaMaterial = new MeshBasicMaterial({ color: 0xd2320f })

export const randomMaterial = Array(6)
  .fill(0)
  .map(() => new MeshBasicMaterial({ color: randColorLow() }))

// const hexMats = {}

// import MAP_IMAGE from '../assets/images/equirectangle_projection.png'
// import MAP_IMAGE_COLOR from '../assets/images/colored_projection.png'

// function isLand(lat, lon, img, pixelData) {
//   const x = parseInt((img.width * (lon + 180)) / 360, 10)
//   const y = parseInt((img.height * (lat + 90)) / 180, 10)

//   return pixelData.data[(y * pixelData.width + x) * 4] === 0
// }

// const img = document.createElement('img')
// img.src = MAP_IMAGE_COLOR // MAP_IMAGE

// img.onload = function () {
//   const projectionCanvas = document.createElement('canvas')
//   const projectionContext = projectionCanvas.getContext('2d')

//   projectionCanvas.width = img.width
//   projectionCanvas.height = img.height
//   projectionContext.drawImage(img, 0, 0, img.width, img.height)
//   projectionCanvas.remove()

//   let pixelData = projectionContext.getImageData(0, 0, img.width, img.height)
// }
// const img = new Image()
// img.src = MAP_IMAGE_COLOR
// console.log(MAP_IMAGE_COLOR)

// img.onload = function () {
//   const projectionCanvas = document.createElement('canvas')
//   const projectionContext = projectionCanvas.getContext('2d')

//   projectionCanvas.width = img.width
//   projectionCanvas.height = img.height
//   projectionContext.drawImage(img, 0, 0, img.width, img.height)
//   projectionCanvas.remove()

//   let pixelData = projectionContext.getImageData(0, 0, img.width, img.height)
// }

// function toClampedHex(num) {
//   return Number(Math.floor(num / 32) * 32)
//     .toString(16)
//     .padStart(2, '0')
// }

// function toHex(num) {
//   return Number(num).toString(16).padStart(2, '0')
// }

// function getMaterial(lat, lon, img, pixelData) {
//   const x = parseInt((img.width * (lon + 180)) / 360, 10)
//   const y = parseInt((img.height * (lat + 90)) / 180, 10)

//   const last = (y * pixelData.width + x) * 4
//   const hex = pixelData.data
//     .slice(last - 4, last - 1)
//     .reduce((str, item) => str + toClampedHex(item), '0x')

//   if (!hexMats[hex]) {
//     hexMats[hex] = new MeshBasicMaterial({
//       color: Number(hex),
//       transparent: false,
//     })
//   }

//   return hex === '0x000020' ? sampleOne(oceanMaterial) : hexMats[hex]
// }
