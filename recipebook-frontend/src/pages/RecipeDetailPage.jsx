import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, Clock, Pencil, Trash2, ChevronLeft } from 'lucide-react'
import { useRecipe, useDeleteRecipe } from '../hooks/useRecipes'
import { useFavorites, useAddFavorite, useRemoveFavorite } from '../hooks/useFavorites'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { PageSpinner } from '../components/ui/Spinner'
import { ConfirmModal } from '../components/ui/Modal'
import { formatCookTime, formatDifficulty } from '../utils/formatters'
import { getPhotoUrl } from '../utils/getPhotoUrl'
import { useState } from 'react'

const DIFFICULTY_COLORS = { easy: 'green', medium: 'orange', hard: 'red' }

export function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [showDelete, setShowDelete] = useState(false)

  const { data: recipe, isLoading } = useRecipe(id)
  const { data: favorites = [] } = useFavorites()
  const addFav = useAddFavorite()
  const removeFav = useRemoveFavorite()
  const deleteRecipe = useDeleteRecipe()

  const isFavorite = favorites.some((f) => f.recipe_id === recipe?.id)
  const isOwner = user && recipe && (user.id === recipe.owner_id)

  const handleToggleFavorite = () => {
    if (isFavorite) removeFav.mutate(recipe.id)
    else addFav.mutate(recipe.id)
  }

  const handleDelete = () => {
    deleteRecipe.mutate(recipe.id, {
      onSuccess: () => navigate('/my-recipes'),
    })
  }

  if (isLoading) return <PageSpinner />

  if (!recipe) return (
    <div className="p-4">
      <p className="text-stone-500">Рецепт не найден</p>
    </div>
  )

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
        <ChevronLeft size={18} />
        Назад
      </Button>

      {recipe.photo_url ? (
        <img
          src={getPhotoUrl(recipe.photo_url)}
          alt={recipe.title}
          className="w-full h-64 object-cover rounded-2xl mb-6"
        />
      ) : (
        <div className="w-full h-48 bg-stone-100 dark:bg-stone-700 rounded-2xl mb-6 flex items-center justify-center text-5xl">
          🍽️
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{recipe.title}</h1>
        <div className="flex gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
            <Heart
              size={20}
              className={isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-400'}
            />
          </Button>
          {isOwner && (
            <>
              <Button variant="ghost" size="icon" onClick={() => navigate(`/recipes/${id}/edit`)}>
                <Pencil size={18} className="text-stone-500" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowDelete(true)}>
                <Trash2 size={18} className="text-red-500" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {recipe.category_name && (
          <Badge color="orange">{recipe.category_name}</Badge>
        )}
        <Badge color="stone">
          <Clock size={12} className="mr-1" />
          {formatCookTime(recipe.cook_time)}
        </Badge>
        <Badge color={DIFFICULTY_COLORS[recipe.difficulty] ?? 'stone'}>
          {formatDifficulty(recipe.difficulty)}
        </Badge>
      </div>

      {recipe.description && (
        <p className="text-stone-600 dark:text-stone-400 mb-6">{recipe.description}</p>
      )}

      {recipe.ingredients?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-3">
            {t('recipe.ingredients')}
          </h2>
          <ul className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm divide-y divide-stone-100 dark:divide-stone-700">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-stone-700 dark:text-stone-300">{ing.name}</span>
                <span className="text-stone-500 dark:text-stone-400 font-medium">{ing.amount}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recipe.steps?.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-3">
            {t('recipe.steps')}
          </h2>
          <ol className="flex flex-col gap-3">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3 bg-white dark:bg-stone-800 rounded-2xl shadow-sm p-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title={t('recipe.confirmDelete')}
        description={t('recipe.deleteDesc')}
      />
    </div>
  )
}
