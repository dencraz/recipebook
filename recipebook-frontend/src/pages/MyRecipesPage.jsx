import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { useRecipes, useDeleteRecipe } from '../hooks/useRecipes'
import { useFavorites, useAddFavorite, useRemoveFavorite } from '../hooks/useFavorites'
import { useUiStore } from '../store/uiStore'
import { RecipeCard } from '../components/features/RecipeCard'
import { RecipeFilters } from '../components/features/RecipeFilters'
import { EmptyState } from '../components/features/EmptyState'
import { PageSpinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/Modal'

export function MyRecipesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { recipeView, setRecipeView } = useUiStore()
  const [filters, setFilters] = useState({})
  const [deleteId, setDeleteId] = useState(null)

  const { data: recipes = [], isLoading } = useRecipes(filters)
  const { data: favorites = [] } = useFavorites()
  const addFav = useAddFavorite()
  const removeFav = useRemoveFavorite()
  const deleteRecipe = useDeleteRecipe()

  const favoriteIds = new Set(favorites.map((f) => f.recipe_id))

  const handleToggleFavorite = (recipeId) => {
    if (favoriteIds.has(recipeId)) removeFav.mutate(recipeId)
    else addFav.mutate(recipeId)
  }

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteRecipe.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{t('nav.myRecipes')}</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant={recipeView === 'grid' ? 'primary' : 'ghost'}
              size="icon"
              onClick={() => setRecipeView('grid')}
            >
              <LayoutGrid size={18} />
            </Button>
            <Button
              variant={recipeView === 'list' ? 'primary' : 'ghost'}
              size="icon"
              onClick={() => setRecipeView('list')}
            >
              <List size={18} />
            </Button>
          </div>
          <Button onClick={() => navigate('/recipes/new')}>
            <Plus size={16} />
            {t('recipe.addRecipe')}
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <RecipeFilters filters={filters} onChange={setFilters} />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !recipes?.length ? (
        <EmptyState
          type="recipes"
          title={t('recipe.noRecipes')}
          description={t('recipe.noRecipesDesc')}
          action={
            <Button onClick={() => navigate('/recipes/new')}>
              <Plus size={16} />
              {t('recipe.addRecipe')}
            </Button>
          }
        />
      ) : recipeView === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={favoriteIds.has(recipe.id)}
              onToggleFavorite={handleToggleFavorite}
              onEdit={(id) => navigate(`/recipes/${id}/edit`)}
              onDelete={setDeleteId}
              showActions
              view="grid"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={favoriteIds.has(recipe.id)}
              onToggleFavorite={handleToggleFavorite}
              onEdit={(id) => navigate(`/recipes/${id}/edit`)}
              onDelete={setDeleteId}
              showActions
              view="list"
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title={t('recipe.confirmDelete')}
        description={t('recipe.deleteDesc')}
      />
    </div>
  )
}
