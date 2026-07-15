import { z } from 'zod';

const create = z
  .object({
    name: z.string().min(2).max(100),
    fatherName: z.string().max(100).optional(),
    motherName: z.string().max(100).optional(),
    email: z.string().email().max(255).toLowerCase().optional(),
    // Accept 'mobile' from frontend — service normalizes to 'phone'
    mobile: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Invalid mobile number')
      .optional(),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Invalid phone number')
      .optional(),
    altPhone: z
      .string()
      .regex(/^[6-9]\d{9}$/)
      .optional(),
    address: z.string().max(500).optional(),
    jobAddress: z.string().max(500).optional(),
    aadhaar: z
      .string()
      .regex(/^\d{12}$/, 'Aadhaar must be 12 digits')
      .optional(),
    aadhar: z
      .string()
      .regex(/^\d{12}$/, 'Aadhaar must be 12 digits')
      .optional(),
    pan: z
      .string()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, 'Invalid PAN format')
      .toUpperCase()
      .optional(),
    dob: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
    age: z.coerce.number().int().min(0).max(150).optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional(),
    bloodGroup: z.string().max(5).optional(),
    occupation: z.string().max(100).optional(),
    income: z.coerce.number().nonnegative().optional(),
    businessInfo: z.string().max(500).optional(),
    bankAccountNo: z.string().max(20).optional(),
    bankHolderName: z.string().max(100).optional(),
    bankName: z.string().max(100).optional(),
    bankBranch: z.string().max(100).optional(),
    bankIfsc: z
      .string()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/i, 'Invalid IFSC code')
      .toUpperCase()
      .optional(),
    stateId: z.string().uuid().optional(),
    cityId: z.string().uuid().optional(),
    areaId: z.string().uuid().optional(),
    branchId: z.string().uuid().optional(),
    employeeId: z.string().uuid().optional(),
    // Base64 photo — limit to ~3.5MB base64 string (5MB file * 1.33 overhead)
    photoBase64: z.string().max(4_700_000).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((d) => d.phone || d.mobile, {
    message: 'Either phone or mobile number is required',
    path: ['phone'],
  });

const update = z
  .object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().max(255).toLowerCase().optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
    address: z.string().max(500).optional(),
    aadhaar: z.string().regex(/^\d{12}$/).optional(),
    pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i).toUpperCase().optional(),
    dob: z.string().optional(),
    isActive: z.boolean().optional(),
    occupation: z.string().max(100).optional(),
    income: z.coerce.number().nonnegative().optional(),
    bankAccountNo: z.string().max(20).optional(),
    bankHolderName: z.string().max(100).optional(),
    bankName: z.string().max(100).optional(),
    bankBranch: z.string().max(100).optional(),
    bankIfsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/i).toUpperCase().optional(),
  })
  .strict();

export default { create, update };
