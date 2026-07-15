const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  REFRESH: `${API_BASE_URL}/auth/refresh`,
  PROFILE: `${API_BASE_URL}/auth/profile`,

  // Customers
  CUSTOMERS: `${API_BASE_URL}/customers`,

  // Loans
  LOANS: `${API_BASE_URL}/loans`,
  LOAN_APPLICATION: `${API_BASE_URL}/loan-application`,

  // EMI
  EMI: `${API_BASE_URL}/emi`,

  // Guarantors
  GUARANTORS: `${API_BASE_URL}/guarantors`,

  // Nominees
  NOMINEES: `${API_BASE_URL}/nominees`,

  // Documents
  DOCUMENTS: `${API_BASE_URL}/documents`,

  // Reports
  REPORTS: `${API_BASE_URL}/reports`,

  // Master Data
  MASTER: `${API_BASE_URL}/master`,

  // Branches
  BRANCHES: `${API_BASE_URL}/branches`,

  // Employees / Users
  EMPLOYEES: `${API_BASE_URL}/users`,

  // Roles
  ROLES: `${API_BASE_URL}/roles`,

  // Dashboard
  DASHBOARD: `${API_BASE_URL}/dashboard`,

  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,

  // Collections
  COLLECTIONS: `${API_BASE_URL}/collections`,

  // Renewals
  RENEWALS: `${API_BASE_URL}/renewals`,

  // Credit Scores
  CREDIT_SCORES: `${API_BASE_URL}/credit-scores`,

  // Settings
  SETTINGS: `${API_BASE_URL}/settings`,

  // Audit Logs
  AUDIT_LOGS: `${API_BASE_URL}/audit-logs`,
}

export default API_BASE_URL
