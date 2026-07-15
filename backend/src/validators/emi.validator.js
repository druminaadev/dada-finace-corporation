import { z } from 'zod';

const payEMI = z
  .object({
    amount: z.number().positive().max(10_000_000),
    paymentMode: z.enum(['CASH', 'PAYTM', 'BANK_TRANSFER', 'UPI', 'CHEQUE']),
    transactionId: z.string().max(100).optional(),
    remarks: z.string().max(500).optional(),
  })
  .strict();

export default { payEMI };
