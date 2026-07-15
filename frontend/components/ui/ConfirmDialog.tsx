'use client'
import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isDanger?: boolean
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = false
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="text-sm text-slate-600 dark:text-slate-300 mb-6">
        {message}
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button
          variant={isDanger ? 'danger' : 'primary'}
          onClick={() => {
            onConfirm()
            onCancel()
          }}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}
