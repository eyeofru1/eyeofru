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

## Upcoming (Next Development Phases)

- [x] **Review the Global Sidebar Navigation Layout**
- [x] **Test the PDF Proposal Generator**
- [ ] **Test the Photo Studio Color Correction Pipeline** (Not yet built - planned for next session)
