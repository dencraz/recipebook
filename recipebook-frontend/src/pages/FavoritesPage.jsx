import { useTranslation } from 'react-i18next'
import { LayoutGrid, List } from 'lucide-react'
import { useFavorites, useRemoveFavorite } from '../hooks/useFavorites'
import { useUiStore } from '../store/uiStore'
import { RecipeCard } from '../components/features/RecipeCard'
import { EmptyState } from '../components/features/EmptyState'
import { PageSpinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'

export function FavoritesPage() {
  const { t } = useTranslation()
  const { recipeView, setRecipeView } = useUiStore()
  const { data: favorites = [], isLoading } = useFavorites()
  const removeFav = useRemoveFavorite()

  const recipes = favorites?.map((f) => f.recipe ?? f) ?? []

  if (isLoading) return <PageSpinner />

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{t('favorites.title')}</h1>
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
      </div>

      {!recipes.length ? (
        <EmptyState
          type="favorites"
          title={t('favorites.noFavorites')}
          description={t('favorites.noFavoritesDesc')}
        />
      ) : recipeView === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={true}
              onToggleFavorite={() => removeFav.mutate(recipe.id)}
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
              isFavorite={true}
              onToggleFavorite={() => removeFav.mutate(recipe.id)}
              view="list"
            />
          ))}
        </div>
      )}
    </div>
  )
}
