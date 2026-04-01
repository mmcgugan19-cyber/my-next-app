# Phase 0 — Secure & Stabilize: Build Spec

**Source:** [Google Doc](https://docs.google.com/document/d/1lgCY-6Bjv0mL9ISEhtiqSokrgOL4mQeVUlGZroAiueU/edit?usp=drivesdk)
**Purpose:** Define what EstateIQ builds for Phase 0 of the small estate post-intake flow

---

Phase 0 is the most **physical/action-oriented** phase — these are real-world tasks, not paperwork. The software's value is providing **context, urgency, and sub-step guidance** rather than automating the actions themselves.

---

## Secure vacant property — change locks, notify insurance

**Software value: HIGH**

- **Generate a letter/script** to call the homeowner's insurance company and notify them of the vacancy (many policies require this within 30 days or coverage lapses)
- **Checklist expansion** — break this into sub-steps:
  - Change locks
  - Set light timers
  - Forward mail
  - Stop deliveries
  - Notify neighbors
  - Check on pipes/water heater
- **Reminder/urgency framing** — explain *why* this matters (insurance can deny claims on unreported vacant properties)

## Arrange pet care, remove perishable items

**Software value: MINIMAL**

- This is a same-day personal action. At most, a tip about checking if the will names a pet guardian.
- Keep as a simple checkbox — don't over-engineer it.

## Move vehicles to private parking

**Software value: MODERATE**

- **Provide info** on what happens if a vehicle is towed from public parking after the owner dies (impound fees, title complications)
- **Link forward** to Phase 4's vehicle transfer track — "You'll transfer the title later, but for now just secure it"

---

## Implementation Notes

- Phase 0 is **conditional** — it only renders if at least one of `hasVacantProperty`, `hasPetsOrPerishables`, or `hasVehicleUnsecured` is true from the intake
- If none of these flags are set, skip directly to Phase 1
- Each task item should include a brief "why this matters" explanation visible on expand/click
- The vacant property task should expand into a sub-checklist when the user starts it
- All tasks are checkboxes — completion of all unlocks Phase 1
