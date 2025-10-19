import { describe, it, expect } from 'vitest'
import { render, screen } from '@/utils/testUtils'
import { FallbackInterface } from '../FallbackInterface'

describe('FallbackInterface', () => {
  it('renders fallback interface with default content', () => {
    render(<FallbackInterface />)
    
    expect(screen.getByText('2D Interface Mode')).toBeInTheDocument()
    expect(screen.getByText(/3D features unavailable/)).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <FallbackInterface>
        <div>Test child content</div>
      </FallbackInterface>
    )
    
    expect(screen.getByText('Test child content')).toBeInTheDocument()
  })

  it('shows reduced motion message when accessibility option is enabled', () => {
    const initialState = {
      performance: {
        accessibility: {
          reducedMotion: true,
          highContrast: false,
          screenReaderMode: false,
          keyboardNavigation: true,
          colorBlindFriendly: false,
        },
      },
    }
    
    render(<FallbackInterface />, { initialState })
    
    expect(screen.getByText(/Reduced motion enabled/)).toBeInTheDocument()
  })

  it('applies high contrast theme when enabled', () => {
    const initialState = {
      performance: {
        accessibility: {
          reducedMotion: false,
          highContrast: true,
          screenReaderMode: false,
          keyboardNavigation: true,
          colorBlindFriendly: false,
        },
      },
    }
    
    render(<FallbackInterface />, { initialState })
    
    const container = screen.getByText('2D Interface Mode').closest('.fallback-interface')
    expect(container).toHaveAttribute('data-high-contrast', 'true')
  })

  it('displays WebGL guidance message', () => {
    render(<FallbackInterface />)
    
    expect(screen.getByText(/For the full 3D experience/)).toBeInTheDocument()
    expect(screen.getByText(/ensure WebGL is enabled/)).toBeInTheDocument()
  })

  it('applies correct theme data attribute', () => {
    const initialState = {
      neuralInterface: {
        isInitialized: false,
        is3DEnabled: true,
        currentTheme: {
          name: 'neural-light',
          colors: {
            primary: '#0066cc',
            secondary: '#cc0066',
            background: '#f5f5f5',
            surface: '#ffffff',
            text: '#333333',
            accent: '#00cc66',
          },
          materials: {
            agent: 'metallic',
            workspace: 'glass-light',
            ui: 'clean',
          },
        },
        workspaceObjects: {},
        cameraPosition: [0, 0, 10] as [number, number, number],
        cameraTarget: [0, 0, 0] as [number, number, number],
        sceneLoaded: false,
        animationSpeed: 1.0,
        particleCount: 1000,
        visualEffectsEnabled: true,
      },
    }
    
    render(<FallbackInterface />, { initialState })
    
    const container = screen.getByText('2D Interface Mode').closest('.fallback-interface')
    expect(container).toHaveAttribute('data-theme', 'neural-light')
  })
})