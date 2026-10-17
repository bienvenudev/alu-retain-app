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
    const opener = document.activeElement as HTMLElement | null

    if (dialog && !dialog.open) {
      dialog.showModal()
    }

    return () => {
      dialog?.close()
      // The dialog is unmounted to close it, so hand focus back to the control
      // that opened it (unless that control is gone, as after a delete).
      opener?.focus()
    }
  }, [])

  return (
    <dialog
      aria-labelledby="confirm-dialog-title"
      className="m-auto w-[min(92vw,26rem)] rounded-xl border border-line-strong bg-raised p-6 text-ink backdrop:bg-bg/80 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault()

        if (!isBusy) {
          onCancel()
        }
      }}
      ref={dialogRef}
    >
      <h2 className="m-0 font-display text-xl font-semibold" id="confirm-dialog-title">
        {title}
      </h2>
      <p className="mt-2 text-ink-2 [overflow-wrap:anywhere]">{message}</p>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <div className="mt-6 flex justify-end gap-2">
        <Button disabled={isBusy} onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button loading={isBusy} onClick={onConfirm} variant="danger">
          {isBusy ? 'Deleting…' : confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
