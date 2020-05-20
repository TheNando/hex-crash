import { useEffect, useRef, useState } from 'preact/hooks'

function useResponsiveCanvas(initialSize) {
  const canvasRef = useRef()
  const mountRef = useRef()
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

    // update resize using a resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || !entries.length) {
        return
      }

      if (resizeTimeoutId) {
        clearTimeout(resizeTimeoutId)
      }

      resizeTimeoutId = setTimeout(() => {
        let { width, height } = entries[0].contentRect
        setSize([width, height])
      }, 250)
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
