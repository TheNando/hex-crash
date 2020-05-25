export function randColorLow() {
  return Number(
    '0x' +
      Array(3)
        .fill(0)
        .map(i => ((i = randInt(16).toString(16)), `${i}${i}`))
        .join('')
  )
}

export function randInt(max) {
  return Math.floor(Math.random() * max)
}

export function sample(array, count = 1) {
  return Array(count)
    .fill(0)
    .map(i => sampleOne(array))
}

export function sampleOne(array) {
  return array[randInt(array.length)]
}
