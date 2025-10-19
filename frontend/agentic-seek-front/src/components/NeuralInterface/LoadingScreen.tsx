import React from 'react'
import { Html, useProgress } from '@react-three/drei'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import './LoadingScreen.css'

export const LoadingScreen: React.FC = () => {
  const { progress, loaded, total } = useProgress()
  const { currentTheme } = useSelector((state: RootState) => state.neuralInterface)

  return (
    <Html center>
      <div className="loading-screen" data-theme={currentTheme.name}>
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          
          <div className="loading-text">
            <h2>Initializing Neural Interface</h2>
            <p>Loading 3D environment...</p>
          </div>
          
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="progress-text">
              {Math.round(progress)}% ({loaded} / {total} assets)
            </div>
          </div>
          
          <div className="loading-tips">
            <p>
              {progress < 30 && "Preparing 3D scene..."}
              {progress >= 30 && progress < 60 && "Loading materials and textures..."}
              {progress >= 60 && progress < 90 && "Initializing neural networks..."}
              {progress >= 90 && "Almost ready..."}
            </p>
          </div>
        </div>
      </div>
    </Html>
  )
}