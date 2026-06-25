'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import {
  ChevronUp, ChevronDown, ChevronsUpDown, Search,
  ChevronLeft, ChevronRight, MoreVertical,
  FileSpreadsheet, FileText, Printer, Copy, FileDown,
} from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { exportCSV, exportExcel, exportPDF, copyTable, printTable } from '@/lib/exportUtils'

export interface Column<T = any> {
  key: string
  header: string
  accessor?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface StandardTableProps<T = any> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  pageSize?: number
  /** @deprecated use built-in export */
  onDownload?: () => void
  filters?: React.ReactNode
  mobileCard?: (row: T) => React.ReactNode
  exportTitle?: string
}

function AutoMobileCard<T extends object>({ row, columns }: { row: T; columns: Column<T>[] }) {
  const actionCol = columns.find(c => c.key === 'actions')
  const titleCol  = columns.find(c => !['actions', 'id', '#'].includes(c.key))
  const statusCol = columns.find(c => c.key === 'status')
  const detailCols = columns.filter(c => c.key !== 'actions' && c.key !== titleCol?.key && c.key !== 'status')

  return (
    <div className="mx-3 my-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-800 dark:text-slate-100 text-[15px] leading-snug truncate">
            {titleCol ? (titleCol.accessor ? titleCol.accessor(row) : String((row as any)[titleCol.key] ?? '—')) : '—'}
          </div>
          {statusCol && (
            <div className="mt-1.5">
              {statusCol.accessor ? statusCol.accessor(row) : <Badge status={(row as any)[statusCol.key] as any} />}
            </div>
          )}
        </div>
        {actionCol && <div className="shrink-0">{actionCol.accessor?.(row)}</div>}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
        {detailCols.map(col => (
          <div key={col.key} className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{col.header}</div>
            <div className="text-xs text-slate-700 dark:text-slate-300 truncate mt-0.5">
              {col.accessor ? col.accessor(row) : String((row as any)[col.key] ?? '—')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StandardTable<T extends object>({
  data, columns, searchPlaceholder = 'Search…', pageSize = 10,
  filters, mobileCard, exportTitle = 'Export',
}: StandardTableProps<T>) {
  const [search,  setSearch]  = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page,    setPage]    = useState(1)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copying, setCopying]   = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close three-dots menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [menuOpen])

  // Reset page when data changes
  useEffect(() => {
    setPage(1)
  }, [data])

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(row =>
      Object.values(row).some(v => {
        if (v === null || v === undefined) return false
        if (typeof v === 'object') return false // skip React nodes
        return String(v).toLowerCase().includes(q)
      })
    )
  }, [data, search])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = String((a as any)[sortKey] ?? ''), bv = String((b as any)[sortKey] ?? '')
      return sortDir === 'asc' ? av.localeCompare(bv, undefined, { numeric: true })
                               : bv.localeCompare(av, undefined, { numeric: true })
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <ChevronsUpDown size={12} className="text-slate-400" />
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-[var(--primary)]" />
                             : <ChevronDown size={12} className="text-[var(--primary)]" />
  }

  // Export helpers — operate on ALL filtered+sorted rows (not just current page)
  const exportData = sorted as unknown as Record<string, unknown>[]
  const handleCSV   = () => { exportCSV(exportData, exportTitle);   setMenuOpen(false) }
  const handleExcel = () => { exportExcel(exportData, exportTitle); setMenuOpen(false) }
  const handlePDF   = () => { exportPDF(exportData, exportTitle);   setMenuOpen(false) }
  const handleCopy  = async () => {
    setCopying(true)
    await copyTable(exportData)
    setCopying(false)
    setMenuOpen(false)
  }
  const handlePrint = () => { printTable(exportData, exportTitle); setMenuOpen(false) }

  const btnClass = "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
      {/* Filter row */}
      {filters && (
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
          <div className="flex flex-wrap items-center gap-3">{filters}</div>
        </div>
      )}

      {/* Search + Export toolbar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 h-9 text-sm border border-slate-300 dark:border-slate-600 rounded-lg outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={handleCSV}   className={btnClass} title="Export CSV">
            <FileDown size={13} /> CSV
          </button>
          <button onClick={handleExcel} className={btnClass} title="Export Excel">
            <FileSpreadsheet size={13} /> Excel
          </button>
          <button onClick={handlePDF}   className={btnClass} title="Export PDF">
            <FileText size={13} /> PDF
          </button>

          {/* Three-dots menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className={btnClass}
              title="More options"
              aria-label="More export options"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border shadow-xl z-50 overflow-hidden"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Copy size={14} />
                  {copying ? 'Copying…' : 'Copy'}
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Printer size={14} /> Print
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="block sm:hidden">
        {paginated.length === 0 ? (
          <div className="px-4 py-16 text-center text-slate-400 text-sm">No records found</div>
        ) : (
          <div className="py-1">
            {paginated.map((row, i) => (
              <div key={i}>
                {mobileCard ? mobileCard(row) : <AutoMobileCard row={row} columns={columns} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 ${col.width ?? ''} ${col.sortable !== false ? 'cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-700' : ''}`}
                  onClick={() => col.sortable !== false && toggleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable !== false && <SortIcon col={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-slate-400 text-sm">
                  No records found
                </td>
              </tr>
            ) : paginated.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-slate-100 dark:border-slate-700 hover:bg-[var(--hover)] transition-colors ${i % 2 === 1 ? 'bg-slate-50/30 dark:bg-slate-700/10' : ''}`}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {col.accessor ? col.accessor(row) : String((row as any)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-700/20 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span className="font-medium">
          {sorted.length === 0 ? 'No results'
            : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, sorted.length)} of ${sorted.length}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                aria-label={`Page ${p}`}
                aria-current={page === p ? 'page' : undefined}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${page === p
                  ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white shadow-md'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
              >
                {p}
              </button>
            )
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
