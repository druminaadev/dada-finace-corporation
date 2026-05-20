# 🚀 Quick Start Guide

## Prerequisites
- Node.js v16+ installed
- PostgreSQL v12+ installed and running
- npm or yarn package manager

## Step 1: Database Setup

1. **Create PostgreSQL Database**
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE loan_management;

# Exit PostgreSQL
\q
```

2. **Update Database Connection**
Edit `.env` file and update the DATABASE_URL:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/loan_management?schema=public"
```

## Step 2: Install & Setup

### Option A: Automated Setup (Recommended)
```bash
./setup.sh
```

### Option B: Manual Setup
```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database
npm run prisma:seed
```

## Step 3: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start at: `http://localhost:5000`

## Step 4: Test the API

### Using cURL
```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@loanmanagement.com","password":"admin123"}'
```

### Using Postman
1. Import `Loan_Management_API.postman_collection.json`
2. Set environment variable `base_url` to `http://localhost:5000/api`
3. Run the "Login" request to get access token
4. Token will be automatically saved to environment
5. Test other endpoints

## Step 5: Access Prisma Studio (Optional)

```bash
npm run prisma:studio
```

Opens at: `http://localhost:5555`

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@loanmanagement.com | admin123 |
| Employee | employee@loanmanagement.com | admin123 |
| User | user@loanmanagement.com | admin123 |

## Common Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio

# View logs
tail -f logs/info.log
tail -f logs/error.log
```

## API Testing Flow

1. **Register/Login**
   - POST `/api/auth/login`
   - Copy the `accessToken` from response

2. **Create Customer**
   - POST `/api/customers`
   - Add `Authorization: Bearer <token>` header

3. **Create Loan**
   - POST `/api/loans`
   - Use customer ID from step 2

4. **Approve Loan**
   - PATCH `/api/loans/:id/approve`
   - EMI schedule will be auto-generated

5. **View EMIs**
   - GET `/api/emi/loan/:loanId`

6. **Pay EMI**
   - POST `/api/emi/:id/pay`

7. **View Dashboard**
   - GET `/api/reports/dashboard`

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists

### Port Already in Use
- Change PORT in .env file
- Or kill process using port 5000:
```bash
lsof -ti:5000 | xargs kill -9
```

### Prisma Client Not Generated
```bash
npx prisma generate
```

### Migration Issues
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Then run migrations again
npx prisma migrate dev
```

## Project Structure Overview

```
backend/
├── src/
│   ├── modules/          # Feature modules (auth, customers, loans, etc.)
│   ├── middlewares/      # Auth, validation, error handling
│   ├── utils/            # Helper functions
│   ├── validators/       # Request validators
│   ├── config/           # Configuration files
│   ├── app.js            # Express app
│   └── server.js         # Server entry
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.js           # Seed data
├── uploads/              # Uploaded files
└── logs/                 # Application logs
```

## Next Steps

1. ✅ Test all authentication endpoints
2. ✅ Create customers and loans
3. ✅ Test EMI payment flow
4. ✅ Upload documents
5. ✅ View reports and dashboard
6. ✅ Customize as needed

## Support

For issues or questions:
- Check README.md for detailed documentation
- Review API endpoints in Postman collection
- Check logs in `logs/` directory

---

**Happy Coding! 🎉**
