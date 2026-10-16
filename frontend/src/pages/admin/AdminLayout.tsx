import { NavLink, Outlet } from 'react-router-dom'

import { Page, PageHeader } from '../../components/ui/Page'

function tabClass({ isActive }: { isActive: boolean }) {
  return `-mb-px border-b-2 px-1 pb-3 text-sm font-medium no-underline transition-colors duration-150 ${
    isActive
      ? 'border-accent-ink text-ink'
      : 'border-transparent text-ink-3 hover:text-ink'
  }`
}

export function AdminLayout() {
  return (
    <Page wide>
      <PageHeader
        description="Manage categories and see how Retain is being used."
        title="Admin"
      />
      <nav
        aria-label="Admin sections"
        className="mb-8 flex gap-6 border-b border-line"
      >
        <NavLink className={tabClass} end to="/admin">
          Insights
        </NavLink>
        <NavLink className={tabClass} to="/admin/categories">
          Categories
        </NavLink>
      </nav>
      <Outlet />
    </Page>
  )
}
