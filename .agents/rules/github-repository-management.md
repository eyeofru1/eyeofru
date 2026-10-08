# GitHub Repository Management & Version Control Rule

This rule governs Git version control, repository creation, branch workflows, and credential handling across Antigravity projects.

---

## 1. Native Git CLI Standard

* **Primary Tool**: Native `git.exe` on Windows (`Git for Windows` / `MinGit`) is the mandatory standard for all version control operations (`status`, `add`, `commit`, `branch`, `push`, `pull`, `diff`, `clone`).
* **Environment Verification**:
  Before running Git workflows, agents can verify Git presence silently:
  ```powershell
  git --version
  ```
* **No Unnecessary Re-implementations**: Do not invent custom HTTP or Node.js upload scripts when standard `git` commands can accomplish the task.

---

## 2. Authentication & Credential Security

* **Zero Plaintext Tokens**: Never hardcode GitHub personal access tokens (PATs), SSH private keys, or passwords in source code, commit messages, or `.git/config`.
* **Central Token Management**:
  * The studio GitHub token is managed via Antigravity Universal Credentials Management (`~/.gemini/.env`).
  * Verify token presence silently:
    ```powershell
    powershell -ExecutionPolicy Bypass -File "$HOME\.gemini\scripts\Manage-Credentials.ps1" -Action Check -Key "GITHUB_TOKEN"
    ```
* **Git Credential Helper**:
  * Git for Windows uses the Windows Credential Manager (`credential.helper=manager`).
  * When cloning or setting remotes, use standard HTTPS remotes:
    ```text
    https://github.com/eyeofru1/<repo-name>.git
    ```
  * If programmatic authentication is required in automated scripts, use the `GITHUB_TOKEN` environment variable dynamically at runtime without persisting tokens to disk in plaintext.

---

## 3. Branching Strategy & Safety Guardrails

* **Default Branch**: The default production branch is `main`.
* **Destructive Command Ban (STRICT)**:
  * ❌ **NEVER** run `git push --force` or `git push -f` to `main` without explicit, unambiguous user confirmation.
  * ❌ **NEVER** run `git reset --hard` on tracked remote branches without user approval.
  * ❌ **NEVER** delete remote branches without user confirmation.
* **Feature Branches**: For non-trivial features, create dedicated feature branches (`feat/...`, `fix/...`) and merge via Pull Request or clean squash merges.

---

## 4. Commit Message & Code Hygiene

* **Semantic Commits**: Use clear, concise conventional commit prefixes:
  * `feat: ...` (New functionality or features)
  * `fix: ...` (Bug fixes or error handling)
  * `chore: ...` (Config, dependencies, rules, or documentation updates)
  * `refactor: ...` (Code restructuring without behavioral changes)
* **Zero Emojis in Commit Messages**: Maintain clean, enterprise-grade commit logs with zero emojis.
* **Review Staged Changes**: Always check `git status` and `git diff --staged` before committing to verify no unwanted or sensitive files are staged.

---

## 5. Mandatory Repository Hygiene (`.gitignore`)

Every project repository **MUST** include a comprehensive `.gitignore` at root covering:
```gitignore
# Credentials & Environment
.env
.env.*
!.env.example
*.pem
*.key
*.pfx
credentials.json
.clasprc.json
.clasp.json

# Dependencies & Environments
node_modules/
.venv/
__pycache__/

# Build & Output
dist/
build/
.next/
out/

# Artifacts & Scratch (Never pollute repo with debug dumps)
artifacts/
scratch/
*.log

# System & IDE
.DS_Store
Thumbs.db
.vscode/
.idea/
```

---

## 6. Studio API Fallback Tools

When running in restricted headless containers or sandbox environments where native `git.exe` is not available on PATH, use the studio's verified API fallback scripts in `~/.gemini/scripts/`:
* **List / Create Repositories**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File "$HOME\.gemini\scripts\Manage-GitHubRepos.ps1" -Action List
  powershell -ExecutionPolicy Bypass -File "$HOME\.gemini\scripts\Manage-GitHubRepos.ps1" -Action Create -RepoName "<name>" -Private
  ```
* **Push Files via REST**:
  ```powershell
  node "$HOME\.gemini\scripts\Push-GitHubRepo.js" --owner "eyeofru1" --repo "<repo-name>" --file "<path>"
  ```
