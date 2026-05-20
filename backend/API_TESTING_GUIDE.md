# 📋 API Testing Guide

Complete guide for testing all API endpoints with examples.

## Setup

1. Start the server: `npm run dev`
2. Base URL: `http://localhost:5000/api`
3. Import Postman collection: `Loan_Management_API.postman_collection.json`

## 1. Authentication Flow

### 1.1 Login (Get Access Token)
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@loanmanagement.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@loanmanagement.com",
      "name": "Admin User",
      "role": "ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2 Get Profile
```bash
GET /api/auth/profile
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "uuid",
    "email": "admin@loanmanagement.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

### 1.3 Register New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "phone": "9876543210",
  "role": "EMPLOYEE"
}
```

## 2. Customer Management

### 2.1 Create Customer
```bash
POST /api/customers
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "9876543210",
  "address": "123 MG Road, Bangalore, Karnataka",
  "aadhaar": "123456789012",
  "pan": "ABCDE1234F",
  "dob": "1990-05-15"
}

Response:
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": "customer-uuid",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "phone": "9876543210",
    ...
  }
}
```

### 2.2 Get All Customers (with pagination & search)
```bash
GET /api/customers?page=1&limit=10&search=rajesh&isActive=true
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "message": "Customers fetched successfully",
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### 2.3 Get Customer by ID
```bash
GET /api/customers/:customerId
Authorization: Bearer <access_token>
```

### 2.4 Update Customer
```bash
PUT /api/customers/:customerId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "address": "456 New Address, Bangalore",
  "phone": "9999999999"
}
```

## 3. Loan Management

### 3.1 Create Loan
```bash
POST /api/loans
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "customerId": "customer-uuid-here",
  "amount": 100000,
  "interestRate": 12,
  "tenure": 12,
  "purpose": "Business expansion"
}

Response:
{
  "success": true,
  "message": "Loan created successfully",
  "data": {
    "id": "loan-uuid",
    "customerId": "customer-uuid",
    "amount": 100000,
    "interestRate": 12,
    "tenure": 12,
    "emiAmount": 8884.88,
    "totalAmount": 106618.56,
    "status": "PENDING",
    ...
  }
}
```

### 3.2 Get All Loans
```bash
GET /api/loans?page=1&limit=10&status=PENDING
Authorization: Bearer <access_token>
```

### 3.3 Approve Loan
```bash
PATCH /api/loans/:loanId/approve
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "disbursedAt": "2024-01-01T00:00:00.000Z"
}

Response:
{
  "success": true,
  "message": "Loan approved successfully",
  "data": {
    "id": "loan-uuid",
    "status": "APPROVED",
    "approvedBy": "user-uuid",
    "approvedAt": "2024-01-01T...",
    ...
  }
}
```

### 3.4 Reject Loan
```bash
PATCH /api/loans/:loanId/reject
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "rejectionReason": "Insufficient documentation provided"
}
```

### 3.5 Get Loan Details
```bash
GET /api/loans/:loanId
Authorization: Bearer <access_token>

Response includes:
- Loan details
- Customer information
- EMI schedules
- Guarantors
- Documents
```

## 4. EMI Management

### 4.1 Get EMI Calendar
```bash
GET /api/emi/calendar?month=1&year=2024&loanId=loan-uuid
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "message": "EMI calendar fetched successfully",
  "data": [
    {
      "id": "emi-uuid",
      "loanId": "loan-uuid",
      "emiNumber": 1,
      "dueDate": "2024-02-01",
      "amount": 8884.88,
      "principal": 7884.88,
      "interest": 1000,
      "status": "PENDING",
      "loan": {
        "customer": {
          "name": "Rajesh Kumar",
          "phone": "9876543210"
        }
      }
    },
    ...
  ]
}
```

### 4.2 Get Upcoming EMIs (Next 7 days)
```bash
GET /api/emi/upcoming?days=7
Authorization: Bearer <access_token>
```

### 4.3 Get Overdue EMIs
```bash
GET /api/emi/overdue
Authorization: Bearer <access_token>

Response shows all pending EMIs past due date
```

### 4.4 Get EMIs by Loan
```bash
GET /api/emi/loan/:loanId
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "message": "Loan EMIs fetched successfully",
  "data": [
    {
      "id": "emi-uuid",
      "emiNumber": 1,
      "dueDate": "2024-02-01",
      "amount": 8884.88,
      "status": "PENDING",
      "payments": []
    },
    ...
  ]
}
```

### 4.5 Pay EMI
```bash
POST /api/emi/:emiId/pay
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 8884.88,
  "paymentMode": "BANK_TRANSFER",
  "transactionId": "TXN123456789",
  "remarks": "Monthly EMI payment for January"
}

Response:
{
  "success": true,
  "message": "EMI payment recorded successfully",
  "data": {
    "payment": {
      "id": "payment-uuid",
      "amount": 8884.88,
      "paymentMode": "BANK_TRANSFER",
      "transactionId": "TXN123456789",
      "paidAt": "2024-01-15T..."
    },
    "emi": {
      "id": "emi-uuid",
      "status": "PAID",
      "paidDate": "2024-01-15T...",
      "paidAmount": 8884.88
    }
  }
}
```

### 4.6 Get Payment History
```bash
GET /api/emi/:emiId/history
Authorization: Bearer <access_token>

Shows all payments made for a specific EMI
```

## 5. Guarantor Management

### 5.1 Create Guarantor
```bash
POST /api/guarantors
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "loanId": "loan-uuid",
  "name": "Suresh Sharma",
  "phone": "9876543211",
  "email": "suresh@example.com",
  "address": "789 Park Street, Bangalore",
  "relationship": "Friend",
  "aadhaar": "987654321012",
  "pan": "FGHIJ5678K"
}
```

### 5.2 Get Guarantors by Loan
```bash
GET /api/guarantors/loan/:loanId
Authorization: Bearer <access_token>
```

### 5.3 Update Guarantor
```bash
PUT /api/guarantors/:guarantorId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "phone": "9999999999",
  "address": "New Address"
}
```

## 6. Nominee Management

### 6.1 Create Nominee
```bash
POST /api/nominees
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "customerId": "customer-uuid",
  "name": "Priya Kumar",
  "phone": "9876543212",
  "relationship": "Spouse",
  "address": "Same as customer",
  "dob": "1992-08-20"
}
```

### 6.2 Get Nominees by Customer
```bash
GET /api/nominees/customer/:customerId
Authorization: Bearer <access_token>
```

## 7. Document Management

### 7.1 Upload Document
```bash
POST /api/documents/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- file: <select file>
- entityType: CUSTOMER (or LOAN)
- entityId: customer-uuid or loan-uuid
- documentType: AADHAAR (or PAN, PHOTO, etc.)

Response:
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "document-uuid",
    "fileName": "aadhaar.pdf",
    "filePath": "/uploads/aadhaar/1234567890-aadhaar.pdf",
    "fileSize": 245678,
    "documentType": "AADHAAR",
    "uploadedAt": "2024-01-15T..."
  }
}
```

### 7.2 Get Documents by Entity
```bash
GET /api/documents/CUSTOMER/:customerId
Authorization: Bearer <access_token>

or

GET /api/documents/LOAN/:loanId
Authorization: Bearer <access_token>
```

### 7.3 Download Document
```bash
GET /api/documents/download/:documentId
Authorization: Bearer <access_token>

Downloads the file
```

### 7.4 Delete Document
```bash
DELETE /api/documents/:documentId
Authorization: Bearer <access_token>
```

## 8. Reports & Dashboard

### 8.1 Get Dashboard Data
```bash
GET /api/reports/dashboard
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "message": "Dashboard data fetched successfully",
  "data": {
    "customers": {
      "total": 150,
      "active": 145
    },
    "loans": {
      "total": 200,
      "pending": 15,
      "approved": 50,
      "active": 120,
      "closed": 15
    },
    "financials": {
      "totalDisbursed": 50000000,
      "totalCollected": 35000000,
      "outstanding": 15000000
    },
    "emis": {
      "overdue": 25,
      "upcoming": 40
    }
  }
}
```

### 8.2 Get Loan Report
```bash
GET /api/reports/loans?startDate=2024-01-01&endDate=2024-12-31&status=APPROVED
Authorization: Bearer <access_token>

Response includes:
- List of loans with filters
- Summary (total loans, total amount, total repayable)
```

### 8.3 Get Collection Report
```bash
GET /api/reports/collections?startDate=2024-01-01&endDate=2024-12-31&paymentMode=CASH
Authorization: Bearer <access_token>

Response includes:
- All payments with filters
- Summary by payment mode
- Total collections
```

### 8.4 Get Overdue Report
```bash
GET /api/reports/overdue
Authorization: Bearer <access_token>

Response includes:
- All overdue EMIs
- Summary (total overdue count, total amount)
- Breakdown by customer
```

## 9. User Management (Admin Only)

### 9.1 Get All Users
```bash
GET /api/users?page=1&limit=10&role=EMPLOYEE
Authorization: Bearer <admin_access_token>
```

### 9.2 Get User by ID
```bash
GET /api/users/:userId
Authorization: Bearer <admin_access_token>
```

### 9.3 Update User
```bash
PUT /api/users/:userId
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": false,
  "role": "EMPLOYEE"
}
```

### 9.4 Delete User
```bash
DELETE /api/users/:userId
Authorization: Bearer <admin_access_token>
```

## Testing Workflow Example

### Complete Loan Lifecycle Test

1. **Login as Admin**
   ```
   POST /api/auth/login
   ```

2. **Create Customer**
   ```
   POST /api/customers
   Save customer ID
   ```

3. **Upload Customer Documents**
   ```
   POST /api/documents/upload (Aadhaar)
   POST /api/documents/upload (PAN)
   POST /api/documents/upload (Photo)
   ```

4. **Create Nominee**
   ```
   POST /api/nominees
   ```

5. **Create Loan**
   ```
   POST /api/loans
   Save loan ID
   ```

6. **Add Guarantor**
   ```
   POST /api/guarantors
   ```

7. **Upload Loan Documents**
   ```
   POST /api/documents/upload
   ```

8. **Approve Loan**
   ```
   PATCH /api/loans/:id/approve
   EMI schedule auto-generated
   ```

9. **View EMI Schedule**
   ```
   GET /api/emi/loan/:loanId
   ```

10. **Pay First EMI**
    ```
    POST /api/emi/:emiId/pay
    ```

11. **Check Dashboard**
    ```
    GET /api/reports/dashboard
    ```

12. **View Collection Report**
    ```
    GET /api/reports/collections
    ```

## Payment Modes Available

- `CASH` - Cash payment
- `PAYTM` - Paytm payment
- `BANK_TRANSFER` - Bank transfer
- `UPI` - UPI payment
- `CHEQUE` - Cheque payment

## Document Types Supported

- `AADHAAR` - Aadhaar card
- `PAN` - PAN card
- `PHOTO` - Photograph
- `INCOME_PROOF` - Income proof
- `ADDRESS_PROOF` - Address proof
- `BANK_STATEMENT` - Bank statement
- `OTHER` - Other documents

## Status Values

### Loan Status
- `PENDING` - Awaiting approval
- `APPROVED` - Approved and EMIs generated
- `REJECTED` - Rejected
- `ACTIVE` - Active with pending EMIs
- `CLOSED` - All EMIs paid
- `DEFAULTED` - Defaulted loan

### EMI Status
- `PENDING` - Not yet paid
- `PAID` - Fully paid
- `OVERDUE` - Past due date
- `PARTIAL` - Partially paid

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

**Happy Testing! 🧪**
