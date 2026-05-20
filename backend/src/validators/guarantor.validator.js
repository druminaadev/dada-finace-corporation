const Joi = require('joi');

const guarantorValidators = {
  create: Joi.object({
    loanId: Joi.string().uuid().required(),
    name: Joi.string().min(2).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    email: Joi.string().email().optional(),
    address: Joi.string().required(),
    relationship: Joi.string().required(),
    aadhaar: Joi.string().pattern(/^[0-9]{12}$/).optional(),
    pan: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).optional(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    email: Joi.string().email().optional(),
    address: Joi.string().optional(),
    relationship: Joi.string().optional(),
    aadhaar: Joi.string().pattern(/^[0-9]{12}$/).optional(),
    pan: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
  }),
};

module.exports = guarantorValidators;
