/**
 * prisma/seed.js — Secure Database Seed
 *
 * - Uses argon2 (matches auth.service.js)
 * - Seed passwords are read from env vars (not hardcoded)
 * - Never logs plain-text passwords
 * - Seeds all master data needed for the app to function
 */

import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import 'dotenv/config';

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hash = (pwd) => argon2.hash(pwd);

const upsertUser = async (data) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    const user = await prisma.user.update({
      where: { email: data.email },
      data: { password: data.password },
    });
    console.log(`  ↳ Updated password for: ${data.email}`);
    return user;
  }
  const user = await prisma.user.create({ data });
  console.log(`  ✓ Created user: ${data.email} [${data.role}]`);
  return user;
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 Starting secure database seed...\n');

  // ── Passwords from env — fail if not set in production ──────────────────────
  const isProduction = process.env.NODE_ENV === 'production';

  const adminPassword    = process.env.SEED_ADMIN_PASSWORD    || (isProduction ? null : 'Admin@123456!');
  const managerPassword  = process.env.SEED_MANAGER_PASSWORD  || (isProduction ? null : 'Manager@123456!');
  const employeePassword = process.env.SEED_EMPLOYEE_PASSWORD || (isProduction ? null : 'Employee@123456!');

  if (isProduction && (!adminPassword || !managerPassword || !employeePassword)) {
    console.error('❌ SEED_ADMIN_PASSWORD, SEED_MANAGER_PASSWORD, SEED_EMPLOYEE_PASSWORD must be set in production');
    process.exit(1);
  }

  // ── Phase 1: Master Data ─────────────────────────────────────────────────────

  console.log('📍 Seeding States...');
  const states = [
    { name: 'Maharashtra',    code: 'MH' },
    { name: 'Gujarat',        code: 'GJ' },
    { name: 'Rajasthan',      code: 'RJ' },
    { name: 'Madhya Pradesh', code: 'MP' },
    { name: 'Karnataka',      code: 'KA' },
    { name: 'Tamil Nadu',     code: 'TN' },
    { name: 'Delhi',          code: 'DL' },
    { name: 'Uttar Pradesh',  code: 'UP' },
  ];

  const stateMap = {};
  for (const s of states) {
    const state = await prisma.state.upsert({
      where: { code: s.code },
      update: {},
      create: s,
    });
    stateMap[s.code] = state.id;
    console.log(`  ✓ ${s.name}`);
  }

  console.log('\n🏙️  Seeding Cities...');
  const cities = [
    { name: 'Mumbai',     stateCode: 'MH' },
    { name: 'Pune',       stateCode: 'MH' },
    { name: 'Nagpur',     stateCode: 'MH' },
    { name: 'Nashik',     stateCode: 'MH' },
    { name: 'Ahmedabad',  stateCode: 'GJ' },
    { name: 'Surat',      stateCode: 'GJ' },
    { name: 'Vadodara',   stateCode: 'GJ' },
    { name: 'Jaipur',     stateCode: 'RJ' },
    { name: 'Jodhpur',    stateCode: 'RJ' },
    { name: 'Indore',     stateCode: 'MP' },
    { name: 'Bhopal',     stateCode: 'MP' },
    { name: 'Bengaluru',  stateCode: 'KA' },
    { name: 'Chennai',    stateCode: 'TN' },
    { name: 'New Delhi',  stateCode: 'DL' },
    { name: 'Lucknow',    stateCode: 'UP' },
  ];

  const cityMap = {};
  for (const c of cities) {
    const city = await prisma.city.upsert({
      where: { name_stateId: { name: c.name, stateId: stateMap[c.stateCode] } },
      update: {},
      create: { name: c.name, stateId: stateMap[c.stateCode] },
    });
    cityMap[c.name] = city.id;
    console.log(`  ✓ ${c.name}, ${c.stateCode}`);
  }

  console.log('\n📍 Seeding Areas...');
  const areas = [
    { name: 'Andheri',       city: 'Mumbai',    pincode: '400053' },
    { name: 'Bandra',        city: 'Mumbai',    pincode: '400050' },
    { name: 'Dadar',         city: 'Mumbai',    pincode: '400014' },
    { name: 'Koregaon Park', city: 'Pune',      pincode: '411001' },
    { name: 'Shivajinagar',  city: 'Pune',      pincode: '411005' },
    { name: 'Navrangpura',   city: 'Ahmedabad', pincode: '380009' },
    { name: 'Vastrapur',     city: 'Ahmedabad', pincode: '380015' },
    { name: 'Malviya Nagar', city: 'Jaipur',    pincode: '302017' },
    { name: 'Vijay Nagar',   city: 'Indore',    pincode: '452010' },
    { name: 'Koramangala',   city: 'Bengaluru', pincode: '560034' },
  ];

  for (const a of areas) {
    if (!cityMap[a.city]) continue;
    await prisma.area.upsert({
      where: { name_cityId: { name: a.name, cityId: cityMap[a.city] } },
      update: {},
      create: { name: a.name, cityId: cityMap[a.city], pincode: a.pincode },
    });
    console.log(`  ✓ ${a.name} (${a.pincode})`);
  }

  console.log('\n🏢 Seeding Branches...');
  const branches = [
    { name: 'Mumbai Main Branch',    code: 'MUM-01', address: 'Andheri West, Mumbai' },
    { name: 'Pune Branch',           code: 'PUN-01', address: 'Koregaon Park, Pune' },
    { name: 'Ahmedabad Branch',      code: 'AHM-01', address: 'Navrangpura, Ahmedabad' },
    { name: 'Jaipur Branch',         code: 'JAI-01', address: 'Malviya Nagar, Jaipur' },
    { name: 'Indore Branch',         code: 'IND-01', address: 'Vijay Nagar, Indore' },
    { name: 'Bengaluru Branch',      code: 'BLR-01', address: 'Koramangala, Bengaluru' },
    { name: 'Head Office',           code: 'HO-001', address: 'Mumbai, Maharashtra' },
  ];

  for (const b of branches) {
    await prisma.branch.upsert({
      where: { code: b.code },
      update: {},
      create: b,
    });
    console.log(`  ✓ ${b.name} [${b.code}]`);
  }

  console.log('\n💰 Seeding Loan Types...');
  const loanTypes = [
    { name: 'Personal Loan',    minAmount: 10000,  maxAmount: 500000,  minInterestRate: 12, maxInterestRate: 24, minTenure: 6,  maxTenure: 60  },
    { name: 'Gold Loan',        minAmount: 5000,   maxAmount: 2000000, minInterestRate: 9,  maxInterestRate: 18, minTenure: 3,  maxTenure: 36  },
    { name: 'Vehicle Loan',     minAmount: 50000,  maxAmount: 1500000, minInterestRate: 10, maxInterestRate: 20, minTenure: 12, maxTenure: 84  },
    { name: 'Business Loan',    minAmount: 50000,  maxAmount: 5000000, minInterestRate: 14, maxInterestRate: 28, minTenure: 12, maxTenure: 60  },
    { name: 'Education Loan',   minAmount: 50000,  maxAmount: 2000000, minInterestRate: 8,  maxInterestRate: 15, minTenure: 12, maxTenure: 120 },
    { name: 'Home Loan',        minAmount: 500000, maxAmount: 50000000,minInterestRate: 7,  maxInterestRate: 12, minTenure: 60, maxTenure: 360 },
    { name: 'Agriculture Loan', minAmount: 10000,  maxAmount: 300000,  minInterestRate: 7,  maxInterestRate: 14, minTenure: 6,  maxTenure: 36  },
  ];

  for (const lt of loanTypes) {
    await prisma.loanType.upsert({
      where: { name: lt.name },
      update: {},
      create: lt,
    });
    console.log(`  ✓ ${lt.name}`);
  }

  console.log('\n🏦 Seeding Banks...');
  const banks = [
    { name: 'State Bank of India',       ifscPrefix: 'SBIN' },
    { name: 'HDFC Bank',                 ifscPrefix: 'HDFC' },
    { name: 'ICICI Bank',                ifscPrefix: 'ICIC' },
    { name: 'Axis Bank',                 ifscPrefix: 'UTIB' },
    { name: 'Punjab National Bank',      ifscPrefix: 'PUNB' },
    { name: 'Bank of Baroda',            ifscPrefix: 'BARB' },
    { name: 'Canara Bank',               ifscPrefix: 'CNRB' },
    { name: 'Union Bank of India',       ifscPrefix: 'UBIN' },
    { name: 'Kotak Mahindra Bank',       ifscPrefix: 'KKBK' },
    { name: 'IndusInd Bank',             ifscPrefix: 'INDB' },
    { name: 'Yes Bank',                  ifscPrefix: 'YESB' },
    { name: 'IDFC First Bank',           ifscPrefix: 'IDFB' },
    { name: 'Bank of Maharashtra',       ifscPrefix: 'MAHB' },
    { name: 'Central Bank of India',     ifscPrefix: 'CBIN' },
    { name: 'Indian Bank',               ifscPrefix: 'IDIB' },
  ];

  for (const b of banks) {
    await prisma.bank.upsert({
      where: { name: b.name },
      update: {},
      create: b,
    });
    console.log(`  ✓ ${b.name}`);
  }

  // ── Phase 2: Users ───────────────────────────────────────────────────────────

  console.log('\n👤 Seeding Users...');

  await upsertUser({
    email:        'admin@dadafinance.com',
    password:     await hash(adminPassword),
    name:         'System Administrator',
    phone:        '9000000001',
    role:         'ADMIN',
    employeeCode: 'EMP-ADMIN',
    isActive:     true,
  });

  await upsertUser({
    email:        'manager@dadafinance.com',
    password:     await hash(managerPassword),
    name:         'Branch Manager',
    phone:        '9000000002',
    role:         'EMPLOYEE',
    employeeCode: 'EMP-MGR-01',
    isActive:     true,
  });

  await upsertUser({
    email:        'employee@dadafinance.com',
    password:     await hash(employeePassword),
    name:         'Field Employee',
    phone:        '9000000003',
    role:         'EMPLOYEE',
    employeeCode: 'EMP-001',
    isActive:     true,
  });

  // ── Done ─────────────────────────────────────────────────────────────────────

  console.log('\n✅ Database seeding completed successfully!\n');
  console.log('─'.repeat(50));
  console.log('📝 Seed accounts created:');
  console.log('   admin@dadafinance.com    [ADMIN]');
  console.log('   manager@dadafinance.com  [MANAGER]');
  console.log('   employee@dadafinance.com [EMPLOYEE]');
  console.log('\n⚠️  Passwords are set via SEED_*_PASSWORD env vars.');
  console.log('   Default dev passwords are in .env.example');
  console.log('─'.repeat(50));
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
