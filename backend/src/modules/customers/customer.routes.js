import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from './customer.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

const router = Router();
router.use(authenticate);

const createSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^\d{10}$/),
  email: z.string().email().optional(),
  altPhone: z.string().regex(/^\d{10}$/).optional(),
  dob: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().max(500).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  stateId: z.string().uuid().optional(),
  cityId: z.string().uuid().optional(),
  areaId: z.string().uuid().optional(),
  occupation: z.string().max(100).optional(),
  income: z.number().positive().optional(),
  branchId: z.string().uuid().optional(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/).optional(),
  aadhaar: z.string().regex(/^\d{12}$/).optional(),
});

router.post('/', authorize('ADMIN', 'MANAGER', 'EMPLOYEE'), validate(createSchema), ctrl.create);
router.post('/find-or-create', authorize('ADMIN', 'MANAGER', 'EMPLOYEE'), validate(createSchema), ctrl.findOrCreate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.put('/:id', authorize('ADMIN', 'MANAGER', 'EMPLOYEE'), validate(createSchema.partial()), ctrl.update);
router.patch('/:id/deactivate', authorize('ADMIN', 'MANAGER'), ctrl.deactivate);
router.get('/:id/loans', ctrl.getLoanHistory);

export default router;
