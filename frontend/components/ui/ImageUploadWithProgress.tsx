'use client'
import React, { useRef, useState, useEffect } from 'react'
import { Camera, X, Upload } from 'lucide-react'

interface ImageUploadWithProgressProps {
  label: string
  required?: boolean
  value?: string | null
  onChange: (file: File | null, preview: string | null) => void
}

export function ImageUploadWithProgress({ label, required, value, onChange }: ImageUploadWithProgressProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPreview(value || null)
  }, [value])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create a local preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    
    // Simulate upload progress
    setIsUploading(true)
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          onChange(file, objectUrl)
          return 100
        }
        return p + 10
      })
    }, 100)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1 dark:text-slate-200 text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="mt-1 flex items-center gap-4">
        <div 
          className="relative w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden cursor-pointer group hover:border-[var(--accent)] transition-colors"
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </>
          ) : (
            <div className="text-slate-400 group-hover:text-[var(--accent)] flex flex-col items-center">
              <Upload size={24} />
              <span className="text-[10px] mt-1 font-medium uppercase tracking-wider">Upload</span>
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{progress}%</span>
            </div>
          )}
        </div>
        
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        
        {preview && !isUploading && (
          <button 
            type="button"
            onClick={handleRemove}
            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
            title="Remove image"
          >
            <X size={20} />
          </button>
        )}
      </div>
      {isUploading && (
        <div className="w-24 mt-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--accent)] transition-all duration-100" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
