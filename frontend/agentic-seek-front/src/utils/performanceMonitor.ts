export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private frameCount = 0
  private lastTime = 0
  private fps = 0
  private frameTimeHistory: number[] = []
  private memoryHistory: number[] = []
  private isMonitoring = false
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = []

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  start(): void {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.lastTime = performance.now()
    this.frameCount = 0
    this.frameTimeHistory = []
    this.memoryHistory = []
    
    this.monitorLoop()
    console.log('Performance monitoring started')
  }

  stop(): void {
    this.isMonitoring = false
    console.log('Performance monitoring stopped')
  }

  addCallback(callback: (metrics: PerformanceMetrics) => void): void {
    this.callbacks.push(callback)
  }

  removeCallback(callback: (metrics: PerformanceMetrics) => void): void {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  private monitorLoop(): void {
    if (!this.isMonitoring) return

    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime
    
    this.frameCount++
    this.frameTimeHistory.push(deltaTime)
    
    // Keep only last 60 frames
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift()
    }
    
    // Calculate FPS every second
    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime)
      this.frameCount = 0
      this.lastTime = currentTime
      
      // Collect memory info if available
      if ('memory' in performance) {
        const memInfo = (performance as any).memory
        this.memoryHistory.push(memInfo.usedJSHeapSize / 1024 / 1024) // MB
        
        // Keep only last 60 seconds
        if (this.memoryHistory.length > 60) {
          this.memoryHistory.shift()
        }
      }
      
      // Notify callbacks
      const metrics = this.getMetrics()
      this.callbacks.forEach(callback => callback(metrics))
    }
    
    requestAnimationFrame(() => this.monitorLoop())
  }

  getMetrics(): PerformanceMetrics {
    const avgFrameTime = this.frameTimeHistory.length > 0
      ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length
      : 0
    
    const avgMemory = this.memoryHistory.length > 0
      ? this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length
      : 0
    
    return {
      fps: this.fps,
      frameTime: avgFrameTime,
      memoryUsage: avgMemory,
      frameTimeHistory: [...this.frameTimeHistory],
      memoryHistory: [...this.memoryHistory],
      isMonitoring: this.isMonitoring,
    }
  }

  // Device capability detection
  static detectCapabilities(): DeviceCapabilities {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    
    if (!gl) {
      return {
        webgl: false,
        webgl2: false,
        maxTextureSize: 0,
        maxVertexUniforms: 0,
        supportsFloatTextures: false,
        supportsInstancedArrays: false,
        maxAnisotropy: 0,
      }
    }
    
    const webgl2 = !!canvas.getContext('webgl2')
    const instancedArraysExt = gl.getExtension('ANGLE_instanced_arrays')
    const anisotropyExt = gl.getExtension('EXT_texture_filter_anisotropic')
    
    return {
      webgl: true,
      webgl2,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
      supportsFloatTextures: !!gl.getExtension('OES_texture_float'),
      supportsInstancedArrays: !!instancedArraysExt,
      maxAnisotropy: anisotropyExt 
        ? gl.getParameter(anisotropyExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
        : 0,
    }
  }

  // Quality recommendation based on performance
  static recommendQuality(metrics: PerformanceMetrics): QualityLevel {
    if (metrics.fps >= 55) return 'ultra'
    if (metrics.fps >= 45) return 'high'
    if (metrics.fps >= 30) return 'medium'
    return 'low'
  }
}

export interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage: number
  frameTimeHistory: number[]
  memoryHistory: number[]
  isMonitoring: boolean
}

export interface DeviceCapabilities {
  webgl: boolean
  webgl2: boolean
  maxTextureSize: number
  maxVertexUniforms: number
  supportsFloatTextures: boolean
  supportsInstancedArrays: boolean
  maxAnisotropy: number
}

export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra'