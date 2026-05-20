const Joi = require('joi');

const emiValidators = {
  payEMI: Joi.object({
    amount: Joi.number().positive().required(),
    paymentMode: Joi.string().valid('CASH', 'PAYTM', 'BANK_TRANSFER', 'UPI', 'CHEQUE').required(),
    transactionId: Joi.string().optional(),
    remarks: Joi.string().optional(),
  }),
};

module.exports = emiValidators;
