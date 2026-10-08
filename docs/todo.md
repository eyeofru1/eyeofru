# ✅ User Testing To-Do List

This is your personal checklist of features that have been built and are waiting for your manual review and testing.

## High Priority (MVP Core Flows)

- [ ] **Test the "New Project" Surface Scan Modal**
  - **Where:** `http://localhost:3001/projects`
  - **What to do:** Click "New Project", enter a real business URL, and watch the AI extract the business name and core services. 
  - **Verification:** Ensure the "Review & Edit" step lets you successfully overwrite the AI's suggestions before hitting Approve.

- [ ] **Test the Dynamic Client Intake Link**
  - **Where:** `http://localhost:3001/projects` -> Click the "Link" icon on a generated project.
  - **What to do:** Paste the copied link into a new browser tab.
  - **Verification 1:** Ensure the UI renders correctly and looks clean/professional.
  - **Verification 2:** Check that the "Page Focus" section is no longer an empty textbox, but rather a dynamic checklist (e.g., "We found 12 pages...") with Select All/Deselect functionality based on the AI's URL extraction.

## Eye Of Ru AI Concierge & Staging Queue (Current Checkpoint)

- [x] **Universal Client Webhook & Drive Hierarchy**: Sovereign Google Workspace backend live on `eyeofruenterprisesllc.com` (`AKfycbwu...`).
- [x] **Email Alert Pipeline**: Native HTML diff emails dispatch to `agency@eyeofruenterprisesllc.com` on submission.
- [x] **Modal Backdrop Click-to-Close UX**: Modal dialogs close on backdrop click in `index.html`.
- [x] **Sensitivity Regex Tuning**: Specific operational phrases tuned to eliminate false 2-step call flags.
- [ ] **Master Multi-Client Staging Queue Dashboard (Future Roadmap)**:
  - Centralized agency view aggregating staging proposals across all active client ventures.
  - Fluid "Approve & Apply" bridge to automatically mutate repository files and push live via Antigravity CLI.
  - Formal Admin & Client Identity onboarding profile (replaces `authorized-client@` placeholder).
