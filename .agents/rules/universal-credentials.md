# Antigravity Universal Credentials & Secret Management Rule

This rule governs how credentials, API keys, and sensitive tokens are handled across Antigravity projects and sessions.

## 1. Credential Resolution Hierarchy

Whenever code, scripts, or agent workflows require credentials, resolve them in this 4-tier precedence order:
1. **Tier 1 (Runtime Environment)**: Existing process environment variables (`$env:KEY` or `process.env.KEY`).
2. **Tier 2 (Project Local)**: `<project_root>/.env.local` (local developer overrides, uncommitted).
3. **Tier 3 (Project Shared)**: `<project_root>/.env` (project-specific variables, uncommitted).
4. **Tier 4 (Global Vault)**: `~/.gemini/.env` (hardlinked to `~/.env`, shared across all Antigravity projects).

All projects and helper scripts must support falling back to `~/.gemini/.env` / `~/.env` when a key is not defined at the project level.

---

## 2. Zero-Leak Verification Protocol (STRICT)

Agents must **never** inspect or display secret values in the terminal, chat context, or tool calls.

* ❌ **FORBIDDEN**:
  * `cat ~/.env`, `type ~/.env`, `Get-Content ~/.env`
  * `echo $KEY`, `printenv`, `dir env:`, `Get-ChildItem env:`
  * Asking the user to paste credentials directly into the chat prompt.
  * Dumping full environment tables in debug or test commands.

* ✔️ **MANDATORY VERIFICATION**:
  Verify presence using silent exit checks:
  * **Windows (PowerShell)**:
    ```powershell
    powershell -ExecutionPolicy Bypass -File "$HOME\.gemini\scripts\Manage-Credentials.ps1" -Action Check -Key "<KEY_NAME>"
    ```
    *(Exit code 0 = Present; non-zero = Missing)*
  * **Unix / Git Bash**:
    ```bash
    grep -sq "^<KEY_NAME>=" ~/.env
    ```

---

## 3. Mandatory Proactive Pre-Flight Cueing Workflow

As soon as a project task, skill, integration, or script looks like it will require an API key or credential:

1. **Step 0 Pre-Flight Check**: The agent **MUST** run the silent verification check before attempting any code execution, API calls, or build steps:
   ```powershell
   powershell -ExecutionPolicy Bypass -File "$HOME\.gemini\scripts\Manage-Credentials.ps1" -Action Check -Key "<KEY_NAME>"
   ```
2. **Immediate Stop & Cue**: If the credential is missing (non-zero exit code), the agent **MUST NOT** guess, mock, or proceed into errors. The agent **MUST IMMEDIATELY STOP** and output a clear, actionable cue block to the user:
   * 🔑 **Required Credential**: Name of the key and why it is needed.
   * 🌐 **Where to Obtain**: Direct official URL / portal link to generate the key.
   * 💻 **Copy-Paste Secure Command**:
     ```powershell
     powershell -ExecutionPolicy Bypass -File "$HOME\.gemini\scripts\Manage-Credentials.ps1" -Action Set -Key "<KEY_NAME>"
     ```
   * ⏸️ **Next Step**: Prompt the user to reply once they have executed the command, so the agent can silently verify presence and resume the task without interruption.

3. **Never Ask for Plaintext in Chat**: The agent must NEVER ask the user to paste the key in the chat window.

---

## 4. Source Control & Repository Hygiene

1. **Never commit secrets**: Every project repository must ignore `.env`, `.env.*` (except `.env.example`), `*.pem`, `*.key`, `*.pfx`, `credentials.json`, `.clasp.json`, and `.clasprc.json`.
2. **Provide `.env.example`**: Always include a sanitized `.env.example` in project roots showing required variable names with empty or dummy values.
3. **Sanitize Test Fixtures**: Automated unit and integration tests must use mock tokens or sandbox fixtures, never real production credentials.

---

## 5. Google Apps Script (GAS) & Clasp Protocol

1. **Direct Publishing via `clasp`**: Never ask the user to manually copy/paste code into the Google Apps Script web editor. Write code locally and publish directly using `clasp push` or `clasp deploy`.
2. **Script ID Storage**: Store the `scriptId` in `.clasp.json` (root directory), **never in `.env`**.
3. **Repository Hygiene**: Always include `.clasp.json` and `.clasprc.json` in `.gitignore`.
4. **Authentication**: `clasp` authentication is managed globally via `~/.clasprc.json`. Never prompt for or hardcode Apps Script OAuth tokens.

