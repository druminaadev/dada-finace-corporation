import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { addDays, addMonths, format } from 'date-fns'
import { SEED_STATES, SEED_CITIES, SEED_AREAS, SEED_BRANCHES, SEED_BANKS, SEED_LOAN_TYPES, SEED_EMPLOYEES, SEED_CUSTOMERS, SEED_LOANS } from './seedData'

export interface State { id: number; name: string }
export interface City { id: number; stateId: number; name: string }
export interface Area { id: number; cityId: number; name: string }
export interface Branch { id: number; name: string; address: string }
export interface Bank { id: number; name: string }
export interface LoanType { id: number; name: string; description: string }

export interface EMIInstalment {
  id: number; loanId: number; instNo: number; dueDate: string
  emiAmount: number; principal: number; interest: number; outstanding: number
  status: 'upcoming' | 'paid' | 'paid_late' | 'overdue'
  paidDate?: string; paidAmount?: number; paymentMode?: string; collectedBy?: number
  penaltyAmount?: number
}

export interface CivilScoreEvent {
  date: string; change: number; reason: string; score: number
}

export interface Employee {
  id: number; name: string; code: string; branchId: number
  contact: string; role: string; email: string
  photoUrl?: string
}

export interface CustomerBank {
  accountNo: string; holderName: string; bankName: string
  bankBranch: string; ifsc: string; documentUrl: string
}

export interface Nominee {
  identityProof: string; identityNo: string; name: string; relation: string
  dob: string; age: number; mobile: string; address: string
  photoUrl: string; accountNo: string; holderName: string
  bankName: string; bankBranch: string; ifsc: string; documentUrl: string
}

export interface Guarantor extends Nominee { slot: 1 | 2 }

export interface Customer {
  id: number; appNo: string; name: string; fatherName: string; motherName: string
  dob: string; age: number; gender: string; maritalStatus: string; bloodGroup: string
  occupation: string; regDate: string; mobile: string; altMobile: string
  email: string; aadhar: string; pan: string; jobAddress: string
  stateId: number; cityId: number; areaId: number; branchId: number
  employeeId: number; photoUrl: string; bank: CustomerBank
  nominee: Nominee | null; guarantor1: Guarantor | null; guarantor2: Guarantor | null
}

export interface SecurityDeposit {
  type: 'vehicle' | 'gold'
  modelName?: string; regNo?: string; chassisNo?: string; keys?: string; rcReceived?: boolean
  itemName?: string; weight?: number; pieces?: number; fileUrls: string[]
}

export interface LoanReceiver { mobile: string; documentUrl: string }

export interface Loan {
  id: number; loanNo: string; customerId: number; employeeId: number
  loanDate: string; emiStartDate: string; loanTypeId: number
  amount: number; installments: number; interestRate: number
  interestAmount: number; fileCharges: number; otherCharges: number
  intervalDays: string; remarks: string
  status: 'pending' | 'approved' | 'disbursed'
  security: SecurityDeposit; receiver: LoanReceiver
}

interface AppStore {
  // Master
  states: State[]; cities: City[]; areas: Area[]
  branches: Branch[]; banks: Bank[]; loanTypes: LoanType[]
  // Entities
  employees: Employee[]; customers: Customer[]; loans: Loan[]
  emis: EMIInstalment[]
  civilScores: Record<number, { score: number; history: CivilScoreEvent[] }>
  // Master CRUD
  addState: (s: Omit<State, 'id'>) => void
  updateState: (id: number, s: Partial<State>) => void
  deleteState: (id: number) => void
  addCity: (c: Omit<City, 'id'>) => void
  updateCity: (id: number, c: Partial<City>) => void
  deleteCity: (id: number) => void
  addArea: (a: Omit<Area, 'id'>) => void
  updateArea: (id: number, a: Partial<Area>) => void
  deleteArea: (id: number) => void
  addBranch: (b: Omit<Branch, 'id'>) => void
  updateBranch: (id: number, b: Partial<Branch>) => void
  deleteBranch: (id: number) => void
  addBank: (b: Omit<Bank, 'id'>) => void
  updateBank: (id: number, b: Partial<Bank>) => void
  deleteBank: (id: number) => void
  addLoanType: (lt: Omit<LoanType, 'id'>) => void
  updateLoanType: (id: number, lt: Partial<LoanType>) => void
  deleteLoanType: (id: number) => void
  // Employee CRUD
  addEmployee: (e: Omit<Employee, 'id' | 'code'>) => void
  updateEmployee: (id: number, e: Partial<Employee>) => void
  deleteEmployee: (id: number) => void
  // Customer CRUD
  addCustomer: (c: Omit<Customer, 'id' | 'appNo'>) => void
  updateCustomer: (id: number, c: Partial<Customer>) => void
  deleteCustomer: (id: number) => void
  updateNominee: (customerId: number, n: Nominee) => void
  updateGuarantor: (customerId: number, slot: 1 | 2, g: Guarantor) => void
  // Loan CRUD
  addLoan: (l: Omit<Loan, 'id' | 'loanNo' | 'status'>) => void
  updateLoan: (id: number, l: Partial<Loan>) => void
  deleteLoan: (id: number) => void
  approveLoan: (id: number) => void
  disburseLoan: (id: number) => void
  // EMI
  generateEMIs: (loanId: number) => void
  collectEMI: (emiId: number, paidAmount: number, paymentMode: string, collectedBy: number, paidDate: string) => void
  // Civil Score
  applyScoreEvent: (customerId: number, change: number, reason: string) => void
}

const nextId = (arr: { id: number }[]) =>
  arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1

const mergeSeed = <T extends { id: number }>(persisted: T[], seed: T[]): T[] => {
  const seedIds = new Set(seed.map(s => s.id))
  const adminAdded = persisted.filter(p => !seedIds.has(p.id))
  return [...seed, ...adminAdded]
}

function stripPhotos(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) {
    return obj.map(stripPhotos)
  }
  const result = { ...obj }
  for (const key of Object.keys(result)) {
    const val = result[key]
    if (typeof val === 'string' && val.startsWith('data:image')) {
      result[key] = ''
    } else if (val && typeof val === 'object') {
      result[key] = stripPhotos(val)
    }
  }
  return result
}

const safeStorage = {
  getItem: (name: string) => {
    try { return localStorage.getItem(name) } catch { return null }
  },
  setItem: (name: string, value: string) => {
    try {
      // Parse, strip all base64 images, then re-serialize
      const parsed = JSON.parse(value)
      if (parsed?.state?.customers) {
        parsed.state.customers = parsed.state.customers.map((c: Customer) => stripPhotos(c))
      }
      if (parsed?.state?.employees) {
        parsed.state.employees = parsed.state.employees.map((e: Employee) => stripPhotos(e))
      }
      localStorage.setItem(name, JSON.stringify(parsed))
    } catch (e) {
      // If still too large, persist everything except customers' and employees' photos
      try {
        const parsed = JSON.parse(value)
        if (parsed?.state?.customers) {
          parsed.state.customers = parsed.state.customers.map((c: Customer) => ({
            ...c, photoUrl: '',
            nominee: c.nominee ? { ...c.nominee, photoUrl: '', documentUrl: '' } : null,
            guarantor1: c.guarantor1 ? { ...c.guarantor1, photoUrl: '', documentUrl: '' } : null,
            guarantor2: c.guarantor2 ? { ...c.guarantor2, photoUrl: '', documentUrl: '' } : null,
            bank: c.bank ? { ...c.bank, documentUrl: '' } : c.bank,
          }))
        }
        if (parsed?.state?.employees) {
          parsed.state.employees = parsed.state.employees.map((e: Employee) => ({
            ...e, photoUrl: '',
          }))
        }
        localStorage.setItem(name, JSON.stringify(parsed))
      } catch {
        console.warn('localStorage quota exceeded — skipping persist')
      }
    }
  },
  removeItem: (name: string) => {
    try { localStorage.removeItem(name) } catch { /* noop */ }
  },
}

const nextPaddedCode = <T extends Record<K, string>, K extends keyof T>(
  arr: T[],
  key: K,
  prefix: string,
  minNumber = 1,
  width = 3
) => {
  const maxNumber = arr.reduce((max, item) => {
    const match = item[key].match(new RegExp(`^${prefix}(\\d+)$`, 'i'))
    return match ? Math.max(max, Number(match[1])) : max
  }, minNumber - 1)
  return `${prefix}${String(maxNumber + 1).padStart(width, '0')}`
}

export const getNextEmployeeCode = (employees: Employee[]) =>
  nextPaddedCode(employees, 'code', 'EMP')

export const getNextLoanNo = (loans: Loan[]) =>
  nextPaddedCode(loans, 'loanNo', 'LN', 1, 3)

function buildEMISchedule(loan: Loan): Omit<EMIInstalment, 'id'>[] {
  const { id: loanId, amount, installments, interestRate, emiStartDate, intervalDays, loanTypeId } = loan
  const today = new Date().toISOString().split('T')[0]
  const isReducing = loanTypeId === 2
  const intervalNum = intervalDays === '7 Days' ? 7 : intervalDays === '14 Days' ? 14 : intervalDays === 'Quarterly' ? 90 : 30
  const isMonthly = intervalDays === 'Monthly' || intervalDays === 'Quarterly'
  const schedule: Omit<EMIInstalment, 'id'>[] = []
  let outstanding = amount
  const monthlyRate = interestRate / 100 / 12

  for (let i = 1; i <= installments; i++) {
    let dueDate: string
    if (isMonthly) {
      dueDate = format(addMonths(new Date(emiStartDate), i - 1), 'yyyy-MM-dd')
    } else {
      dueDate = format(addDays(new Date(emiStartDate), (i - 1) * intervalNum), 'yyyy-MM-dd')
    }
    let interest: number, principal: number, emiAmount: number
    if (isReducing) {
      interest = Math.round(outstanding * monthlyRate)
      const totalEMI = Math.round(amount * monthlyRate * Math.pow(1 + monthlyRate, installments) / (Math.pow(1 + monthlyRate, installments) - 1))
      principal = totalEMI - interest
      emiAmount = totalEMI
      outstanding = Math.max(0, outstanding - principal)
    } else {
      const totalInterest = amount * (interestRate / 100) * (installments / 12)
      emiAmount = Math.round((amount + totalInterest) / installments)
      principal = Math.round(amount / installments)
      interest = emiAmount - principal
      outstanding = Math.max(0, outstanding - principal)
    }
    const status: EMIInstalment['status'] = dueDate < today ? 'overdue' : 'upcoming'
    schedule.push({ loanId, instNo: i, dueDate, emiAmount, principal, interest, outstanding, status })
  }
  return schedule
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      states: SEED_STATES,
      cities: SEED_CITIES,
      areas: SEED_AREAS,
      branches: SEED_BRANCHES,
      banks: SEED_BANKS,
      loanTypes: SEED_LOAN_TYPES,
      employees: SEED_EMPLOYEES,
      customers: SEED_CUSTOMERS,
      loans: SEED_LOANS,
      emis: [],
      civilScores: {},

      // State CRUD
      addState: (s: Omit<State, 'id'>) => set((st: any) => ({ states: [...st.states, { ...s, id: nextId(st.states) }] })),
      updateState: (id: number, s: Partial<State>) => set((st: any) => ({ states: st.states.map((x: any) => x.id === id ? { ...x, ...s } : x) })),
      deleteState: (id: number) => set((st: any) => ({ states: st.states.filter((x: any) => x.id !== id) })),
      // City CRUD
      addCity: (c: Omit<City, 'id'>) => set((st: any) => ({ cities: [...st.cities, { ...c, id: nextId(st.cities) }] })),
      updateCity: (id: number, c: Partial<City>) => set((st: any) => ({ cities: st.cities.map((x: any) => x.id === id ? { ...x, ...c } : x) })),
      deleteCity: (id: number) => set((st: any) => ({ cities: st.cities.filter((x: any) => x.id !== id) })),
      // Area CRUD
      addArea: (a: Omit<Area, 'id'>) => set((st: any) => ({ areas: [...st.areas, { ...a, id: nextId(st.areas) }] })),
      updateArea: (id: number, a: Partial<Area>) => set((st: any) => ({ areas: st.areas.map((x: any) => x.id === id ? { ...x, ...a } : x) })),
      deleteArea: (id: number) => set((st: any) => ({ areas: st.areas.filter((x: any) => x.id !== id) })),
      // Branch CRUD
      addBranch: (b: Omit<Branch, 'id'>) => set((st: any) => ({ branches: [...st.branches, { ...b, id: nextId(st.branches) }] })),
      updateBranch: (id: number, b: Partial<Branch>) => set((st: any) => ({ branches: st.branches.map((x: any) => x.id === id ? { ...x, ...b } : x) })),
      deleteBranch: (id: number) => set((st: any) => ({ branches: st.branches.filter((x: any) => x.id !== id) })),
      // Bank CRUD
      addBank: (b: Omit<Bank, 'id'>) => set((st: any) => ({ banks: [...st.banks, { ...b, id: nextId(st.banks) }] })),
      updateBank: (id: number, b: Partial<Bank>) => set((st: any) => ({ banks: st.banks.map((x: any) => x.id === id ? { ...x, ...b } : x) })),
      deleteBank: (id: number) => set((st: any) => ({ banks: st.banks.filter((x: any) => x.id !== id) })),
      // LoanType CRUD
      addLoanType: (lt: Omit<LoanType, 'id'>) => set((st: any) => ({ loanTypes: [...st.loanTypes, { ...lt, id: nextId(st.loanTypes) }] })),
      updateLoanType: (id: number, lt: Partial<LoanType>) => set((st: any) => ({ loanTypes: st.loanTypes.map((x: any) => x.id === id ? { ...x, ...lt } : x) })),
      deleteLoanType: (id: number) => set((st: any) => ({ loanTypes: st.loanTypes.filter((x: any) => x.id !== id) })),
      // Employee CRUD
      addEmployee: (e: Omit<Employee, 'id' | 'code'>) => set((st: any) => ({
        employees: [...st.employees, { ...e, id: nextId(st.employees), code: getNextEmployeeCode(st.employees) }],
      })),
      updateEmployee: (id: number, e: Partial<Employee>) => set((st: any) => ({ employees: st.employees.map((x: any) => x.id === id ? { ...x, ...e } : x) })),
      deleteEmployee: (id: number) => set((st: any) => ({ employees: st.employees.filter((x: any) => x.id !== id) })),
      // Customer CRUD
      addCustomer: (c: Omit<Customer, 'id' | 'appNo'>) => set((st: any) => {
        const id = nextId(st.customers)
        const appNo = `APP${1000 + id}`
        return { customers: [...st.customers, { ...c, id, appNo }] }
      }),
      updateCustomer: (id: number, c: Partial<Customer>) => set((st: any) => ({ customers: st.customers.map((x: any) => x.id === id ? { ...x, ...c } : x) })),
      deleteCustomer: (id: number) => set((st: any) => ({ customers: st.customers.filter((x: any) => x.id !== id) })),
      updateNominee: (customerId: number, n: Nominee) => set((st: any) => ({ customers: st.customers.map((x: any) => x.id === customerId ? { ...x, nominee: n } : x) })),
      updateGuarantor: (customerId: number, slot: 1 | 2, g: Guarantor) => set((st: any) => ({
        customers: st.customers.map((x: any) => x.id === customerId
          ? { ...x, [slot === 1 ? 'guarantor1' : 'guarantor2']: g } : x)
      })),
      // Loan CRUD
      addLoan: (l: Omit<Loan, 'id' | 'loanNo' | 'status'>) => set((st: any) => {
        const id = nextId(st.loans)
        // Auto-create customer if not exists (check by customerId or create new)
        let customerId = l.customerId
        if (!st.customers.find((c: any) => c.id === customerId)) {
          // Customer doesn't exist, create a placeholder (in real app, extract from loan form data)
          const newCustomerId = nextId(st.customers)
          // This is a simplified version - in production, you'd pass full customer data
          customerId = newCustomerId
        }
        return { loans: [...st.loans, { ...l, customerId, id, loanNo: getNextLoanNo(st.loans), status: 'pending' }] }
      }),
      updateLoan: (id: number, l: Partial<Loan>) => set((st: any) => ({ loans: st.loans.map((x: any) => x.id === id ? { ...x, ...l } : x) })),
      deleteLoan: (id: number) => set((st: any) => ({ loans: st.loans.filter((x: any) => x.id !== id) })),
      approveLoan: (id: number) => set((st: any) => ({ loans: st.loans.map((x: any) => x.id === id ? { ...x, status: 'approved' } : x) })),
      disburseLoan: (id: number) => set((st: any) => ({
        loans: st.loans.map((x: any) => x.id === id ? { ...x, status: 'disbursed' } : x),
      })),
      generateEMIs: (loanId: number) => set((st: any) => {
        const loan = st.loans.find((l: any) => l.id === loanId)
        if (!loan) return {}
        const existing = st.emis.filter((e: any) => e.loanId !== loanId)
        const newEmis = buildEMISchedule(loan)
        let nextEmiId = st.emis.length ? Math.max(...st.emis.map((e: any) => e.id)) + 1 : 1
        const withIds = newEmis.map(e => ({ ...e, id: nextEmiId++ }))
        return { emis: [...existing, ...withIds] }
      }),
      collectEMI: (emiId: number, paidAmount: number, paymentMode: string, collectedBy: number, paidDate: string) => set((st: any) => {
        const emi = st.emis.find((e: any) => e.id === emiId)
        if (!emi) return {}
        const loan = st.loans.find((l: any) => l.id === emi.loanId)
        const customer = loan ? st.customers.find((c: any) => c.id === loan.customerId) : null
        const today = new Date().toISOString().split('T')[0]
        const daysLate = Math.max(0, Math.floor((new Date(paidDate).getTime() - new Date(emi.dueDate).getTime()) / 86400000))
        const status: EMIInstalment['status'] = daysLate === 0 ? 'paid' : 'paid_late'
        const penalty = daysLate > 7 ? Math.round(emi.emiAmount * 0.02) : daysLate > 0 ? Math.round(emi.emiAmount * 0.01) : 0
        const updatedEmis = st.emis.map((e: any) => e.id === emiId ? { ...e, status, paidDate, paidAmount, paymentMode, collectedBy, penaltyAmount: penalty } : e)
        // Civil score update
        if (customer) {
          const existing = st.civilScores[customer.id] ?? { score: 700, history: [] }
          const change = daysLate === 0 ? 10 : daysLate <= 7 ? -5 : -10
          const reason = daysLate === 0 ? 'On-time EMI payment' : daysLate <= 7 ? 'Late payment (1-7 days)' : 'Very late payment (7+ days)'
          const newScore = Math.max(0, Math.min(900, existing.score + change))
          return {
            emis: updatedEmis,
            civilScores: {
              ...st.civilScores,
              [customer.id]: {
                score: newScore,
                history: [...existing.history, { date: today, change, reason, score: newScore }],
              },
            },
          }
        }
        return { emis: updatedEmis }
      }),
      applyScoreEvent: (customerId: number, change: number, reason: string) => set((st: any) => {
        const existing = st.civilScores[customerId] ?? { score: 700, history: [] }
        const newScore = Math.max(0, Math.min(900, existing.score + change))
        const today = new Date().toISOString().split('T')[0]
        return {
          civilScores: {
            ...st.civilScores,
            [customerId]: {
              score: newScore,
              history: [...existing.history, { date: today, change, reason, score: newScore }],
            },
          },
        }
      }),
    }),
    {
      name: 'nexzen-lms-store',
      storage: createJSONStorage(() => safeStorage),
      merge: (persisted: any, current: any) => {
        if (!persisted) return current
        return {
          ...current,
          ...persisted,
          states: mergeSeed(persisted.states || [], SEED_STATES),
          cities: mergeSeed(persisted.cities || [], SEED_CITIES),
          areas: mergeSeed(persisted.areas || [], SEED_AREAS),
          branches: mergeSeed(persisted.branches || [], SEED_BRANCHES),
          banks: mergeSeed(persisted.banks || [], SEED_BANKS),
          loanTypes: mergeSeed(persisted.loanTypes || [], SEED_LOAN_TYPES),
          employees: mergeSeed(persisted.employees || [], SEED_EMPLOYEES),
          customers: mergeSeed(persisted.customers || [], SEED_CUSTOMERS),
          loans: mergeSeed(persisted.loans || [], SEED_LOANS),
        }
      },
    }
  )
)
