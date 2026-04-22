import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuPlanApi } from '../api/menuPlanApi'
import { useRecipes } from '../hooks/useRecipes'
import { downloadFile } from '../utils/downloadFile'
import { getWeekStart, formatDateISO } from '../utils/formatters'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { PageSpinner } from '../components/ui/Spinner'
import toast from 'react-hot-toast'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner']
const DAY_NAMES_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const DAY_NAMES_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function MenuPlannerPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [weekStart, setWeekStart] = useState(() => getWeekStart())
  const [showModal, setShowModal] = useState(false)
  const [activeSlot, setActiveSlot] = useState(null)
  const [search, setSearch] = useState('')

  const weekStartISO = formatDateISO(weekStart)
  const dayNames = i18n.language === 'ru' ? DAY_NAMES_RU : DAY_NAMES_EN

  const { data: plan, isLoading } = useQuery({
    queryKey: ['menu-plan', weekStartISO],
    queryFn: () => menuPlanApi.getWeek(weekStartISO),
  })

  const { data: recipes = [] } = useRecipes(search ? { search } : {})

  const setSlot = useMutation({
    mutationFn: menuPlanApi.setSlot,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-plan'] })
      setShowModal(false)
      setActiveSlot(null)
    },
    onError: (e) => toast.error(e.response?.data?.detail ?? 'Ошибка'),
  })

  const removeSlot = useMutation({
    mutationFn: menuPlanApi.removeSlot,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-plan'] }),
    onError: (e) => toast.error(e.response?.data?.detail ?? 'Ошибка'),
  })

  const handleDownloadShoppingList = async () => {
    try {
      await downloadFile(`/menu-plan/shopping-list/pdf?week_start=${weekStartISO}`, 'shopping-list.pdf')
    } catch (err) {
      toast.error(err?.message ?? 'Ошибка скачивания')
    }
  }

  const handleSelectRecipe = (recipe) => {
    if (!activeSlot) return
    setSlot.mutate({
      date: activeSlot.date,
      meal_type: activeSlot.mealType,
      recipe_id: recipe.id,
    })
  }

  const getSlot = (dayIndex, mealType) => {
    const date = formatDateISO(addDays(weekStart, dayIndex))
    return plan?.find((s) => (s.date?.slice(0, 10) ?? s.date) === date && s.meal_type === mealType)
  }

  const days = Array.from({ length: 7 }, (_, i) => ({
    index: i,
    date: formatDateISO(addDays(weekStart, i)),
    label: dayNames[i],
  }))

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{t('menuPlanner.title')}</h1>
        <Button variant="outline" size="sm" onClick={handleDownloadShoppingList}>
          <ShoppingCart size={16} />
          {t('menuPlanner.shoppingList')}
        </Button>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekStart((d) => addDays(d, -7))}
        >
          <ChevronLeft size={18} />
        </Button>
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {weekStartISO} — {formatDateISO(addDays(weekStart, 6))}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekStart((d) => addDays(d, 7))}
        >
          <ChevronRight size={18} />
        </Button>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="w-20 py-2 text-left text-sm font-medium text-stone-500 dark:text-stone-400" />
                {days.map((day) => (
                  <th key={day.index} className="py-2 text-sm font-semibold text-stone-700 dark:text-stone-300 text-center">
                    {day.label}
                    <div className="text-xs text-stone-400 font-normal">{day.date.slice(5)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEAL_TYPES.map((mealType) => (
                <tr key={mealType}>
                  <td className="py-2 pr-3 text-sm font-medium text-stone-600 dark:text-stone-400">
                    {t(`menuPlanner.${mealType}`)}
                  </td>
                  {days.map((day) => {
                    const slot = getSlot(day.index, mealType)
                    return (
                      <td key={day.index} className="py-1 px-1">
                        {slot ? (
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-2 text-xs text-center relative group">
                            <span className="text-stone-700 dark:text-stone-300 line-clamp-2">
                              {slot.recipe_title ?? slot.recipe?.title ?? '—'}
                            </span>
                            <button
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                              onClick={() => removeSlot.mutate(slot.id)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            className="w-full h-12 flex items-center justify-center rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-700 text-stone-300 dark:text-stone-600 hover:border-orange-300 hover:text-orange-400 transition-colors"
                            onClick={() => {
                              setActiveSlot({ date: day.date, mealType })
                              setSearch('')
                              setShowModal(true)
                            }}
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={t('menuPlanner.addRecipe')}
      >
        <input
          type="text"
          placeholder={t('menuPlanner.searchRecipe')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
        />
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {recipes?.map((recipe) => (
            <button
              key={recipe.id}
              className="text-left px-3 py-2 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 text-stone-700 dark:text-stone-300 text-sm transition-colors"
              onClick={() => handleSelectRecipe(recipe)}
            >
              {recipe.title}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
