import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import './FallbackInterface.css'

interface FallbackInterfaceProps {
  children?: React.ReactNode
}

export const FallbackInterface: React.FC<FallbackInterfaceProps> = ({ children }) => {
  const { currentTheme } = useSelector((state: RootState) => state.neuralInterface)
  const { accessibility } = useSelector((state: RootState) => state.performance)

  return (
    <div 
      className="fallback-interface" 
      data-theme={currentTheme.name}
      data-high-contrast={accessibility.highContrast}
    >
      <div className="fallback-header">
        <div className="fallback-indicator">
          <div className="fallback-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="fallback-text">
            <h3>2D Interface Mode</h3>
            <p>
              {accessibility.reducedMotion 
                ? 'Reduced motion enabled - using simplified interface'
                : '3D features unavailable - using fallback interface'
              }
            </p>
          </div>
        </div>
      </div>
      
      <div className="fallback-content">
        {children}
      </div>
      
      <div className="fallback-footer">
        <p className="fallback-note">
          For the full 3D experience, ensure WebGL is enabled and motion preferences allow animations.
        </p>
      </div>
    </div>
  )
}