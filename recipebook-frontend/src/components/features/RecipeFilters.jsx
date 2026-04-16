import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Input, Select } from '../ui/Input'
import { useCategories } from '../../hooks/useCategories'

export function RecipeFilters({ filters, onChange }) {
  const { t } = useTranslation()
  const { data: categories = [] } = useCategories()

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-48">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder={t('recipe.searchPlaceholder')}
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
        />
      </div>
      <select
        value={filters.category_id ?? ''}
        onChange={(e) =>
          onChange({ ...filters, category_id: e.target.value || undefined })
        }
        className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        <option value="">{t('recipe.allCategories')}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select
        value={filters.difficulty ?? ''}
        onChange={(e) =>
          onChange({ ...filters, difficulty: e.target.value || undefined })
        }
        className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        <option value="">{t('recipe.allDifficulties')}</option>
        <option value="easy">{t('recipe.easy')}</option>
        <option value="medium">{t('recipe.medium')}</option>
        <option value="hard">{t('recipe.hard')}</option>
      </select>
      <input
        type="number"
        placeholder={t('recipe.filterMaxTime')}
        value={filters.max_time ?? ''}
        onChange={(e) =>
          onChange({ ...filters, max_time: e.target.value || undefined })
        }
        className="w-36 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-stone-400"
        min={1}
      />
    </div>
  )
}
