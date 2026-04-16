import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Tag, Heart, User } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', icon: Home, key: 'myRecipes' },
  { path: '/categories', icon: Tag, key: 'categories' },
  { path: '/favorites', icon: Heart, key: 'favorites' },
  { path: '/profile', icon: User, key: 'profile' },
]

export function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 flex z-40">
      {NAV_ITEMS.map(({ path, icon: Icon, key }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 text-xs transition-colors ${
              isActive
                ? 'text-orange-500 dark:text-orange-400'
                : 'text-stone-500 dark:text-stone-400'
            }`
          }
        >
          <Icon size={20} />
          <span className="mt-0.5">{t(`nav.${key}`)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
