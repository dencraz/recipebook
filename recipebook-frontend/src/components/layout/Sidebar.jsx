import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Home,
  Tag,
  Heart,
  BarChart2,
  CalendarDays,
  User,
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', icon: Home, key: 'myRecipes' },
  { path: '/categories', icon: Tag, key: 'categories' },
  { path: '/favorites', icon: Heart, key: 'favorites' },
  { path: '/reports', icon: BarChart2, key: 'reports' },
  { path: '/menu-planner', icon: CalendarDays, key: 'menuPlanner' },
  { path: '/profile', icon: User, key: 'profile' },
]

export function Sidebar() {
  const { t } = useTranslation()

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-700 py-6 px-3 flex-shrink-0">
      <div className="mb-8 px-3">
        <h1 className="text-xl font-bold text-orange-500">RecipeBook</h1>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ path, icon: Icon, key }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                  : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800'
              }`
            }
          >
            <Icon size={18} />
            {t(`nav.${key}`)}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
