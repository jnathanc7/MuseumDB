import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import PropTypes from 'prop-types'

// A simple scene component for react-three-fiber
const Scene = ({ isFullscreen, position, rotation, intensity, size }) => {
  return (
    <Canvas>
      <ambientLight intensity={intensity} />
      <spotLight position={[10, 10, 10]} intensity={0.5} />
      <OrbitControls />
      
      {/* Example of a 3D cube with custom position, rotation, and size */}
      <mesh position={position} rotation={rotation}>
        <boxGeometry args={size} />
        <meshStandardMaterial color="royalblue" />
      </mesh>

      {/* Optionally, you could render a fullscreen toggle */}
      {isFullscreen && <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}>Fullscreen</div>}
    </Canvas>
  )
}

Scene.propTypes = {
  isFullscreen: PropTypes.bool, // Validate fullscreen prop
  position: PropTypes.arrayOf(PropTypes.number), // Validate position prop (array of numbers)
  rotation: PropTypes.arrayOf(PropTypes.number), // Validate rotation prop (array of numbers)
  intensity: PropTypes.number, // Validate intensity for the light
  size: PropTypes.arrayOf(PropTypes.number), // Validate size prop for box geometry
}

Scene.defaultProps = {
  isFullscreen: false, 
  position: [0, 0, 0], 
  rotation: [0, 0, 0],
  intensity: 1, 
  size: [1, 1, 1], 
}

export default Scene
