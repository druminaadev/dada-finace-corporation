export const maskAadhaar = (aadhaar: string) => {
  if (!aadhaar || aadhaar.length !== 12) return aadhaar;
  return 'XXXX-XXXX-' + aadhaar.slice(-4);
}

export const maskPAN = (pan: string) => {
  if (!pan || pan.length !== 10) return pan;
  return pan.substring(0, 2) + 'XXXX' + pan.substring(6);
}

export const validatePhone = (phone: string) => {
  return /^\d{10}$/.test(phone);
}

export const validateAadhaar = (aadhaar: string) => {
  return /^\d{12}$/.test(aadhaar);
}

export const sanitizeInput = (input: string) => {
  return input.replace(/[^\w\s-]/gi, '');
}

export const validateDocumentFile = (file: File | string | null) => {
  return !!file;
}
