// Utility to clear loan draft storage
export function clearLoanDraft() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dada-loan-draft')
  }
}

// Utility to check localStorage size
export function getLocalStorageSize() {
  if (typeof window === 'undefined') return 0
  let total = 0
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      total += localStorage[key].length + key.length
    }
  }
  return (total / 1024).toFixed(2) // KB
}

// Utility to clear all storage
export function clearAllStorage() {
  if (typeof window !== 'undefined') {
    localStorage.clear()
  }
}

// One-time migration: strip any existing base64 photos from the persisted store
export function migrateStripPhotos() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('dada-lms-store')
    if (!raw) return
    const parsed = JSON.parse(raw)
    let dirty = false
    if (parsed?.state?.customers) {
      parsed.state.customers = parsed.state.customers.map((c: any) => {
        const strip = (obj: any): any => {
          if (!obj || typeof obj !== 'object') return obj
          const r = { ...obj }
          for (const k of Object.keys(r)) {
            if (typeof r[k] === 'string' && r[k].startsWith('data:image')) {
              r[k] = ''; dirty = true
            } else if (r[k] && typeof r[k] === 'object') {
              r[k] = strip(r[k])
            }
          }
          return r
        }
        return strip(c)
      })
    }
    if (dirty) localStorage.setItem('dada-lms-store', JSON.stringify(parsed))
  } catch {
    // If still corrupt, wipe the key entirely
    localStorage.removeItem('dada-lms-store')
  }
}
