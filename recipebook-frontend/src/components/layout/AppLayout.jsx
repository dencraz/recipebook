import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-amber-50 dark:bg-stone-900">
      <Sidebar />
      <main className="flex-1 pb-20 lg:pb-0 min-w-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
