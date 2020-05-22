import { useEffect, useRef, useState } from 'preact/hooks'

const MIN_ELAPSED = 33 // Milliseconds passed since last resize

function useResponsiveCanvas(initialSize) {
  const canvasRef = useRef()
  const mountRef = useRef()
  const lastResizeRef = useRef()
  const [size, setSize] = useState(initialSize)
  let resizeTimeoutId

  // set initial svg and size
  useEffect(() => {
    const canvas = document.createElement('canvas')
    const mount = mountRef.current

    canvas.style.display = 'block'
    canvasRef.current = canvas

    // update initial size
    const [width, height] = initialSize

    setSize([width, height])
    lastResizeRef.current = Date.now()

    // update resize using a resize observer
    const resizeObserver = new ResizeObserver(entries => {
      // Prevent excessive resizes
      if (Date.now() - lastResizeRef.current < MIN_ELAPSED) {
        return
      }

      if (!entries || !entries.length) {
        return
      }

      let { width, height } = entries[0].contentRect
      setSize([width, height])
      lastResizeRef.current = Date.now()
    })
    resizeObserver.observe(mount)

    // cleanup
    return () => {
      resizeObserver.unobserve(mount)
      mount.removeChild(canvas)
      clearTimeout(resizeTimeoutId)
    }
  }, [initialSize])

  return {
    canvas: canvasRef.current,
    mountRef,
    size,
  }
}

export default useResponsiveCanvas
