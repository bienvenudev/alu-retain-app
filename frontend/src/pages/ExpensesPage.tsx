import { ExpenseList } from '../components/expenses/ExpenseList'
import { useExpenses } from '../hooks/useExpenses'

export function ExpensesPage() {
  const { reload, state } = useExpenses()

  return (
    <section className="page-card">
      <p className="eyebrow">Retain</p>
      <h1>Expenses</h1>

      {state.status === 'loading' && (
        <p aria-live="polite" role="status">
          Loading expenses…
        </p>
      )}

      {state.status === 'error' && (
        <div className="form-error" role="alert">
          <p>{state.message}</p>
          <button onClick={reload} type="button">
            Try again
          </button>
        </div>
      )}

      {state.status === 'success' && state.expenses.length === 0 && (
        <p>You have no expenses yet. Add your first one to get started.</p>
      )}

      {state.status === 'success' && state.expenses.length > 0 && (
        <ExpenseList expenses={state.expenses} />
      )}
    </section>
  )
}
