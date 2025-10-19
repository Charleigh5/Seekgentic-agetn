import React, { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats, Environment } from '@react-three/drei'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { setInitialized, setSceneLoaded } from '@/store/slices/neuralInterfaceSlice'
import { usePerformance } from '@/contexts/PerformanceContext'
import { use3DLifecycle } from '@/hooks/use3DLifecycle'
import { NeuralScene } from './NeuralScene'
import { FallbackInterface } from './FallbackInterface'
import { LoadingScreen } from './LoadingScreen'
import './NeuralInterface.css'

interface NeuralInterfaceProps {
  children?: React.ReactNode
}

export const NeuralInterface: React.FC<NeuralInterfaceProps> = ({ children }) => {
  const dispatch = useDispatch()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const { 
    isInitialized, 
    is3DEnabled, 
    currentTheme,
    cameraPosition,
    cameraTarget 
  } = useSelector((state: RootState) => state.neuralInterface)
  
  const { 
    settings: performanceSettings,
    accessibility,
    deviceCapabilities 
  } = useSelector((state: RootState) => state.performance)
  
  const { startMonitoring, stopMonitoring, recordFrameTime } = usePerformance()

  // 3D lifecycle management
  use3DLifecycle({
    componentId: 'neural-interface',
    onMount: () => {
      startMonitoring()
      dispatch(setInitialized(true))
    },
    onUnmount: () => {
      stopMonitoring()
      dispatch(setInitialized(false))
    },
  })

  // Check WebGL support and device capabilities
  const supportsWebGL = () => {
    try {
      const canvas = document.createElement('canvas')
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      )
    } catch (e) {
      return false
    }
  }

  const shouldUse3D = () => {
    return (
      is3DEnabled &&
      supportsWebGL() &&
      !accessibility.reducedMotion &&
      deviceCapabilities.webgl2
    )
  }

  // Performance monitoring
  const handleFrame = (state: any) => {
    recordFrameTime(performance.now())
  }

  // Handle scene load
  const handleSceneLoad = () => {
    dispatch(setSceneLoaded(true))
  }

  // Render fallback interface if 3D is not supported/enabled
  if (!shouldUse3D()) {
    return <FallbackInterface>{children}</FallbackInterface>
  }

  return (
    <div className="neural-interface" data-theme={currentTheme.name}>
      <Canvas
        ref={canvasRef}
        camera={{
          position: cameraPosition,
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        shadows={performanceSettings.enableShadows}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        performance={{
          min: 0.5,
          max: 1,
          debounce: 200,
        }}
        onCreated={({ gl, scene, camera }) => {
          // Configure renderer
          gl.setClearColor(currentTheme.colors.background)
          gl.shadowMap.enabled = performanceSettings.enableShadows
          gl.shadowMap.type = 2 // PCFSoftShadowMap
          
          // Set initial camera target
          camera.lookAt(...cameraTarget)
          
          console.log('Neural Interface Canvas created')
          handleSceneLoad()
        }}
        onPointerMissed={() => {
          // Handle clicks on empty space
          console.log('Clicked on empty space')
        }}
      >
        {/* Performance monitoring */}
        {process.env.NODE_ENV === 'development' && <Stats />}
        
        {/* Environment and lighting */}
        <Environment preset="night" />
        <ambientLight intensity={0.2} color={currentTheme.colors.accent} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.5}
          color={currentTheme.colors.primary}
          castShadow={performanceSettings.enableShadows}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          target={cameraTarget}
          enableDamping={true}
          dampingFactor={0.05}
        />
        
        {/* Main 3D scene */}
        <Suspense fallback={<LoadingScreen />}>
          <NeuralScene onFrame={handleFrame} />
        </Suspense>
      </Canvas>
      
      {/* 2D UI overlay */}
      <div className="neural-interface-overlay">
        {children}
      </div>
    </div>
  )
}