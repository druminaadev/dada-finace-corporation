const express = require('express');
const { stateController, cityController, areaController, branchController, loanTypeController, bankController } = require('./master.controller');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();
router.use(authenticate);

function crudRoutes(ctrl) {
  const r = express.Router();
  r.get('/', ctrl.getAll);
  r.get('/:id', ctrl.getById);
  r.post('/', authorize('ADMIN'), ctrl.create);
  r.put('/:id', authorize('ADMIN'), ctrl.update);
  r.delete('/:id', authorize('ADMIN'), ctrl.delete);
  return r;
}

router.use('/states', crudRoutes(stateController));
router.use('/cities', crudRoutes(cityController));
router.use('/areas', crudRoutes(areaController));
router.use('/branches', crudRoutes(branchController));
router.use('/loan-types', crudRoutes(loanTypeController));
router.use('/banks', crudRoutes(bankController));

module.exports = router;
