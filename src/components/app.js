import { h } from 'preact'

import useHexSphere from '../hooks/useHexSphere'
import useResponsiveCanvas from '../hooks/useResponsiveCanvas'

const infoStyle = {
  position: 'absolute',
  padding: '20px',
}

const App = function ({ hexOptions, initialSize }) {
  const { canvas, mountRef, size } = useResponsiveCanvas(initialSize)
  useHexSphere(canvas, mountRef, size, hexOptions)

  return (
    <>
      {/* <div style={infoStyle}>123</div> */}
      <div style={{ height: '100%', width: '100%' }} ref={mountRef} />
    </>
  )
}

App.defaultProps = {
  hexOptions: {
    radius: 30,
    divisions: 12,
    tileSize: 1,
  },
  initialSize: [window.innerWidth, window.innerHeight],
}

export default App
