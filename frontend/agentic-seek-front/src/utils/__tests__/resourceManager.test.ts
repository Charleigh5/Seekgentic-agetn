import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ResourceManager } from '../resourceManager'

// Mock Three.js objects
class MockMaterial {
  dispose = vi.fn()
}

class MockGeometry {
  dispose = vi.fn()
}

class MockTexture {
  dispose = vi.fn()
}

class MockMesh {
  geometry = new MockGeometry()
  material = new MockMaterial()
  parent = null
  type = 'Mesh'
  dispose = vi.fn()
  
  traverse = vi.fn((callback) => {
    callback(this)
  })
}

describe('ResourceManager', () => {
  let resourceManager: ResourceManager

  beforeEach(() => {
    // Reset singleton instance
    ;(ResourceManager as any).instance = undefined
    resourceManager = ResourceManager.getInstance()
  })

  it('should be a singleton', () => {
    const instance1 = ResourceManager.getInstance()
    const instance2 = ResourceManager.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('should register and retrieve resources', () => {
    const resource = { name: 'test-resource' }
    resourceManager.register('test-id', resource)
    
    const retrieved = resourceManager.get('test-id')
    expect(retrieved).toBe(resource)
  })

  it('should dispose individual resources', () => {
    const material = new MockMaterial()
    resourceManager.register('material-id', material)
    
    resourceManager.dispose('material-id')
    
    expect(material.dispose).toHaveBeenCalled()
    expect(resourceManager.get('material-id')).toBeUndefined()
  })

  it('should dispose mesh resources properly', () => {
    const mesh = new MockMesh()
    resourceManager.register('mesh-id', mesh)
    
    resourceManager.dispose('mesh-id')
    
    expect(mesh.geometry.dispose).toHaveBeenCalled()
    expect(mesh.material.dispose).toHaveBeenCalled()
  })

  it('should dispose all resources', () => {
    const material1 = new MockMaterial()
    const material2 = new MockMaterial()
    const geometry = new MockGeometry()
    
    resourceManager.register('mat1', material1)
    resourceManager.register('mat2', material2)
    resourceManager.register('geo1', geometry)
    
    resourceManager.disposeAll()
    
    expect(material1.dispose).toHaveBeenCalled()
    expect(material2.dispose).toHaveBeenCalled()
    expect(geometry.dispose).toHaveBeenCalled()
    
    expect(resourceManager.get('mat1')).toBeUndefined()
    expect(resourceManager.get('mat2')).toBeUndefined()
    expect(resourceManager.get('geo1')).toBeUndefined()
  })

  it('should provide accurate stats', () => {
    const material = new MockMaterial()
    const nonDisposable = { name: 'test' }
    
    resourceManager.register('mat', material)
    resourceManager.register('obj', nonDisposable)
    
    const stats = resourceManager.getStats()
    expect(stats.totalResources).toBe(2)
    expect(stats.disposableResources).toBe(1)
  })

  it('should handle disposal errors gracefully', () => {
    const faultyResource = {
      dispose: vi.fn(() => {
        throw new Error('Disposal failed')
      })
    }
    
    resourceManager.register('faulty', faultyResource)
    
    // Should not throw
    expect(() => resourceManager.dispose('faulty')).not.toThrow()
    expect(faultyResource.dispose).toHaveBeenCalled()
  })

  it('should handle mesh with array materials', () => {
    const material1 = new MockMaterial()
    const material2 = new MockMaterial()
    const mesh = new MockMesh()
    mesh.material = [material1, material2] as any
    
    resourceManager.register('multi-mat-mesh', mesh)
    resourceManager.dispose('multi-mat-mesh')
    
    expect(material1.dispose).toHaveBeenCalled()
    expect(material2.dispose).toHaveBeenCalled()
  })
})