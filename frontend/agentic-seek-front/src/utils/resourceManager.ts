import { Object3D, Material, Geometry, Texture, BufferGeometry } from 'three'

export class ResourceManager {
  private static instance: ResourceManager
  private resources: Map<string, any> = new Map()
  private disposables: Set<any> = new Set()

  static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager()
    }
    return ResourceManager.instance
  }

  // Register a resource for tracking
  register(id: string, resource: any): void {
    this.resources.set(id, resource)
    
    // Track disposable resources
    if (this.isDisposable(resource)) {
      this.disposables.add(resource)
    }
  }

  // Get a registered resource
  get(id: string): any {
    return this.resources.get(id)
  }

  // Unregister and dispose a resource
  dispose(id: string): void {
    const resource = this.resources.get(id)
    if (resource) {
      this.disposeResource(resource)
      this.resources.delete(id)
      this.disposables.delete(resource)
    }
  }

  // Dispose all resources
  disposeAll(): void {
    for (const resource of this.disposables) {
      this.disposeResource(resource)
    }
    this.resources.clear()
    this.disposables.clear()
  }

  // Check if a resource is disposable
  private isDisposable(resource: any): boolean {
    return (
      (resource && typeof resource.dispose === 'function') ||
      (resource && resource.isMaterial) ||
      (resource && resource.isGeometry) ||
      (resource && resource.isBufferGeometry) ||
      (resource && resource.isTexture)
    )
  }

  // Dispose a single resource
  private disposeResource(resource: any): void {
    try {
      if (resource instanceof Object3D) {
        // Dispose object3D and its children
        resource.traverse((child) => {
          if (child.type === 'Mesh') {
            const mesh = child as any
            if (mesh.geometry) mesh.geometry.dispose()
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat: Material) => mat.dispose())
              } else {
                mesh.material.dispose()
              }
            }
          }
        })
        
        // Remove from parent
        if (resource.parent) {
          resource.parent.remove(resource)
        }
      } else if (this.isDisposable(resource)) {
        resource.dispose()
      }
    } catch (error) {
      console.warn('Error disposing resource:', error)
    }
  }

  // Get memory usage statistics
  getStats(): { totalResources: number; disposableResources: number } {
    return {
      totalResources: this.resources.size,
      disposableResources: this.disposables.size,
    }
  }
}

// Hook for managing component resources
export const useResourceManager = () => {
  const manager = ResourceManager.getInstance()
  
  const registerResource = (id: string, resource: any) => {
    manager.register(id, resource)
  }
  
  const disposeResource = (id: string) => {
    manager.dispose(id)
  }
  
  const getResource = (id: string) => {
    return manager.get(id)
  }
  
  return {
    registerResource,
    disposeResource,
    getResource,
    manager,
  }
}