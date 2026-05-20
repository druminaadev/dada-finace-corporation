const Joi = require('joi');

const customerValidators = {
  create: Joi.object({
    name: Joi.string().min(2).required(),
    fatherName: Joi.string().optional().allow(''),
    motherName: Joi.string().optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional().allow(''),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).optional().allow(''),
    altMobile: Joi.string().optional().allow(''),
    altPhone: Joi.string().optional().allow(''),
    address: Joi.string().optional().allow(''),
    aadhaar: Joi.string().pattern(/^[0-9]{12}$/).optional().allow(''),
    aadhar: Joi.string().pattern(/^[0-9]{12}$/).optional().allow(''),
    pan: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i).optional().allow(''),
    dob: Joi.alternatives().try(Joi.date(), Joi.string()).optional().allow(''),
    age: Joi.alternatives().try(Joi.number(), Joi.string()).optional().allow(''),
    gender: Joi.string().optional().allow(''),
    maritalStatus: Joi.string().optional().allow(''),
    bloodGroup: Joi.string().optional().allow(''),
    occupation: Joi.string().optional().allow(''),
    jobAddress: Joi.string().optional().allow(''),
    // Bank details
    bankAccountNo: Joi.string().optional().allow(''),
    bankHolderName: Joi.string().optional().allow(''),
    bankName: Joi.string().optional().allow(''),
    bankBranch: Joi.string().optional().allow(''),
    bankIfsc: Joi.string().optional().allow(''),
    // Photo - allow large base64 strings
    photoBase64: Joi.string().optional().allow('').max(10000000),
    photoPath: Joi.string().optional().allow(''),
    // Other
    regDate: Joi.alternatives().try(Joi.date(), Joi.string()).optional().allow(''),
    isActive: Joi.boolean().optional(),
  }).unknown(true),

  update: Joi.object({
    name: Joi.string().min(2).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    address: Joi.string().optional(),
    aadhaar: Joi.string().pattern(/^[0-9]{12}$/).optional(),
    pan: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
    dob: Joi.date().optional(),
    isActive: Joi.boolean().optional(),
  }),
};

module.exports = customerValidators;
