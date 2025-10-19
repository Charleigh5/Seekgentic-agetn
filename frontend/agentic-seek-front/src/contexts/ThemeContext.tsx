import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { setTheme } from '@/store/slices/neuralInterfaceSlice'
import type { ThemeConfig } from '@/types'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  currentTheme: ThemeConfig
  setCustomTheme: (theme: ThemeConfig) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const lightTheme: ThemeConfig = {
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
}

const darkTheme: ThemeConfig = {
  name: 'neural-dark',
  colors: {
    primary: '#00ffff',
    secondary: '#ff00ff',
    background: '#0a0a0a',
    surface: '#1a1a1a',
    text: '#ffffff',
    accent: '#00ff88',
  },
  materials: {
    agent: 'holographic',
    workspace: 'glass',
    ui: 'neon',
  },
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useDispatch()
  const currentTheme = useSelector((state: RootState) => state.neuralInterface.currentTheme)
  
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true // Default to dark
  })

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    
    // Update Redux store with theme
    dispatch(setTheme(isDark ? darkTheme : lightTheme))
  }, [isDark, dispatch])

  const toggleTheme = () => setIsDark(!isDark)

  const setCustomTheme = (theme: ThemeConfig) => {
    dispatch(setTheme(theme))
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, currentTheme, setCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}