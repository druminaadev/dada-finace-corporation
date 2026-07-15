// appStore.ts
import { create } from 'zustand'

export interface State { id: string; name: string; code?: string }
export interface City { id: string; stateId: string; name: string }
export interface Area { id: string; cityId: string; name: string; pincode?: string }
export interface Branch { id: string; name: string; code?: string; address?: string }
export interface Bank { id: string; name: string; ifscPrefix?: string }
export interface LoanType { id: string; name: string; minAmount?: number; maxAmount?: number; minInterestRate?: number; maxInterestRate?: number; minTenure?: number; maxTenure?: number }

export interface Employee {
  id: string; name: string; employeeCode?: string; branchId?: string
  phone?: string; role: string; email: string; isActive?: boolean
}

export interface Customer {
  id: string; appNo?: string; name: string; fatherName?: string; motherName?: string
  dob?: string; gender?: string; maritalStatus?: string; bloodGroup?: string
  occupation?: string; createdAt?: string; phone: string; altPhone?: string
  email?: string; aadhaarNumber?: string; panNumber?: string; address?: string
  stateId?: string; cityId?: string; areaId?: string; branchId?: string
  employeeId?: string; photoUrl?: string
}

export interface Loan {
  id: string; loanNumber?: string; customerId: string; employeeId?: string
  loanDate?: string; emiStartDate?: string; loanTypeId?: string
  principalAmount: number; tenure: number; interestRate: number
  interestType?: string; processingFee?: number; status: string
  disbursedAt?: string; notes?: string
}

export interface EMIInstalment {
  id: string; loanId: string; installmentNumber: number; dueDate: string
  emiAmount: number; principalAmount: number; interestAmount: number; outstandingAmount: number
  status: string; paidDate?: string; paidAmount?: number; paymentMode?: string
  collectedById?: string; penaltyAmount?: number
}

export interface Guarantor {
  id: string; loanId: string; name: string; phone: string; relationship?: string
  aadhaarNumber?: string; panNumber?: string; address?: string; occupation?: string
  monthlyIncome?: number; photoUrl?: string
}

export interface Nominee {
  id: string; customerId: string; name: string; relationship: string
  phone?: string; dob?: string; address?: string; aadhaarNumber?: string
}

export interface CivilScore {
  id: string; customerId: string; score: number; provider?: string
  reportDate?: string; history?: { date: string; change: number; reason: string; score: number }[]
}

interface AppStore {
  loans: Loan[]
  customers: Customer[]
  employees: Employee[]
  setLoans: (loans: Loan[]) => void
  setCustomers: (customers: Customer[]) => void
  setEmployees: (employees: Employee[]) => void
}

export const useStore = create<AppStore>((set) => ({
  loans: [],
  customers: [],
  employees: [],
  setLoans: (loans) => set({ loans }),
  setCustomers: (customers) => set({ customers }),
  setEmployees: (employees) => set({ employees }),
}))
