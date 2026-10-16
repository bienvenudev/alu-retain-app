import { NavLink, Outlet } from 'react-router-dom'

import { PageCard, PageHeader } from '../../components/ui/PageCard'

function tabClass({ isActive }: { isActive: boolean }) {
  return `rounded-lg px-3 py-2 text-sm font-bold no-underline ${
    isActive
      ? 'bg-indigo-700 text-white'
      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
  }`
}

export function AdminLayout() {
  return (
    <PageCard wide>
      <PageHeader eyebrow="Administration" title="Admin" />
      <nav aria-label="Admin sections" className="mt-5 flex flex-wrap gap-2">
        <NavLink className={tabClass} end to="/admin">
          Insights
        </NavLink>
        <NavLink className={tabClass} to="/admin/categories">
          Categories
        </NavLink>
      </nav>
      <div className="mt-6">
        <Outlet />
      </div>
    </PageCard>
  )
}
