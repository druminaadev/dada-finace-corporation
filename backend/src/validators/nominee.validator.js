const Joi = require('joi');

const nomineeValidators = {
  create: Joi.object({
    customerId: Joi.string().uuid().required(),
    name: Joi.string().min(2).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    relationship: Joi.string().required(),
    address: Joi.string().optional(),
    dob: Joi.date().optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).optional(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    relationship: Joi.string().optional(),
    address: Joi.string().optional(),
    dob: Joi.date().optional(),
  }),
};

module.exports = nomineeValidators;
