import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, ArrowUpDown } from 'lucide-react'
import {
  useFavoritesReport,
  useCategoriesReport,
  downloadFavoritesXlsx,
  downloadFavoritesPdf,
  downloadCategoriesXlsx,
  downloadCategoriesPdf,
} from '../hooks/useReports'
import { Button } from '../components/ui/Button'
import { PageSpinner } from '../components/ui/Spinner'
import { formatDate } from '../utils/formatters'

export function ReportsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('favorites')
  const [favSort, setFavSort] = useState('added_at')
  const [catSort, setCatSort] = useState('recipes_count')

  const { data: favData, isLoading: favLoading } = useFavoritesReport({ sort_by: favSort })
  const { data: catData, isLoading: catLoading } = useCategoriesReport({ sort_by: catSort })

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">{t('reports.title')}</h1>

      <div className="flex rounded-xl bg-stone-100 dark:bg-stone-700 p-1 mb-6 max-w-xs">
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'favorites'
              ? 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 shadow-sm'
              : 'text-stone-500'
          }`}
          onClick={() => setTab('favorites')}
        >
          {t('reports.favorites')}
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'categories'
              ? 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 shadow-sm'
              : 'text-stone-500'
          }`}
          onClick={() => setTab('categories')}
        >
          {t('reports.categories')}
        </button>
      </div>

      {tab === 'favorites' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-stone-500 dark:text-stone-400">
              {t('reports.total')}: <span className="font-semibold text-stone-800 dark:text-stone-100">{favData?.length ?? 0}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadFavoritesXlsx}>
                <Download size={14} />
                {t('reports.downloadXlsx')}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadFavoritesPdf}>
                <Download size={14} />
                {t('reports.downloadPdf')}
              </Button>
            </div>
          </div>

          {favLoading ? (
            <PageSpinner />
          ) : (
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-stone-700">
                    <th className="text-left px-4 py-3 text-stone-600 dark:text-stone-400 font-medium">
                      <button
                        className="flex items-center gap-1 hover:text-orange-500"
                        onClick={() => setFavSort('title')}
                      >
                        {t('reports.recipeName')}
                        <ArrowUpDown size={12} />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-stone-600 dark:text-stone-400 font-medium">
                      <button
                        className="flex items-center gap-1 hover:text-orange-500"
                        onClick={() => setFavSort('added_at')}
                      >
                        {t('reports.addedAt')}
                        <ArrowUpDown size={12} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {favData?.map((row, i) => (
                    <tr key={i} className="border-b border-stone-50 dark:border-stone-700/50 hover:bg-stone-50 dark:hover:bg-stone-700/30">
                      <td className="px-4 py-3 text-stone-800 dark:text-stone-100">{row.title ?? row.recipe_title ?? row.name}</td>
                      <td className="px-4 py-3 text-stone-500 dark:text-stone-400">
                        {row.added_at ? formatDate(row.added_at) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'categories' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-stone-500 dark:text-stone-400">
              {t('reports.total')}: <span className="font-semibold text-stone-800 dark:text-stone-100">{catData?.length ?? 0}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadCategoriesXlsx}>
                <Download size={14} />
                {t('reports.downloadXlsx')}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadCategoriesPdf}>
                <Download size={14} />
                {t('reports.downloadPdf')}
              </Button>
            </div>
          </div>

          {catLoading ? (
            <PageSpinner />
          ) : (
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-stone-700">
                    <th className="text-left px-4 py-3 text-stone-600 dark:text-stone-400 font-medium">
                      <button
                        className="flex items-center gap-1 hover:text-orange-500"
                        onClick={() => setCatSort('name')}
                      >
                        {t('reports.categoryName')}
                        <ArrowUpDown size={12} />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-stone-600 dark:text-stone-400 font-medium">
                      <button
                        className="flex items-center gap-1 hover:text-orange-500"
                        onClick={() => setCatSort('recipes_count')}
                      >
                        {t('reports.recipesCount')}
                        <ArrowUpDown size={12} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {catData?.map((row, i) => (
                    <tr key={i} className="border-b border-stone-50 dark:border-stone-700/50 hover:bg-stone-50 dark:hover:bg-stone-700/30">
                      <td className="px-4 py-3 text-stone-800 dark:text-stone-100">{row.name}</td>
                      <td className="px-4 py-3 text-stone-500 dark:text-stone-400">{row.recipes_count ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
