export type TransactionType = 'income' | 'expense'
export type PaymentStatus = 'paid' | 'unpaid'
export type AdminRole = 'super_admin' | 'admin' | 'bendahara'

export interface StudentClass {
  id: number
  name: string
  code: string
  label: string
  description?: string | null
  members_count?: number
}

export interface Member {
  id: number
  class_id: number | null
  name: string
  slug: string
  nrp: string
  gender: 'L' | 'P' | null
  role: string
  photo: string | null
  cloudinary_public_id?: string | null
  bio: string | null
  quote: string | null
  instagram: string | null
  linkedin: string | null
  github: string | null
  is_active: boolean
  student_class?: StudentClass | null
  timah_panas_participants?: TimahPanasParticipant[]
  cash_payments?: CashPayment[]
}

export interface TimahPanasRequirement {
  id: number
  name: string
  slug: string
  description: string | null
  target: number
  sort_order: number
  is_active: boolean
  fulfilled: number
  percentage: number
  status: string
  participants_count?: number
}

export interface TimahPanasParticipant {
  id: number
  requirement_id: number
  member_id: number
  participation_date: string | null
  notes: string | null
  proof_url: string | null
  proof_public_id?: string | null
  member?: Member
  requirement?: TimahPanasRequirement
}

export interface ClassContribution {
  id: number
  name: string
  code: string
  label: string
  total: number
}

export interface CashPeriod {
  id: number
  name: string
  month: number
  year: number
  amount: number
  due_date: string | null
  is_active: boolean
  payments_count?: number
}

export interface CashPayment {
  id: number
  member_id: number
  cash_period_id: number
  amount: number
  payment_date: string | null
  status: PaymentStatus
  notes: string | null
  receipt_url: string | null
  receipt_public_id?: string | null
  member?: Member
  period?: CashPeriod
}

export interface MemberStatusRow {
  member_id: number
  nrp: string
  name: string
  slug: string
  photo: string | null
  class_id: number | null
  class: string | null
  payment_id: number | null
  status: PaymentStatus
  status_label: string
  amount: number
  payment_date: string | null
  notes: string | null
  period: string | null
}

export interface ClassBreakdown {
  id: number
  name: string
  code: string
  label: string
  total_members: number
  paid: number
  unpaid: number
  percentage: number
  total_amount: number
}

export interface CashSummary {
  total_income: number
  total_expense: number
  balance: number
  transaction_count: number
  total_members: number
  paid: number
  unpaid: number
  percentage: number
  collected: number
  period: CashPeriod | null
  periods: CashPeriod[]
  monthly_amount: number
}

export interface CashOverview extends CashSummary {
  classes: ClassBreakdown[]
}

export interface CashTransaction {
  id: number
  transaction_date: string
  type: TransactionType
  category: string | null
  description: string
  amount: number
  receipt_url: string | null
  receipt_public_id?: string | null
  created_by: string | null
  balance_after?: number | null
}

export interface Gallery {
  id: number
  title: string
  image_url: string | null
  cloudinary_public_id?: string | null
  description: string | null
  category: string | null
  sort_order: number
}

export interface Activity {
  id: number
  title: string
  slug: string
  description: string | null
  image_url: string | null
  cloudinary_public_id?: string | null
  location: string | null
  event_date: string | null
}

export interface TimelineItem {
  id: number
  period: string
  title: string
  description: string | null
  sort_order: number
}

export interface TimahPanasSummary {
  total_requirements: number
  fulfilled_requirements: number
  total_participation: number
  total_target: number
  overall_progress: number
}

export interface Paginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface TransactionResponse extends Paginated<CashTransaction> {
  filters: { years: number[] }
}

export interface DashboardData {
  total_members: number
  total_classes: number
  balance: number
  total_income: number
  total_expense: number
  paid: number
  unpaid: number
  percentage: number
  collected: number
  period: CashPeriod | null
  total_requirements: number
  completed_requirements: number
  total_participation: number
  classes: ClassBreakdown[]
  requirements: TimahPanasRequirement[]
  recent_transactions: CashTransaction[]
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: AdminRole
}

export interface LoginResponse {
  message: string
  token: string
  user: AdminUser
}

export interface MembersResponse {
  data: Member[]
  meta: {
    total: number
    classes: StudentClass[]
  }
}

export interface TimahPanasResponse {
  data: TimahPanasRequirement[]
  summary: TimahPanasSummary
  class_contribution: ClassContribution[]
}

export interface TimahPanasDetailResponse {
  data: TimahPanasRequirement
  participants: TimahPanasParticipant[]
}

export interface ParticipantsResponse {
  requirement: TimahPanasRequirement
  data: TimahPanasParticipant[]
  class_contribution: ClassContribution[]
}

export interface UploadResult {
  url: string
  public_id: string
  resource_type: string
  original_filename: string
  format: string | null
  size: number
  mime_type: string | null
}

export interface StudentMember {
  id: number
  class_id: number | null
  name: string
  slug: string
  nrp: string
  email?: string | null
  gender: 'L' | 'P' | null
  role: string
  photo: string | null
  bio: string | null
  quote: string | null
  instagram: string | null
  linkedin: string | null
  github: string | null
  is_active: boolean
  must_change_password?: boolean
  last_login_at?: string | null
  student_class?: StudentClass | null
}

export interface StudentLoginResponse {
  message: string
  token: string
  member: StudentMember
  must_change_password: boolean
}

export interface PortalPeriod {
  id: number
  name: string
  month: number
  year: number
  amount: number
  due_date: string | null
  status: 'paid' | 'unpaid'
  status_label: string
  payment_date: string | null
  payment_method: string | null
}

export interface PortalCashPagination {
  total: number
  per_page: number
  current_page: number
  last_page: number
}

export interface PortalCash {
  periods: PortalPeriod[]
  pagination?: PortalCashPagination
  summary: {
    total_tagihan: number
    total_paid: number
    total_unpaid: number
    paid_count: number
    unpaid_count: number
  }
}

export interface SnapTokenResponse {
  order_id: string
  snap_token: string
  snap_url: string
  client_key: string
  gross_amount: number
  period_name: string
}

export interface PaymentStatusResponse {
  tagihan_id: number
  period_name: string
  amount: number
  status: 'paid' | 'unpaid' | 'pending'
  payment_status: 'paid' | 'unpaid' | 'pending' | 'failed'
  paid_at: string | null
  snap_token: string | null
  order_id: string | null
}
