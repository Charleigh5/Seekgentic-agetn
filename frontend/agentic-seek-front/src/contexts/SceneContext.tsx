import React, { createContext, useContext, useRef, ReactNode } from 'react'
import { Scene, PerspectiveCamera, WebGLRenderer, Clock } from 'three'

interface SceneContextType {
  scene: Scene | null
  camera: PerspectiveCamera | null
  renderer: WebGLRenderer | null
  clock: Clock | null
  initializeScene: (canvas: HTMLCanvasElement) => void
  cleanupScene: () => void
}

const SceneContext = createContext<SceneContextType | undefined>(undefined)

interface SceneProviderProps {
  children: ReactNode
}

export const SceneProvider: React.FC<SceneProviderProps> = ({ children }) => {
  const sceneRef = useRef<Scene | null>(null)
  const cameraRef = useRef<PerspectiveCamera | null>(null)
  const rendererRef = useRef<WebGLRenderer | null>(null)
  const clockRef = useRef<Clock | null>(null)

  const initializeScene = (canvas: HTMLCanvasElement) => {
    // Initialize Three.js scene
    sceneRef.current = new Scene()
    
    // Initialize camera
    cameraRef.current = new PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    )
    cameraRef.current.position.set(0, 0, 10)

    // Initialize renderer
    rendererRef.current = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    rendererRef.current.setSize(canvas.clientWidth, canvas.clientHeight)
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    rendererRef.current.shadowMap.enabled = true
    rendererRef.current.shadowMap.type = 2 // PCFSoftShadowMap

    // Initialize clock
    clockRef.current = new Clock()

    console.log('3D Scene initialized successfully')
  }

  const cleanupScene = () => {
    if (rendererRef.current) {
      rendererRef.current.dispose()
      rendererRef.current = null
    }
    
    if (sceneRef.current) {
      // Dispose of all scene objects
      sceneRef.current.traverse((object) => {
        if (object.type === 'Mesh') {
          const mesh = object as any
          if (mesh.geometry) mesh.geometry.dispose()
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((material: any) => material.dispose())
            } else {
              mesh.material.dispose()
            }
          }
        }
      })
      sceneRef.current.clear()
      sceneRef.current = null
    }

    cameraRef.current = null
    clockRef.current = null
    
    console.log('3D Scene cleaned up')
  }

  return (
    <SceneContext.Provider
      value={{
        scene: sceneRef.current,
        camera: cameraRef.current,
        renderer: rendererRef.current,
        clock: clockRef.current,
        initializeScene,
        cleanupScene,
      }}
    >
      {children}
    </SceneContext.Provider>
  )
}

export const useScene = (): SceneContextType => {
  const context = useContext(SceneContext)
  if (!context) {
    throw new Error('useScene must be used within SceneProvider')
  }
  return context
}