import React from 'react'
import { Html } from '@react-three/drei'
import type { AgentState } from '@/types'

interface AgentInfoPanelProps {
  agent: AgentState
  position: [number, number, number]
  visible: boolean
}

export const AgentInfoPanel: React.FC<AgentInfoPanelProps> = ({ 
  agent, 
  position, 
  visible 
}) => {
  if (!visible) return null
  
  const formatCapabilities = (capabilities: typeof agent.capabilities) => {
    return capabilities
      .filter(cap => cap.enabled)
      .map(cap => cap.name)
      .join(', ')
  }
  
  const getStatusDescription = (status: typeof agent.status) => {
    switch (status) {
      case 'idle':
        return 'Ready to assist'
      case 'processing':
        return 'Currently working...'
      case 'error':
        return 'Encountered an error'
      case 'offline':
        return 'Currently offline'
      default:
        return 'Unknown status'
    }
  }
  
  return (
    <Html
      position={position}
      distanceFactor={10}
      occlude
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div className="agent-info-panel">
        <div className="agent-info-header">
          <h3>{agent.name}</h3>
          <span className={`status-badge status-${agent.status}`}>
            {agent.status}
          </span>
        </div>
        
        <div className="agent-info-content">
          <div className="info-row">
            <span className="label">Type:</span>
            <span className="value">{agent.type}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Status:</span>
            <span className="value">{getStatusDescription(agent.status)}</span>
          </div>
          
          {agent.currentTask && (
            <div className="info-row">
              <span className="label">Current Task:</span>
              <span className="value">{agent.currentTask.description}</span>
            </div>
          )}
          
          <div className="info-row">
            <span className="label">Capabilities:</span>
            <span className="value">
              {formatCapabilities(agent.capabilities) || 'None active'}
            </span>
          </div>
          
          <div className="performance-metrics">
            <h4>Performance</h4>
            <div className="metrics-grid">
              <div className="metric">
                <span className="metric-label">Response Time</span>
                <span className="metric-value">{agent.performance.responseTime}ms</span>
              </div>
              <div className="metric">
                <span className="metric-label">Success Rate</span>
                <span className="metric-value">{(agent.performance.successRate * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Memory</span>
                <span className="metric-value">{agent.performance.memoryUsage.toFixed(1)}MB</span>
              </div>
              <div className="metric">
                <span className="metric-label">CPU</span>
                <span className="metric-value">{(agent.performance.cpuUsage * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Html>
  )
}