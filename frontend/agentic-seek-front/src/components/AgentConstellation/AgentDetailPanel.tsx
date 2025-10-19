import React, { useState } from 'react'
import { Html } from '@react-three/drei'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import type { AgentState, Block } from '@/types'

interface AgentDetailPanelProps {
  agent: AgentState
  position: [number, number, number]
  visible: boolean
  onClose: () => void
}

export const AgentDetailPanel: React.FC<AgentDetailPanelProps> = ({ 
  agent, 
  position, 
  visible,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'reasoning' | 'tools'>('overview')
  const { responseData } = useSelector((state: RootState) => state.app)
  
  if (!visible) return null
  
  const formatUptime = (startTime?: Date) => {
    if (!startTime) return 'N/A'
    const now = new Date()
    const diff = now.getTime() - startTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }
  
  const getRecentBlocks = (): Block[] => {
    if (!responseData?.blocks) return []
    return Object.values(responseData.blocks).slice(-5) // Last 5 blocks
  }
  
  const renderOverviewTab = () => (
    <div className="tab-content">
      <div className="agent-overview">
        <div className="overview-header">
          <div className="agent-avatar">
            <div className={`avatar-icon avatar-${agent.type}`}>
              {agent.name.charAt(0)}
            </div>
          </div>
          <div className="agent-basic-info">
            <h2>{agent.name}</h2>
            <p className="agent-type">{agent.type.charAt(0).toUpperCase() + agent.type.slice(1)} Agent</p>
            <div className={`status-indicator status-${agent.status}`}>
              <span className="status-dot"></span>
              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            </div>
          </div>
        </div>
        
        <div className="capabilities-section">
          <h3>Capabilities</h3>
          <div className="capabilities-grid">
            {agent.capabilities.map(capability => (
              <div 
                key={capability.id} 
                className={`capability-card ${capability.enabled ? 'enabled' : 'disabled'}`}
              >
                <div className="capability-header">
                  <span className="capability-name">{capability.name}</span>
                  <span className={`capability-status ${capability.enabled ? 'enabled' : 'disabled'}`}>
                    {capability.enabled ? '●' : '○'}
                  </span>
                </div>
                <p className="capability-description">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {agent.currentTask && (
          <div className="current-task-section">
            <h3>Current Task</h3>
            <div className="task-card">
              <div className="task-description">{agent.currentTask.description}</div>
              <div className="task-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${agent.currentTask.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{agent.currentTask.progress}%</span>
              </div>
              <div className="task-time">
                Started: {formatUptime(agent.currentTask.startTime)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
  
  const renderPerformanceTab = () => (
    <div className="tab-content">
      <div className="performance-dashboard">
        <div className="metrics-overview">
          <div className="metric-card">
            <div className="metric-icon">⚡</div>
            <div className="metric-info">
              <div className="metric-value">{agent.performance.responseTime.toFixed(0)}ms</div>
              <div className="metric-label">Response Time</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">✓</div>
            <div className="metric-info">
              <div className="metric-value">{(agent.performance.successRate * 100).toFixed(1)}%</div>
              <div className="metric-label">Success Rate</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">💾</div>
            <div className="metric-info">
              <div className="metric-value">{agent.performance.memoryUsage.toFixed(1)}MB</div>
              <div className="metric-label">Memory Usage</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">🔥</div>
            <div className="metric-info">
              <div className="metric-value">{(agent.performance.cpuUsage * 100).toFixed(1)}%</div>
              <div className="metric-label">CPU Usage</div>
            </div>
          </div>
        </div>
        
        <div className="performance-charts">
          <div className="chart-placeholder">
            <h4>Performance Trends</h4>
            <p>Real-time performance monitoring visualization would go here</p>
          </div>
        </div>
      </div>
    </div>
  )
  
  const renderReasoningTab = () => (
    <div className="tab-content">
      <div className="reasoning-display">
        <h3>Latest Reasoning</h3>
        {responseData?.answer && responseData.agent_name === agent.name.toLowerCase().replace(' agent', '') ? (
          <div className="reasoning-content">
            <div className="reasoning-answer">
              <h4>Response</h4>
              <p>{responseData.answer}</p>
            </div>
            {responseData.reasoning && (
              <div className="reasoning-process">
                <h4>Reasoning Process</h4>
                <pre className="reasoning-text">{responseData.reasoning}</pre>
              </div>
            )}
          </div>
        ) : (
          <div className="no-reasoning">
            <p>No recent reasoning data available for this agent.</p>
          </div>
        )}
      </div>
    </div>
  )
  
  const renderToolsTab = () => {
    const recentBlocks = getRecentBlocks()
    
    return (
      <div className="tab-content">
        <div className="tools-usage">
          <h3>Recent Tool Usage</h3>
          {recentBlocks.length > 0 ? (
            <div className="blocks-list">
              {recentBlocks.map((block, index) => (
                <div key={index} className={`block-card ${block.success ? 'success' : 'error'}`}>
                  <div className="block-header">
                    <span className="tool-type">{block.tool_type}</span>
                    <span className={`block-status ${block.success ? 'success' : 'error'}`}>
                      {block.success ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="block-content">
                    <pre>{block.block}</pre>
                  </div>
                  {block.feedback && (
                    <div className="block-feedback">
                      <strong>Feedback:</strong> {block.feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tools">
              <p>No recent tool usage data available.</p>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <Html
      position={position}
      distanceFactor={15}
      occlude
      style={{
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      <div className="agent-detail-panel">
        <div className="panel-header">
          <h2>Agent Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="panel-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button 
            className={`tab-button ${activeTab === 'reasoning' ? 'active' : ''}`}
            onClick={() => setActiveTab('reasoning')}
          >
            Reasoning
          </button>
          <button 
            className={`tab-button ${activeTab === 'tools' ? 'active' : ''}`}
            onClick={() => setActiveTab('tools')}
          >
            Tools
          </button>
        </div>
        
        <div className="panel-content">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'performance' && renderPerformanceTab()}
          {activeTab === 'reasoning' && renderReasoningTab()}
          {activeTab === 'tools' && renderToolsTab()}
        </div>
      </div>
    </Html>
  )
}