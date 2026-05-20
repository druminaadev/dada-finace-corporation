'use client'
import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Column<T = any> {
  key: string; header: string
  accessor?: (row: T) => React.ReactNode
  sortable?: boolean; width?: string
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TableProps<T = any> {
  data: T[]; columns: Column<T>[]
  searchPlaceholder?: string; pageSize?: number; action?: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({ data, columns, searchPlaceholder = 'Search...', pageSize = 10, action }: TableProps<T>) {
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
    if (sortKey !== col) return <ChevronsUpDown size={12} className="text-slate-400" />
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-blue-600" /> : <ChevronDown size={12} className="text-blue-600" />
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder={searchPlaceholder}
            className="w-full pl-8 pr-3 h-9 text-sm border border-slate-300 dark:border-slate-600 rounded-md outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50" />
        </div>
        {action}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              {columns.map(col => (
                <th key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide ${col.width ?? ''} ${col.sortable !== false ? 'cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-700' : ''}`}
                  onClick={() => col.sortable !== false && toggleSort(col.key)}>
                  <div className="flex items-center gap-1">
                    {col.header}{col.sortable !== false && <SortIcon col={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0
              ? <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 dark:text-slate-500 text-sm">No records found</td></tr>
              : paginated.map((row, i) => (
                <tr key={i} className={`border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-700/20' : ''}`}>
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {col.accessor ? col.accessor(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Showing {sorted.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer text-slate-600 dark:text-slate-400"><ChevronLeft size={14} /></button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i
            return <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded text-xs font-medium cursor-pointer ${page === p ? 'bg-blue-700 dark:bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>{p}</button>
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer text-slate-600 dark:text-slate-400"><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  )
}
