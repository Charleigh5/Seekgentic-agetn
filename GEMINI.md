# Gemini Agent Instructions

## 1. Project Overview & Purpose
- **Primary Goal**: This project is a local agentic AI platform designed for autonomous coding, web browsing, and task orchestration. The goal is to create a system where AI agents can intelligently select and execute tasks based on user prompts.
- **Business Domain**: AI Automation, Code Assistance, Autonomous Agents.

## 2. Core Technologies & Stack
- **Languages**: Python 3.10+, TypeScript (React)
- **Frameworks**: FastAPI (backend), React (frontend)
- **Databases**: SQLite (default for local), Redis (optional for caching)
- **Key Libraries**: Selenium, SQLAlchemy, aiohttp
- **Package Manager(s)**: pip, npm

## 3. Architectural Patterns
- **Overall Architecture**: The system is a modular, multi-agent architecture. A central router delegates tasks to specialized agents (e.g., coding agent, web agent). The backend is a monolithic Python application with service layers, and the frontend is a React single-page application.
- **Directory Structure Philosophy**:
    - `/api.py`: Main FastAPI application entrypoint.
    - `/sources/agents`: Contains the core logic for each specialized agent.
    - `/sources/tools`: Defines the tools available to the agents (e.g., file system access, web search).
    - `/frontend/agentic-seek-front`: The React frontend application.
    - `/tests`: Contains all project tests.
    - `/prompts`: Contains the system prompts for the different agents.

## 4. Coding Conventions & Style Guide
- **Formatting**: PEP 8 for Python (using Black), Prettier for TypeScript/JavaScript.
- **Naming Conventions**: `snake_case` for Python variables and functions, `PascalCase` for Python classes. `camelCase` for TypeScript variables and functions, `PascalCase` for components and types.
- **API Design**: RESTful API. Requests and responses follow a standardized JSON format.
- **Error Handling**: Use custom exceptions for specific error cases. Log errors to the console and/or a log file.

## 5. Key Files & Entrypoints
- **Main Entrypoint(s)**: `api.py` for the backend, `frontend/agentic-seek-front/src/index.js` for the frontend.
- **Configuration Files**: `.env`, `config.json` (for the LLM router), `pyproject.toml`.
- **CI/CD Pipeline**: `.github/workflows` (not yet implemented).

## 6. Development & Testing Workflow
- **Local Setup**: Run `install.bat` or `install.sh` to set up the environment. Use `start_services.cmd` or `start_services.sh` to start the backend and frontend servers.
- **Testing**: Run `pytest` in the root directory to execute backend tests. Run `npm test` in `frontend/agentic-seek-front` to run frontend tests.

## 7. Specific Instructions for AI Collaboration
- **Contribution Guidelines**: Follow the merge process outlined in `CONTRIBUTING.md`. All pull requests require at least one review.
- **Security**: Do not hardcode secrets. Use environment variables. All authentication logic should be carefully reviewed.
- **Dependencies**: Run `pip install -r requirements.txt` and `npm install` after pulling changes.
- **Commit Messages**: Use Conventional Commits (e.g., `feat:`, `fix:`, `docs:`).

## 8. Gemini-Specific Guidance / Hooks
- **Agent Roles**: The Gemini agent should automatically select capabilities based on the task type (e.g., use the code agent for coding tasks, the browser agent for web tasks).
- **Extension Points**: New agents can be added in the `/sources/agents` directory. New tools can be added in the `/sources/tools` directory.
- **Context Handling**: The system should maintain context by logging system state, previous session data, and workspace changes.
- **Configurability**: Agent settings can be configured in `.codex/settings/kiroCodex-settings.json`.

## 9. Other Useful Practices
- **Documentation Sources**: Refer to the `README.md` and the files in the `docs` directory.
- **Tooling Recommendations**: Use `uv run` for python scripts, and `npm` for frontend tasks.
- **Warning/Fail-Safe**: The agent should always output its uncertainty/confidence in generated code when the context is weak or ambiguous.