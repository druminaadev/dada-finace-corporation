'use client'
import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import React from 'react'

interface Column<T = any> {
  key: string; header: string
  accessor?: (row: T) => React.ReactNode
  sortable?: boolean; width?: string
}

interface StandardTableProps<T = any> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  pageSize?: number
  onDownload?: () => void
  filters?: React.ReactNode
}

export function StandardTable<T extends Record<string, any>>({
  data, columns, searchPlaceholder = 'Search...', pageSize = 10, onDownload, filters
}: StandardTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter(row => Object.values(row).some(v => String(v ?? '').toLowerCase().includes(q)))
  }, [data, search])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? ''), bv = String(b[sortKey] ?? '')
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <ChevronsUpDown size={12} className="text-slate-400 dark:text-slate-500" />
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-[#462C7D]" /> : <ChevronDown size={12} className="text-[#462C7D]" />
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
      {(filters || onDownload) && (
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
          <div className="flex flex-wrap items-center gap-3">
            {filters}
          </div>
        </div>
      )}
      
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 h-9 text-sm border border-slate-300 dark:border-slate-600 rounded-lg outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#462C7D] focus:ring-2 focus:ring-[#462C7D]/20"
          />
        </div>
        {onDownload && (
          <button
            onClick={onDownload}
            className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
            title="Download"
          >
            <Download size={16} />
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
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
                <td colSpan={columns.length} className="px-4 py-16 text-center text-slate-400 dark:text-slate-500 text-sm">
                  No records found
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-slate-100 dark:border-slate-700 hover:bg-[#FFF5F8]/50 dark:hover:bg-[#462C7D]/10 transition-colors ${i % 2 === 1 ? 'bg-slate-50/30 dark:bg-slate-700/10' : ''}`}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {col.accessor ? col.accessor(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-700/20 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span className="font-medium">
          Showing {sorted.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-600 dark:text-slate-400"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  page === p
                    ? 'bg-gradient-to-br from-[#462C7D] to-[#831C91] text-white shadow-md'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {p}
              </button>
            )
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-600 dark:text-slate-400"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
