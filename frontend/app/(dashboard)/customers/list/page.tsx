'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, Eye, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StandardTable } from '@/components/ui/StandardTable'
import { useStore, type Customer } from '@/store/appStore'
import { useUIStore } from '@/store/uiStore'
import { format } from 'date-fns'
import { COLORS } from '@/lib/colors'
import { Button } from '@/components/ui/Button'

export default function CustomerListPage() {
  const { customers, branches, employees, deleteCustomer } = useStore()
  const { showToast } = useUIStore()
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState<Customer | null>(null)

  const enriched = customers.map(c => ({
    ...c,
    branchName: branches.find(b => b.id === c.branchId)?.name ?? '—',
    employeeName: employees.find(e => e.id === c.employeeId)?.name ?? '—',
    regDateFmt: c.regDate ? format(new Date(c.regDate), 'dd/MM/yyyy') : '—',
  }))

  const handleDelete = () => {
    if (!confirmDelete) return
    deleteCustomer(confirmDelete.id)
    showToast(`Customer "${confirmDelete.name}" deleted`, 'warning')
    setConfirmDelete(null)
  }

  return (
    <>
      <PageHeader
        title="Customer List"
        subtitle="View and manage all registered customers"
        action={{ label: 'Add Customer', onClick: () => router.push('/customers/add'), icon: <Plus size={14} /> }}
      />

      <StandardTable
        data={enriched}
        searchPlaceholder="Search customers..."
        columns={[
          { key: 'appNo', header: 'App No' },
          { key: 'name', header: 'Customer Name' },
          { key: 'mobile', header: 'Mobile' },
          { key: 'aadhar', header: 'Aadhar' },
          { key: 'branchName', header: 'Branch' },
          { key: 'employeeName', header: 'Employee' },
          { key: 'regDateFmt', header: 'Reg. Date' },
          {
            key: 'actions',
            header: 'Actions',
            sortable: false,
            accessor: (row) => {
              const c = row as unknown as Customer
              return (
                <div className="flex gap-1.5">
                  <button
                    title="View Details"
                    onClick={() => router.push(`/customers/${c.id}/details`)}
                    className="p-1.5 rounded-lg cursor-pointer transition-colors"
                    style={{ color: COLORS.primary }}
                    onMouseEnter={e => (e.currentTarget.style.background = COLORS.primaryAlpha12)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    title="Edit Customer"
                    onClick={() => router.push(`/customers/${c.id}/details?edit=true`)}
                    className="p-1.5 rounded-lg cursor-pointer transition-colors"
                    style={{ color: '#F59E0B' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.12)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    title="Delete Customer"
                    onClick={() => setConfirmDelete(c)}
                    className="p-1.5 rounded-lg cursor-pointer transition-colors"
                    style={{ color: COLORS.rejected }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            },
          },
        ]}
      />

      {/* Delete Confirm Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}>
          <div className="rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.12)' }}>
                <AlertTriangle size={20} style={{ color: 'var(--error)' }} />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Delete Customer</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>This action cannot be undone</div>
              </div>
            </div>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to delete <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>"{confirmDelete.name}"</span>? All associated data will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
