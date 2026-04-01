# Small Estate Post-Intake Flow — User Experience Design

## Context
After a user completes the intake form and the Strategy Report determines their estate qualifies for the **small-estate** path (value under state threshold, no disqualifying real estate), they need a guided, step-by-step process to actually settle the estate. This document defines that flow — its phases, branching points, checklists, and the data we need to collect along the way.

---

## Flow Overview

The post-intake experience is organized into **7 phases**, each with a gate (prerequisites that must be met before starting). Some phases run concurrently. The flow adapts based on:
- What the user told us in the intake
- What they tell us along the way
- Their state's specific rules

---

## PHASE 0: SECURE & STABILIZE (Day 1)
**Gate:** None — immediately available after intake
**Purpose:** Handle anything time-sensitive before the process begins

This phase is **conditional** — it only appears if the user flagged safety concerns during intake:

| Intake Flag | Task |
|------------|------|
| `hasVacantProperty` | Secure the property — change locks, notify insurance, forward mail |
| `hasPetsOrPerishables` | Arrange pet care, remove perishable items |
| `hasVehicleUnsecured` | Move vehicles to private parking, secure keys |

**Data collected:** None new — driven entirely by intake flags
**Completion criteria:** All applicable urgent tasks checked off

---

## PHASE 1: GATHER ESSENTIALS (Week 1)
**Gate:** Phase 0 complete (or skipped if no urgent items)
**Purpose:** Get the foundational documents you'll need for everything else

### Checklist
- [ ] Order 10–15 certified copies of the death certificate
- [ ] Locate the original will (if `hasWill` = true)
- [ ] Notify Social Security Administration (call 1-800-772-1213)
- [ ] Notify employer / pension provider (if applicable)

### BRANCHING POINT: Will Filing Deadline
We already know from `states.ts` whether the user's state has a `willFilingDays` deadline.

```
IF state.willFilingDays exists AND hasWill:
  → Calculate deadline = dateOfDeath + willFilingDays
  → Show urgent task: "File will with [County] Probate Court by [deadline]"
  → This task is UNLOCKED immediately, not gated behind waiting period

IF no deadline OR no will:
  → Will filing is included in Phase 3 preparation
```

**Data to collect:**
- Death certificate order status (ordered / received / how many)
- Will filing status (if deadline applies)

---

## PHASE 2: DOCUMENT & VALUE (Weeks 1–4, During Waiting Period)
**Gate:** Death certificates ordered
**Purpose:** Build the complete picture of the estate while the waiting period runs

Most states require **30–45 days** after death before you can file a Small Estate Affidavit. This phase fills that time productively.

### New Data to Collect (not captured in intake)

**Account Details** (for each asset type flagged in intake):

| Intake Flag | Details to Collect |
|------------|-------------------|
| `ownsSoleBankAccounts` | Institution name, account type, account number (last 4), current balance |
| `ownsSoleVehicles` | Year, make, model, VIN, estimated value, title location |
| `ownsSoleRealEstate` | Property address, estimated market value, mortgage lender, remaining balance |
| `hasOtherProbateAssets` | Description, estimated value, location |

**Debt Inventory:**
- Creditor name, type of debt, amount owed, account number
- Priority classification (funeral, medical, tax, other)

**Beneficiary / Heir Registry:**
- Full legal name, relationship to deceased, contact info
- If will exists: what each person is named to receive
- If no will: we determine shares based on state intestacy law

### Checklist
- [ ] Gather statements for all sole-owned bank/investment accounts
- [ ] Locate vehicle titles
- [ ] Pull property deed (if applicable)
- [ ] Compile complete debt list
- [ ] Identify and document all beneficiaries/heirs
- [ ] **Recalculate total estate value with real numbers**

### BRANCHING POINT: Value Recheck
```
IF updated total estate value >= state.smallEstateLimit:
  → ALERT: "Based on actual values, this estate may exceed your state's
     small estate threshold of $[limit]. You may need to pursue formal
     probate. Would you like to see the formal probate guidance?"
  → Redirect to formal probate flow

IF updated total still < threshold:
  → Continue to Phase 3
```

This is a **critical gate** — the intake used estimates, but real documentation may reveal a different picture.

**Completion criteria:** All asset details entered, all debts listed, all heirs identified, value recheck passed

---

## PHASE 3: PREPARE THE AFFIDAVIT (After Waiting Period)
**Gate:** State waiting period elapsed + Phase 2 complete
**Purpose:** Create and formalize the legal document that gives you authority

### MAJOR BRANCHING POINT: State Filing Requirement
```
IF state requires court filing (Summary Administration):
  → PATH B: Court-filed process

IF state does NOT require court filing:
  → PATH A: Out-of-court process
```

*Note: We need to add a `courtFilingRequired` field to our state data to support this branch. Currently `states.ts` doesn't track this.*

### Path A: Out-of-Court Affidavit
- [ ] Download/draft Small Estate Affidavit (state-specific form)
- [ ] Fill in estate details, asset values, heir information
- [ ] Attach copy of will (if exists)
- [ ] Get affidavit signed in front of a notary public
- [ ] Keep notarized original — this is your authority document

### Path B: Court Filing (Summary Administration)
- [ ] Download/draft Small Estate Affidavit (state-specific form)
- [ ] Fill in estate details, asset values, heir information
- [ ] Attach copy of will (if exists)
- [ ] File affidavit with [County] Probate Court
- [ ] Pay filing fee ($____ estimated for your state)
- [ ] Receive court order / Certificate of Transfer
- [ ] Order 3–5 certified copies of the court order

### Sub-branch within Path B:
```
IF hasWill AND will not yet filed:
  → File will simultaneously with affidavit
```

**Data to collect:**
- Notarization date (Path A) or court filing date (Path B)
- Court order received date (Path B only)
- Filing fee amount (Path B only)

**Completion criteria:** User has notarized affidavit (A) or certified court order (B) in hand

---

## PHASE 4: COLLECT ASSETS (After Authority Established)
**Gate:** Notarized affidavit or court order obtained
**Purpose:** Present your authority to each institution and collect/transfer assets

This phase splits into **parallel tracks** based on what asset types exist. Each track is independent — the user works through whichever apply.

### Track: Bank Accounts (if `ownsSoleBankAccounts`)
For each account documented in Phase 2:
- [ ] Visit institution with affidavit + death certificate
- [ ] Request account closure or retitling
- [ ] Deposit funds into estate account (or distribute directly to heirs)
- **Data:** Amount collected from each account, date collected

### Track: Vehicles (if `ownsSoleVehicles`)
For each vehicle documented in Phase 2:
- [ ] Obtain vehicle title (if not already located)
- [ ] Complete state DMV transfer form
- [ ] Visit DMV with title + death certificate + transfer form
- [ ] Transfer title to heir or sell vehicle
- **Data:** Transfer completion date, new title holder

### Track: Real Estate (if `ownsSoleRealEstate` AND `state.realPropertyAllowed`)
- [ ] Record affidavit with county recorder's office
- [ ] Prepare and file deed transfer document
- [ ] Update property insurance to new owner
- [ ] Continue mortgage payments until transfer completes
- [ ] Notify HOA (if applicable)
- **Data:** Recording date, new owner name, deed transfer date

### Track: Other Assets (if `hasOtherProbateAssets`)
For each item documented in Phase 2:
- [ ] Secure and inventory items
- [ ] Get professional appraisal (if high-value)
- [ ] Distribute to named beneficiary or sell
- **Data:** Disposition of each item (distributed to whom, or sale amount)

### Parallel Track: Non-Probate Assets (informational)
These don't require the affidavit but the user may need guidance:
- If `hasLifeInsurance`: Remind beneficiaries to file claims directly with insurer
- If `hasBeneficiaryAccounts`: Contact custodian to claim via beneficiary designation
- If `hasJointProperty`: Provide surviving owner with guidance on retitling

**Completion criteria:** All asset tracks show collected/transferred status

---

## PHASE 5: SETTLE DEBTS (Concurrent with Phase 4)
**Gate:** Assets beginning to be collected
**Purpose:** Pay what's owed before distributing to heirs

### Checklist
- [ ] Notify each known creditor of the death (in writing)
- [ ] Pay debts in legal priority order:
  1. Funeral and burial costs
  2. Medical bills from final illness
  3. Federal and state taxes owed
  4. Secured debts (mortgage, car loans)
  5. Unsecured debts (credit cards, personal loans)
- [ ] Keep receipts and records of every payment

### BRANCHING POINT: Debt vs. Asset Balance
```
IF total debts > total assets:
  → ALERT: "The estate's debts exceed its assets. This is called an
     'insolvent estate.' You should consult an attorney — you are NOT
     personally liable for the deceased's debts (in most cases), but
     the distribution rules change."
  → Show: Priority payment guidance, attorney consultation recommendation
  → BLOCK Phase 6 (no distribution until resolved)

IF total debts <= total assets:
  → Continue to Phase 6 after debts paid
```

**Data to collect:**
- Each debt payment: creditor, amount, date, receipt
- Running balance: total collected vs. total paid out

**Completion criteria:** All known debts addressed (paid or resolved)

---

## PHASE 6: DISTRIBUTE TO HEIRS (After Phases 4 & 5)
**Gate:** All assets collected + all debts settled
**Purpose:** Get the remaining estate into the right hands

### BRANCHING POINT: Will vs. Intestacy
```
IF hasWill:
  → Distribute according to will terms
  → Show each beneficiary with their designated share

IF !hasWill:
  → Distribute according to state intestacy law
  → We calculate shares based on state rules and heir relationships
  → Show each heir with their calculated share
```

### Checklist
- [ ] Calculate remaining estate value (assets collected minus debts paid)
- [ ] Determine each heir's share (per will or intestacy law)
- [ ] Transfer funds / assets to each heir
- [ ] Get signed receipt from each beneficiary/heir
- [ ] Keep copies of all distribution records

**Data to collect:**
- Distribution to each person: name, amount/asset, date, receipt confirmation

**Completion criteria:** All distributions complete, all receipts collected

---

## PHASE 7: CLOSE OUT (Final)
**Gate:** All distributions complete
**Purpose:** Wrap up administrative loose ends

### Checklist
- [ ] File deceased's final federal income tax return (Form 1040)
- [ ] File deceased's final state income tax return
- [ ] File estate income tax return if the estate earned any income (Form 1041)
- [ ] Cancel remaining subscriptions and memberships
- [ ] Close email and social media accounts
- [ ] Forward mail via USPS (if not already done)
- [ ] Notify credit bureaus to prevent identity theft
- [ ] Store all records for at least 3 years

### Informational (no action needed in most cases):
- Estate tax return: Only required if estate exceeds federal threshold ($13.61M in 2025). We can suppress this task for small estates but mention it for awareness.

**Data to collect:** Tax filing dates, account closure confirmations
**Completion criteria:** All tasks checked off — **estate settled**

---

## Summary of Branching Points

| # | Branch | When | Paths |
|---|--------|------|-------|
| 1 | Safety concerns? | Phase 0 | Urgent actions vs. skip to Phase 1 |
| 2 | Will filing deadline? | Phase 1 | Immediate filing vs. defer to Phase 3 |
| 3 | Value recheck | Phase 2 | Still qualifies → continue vs. exceeds threshold → redirect to formal probate |
| 4 | State filing requirement | Phase 3 | Out-of-court affidavit vs. court-filed Summary Administration |
| 5 | Will attached? | Phase 3 | Attach will to affidavit vs. affidavit alone |
| 6 | Asset type tracks | Phase 4 | Parallel tracks for bank, vehicle, real estate, other |
| 7 | Debts vs. assets | Phase 5 | Solvent → distribute vs. insolvent → attorney consultation |
| 8 | Will vs. intestacy | Phase 6 | Distribute per will vs. distribute per state law |

## Data Collection Summary (Beyond Intake)

| Phase | New Data |
|-------|----------|
| 1 | Death certificate status, will filing status |
| 2 | Specific account details, vehicle details, real estate details, debt inventory, beneficiary registry, recalculated estate value |
| 3 | Notarization date, court filing date, court order date, filing fees |
| 4 | Collection status per asset, amounts received, transfer dates |
| 5 | Debt payments made, receipts, running balance |
| 6 | Distribution amounts, recipient confirmations |
| 7 | Tax filing dates, account closures |
