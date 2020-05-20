import { h } from 'preact'

import useHexSphere from '../hooks/useHexSphere'
import useResponsiveCanvas from '../hooks/useResponsiveCanvas'

const App = function ({ hexOptions, initialSize }) {
  const { canvas, mountRef, size } = useResponsiveCanvas(initialSize)
  useHexSphere(canvas, mountRef, size, hexOptions)

  return <div style={{ height: '100%', width: '100%' }} ref={mountRef} />
}

App.defaultProps = {
  hexOptions: {
    radius: 30,
    divisions: 15,
    tileSize: 0.95,
  },
  initialSize: [1500, 800],
}

export default App
