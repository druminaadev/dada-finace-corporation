# FRONTEND.md - Frontend Documentation Guide

## 1. Document Overview
This document serves as the primary frontend UI/UX development guide for Dada Finance & Corporation Loan Management System. Its purpose is to clearly define all pages, layouts, components, colors, typography, spacing, responsive behavior, interaction rules, accessibility standards, and implementation guidelines for designers and developers.

**Target Users:** UI/UX Designers, Frontend Developers, QA Engineers, and Product Managers.

**Design Goals:**
- To create a modern, professional, and secure fintech-focused interface.
- To provide a premium user experience utilizing a Royal Blue, Teal, Slate, and Gold aesthetic.
- To ensure WCAG accessibility standards and robust performance across devices.

**Product Design Principles:**
- **Clarity:** Ensure information hierarchy is obvious.
- **Consistency:** Use standardized components and patterns.
- **Accessibility:** Design for everyone, meeting WCAG 2.1 AA standards.
- **Responsiveness:** Fluid and usable layouts on all devices.
- **Reusability:** Build semantic, reusable React components.
- **Performance:** Optimize rendering and load times.
- **Minimal visual clutter:** Focus on actionable data and clear paths.
- **Clear user feedback:** Meaningful responses to every user action.
- **Predictable navigation:** Logical flows and intuitive routing.

## 2. Application Page Inventory

### Authentication
- **Login** (`/login`): User authentication entry point.
- **Forgot Password** (`/forgot-password`): Password recovery flow.
- **Reset Password** (`/reset-password`): Setting a new password.
- **OTP Verification** (`/verify-otp`): Two-Factor Authentication.

### Dashboard
- **Main Dashboard** (`/dashboard`): Aggregate metrics, recent activities, and KPIs.
- **Analytics Dashboard** (`/dashboard/analytics`): Deep dive into financial metrics and loan health.

### User Management
- **User List** (`/users`): Manage administrative users and staff.
- **Add User** (`/users/new`): Create new staff accounts.
- **User Details** (`/users/[id]`): View/edit specific user permissions and activity.

### Customer Management
- **Customer List** (`/customers`): Central repository of all customers.
- **Add Customer** (`/customers/new`): Onboard new customers.
- **Customer Details** (`/customers/[id]`): Profile, KYC, active loans, and transaction history.
- **Customer Documents** (`/customers/[id]/documents`): Upload and manage identity/financial documents.

### Loan Management (Main Business Module)
- **Loan List** (`/loans`): View all active, pending, and closed loans.
- **Create Loan** (`/loans/new`): Application and underwriting process.
- **Loan Details** (`/loans/[id]`): Loan terms, EMI schedule, payment history.
- **Loan Approval** (`/loans/[id]/approval`): Underwriter approval workflow.
- **EMI Payments** (`/loans/[id]/payments`): Log and manage installments.

### Settings & Profile
- **Global Settings** (`/settings`): Organization-wide configurations.
- **Profile** (`/profile`): Current user profile and preferences.

### System Pages
- **403 Forbidden** (`/403`): Unauthorized access.
- **404 Not Found** (`/404`): Page missing.
- **500 Server Error** (`/500`): Internal application error.

## 3. Information Architecture

- **Main Navigation Hierarchy:** Sidebar-driven navigation with primary modules (Dashboard, Customers, Loans, Users, Settings).
- **Breadcrumb Behavior:** Displayed on all detail and nested pages (e.g., `Home > Customers > John Doe`).
- **Role-based Navigation:** Admin users see all menu items; loan officers see a restricted view (no Settings or User Management).
- **Mobile Navigation Structure:** Drawer menu (hamburger) mapping to the desktop sidebar.

## 4. Application Layout

### Desktop Layout
- **Expanded Sidebar:** 260px
- **Collapsed Sidebar:** 72px
- **Desktop Header:** 64px
- **Desktop Page Padding:** 24px–32px
- **Maximum Content Width:** 1440px
- **Sticky Behavior:** Header and Sidebar are sticky; main content scrolls independently.

### Tablet Layout
- **Sidebar:** Collapsed by default (72px) or hidden in a drawer.
- **Tablet Header:** 60px
- **Tablet Page Padding:** 20px–24px

### Mobile Layout
- **Mobile Header:** 56px
- **Mobile Page Padding:** 16px
- **Hamburger Menu:** Opens a full-height navigation drawer.
- **Responsive Tables:** Converted to stacked card views or utilize horizontal scrolling.

## 5. Sidebar Design System

- **Expanded state:** 260px width, displays logo, full menu names, and icons.
- **Collapsed state:** 72px width, displays icons only. Tooltips appear on hover.
- **Menu item height:** 44px
- **Horizontal padding:** 12px
- **Icon size:** 20px
- **Icon and text gap:** 12px
- **Border radius:** 8px
- **Active menu state:** Highlighted with Primary color background (light opacity) and Primary bold text.
- **Hover state:** Muted background.

## 6. Header and Top Navigation

- **Page Title:** Dynamically reflects the current route.
- **Global Search:** Command palette (`Cmd+K` / `Ctrl+K`) for quick customer or loan lookups.
- **Notifications:** Bell icon with unread count badge.
- **Theme Switcher:** Toggle between Light and Dark modes.
- **User Avatar:** Dropdown for Profile and Logout.

## 7. Color Design System

A modern, professional fintech palette (Royal Blue, Slate, Teal, Gold).

| Token | Light Theme | Dark Theme | Usage |
|-------|-------------|------------|-------|
| `--background` | `#F8FAFC` | `#0F172A` | App background |
| `--foreground` | `#0F172A` | `#F8FAFC` | Primary text |
| `--card` | `#FFFFFF` | `#1E293B` | Card & surface background |
| `--card-foreground` | `#0F172A` | `#F8FAFC` | Card text |
| `--primary` | `#1E40AF` | `#3B82F6` | Royal Blue (buttons, links) |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | Text on primary |
| `--secondary` | `#0F766E` | `#14B8A6` | Teal (accents) |
| `--secondary-foreground`| `#FFFFFF` | `#FFFFFF` | Text on secondary |
| `--accent` | `#B45309` | `#F59E0B` | Gold (highlights) |
| `--muted` | `#F1F5F9` | `#334155` | Secondary backgrounds |
| `--muted-foreground` | `#64748B` | `#94A3B8` | Secondary text |
| `--border` | `#E2E8F0` | `#334155` | Dividers & borders |
| `--input` | `#E2E8F0` | `#334155` | Input borders |
| `--success` | `#16A34A` | `#22C55E` | Success states |
| `--warning` | `#EA580C` | `#F97316` | Warning states |
| `--destructive` | `#DC2626` | `#EF4444` | Error/Delete states |
| `--info` | `#2563EB` | `#3B82F6` | Information states |

## 8. Typography System

**Primary Font:** Inter (Google Fonts)

| Style | Font Size | Font Weight | Line Height |
|-------|-----------|-------------|-------------|
| Display | 40px | 700 (Bold) | 1.2 |
| H1 | 32px | 700 (Bold) | 1.2 |
| H2 | 28px | 600 (Semibold)| 1.3 |
| H3 | 24px | 600 (Semibold)| 1.4 |
| H4 | 20px | 600 (Semibold)| 1.4 |
| Page title | 24px | 600 (Semibold)| 1.4 |
| Section title| 18px | 500 (Medium) | 1.5 |
| Body | 14px-16px | 400 (Regular) | 1.5 |
| Label | 14px | 500 (Medium) | 1.4 |
| Caption | 12px | 400 (Regular) | 1.4 |

## 9. Spacing System
Based on multiples of four: `4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px`.
- **Card Padding:** `24px` (Desktop), `16px` (Mobile)
- **Section Gap:** `32px`
- **Form Field Gap:** `16px`

## 10. Grid and Responsive Breakpoints
- `sm`: 640px (Mobile landscape)
- `md`: 768px (Tablet)
- `lg`: 1024px (Small desktop)
- `xl`: 1280px (Desktop)
- `2xl`: 1536px (Large desktop)

## 11. Button Design System
**Variants:** Primary, Secondary, Outline, Ghost, Destructive, Link.
**Sizes:**
- Small: `32px` height
- Medium: `40px` height
- Large: `48px` height
- Border radius: `6px`

## 12. Form Design System
- **Standard Input Height:** `40px`
- **Label Placement:** Top (Gap: 6px)
- **Error Handling:** Inline below the input in `--destructive` color.
- **Validation:** Zod schema validation using React Hook Form.

## 13. Card Design System
- **Padding:** 24px
- **Border:** 1px solid `--border`
- **Radius:** 12px
- **Shadow:** Subtle drop shadow (sm or md) for elevation. Glassmorphic effects where appropriate (using backdrop-blur).

## 14. Table Design System
- **Header Height:** `44px`, bold text, subtle background.
- **Row Height:** `52px` (Comfortable).
- **Mobile Behavior:** Convert rows into stacked cards or enable horizontal scrolling with a sticky first column.
- **Features:** Pagination, column sorting, global search.

## 15. Search, Filter, and Sorting Standards
- **Global Search:** Header search bar, debounced by 300ms.
- **Filtering:** Filter chips above tables or in a collapsible drawer for advanced filters.

## 16. Tabs, Accordions, and Navigation Controls
- **Tabs:** Horizontal layout for page-level navigation (e.g., Customer Details -> Profile, Loans, Documents).
- **Accordions:** Used for FAQs or collapsing complex form sections.

## 17. Modal, Dialog, Drawer, and Popover System
- **Modal Widths:** Small (400px), Medium (560px), Large (720px).
- **Backdrop:** Semi-transparent dark overlay (`rgba(0,0,0,0.5)`).
- **Drawer:** Slides in from the right for editing entities (e.g., Edit User) without losing context.

## 18. Status and Feedback Components
- **Toast:** Top-right or bottom-right placement, auto-dismiss after 3000ms.
- **Skeleton:** Used for progressive loading instead of full-page spinners.

## 19. Badge and Status System
- **Active / Approved:** Green (`--success`) text and light green background.
- **Pending / In Review:** Yellow/Gold (`--warning`) text and light yellow background.
- **Rejected / Defaulted:** Red (`--destructive`) text and light red background.
- **Closed:** Gray (`--muted-foreground`) text and muted background.

## 20. Dashboard Design Guidelines
- Prioritize high-level KPI cards (Total Active Loans, Disbursed Amount, Pending Approvals).
- Use trend indicators (e.g., "+5.2% from last month").
- Include a Recent Activity list for quick context.

## 21. Charts and Data Visualization
- Utilize Recharts.
- Use Line/Area charts for revenue trends.
- Use Donut charts for portfolio distribution (e.g., Loan Types).
- Ensure chart colors meet contrast guidelines and look good in both light/dark modes.

## 22. Icons and Illustrations
- **Library:** Lucide React.
- **Size:** `16px` for inline text, `20px` for buttons/menus, `24px` for headers.

## 23. Image and Media Guidelines
- **Avatar:** Circular, object-fit cover, with initials as fallback.
- **Documents:** PDF/Image previews should open in a modal or secure new tab.

## 24. Empty, Loading, and Error States
- **Empty State:** Use a muted icon (32px+), title, description, and a primary action button (e.g., "Create First Loan").
- **Loading State:** Utilize skeleton loaders matching the content layout.
- **Error State:** Clear message, error code (if applicable), and a "Retry" or "Go Back" button.

## 25. Interaction and Animation Guidelines
- **Transitions:** `200ms ease-in-out` for hovers and state changes.
- **Modals/Drawers:** Slide in / fade in over `250ms`.

## 26. Accessibility Standards
- Target WCAG 2.1 AA.
- Support keyboard navigation (`Tab`, `Enter`, `Escape`).
- Visible focus rings (`ring-2 ring-primary`).
- Proper ARIA labels for icon-only buttons.

## 27. Theme System
- Support Light, Dark, and System Preference modes.
- Implement via Tailwind CSS `dark:` variant and CSS variables.

## 28. Role and Permission-Based UI
- Hide unauthorized menu items and buttons based on user role (Admin vs. Loan Officer).
- Implement read-only states for users without edit permissions.

## 29. Page-Level Documentation Template
*(Use this structure when detailing individual pages in development)*
```md
## [Page Name]
- Route: /example
- Module: Example Module
- User Roles: Admin, Officer
- Purpose: Describe page purpose.
- Main Components: Table, Filters, Action Header
- API Requirements: GET /api/example, POST /api/example
```

## 30. Component Inventory
- **Layout:** Sidebar, Header, PageContainer.
- **Forms:** Input, Select, DatePicker, Button.
- **Data Display:** Table, Card, Badge, Avatar.
- **Feedback:** Toast, Alert, Skeleton, Spinner.
- **Overlay:** Modal, Drawer, Popover, Tooltip.

## 31. Recommended Frontend Folder Structure
```text
src/
├── app/             # Next.js App Router pages
├── components/
│   ├── ui/          # Reusable Shadcn/Radix components
│   ├── layout/      # Sidebar, Header, AppShell
│   └── shared/      # Shared business components (e.g., StatusBadge)
├── features/        # Feature-based grouping (e.g., auth, loans, customers)
├── hooks/           # Custom React hooks
├── lib/             # Utility configurations (e.g., utils.ts for tailwind-merge)
├── services/        # API calls (e.g., axios/fetch wrappers)
├── types/           # TypeScript interfaces/types
└── styles/          # globals.css (CSS variables)
```

## 32. Naming Conventions
- **Components:** PascalCase (`Button.tsx`, `LoanDetails.tsx`).
- **Files/Folders:** kebab-case (`customer-list`, `utils.ts`).
- **Types/Interfaces:** PascalCase (`Customer`, `LoanData`).
- **Constants:** UPPER_SNAKE_CASE (`MAX_UPLOAD_SIZE`).

## 33. State Management Guidelines
- **Server State:** TanStack React Query for caching, fetching, and updating API data.
- **Form State:** React Hook Form + Zod.
- **Global UI State:** Zustand (for simple global states like sidebar toggle) or React Context.
- **URL State:** Use URL search params for table pagination, sorting, and filtering.

## 34. API Integration Standards
- Abstract API calls into a `services/` directory.
- Use interceptors for injecting Auth tokens.
- Handle global error states (e.g., 401 Unauthorized redirects to login).

## 35. Performance Guidelines
- Lazy load heavy components (e.g., Recharts) using `next/dynamic`.
- Optimize images using `next/image`.
- Memoize expensive calculations (`useMemo`) and callbacks (`useCallback`).

## 36. Security Guidelines
- Never store sensitive data (PII, passwords) in local storage.
- Store JWT tokens securely.
- Sanitize user inputs to prevent XSS.

## 37. Testing Standards
- Unit Testing: Jest + React Testing Library (for core utilities and complex components).
- E2E Testing: Playwright or Cypress (for critical flows like Loan Origination).

## 38. Browser and Device Support
- Modern browsers (Chrome, Edge, Firefox, Safari).
- Responsive down to 320px width screens (iPhone SE).

## 39. Content and Microcopy Guidelines
- Use clear, action-oriented button labels ("Approve Loan" instead of "Submit").
- Consistent capitalization (Title Case for Headers, Sentence case for descriptions).
- Date format: `DD MMM YYYY` (e.g., 14 Jul 2026).
- Currency format: Locale-aware, primarily USD `$1,000.00`.

## 40. Final Frontend Checklist
- [ ] All pages documented and implemented.
- [ ] Responsive behavior tested on mobile, tablet, and desktop.
- [ ] Dark mode fully functional.
- [ ] Accessibility (keyboard nav, contrast) checked.
- [ ] Role-based permissions tested.
- [ ] Form validation complete with error messages.
- [ ] Empty and Loading states implemented for all data fetches.
- [ ] Final design consistency review completed.













Phase 10: Reports, Dashboard, Audit, Notifications, Collections, Renewals, Credit Scores, Settings







You are a senior backend architect and Node.js engineer. Help me build the complete, production-ready backend for a Loan Management System named “Drumina Loan Finance”.

Do not generate only a demo or incomplete boilerplate. Build the backend module by module, run it, test it, fix errors, and document everything. Do not leave placeholder functions, fake implementations, or TODO comments unless an external provider’s credentials are required.

==================================================
1. TECHNOLOGY STACK
==================================================

Use:

- Node.js
- Express.js
- Modern JavaScript (ES2022+) using ES modules
- PostgreSQL
- Prisma ORM
- Redis for caching, OTPs, sessions, rate limiting, and background jobs
- BullMQ for scheduled notifications and EMI reminders
- JWT access and refresh token authentication
- Zod for request validation
- Swagger/OpenAPI documentation
- Jest and Supertest for testing
- Docker and Docker Compose
- AWS S3-compatible storage for documents
- Nodemailer for email
- SMS and WhatsApp provider abstraction
- ESLint and Prettier
- Helmet, CORS, compression, and rate limiting
- Pino structured logging

Use the latest stable and mutually compatible package versions.

Use plain JavaScript only throughout the backend:

- Use `.js` files only; do not generate `.ts` files
- Set `"type": "module"` in package.json
- Use `import` and `export` syntax consistently
- Do not install or configure TypeScript, ts-node, tsx, or TypeScript-only tooling
- Do not add tsconfig.json or TypeScript declaration files
- Use JSDoc selectively when it materially improves API or domain-model clarity
- Use Zod schemas for runtime validation rather than relying on compile-time types

==================================================
2. PROJECT ARCHITECTURE
==================================================

Use a feature-based, modular architecture such as:

src/
  app.js
  server.js
  config/
  database/
  middleware/
  shared/
  utils/
  jobs/
  templates/
  modules/
    auth/
    users/
    roles/
    permissions/
    branches/
    employees/
    customers/
    master-data/
    loans/
    loan-approvals/
    guarantors/
    nominees/
    documents/
    emi/
    collections/
    payments/
    penalties/
    renewals/
    credit-scores/
    notifications/
    reports/
    audit-logs/
    compliances/
    dashboard/
    settings/

Inside each module, use an appropriate structure:

- controller
- service
- repository
- routes
- validation/schema
- constants/helpers where required
- tests

Use descriptive JavaScript filenames such as:

- loan.controller.js
- loan.service.js
- loan.repository.js
- loan.routes.js
- loan.schema.js
- loan.constants.js
- loan.test.js

Keep controllers thin. Business logic must remain in services, while database operations belong in repositories.

Use dependency injection or clear dependency boundaries so modules remain testable.

==================================================
3. USER ROLES AND SECURITY
==================================================

Create role-based access control with:

- Super Admin
- Admin
- Branch Manager
- Loan Officer
- Collection Agent
- Accountant
- Compliance Officer
- Viewer

Implement granular permissions such as:

- customer.create
- customer.read
- customer.update
- loan.create
- loan.approve
- loan.reject
- loan.disburse
- emi.collect
- payment.reverse
- report.export
- employee.manage
- settings.manage

Requirements:

- Secure login using mobile/email and password
- Optional OTP login
- Access and refresh tokens
- Refresh-token rotation
- Logout from current device
- Logout from all devices
- Password reset
- Password hashing using Argon2 or bcrypt
- Account lockout after repeated failed attempts
- Role and permission middleware
- Branch-level data isolation
- Request validation and sanitization
- API rate limiting
- Secure HTTP headers
- Configurable CORS
- Idempotency keys for payment and EMI collection APIs
- Never log passwords, OTPs, tokens, complete Aadhaar numbers, bank details, or sensitive document data

Store only masked or properly encrypted sensitive information. Do not implement Aadhaar OTP or claim UIDAI integration. If Aadhaar information is stored for KYC, make it optional, masked, access-controlled, and designed for applicable consent and compliance requirements.

==================================================
4. MAIN BUSINESS MODULES
==================================================

A. Master Setup

Create APIs for:

- States
- Cities
- Areas
- Branches
- Loan types
- Banks
- Interest configurations
- Penalty configurations
- Document types
- Payment modes

Support activation/deactivation instead of unsafe deletion when records are already in use.

B. Employees

Create:

- Add employee
- Employee list and profile
- Branch assignment
- Role and permission assignment
- Status activation/deactivation
- Collection-agent assignment
- Employee performance metrics

C. Customers

Customer fields should include:

- Unique customer number
- Full name
- Mobile number
- Alternate mobile
- Email
- Date of birth
- Gender
- Address
- State, city, area and PIN code
- Occupation
- Employment type
- Monthly income
- Bank details
- KYC status
- Profile photo
- Notes
- Branch
- Created-by employee

Requirements:

- Search by name, mobile number, customer number, or loan number
- Detect possible duplicates
- Paginated customer list
- Customer loan history
- Payment and EMI history
- Documents
- Audit history
- Automatically reuse an existing customer when a new loan is created
- Do not silently create duplicates

D. Loan Creation

Implement a five-stage draft workflow:

1. Personal/customer details
2. Loan details
3. Nominee and guarantor details
4. Document uploads
5. Preview and final submission

Each stage must support:

- Save as draft
- Update
- Validate
- Next stage
- Previous stage
- Preview
- Final submit

Support:

- Gold loan
- Vehicle loan
- Personal loan
- Additional configurable loan types
- Flat interest
- Reducing-balance interest
- Configurable amount, interest rate, tenure, processing fee, insurance, tax, and other charges
- Two nominees
- Two guarantors
- Customer, nominee, guarantor, vehicle, income and collateral documents
- Loan-number generation
- EMI schedule generation
- Loan status history
- Internal notes
- Assigned employee and branch

Loan statuses:

- DRAFT
- NEW
- PENDING_APPROVAL
- APPROVED
- REJECTED
- DISBURSEMENT_PENDING
- DISBURSED
- ACTIVE
- OVERDUE
- COMPLETED
- CLOSED
- CANCELLED
- WRITTEN_OFF

Use a state-transition service. Do not allow arbitrary status updates.

E. Loan Approval

Create a configurable approval workflow:

- Loan officer submits loan
- Branch manager reviews
- Admin or authorized approver approves/rejects
- Rejection reason is mandatory
- Approval limits can depend on role, amount, branch, and loan type
- Prevent the creator from approving their own loan when maker-checker control is enabled
- Record every decision and timestamp
- Allow sending back for corrections
- Prevent disbursement until required approvals and documents are complete

F. Loan Disbursement

Support:

- Bank transfer
- UPI
- Cash
- Cheque
- Other configurable modes

Store:

- Approved amount
- Charges
- Net disbursed amount
- Transaction reference
- Bank/payment information
- Disbursement date
- Authorized employee
- Receipt or supporting document

Use database transactions to keep loan and disbursement data consistent.

G. EMI and Interest Calculation

Create a verified financial calculation service for:

- Flat-rate EMI
- Reducing-balance EMI
- Monthly, weekly, fortnightly, and custom repayment frequencies
- Principal and interest breakup
- Opening and closing balance
- Due dates
- Grace period
- Late fees
- Fixed or percentage penalties
- Partial payment
- Advance payment
- Prepayment
- Foreclosure
- Missed EMI
- Rescheduling
- Rounding rules

Store monetary values using PostgreSQL NUMERIC/DECIMAL. Never use JavaScript floating-point arithmetic for financial calculations. Use a decimal arithmetic library.

For reducing balance, implement and test the standard EMI formula:

EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)

Clearly define how annual interest is converted into a periodic rate.

Generate an immutable scheduled-amount record. Payment allocation should be configurable, for example:

1. Penalty
2. Other charges
3. Interest
4. Principal

Add unit tests using manually verified calculation examples.

H. EMI Collection

Create APIs for:

- Today’s collections
- Upcoming EMIs
- Overdue EMIs
- EMI calendar
- Customer-wise dues
- Record full payment
- Record partial payment
- Advance collection
- Payment allocation
- Receipt generation
- Payment reversal with authorization and reason
- Cash collection reconciliation
- Collection-agent assignment
- Collection notes

Prevent duplicate collection through idempotency keys and database constraints.

Every collection must create:

- Payment transaction
- Allocation details
- Receipt number
- Updated EMI status
- Updated outstanding balance
- Audit-log record

I. Loan Renewal

Allow renewal when configured business conditions are satisfied:

- Existing loan is completed, eligible, or specifically approved
- Reuse existing customer and KYC information
- Request only expired or missing documents
- Create a new loan record linked to the previous loan
- Preserve historical loan information
- Run a fresh approval process when required

J. Documents

Implement:

- S3-compatible file uploads
- Presigned upload/download URLs
- File type and size validation
- Malware-scanning integration point
- Document categories
- Expiry date
- Verification status
- Verified-by user
- Rejection reason
- Version history
- Access control
- Soft deletion

Do not store uploaded files directly inside PostgreSQL.

K. Credit Score

Create a provider-independent interface for credit-score checks:

- Provider adapter
- Customer consent record
- Request and response metadata
- Masked report details
- Score history
- Error handling
- Sandbox/mock provider for development

Do not claim official CIBIL access without an authorized provider agreement. Name the internal module “credit-scores”, not “CIBIL”, unless a licensed CIBIL integration is actually configured.

L. Notifications

Support:

- SMS
- Email
- WhatsApp
- In-app notifications

Events:

- Loan submitted
- Loan approved or rejected
- Loan disbursed
- EMI reminder
- EMI due today
- EMI overdue
- Payment received
- Receipt generated
- Loan completed
- Document expiring

Use templates, queues, retries, delivery logs, failure tracking, provider adapters, and customer notification preferences.

M. Reports and Dashboard

Create APIs for:

- Dashboard summary
- Daily collection
- Transaction history
- Loan portfolio
- Branch performance
- Employee performance
- Outstanding dues
- Aging report
- Overdue loans
- Disbursement report
- Collection efficiency
- Business trends
- Loan-type performance
- Cash reconciliation

Add filtering by:

- Date range
- Branch
- Employee
- Loan type
- Loan status
- Payment mode

Support export-ready data for CSV, Excel, and PDF. Large exports should run as background jobs rather than blocking API requests.

N. Audit Logs and Compliance

Create append-only audit logs containing:

- Actor
- Action
- Entity type
- Entity ID
- Branch
- Timestamp
- IP address
- User agent
- Request/correlation ID
- Masked before and after values
- Reason, where required

Audit sensitive actions including:

- Login attempts
- Permission changes
- Loan decisions
- Disbursements
- Payments
- Reversals
- Document access
- Report exports
- Settings changes

Do not expose internal secrets or raw sensitive data in audit records.

==================================================
5. DATABASE REQUIREMENTS
==================================================

Design a normalized Prisma schema with appropriate:

- UUID primary keys
- Unique constraints
- Foreign keys
- Composite indexes
- Check constraints where possible
- Created and updated timestamps
- Created-by and updated-by fields
- Soft-deletion support only where appropriate
- Optimistic concurrency/version fields for sensitive records

Important entities should include:

- User
- Role
- Permission
- UserRole
- RolePermission
- RefreshToken/Session
- Branch
- Employee
- Customer
- CustomerAddress
- CustomerBankAccount
- KycRecord
- LoanType
- Loan
- LoanApplicationStage
- LoanStatusHistory
- LoanApproval
- Nominee
- Guarantor
- Document
- DocumentVersion
- Disbursement
- EmiSchedule
- Payment
- PaymentAllocation
- Penalty
- LoanRenewal
- CreditScoreRequest
- Notification
- NotificationTemplate
- AuditLog
- SystemSetting
- IdempotencyRecord

Use database transactions for:

- Final loan submission
- Loan approval
- Disbursement
- EMI schedule creation
- EMI collection
- Payment reversal
- Loan closure
- Renewal

Create seed data for:

- Roles
- Permissions
- Super Admin
- Sample branch
- Loan types
- Payment modes
- Development customers and loans

Seed credentials must only be allowed in development and must be documented clearly.

==================================================
6. API DESIGN
==================================================

Use:

- REST API under /api/v1
- Consistent resource naming
- Standard HTTP status codes
- Pagination
- Sorting
- Filtering
- Search
- Consistent response format
- Centralized exception handling
- Request/correlation IDs
- API versioning

Example success response:

{
  "success": true,
  "message": "Loan created successfully",
  "data": {},
  "meta": {}
}

Example error response:

{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [],
  "requestId": "..."
}

Create health endpoints:

- /health/live
- /health/ready

Readiness should check critical dependencies without exposing credentials.

==================================================
7. TESTING
==================================================

Create:

- Unit tests
- Integration tests
- API tests
- Financial calculation tests
- Authentication tests
- Authorization tests
- Branch-isolation tests
- Loan-workflow tests
- EMI collection tests
- Duplicate-payment tests
- Payment-reversal tests
- Validation tests

Use a separate test database.

Test important negative cases:

- Unauthorized access
- Cross-branch access
- Invalid status transition
- Duplicate customer
- Duplicate payment
- Loan approval without permission
- Disbursement before approval
- Payment greater than allowed amount
- Invalid or expired refresh token
- Missing required documents
- Concurrent EMI collection attempts

Generate a test-coverage report and fix important uncovered business logic.

==================================================
8. DEVOPS AND CONFIGURATION
==================================================

Create:

- Dockerfile
- docker-compose.yml
- .env.example
- Development configuration
- Test configuration
- Production configuration
- Database migrations
- Seed command
- Start scripts
- Production start and verification scripts
- Lint and format scripts
- Test scripts
- Graceful shutdown
- Process error handling
- CI workflow for linting, formatting checks, Prisma validation, tests, security auditing, and production startup verification

Docker Compose should include:

- API
- PostgreSQL
- Redis

Never commit actual secrets.

Validate required environment variables when the application starts.

Include environment variables for:

- Database
- Redis
- JWT secrets
- Token expiry
- CORS origins
- S3-compatible storage
- Email
- SMS
- WhatsApp
- Credit-score provider
- Encryption keys
- Application URL

==================================================
9. DOCUMENTATION
==================================================

Create:

- README.md
- SETUP.md
- ARCHITECTURE.md
- DATABASE.md
- API.md
- SECURITY.md
- DEPLOYMENT.md
- TESTING.md
- Postman collection
- Postman environment
- Swagger documentation

Documentation must explain:

- Required software
- Installation
- Environment configuration
- PostgreSQL setup
- Redis setup
- Prisma migrations
- Database seeding
- Running in development
- Running with Docker
- Running tests
- Building for production
- Default development credentials
- API authentication
- Example API requests
- Deployment instructions
- Backup and migration approach
- Common errors and solutions

==================================================
10. IMPLEMENTATION PROCESS
==================================================

Follow this process:

1. Inspect the existing project before changing files.
2. Read any README, AGENTS.md, package files, environment examples, and existing code.
3. Explain what currently exists and identify conflicts.
4. Create a short implementation plan.
5. Set up the project foundation.
6. Design the database schema.
7. Configure Docker, PostgreSQL, Redis, and Prisma.
8. Implement authentication and authorization.
9. Implement master data, branches, employees, and customers.
10. Implement loan creation and approval.
11. Implement EMI calculations and schedules.
12. Implement collection and payment workflows.
13. Implement documents, renewals, notifications, reports, and audit logs.
14. Create Swagger and Postman documentation.
15. Write and run tests.
16. Run ESLint, Prettier checks, Prisma validation, migrations, tests, dependency security audit, and production startup verification.
17. Fix every reproducible error.
18. Provide a final completion report.

After completing each major phase:

- Show which files were created or changed.
- Explain how to run that phase.
- Run the relevant validation commands.
- Report actual results.
- Continue to the next phase unless genuine user input is required.

Do not repeatedly ask for confirmation for normal implementation decisions. Choose sensible production-ready defaults and document them.

If the existing project already uses a different ORM or architecture, first evaluate it. Preserve good existing work instead of replacing it unnecessarily.

==================================================
11. COMPLETION REQUIREMENTS
==================================================

The backend is complete only when:

- The application starts successfully
- PostgreSQL and Redis connections work
- Migrations run successfully
- Seed data works
- Authentication works
- Permissions and branch isolation work
- Loan draft and submission work
- Approval and rejection work
- Disbursement works
- Flat and reducing EMI calculations are tested
- EMI schedules are generated correctly
- Full and partial collections work
- Duplicate collections are prevented
- Payment reversals are audited
- Loan renewal works
- Document upload flow works
- Notifications are queued
- Reports return filtered data
- Swagger loads
- Postman collection is included
- Tests pass
- All backend source files use JavaScript and ES modules
- No TypeScript dependencies, files, or configuration are present
- Prisma schema validation passes
- Linting passes
- Production startup verification passes
- Docker setup works
- Documentation is complete

At the end, provide:

1. Final folder structure
2. Implemented modules
3. Database tables
4. API endpoint summary
5. Commands to install and run
6. Commands to test
7. Development login credentials
8. Environment variables still requiring real provider credentials
9. Test, lint, Prisma validation, security audit, and production startup verification results
10. Remaining external integration steps
11. Security and production deployment checklist

Start by inspecting the current workspace and then implement the backend.
