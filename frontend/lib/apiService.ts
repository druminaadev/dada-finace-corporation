import { API_ENDPOINTS } from './api'
import { useAuthStore } from '@/store/authStore'

const getToken = () => useAuthStore.getState().token || ''

const req = async (url: string, options: RequestInit = {}) => {
  const token = getToken()
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`)
  return data.data
}

const get = (url: string, params?: Record<string, any>) => {
  const query = params ? '?' + new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
  ).toString() : ''
  return req(`${url}${query}`)
}

const post = (url: string, body: any) => req(url, { method: 'POST', body: JSON.stringify(body) })
const put = (url: string, body: any) => req(url, { method: 'PUT', body: JSON.stringify(body) })
const patch = (url: string, body?: any) => req(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined })
const del = (url: string) => req(url, { method: 'DELETE' })

const uploadFile = async (url: string, formData: FormData) => {
  const token = getToken()
  const res = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Upload failed')
  return data.data
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getSummary: () => get(API_ENDPOINTS.DASHBOARD),
}

// ── Customers ─────────────────────────────────────────────────────────────────
export const customersApi = {
  getAll: (params?: { search?: string; page?: number; limit?: number; branchId?: string }) =>
    get(API_ENDPOINTS.CUSTOMERS, params),
  getById: (id: string) => get(`${API_ENDPOINTS.CUSTOMERS}/${id}`),
  create: (data: any) => post(API_ENDPOINTS.CUSTOMERS, data),
  update: (id: string, data: any) => put(`${API_ENDPOINTS.CUSTOMERS}/${id}`, data),
  delete: (id: string) => del(`${API_ENDPOINTS.CUSTOMERS}/${id}`),
}

// ── Loans ─────────────────────────────────────────────────────────────────────
export const loansApi = {
  getAll: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    get(API_ENDPOINTS.LOANS, params),
  getById: (id: string) => get(`${API_ENDPOINTS.LOANS}/${id}`),
  create: (data: any) => post(API_ENDPOINTS.LOANS, data),
  update: (id: string, data: any) => put(`${API_ENDPOINTS.LOANS}/${id}`, data),
  delete: (id: string) => del(`${API_ENDPOINTS.LOANS}/${id}`),
  approve: (id: string, data?: any) => patch(`${API_ENDPOINTS.LOANS}/${id}/approve`, data),
  reject: (id: string, data?: any) => patch(`${API_ENDPOINTS.LOANS}/${id}/reject`, data),
  disburse: (id: string, data?: any) => patch(`${API_ENDPOINTS.LOANS}/${id}/disburse`, data),
}

// ── EMI ───────────────────────────────────────────────────────────────────────
export const emiApi = {
  getByLoan: (loanId: string) => get(`${API_ENDPOINTS.EMI}/loan/${loanId}`),
  getAll: (params?: { status?: string; page?: number; limit?: number; search?: string }) =>
    get(API_ENDPOINTS.EMI, params),
  collect: (id: string, data: any) => post(`${API_ENDPOINTS.EMI}/${id}/collect`, data),
  getUpcoming: (params?: { days?: number; page?: number; limit?: number }) =>
    get(`${API_ENDPOINTS.EMI}/upcoming`, params),
  getOverdue: (params?: { page?: number; limit?: number }) =>
    get(`${API_ENDPOINTS.EMI}/overdue`, params),
  getCalendar: (params?: { month?: string; year?: string }) =>
    get(`${API_ENDPOINTS.EMI}/calendar`, params),
}

// ── Employees ─────────────────────────────────────────────────────────────────
export const employeesApi = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) =>
    get(API_ENDPOINTS.EMPLOYEES, params),
  getById: (id: string) => get(`${API_ENDPOINTS.EMPLOYEES}/${id}`),
  create: (data: any) => post(API_ENDPOINTS.EMPLOYEES, data),
  update: (id: string, data: any) => put(`${API_ENDPOINTS.EMPLOYEES}/${id}`, data),
  delete: (id: string) => del(`${API_ENDPOINTS.EMPLOYEES}/${id}`),
}

// ── Branches ──────────────────────────────────────────────────────────────────
export const branchesApi = {
  getAll: (params?: { search?: string }) => get(API_ENDPOINTS.BRANCHES, params),
  getById: (id: string) => get(`${API_ENDPOINTS.BRANCHES}/${id}`),
  create: (data: any) => post(API_ENDPOINTS.BRANCHES, data),
  update: (id: string, data: any) => put(`${API_ENDPOINTS.BRANCHES}/${id}`, data),
  delete: (id: string) => del(`${API_ENDPOINTS.BRANCHES}/${id}`),
}

// ── Master Data ───────────────────────────────────────────────────────────────
export const masterApi = {
  getStates: () => get(`${API_ENDPOINTS.MASTER}/states`),
  createState: (data: any) => post(`${API_ENDPOINTS.MASTER}/states`, data),
  updateState: (id: string, data: any) => put(`${API_ENDPOINTS.MASTER}/states/${id}`, data),
  deleteState: (id: string) => del(`${API_ENDPOINTS.MASTER}/states/${id}`),

  getCities: (params?: { stateId?: string }) => get(`${API_ENDPOINTS.MASTER}/cities`, params),
  createCity: (data: any) => post(`${API_ENDPOINTS.MASTER}/cities`, data),
  updateCity: (id: string, data: any) => put(`${API_ENDPOINTS.MASTER}/cities/${id}`, data),
  deleteCity: (id: string) => del(`${API_ENDPOINTS.MASTER}/cities/${id}`),

  getAreas: (params?: { cityId?: string }) => get(`${API_ENDPOINTS.MASTER}/areas`, params),
  createArea: (data: any) => post(`${API_ENDPOINTS.MASTER}/areas`, data),
  updateArea: (id: string, data: any) => put(`${API_ENDPOINTS.MASTER}/areas/${id}`, data),
  deleteArea: (id: string) => del(`${API_ENDPOINTS.MASTER}/areas/${id}`),

  getBanks: () => get(`${API_ENDPOINTS.MASTER}/banks`),
  createBank: (data: any) => post(`${API_ENDPOINTS.MASTER}/banks`, data),
  updateBank: (id: string, data: any) => put(`${API_ENDPOINTS.MASTER}/banks/${id}`, data),
  deleteBank: (id: string) => del(`${API_ENDPOINTS.MASTER}/banks/${id}`),

  getLoanTypes: () => get(`${API_ENDPOINTS.MASTER}/loan-types`),
  createLoanType: (data: any) => post(`${API_ENDPOINTS.MASTER}/loan-types`, data),
  updateLoanType: (id: string, data: any) => put(`${API_ENDPOINTS.MASTER}/loan-types/${id}`, data),
  deleteLoanType: (id: string) => del(`${API_ENDPOINTS.MASTER}/loan-types/${id}`),
}

// ── Guarantors ────────────────────────────────────────────────────────────────
export const guarantorsApi = {
  getByLoan: (loanId: string) => get(`${API_ENDPOINTS.GUARANTORS}/loan/${loanId}`),
  create: (data: any) => post(API_ENDPOINTS.GUARANTORS, data),
  update: (id: string, data: any) => put(`${API_ENDPOINTS.GUARANTORS}/${id}`, data),
  delete: (id: string) => del(`${API_ENDPOINTS.GUARANTORS}/${id}`),
}

// ── Nominees ──────────────────────────────────────────────────────────────────
export const nomineesApi = {
  getByCustomer: (customerId: string) => get(`${API_ENDPOINTS.NOMINEES}/customer/${customerId}`),
  create: (data: any) => post(API_ENDPOINTS.NOMINEES, data),
  update: (id: string, data: any) => put(`${API_ENDPOINTS.NOMINEES}/${id}`, data),
  delete: (id: string) => del(`${API_ENDPOINTS.NOMINEES}/${id}`),
}

// ── Documents ─────────────────────────────────────────────────────────────────
export const documentsApi = {
  getByLoan: (loanId: string) => get(`${API_ENDPOINTS.DOCUMENTS}/loan/${loanId}`),
  upload: (formData: FormData) => uploadFile(API_ENDPOINTS.DOCUMENTS, formData),
  delete: (id: string) => del(`${API_ENDPOINTS.DOCUMENTS}/${id}`),
}

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsApi = {
  getDashboard: (params?: any) => get(`${API_ENDPOINTS.REPORTS}/dashboard`, params),
  getPortfolio: (params?: any) => get(`${API_ENDPOINTS.REPORTS}/portfolio`, params),
  getDailyCollection: (params?: any) => get(`${API_ENDPOINTS.REPORTS}/daily-collection`, params),
  getOutstanding: (params?: any) => get(`${API_ENDPOINTS.REPORTS}/outstanding`, params),
  getBranchPerformance: (params?: any) => get(`${API_ENDPOINTS.REPORTS}/branch-performance`, params),
  getEmployeePerformance: (params?: any) => get(`${API_ENDPOINTS.REPORTS}/employee-performance`, params),
  getBusinessTrend: (params?: any) => get(`${API_ENDPOINTS.REPORTS}/business-trend`, params),
  getTransactionHistory: (params?: any) => get(`${API_ENDPOINTS.REPORTS}/transaction-history`, params),
}

// ── Credit Scores ─────────────────────────────────────────────────────────────
export const creditScoresApi = {
  getByCustomer: (customerId: string) => get(`${API_ENDPOINTS.CREDIT_SCORES}/customer/${customerId}`),
  getAll: (params?: any) => get(API_ENDPOINTS.CREDIT_SCORES, params),
}

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  getMyNotifications: (params?: any) => get(`${API_ENDPOINTS.NOTIFICATIONS}/me`, params),
  markRead: (id: string) => patch(`${API_ENDPOINTS.NOTIFICATIONS}/me/${id}/read`),
  markAllRead: () => patch(`${API_ENDPOINTS.NOTIFICATIONS}/me/read-all`),
  sendEmail: (data: any) => post(`${API_ENDPOINTS.NOTIFICATIONS}/send-email`, data),
}

// ── Collections ───────────────────────────────────────────────────────────────
export const collectionsApi = {
  getAll: (params?: any) => get(API_ENDPOINTS.COLLECTIONS, params),
  create: (data: any) => post(API_ENDPOINTS.COLLECTIONS, data),
}

// ── Settings ──────────────────────────────────────────────────────────────────
export const settingsApi = {
  get: () => get(API_ENDPOINTS.SETTINGS),
  update: (data: any) => put(API_ENDPOINTS.SETTINGS, data),
}

// ── Audit Logs ────────────────────────────────────────────────────────────────
export const auditApi = {
  getAll: (params?: any) => get(API_ENDPOINTS.AUDIT_LOGS, params),
}
