import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom'

import { AuthForm } from './auth/AuthForm'
import { useAuth } from './auth/AuthContext'
import { AdminRoute, ProtectedRoute } from './auth/ProtectedRoute'

function AppLayout() {
  const { signOut, user } = useAuth()

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link className="brand" to="/dashboard">
          Retain
        </Link>
        <nav aria-label="Main navigation" className="main-nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/expenses">Expenses</NavLink>
          <NavLink to="/budget">Budget</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
        <div className="session-controls">
          <span>{user?.name}</span>
          <button onClick={signOut} type="button">
            Sign out
          </button>
        </div>
      </header>
      <main className="page-content">
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
    <section className="page-card">
      <p className="eyebrow">Retain</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  )
}

function DashboardPage() {
  return (
    <PagePlaceholder
      description="Your monthly spending summary and recent expenses will appear here."
      title="Dashboard"
    />
  )
}

function ExpensesPage() {
  return (
    <PagePlaceholder
      description="Create, view, edit, and delete your personal expenses here."
      title="Expenses"
    />
  )
}

function BudgetPage() {
  return (
    <PagePlaceholder
      description="Set a monthly budget and track whether your spending is within, approaching, or over budget."
      title="Budget"
    />
  )
}

function AdminPage() {
  return (
    <PagePlaceholder
      description="Category management and platform insights will be available to administrators here."
      title="Admin"
    />
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
    <section className="page-card">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link className="text-link" to="/dashboard">
        Return to dashboard
      </Link>
    </section>
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
          <Route element={<BudgetPage />} path="budget" />
          <Route element={<AdminRoute />}>
            <Route element={<AdminPage />} path="admin" />
          </Route>
        </Route>
      </Route>
      <Route element={<SignInPage />} path="/signin" />
      <Route element={<SignUpPage />} path="/signup" />
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  )
}
