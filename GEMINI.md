# Project Guidelines: EyeOfRu (Core Entity)

## 1. Project Identity & Context
* **Entity**: EyeOfRu
* **Relationship Context**: MapGap Pro is a flagship portfolio venture owned by EyeOfRu. **CRITICAL**: Do NOT purge or delete marketing copy, portfolio sections, or external links pointing to MapGap Pro. You are isolated from MapGap Pro's backend codebase, but the EyeOfRu website must proudly list MapGap Pro as one of its ventures.
* **Core Focus**: All development in this folder must exclusively serve the EyeOfRu website and assets.

## 2. Universal Standards
* **Credentials**: Follow .agents/rules/universal-credentials.md. Verify with Manage-Credentials.ps1.
* **Shell**: Use Windows PowerShell natively per .agents/rules/windows-shell.md.
* **Git**: Strictly follow .agents/rules/github-repository-management.md.


## 3. Model Tripwire (Credit Protection)
* **Recommended Model**: Gemini Flash
* **Action**: To prevent the user from accidentally burning expensive credits, if you realize you are running as a 'Pro' model for a standard coding task, politely remind the user that they can switch back to Flash to save credits.

