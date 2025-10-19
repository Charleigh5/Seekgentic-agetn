import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { Group, Vector3 } from 'three'
import { use3DLifecycle } from '@/hooks/use3DLifecycle'

interface NeuralSceneProps {
  onFrame?: (state: any) => void
}

export const NeuralScene: React.FC<NeuralSceneProps> = ({ onFrame }) => {
  const groupRef = useRef<Group>(null)
  const { scene, camera, gl } = useThree()
  
  const { 
    currentTheme,
    animationSpeed,
    visualEffectsEnabled 
  } = useSelector((state: RootState) => state.neuralInterface)
  
  const { 
    settings: performanceSettings 
  } = useSelector((state: RootState) => state.performance)

  // 3D lifecycle management
  use3DLifecycle({
    componentId: 'neural-scene',
    resources: [groupRef.current],
  })

  // Animation loop
  useFrame((state, delta) => {
    if (!groupRef.current || !visualEffectsEnabled) return
    
    // Gentle rotation animation
    groupRef.current.rotation.y += delta * 0.1 * animationSpeed
    
    // Call performance monitoring callback
    onFrame?.(state)
  })

  // Setup scene effects
  useEffect(() => {
    if (!scene || !camera || !gl) return
    
    // Configure fog for depth perception
    if (visualEffectsEnabled) {
      scene.fog = new (window as any).THREE.Fog(
        currentTheme.colors.background,
        10,
        100
      )
    }
    
    // Configure renderer settings based on performance
    gl.shadowMap.enabled = performanceSettings.enableShadows
    gl.antialias = performanceSettings.renderQuality !== 'low'
    
  }, [scene, camera, gl, currentTheme, performanceSettings, visualEffectsEnabled])

  return (
    <group ref={groupRef}>
      {/* Grid helper for spatial reference */}
      <gridHelper
        args={[20, 20]}
        position={[0, -5, 0]}
        material-color={currentTheme.colors.primary}
        material-opacity={0.2}
        material-transparent={true}
      />
      
      {/* Central neural core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={currentTheme.colors.accent}
          emissive={currentTheme.colors.accent}
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Orbital rings */}
      {[1, 2, 3].map((ring, index) => (
        <group key={ring} rotation={[0, 0, (index * Math.PI) / 6]}>
          <mesh position={[ring * 2, 0, 0]}>
            <torusGeometry args={[ring * 1.5, 0.05, 8, 32]} />
            <meshStandardMaterial
              color={currentTheme.colors.primary}
              emissive={currentTheme.colors.primary}
              emissiveIntensity={0.1}
              transparent={true}
              opacity={0.6}
            />
          </mesh>
        </group>
      ))}
      
      {/* Floating particles */}
      {visualEffectsEnabled && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={100}
              array={new Float32Array(
                Array.from({ length: 300 }, () => (Math.random() - 0.5) * 20)
              )}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            color={currentTheme.colors.secondary}
            size={0.05}
            transparent={true}
            opacity={0.8}
          />
        </points>
      )}
    </group>
  )
}