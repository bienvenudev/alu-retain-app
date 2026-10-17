import {
  LayoutDashboard,
  LogOut,
  Receipt,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom'

import { AuthForm } from './auth/AuthForm'
import { useAuth } from './auth/AuthContext'
import { AdminRoute, ProtectedRoute } from './auth/ProtectedRoute'
import { ServerWakingNotice } from './components/ServerWakingNotice'
import { Button } from './components/ui/Button'
import { Page, PageHeader } from './components/ui/Page'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminInsightsPage } from './pages/admin/AdminInsightsPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { BudgetPage } from './pages/BudgetPage'
import { DashboardPage } from './pages/DashboardPage'
import { EditExpensePage, NewExpensePage } from './pages/ExpenseFormPages'
import { ExpensesPage } from './pages/ExpensesPage'
import { useDocumentTitle } from './hooks/useDocumentTitle'
import { resetFilters } from './store/expenseFiltersSlice'
import { useAppDispatch } from './store/hooks'

const navItems = [
  { adminOnly: false, icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { adminOnly: false, icon: Receipt, label: 'Expenses', to: '/expenses' },
  { adminOnly: false, icon: Wallet, label: 'Budget', to: '/budget' },
  { adminOnly: true, icon: ShieldCheck, label: 'Admin', to: '/admin' },
]

function Brand() {
  return (
    <Link
      className="flex items-center gap-2.5 font-display text-xl font-semibold text-ink no-underline"
      to="/dashboard"
    >
      <span
        aria-hidden="true"
        className="grid grid-cols-1 size-8 place-items-center rounded-lg bg-accent text-base font-bold text-on-accent"
      >
        R
      </span>
      Retain
    </Link>
  )
}

function sidebarLinkClass({ isActive }: { isActive: boolean }) {
  return `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium no-underline transition-colors duration-150 ${
    isActive
      ? 'bg-raised text-ink'
      : 'text-ink-2 hover:bg-raised/60 hover:text-ink'
  }`
}

function tabLinkClass({ isActive }: { isActive: boolean }) {
  return `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium no-underline transition-colors duration-150 ${
    isActive ? 'text-accent-ink' : 'text-ink-3 hover:text-ink'
  }`
}

function AppLayout() {
  const { signOut, user } = useAuth()
  const dispatch = useAppDispatch()
  const items = navItems.filter((item) => !item.adminOnly || user?.role === 'admin')

  function handleSignOut() {
    dispatch(resetFilters())
    signOut()
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
        href="#main"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-surface px-3 py-5 lg:flex">
        <div className="px-3">
          <Brand />
        </div>
        <nav aria-label="Main navigation" className="mt-8 grid grid-cols-1 gap-1">
          {items.map(({ icon: Icon, label, to }) => (
            <NavLink className={sidebarLinkClass} key={to} to={to}>
              <Icon aria-hidden="true" className="size-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-line px-3 pt-4">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-ink-3">{user?.email}</p>
          <div className="mt-3 grid grid-cols-1">
            <Button onClick={handleSignOut} size="sm" variant="ghost">
              <LogOut aria-hidden="true" className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur lg:hidden">
        <Brand />
        <Button
          aria-label="Sign out"
          onClick={handleSignOut}
          size="sm"
          variant="ghost"
        >
          <LogOut aria-hidden="true" className="size-[18px]" />
        </Button>
      </header>

      <main
        className="flex justify-center px-4 pt-6 pb-28 sm:px-8 lg:px-12 lg:py-10"
        id="main"
      >
        <Outlet />
      </main>

      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {items.map(({ icon: Icon, label, to }) => (
          <NavLink className={tabLinkClass} key={to} to={to}>
            <Icon aria-hidden="true" className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function SignInPage() {
  return <AuthForm mode="signin" />
}

function SignUpPage() {
  return <AuthForm mode="signup" />
}

function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <main className="flex min-h-screen justify-center p-6 pt-24">
      <Page>
        <PageHeader
          description="The page you requested does not exist."
          title="Page not found"
        />
        <Link className="font-medium text-accent-ink" to="/dashboard">
          Back to your dashboard
        </Link>
      </Page>
    </main>
  )
}

export function App() {
  return (
    <>
      <ServerWakingNotice />
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
    </>
  )
}
