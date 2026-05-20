# Customer & Loan Application Flow - Updated

## Overview
The system has been restructured to move Aadhaar OTP verification to customer creation and simplify loan applications with customer search.

---

## 1. Customer Creation Flow

### Step 1: Aadhaar OTP Verification
- Enter customer's 12-digit Aadhaar number
- System sends OTP to registered mobile (simulated in dev mode)
- Verify OTP to fetch customer details from Aadhaar database
- Auto-fills: Name, DOB, Gender, Mobile, Address

### Step 2: Live Photo Capture
- Click "Start Camera" to access device camera
- Capture live photo of customer
- Photo is saved as base64 and stored in `/uploads/customers/`
- Retake option available if needed

### Step 3: Complete Customer Details
**Auto-filled from Aadhaar:**
- Name
- Date of Birth
- Gender
- Mobile Number
- Address
- Aadhaar Number

**Manual Entry Required:**
- Father's Name
- Mother's Name
- Age (auto-calculated from DOB)
- Marital Status
- Blood Group
- Occupation
- Alternative Mobile
- Email
- PAN Number
- Job Address

**Bank Details:**
- Account Number
- Account Holder Name
- Bank Name
- Branch
- IFSC Code

### Backend Changes
- **Customer Service**: Added photo base64 handling, saves as JPG file
- **Auto-generates**: `appNo` (e.g., CUST000001)
- **Enhanced Search**: Now searches by name, mobile, Aadhaar, and appNo

---

## 2. Loan Application Flow (Simplified)

### Step 1: Search & Select Customer
- Search bar accepts: Name, Mobile, or Aadhaar
- Displays matching customers with details
- Click to select customer
- Shows selected customer info with "Change" button

### Step 2: Loan Details
**Loan Category:**
- Personal Loan
- Gold Loan
- Vehicle Loan

**Loan Parameters:**
- Loan Amount (₹)
- Interest Rate (%)
- Interest Type: Flat Rate / Reducing Balance
- **Tenure Type**: Monthly / Yearly (NEW)
- **Tenure**: Number based on type selected
- Processing Fee (₹)
- EMI Start Date
- Notes

**Removed Fields:**
- ❌ Loan Purpose (removed as requested)
- ❌ Aadhaar OTP (moved to customer creation)
- ❌ Customer details form (now search-based)

### Real-time EMI Calculation
- Displays: Principal, EMI Amount, Total Payable, Tenure
- Auto-converts yearly tenure to months for calculation
- Supports both FLAT and REDUCING interest types

---

## 3. Key Features

### Customer Creation
✅ Aadhaar OTP verification with auto-fill
✅ Live photo capture with camera access
✅ Photo stored in database
✅ Auto-generated customer number (appNo)
✅ Complete bank details capture

### Loan Application
✅ Customer search by name/mobile/Aadhaar
✅ Simplified form (no redundant customer details)
✅ Monthly/Yearly tenure selection
✅ Real-time EMI calculation
✅ Direct loan creation (status: PENDING_VERIFICATION)

---

## 4. API Endpoints

### Customer APIs
```
POST   /api/customers              - Create customer (with photoBase64)
GET    /api/customers?search=xxx   - Search customers
GET    /api/customers/:id          - Get customer details
PUT    /api/customers/:id          - Update customer
DELETE /api/customers/:id          - Delete customer
```

### Loan APIs
```
POST   /api/loans                  - Create loan application
GET    /api/loans                  - List loans
GET    /api/loans/:id              - Get loan details
PUT    /api/loans/:id              - Update loan
DELETE /api/loans/:id              - Delete loan
```

### OTP APIs (for customer creation)
```
POST   /api/loan-application/otp/send    - Send OTP to Aadhaar mobile
POST   /api/loan-application/otp/verify  - Verify OTP & get details
```

---

## 5. File Structure

### Frontend
```
/app/(dashboard)/customers/add/page.tsx    - New customer creation with OTP & photo
/app/(dashboard)/loans/add/page.tsx        - Simplified loan application
```

### Backend
```
/src/modules/customers/customer.service.js - Photo upload & enhanced search
/uploads/customers/                        - Customer photos storage
```

---

## 6. Testing Flow

### Create Customer
1. Navigate to **Customers → Add Customer**
2. Enter Aadhaar: `123456789012` (dev mode)
3. Click "Send OTP"
4. Enter OTP: `123456` (shown in dev mode)
5. Click "Verify OTP"
6. Click "Start Camera" and capture photo
7. Complete remaining fields
8. Click "Register Customer"

### Create Loan
1. Navigate to **Loans → Add Loan**
2. Search for customer by name/mobile/Aadhaar
3. Select customer from results
4. Fill loan details:
   - Category: Personal
   - Amount: 100000
   - Interest Rate: 12
   - Interest Type: FLAT
   - Tenure Type: Monthly
   - Tenure: 12
   - Processing Fee: 1000
5. Review EMI calculation
6. Click "Create Loan Application"

---

## 7. Dev Mode OTP Credentials

**Test Aadhaar Numbers:**
- `123456789012` → Ramesh Patel, 9876543210
- `234567890123` → Priya Shah, 9876543211

**OTP:** Always `123456` in development mode

---

## 8. Database Changes

### Customer Table
- `appNo` - Auto-generated unique customer number
- `photoPath` - Path to customer photo file
- `aadhaar` - Unique Aadhaar number
- All bank details fields

### Loan Table
- `customerId` - Reference to customer
- `loanCategory` - GOLD/PERSONAL/VEHICLE
- `interestType` - FLAT/REDUCING
- `tenure` - Always stored in months
- `emiAmount` - Calculated EMI
- `status` - PENDING_VERIFICATION initially

---

## 9. Benefits of New Flow

1. **Cleaner Separation**: Customer creation vs Loan application
2. **Reusability**: One customer, multiple loans
3. **Photo Verification**: Live capture ensures authenticity
4. **Faster Loans**: Search existing customers instead of re-entering data
5. **Flexible Tenure**: Monthly or yearly selection
6. **Better UX**: Simplified forms, clear steps

---

## 10. Next Steps

- Test customer creation with camera on actual device
- Verify photo storage and retrieval
- Test loan creation with different customers
- Check EMI calculations for both FLAT and REDUCING
- Verify monthly/yearly tenure conversions
