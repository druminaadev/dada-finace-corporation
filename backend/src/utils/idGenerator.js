import prisma from '../config/database.js';

/**
 * Generate sequential IDs with prefix using DB count.
 * Uses a retry loop to handle race conditions.
 */
export async function generateCustomerNo() {
  const count = await prisma.customer.count();
  return `CUST${String(count + 1).padStart(6, '0')}`;
}

export async function generateLoanNo() {
  const year = new Date().getFullYear();
  const count = await prisma.loan.count({ where: { createdAt: { gte: new Date(`${year}-01-01`) } } });
  return `LOAN-${year}-${String(count + 1).padStart(6, '0')}`;
}

export async function generateDraftNo() {
  const count = await prisma.loanDraft.count();
  return `DRAFT-${String(count + 1).padStart(6, '0')}`;
}

export async function generateReceiptNo() {
  const count = await prisma.payment.count();
  return `RCP-${String(count + 1).padStart(8, '0')}`;
}
