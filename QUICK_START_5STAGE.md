# 🚀 Quick Start — Test the 5-Stage Loan System in 5 Minutes

## Step 1: Start Backend (2 minutes)

```bash
cd backend

# Install dependencies (first time only)
npm install

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate dev --name add_loan_application

# Start server
npm run dev
```

✅ Backend running at: **http://localhost:5000**

---

## Step 2: Start Frontend (1 minute)

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start dev server
npm run dev
```

✅ Frontend running at: **http://localhost:3000**

---

## Step 3: Login (30 seconds)

1. Open: **http://localhost:3000/login**
2. Use default credentials:
   - Email: `admin@nexzen.com`
   - Password: `Admin@123`
3. Click **Login**

✅ You're now in the dashboard

---

## Step 4: Test 5-Stage Loan Application (2 minutes)

### **Navigate to Add Loan**
- Click **Loans** in sidebar
- Click **Add Loan**
- You'll see the **5-stage stepper**

### **Stage 1 — Aadhaar OTP**
1. Enter Aadhaar: `123456789012`
2. Click **Send OTP**
3. You'll see: "OTP sent to 98XXXXXX01"
4. **DEV MODE shows OTP** in the response (e.g., `123456`)
5. Enter the OTP shown
6. Click **Verify OTP**
7. ✅ **Auto-fills:** Ramesh Patel, DOB, Phone, Address
8. Click **Next**

### **Stage 2 — Customer & Loan Details**
1. Customer details already filled (edit if needed)
2. Add loan details:
   - **Loan Category:** Personal
   - **Amount:** 100000
   - **Interest Rate:** 12
   - **Interest Type:** FLAT
   - **Tenure:** 12
   - **Processing Fee:** 500
3. Watch **EMI auto-calculate** (₹9,100)
4. Click **Save & Next**

### **Stage 3 — Guarantors & Nominees**
1. **Nominee 1 (Required):**
   - Name: Sunita Patel
   - Phone: 9876501003
   - Relationship: Spouse
   - Aadhaar: 234567890123
2. **Guarantor 1 (Required):**
   - Name: Mahesh Patel
   - Phone: 9876501004
   - Relationship: Brother
   - Aadhaar: 345678901234
   - Occupation: Salaried
   - Income: 40000
3. Click **Save & Next**

### **Stage 4 — Documents (Optional)**
1. You can upload documents or skip
2. Click **Next: Review & Submit**

### **Stage 5 — Review & Submit**
1. Review all information
2. Check the confirmation box
3. Click **Submit Application**
4. ✅ **Success!** Redirects to Loan List

---

## Step 5: Verify in Loan List (30 seconds)

1. You're now at `/loans/list`
2. You'll see the newly created loan
3. Status: **PENDING_VERIFICATION** (yellow badge)
4. Click **Download** dropdown to see all 12 documents

---

## 🧪 Test with Postman (Optional)

1. Import: `Loan_Application_5Stage.postman_collection.json`
2. Set `baseUrl`: `http://localhost:5000/api`
3. Run **Login** request (auto-saves token)
4. Run requests in order:
   - Send OTP
   - Verify OTP
   - Create Draft
   - Save Stage 1
   - Save Stage 2
   - Save Stage 3
   - Submit Draft

---

## 📊 Test Status Workflow

### **Move loan through statuses:**

```bash
# In Postman or using curl:

# 1. PENDING_VERIFICATION → UNDER_REVIEW
PATCH /api/loan-application/loans/{loanId}/status
Body: { "status": "UNDER_REVIEW", "note": "Documents verified" }

# 2. UNDER_REVIEW → APPROVED
PATCH /api/loan-application/loans/{loanId}/status
Body: { "status": "APPROVED", "note": "Loan approved" }

# 3. APPROVED → ACTIVE (Disbursed)
PATCH /api/loan-application/loans/{loanId}/status
Body: { "status": "ACTIVE", "note": "Funds disbursed" }
```

---

## 🎯 Mock Test Data

### **Aadhaar Numbers:**
- `123456789012` → Ramesh Patel (Male, 9876501001)
- `234567890123` → Priya Shah (Female, 9876502001)
- Any other 12 digits → Test Customer

### **OTP:**
- In **development mode**, OTP is shown in the API response
- Example: `{ "devOtp": "123456" }`
- Just copy and paste it

---

## ✅ What You Should See

### **Stage 1:**
- OTP sent notification
- Masked phone number
- Auto-filled customer details after verification

### **Stage 2:**
- Pre-filled customer info from Aadhaar
- Real-time EMI calculation
- Financial summary cards

### **Stage 3:**
- 2 nominee sections
- 2 guarantor sections
- Validation messages

### **Stage 4:**
- Category-based upload sections
- File preview
- Upload success messages

### **Stage 5:**
- Complete summary of all stages
- Edit buttons for each section
- Confirmation checkbox
- Submit button

### **After Submit:**
- Success toast
- Redirect to loan list
- New loan visible with PENDING_VERIFICATION status

---

## 🐛 Troubleshooting

### **Backend won't start:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check .env file exists
cat backend/.env

# Regenerate Prisma client
cd backend && npx prisma generate
```

### **Frontend won't start:**
```bash
# Check .env.local exists
cat frontend/.env.local

# Clear Next.js cache
cd frontend && rm -rf .next && npm run dev
```

### **OTP not working:**
- OTP is **simulated** in development
- Check the API response for `devOtp` field
- OTP expires in 10 minutes
- Max 3 attempts per OTP

### **Database errors:**
```bash
# Reset database (WARNING: deletes all data)
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

---

## 📝 Next Steps

1. ✅ Test the complete 5-stage flow
2. ✅ Try different loan categories (Gold, Vehicle)
3. ✅ Test FLAT vs REDUCING interest calculation
4. ✅ Upload documents in Stage 4
5. ✅ Test status workflow (PENDING → UNDER_REVIEW → APPROVED → ACTIVE)
6. ✅ Check audit trail in database (loan_status_history table)
7. ✅ Test with Postman collection

---

## 🎉 You're Done!

The **5-stage loan application system** is now running and fully functional!

- ✅ Aadhaar OTP verification
- ✅ Auto customer creation
- ✅ EMI auto-calculation
- ✅ Document upload
- ✅ Multi-status workflow
- ✅ Complete audit trail

**Happy Testing!** 🚀
