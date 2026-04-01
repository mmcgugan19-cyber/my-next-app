# Create a New Workflow

Guide the user through creating a complete workflow subfolder under `workflows/`. Each step produces one file. Present the content to the user for review/approval before saving. Do not proceed to the next step until the current file is approved.

## Arguments
- `$ARGUMENTS` — the workflow name (e.g., "formal-probate", "no-probate")

## Process

### Step 1: Create the subfolder
Create `workflows/{workflow-name}/` and confirm with the user.

### Step 2: 1-reference.md — Domain Knowledge
Research the real-world process for this workflow. Draft a reference document that explains:
- What this process is and when it applies
- The typical step-by-step experience
- Key terminology
- Important limitations and caveats
- How it compares to alternative paths

**Present the draft to the user.** Ask: "Does this reference look accurate? Any corrections or additions?" Only save after approval.

### Step 3: 2-flow.md — User Flow Design
Based on the approved reference, design the post-intake user experience:
- Phases with gates (prerequisites to unlock each phase)
- Branching points with clear conditions
- Checklists for each phase
- Data to collect at each phase (beyond what intake already captures)
- Completion criteria for each phase

Cross-reference with the intake form (`components/intake/`, `types/intake.ts`) to understand what data we already have.

**Present the draft to the user.** Ask: "Does this flow make sense? Any phases to add, remove, or restructure?" Only save after approval.

### Step 4: 3-flow-diagram.html — Visual Diagram
Create an HTML visual diagram matching the project's established style (dark background, green phase boxes, blue branch boxes, orange alert boxes, purple gate boxes, connector lines). Use the existing diagram in `workflows/small-estate-settlement/3-flow-diagram.html` as the style template.

**Save the file and open it in the browser for the user to review.** Ask: "Does the visual layout look correct?" Revise if needed.

### Step 5: 4-build/ — Phase Build Specs
For each phase in the flow, create a build spec file (`4-build/phase-{N}.md`). Each file must answer:
- What does the software **show** the user? (UI behavior, sub-checklists, expandable sections)
- What does the software **do** for the user? (generate documents, calculate deadlines, auto-fill)
- What does the software **collect** from the user? (form fields, checkboxes, file uploads)
- What is the **software value** for each task? (high / moderate / minimal)
- Implementation notes (conditional rendering, links to other phases)

**Present each phase spec to the user one at a time.** Only save and move to the next phase after approval.

### Step 6: 5-data-model.md — Database Schema
Based on all approved build specs, define:
- New database tables needed (with columns, types, constraints)
- New columns on existing tables
- Relationships to existing tables (profiles, estates)
- RLS policies needed
- Migration file naming suggestion

Cross-reference with the existing schema (`supabase/migrations/`) to avoid conflicts.

**Present the draft to the user.** Only save after approval.

### Step 7: 6-content.md — User-Facing Copy
Write all user-facing text for this workflow:
- Phase titles and descriptions
- Task labels and "why this matters" explanations
- Warning/alert messages
- Tooltip text
- Success/completion messages
- Any generated letter/script templates

Tone should match EstateIQ's existing voice: calm, reassuring, authoritative but not legalese.

**Present the draft to the user.** Only save after approval.

### Step 8: Summary
List all created files with their paths. Flag the workflow as ready to build. Ask: "This workflow is fully specced. Would you like me to build it now, or save it for later?"

## Rules
- Never skip a step or save without explicit user approval
- If the user wants to revisit a previous file, go back and update it
- Keep each file focused — don't duplicate content across files
- Reference the small-estate-settlement subfolder as an example when helpful
- Create a Google Doc of each file after saving if the user requests it
