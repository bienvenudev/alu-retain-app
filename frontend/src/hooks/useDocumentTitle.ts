import { useEffect } from 'react'

// Sets the browser tab (and screen reader) title for the current screen.
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} - Retain`

    return () => {
      document.title = 'Retain'
    }
  }, [title])
}
