# Loan Management System - Backend API

A production-ready, scalable loan management system backend built with Node.js, Express.js, PostgreSQL, and Prisma ORM.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (ADMIN, EMPLOYEE, USER)
- **Customer Management**: Complete CRUD operations for customer data
- **Loan Management**: Loan creation, approval/rejection workflow, EMI generation
- **EMI Tracking**: Calendar view, upcoming EMIs, overdue tracking, payment collection
- **SMS EMI Reminders**: Automatic reminder job and manual reminder endpoint for upcoming EMIs
- **Payment Processing**: Multiple payment modes (Cash, Paytm, Bank Transfer, UPI, Cheque)
- **Guarantor & Nominee Management**: Complete management of guarantors and nominees
- **Document Management**: Secure file upload for Aadhaar, PAN, photos, and other documents
- **Reports & Dashboard**: Comprehensive analytics and reporting
- **Security**: Helmet, rate limiting, CORS, input validation, SQL injection prevention
- **Error Handling**: Centralized error handling with meaningful messages
- **Logging**: Comprehensive logging system

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/loan_management?schema=public"
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
SMS_ENABLED=false
SMS_API_URL=
```

4. **Setup database**
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial data
npm run prisma:seed
```

5. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # Prisma client
│   │   └── env.js           # Environment variables
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.js          # Authentication & authorization
│   │   ├── errorHandler.js  # Error handling
│   │   ├── upload.js        # File upload
│   │   └── validate.js      # Request validation
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication
│   │   ├── users/           # User management
│   │   ├── customers/       # Customer management
│   │   ├── loans/           # Loan management
│   │   ├── emi/             # EMI management
│   │   ├── guarantors/      # Guarantor management
│   │   ├── nominees/        # Nominee management
│   │   ├── documents/       # Document management
│   │   └── reports/         # Reports & analytics
│   ├── utils/               # Utility functions
│   │   ├── apiResponse.js   # API response formatter
│   │   ├── appError.js      # Custom error class
│   │   ├── asyncHandler.js  # Async error handler
│   │   ├── emiCalculator.js # EMI calculations
│   │   └── logger.js        # Logging utility
│   ├── validators/          # Request validators
│   ├── app.js               # Express app setup
│   └── server.js            # Server entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.js              # Seed data
├── uploads/                 # File uploads
├── logs/                    # Application logs
├── .env                     # Environment variables
├── .env.example             # Environment template
├── package.json
└── README.md
```

## 🔐 Default Login Credentials

After seeding the database:

- **Admin**: admin@loanmanagement.com / admin123
- **Employee**: employee@loanmanagement.com / admin123
- **User**: user@loanmanagement.com / admin123

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| POST | `/auth/refresh` | Refresh access token | Public |
| POST | `/auth/logout` | Logout user | Private |
| GET | `/auth/profile` | Get user profile | Private |

### Customer Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/customers` | Create customer | Admin, Employee |
| GET | `/customers` | Get all customers | All authenticated |
| GET | `/customers/:id` | Get customer by ID | All authenticated |
| PUT | `/customers/:id` | Update customer | Admin, Employee |
| DELETE | `/customers/:id` | Delete customer | Admin |

### Loan Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/loans` | Create loan and EMI calendar schedule | Admin, Employee |
| GET | `/loans` | Get all loans | All authenticated |
| GET | `/loans/:id` | Get loan by ID | All authenticated |
| PUT | `/loans/:id` | Update loan | Admin, Employee |
| PATCH | `/loans/:id/approve` | Approve loan | Admin, Employee |
| PATCH | `/loans/:id/reject` | Reject loan | Admin, Employee |
| DELETE | `/loans/:id` | Delete loan | Admin |

### EMI Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/emi/calendar` | Get EMI calendar | All authenticated |
| GET | `/emi/upcoming` | Get upcoming EMIs | All authenticated |
| GET | `/emi/overdue` | Get overdue EMIs | All authenticated |
| GET | `/emi/loan/:loanId` | Get EMIs by loan | All authenticated |
| POST | `/emi/reminders/send` | Send upcoming EMI SMS reminders | Admin, Employee |
| POST | `/emi/:id/pay` | Pay EMI | Admin, Employee |
| GET | `/emi/:id/history` | Get payment history | All authenticated |

### Guarantor Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/guarantors` | Create guarantor | Admin, Employee |
| GET | `/guarantors/loan/:loanId` | Get guarantors by loan | All authenticated |
| PUT | `/guarantors/:id` | Update guarantor | Admin, Employee |
| DELETE | `/guarantors/:id` | Delete guarantor | Admin |

### Nominee Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/nominees` | Create nominee | Admin, Employee |
| GET | `/nominees/customer/:customerId` | Get nominees by customer | All authenticated |
| PUT | `/nominees/:id` | Update nominee | Admin, Employee |
| DELETE | `/nominees/:id` | Delete nominee | Admin |

### Document Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/documents/upload` | Upload document | Admin, Employee |
| GET | `/documents/:entityType/:entityId` | Get documents | All authenticated |
| GET | `/documents/download/:id` | Download document | All authenticated |
| DELETE | `/documents/:id` | Delete document | Admin, Employee |

### Report Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/reports/dashboard` | Get dashboard data | All authenticated |
| GET | `/reports/loans` | Get loan report | Admin, Employee |
| GET | `/reports/collections` | Get collection report | Admin, Employee |
| GET | `/reports/overdue` | Get overdue report | Admin, Employee |

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/users` | Get all users | Admin |
| GET | `/users/:id` | Get user by ID | Admin |
| PUT | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |

## 🔑 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

## 📝 Request Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "9876543210",
  "role": "EMPLOYEE"
}
```

### Create Customer
```bash
POST /api/customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "9876543211",
  "address": "123 Main St",
  "aadhaar": "123456789012",
  "pan": "ABCDE1234F"
}
```

### Create Loan
```bash
POST /api/loans
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "uuid-here",
  "amount": 100000,
  "interestRate": 12,
  "tenure": 12,
  "purpose": "Business expansion"
}
```

### Pay EMI
```bash
POST /api/emi/:emiId/pay
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 9000,
  "paymentMode": "BANK_TRANSFER",
  "transactionId": "TXN123456",
  "remarks": "Monthly EMI payment"
}
```

### Upload Document
```bash
POST /api/documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
entityType: CUSTOMER
entityId: <customer-uuid>
documentType: AADHAAR
```

## 🧪 Testing with Postman

1. Import the API endpoints into Postman
2. Set up environment variables:
   - `base_url`: http://localhost:5000/api
   - `access_token`: (will be set after login)
3. Login to get access token
4. Use the token for authenticated requests

## 🔒 Security Features

- **Helmet**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS**: Configured for specific origins
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Joi validation for all inputs
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **File Upload Validation**: Type and size restrictions

## 📊 Database Schema

Key entities:
- **Users**: System users with roles
- **Customers**: Loan applicants
- **Loans**: Loan applications and details
- **EMISchedules**: EMI payment schedules
- **Payments**: Payment transactions
- **Guarantors**: Loan guarantors
- **Nominees**: Customer nominees
- **Documents**: Uploaded documents

## 🚨 Error Handling

All errors return a consistent format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## 📈 Performance Optimization

- Database query optimization with Prisma
- Async/await for non-blocking operations
- Efficient pagination
- Indexed database fields
- Connection pooling

## 🛡️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| DATABASE_URL | PostgreSQL connection string | - |
| JWT_ACCESS_SECRET | JWT access token secret | - |
| JWT_REFRESH_SECRET | JWT refresh token secret | - |
| JWT_ACCESS_EXPIRY | Access token expiry | 15m |
| JWT_REFRESH_EXPIRY | Refresh token expiry | 7d |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3000 |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |
| MAX_FILE_SIZE | Max upload file size | 5242880 |

## 📞 Support

For issues and questions, please create an issue in the repository.

## 📄 License

ISC

---

**Built with ❤️ using Node.js, Express.js, PostgreSQL, and Prisma**
