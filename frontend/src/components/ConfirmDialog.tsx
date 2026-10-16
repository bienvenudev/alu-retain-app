import { useEffect, useRef } from 'react'

import { Button } from './ui/Button'
import { ErrorMessage } from './ui/ErrorMessage'

interface ConfirmDialogProps {
  confirmLabel: string
  error: string | null
  isBusy: boolean
  message: string
  onCancel: () => void
  onConfirm: () => void
  title: string
}

// Mount it to open it, unmount it to close it.
export function ConfirmDialog({
  confirmLabel,
  error,
  isBusy,
  message,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (dialog && !dialog.open) {
      dialog.showModal()
    }

    return () => dialog?.close()
  }, [])

  return (
    <dialog
      aria-labelledby="confirm-dialog-title"
      className="m-auto w-[min(92vw,24rem)] rounded-xl p-6 backdrop:bg-black/40"
      onCancel={(event) => {
        event.preventDefault()

        if (!isBusy) {
          onCancel()
        }
      }}
      ref={dialogRef}
    >
      <h2 className="m-0 text-lg font-bold" id="confirm-dialog-title">
        {title}
      </h2>
      <p className="mt-2 text-slate-600">{message}</p>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <div className="mt-5 flex justify-end gap-2">
        <Button disabled={isBusy} onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button disabled={isBusy} onClick={onConfirm} variant="danger">
          {isBusy ? 'Deleting…' : confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
