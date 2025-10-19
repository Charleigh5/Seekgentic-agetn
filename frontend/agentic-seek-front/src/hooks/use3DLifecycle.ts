import { useEffect, useRef } from 'react'
import { useResourceManager } from '@/utils/resourceManager'

interface Use3DLifecycleOptions {
  componentId: string
  onMount?: () => void
  onUnmount?: () => void
  resources?: any[]
}

export const use3DLifecycle = ({
  componentId,
  onMount,
  onUnmount,
  resources = [],
}: Use3DLifecycleOptions) => {
  const { registerResource, disposeResource, manager } = useResourceManager()
  const mountedRef = useRef(false)
  const resourceIdsRef = useRef<string[]>([])

  // Register resources when they change
  useEffect(() => {
    resources.forEach((resource, index) => {
      if (resource) {
        const resourceId = `${componentId}-resource-${index}`
        registerResource(resourceId, resource)
        resourceIdsRef.current.push(resourceId)
      }
    })

    return () => {
      // Cleanup resources when they change
      resourceIdsRef.current.forEach(id => {
        disposeResource(id)
      })
      resourceIdsRef.current = []
    }
  }, [resources, componentId, registerResource, disposeResource])

  // Handle component mount/unmount
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      onMount?.()
      
      console.log(`3D Component ${componentId} mounted`)
    }

    return () => {
      // Cleanup on unmount
      resourceIdsRef.current.forEach(id => {
        disposeResource(id)
      })
      resourceIdsRef.current = []
      
      onUnmount?.()
      mountedRef.current = false
      
      console.log(`3D Component ${componentId} unmounted`)
    }
  }, [componentId, onMount, onUnmount, disposeResource])

  return {
    isMounted: mountedRef.current,
    registerResource: (resource: any, suffix = '') => {
      const resourceId = `${componentId}-${suffix}-${Date.now()}`
      registerResource(resourceId, resource)
      resourceIdsRef.current.push(resourceId)
      return resourceId
    },
    disposeResource,
    getStats: () => manager.getStats(),
  }
}