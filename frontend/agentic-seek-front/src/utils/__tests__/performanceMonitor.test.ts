import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { PerformanceMonitor } from '../performanceMonitor'

describe('PerformanceMonitor', () => {
    let performanceMonitor: PerformanceMonitor
    let mockPerformanceNow: ReturnType<typeof vi.fn>
    let mockRequestAnimationFrame: ReturnType<typeof vi.fn>

    beforeEach(() => {
        // Reset singleton instance
        ; (PerformanceMonitor as any).instance = undefined
        performanceMonitor = PerformanceMonitor.getInstance()

        // Mock performance.now
        mockPerformanceNow = vi.fn()
        vi.stubGlobal('performance', {
            ...performance,
            now: mockPerformanceNow,
            memory: {
                usedJSHeapSize: 50 * 1024 * 1024,
                totalJSHeapSize: 100 * 1024 * 1024,
                jsHeapSizeLimit: 2 * 1024 * 1024 * 1024,
            },
        })

        // Mock requestAnimationFrame
        mockRequestAnimationFrame = vi.fn()
        vi.stubGlobal('requestAnimationFrame', mockRequestAnimationFrame)
    })

    afterEach(() => {
        performanceMonitor.stop()
        vi.unstubAllGlobals()
    })

    it('should be a singleton', () => {
        const instance1 = PerformanceMonitor.getInstance()
        const instance2 = PerformanceMonitor.getInstance()
        expect(instance1).toBe(instance2)
    })

    it('should start monitoring', () => {
        mockPerformanceNow.mockReturnValue(1000)

        performanceMonitor.start()

        expect(mockPerformanceNow).toHaveBeenCalled()
        expect(mockRequestAnimationFrame).toHaveBeenCalled()
    })

    it('should stop monitoring', () => {
        performanceMonitor.start()
        performanceMonitor.stop()

        const metrics = performanceMonitor.getMetrics()
        expect(metrics.isMonitoring).toBe(false)
    })

    it('should not start monitoring twice', () => {
        performanceMonitor.start()
        const firstCallCount = mockRequestAnimationFrame.mock.calls.length

        performanceMonitor.start()
        const secondCallCount = mockRequestAnimationFrame.mock.calls.length

        expect(secondCallCount).toBe(firstCallCount)
    })

    it('should add and remove callbacks', () => {
        const callback1 = vi.fn()
        const callback2 = vi.fn()

        performanceMonitor.addCallback(callback1)
        performanceMonitor.addCallback(callback2)

        performanceMonitor.removeCallback(callback1)

        // Simulate metrics update (would normally happen in monitoring loop)
        const metrics = performanceMonitor.getMetrics()
        expect(callback1).not.toHaveBeenCalled()
    })

    it('should provide initial metrics', () => {
        const metrics = performanceMonitor.getMetrics()

        expect(metrics).toHaveProperty('fps')
        expect(metrics).toHaveProperty('frameTime')
        expect(metrics).toHaveProperty('memoryUsage')
        expect(metrics).toHaveProperty('frameTimeHistory')
        expect(metrics).toHaveProperty('memoryHistory')
        expect(metrics).toHaveProperty('isMonitoring')

        expect(Array.isArray(metrics.frameTimeHistory)).toBe(true)
        expect(Array.isArray(metrics.memoryHistory)).toBe(true)
    })

    it('should detect device capabilities', () => {
        const capabilities = PerformanceMonitor.detectCapabilities()

        expect(capabilities).toHaveProperty('webgl')
        expect(capabilities).toHaveProperty('webgl2')
        expect(capabilities).toHaveProperty('maxTextureSize')
        expect(capabilities).toHaveProperty('maxVertexUniforms')
        expect(capabilities).toHaveProperty('supportsFloatTextures')
        expect(capabilities).toHaveProperty('supportsInstancedArrays')
        expect(capabilities).toHaveProperty('maxAnisotropy')
    })

    it('should recommend quality based on FPS', () => {
        const highFpsMetrics = { fps: 60 } as any
        const mediumFpsMetrics = { fps: 40 } as any
        const lowFpsMetrics = { fps: 25 } as any

        expect(PerformanceMonitor.recommendQuality(highFpsMetrics)).toBe('ultra')
        expect(PerformanceMonitor.recommendQuality(mediumFpsMetrics)).toBe('medium')
        expect(PerformanceMonitor.recommendQuality(lowFpsMetrics)).toBe('low')
    })

    it('should handle missing WebGL context gracefully', () => {
        // Mock canvas.getContext to return null
        const originalCreateElement = document.createElement
        vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
            if (tagName === 'canvas') {
                const canvas = originalCreateElement.call(document, tagName)
                vi.spyOn(canvas, 'getContext').mockReturnValue(null)
                return canvas
            }
            return originalCreateElement.call(document, tagName)
        })

        const capabilities = PerformanceMonitor.detectCapabilities()

        expect(capabilities.webgl).toBe(false)
        expect(capabilities.webgl2).toBe(false)
        expect(capabilities.maxTextureSize).toBe(0)
    })
})