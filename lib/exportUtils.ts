import { sanitize } from './validation'

// Flatten a row to plain strings, skipping React elements
const flatten = (data: Record<string, unknown>[], exclude: string[] = ['actions', 'id']): Record<string, string>[] =>
  data.map(row => {
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(row)) {
      if (exclude.includes(k)) continue
      if (v === null || v === undefined) { out[k] = '—'; continue }
      if (typeof v === 'object' && 'type' in (v as object)) continue // React element
      out[k] = sanitize(String(v))
    }
    return out
  })

export const exportCSV = (data: Record<string, unknown>[], filename: string) => {
  const rows = flatten(data)
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => `"${(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export const exportExcel = (data: Record<string, unknown>[], filename: string) => {
  const rows = flatten(data)
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const html = `<html><head><meta charset="utf-8"></head><body><table>
    <tr>${headers.map(h => `<th>${sanitize(h)}</th>`).join('')}</tr>
    ${rows.map(r => `<tr>${headers.map(h => `<td>${r[h] ?? ''}</td>`).join('')}</tr>`).join('')}
  </table></body></html>`
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.xls`
  a.click()
  URL.revokeObjectURL(a.href)
}

export const exportPDF = (data: Record<string, unknown>[], title: string) => {
  const rows = flatten(data)
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${sanitize(title)}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:11px;padding:20px}
    h1{color:#1E40AF;font-size:16px;margin-bottom:4px}
    p{color:#6b7280;font-size:10px;margin-bottom:12px}
    table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left}
    th{background:#f8fafc;font-weight:700;color:#374151}
    @media print{@page{size:A4 landscape;margin:15mm}}
  </style></head><body>
  <h1>${sanitize(title)}</h1>
  <p>Exported: ${new Date().toLocaleString()}</p>
  <table>
    <tr>${headers.map(h => `<th>${sanitize(h)}</th>`).join('')}</tr>
    ${rows.map(r => `<tr>${headers.map(h => `<td>${r[h] ?? ''}</td>`).join('')}</tr>`).join('')}
  </table>
  </body></html>`)
  w.document.close()
  setTimeout(() => w.print(), 300)
}

export const copyTable = async (data: Record<string, unknown>[]): Promise<boolean> => {
  const rows = flatten(data)
  if (!rows.length) return false
  const headers = Object.keys(rows[0])
  const text = [headers.join('\t'), ...rows.map(r => headers.map(h => r[h] ?? '').join('\t'))].join('\n')
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export const printTable = (data: Record<string, unknown>[], title: string) => {
  exportPDF(data, title) // re-use PDF window + print
}
