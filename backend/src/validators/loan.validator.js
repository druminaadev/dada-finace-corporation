import { z } from 'zod';

const create = z
  .object({
    customerId: z.string().uuid(),
    loanCategory: z.enum(['GOLD', 'PERSONAL', 'VEHICLE']).default('PERSONAL'),
    amount: z.number().positive().max(100_000_000),
    interestRate: z.number().positive().max(100),
    interestType: z.enum(['FLAT', 'REDUCING']).default('FLAT'),
    tenure: z.number().int().positive().max(360),
    processingFee: z.number().nonnegative().default(0),
    purpose: z.string().max(500).optional(),
    notes: z.string().max(1000).optional(),
    securityType: z.string().max(100).optional(),
    receiverMobile: z.string().regex(/^[6-9]\d{9}$/).optional(),
  })
  .strict();

const update = z
  .object({
    amount: z.number().positive().max(100_000_000).optional(),
    interestRate: z.number().positive().max(100).optional(),
    tenure: z.number().int().positive().max(360).optional(),
    purpose: z.string().max(500).optional(),
    notes: z.string().max(1000).optional(),
  })
  .strict();

const reject = z
  .object({
    rejectionReason: z.string().min(5).max(500),
  })
  .strict();

const disburse = z
  .object({
    disbursedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export default { create, update, reject, disburse };
