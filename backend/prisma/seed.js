const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@loanmanagement.com' },
    update: {},
    create: {
      email: 'admin@loanmanagement.com',
      password: hashedPassword,
      name: 'Admin User',
      phone: '9999999999',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  const employee = await prisma.user.upsert({
    where: { email: 'employee@loanmanagement.com' },
    update: {},
    create: {
      email: 'employee@loanmanagement.com',
      password: hashedPassword,
      name: 'Employee User',
      phone: '8888888888',
      role: 'EMPLOYEE',
      isActive: true,
    },
  });

  console.log('✅ Employee user created:', employee.email);

  const user = await prisma.user.upsert({
    where: { email: 'user@loanmanagement.com' },
    update: {},
    create: {
      email: 'user@loanmanagement.com',
      password: hashedPassword,
      name: 'Regular User',
      phone: '7777777777',
      role: 'USER',
      isActive: true,
    },
  });

  console.log('✅ Regular user created:', user.email);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Login Credentials:');
  console.log('Admin: admin@loanmanagement.com / admin123');
  console.log('Employee: employee@loanmanagement.com / admin123');
  console.log('User: user@loanmanagement.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
