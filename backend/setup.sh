#!/bin/bash

echo "🚀 Setting up Loan Management System Backend..."
echo ""

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

# Seed database
echo "🌱 Seeding database..."
npm run prisma:seed

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📝 Default Login Credentials:"
echo "   Admin: admin@loanmanagement.com / admin123"
echo "   Employee: employee@loanmanagement.com / admin123"
echo "   User: user@loanmanagement.com / admin123"
echo ""
echo "🚀 Start the server with: npm run dev"
echo "📊 Open Prisma Studio with: npm run prisma:studio"
echo ""
