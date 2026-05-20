const Joi = require('joi');

const loanValidators = {
  create: Joi.object({
    customerId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    interestRate: Joi.number().positive().max(100).required(),
    tenure: Joi.number().integer().positive().required(),
    purpose: Joi.string().optional(),
  }),

  update: Joi.object({
    amount: Joi.number().positive().optional(),
    interestRate: Joi.number().positive().max(100).optional(),
    tenure: Joi.number().integer().positive().optional(),
    purpose: Joi.string().optional(),
  }),

  approve: Joi.object({
    disbursedAt: Joi.date().optional(),
  }),

  reject: Joi.object({
    rejectionReason: Joi.string().required(),
  }),
};

module.exports = loanValidators;
