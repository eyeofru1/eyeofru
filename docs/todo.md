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
  - **Existing Dashboard Integration (Lead Command Center / Port 3300)**: Add a dedicated "Staging Queues" tabbed viewport directly into the existing operator dashboard.
  - **Signal Nodes & Web Audio Chime**: Replicate the illuminated beacon indicators (`PENDING_REVIEW`, `REQUIRES_2STEP`, `DEPLOYED`) and the synthesized bronze harmonic chime (`880Hz / 1760Hz`) when new queue proposals arrive.
  - **Aggregated Queue View**: Centralized agency view aggregating staging proposals across all active client ventures.
  - **Fluid "Approve & Apply" Bridge**: Connect queue selection directly to Antigravity CLI to automatically mutate repository files and push live.
  - **Client & Admin/Operator Intake Procedure & Identity Binding**:
    - Build a formal intake and setup flow for clients and agency admins/operators.
    - Tie operator and client identity together so notifications know who submitted the change, who approved it, and which verified email address to notify on deployment completion (resolves missing recipient email when an admin/operator submits under a non-email handle).
    - Persist verified email/role associations in the ledger and local profile rather than placeholder values.
