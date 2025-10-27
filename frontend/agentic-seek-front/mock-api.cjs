// Simple mock API server for development
const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

// Mock agent data
let currentAgent = 'casual';
let agentStatus = 'idle';
let taskProgress = 0;

const agents = ['casual', 'coder', 'file', 'browser', 'planner'];
const statuses = ['idle', 'processing', 'error', 'offline'];

// Simulate agent activity
setInterval(() => {
  // Randomly change agent and status
  if (Math.random() > 0.7) {
    currentAgent = agents[Math.floor(Math.random() * agents.length)];
    agentStatus = statuses[Math.floor(Math.random() * statuses.length)];
    taskProgress = Math.floor(Math.random() * 100);
  }
}, 3000);

// Mock endpoints
app.get('/latest_answer', (req, res) => {
  const responses = [
    'Analyzing code structure and dependencies...',
    'Searching for relevant files in the project...',
    'Processing user request and generating response...',
    'Coordinating with other agents for optimal solution...',
    'Executing file operations and validating results...',
    'Browsing documentation for latest information...',
    'Planning next steps in the workflow...'
  ];
  
  const blocks = {
    'block1': {
      tool_type: 'code_execution',
      block: 'console.log("Processing agent constellation...");',
      feedback: 'Code executed successfully',
      success: true
    },
    'block2': {
      tool_type: 'file_read',
      block: 'Reading agent configuration files...',
      feedback: 'Files loaded successfully',
      success: true
    }
  };

  const reasoningExamples = [
    `First, I need to analyze the user's request carefully to understand the context and requirements. This involves breaking down the problem into smaller, manageable components. Then, I should consider multiple approaches to solve the problem effectively, weighing the pros and cons of each option. After thorough evaluation, I will choose the most appropriate solution based on the established criteria. Finally, I will implement the chosen approach systematically and verify the results to ensure quality.`,
    
    `I begin by examining the current codebase structure to identify potential areas for improvement. The analysis reveals several optimization opportunities in the data processing pipeline. Based on this assessment, I decide to refactor the core algorithms for better performance. The implementation will involve updating the existing functions while maintaining backward compatibility. Upon reflection, this approach should significantly improve system efficiency.`,
    
    `The user's query requires coordination between multiple system components. I start by determining which agents are best suited for different aspects of the task. The file agent can handle data retrieval, while the coder agent manages implementation details. This collaborative approach ensures comprehensive coverage of all requirements. The final solution integrates outputs from all participating agents seamlessly.`,
    
    `To address this complex problem, I must first gather all relevant information from available sources. The research phase reveals important constraints that will influence the solution design. I then formulate a strategic plan that accounts for these limitations while maximizing effectiveness. The execution phase involves careful monitoring and adjustment as needed. This methodical approach ensures robust and reliable results.`
  ];
  
  res.json({
    agent_name: currentAgent,
    status: agentStatus,
    answer: responses[Math.floor(Math.random() * responses.length)],
    reasoning: reasoningExamples[Math.floor(Math.random() * reasoningExamples.length)],
    done: taskProgress > 90,
    blocks: Math.random() > 0.5 ? blocks : undefined,
    uid: `task-${Date.now()}`
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    agents: agents.map(type => ({
      id: `agent-${type}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Agent`,
      type: type,
      status: type === currentAgent ? agentStatus : 'idle',
      performance: {
        responseTime: Math.random() * 1000 + 200,
        successRate: Math.random() * 0.2 + 0.8,
        memoryUsage: Math.random() * 100 + 50,
        cpuUsage: Math.random() * 0.3 + 0.1
      }
    })),
    performance: {
      responseTime: Math.random() * 500 + 100,
      successRate: 0.95,
      memoryUsage: 150.5,
      cpuUsage: 0.25
    }
  });
});

app.post('/query', (req, res) => {
  const { query } = req.body;
  
  // Simulate processing
  setTimeout(() => {
    res.json({
      answer: `Processing your query: "${query}". The agent constellation is analyzing this request...`,
      agent_name: currentAgent,
      status: 'processing',
      uid: `query-${Date.now()}`,
      done: false
    });
  }, 1000);
});

app.get('/stop', (req, res) => {
  agentStatus = 'idle';
  res.json({ message: 'Processing stopped' });
});

app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
  console.log('Endpoints:');
  console.log('  GET  /latest_answer - Get current agent status');
  console.log('  GET  /health - Get system health');
  console.log('  POST /query - Send a query');
  console.log('  GET  /stop - Stop processing');
});