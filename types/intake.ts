export interface StateInfo {
  name: string
  abbreviation: string
  smallEstateLimit: number
  realPropertyAllowed: boolean
  willFilingDays: number | null
  notes: string
}

export interface IntakeData {
  // Step 1: Compass
  state: string
  county: string
  dateOfDeath: string

  // Step 2: Safety Check
  hasVacantProperty: boolean | null
  hasVehicleUnsecured: boolean | null
  hasPetsOrPerishables: boolean | null
  hasActiveBusiness: boolean | null

  // Step 3: Asset Classification
  hasLifeInsurance: boolean | null
  hasBeneficiaryAccounts: boolean | null
  hasJointProperty: boolean | null
  ownsSoleRealEstate: boolean | null
  ownsSoleBankAccounts: boolean | null
  ownsSoleVehicles: boolean | null
  hasOtherProbateAssets: boolean | null

  // Step 4: Estimated Values (probate assets)
  estRealEstate: number
  estBankAccounts: number
  estVehicles: number
  estOtherAssets: number

  // Step 5: Will & Role
  hasWill: boolean | null
  isNamedExecutor: boolean | null
}

export interface StrategyResult {
  legalPath: 'no-probate' | 'small-estate' | 'formal-probate'
  role: 'executor' | 'administrator'
  totalProbateValue: number
  stateThreshold: number
  stateName: string
  urgentActions: string[]
  firstDeadline: { task: string; dueDate: string; daysRemaining: number } | null
  riskLevel: 'low' | 'medium' | 'high'
  riskFactors: string[]
  immediateActions: string[]
  shortTermActions: string[]
  longTermActions: string[]
}

export const INITIAL_INTAKE_DATA: IntakeData = {
  state: '',
  county: '',
  dateOfDeath: '',
  hasVacantProperty: null,
  hasVehicleUnsecured: null,
  hasPetsOrPerishables: null,
  hasActiveBusiness: null,
  hasLifeInsurance: null,
  hasBeneficiaryAccounts: null,
  hasJointProperty: null,
  ownsSoleRealEstate: null,
  ownsSoleBankAccounts: null,
  ownsSoleVehicles: null,
  hasOtherProbateAssets: null,
  estRealEstate: 0,
  estBankAccounts: 0,
  estVehicles: 0,
  estOtherAssets: 0,
  hasWill: null,
  isNamedExecutor: null,
}
