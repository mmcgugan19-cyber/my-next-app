# Small Estate Settlement (Below Probate Threshold)

## Overview
When a deceased person's estate value falls below the state's probate threshold, the estate can typically be settled without formal probate using a Small Estate Affidavit (SEA) process. This is a DIY-friendly alternative that is faster, cheaper, and places more personal responsibility on the person handling the paperwork.

---

## Step-by-Step Process

### 1. Waiting Period
Most states require a specific waiting period after death before any action can be taken.

- **Typical Duration:** 30 to 45 days (e.g., 28 days in Michigan, 45 days in Tennessee)
- **Purpose:** Allows time for a will to surface or creditors to come forward, and ensures no formal probate has already been opened by someone else

### 2. Gathering Information and Valuing Assets
You must prove the estate qualifies as "small" under the state's laws by creating a complete inventory of assets held solely in the deceased's name.

- **Exclude from threshold calculation:**
  - Assets with named beneficiaries (life insurance, 401ks, IRAs)
  - Property held in Joint Tenancy (passes automatically to surviving owner)
  - Assets in a trust
- **Documentation needed:**
  - Certified copy of Death Certificate
  - Bank statements
  - Vehicle valuations (Kelly Blue Book)
  - Any other asset documentation

### 3. Drafting the Small Estate Affidavit (SEA)
The core document of this process, sometimes called an "Affidavit for Collection of Personal Property."

- **Content:** Sworn statement under oath that:
  - The estate meets the state's value requirements
  - All funeral expenses and debts have been paid (or will be)
  - You are the person entitled to the assets
- **Requirements:**
  - Must be signed in front of a notary public
  - If a will exists, attach a copy to show intended beneficiaries

### 4. Filing (Varies by State)
Two possible experiences depending on location:

- **Out-of-Court (e.g., Illinois):** No court filing required. Keep the notarized original and present it directly to banks/institutions.
- **Summary Administration (other states):** File the affidavit with the local probate court clerk. The court may issue a "Simple Order" or "Certificate of Transfer" granting official authority.

### 5. Presenting the Affidavit to Third Parties (Collection Phase)
Take the notarized affidavit and death certificate to institutions holding assets.

- **Banks:** Present the affidavit; they are legally required (in most states) to release funds to you or named heirs
- **DMV/Vehicles:** Most states have a separate, simpler process -- bring the title, death certificate, and a specific DMV form to transfer ownership
- **Other institutions:** Similar process for brokerage accounts, utility deposits, etc.

### 6. Paying Debts and Distributing Assets
As the "Affiant" (person signing the affidavit), you take on a role similar to an executor.

- **Priority order:**
  1. Funeral and burial costs
  2. Outstanding debts and final bills
  3. Distribution to heirs/beneficiaries
- **Liability warning:** If you distribute money and a valid creditor later appears, you may be personally liable for that debt up to the value of the assets you received

---

## Comparison: Formal Probate vs. Small Estate Affidavit

| Feature | Formal Probate | Small Estate Affidavit |
|---------|---------------|----------------------|
| Timeframe | 6 months to 2 years | 30 to 60 days |
| Court Involvement | Heavy (hearings, filings) | Minimal to none |
| Cost | High (attorney & filing fees) | Low (notary & small filing fee) |
| Real Estate | Can transfer land/homes | Usually cannot transfer real estate |

---

## Important Limitations

- **Real estate:** If the deceased owned real property (house or land) solely in their name, the Small Estate Affidavit is usually not sufficient. A more involved process like Summary Administration or a "Petition to Determine Succession" is typically required.
- **State-specific rules:** Thresholds, waiting periods, and forms vary significantly by state and change frequently. Always verify current requirements for the specific state.
- **Contested estates:** If there are disputes among heirs or creditors, formal probate may be required regardless of estate size.

---

## Relevance to EstateIQ
This workflow maps directly to the app's "small-estate" legal path determined in `StrategyReport.tsx`. The intake form collects the data needed to assess whether an estate qualifies (state, asset values, property types), and the task generation system should produce tasks aligned with these six steps.
