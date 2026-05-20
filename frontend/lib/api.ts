// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  REFRESH: `${API_BASE_URL}/auth/refresh`,
  PROFILE: `${API_BASE_URL}/auth/profile`,
  
  // Customers
  CUSTOMERS: `${API_BASE_URL}/customers`,
  
  // Loans
  LOANS: `${API_BASE_URL}/loans`,
  
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
  
  // Users
  USERS: `${API_BASE_URL}/users`,
}

export default API_BASE_URL
