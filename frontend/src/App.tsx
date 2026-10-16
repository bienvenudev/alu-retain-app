import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom'

import { AuthForm } from './auth/AuthForm'
import { useAuth } from './auth/AuthContext'
import { AdminRoute, ProtectedRoute } from './auth/ProtectedRoute'
import { Button } from './components/ui/Button'
import { PageCard, PageHeader } from './components/ui/PageCard'
import { BudgetPage } from './pages/BudgetPage'
import { DashboardPage } from './pages/DashboardPage'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminInsightsPage } from './pages/admin/AdminInsightsPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { EditExpensePage, NewExpensePage } from './pages/ExpenseFormPages'
import { ExpensesPage } from './pages/ExpensesPage'
import { resetFilters } from './store/expenseFiltersSlice'
import { useAppDispatch } from './store/hooks'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `rounded-lg px-3 py-2 text-sm no-underline ${
    isActive
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
  }`
}

function AppLayout() {
  const { signOut, user } = useAuth()
  const dispatch = useAppDispatch()

  return (
    <div className="min-h-screen">
      <header className="flex flex-col items-start gap-4 border-b border-slate-200 bg-white px-[clamp(1rem,5vw,4rem)] py-4 sm:flex-row sm:items-center">
        <Link
          className="text-xl font-extrabold text-slate-900 no-underline"
          to="/dashboard"
        >
          Retain
        </Link>
        <nav
          aria-label="Main navigation"
          className="flex flex-wrap gap-2 sm:ml-auto"
        >
          <NavLink className={navLinkClass} to="/dashboard">
            Dashboard
          </NavLink>
          <NavLink className={navLinkClass} to="/expenses">
            Expenses
          </NavLink>
          <NavLink className={navLinkClass} to="/budget">
            Budget
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink className={navLinkClass} to="/admin">
              Admin
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-3 text-sm text-slate-500 sm:ml-4">
          <span>{user?.name}</span>
          <Button
            onClick={() => {
              dispatch(resetFilters())
              signOut()
            }}
            size="sm"
            variant="secondary"
          >
            Sign out
          </Button>
        </div>
      </header>
      <main className="grid min-h-[calc(100vh-8rem)] place-items-center p-6 sm:min-h-[calc(100vh-4.5rem)]">
        <Outlet />
      </main>
    </div>
  )
}

function PagePlaceholder({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <PageCard>
      <PageHeader title={title} />
      <p className="mt-5 leading-relaxed text-slate-600">{description}</p>
    </PageCard>
  )
}

function SignInPage() {
  return <AuthForm mode="signin" />
}

function SignUpPage() {
  return <AuthForm mode="signup" />
}

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <PageCard>
        <PageHeader eyebrow="404" title="Page not found" />
        <p className="mt-5 text-slate-600">
          The page you requested does not exist.
        </p>
        <Link
          className="mt-6 inline-block font-bold text-indigo-700"
          to="/dashboard"
        >
          Return to dashboard
        </Link>
      </PageCard>
    </main>
  )
}

export function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />} path="/">
          <Route element={<DashboardPage />} index />
          <Route element={<DashboardPage />} path="dashboard" />
          <Route element={<ExpensesPage />} path="expenses" />
          <Route element={<NewExpensePage />} path="expenses/new" />
          <Route element={<EditExpensePage />} path="expenses/:id/edit" />
          <Route element={<BudgetPage />} path="budget" />
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />} path="admin">
              <Route element={<AdminInsightsPage />} index />
              <Route element={<AdminCategoriesPage />} path="categories" />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route element={<SignInPage />} path="/signin" />
      <Route element={<SignUpPage />} path="/signup" />
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  )
}
