import { CircleCheck, CircleAlert, X } from 'lucide-react'
import type { PropsWithChildren } from 'react'

type Tone = 'error' | 'success'

const toneClasses: Record<Tone, string> = {
  error: 'border-bad/30 bg-bad/10 text-bad',
  success: 'border-ok/30 bg-ok/10 text-ok',
}

// A short message after an action. Success announces politely, errors assert.
export function Notice({
  children,
  onDismiss,
  tone = 'success',
}: PropsWithChildren<{ onDismiss?: () => void; tone?: Tone }>) {
  const Icon = tone === 'success' ? CircleCheck : CircleAlert

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm font-medium ${toneClasses[tone]}`}
      role={tone === 'success' ? 'status' : 'alert'}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span className="flex-1 [overflow-wrap:anywhere]">{children}</span>
      {onDismiss && (
        <button
          aria-label="Dismiss message"
          className="-m-1.5 cursor-pointer rounded-md p-1.5 opacity-80 transition-opacity hover:opacity-100"
          onClick={onDismiss}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  )
}
