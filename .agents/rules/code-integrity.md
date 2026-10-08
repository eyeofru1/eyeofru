# Code Integrity, Environment & Artifact Guidelines

This rule establishes standards for code preservation, environment isolation, and clean workspace management across Antigravity projects.

## 1. Non-Destructive Code & Comment Preservation
* **Preserve Documentation**: Never strip or shorten existing comments, docstrings, or license headers when modifying code unless explicitly instructed by the user.
* **Targeted Modifications**: Prefer targeted replacement (`replace_file_content`) over wholesale file overwrites.
* **No Truncation**: Never insert placeholder comments such as `// ... rest of code unchanged ...` into production files.
* **Test Before Completion**: Always run relevant tests or verification steps to ensure changes did not introduce regressions.

## 2. Clean Artifact & Screenshot Pathing (NO DESKTOP POLLUTION)
* **Desktop Protection**: Never write screenshots, temporary outputs, log dumps, or test files directly to `OneDrive\Desktop`, `Desktop`, or the user root folder (`C:\Users\forth`).
* **Approved Locations**:
  * Headless browser screenshots & test artifacts: `<project_root>/artifacts/` or `<project_root>/scratch/`.
  * Temporary scripts: `<project_root>/scratch/` or agent scratch directories.
  * Ensure `<project_root>/artifacts/` and `<project_root>/scratch/` are ignored in `.gitignore`.

## 3. Runtime & Dependency Isolation
* **Python**:
  * Always use project-isolated virtual environments (`.venv` or `uv`).
  * Never run global `pip install <package>`. Always activate the local environment:
    ```powershell
    .\.venv\Scripts\Activate.ps1; pip install <package>
    ```
* **Node.js / Web**:
  * Prefer local dependencies via `npm install --save-dev` or `npm install`.
  * Respect existing lockfiles (`package-lock.json`).
  * Ensure `node_modules/` and build directories (`dist/`, `build/`, `.next/`) are never committed to git.

## 4. Visual & Typography Standards: Clean Minimal Design, Button Icons & Zero Emojis
* **Clean Minimalist Baseline**: Always start with the cleanest, minimal approach/design until directed otherwise.
* **Button Identification Icons**: Clean vector icons (SVGs) may be used for button identification and clear action affordance, but must **never include additional characters or emojis** unless specifically asked for.
* **Strict Zero-Emoji Prohibition**: Never add emojis or informal icons to source code, comments, email subject lines, email templates, UI buttons, toasts, headings, or documentation unless explicitly requested by the user.
* **Format**: Maintain clean, high-end enterprise typography, concise text labels, and standard ASCII brackets for status flags (e.g. `[NEW LEAD]`, `[SYSTEM MATCH]`).

