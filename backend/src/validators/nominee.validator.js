import { z } from 'zod';

const create = z
  .object({
    customerId: z.string().uuid().optional(),
    loanId: z.string().uuid().optional(),
    slot: z.number().int().min(1).max(2).default(1),
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
    relationship: z.string().max(100).optional(),
    address: z.string().max(500).optional(),
    aadhaar: z.string().regex(/^\d{12}$/).optional(),
    occupation: z.string().max(100).optional(),
    income: z.coerce.number().nonnegative().optional(),
    dob: z.string().optional(),
  })
  .strict();

const update = z
  .object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
    relationship: z.string().max(100).optional(),
    address: z.string().max(500).optional(),
    dob: z.string().optional(),
  })
  .strict();

export default { create, update };
