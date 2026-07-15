# Dada Finance Corporation — Project Structure

Full-stack Loan Management System (LMS).
- **Backend** — Node.js + Express + Prisma + PostgreSQL (REST API, port 5000)
- **Frontend** — Next.js 16 + TypeScript + Tailwind CSS + Zustand (port 3000)

---

## Root

```
dada-finace-corporation/
├── backend/                  # Express REST API
├── frontend/                 # Next.js web app
├── prd.md                    # Product requirements document
└── STRUCTURE.md              # This file
```

---

## Backend

```
backend/
├── prisma/
│   ├── migrations/
│   │   ├── 20260518152215_init/
│   │   │   └── migration.sql           # Initial DB schema (all tables)
│   │   ├── 20260518180000_add_sms_reminders/
│   │   │   └── migration.sql           # Adds sms_reminders table
│   │   └── migration_lock.toml         # Prisma migration lock file
│   ├── schema.prisma                   # Full DB schema — models, enums, relations
│   └── seed.js                         # Seeds master data + default admin user
│
├── src/
│   ├── config/
│   │   ├── database.js                 # PrismaClient singleton (logs queries in dev)
│   │   └── env.js                      # Loads .env, exports typed config object
│   │
│   ├── middlewares/
│   │   ├── auth.js                     # JWT authenticate + role-based authorize guards
│   │   ├── errorHandler.js             # Global error handler (Prisma, JWT, operational errors)
│   │   ├── upload.js                   # Multer config — disk storage, file type/size validation
│   │   └── validate.js                 # Joi schema validation middleware for req.body
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js      # Handles login, register, logout, refresh, profile
│   │   │   ├── auth.routes.js          # POST /api/auth/* routes
│   │   │   └── auth.service.js         # JWT generation, bcrypt password hashing, token refresh
│   │   │
│   │   ├── customers/
│   │   │   ├── customer.controller.js  # CRUD + list with filters/pagination
│   │   │   ├── customer.routes.js      # GET/POST/PUT/DELETE /api/customers
│   │   │   └── customer.service.js     # Customer DB operations via Prisma
│   │   │
│   │   ├── documents/
│   │   │   ├── document.controller.js  # Upload, list, delete documents
│   │   │   ├── document.routes.js      # POST /api/documents (multipart), GET, DELETE
│   │   │   └── document.service.js     # Saves file metadata to DB, links to loan/entity
│   │   │
│   │   ├── emi/
│   │   │   ├── emi.controller.js       # EMI schedule fetch, payment collection, overdue list
│   │   │   ├── emi.routes.js           # GET /api/emi, POST /api/emi/:id/pay
│   │   │   └── emi.service.js          # EMI queries, payment recording, status updates
│   │   │
│   │   ├── guarantors/
│   │   │   ├── guarantor.controller.js # Add/update/delete guarantors for a loan
│   │   │   ├── guarantor.routes.js     # /api/guarantors routes
│   │   │   └── guarantor.service.js    # Guarantor DB operations
│   │   │
│   │   ├── loan-application/
│   │   │   ├── loan-application.controller.js  # 5-stage draft: create, update stage, submit
│   │   │   ├── loan-application.routes.js       # /api/loan-application routes
│   │   │   └── loan-application.service.js      # Draft persistence, stage validation, final loan creation
│   │   │
│   │   ├── loans/
│   │   │   ├── loan.controller.js      # Loan CRUD, approve, reject, disburse
│   │   │   ├── loan.routes.js          # /api/loans routes
│   │   │   └── loan.service.js         # Loan DB ops, EMI schedule generation on disbursal
│   │   │
│   │   ├── master/
│   │   │   ├── master.controller.js    # CRUD for State, City, Area, Branch, Bank, LoanType
│   │   │   ├── master.routes.js        # /api/master/* routes
│   │   │   └── master.service.js       # Master data DB operations
│   │   │
│   │   ├── nominees/
│   │   │   ├── nominee.controller.js   # Add/update/delete nominees for a loan
│   │   │   ├── nominee.routes.js       # /api/nominees routes
│   │   │   └── nominee.service.js      # Nominee DB operations
│   │   │
│   │   ├── reminders/
│   │   │   ├── reminder.scheduler.js   # setInterval job — runs EMI reminder on startup
│   │   │   └── reminder.service.js     # Queries pending EMIs in window, sends SMS, upserts SmsReminder record
│   │   │
│   │   ├── reports/
│   │   │   ├── report.controller.js    # Portfolio, collection, outstanding, branch/employee reports
│   │   │   ├── report.routes.js        # GET /api/reports/* routes
│   │   │   └── report.service.js       # Aggregation queries for all report types
│   │   │
│   │   └── users/
│   │       ├── user.controller.js      # List users, get/update/deactivate user
│   │       ├── user.routes.js          # /api/users routes (admin only)
│   │       └── user.service.js         # User DB operations
│   │
│   ├── services/
│   │   └── sms.service.js              # HTTP/HTTPS SMS provider client (singleton), send()
│   │
│   ├── utils/
│   │   ├── apiResponse.js              # ApiResponse class — success(), error(), paginated()
│   │   ├── appError.js                 # AppError extends Error with statusCode + isOperational
│   │   ├── asyncHandler.js             # Wraps async route handlers, forwards errors to next()
│   │   ├── emiCalculator.js            # EMICalculator — calculateEMI(), generateSchedule(), calculateTotalAmount()
│   │   └── logger.js                   # File-based logger (info/error/warn/debug → logs/*.log)
│   │
│   └── validators/
│       ├── auth.validator.js           # Joi schemas for login/register
│       ├── customer.validator.js       # Joi schema for customer create/update
│       ├── emi.validator.js            # Joi schema for EMI payment
│       ├── guarantor.validator.js      # Joi schema for guarantor
│       ├── loan.validator.js           # Joi schema for loan create/update/approve
│       └── nominee.validator.js        # Joi schema for nominee
│
├── app.js                              # Express app setup — middleware, routes, 404, error handler
├── server.js                           # Entry point — DB connect, server listen, graceful shutdown
├── .env.example                        # Environment variable template
├── .gitignore
├── package.json                        # Dependencies: express, prisma, bcryptjs, joi, jsonwebtoken, multer, helmet
└── package-lock.json
```

### Database Models (schema.prisma)

| Model | Description |
|---|---|
| `State` | Master — state list |
| `City` | Master — city, belongs to State |
| `Area` | Master — area, belongs to City |
| `Branch` | Master — office branches |
| `LoanType` | Master — loan type definitions |
| `Bank` | Master — bank list |
| `User` | System users (ADMIN / EMPLOYEE / USER roles) |
| `OtpLog` | Aadhaar OTP verification log |
| `Customer` | Borrower profile with KYC, bank, location fields |
| `LoanDraft` | 5-stage loan application in progress (JSON blobs per stage) |
| `Loan` | Approved/active loan record |
| `LoanStatusHistory` | Audit trail of every loan status change |
| `EMISchedule` | Per-instalment schedule row |
| `SmsReminder` | SMS reminder record linked to EMISchedule |
| `Payment` | Individual payment transaction against an EMI |
| `Guarantor` | Guarantor linked to Loan + Customer |
| `Nominee` | Nominee linked to Loan + Customer |
| `Document` | Uploaded file metadata linked to any entity |

### API Routes Summary

| Prefix | Module |
|---|---|
| `POST /api/auth/*` | Login, register, logout, refresh token, profile |
| `GET/POST/PUT/DELETE /api/customers` | Customer CRUD |
| `GET/POST/PUT/DELETE /api/loans` | Loan CRUD + approve/reject/disburse |
| `GET/POST /api/loan-application` | 5-stage draft create/update/submit |
| `GET/POST /api/emi` | EMI schedule + payment collection |
| `GET/POST/DELETE /api/guarantors` | Guarantor management |
| `GET/POST/DELETE /api/nominees` | Nominee management |
| `POST/GET/DELETE /api/documents` | Document upload/list/delete |
| `GET/POST/PUT/DELETE /api/master/*` | States, cities, areas, branches, banks, loan types |
| `GET /api/reports/*` | Portfolio, collection, outstanding, branch/employee reports |
| `GET/PUT/DELETE /api/users` | User management (admin) |
| `GET /health` | Health check |

---

## Frontend

```
frontend/
├── app/                                # Next.js App Router
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                # Login page — email/password form, calls authStore.login()
│   │
│   ├── (dashboard)/                    # Protected layout group
│   │   ├── layout.tsx                  # Dashboard shell — Sidebar + Topbar + Footer wrapper
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Home dashboard — KPI cards, charts, recent activity
│   │   │
│   │   ├── customers/
│   │   │   ├── add/
│   │   │   │   └── page.tsx            # Add new customer form
│   │   │   ├── list/
│   │   │   │   └── page.tsx            # Customer list with search/filter/pagination
│   │   │   └── [id]/details/
│   │   │       └── page.tsx            # Customer detail view — profile, loans, EMIs
│   │   │
│   │   ├── loans/
│   │   │   ├── add/
│   │   │   │   └── page.tsx            # Quick add loan form
│   │   │   ├── apply/
│   │   │   │   └── page.tsx            # 5-stage loan application entry point
│   │   │   ├── approval/
│   │   │   │   └── page.tsx            # Loans pending approval — approve/reject actions
│   │   │   ├── approved/
│   │   │   │   └── page.tsx            # Approved loans list — disburse action
│   │   │   ├── disbursed/
│   │   │   │   └── page.tsx            # Disbursed/active loans list
│   │   │   ├── documents/
│   │   │   │   └── page.tsx            # Loan document management
│   │   │   └── list/
│   │   │       └── page.tsx            # All loans list with status filters
│   │   │
│   │   ├── emi/
│   │   │   ├── calculator/
│   │   │   │   └── page.tsx            # EMI calculator tool
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx            # EMI due-date calendar view
│   │   │   ├── collection/
│   │   │   │   └── page.tsx            # Daily EMI collection — record payments
│   │   │   ├── payment-methods/
│   │   │   │   └── page.tsx            # Payment method configuration
│   │   │   └── upcoming/
│   │   │       └── page.tsx            # Upcoming EMI dues list
│   │   │
│   │   ├── employees/
│   │   │   ├── add/
│   │   │   │   └── page.tsx            # Add employee form
│   │   │   └── list/
│   │   │       └── page.tsx            # Employee list with CRUD
│   │   │
│   │   ├── master/
│   │   │   ├── areas/page.tsx          # Area master CRUD
│   │   │   ├── banks/page.tsx          # Bank master CRUD
│   │   │   ├── branches/page.tsx       # Branch master CRUD
│   │   │   ├── cities/page.tsx         # City master CRUD
│   │   │   ├── loan-types/page.tsx     # Loan type master CRUD
│   │   │   └── states/page.tsx         # State master CRUD
│   │   │
│   │   ├── reports/
│   │   │   ├── branch-performance/page.tsx     # Branch-wise performance report
│   │   │   ├── business-trend/page.tsx         # Business trend chart report
│   │   │   ├── daily-collection/page.tsx       # Daily collection report
│   │   │   ├── employee-performance/page.tsx   # Employee-wise performance report
│   │   │   ├── outstanding/page.tsx            # Outstanding loans report
│   │   │   ├── portfolio/page.tsx              # Loan portfolio report
│   │   │   └── transaction-history/page.tsx    # Transaction history report
│   │   │
│   │   ├── civil-score/
│   │   │   └── page.tsx                # Customer civil/credit score viewer
│   │   │
│   │   ├── settings/
│   │   │   └── page.tsx                # Settings hub — tabs for all settings panels
│   │   │
│   │   ├── help/
│   │   │   └── page.tsx                # Help & support page
│   │   │
│   │   └── tools/emi-calculator/
│   │       └── page.tsx                # Standalone EMI calculator tool page
│   │
│   ├── layout.tsx                      # Root layout — fonts, ThemeProvider, Toast, Chatbot
│   ├── page.tsx                        # Root redirect → /dashboard
│   ├── globals.css                     # Global Tailwind base styles
│   └── dark-theme.css                  # Dark mode CSS overrides
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx                 # Collapsible nav sidebar with all menu items
│   │   ├── Topbar.tsx                  # Top bar — search, notifications, user menu
│   │   ├── PageHeader.tsx              # Reusable page title + breadcrumb header
│   │   └── Footer.tsx                 # App footer
│   │
│   ├── loan-stages/                    # 5-stage loan application wizard components
│   │   ├── Stage1Aadhaar.tsx           # Stage 1 — Aadhaar OTP verification
│   │   ├── Stage2CustomerLoan.tsx      # Stage 2 — Customer details + loan details form
│   │   ├── Stage3GuarantorNominee.tsx  # Stage 3 — Guarantor & nominee forms (2 each)
│   │   ├── Stage4Documents.tsx         # Stage 4 — Document upload (customer/nominee/guarantor/vehicle)
│   │   └── Stage5Review.tsx            # Stage 5 — Final review & submit
│   │
│   ├── emi/
│   │   └── LoanSearchPicker.tsx        # Searchable loan picker dropdown for EMI collection
│   │
│   ├── settings/
│   │   ├── ProfileSettings.tsx         # Profile edit form
│   │   ├── SecuritySettings.tsx        # Password change, 2FA settings
│   │   ├── MasterSetupSettings.tsx     # Master data quick-setup panel
│   │   ├── AppearanceSettings.tsx      # Theme/appearance settings
│   │   ├── NotificationSettings.tsx    # Notification preferences
│   │   ├── EmailSettings.tsx           # Email configuration
│   │   ├── DataSettings.tsx            # Data export/import settings
│   │   ├── PrivacySettings.tsx         # Privacy settings
│   │   └── SystemSettings.tsx          # System-level settings
│   │
│   ├── ui/                             # Reusable UI primitives
│   │   ├── Badge.tsx                   # Status/label badge
│   │   ├── Button.tsx                  # Button with variants (primary, secondary, danger)
│   │   ├── Card.tsx                    # Base card container
│   │   ├── Chatbot.tsx                 # Floating AI chatbot widget
│   │   ├── DownloadDropdown.tsx        # Export dropdown (PDF/Excel/CSV)
│   │   ├── Dropdown.tsx                # Generic dropdown menu
│   │   ├── FileUpload.tsx              # Drag-and-drop file upload input
│   │   ├── GradientButton.tsx          # Gradient-styled button
│   │   ├── Input.tsx                   # Styled text input
│   │   ├── Modal.tsx                   # Accessible modal dialog
│   │   ├── NeumorphicCard.tsx          # Neumorphic design card variant
│   │   ├── PremiumStatCard.tsx         # Premium-styled KPI stat card
│   │   ├── Select.tsx                  # Styled select dropdown
│   │   ├── StandardTable.tsx           # Table with sort, pagination, search
│   │   ├── StatCard.tsx                # Standard KPI stat card
│   │   ├── Table.tsx                   # Base table component
│   │   ├── Textarea.tsx                # Styled textarea input
│   │   └── Toast.tsx                   # Toast notification renderer (reads uiStore)
│   │
│   ├── LoanListView.tsx                # Shared loan list table used across loan pages
│   └── MasterPages.tsx                 # Generic master data page (table + add/edit modal)
│
├── lib/
│   ├── api.ts                          # API_BASE_URL + API_ENDPOINTS constants
│   ├── apiClient.ts                    # ApiClient class — get/post/put/delete/uploadFile + auto token refresh
│   ├── colors.ts                       # Shared color palette constants
│   └── storageUtils.ts                 # localStorage helpers — clearLoanDraft, migrateStripPhotos, clearAllStorage
│
├── store/                              # Zustand global state (persisted to localStorage)
│   ├── appStore.ts                     # Main store — master data, customers, loans, EMIs, civil scores + all CRUD actions
│   ├── authStore.ts                    # Auth store — user, token, login(), logout() (supports frontend-only demo mode)
│   ├── loanDraftStore.ts               # 5-stage loan draft store — stage data, OTP state, submission state
│   ├── seedData.ts                     # Seed data for master tables, employees, customers, loans (demo data)
│   └── uiStore.ts                      # UI store — toasts, notifications, markRead, clearAll
│
├── public/
│   ├── LOGO.png                        # App logo
│   └── manifest.json                   # PWA manifest
│
├── .gitignore
├── eslint.config.mjs                   # ESLint config (Next.js rules)
├── next-env.d.ts                       # Next.js TypeScript env declarations
├── next.config.ts                      # Next.js config (webpack mode)
├── postcss.config.mjs                  # PostCSS config for Tailwind v4
├── tsconfig.json                       # TypeScript config
├── package.json                        # Dependencies: next, react, zustand, recharts, react-hook-form, zod, lucide-react
└── package-lock.json
```

### Frontend Store Summary

| Store | Key | Purpose |
|---|---|---|
| `appStore` | `dada-lms-store` | All master data, customers, loans, EMIs, civil scores with full CRUD |
| `authStore` | `dada-auth` | Logged-in user, JWT tokens, login/logout (demo + real API mode) |
| `loanDraftStore` | `dada-loan-draft` | 5-stage loan application wizard state |
| `uiStore` | `dada-ui` | Toast messages and notification bell items |

### Frontend Route Summary

| Route | Page |
|---|---|
| `/login` | Login |
| `/dashboard` | Dashboard home |
| `/customers/add` | Add customer |
| `/customers/list` | Customer list |
| `/customers/[id]/details` | Customer detail |
| `/loans/add` | Quick add loan |
| `/loans/apply` | 5-stage loan application |
| `/loans/approval` | Loan approval queue |
| `/loans/approved` | Approved loans |
| `/loans/disbursed` | Disbursed loans |
| `/loans/list` | All loans |
| `/loans/documents` | Loan documents |
| `/emi/collection` | EMI collection |
| `/emi/upcoming` | Upcoming EMIs |
| `/emi/calendar` | EMI calendar |
| `/emi/calculator` | EMI calculator |
| `/emi/payment-methods` | Payment methods |
| `/employees/add` | Add employee |
| `/employees/list` | Employee list |
| `/master/states` | State master |
| `/master/cities` | City master |
| `/master/areas` | Area master |
| `/master/branches` | Branch master |
| `/master/banks` | Bank master |
| `/master/loan-types` | Loan type master |
| `/reports/portfolio` | Portfolio report |
| `/reports/daily-collection` | Daily collection |
| `/reports/outstanding` | Outstanding report |
| `/reports/branch-performance` | Branch performance |
| `/reports/employee-performance` | Employee performance |
| `/reports/business-trend` | Business trend |
| `/reports/transaction-history` | Transaction history |
| `/civil-score` | Civil score viewer |
| `/settings` | Settings |
| `/help` | Help |
| `/tools/emi-calculator` | EMI calculator tool |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js + Express 5 |
| ORM | Prisma 5 |
| Database | PostgreSQL |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Validation | Joi |
| File upload | Multer (disk storage) |
| SMS | Configurable HTTP provider via `sms.service.js` |
| Frontend framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State management | Zustand (persisted) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |
