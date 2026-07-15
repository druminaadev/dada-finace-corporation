import { z } from 'zod';

const register = z
  .object({
    name: z.string().min(2).max(100),
    email: z.string().email().max(255).toLowerCase(),
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number')
      .optional(),
    role: z.enum(['ADMIN', 'EMPLOYEE', 'USER']).default('EMPLOYEE'),
  })
  .strict(); // Reject unknown fields

const login = z
  .object({
    email: z.string().email().max(255).toLowerCase(),
    password: z.string().min(1).max(128),
  })
  .strict();

export default { register, login };
