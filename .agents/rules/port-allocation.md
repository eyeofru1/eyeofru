# Local Port Allocation Registry Rule

To prevent `EADDRINUSE` port collisions when multiple Antigravity projects are running local development servers simultaneously, agents must adhere to the centralized port registry.

## 1. Port Registry Location
The canonical registry is located at:
`~/.gemini/ports.json` (`C:\Users\forth\.gemini\ports.json`)

## 2. Standard Allocations

| Project | Port | Service |
| :--- | :--- | :--- |
| `friendly-nobel` | 3000 | Web Frontend / Dev Server |
| `lead-command-center` | 3300 | API / Dashboard Server |
| `overwatch` | 4000 | Primary Application Server |
| `quick-hertz` | 5173 | Vite / Media Dev Server |
| `mapgap-pro` | 8080 | Map Application Server |

## 3. Launching Servers
* Before starting a dev server, inspect `~/.gemini/ports.json` for the project's assigned port.
* If a new project is created, check `~/.gemini/ports.json` and pick an unassigned port within the range `3000-8999`, then register it in `ports.json`.
* Always configure the server CLI or `.env` to use the assigned port (e.g. `npm run dev -- --port 4000` or `PORT=4000`).

## 4. Background Server Execution & Crash Isolation (CRITICAL SAFEGUARD)
* **Never Allow Background Daemon Tasks to Terminate Non-Zero (Code 1)**:
  * In the Antigravity environment, when a background daemon task (such as `dev.ps1` or `npm run dev`) terminates with exit code 1, the Windows process pipe break causes the Antigravity Language Server engine (`language_server.exe`) to crash (`exited with code 0`). This triggers full-window UI reloads, severs active agent connections, and resets quota tracking.
* **Error Trapping in Dev Scripts**:
  * Development scripts (e.g., `dev.ps1`) must set `$ErrorActionPreference = "Continue"` and wrap executions in `try/catch/finally` blocks.
  * The `finally` block must explicitly invoke `exit 0` upon cleanup to guarantee clean status reporting back to the Antigravity task runner.
* **Resilient Process Supervision**:
  * When running multi-tier apps (e.g. Next.js + FastAPI), scripts must handle child process restarts gracefully without bubbling termination errors up to the parent shell.

