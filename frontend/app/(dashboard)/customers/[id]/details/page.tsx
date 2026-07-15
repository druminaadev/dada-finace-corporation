'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useStore, type Nominee, type Guarantor } from '@/store/appStore'
import {
  Plus, User, Phone, CreditCard, MapPin, Mail, Briefcase,
  FileText, Upload, X, CheckCircle, Camera, ArrowLeft,
} from 'lucide-react'
import { validateDocumentFile, maskAadhaar, maskPAN } from '@/lib/validation'

const IDENTITY_PROOFS = ['Aadhar Card', 'PAN Card', 'Voter ID', 'Passport', 'Driving License']
const RELATIONS = ['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Other']
const TABS = ['Overview', 'Nominee', 'Guarantor 1', 'Guarantor 2', 'Documents'] as const

const DOC_LIST = [
  'Aadhaar Card', 'PAN Card', 'Passport Size Photo', 'Address Proof',
  'Bank Statement (Last 6 months)', 'Income Proof (Salary Slip / ITR)', 'Signature',
]

interface StakeholderForm {
  identityProof: string; identityNo: string; name: string; relation: string
  dob: string; age: string; mobile: string; address: string
  accountNo: string; holderName: string; bankName: string; bankBranch: string; ifsc: string
}

function StakeholderFormPanel({
  initial, onSave, label, onDirty,
}: {
  initial: Nominee | Guarantor | null
  onSave: (d: StakeholderForm) => void
  label: string
  onDirty: () => void
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<StakeholderForm>({
    defaultValues: initial ? {
      identityProof: initial.identityProof, identityNo: initial.identityNo, name: initial.name,
      relation: initial.relation, dob: initial.dob, age: String(initial.age), mobile: initial.mobile,
      address: initial.address, accountNo: initial.accountNo, holderName: initial.holderName,
      bankName: initial.bankName, bankBranch: initial.bankBranch, ifsc: initial.ifsc,
    } : {},
  })

  const watchDob = watch('dob')
  useEffect(() => {
    if (!watchDob) return
    const age = Math.floor((Date.now() - new Date(watchDob).getTime()) / (365.25 * 24 * 3600 * 1000))
    if (age > 0) setValue('age', String(age))
  }, [watchDob, setValue])

  return (
    <form
      onSubmit={handleSubmit(d => onSave(d))}
      onChange={onDirty}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select label="Identity Proof" placeholder="Select ID Type"
          options={IDENTITY_PROOFS.map(p => ({ value: p, label: p }))} {...register('identityProof')} />
        <Input label="Identity Number" placeholder="ID document number" {...register('identityNo')} />
        <Input label="Full Name" required placeholder="Full name" error={errors.name?.message}
          {...register('name', { required: 'Required' })} />
        <Select label="Relation" placeholder="Select Relation"
          options={RELATIONS.map(r => ({ value: r, label: r }))} {...register('relation')} />
        <Input label="Date of Birth" type="date" {...register('dob')} />
        <Input label="Age" type="number" placeholder="Auto-calculated" {...register('age')} />
        <Input label="Mobile Number" placeholder="10-digit mobile" error={errors.mobile?.message}
          {...register('mobile', { pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile' } })} />
        <div className="sm:col-span-2">
          <Textarea label="Address" placeholder="Residential address" {...register('address')} />
        </div>
      </div>
      <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-secondary)' }}>
          Bank Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Account Number" placeholder="Bank account number" {...register('accountNo')} />
          <Input label="Account Holder Name" placeholder="Name as on account" {...register('holderName')} />
          <Input label="Bank Name" placeholder="Bank name" {...register('bankName')} />
          <Input label="Bank Branch" placeholder="Branch name" {...register('bankBranch')} />
          <Input label="IFSC Code" placeholder="e.g. HDFC0001234" className="uppercase" {...register('ifsc')} />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" size="sm">
          <CheckCircle size={14} /> Save {label}
        </Button>
      </div>
    </form>
  )
}

function DocumentsPanel() {
  
  const [docs, setDocs] = useState<Record<string, File | null>>({})
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({})
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleFile = (docName: string, file: File | undefined | null) => {
    if (!file) return
    const validation = validateDocumentFile(file)
    setDocs(p => ({ ...p, [docName]: file }))
    setConfirmed(p => { const c = { ...p }; delete c[docName]; return c })
  }

  const removeDoc = (docName: string) => {
    setDocs(p => ({ ...p, [docName]: null }))
    setConfirmed(p => { const c = { ...p }; delete c[docName]; return c })
    if (inputRefs.current[docName]) inputRefs.current[docName]!.value = ''
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOC_LIST.map(doc => {
          const file = docs[doc]
          return (
            <div key={doc} className="rounded-2xl overflow-hidden"
              style={{ border: `1.5px solid ${file ? 'var(--success)' : 'var(--border)'}`, background: 'var(--surface)' }}>
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--border)', background: 'var(--hover)' }}>
                <div className="flex items-center gap-2">
                  <FileText size={14} style={{ color: file ? 'var(--success)' : 'var(--accent)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{doc}</span>
                </div>
                {file && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>Uploaded</span>
                )}
              </div>
              <div className="p-4">
                {!file ? (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`Upload ${doc}`}
                    onClick={() => inputRefs.current[doc]?.click()}
                    onKeyDown={e => e.key === 'Enter' && inputRefs.current[doc]?.click()}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl py-6 cursor-pointer transition-all"
                    style={{ border: '2px dashed var(--border)', background: 'var(--bg)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <Upload size={20} style={{ color: 'var(--accent)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Click to upload</span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>PDF or Image · Max 10MB</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                      style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
                      <FileText size={24} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{(file.size / 1024).toFixed(0)} KB</p>
                      <div className="flex gap-2 mt-2">
                        {confirmed[doc] ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-semibold"
                            style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>
                            <CheckCircle size={11} /> Confirmed
                          </span>
                        ) : (
                          <button
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-semibold cursor-pointer"
                            style={{ background: 'var(--primary)', color: '#fff' }}>
                            <CheckCircle size={11} /> Confirm
                          </button>
                        )}
                        <button
                          onClick={() => removeDoc(doc)}
                          aria-label={`Remove ${doc}`}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg cursor-pointer"
                          style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}>
                          <X size={11} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <input
                  ref={el => { inputRefs.current[doc] = el }}
                  type="file" accept="image/*,.pdf" className="hidden"
                  aria-label={`File input for ${doc}`}
                  onChange={e => handleFile(doc, e.target.files?.[0])}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-end pt-2">
        <Button
          onClick={() => {
            const uploaded = Object.entries(docs).filter(([, f]) => f !== null)
          }}
          size="sm"
        >
          <CheckCircle size={14} /> Save All Documents
        </Button>
      </div>
    </div>
  )
}

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { customers, updateNominee, updateGuarantor } = useStore()
  
  const [activeTab, setActiveTab] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [pendingTab, setPendingTab] = useState<number | null>(null)
  const customer = customers.find(c => c.id === Number(params.id))

  useEffect(() => {
    if (searchParams.get('edit') === 'true') setActiveTab(1)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!customer) return (
    <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
      Customer not found.{' '}
      <button onClick={() => router.push('/customers/list')} className="underline cursor-pointer" style={{ color: 'var(--accent)' }}>
        Go back
      </button>
    </div>
  )

  const requestTabChange = (idx: number) => {
    if (hasUnsavedChanges && activeTab > 0 && idx !== activeTab) {
      setPendingTab(idx)
    } else {
      setActiveTab(idx)
      setHasUnsavedChanges(false)
    }
  }

  const confirmTabChange = () => {
    if (pendingTab !== null) {
      setActiveTab(pendingTab)
      setHasUnsavedChanges(false)
      setPendingTab(null)
    }
  }

  const handleNomineeSave = (data: StakeholderForm) => {
    updateNominee(customer.id, {
      identityProof: data.identityProof, identityNo: data.identityNo, name: data.name,
      relation: data.relation, dob: data.dob, age: Number(data.age), mobile: data.mobile,
      address: data.address, photoUrl: '', accountNo: data.accountNo, holderName: data.holderName,
      bankName: data.bankName, bankBranch: data.bankBranch, ifsc: data.ifsc, documentUrl: '',
    })
    setHasUnsavedChanges(false)
    setActiveTab(0)
  }

  const handleGuarantorSave = (slot: 1 | 2) => (data: StakeholderForm) => {
    updateGuarantor(customer.id, slot, {
      slot, identityProof: data.identityProof, identityNo: data.identityNo, name: data.name,
      relation: data.relation, dob: data.dob, age: Number(data.age), mobile: data.mobile,
      address: data.address, photoUrl: '', accountNo: data.accountNo, holderName: data.holderName,
      bankName: data.bankName, bankBranch: data.bankBranch, ifsc: data.ifsc, documentUrl: '',
    })
    setHasUnsavedChanges(false)
    setActiveTab(0)
  }

  const infoRows = [
    { icon: Phone,    label: 'Mobile',      value: customer.mobile },
    { icon: Phone,    label: 'Alt Mobile',  value: customer.altMobile || '—' },
    { icon: Mail,     label: 'Email',       value: customer.email || '—' },
    { icon: CreditCard, label: 'Aadhaar',   value: maskAadhaar(customer.aadhar) },
    { icon: CreditCard, label: 'PAN',       value: customer.pan ? maskPAN(customer.pan) : '—' },
    { icon: User,     label: 'Gender',      value: customer.gender || '—' },
    { icon: User,     label: 'DOB',         value: customer.dob || '—' },
    { icon: User,     label: 'Age',         value: customer.age ? `${customer.age} yrs` : '—' },
    { icon: User,     label: 'Blood Group', value: customer.bloodGroup || '—' },
    { icon: Briefcase, label: 'Occupation', value: customer.occupation || '—' },
    { icon: MapPin,   label: 'Address',     value: customer.jobAddress || '—' },
  ]

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.push('/customers/list')}
          aria-label="Back to customer list"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <PageHeader
            title={customer.name}
            subtitle={`App No: ${customer.appNo}`}
            action={{ label: 'Create Loan', onClick: () => router.push(`/loans/add?customerId=${customer.id}`), icon: <Plus size={14} /> }}
          />
        </div>
      </div>

      {/* Customer Photo + Summary */}
      <div
        className="rounded-2xl p-5 mb-5 flex flex-col md:flex-row gap-5 items-start"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex gap-4 items-start">
          {customer.photoUrl ? (
            <img
              src={customer.photoUrl}
              alt={`Photo of ${customer.name}`}
              className="w-20 h-20 rounded-2xl object-cover border-2"
              style={{ borderColor: 'var(--accent)' }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl flex-shrink-0"
              style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
              aria-label="No photo"
            >
              {customer.name.charAt(0)}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Camera size={14} style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Customer Photo</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
          {infoRows.map(row => (
            <div key={row.label} className="flex items-start gap-2 min-w-0">
              <row.icon size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{row.label}</div>
                <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{row.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }} role="tablist">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === i}
              aria-controls={`tab-panel-${i}`}
              onClick={() => requestTabChange(i)}
              className="px-5 py-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
              style={{
                color: activeTab === i ? 'var(--accent)' : 'var(--text-secondary)',
                background: activeTab === i ? 'var(--accent-tint)' : 'transparent',
                borderBottom: activeTab === i ? '2px solid var(--accent)' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (activeTab !== i) e.currentTarget.style.background = 'var(--hover)' }}
              onMouseLeave={e => { if (activeTab !== i) e.currentTarget.style.background = 'transparent' }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6" role="tabpanel" id={`tab-panel-${activeTab}`}>
          {activeTab === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl p-4" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
                <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-secondary)' }}>Bank Details</h4>
                {[
                  { label: 'Account No', value: customer.bank?.accountNo || '—' },
                  { label: 'Holder Name', value: customer.bank?.holderName || '—' },
                  { label: 'Bank',        value: customer.bank?.bankName || '—' },
                  { label: 'Branch',      value: customer.bank?.bankBranch || '—' },
                  { label: 'IFSC',        value: customer.bank?.ifsc || '—' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-1.5 text-xs" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
                <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-secondary)' }}>Nominee</h4>
                {customer.nominee ? (
                  [
                    { label: 'Name',     value: customer.nominee.name },
                    { label: 'Relation', value: customer.nominee.relation },
                    { label: 'Mobile',   value: customer.nominee.mobile },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between py-1.5 text-xs" style={{ borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs py-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                    No nominee added.{' '}
                    <button className="underline cursor-pointer" style={{ color: 'var(--accent)' }} onClick={() => requestTabChange(1)}>
                      Add now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 1 && (
            <StakeholderFormPanel
              initial={customer.nominee}
              onSave={handleNomineeSave}
              label="Nominee"
              onDirty={() => setHasUnsavedChanges(true)}
            />
          )}
          {activeTab === 2 && (
            <StakeholderFormPanel
              initial={customer.guarantor1}
              onSave={handleGuarantorSave(1)}
              label="Guarantor 1"
              onDirty={() => setHasUnsavedChanges(true)}
            />
          )}
          {activeTab === 3 && (
            <StakeholderFormPanel
              initial={customer.guarantor2}
              onSave={handleGuarantorSave(2)}
              label="Guarantor 2"
              onDirty={() => setHasUnsavedChanges(true)}
            />
          )}
          {activeTab === 4 && <DocumentsPanel />}
        </div>
      </div>

      {/* Unsaved-changes guard — only fires on explicit tab click, not URL navigation */}
      <ConfirmDialog
        open={pendingTab !== null}
        title="Unsaved Changes"
        message="You have unsaved changes. Leaving this tab will discard them. Continue?"
        confirmText="Discard & Leave"
        cancelText="Stay"
        isDanger
        onConfirm={confirmTabChange}
        onCancel={() => setPendingTab(null)}
      />
    </>
  )
}
