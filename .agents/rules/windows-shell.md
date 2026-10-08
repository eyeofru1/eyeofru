# Windows PowerShell Command Execution Guidelines

This environment runs on **Windows** using **PowerShell**. All agents MUST adhere to native PowerShell syntax to avoid command errors, hanging processes, or file corruption.

## 1. Native PowerShell Equivalents (STRICT)

Agents must **never** run Linux/bash commands that do not exist natively on Windows.

| Bash Command (PROHIBITED) | PowerShell Replacement (REQUIRED) | Notes |
| :--- | :--- | :--- |
| `rm -rf <path>` | `Remove-Item -Recurse -Force <path>` | Safe directory/file removal |
| `touch <file>` | `New-Item -ItemType File -Force <file>` | Creates empty file or touches |
| `mkdir -p <dir>` | `New-Item -ItemType Directory -Force <dir>` | Creates nested folders |
| `export VAR=val` | `$env:VAR = "val"` | Sets process environment variable |
| `cat <file>` | `Get-Content <file>` | Use `view_file` tool over terminal reads |
| `grep <pattern> <file>` | `Select-String -Path <file> -Pattern <pattern>` | Native string match |
| `ls -la` | `Get-ChildItem -Force` | Lists files including hidden |
| `which <cmd>` | `Get-Command <cmd>` | Resolves command path |
| `pkill <process>` | `Stop-Process -Name <process> -Force` | Terminate process by name |

## 2. File Encoding Rule
PowerShell 5.1 defaults to UTF-16 when using `>` or `Out-File`. Whenever creating or modifying files via shell:
* Always specify `-Encoding UTF8`:
  ```powershell
  Set-Content -Path $path -Value $text -Encoding UTF8
  Add-Content -Path $path -Value $text -Encoding UTF8
  ```

## 3. Path Formats
* Use standard Windows backslashes `\` or forward slashes `/` consistently.
* When specifying file paths in strings with spaces, always wrap in double quotes `"$path"`.

## 4. Filesystem Traversal & Search Boundaries (CRITICAL SAFEGUARD)
* **Never Run Drive-Wide or Unbounded Recursive Searches**:
  * **Strictly Prohibited**: `Get-ChildItem -Path "$HOME" -Recurse`, `Get-ChildItem -Path "C:\" -Recurse`, `Get-ChildItem -Path "C:\Users\..." -Recurse`, `dir /s C:\`, or `Select-String -Path "$HOME\..." -Recurse`.
  * **Impact**: Unbounded searches across Windows user profiles traverse massive directories (`AppData`, `node_modules`, leveldb caches, virtual environments), exhausting pipe buffers and crashing the Antigravity Language Server engine (`Language server crashed: exited with code 0`). This triggers full-window UI reloads, severs active agent connections, and aborts in-flight tasks machine-wide.
* **Workspace Scoping**:
  * Always constrain recursive searches (`Get-ChildItem -Recurse` or `Select-String`) strictly to the active workspace directory (`.` or `$PWD`).
* **Locating Files Outside Current Workspace**:
  * Never scan root folders. If a file cannot be found in the current workspace, stop and prompt the user for the file path, or search only tightly targeted directories with explicit depth limits (e.g., `Get-ChildItem -Path <dir> -Depth 1`).

## 5. Background Process Resilience & Clean Exit 0 (CRITICAL SAFEGUARD)
* **Never Allow Daemon Background Tasks to Exit Non-Zero (Code 1)**:
  * In Antigravity on Windows, when a background daemon task terminates with exit code 1, the broken pipe signal causes `language_server.exe` to crash (`exited with code 0`).
  * This forces Electron into an auto-restart reload cycle, causing full-screen window flickers and terminating all running agents and tasks across all sessions.
  * Always wrap long-running runner scripts in `try/catch/finally` with `$ErrorActionPreference = "Continue"`, and ensure the script exits with clean `exit 0` upon termination.
* **Never Use `npm run` or `npx` directly for Daemon Tasks**:
  * **Strictly Prohibited**: `run_command` with `CommandLine="npm run dev"` and `IsDaemon=true`.
  * **Impact**: In Windows, terminating `.cmd` wrappers (like `npm run`) sends a `SIGINT` which prompts `Terminate batch job (Y/N)?`. This hangs the process waiting for stdin, permanently blocking the pipe and crashing the Antigravity Language Server during task cleanup.
  * **Required Alternative**: Invoke the `node` executable directly on the target package binary to bypass `cmd.exe`.
    * *Example for Next.js*: `node node_modules/next/dist/bin/next dev -p 3001`
    * *Example for Vite*: `node node_modules/vite/bin/vite.js`
  * Or, use a `.ps1` script that spawns the process via `Start-Process -NoNewWindow` and kills the PID explicitly on cleanup.


