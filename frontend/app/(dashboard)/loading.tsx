import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* PageHeader Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2"></div>
          <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>

      {/* Main Content Skeleton (Card/Table mock) */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-8 w-64 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
        </div>

        {/* Rows */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                  <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                </div>
              </div>
              <div className="hidden sm:flex gap-8">
                <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading Spinner overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/20 dark:bg-slate-900/20 rounded-2xl pointer-events-none">
          <Loader2 className="w-8 h-8 text-primary animate-spin opacity-50" />
        </div>
      </div>
    </div>
  )
}
