import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AadhaarData {
  aadhaar: string
  name: string
  dob: string
  gender: string
  phone: string
  address: string
  photoUrl?: string | null
}

export interface Stage1Data {
  aadhaarVerified: boolean
  aadhaarData: AadhaarData | null
}

export interface CustomerDetails {
  name: string
  phone: string
  altPhone: string
  email: string
  dob: string
  age: string
  gender: string
  maritalStatus: string
  occupation: string
  income: string
  businessInfo: string
  address: string
  fatherName: string
  motherName: string
  pan: string
  bloodGroup: string
  bankAccountNo: string
  bankHolderName: string
  bankName: string
  bankBranch: string
  bankIfsc: string
}

export interface LoanDetails {
  loanCategory: 'GOLD' | 'PERSONAL' | 'VEHICLE'
  amount: string
  interestRate: string
  interestType: 'FLAT' | 'REDUCING'
  tenure: string
  processingFee: string
  emiStartDate: string
  emiAmount?: number
  purpose: string
  notes: string
  securityType?: string
  securityData?: Record<string, unknown>
}

export interface Stage2Data {
  customerDetails: Partial<CustomerDetails>
  loanDetails: Partial<LoanDetails>
}

export interface PersonDetails {
  name: string
  phone: string
  relationship: string
  aadhaar: string
  pan?: string
  address: string
  occupation: string
  income: string
  dob: string
  email?: string
  photoFile?: string
  documentFile?: string
}

export interface Stage3Data {
  nominees: [Partial<PersonDetails>, Partial<PersonDetails>]
  guarantors: [Partial<PersonDetails>, Partial<PersonDetails>]
}

export interface UploadedFile {
  category: string
  fileName: string
  url?: string
  size?: number
}

export interface Stage4Data {
  customerDocs: UploadedFile[]
  nomineeDocs: UploadedFile[]
  guarantorDocs: UploadedFile[]
  vehicleDocs: UploadedFile[]
}

export interface LoanDraftStore {
  // Draft ID (from backend after creation)
  draftId: string | null
  currentStage: number
  // Stage completion flags
  stage1Done: boolean
  stage2Done: boolean
  stage3Done: boolean
  stage4Done: boolean
  // Stage data
  stage1: Stage1Data
  stage2: Stage2Data
  stage3: Stage3Data
  stage4: Stage4Data
  // OTP state
  otpSent: boolean
  otpVerifying: boolean
  otpError: string | null
  maskedPhone: string | null
  devOtp: string | null
  // Submission
  submitting: boolean
  submitted: boolean
  submittedLoanId: string | null

  // Actions
  setDraftId: (id: string) => void
  setCurrentStage: (stage: number) => void
  completeStage: (stage: number) => void
  setStage1: (data: Partial<Stage1Data>) => void
  setStage2: (data: Partial<Stage2Data>) => void
  setStage3: (data: Partial<Stage3Data>) => void
  setStage4: (data: Partial<Stage4Data>) => void
  setOtpState: (state: Partial<Pick<LoanDraftStore, 'otpSent' | 'otpVerifying' | 'otpError' | 'maskedPhone' | 'devOtp'>>) => void
  setSubmitting: (v: boolean) => void
  setSubmitted: (loanId: string) => void
  canAccessStage: (stage: number) => boolean
  resetDraft: () => void
}

const emptyPerson: Partial<PersonDetails> = {
  name: '', phone: '', relationship: '', aadhaar: '',
  address: '', occupation: '', income: '', dob: '',
}

const initialState = {
  draftId: null,
  currentStage: 1,
  stage1Done: false,
  stage2Done: false,
  stage3Done: false,
  stage4Done: false,
  stage1: { aadhaarVerified: false, aadhaarData: null },
  stage2: { customerDetails: {}, loanDetails: { loanCategory: 'PERSONAL' as const, interestType: 'FLAT' as const } },
  stage3: {
    nominees: [{ ...emptyPerson }, { ...emptyPerson }] as [Partial<PersonDetails>, Partial<PersonDetails>],
    guarantors: [{ ...emptyPerson }, { ...emptyPerson }] as [Partial<PersonDetails>, Partial<PersonDetails>]
  },
  stage4: { customerDocs: [], nomineeDocs: [], guarantorDocs: [], vehicleDocs: [] },
  otpSent: false,
  otpVerifying: false,
  otpError: null,
  maskedPhone: null,
  devOtp: null,
  submitting: false,
  submitted: false,
  submittedLoanId: null,
}

export const useLoanDraftStore = create<LoanDraftStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setDraftId: (id) => set({ draftId: id }),
      setCurrentStage: (stage) => set({ currentStage: stage }),

      completeStage: (stage) => {
        try {
          set({
            [`stage${stage}Done`]: true,
            currentStage: Math.max(get().currentStage, stage + 1),
          } as any)
        } catch (error) {
          console.error('Storage error:', error)
          // Continue without saving if quota exceeded
        }
      },

      setStage1: (data) => {
        try {
          set(s => ({ stage1: { ...s.stage1, ...data } }))
        } catch (error) {
          console.error('Storage error:', error)
        }
      },

      setStage2: (data) => {
        try {
          set(s => ({
            stage2: {
              customerDetails: { ...s.stage2.customerDetails, ...(data.customerDetails || {}) },
              loanDetails: { ...s.stage2.loanDetails, ...(data.loanDetails || {}) },
            },
          }))
        } catch (error) {
          console.error('Storage error:', error)
        }
      },

      setStage3: (data) => {
        try {
          set(s => ({
            stage3: {
              nominees: data.nominees ?? s.stage3.nominees,
              guarantors: data.guarantors ?? s.stage3.guarantors,
            },
          }))
        } catch (error) {
          console.error('Storage error:', error)
        }
      },

      setStage4: (data) => {
        try {
          set(s => ({ stage4: { ...s.stage4, ...data } }))
        } catch (error) {
          console.error('Storage error:', error)
        }
      },

      setOtpState: (state) => set(state),

      setSubmitting: (v) => set({ submitting: v }),

      setSubmitted: (loanId) => set({ submitted: true, submittedLoanId: loanId, submitting: false }),

      canAccessStage: (stage) => {
        const s = get()
        if (stage === 1) return true
        if (stage === 2) return s.stage1Done
        if (stage === 3) return s.stage2Done
        if (stage === 4) return s.stage3Done
        if (stage === 5) return s.stage3Done // stage 4 (docs) is optional
        return false
      },

      resetDraft: () => set({ ...initialState } as any),
    }),
    { name: 'nexzen-loan-draft' }
  )
)
