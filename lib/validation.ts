// ─── Input Sanitisation ───────────────────────────────────────────────────────
/** Strip HTML tags and dangerous patterns to prevent XSS */
export const sanitize = (v: string) =>
  v.replace(/[<>'"]/g, '').replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '').trim()

export const sanitizeInput = sanitize

// ─── Field Validators ─────────────────────────────────────────────────────────
export const isValidPhone   = (v: string) => /^[6-9]\d{9}$/.test(v)
export const isValidEmail   = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
export const isValidAadhaar = (v: string) => /^\d{12}$/.test(v)
export const isValidPAN     = (v: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.toUpperCase())
export const isValidIFSC    = (v: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.toUpperCase())
export const isValidAmount  = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v) : v
  return !isNaN(n) && n > 0
}
export const isValidRate    = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v) : v
  return !isNaN(n) && n > 0 && n <= 100
}
export const isValidTenure  = (v: string | number) => {
  const n = typeof v === 'string' ? parseInt(String(v)) : v
  return !isNaN(n) && n > 0 && n <= 360
}

// Aliases
export const validatePhone   = isValidPhone
export const validateAadhaar = isValidAadhaar
export const validatePAN     = isValidPAN

// ─── File Validators ──────────────────────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_DOC_TYPES   = [...ALLOWED_IMAGE_TYPES, 'application/pdf']
const DANGEROUS_EXT       = /\.(exe|bat|cmd|sh|php|py|js|jsx|ts|tsx|mjs|cjs|rb|pl|ps1|vbs|hta|jar|war|dll)$/i
const MAX_IMAGE_SIZE      = 5 * 1024 * 1024   // 5 MB
const MAX_DOC_SIZE        = 10 * 1024 * 1024  // 10 MB

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (DANGEROUS_EXT.test(file.name))
    return { valid: false, error: 'Invalid file name — executable files are not allowed' }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    return { valid: false, error: 'Only JPG, PNG, GIF, or WebP images are allowed' }
  if (file.size > MAX_IMAGE_SIZE)
    return { valid: false, error: 'Image must be under 5 MB' }
  return { valid: true }
}

export const validateDocFile = (file: File): { valid: boolean; error?: string } => {
  if (DANGEROUS_EXT.test(file.name))
    return { valid: false, error: 'Invalid file name — executable files are not allowed' }
  if (!ALLOWED_DOC_TYPES.includes(file.type))
    return { valid: false, error: 'Only JPG, PNG, GIF, WebP, or PDF files are allowed' }
  if (file.size > MAX_DOC_SIZE)
    return { valid: false, error: 'File must be under 10 MB' }
  return { valid: true }
}

// Alias
export const validateDocumentFile = validateDocFile

// ─── Masking Helpers ──────────────────────────────────────────────────────────
/** Never expose full Aadhaar in UI */
export const maskAadhaar = (v: string) =>
  v && v.length === 12 ? `XXXX-XXXX-${v.slice(-4)}` : v || '—'

/** Partially mask PAN */
export const maskPAN = (v: string) =>
  v && v.length === 10 ? `${v.slice(0, 2)}XXX${v.slice(-3)}` : v || '—'

/** Partially mask phone */
export const maskPhone = (v: string) =>
  v && v.length === 10 ? `XXXXXX${v.slice(-4)}` : v || '—'

// ─── Form Validation Helpers ──────────────────────────────────────────────────
export interface FieldError {
  field: string
  message: string
}

/** Validate a map of { fieldKey: value } against rules and return array of errors */
export const validateForm = (
  fields: Record<string, string | number | undefined | null>,
  rules: Record<string, { required?: boolean; label?: string; validator?: (v: string) => boolean; message?: string }>
): FieldError[] => {
  const errors: FieldError[] = []
  for (const [key, rule] of Object.entries(rules)) {
    const raw = fields[key]
    const val = raw !== undefined && raw !== null ? String(raw).trim() : ''
    const label = rule.label ?? key
    if (rule.required && !val) {
      errors.push({ field: key, message: `${label} is required` })
      continue
    }
    if (val && rule.validator && !rule.validator(val)) {
      errors.push({ field: key, message: rule.message ?? `${label} is invalid` })
    }
  }
  return errors
}
