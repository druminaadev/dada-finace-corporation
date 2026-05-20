'use client'
/* eslint-disable react-hooks/incompatible-library */
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/layout/PageHeader'
import { NeumorphicCard } from '@/components/ui/NeumorphicCard'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { GradientButton } from '@/components/ui/GradientButton'
import { FileUpload } from '@/components/ui/FileUpload'
import { useStore } from '@/store/appStore'
import { useUIStore } from '@/store/uiStore'
import { Car, Gem, User, Calculator, FileText, Shield, Users, UserCheck, BadgeCheck, IdCard, HandCoins } from 'lucide-react'

interface LoanForm {
  appNo: string; branchId: string; employeeId: string; customerName: string
  fatherName: string; motherName: string; dob: string; age: string; gender: string
  maritalStatus: string; regDate: string; mobile: string; email: string
  altMobile: string; aadhar: string; pan: string; bloodGroup: string
  occupation: string; jobAddress: string; stateId: string; cityId: string
  areaId: string; address: string
  bankAccountNo: string; bankHolderName: string; bankName: string
  bankBranch: string; ifscCode: string
  nomineeName: string; nomineeRelation: string; nomineeDob: string; nomineeAge: string
  nomineeMobile: string; nomineeIdentityProof: string; nomineeIdentityNo: string
  nomineeAddress: string; nomineeAccountNo: string; nomineeHolderName: string
  nomineeBankName: string; nomineeBankBranch: string; nomineeIfsc: string
  guarantor1Name: string; guarantor1Relation: string; guarantor1Dob: string; guarantor1Age: string
  guarantor1Mobile: string; guarantor1IdentityProof: string; guarantor1IdentityNo: string
  guarantor1Address: string; guarantor1AccountNo: string; guarantor1HolderName: string
  guarantor1BankName: string; guarantor1BankBranch: string; guarantor1Ifsc: string
  guarantor2Name: string; guarantor2Relation: string; guarantor2Dob: string; guarantor2Age: string
  guarantor2Mobile: string; guarantor2IdentityProof: string; guarantor2IdentityNo: string
  guarantor2Address: string; guarantor2AccountNo: string; guarantor2HolderName: string
  guarantor2BankName: string; guarantor2BankBranch: string; guarantor2Ifsc: string
  loanDate: string; emiStartDate: string; loanTypeId: string
  amount: string; installments: string; interestRate: string
  fileCharges: string; otherCharges: string; intervalDays: string; remarks: string
  modelName: string; regNo: string; chassisNo: string; keys: string; rcReceived: string
  itemName: string; weight: string; pieces: string; receiverMobile: string
}

const INTERVALS = ['7 Days', '14 Days', 'Monthly', 'Quarterly']
const GENDERS = ['Male', 'Female', 'Other']
const MARITAL_STATUS = ['Single', 'Married', 'Divorced', 'Widowed']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const IDENTITY_PROOFS = ['Aadhar Card', 'PAN Card', 'Voter ID', 'Driving License', 'Passport']
const RELATIONS = ['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Other']
const STEPS = ['Aadhaar Auth', 'Personal Details', 'Loan Details', 'Nominee & Guarantors']
const STEP_ICONS = [IdCard, User, HandCoins, Users]

export default function AddLoanPage() {
  const { employees, loanTypes, addLoan, branches, states, cities, areas } = useStore()
  const { showToast } = useUIStore()
  const router = useRouter()
  const [interestAmount, setInterestAmount] = useState(0)
  const [securityType, setSecurityType] = useState<'vehicle' | 'gold'>('vehicle')
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const { register, handleSubmit, watch, setValue } = useForm<LoanForm>({
    defaultValues: {
      appNo: `APP${1447}`,
      loanDate: new Date().toISOString().split('T')[0],
      emiStartDate: new Date().toISOString().split('T')[0],
      regDate: new Date().toISOString().split('T')[0],
      rcReceived: 'yes',
      fileCharges: '0',
      otherCharges: '0',
      gender: 'Male',
      maritalStatus: 'Married'
    }
  })

  const watchAmount = watch('amount'), watchRate = watch('interestRate'), watchInstallments = watch('installments')
  const watchDob = watch('dob')
  const watchNomineeDob = watch('nomineeDob')
  const watchGuarantor1Dob = watch('guarantor1Dob')
  const watchGuarantor2Dob = watch('guarantor2Dob')
  const watchNomineeAge = watch('nomineeAge')
  const watchGuarantor1Age = watch('guarantor1Age')
  const watchGuarantor2Age = watch('guarantor2Age')
  const watchStateId = watch('stateId')
  const watchCityId = watch('cityId')
  const watchRcReceived = watch('rcReceived')

  const setAgeFromDob = useCallback((dob: string | undefined, field: 'age' | 'nomineeAge' | 'guarantor1Age' | 'guarantor2Age') => {
    if (!dob) return
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
    setValue(field, String(age))
  }, [setValue])

  useEffect(() => {
    const amt = Number(watchAmount) || 0, rate = Number(watchRate) || 0, inst = Number(watchInstallments) || 0
    setInterestAmount(amt && rate && inst ? Math.round(amt * (rate / 100) * (inst / 12)) : 0)
  }, [watchAmount, watchRate, watchInstallments])

  useEffect(() => setAgeFromDob(watchDob, 'age'), [watchDob, setAgeFromDob])
  useEffect(() => setAgeFromDob(watchNomineeDob, 'nomineeAge'), [watchNomineeDob, setAgeFromDob])
  useEffect(() => setAgeFromDob(watchGuarantor1Dob, 'guarantor1Age'), [watchGuarantor1Dob, setAgeFromDob])
  useEffect(() => setAgeFromDob(watchGuarantor2Dob, 'guarantor2Age'), [watchGuarantor2Dob, setAgeFromDob])

  const formatINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
  const filteredCities = cities.filter(c => c.stateId === Number(watchStateId))
  const filteredAreas = areas.filter(a => a.cityId === Number(watchCityId))
  const totalPayable = Number(watchAmount || 0) + interestAmount + Number(watch('fileCharges') || 0) + Number(watch('otherCharges') || 0)

  const goNext = () => setCurrentStep(step => Math.min(step + 1, STEPS.length))
  const goPrevious = () => setCurrentStep(step => Math.max(step - 1, 1))

  const onSubmit = (data: LoanForm) => {
    addLoan({
      customerId: 1,
      employeeId: Number(data.employeeId) || 0,
      loanDate: data.loanDate,
      emiStartDate: data.emiStartDate,
      loanTypeId: Number(data.loanTypeId) || 0,
      amount: Number(data.amount) || 0,
      installments: Number(data.installments) || 0,
      interestRate: Number(data.interestRate) || 0,
      interestAmount,
      fileCharges: Number(data.fileCharges) || 0,
      otherCharges: Number(data.otherCharges) || 0,
      intervalDays: data.intervalDays,
      remarks: data.remarks,
      security: {
        type: securityType,
        ...(securityType === 'vehicle'
          ? { modelName: data.modelName, regNo: data.regNo, chassisNo: data.chassisNo, keys: data.keys, rcReceived: data.rcReceived === 'yes' }
          : { itemName: data.itemName, weight: Number(data.weight) || 0, pieces: Number(data.pieces) || 0 }),
        fileUrls: []
      },
      receiver: { mobile: data.receiverMobile, documentUrl: '' },
    })
    showToast('Loan registered successfully!', 'success')
    router.push('/loans/list')
  }

  const sectionHeader = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    background: string,
    iconTint = '#fff'
  ) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#D552A3]/30 dark:border-[var(--border)]">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ring-2 ring-[#D552A3]/20 dark:ring-[var(--border)]" style={{ background }}>
        <span style={{ color: iconTint }}>{icon}</span>
      </div>
      <div>
        <h3 className="text-sm font-bold text-[#2C2C2C] dark:text-[var(--text-primary)]">{title}</h3>
        <p className="text-[11px] text-[#666666] dark:text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
      </div>
    </div>
  )

  const personSupportFields = (prefix: 'nominee' | 'guarantor1' | 'guarantor2', ageValue: string | undefined) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input label={prefix === 'nominee' ? 'Nominee Name' : 'Guarantor Name'} placeholder="Full name" {...register(`${prefix}Name` as keyof LoanForm)} />
        <Select label="Relation" placeholder="Select Relation" options={RELATIONS.map(r => ({ value: r, label: r }))} {...register(`${prefix}Relation` as keyof LoanForm)} />
        <Input label="Date of Birth" type="date" {...register(`${prefix}Dob` as keyof LoanForm)} />
        <Input label="Age" value={ageValue || ''} disabled {...register(`${prefix}Age` as keyof LoanForm)} />
        <Input label="Mobile" placeholder="10-digit mobile" {...register(`${prefix}Mobile` as keyof LoanForm)} />
        <Select label="Identity Proof" placeholder="Select ID Proof" options={IDENTITY_PROOFS.map(i => ({ value: i, label: i }))} {...register(`${prefix}IdentityProof` as keyof LoanForm)} />
        <Input label="Identity No" placeholder="Identity number" {...register(`${prefix}IdentityNo` as keyof LoanForm)} />
        <div className="md:col-span-2 lg:col-span-3">
          <Textarea label="Address" placeholder="Complete address" rows={2} {...register(`${prefix}Address` as keyof LoanForm)} />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#D552A3]/20 dark:border-[var(--border)]">
        <h4 className="text-sm font-bold mb-4 text-[#2C2C2C] dark:text-[var(--text-primary)]">
          {prefix === 'nominee' ? 'Nominee' : prefix === 'guarantor1' ? 'Guarantor 1' : 'Guarantor 2'} Bank Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Input label="Account Number" placeholder="Account number" {...register(`${prefix}AccountNo` as keyof LoanForm)} />
          <Input label="Account Holder Name" placeholder="As per bank" {...register(`${prefix}HolderName` as keyof LoanForm)} />
          <Input label="Bank Name" placeholder="Bank name" {...register(`${prefix}BankName` as keyof LoanForm)} />
          <Input label="Branch" placeholder="Branch name" {...register(`${prefix}BankBranch` as keyof LoanForm)} />
          <Input label="IFSC Code" placeholder="IFSC code" {...register(`${prefix}Ifsc` as keyof LoanForm)} />
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen pb-6">
      <PageHeader title="Add New Loan" />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="rounded-xl border border-[#D552A3]/30 bg-white p-3 shadow-sm dark:border-[var(--border)] dark:bg-[var(--card)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
            {STEPS.map((step, index) => {
              const number = index + 1
              const isActive = currentStep === number
              const isComplete = currentStep > number
              const StepIcon = STEP_ICONS[index]
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => setCurrentStep(number)}
                  className="group flex min-h-14 items-center gap-2.5 rounded-lg p-2.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    background: '#FFFFFF',
                    border: `1.5px solid ${isActive ? '#462C7D' : isComplete ? '#831C91' : '#D552A3'}`,
                    color: isActive || isComplete ? '#462C7D' : '#831C91',
                  }}
                >
                  <span
                    style={{
                      background: isActive || isComplete ? 'rgba(70, 44, 125, 0.1)' : '#FFF5F8',
                      color: '#462C7D',
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                  >
                    <StepIcon size={16} />
                  </span>
                  <span className="block min-w-0 truncate text-sm font-bold">{step}</span>
                </button>
              )
            })}
          </div>
        </div>

        {currentStep === 1 && (
          <NeumorphicCard className="rounded-xl border-[#D552A3]/30 bg-white/95 p-5">
            {sectionHeader(<BadgeCheck size={18} />, 'Aadhaar Authentication', 'Aadhaar details and verification document', 'linear-gradient(135deg, #462C7D, #831C91)')}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Application No" value={watch('appNo')} disabled {...register('appNo')} />
              <Input label="Aadhaar No" placeholder="12-digit Aadhaar" {...register('aadhar')} />
            </div>
            <div className="mt-3">
              <FileUpload label="Upload Aadhaar Authentication Document" accept="image/*,.pdf" />
            </div>
          </NeumorphicCard>
        )}

        {currentStep === 2 && (
          <NeumorphicCard className="rounded-xl border-[#D552A3]/30 bg-white/95 p-5">
            {sectionHeader(<User size={18} />, 'Personal Details', 'Customer personal and contact information', 'linear-gradient(135deg, #462C7D, #831C91)')}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Select label="Branch" placeholder="Select Branch" options={branches.map(b => ({ value: b.id, label: b.name }))} {...register('branchId')} />
              <Select label="Employee" placeholder="Select Employee" options={employees.map(e => ({ value: e.id, label: e.name }))} {...register('employeeId')} />
              <Input label="Customer Name" placeholder="Full name" {...register('customerName')} />
              <Input label="Father's Name" placeholder="Father's name" {...register('fatherName')} />
              <Input label="Mother's Name" placeholder="Mother's name" {...register('motherName')} />
              <Input label="Date of Birth" type="date" {...register('dob')} />
              <Input label="Age" value={watch('age')} disabled {...register('age')} />
              <Select label="Gender" options={GENDERS.map(g => ({ value: g, label: g }))} {...register('gender')} />
              <Select label="Marital Status" options={MARITAL_STATUS.map(m => ({ value: m, label: m }))} {...register('maritalStatus')} />
              <Input label="Registration Date" type="date" {...register('regDate')} />
              <Input label="Mobile Number" placeholder="10-digit mobile" {...register('mobile')} />
              <Input label="Email ID" type="email" placeholder="email@example.com" {...register('email')} />
              <Input label="Alternative Mobile" placeholder="10-digit mobile" {...register('altMobile')} />
              <Input label="PAN No" placeholder="10-character PAN" {...register('pan')} />
              <Select label="Blood Group" placeholder="Select Blood Group" options={BLOOD_GROUPS.map(bg => ({ value: bg, label: bg }))} {...register('bloodGroup')} />
              <Input label="Occupation" placeholder="e.g. Business, Service" {...register('occupation')} />
              <div className="md:col-span-2 lg:col-span-3">
                <Input label="Job Address" placeholder="Complete job/business address" {...register('jobAddress')} />
              </div>
              <Select label="State" placeholder="Select State" options={states.map(s => ({ value: s.id, label: s.name }))} {...register('stateId')} />
              <Select label="City" placeholder="Select City" options={filteredCities.map(c => ({ value: c.id, label: c.name }))} {...register('cityId')} />
              <Select label="Area" placeholder="Select Area" options={filteredAreas.map(a => ({ value: a.id, label: a.name }))} {...register('areaId')} />
              <div className="md:col-span-2 lg:col-span-3">
                <Textarea label="Address" placeholder="Complete residential address" rows={2} {...register('address')} />
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <label className="text-xs font-medium text-[#6B6B6B] dark:text-gray-300">Profile Photo</label>
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-[#D552A3]/50 bg-[#FFF5F8]/40 p-3 dark:border-[var(--border)] dark:bg-[var(--card)]">
                {profilePhoto && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden" style={{ border: '2px solid var(--border)' }}>
                    {/* Local object URLs are already client-only previews. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(profilePhoto)} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="cursor-pointer px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md" style={{ background: 'linear-gradient(135deg, #462C7D, #831C91)', color: '#fff' }}>
                  {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && setProfilePhoto(e.target.files[0])} />
                </label>
              </div>
            </div>
          </NeumorphicCard>
        )}

        {currentStep === 3 && (
          <>
            <NeumorphicCard className="rounded-xl border-[#D552A3]/30 bg-white/95 p-5">
              {sectionHeader(<FileText size={18} />, 'Loan Information', 'Basic loan schedule and type', 'linear-gradient(135deg, #462C7D, #831C91)')}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Input label="Loan Date" type="date" {...register('loanDate')} />
                <Input label="EMI Start Date" type="date" {...register('emiStartDate')} />
                <Select label="Loan Type" placeholder="Select Loan Type" options={loanTypes.map(lt => ({ value: lt.id, label: lt.name }))} {...register('loanTypeId')} />
                <Select label="Payment Interval" placeholder="Select Interval" options={INTERVALS.map(i => ({ value: i, label: i }))} {...register('intervalDays')} />
              </div>
            </NeumorphicCard>

            <NeumorphicCard className="rounded-xl border-[#D552A3]/30 bg-white/95 p-5">
              {sectionHeader(<FileText size={18} />, 'Bank Details', 'Customer bank account information', 'linear-gradient(135deg, #462C7D, #831C91)')}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Input label="Bank Account Number" placeholder="Account number" {...register('bankAccountNo')} />
                <Input label="Account Holder Name" placeholder="As per bank records" {...register('bankHolderName')} />
                <Input label="Bank Name" placeholder="e.g. SBI, HDFC" {...register('bankName')} />
                <Input label="Bank Branch" placeholder="Branch name" {...register('bankBranch')} />
                <Input label="IFSC Code" placeholder="e.g. SBIN0001234" {...register('ifscCode')} />
              </div>
              <div className="mt-3">
                <FileUpload label="Upload Bank Documents" accept="image/*,.pdf" />
              </div>
            </NeumorphicCard>

            <NeumorphicCard className="rounded-xl border-[#D552A3]/30 bg-white/95 p-5">
              {sectionHeader(<Calculator size={18} />, 'Financial Details', 'Loan amount, interest, and payment terms', 'linear-gradient(135deg, #462C7D, #831C91)')}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Input label="Loan Amount (Rs.)" type="number" placeholder="e.g. 100000" {...register('amount')} />
                <Input label="Interest Rate (%)" type="number" step="0.1" placeholder="e.g. 12" {...register('interestRate')} />
                <Input label="No. of Installments" type="number" placeholder="e.g. 12" {...register('installments')} />
                <Input label="File Charges (Rs.)" type="number" placeholder="0" {...register('fileCharges')} />
                <Input label="Other Charges (Rs.)" type="number" placeholder="0" {...register('otherCharges')} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#6B6B6B] dark:text-gray-300">Interest Amount (Rs.)</label>
                  <div className="h-11 px-4 flex items-center text-sm rounded-xl font-bold" style={{ background: 'linear-gradient(135deg, rgba(70, 44, 125, 0.1), rgba(131, 28, 145, 0.15))', color: '#462C7D', border: '1.5px solid rgba(70, 44, 125, 0.3)' }}>
                    {formatINR(interestAmount)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#D552A3]/30 dark:border-[var(--border)]">
                <div className="rounded-xl p-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #FFF5F8, #F8F4F6)', border: '1.5px solid #D552A3' }}>
                  <p className="text-xs font-semibold" style={{ color: '#462C7D' }}>Principal Amount</p>
                  <p className="text-xl font-bold mt-1" style={{ color: '#462C7D' }}>{formatINR(Number(watchAmount || 0))}</p>
                </div>
                <div className="rounded-xl p-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #F8F4F6, #F0E6ED)', border: '1.5px solid #831C91' }}>
                  <p className="text-xs font-semibold" style={{ color: '#831C91' }}>Total Interest</p>
                  <p className="text-xl font-bold mt-1" style={{ color: '#831C91' }}>{formatINR(interestAmount)}</p>
                </div>
                <div className="rounded-xl p-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', border: '1.5px solid #A7F3D0' }}>
                  <p className="text-xs font-semibold" style={{ color: '#059669' }}>Total Payable</p>
                  <p className="text-xl font-bold mt-1" style={{ color: '#047857' }}>{formatINR(totalPayable)}</p>
                </div>
              </div>
              <div className="mt-3">
                <Textarea label="Remarks" placeholder="Additional notes or comments..." rows={2} {...register('remarks')} />
              </div>
            </NeumorphicCard>

            <NeumorphicCard className="rounded-xl border-[#D552A3]/30 bg-white/95 p-5">
              {sectionHeader(<Shield size={18} />, 'Security Deposit', 'Collateral details for the loan', 'linear-gradient(135deg, #462C7D, #831C91)')}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 rounded-lg bg-[#FFF5F8] p-2 dark:bg-[var(--card)]">
                {(['vehicle', 'gold'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSecurityType(t)}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                    style={{
                      background: securityType === t ? 'linear-gradient(135deg, #462C7D, #831C91)' : '#FFFFFF',
                      color: securityType === t ? '#fff' : '#111111',
                      border: `1.5px solid ${securityType === t ? '#462C7D' : '#FFFFFF'}`,
                    }}
                  >
                    {t === 'vehicle' ? <Car size={16} /> : <Gem size={16} />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              {securityType === 'vehicle' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Input label="Vehicle Model" placeholder="e.g. Honda Activa" {...register('modelName')} />
                    <Input label="Registration Number" placeholder="e.g. GJ01AB1234" {...register('regNo')} />
                    <Input label="Chassis Number" placeholder="Chassis number" {...register('chassisNo')} />
                    <Input label="Number of Keys" type="number" placeholder="e.g. 2" {...register('keys')} />
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-[#6B6B6B] dark:text-gray-300">RC Book Received</label>
                      <div className="flex gap-3 h-11">
                        {['yes', 'no'].map(v => (
                          <label key={v} className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer rounded-xl transition-all" style={{
                            background: watchRcReceived === v ? 'linear-gradient(135deg, #462C7D, #831C91)' : '#FFFFFF',
                            color: watchRcReceived === v ? '#FFFFFF' : '#6B6B6B',
                            border: `1.5px solid ${watchRcReceived === v ? '#462C7D' : '#D552A3'}`,
                          }}>
                            <input type="radio" value={v} {...register('rcReceived')} className="hidden" />
                            {v === 'yes' ? 'Yes' : 'No'}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <FileUpload label="Upload Vehicle Documents" accept="image/*,.pdf" />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Input label="Item Name" placeholder="e.g. Gold Necklace" {...register('itemName')} />
                    <Input label="Weight (grams)" type="number" step="0.1" placeholder="e.g. 20" {...register('weight')} />
                    <Input label="No. of Pieces" type="number" placeholder="e.g. 1" {...register('pieces')} />
                  </div>
                  <div className="mt-3">
                    <FileUpload label="Upload Gold Documents" accept="image/*,.pdf" />
                  </div>
                </>
              )}
            </NeumorphicCard>

            <NeumorphicCard className="rounded-xl border-[#D552A3]/30 bg-white/95 p-5">
              {sectionHeader(<User size={18} />, 'Receiver Customer Details', 'Person receiving the loan amount', 'linear-gradient(135deg, #462C7D, #831C91)')}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input label="Phone Number" placeholder="10-digit mobile" {...register('receiverMobile')} />
              </div>
              <div className="mt-3">
                <FileUpload label="Upload Receiver Document" accept="image/*,.pdf" />
              </div>
            </NeumorphicCard>
          </>
        )}

        {currentStep === 4 && (
          <>
            <NeumorphicCard className="rounded-xl border-[#D552A3]/30 bg-white/95 p-5">
              {sectionHeader(<UserCheck size={18} />, 'Nominee Details', 'Nominee information for the loan', 'linear-gradient(135deg, #462C7D, #831C91)')}
              {personSupportFields('nominee', watchNomineeAge)}
              <div className="mt-3">
                <FileUpload label="Upload Nominee Documents" accept="image/*,.pdf" />
              </div>
            </NeumorphicCard>

            <NeumorphicCard className="rounded-xl border-[#D552A3]/30 bg-white/95 p-5">
              {sectionHeader(<Users size={18} />, 'Guarantor 1 Details', 'Primary guarantor information', 'linear-gradient(135deg, #462C7D, #831C91)')}
              {personSupportFields('guarantor1', watchGuarantor1Age)}
              <div className="mt-3">
                <FileUpload label="Upload Guarantor 1 Documents" accept="image/*,.pdf" />
              </div>
            </NeumorphicCard>

            <NeumorphicCard className="rounded-xl border-[#D552A3]/30 bg-white/95 p-5">
              {sectionHeader(<Users size={18} />, 'Guarantor 2 Details', 'Secondary guarantor information', 'linear-gradient(135deg, #462C7D, #831C91)')}
              {personSupportFields('guarantor2', watchGuarantor2Age)}
              <div className="mt-3">
                <FileUpload label="Upload Guarantor 2 Documents" accept="image/*,.pdf" />
              </div>
            </NeumorphicCard>
          </>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 rounded-xl border border-[#D552A3]/30 bg-white px-4 py-3 shadow-sm dark:border-[var(--border)] dark:bg-[var(--card)]">
          <div className="flex flex-wrap gap-2.5">
            {currentStep > 1 && <GradientButton type="button" variant="outline" size="lg" onClick={goPrevious}>Previous</GradientButton>}
            {currentStep < STEPS.length && <GradientButton type="button" size="lg" onClick={goNext}>Next</GradientButton>}
            {currentStep === STEPS.length && <GradientButton type="submit" size="lg">Register Loan</GradientButton>}
            <button type="button" onClick={() => router.push('/loans/list')} className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:bg-gray-200" style={{ background: '#F1F1F1', color: '#6B6B6B', border: '1.5px solid #E0E0E0' }}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  )
}
