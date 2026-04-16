import { useNavigate } from 'react-router-dom'
import { Heart, Clock, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { CategoryBadge } from './CategoryBadge'
import { formatCookTime, formatDifficulty } from '../../utils/formatters'
import { getPhotoUrl } from '../../utils/getPhotoUrl'

const DIFFICULTY_COLORS = { easy: 'green', medium: 'orange', hard: 'red' }

export function RecipeCard({
  recipe,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
  showActions = false,
  view = 'grid',
}) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleClick = () => navigate(`/recipes/${recipe.id}`)

  if (view === 'list') {
    return (
      <Card className="flex items-center gap-4 p-3">
        <div
          className="w-20 h-16 rounded-xl bg-stone-100 dark:bg-stone-700 flex-shrink-0 overflow-hidden cursor-pointer"
          onClick={handleClick}
        >
          {recipe.photo_url ? (
            <img src={getPhotoUrl(recipe.photo_url)} alt={recipe.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
          )}
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
          <h3 className="font-semibold text-stone-800 dark:text-stone-100 truncate">{recipe.title}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {recipe.category_name && <CategoryBadge name={recipe.category_name} />}
            <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
              <Clock size={12} />
              {formatCookTime(recipe.cook_time)}
            </span>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              {formatDifficulty(recipe.difficulty)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(recipe.id) }}
          >
            <Heart
              size={16}
              className={isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-400'}
            />
          </Button>
          {showActions && (
            <>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit?.(recipe.id) }}>
                <Pencil size={16} className="text-stone-400" />
              </Button>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete?.(recipe.id) }}>
                <Trash2 size={16} className="text-red-400" />
              </Button>
            </>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div
        className="aspect-[4/3] bg-stone-100 dark:bg-stone-700 overflow-hidden cursor-pointer"
        onClick={handleClick}
      >
        {recipe.photo_url ? (
          <img src={getPhotoUrl(recipe.photo_url)} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-semibold text-stone-800 dark:text-stone-100 line-clamp-2 cursor-pointer hover:text-orange-500 transition-colors"
            onClick={handleClick}
          >
            {recipe.title}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 -mr-1 -mt-1"
            onClick={() => onToggleFavorite?.(recipe.id)}
          >
            <Heart
              size={18}
              className={isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-400'}
            />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {recipe.category_name && <CategoryBadge name={recipe.category_name} />}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatCookTime(recipe.cook_time)}
          </span>
          <span className="text-stone-500 dark:text-stone-400">{formatDifficulty(recipe.difficulty)}</span>
        </div>
        {showActions && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-stone-700">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onEdit?.(recipe.id)}
            >
              <Pencil size={14} />
              {t('recipe.edit')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={() => onDelete?.(recipe.id)}
            >
              <Trash2 size={14} />
              {t('recipe.delete')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
