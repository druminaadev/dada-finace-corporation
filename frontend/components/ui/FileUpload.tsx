'use client'
import { useState, useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'

interface FileUploadProps {
  label: string
  accept?: string
  multiple?: boolean
  onChange?: (files: File[]) => void
}

export function FileUpload({ label, accept, multiple = true, onChange }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const fileArray = Array.from(newFiles)
    setFiles(prev => multiple ? [...prev, ...fileArray] : fileArray)
    onChange?.(multiple ? [...files, ...fileArray] : fileArray)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onChange?.(newFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-[#6B6B6B] dark:text-gray-300">
        {label}
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className="border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all bg-[#FAFAFA] dark:bg-[var(--card)]"
        style={{
          borderColor: isDragging ? 'var(--accent)' : 'var(--border)',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #831C91, #D552A3)' }}
          >
            <Upload size={20} style={{ color: '#FFFFFF' }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2C2C2C] dark:text-[var(--text-primary)]">
              Drop files here or click to browse
            </p>
            <p className="text-xs mt-1 text-[#6B6B6B] dark:text-[var(--text-secondary)]">
              {multiple ? 'Upload multiple files' : 'Upload a file'}
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[var(--card)] border border-gray-200 dark:border-[var(--border)]"
              style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--accent-tint)' }}
                >
                  <FileText size={14} style={{ color: '#831C91' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-[#2C2C2C] dark:text-[var(--text-primary)]">
                    {file.name}
                  </p>
                  <p className="text-xs text-[#6B6B6B] dark:text-[var(--text-secondary)]">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1.5 rounded-lg cursor-pointer transition-colors flex-shrink-0"
                style={{ color: '#831C91' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-tint)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
