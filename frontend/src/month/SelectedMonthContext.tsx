import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

interface SelectedMonth {
  month: number // 1-12
  year: number
}

interface SelectedMonthContextValue extends SelectedMonth {
  setMonth: (selected: SelectedMonth) => void
  shiftMonth: (delta: number) => void
}

const SelectedMonthContext = createContext<
  SelectedMonthContextValue | undefined
>(undefined)

function currentMonth(): SelectedMonth {
  const now = new Date()

  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

// Keeps the dashboard and budget pages on the same month.
export function SelectedMonthProvider({ children }: PropsWithChildren) {
  const [selected, setSelected] = useState<SelectedMonth>(currentMonth)

  const shiftMonth = useCallback((delta: number) => {
    setSelected(({ month, year }) => {
      const shifted = new Date(year, month - 1 + delta, 1)

      return { month: shifted.getMonth() + 1, year: shifted.getFullYear() }
    })
  }, [])

  const value = useMemo<SelectedMonthContextValue>(
    () => ({ ...selected, setMonth: setSelected, shiftMonth }),
    [selected, shiftMonth],
  )

  return (
    <SelectedMonthContext.Provider value={value}>
      {children}
    </SelectedMonthContext.Provider>
  )
}

export function useSelectedMonth(): SelectedMonthContextValue {
  const context = useContext(SelectedMonthContext)

  if (!context) {
    throw new Error('useSelectedMonth must be used inside SelectedMonthProvider')
  }

  return context
}
