# 🔗 Frontend-Backend Connection Guide

## ✅ What Has Been Done

### Backend Setup
- ✅ PostgreSQL database configured
- ✅ Database URL updated in `.env`
- ✅ Backend running on `http://localhost:5000`

### Frontend Integration
- ✅ API client created (`lib/apiClient.ts`)
- ✅ API endpoints configured (`lib/api.ts`)
- ✅ Auth store updated to use real backend API
- ✅ Login page updated to use email instead of username
- ✅ Environment variables configured (`.env.local`)

## 🚀 How to Start

### 1. Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Backend will run on: `http://localhost:5000`

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on: `http://localhost:3000`

## 🔐 Login Credentials

Use these credentials from the backend seed data:

| Role     | Email                          | Password  |
|----------|--------------------------------|-----------|
| Admin    | admin@loanmanagement.com       | admin123  |
| Employee | employee@loanmanagement.com    | admin123  |
| User     | user@loanmanagement.com        | admin123  |

## 📡 API Integration

### Authentication Flow
1. User enters email and password
2. Frontend sends POST request to `/api/auth/login`
3. Backend validates credentials
4. Backend returns JWT token + user data
5. Frontend stores token in Zustand store (persisted)
6. Token is used for all subsequent API calls

### Making API Calls

```typescript
import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

// Get token from auth store
const { token } = useAuthStore()

// Example: Fetch customers
const customers = await apiClient.get(API_ENDPOINTS.CUSTOMERS, token)

// Example: Create loan
const loan = await apiClient.post(
  API_ENDPOINTS.LOANS,
  { customerId: 1, amount: 50000, ... },
  token
)

// Example: Upload document
const result = await apiClient.uploadFile(
  `${API_ENDPOINTS.DOCUMENTS}/upload`,
  file,
  token
)
```

## 🔧 Configuration Files

### Backend `.env`
```env
DATABASE_URL="postgresql://postgres:Dipak@1412@localhost:5432/loan_management?schema=public"
PORT=5000
JWT_ACCESS_SECRET=loan_management_access_secret_key_2024_secure
JWT_REFRESH_SECRET=loan_management_refresh_secret_key_2024_secure
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📁 New Files Created

```
frontend/
├── lib/
│   ├── api.ts           # API endpoints configuration
│   └── apiClient.ts     # HTTP client with auth
├── store/
│   └── authStore.ts     # Updated with real API integration
└── .env.local           # Environment variables
```

## 🎯 Next Steps

### 1. Test Login
- Go to `http://localhost:3000/login`
- Use: `admin@loanmanagement.com` / `admin123`
- Should redirect to dashboard on success

### 2. Add API Calls to Pages
Update your dashboard pages to fetch real data:

```typescript
// Example: In customers page
'use client'
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const { token } = useAuthStore()

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS, token)
        setCustomers(response.data)
      } catch (error) {
        console.error('Failed to fetch customers:', error)
      }
    }
    
    if (token) fetchCustomers()
  }, [token])

  return (
    <div>
      {/* Render customers */}
    </div>
  )
}
```

### 3. Add Error Handling
```typescript
import { useUIStore } from '@/store/uiStore'

const { showToast } = useUIStore()

try {
  const result = await apiClient.post(API_ENDPOINTS.LOANS, data, token)
  showToast('Loan created successfully!', 'success')
} catch (error) {
  showToast(error.message || 'Failed to create loan', 'error')
}
```

## 🔍 Testing the Connection

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Test Login API
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@loanmanagement.com","password":"admin123"}'
```

### 3. Test Protected Route
```bash
# First get token from login, then:
curl http://localhost:5000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Troubleshooting

### CORS Issues
Backend already has CORS configured for `http://localhost:3000`

### Connection Refused
- Ensure backend is running on port 5000
- Check `.env.local` has correct API URL

### 401 Unauthorized
- Token might be expired (15 min expiry)
- Re-login to get new token

### Network Error
- Check if backend is running
- Verify API_URL in `.env.local`

## 📚 API Documentation

Full API documentation available in:
- `backend/API_TESTING_GUIDE.md`
- `backend/Loan_Management_API.postman_collection.json`

Import the Postman collection to test all APIs!

## 🎉 You're All Set!

Your frontend is now connected to the backend. Start both servers and test the login flow!

**Backend**: `http://localhost:5000`  
**Frontend**: `http://localhost:3000`  
**Login**: `admin@loanmanagement.com` / `admin123`
