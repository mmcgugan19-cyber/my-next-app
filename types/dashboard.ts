export interface Asset {
  id: string
  estate_id: string
  category: 'real_estate' | 'financial' | 'digital' | 'vehicle' | 'personal_property'
  name: string
  description: string | null
  estimated_value: number
  ownership_type: 'sole' | 'joint' | 'trust' | 'beneficiary' | null
  account_number: string | null
  institution: string | null
  status: 'identified' | 'valued' | 'claimed' | 'transferred' | 'closed'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Debt {
  id: string
  estate_id: string
  category: 'funeral' | 'medical' | 'credit_card' | 'mortgage' | 'utilities' | 'taxes' | 'other'
  creditor: string
  amount: number
  status: 'unpaid' | 'paid' | 'disputed' | 'negotiating' | 'forgiven'
  due_date: string | null
  account_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Beneficiary {
  id: string
  estate_id: string
  name: string
  relationship: string
  share_percentage: number | null
  share_description: string | null
  contact_email: string | null
  contact_phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface EstateDocument {
  id: string
  estate_id: string
  doc_type: 'death_certificate' | 'will' | 'trust' | 'deed' | 'title' | 'insurance_policy' | 'bank_statement' | 'tax_return' | 'court_filing' | 'letters_of_office' | 'affidavit' | 'other'
  name: string
  status: 'needed' | 'obtained' | 'filed' | 'not_applicable'
  copies_count: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface LegalAuthority {
  will_located: boolean
  will_filed: boolean
  will_filed_date: string | null
  letters_applied: boolean
  letters_applied_date: string | null
  letters_received: boolean
  letters_received_date: string | null
  court_case_number: string
  court_name: string
  notes: string
}

export interface Estate {
  id: string
  user_id: string
  state_of_residence: string
  county: string | null
  date_of_death: string | null
  total_value: number
  legal_path: 'no-probate' | 'small-estate' | 'formal-probate'
  executor_role: 'executor' | 'administrator'
  has_will: boolean
  risk_level: 'low' | 'medium' | 'high'
  intake_data: Record<string, unknown>
  legal_authority: LegalAuthority
  urgent_tasks: { text: string; completed: boolean }[]
  immediate_tasks: { text: string; completed: boolean }[]
  short_term_tasks: { text: string; completed: boolean }[]
  long_term_tasks: { text: string; completed: boolean }[]
  created_at: string
  updated_at: string
}

export const INITIAL_LEGAL_AUTHORITY: LegalAuthority = {
  will_located: false,
  will_filed: false,
  will_filed_date: null,
  letters_applied: false,
  letters_applied_date: null,
  letters_received: false,
  letters_received_date: null,
  court_case_number: '',
  court_name: '',
  notes: '',
}

export const ASSET_CATEGORIES: Record<Asset['category'], string> = {
  real_estate: 'Real Estate',
  financial: 'Financial Accounts',
  vehicle: 'Vehicles',
  digital: 'Digital Assets',
  personal_property: 'Personal Property',
}

export const DEBT_CATEGORIES: Record<Debt['category'], string> = {
  funeral: 'Funeral Expenses',
  medical: 'Medical Bills',
  credit_card: 'Credit Cards',
  mortgage: 'Mortgage / Liens',
  utilities: 'Utilities',
  taxes: 'Taxes',
  other: 'Other',
}

export const ASSET_STATUSES: Record<Asset['status'], string> = {
  identified: 'Identified',
  valued: 'Valued',
  claimed: 'Claimed',
  transferred: 'Transferred',
  closed: 'Closed',
}

export const DEBT_STATUSES: Record<Debt['status'], string> = {
  unpaid: 'Unpaid',
  paid: 'Paid',
  disputed: 'Disputed',
  negotiating: 'Negotiating',
  forgiven: 'Forgiven',
}

export const DOC_STATUSES: Record<EstateDocument['status'], string> = {
  needed: 'Needed',
  obtained: 'Obtained',
  filed: 'Filed',
  not_applicable: 'N/A',
}
