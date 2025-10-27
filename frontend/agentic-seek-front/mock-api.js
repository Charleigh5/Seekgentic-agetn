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

  res.json({
    agent_name: currentAgent,
    status: agentStatus,
    answer: responses[Math.floor(Math.random() * responses.length)],
    reasoning: `The ${currentAgent} agent is currently ${agentStatus} and working on task completion (${taskProgress}% done). This involves coordinating with other agents in the constellation to provide the best possible response.`,
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