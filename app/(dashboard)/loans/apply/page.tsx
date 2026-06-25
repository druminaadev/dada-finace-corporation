'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLoanDraftStore } from '@/store/loanDraftStore'
import { useUIStore } from '@/store/uiStore'
import { CheckCircle, Home, AlertCircle, Trash2 } from 'lucide-react'
import { Stage1Aadhaar } from '@/components/loan-stages/Stage1Aadhaar'
import { Stage2CustomerLoan } from '@/components/loan-stages/Stage2CustomerLoan'
import Stage3GuarantorNominee from '@/components/loan-stages/Stage3GuarantorNominee'
import Stage4Documents from '@/components/loan-stages/Stage4Documents'
import Stage5Review from '@/components/loan-stages/Stage5Review'

const STAGES = [
  { num: 1, label: 'Aadhaar Verification' },
  { num: 2, label: 'Customer & Loan Details' },
  { num: 3, label: 'Guarantor & Nominee' },
  { num: 4, label: 'Document Upload' },
  { num: 5, label: 'Review & Submit' },
]

export default function LoanApplicationPage() {
  const router = useRouter()
  const { currentStage, canAccessStage, setCurrentStage, submitted, submittedLoanId, resetDraft } = useLoanDraftStore()
  const { showToast } = useUIStore()
  const [showStorageWarning, setShowStorageWarning] = useState(false)

  useEffect(() => {
    if (submitted && submittedLoanId) {
      showToast('Loan application submitted successfully!', 'success')
      setTimeout(() => {
        resetDraft()
        router.push('/loans/list')
      }, 2000)
    }
  }, [submitted, submittedLoanId, router, showToast, resetDraft])

  useEffect(() => {
    // Check localStorage size
    if (typeof window !== 'undefined') {
      try {
        const testKey = 'storage-test'
        localStorage.setItem(testKey, 'test')
        localStorage.removeItem(testKey)
      } catch (e) {
        void e
        setShowStorageWarning(true)
      }
    }
  }, [])

  const handleClearStorage = () => {
    if (confirm('This will clear all saved loan application data. Continue?')) {
      localStorage.removeItem('nexzen-loan-draft')
      showToast('Storage cleared successfully', 'success')
      setShowStorageWarning(false)
      window.location.reload()
    }
  }

  const goToStage = (stage: number) => {
    if (!canAccessStage(stage)) {
      showToast('Please complete previous stages first', 'warning')
      return
    }
    setCurrentStage(stage)
  }

  const handleNext = () => {
    if (currentStage < 5) {
      setCurrentStage(currentStage + 1)
    }
  }

  const handlePrev = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] dark:bg-[var(--bg)] pb-8">
      {/* Storage Warning */}
      {showStorageWarning && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-800">Storage Quota Exceeded</p>
                <p className="text-xs text-red-600">Clear storage to continue uploading files</p>
              </div>
            </div>
            <button
              onClick={handleClearStorage}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
            >
              <Trash2 size={16} />
              Clear Storage
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-[var(--surface)] border-b border-gray-200 dark:border-[var(--border)] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--hover)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Home size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  New Loan Application
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Complete all stages to submit your loan application
                </p>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {STAGES.map((stage, idx) => {
              const isActive = currentStage === stage.num
              const isCompleted = currentStage > stage.num
              const canAccess = canAccessStage(stage.num)

              return (
                <div key={stage.num} className="flex items-center flex-1 min-w-0">
                  <button
                    onClick={() => goToStage(stage.num)}
                    disabled={!canAccess}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-1 min-w-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white shadow-lg scale-105'
                        : isCompleted
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                        : canAccess
                        ? 'bg-gray-100 dark:bg-[var(--hover)] hover:bg-gray-200 dark:hover:bg-[var(--card)]'
                        : 'bg-gray-50 dark:bg-[var(--surface)] opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle size={20} />
                      ) : (
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isActive
                              ? 'bg-white text-[var(--primary)]'
                              : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {stage.num}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold truncate hidden sm:inline">
                      {stage.label}
                    </span>
                  </button>
                  {idx < STAGES.length - 1 && (
                    <div
                      className={`h-0.5 w-4 mx-1 flex-shrink-0 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stage Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        {currentStage === 1 && <Stage1Aadhaar onNext={handleNext} />}
        {currentStage === 2 && <Stage2CustomerLoan onNext={handleNext} onPrev={handlePrev} />}
        {currentStage === 3 && <Stage3GuarantorNominee />}
        {currentStage === 4 && <Stage4Documents />}
        {currentStage === 5 && <Stage5Review />}
      </div>
    </div>
  )
}
