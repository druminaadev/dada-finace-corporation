import { z } from 'zod';

const create = z
  .object({
    loanId: z.string().uuid().optional(),
    customerId: z.string().uuid().optional(),
    slot: z.number().int().min(1).max(2).default(1),
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
    email: z.string().email().max(255).optional(),
    address: z.string().max(500).optional(),
    relationship: z.string().max(100).optional(),
    aadhaar: z.string().regex(/^\d{12}$/).optional(),
    pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i).toUpperCase().optional(),
    occupation: z.string().max(100).optional(),
    income: z.coerce.number().nonnegative().optional(),
  })
  .strict();

const update = z
  .object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
    email: z.string().email().max(255).optional(),
    address: z.string().max(500).optional(),
    relationship: z.string().max(100).optional(),
    aadhaar: z.string().regex(/^\d{12}$/).optional(),
    pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i).toUpperCase().optional(),
    occupation: z.string().max(100).optional(),
    income: z.coerce.number().nonnegative().optional(),
  })
  .strict();

export default { create, update };
