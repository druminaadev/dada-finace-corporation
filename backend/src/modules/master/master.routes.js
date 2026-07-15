import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import * as ctrl from './master.controller.js';

const router = Router();
router.use(authenticate);

const adminOnly = authorize('ADMIN', 'MANAGER');

const resource = (r, c) => {
  r.get('/', c.getAll);
  r.get('/:id', c.getById);
  r.post('/', adminOnly, c.create);
  r.put('/:id', adminOnly, c.update);
  r.patch('/:id/toggle', adminOnly, c.toggleActive);
};

const stateRouter = Router();
resource(stateRouter, ctrl.stateCtrl);
router.use('/states', stateRouter);

const cityRouter = Router();
resource(cityRouter, ctrl.cityCtrl);
router.use('/cities', cityRouter);

const areaRouter = Router();
resource(areaRouter, ctrl.areaCtrl);
router.use('/areas', areaRouter);

const branchRouter = Router();
resource(branchRouter, ctrl.branchCtrl);
router.use('/branches', branchRouter);

const loanTypeRouter = Router();
resource(loanTypeRouter, ctrl.loanTypeCtrl);
router.use('/loan-types', loanTypeRouter);

const bankRouter = Router();
resource(bankRouter, ctrl.bankCtrl);
router.use('/banks', bankRouter);

export default router;
