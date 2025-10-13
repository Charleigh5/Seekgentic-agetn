# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

AgenticSeek is a private, local alternative to Manus AI - a voice-enabled AI assistant that autonomously browses the web, writes code, and plans tasks while keeping all data on the user's device. The system uses an agent-based architecture with intelligent routing to select the best agent for each task.

## Common Development Commands

### Installation and Setup
```bash
# Install dependencies (host environment for CLI)
./install.sh                    # Linux/macOS
install.bat                    # Windows

# Copy environment template
mv .env.example .env

# Download LLM router model
cd llm_router && ./dl_safetensors.sh
```

### Running the Application
```bash
# Full deployment (web interface + backend)
./start_services.sh full       # Linux/macOS
start_services.cmd full        # Windows

# Core deployment (web interface only, CLI backend on host)
./start_services.sh            # Linux/macOS  
start_services.cmd            # Windows

# CLI mode (after host installation)
uv run cli.py                 # Using uv (recommended)
python cli.py                 # Direct Python execution
```

### Development and Testing
```bash
# Run backend API directly
python api.py

# Build frontend (in frontend/ directory)
npm install
npm start
npm run build

# Docker operations
docker compose logs backend    # View backend logs
docker compose down           # Stop all services
docker ps                    # Check running containers
```

## High-Level Architecture

### Agent System
AgenticSeek uses a multi-agent architecture with intelligent routing:

- **Agent Router** (`sources/router.py`): Uses ML classification to select the best agent based on query complexity and type
- **Agent Base Class** (`sources/agents/agent.py`): Abstract base for all agents with memory, LLM integration, and tool execution
- **Specialized Agents**:
  - `CasualAgent`: Handles conversational queries
  - `CoderAgent`: Writes, debugs, and executes code in multiple languages
  - `FileAgent`: Manages file operations and searches
  - `BrowserAgent`: Performs autonomous web browsing and form filling
  - `PlannerAgent`: Handles complex multi-step task planning
  - `McpAgent`: Integrates with MCP (Model Context Protocol) services

### Core Components
- **Interaction System** (`sources/interaction.py`): Manages user input/output, TTS/STT, and agent coordination
- **LLM Provider** (`sources/llm_provider.py`): Abstracts different LLM backends (Ollama, OpenAI, etc.)
- **Browser Engine** (`sources/browser.py`): Selenium-based web automation with stealth capabilities
- **Memory System** (`sources/memory.py`): Persistent conversation history per agent
- **Tool System** (`sources/tools/`): Modular execution environments for different programming languages

### Deployment Architecture
- **Frontend**: React application served on port 3000
- **Backend**: FastAPI server on port 7777 with async processing
- **Search Engine**: SearxNG instance on port 8080 for web searches
- **Redis**: Session storage and task queuing
- **Docker**: Containerized deployment with host filesystem mounting

### Configuration System
- **Environment Variables** (`.env`): API keys, directories, service ports
- **Config File** (`config.ini`): Agent behavior, LLM settings, browser configuration
- **Prompt Templates** (`prompts/base/` and `prompts/jarvis/`): Agent personality and behavior definitions

### Tool Integration
Tools are modular components that agents can execute:
- Language interpreters (Python, Go, Java, C, Bash)
- File operations and search
- Web search via SearxNG
- Safety checks and validation
- Flight search and other specialized APIs

## Key Development Patterns

### Agent Implementation
New agents should inherit from the `Agent` base class and implement:
- `process()`: Main agent logic with LLM interaction
- Tool registration and execution
- Memory management for conversation history

### Tool Development  
Tools follow the abstract `Tools` class pattern:
- `execute()`: Core functionality implementation  
- `execution_failure_check()`: Error detection
- `interpreter_feedback()`: Result processing for AI

### LLM Integration
The system supports multiple LLM providers through a unified interface:
- Local: Ollama, LM-Studio, OpenAI-compatible servers
- Cloud: OpenAI, Google, Deepseek, HuggingFace, TogetherAI
- Custom: Self-hosted LLM server component

### Configuration Priority
Settings are resolved in this order:
1. Environment variables (`.env`)
2. Config file (`config.ini`) 
3. Default values

## Architecture Notes

- The system uses async/await patterns for LLM interactions to prevent blocking
- Agent routing uses both traditional ML classification and few-shot learning
- Browser automation supports both headless and stealth modes
- Memory is agent-specific and persists across sessions when configured
- The work directory is mounted between host and containers for file operations
- ChromeDriver compatibility is critical - version must match Chrome browser version

## Docker Considerations

- Backend automatically detects Docker environment and forces headless browser mode
- Host filesystem is mounted to `/opt/workspace` in containers
- Environment variables are passed through docker-compose
- Services communicate via internal Docker network `agentic-seek-net`