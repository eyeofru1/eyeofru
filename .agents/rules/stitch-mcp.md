# Google Stitch MCP Guidelines

This project environment is equipped with the native **Google Stitch MCP server**.

## 1. Always Use Native MCP Tools
When generating screens, exporting variants, listing screens, or applying design systems from Google Stitch:
* **MANDATORY**: Use the native `stitch` tools via `call_mcp_tool` (e.g. `list_screens`, `get_screen`, `generate_screen_from_text`, `edit_screens`, `upload_design_md`, `apply_design_system`).
* **PROHIBITED**: Never write ad-hoc Node.js or curl scripts with manual HTTP requests to `stitch.googleapis.com`.
* **Zero Hardcoded Keys**: Never hardcode Stitch API keys into scripts. The MCP server automatically injects the configured credentials. If any standalone script requires the key, resolve it from `~/.gemini/.env` (`STITCH_API_KEY`).
