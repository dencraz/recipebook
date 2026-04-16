import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { AppLayout } from '../components/layout/AppLayout'
import { AuthPage } from '../pages/AuthPage'
import { HomePage } from '../pages/HomePage'
import { RecipeDetailPage } from '../pages/RecipeDetailPage'
import { RecipeFormPage } from '../pages/RecipeFormPage'
import { CategoriesPage } from '../pages/CategoriesPage'
import { FavoritesPage } from '../pages/FavoritesPage'
import { ReportsPage } from '../pages/ReportsPage'
import { MenuPlannerPage } from '../pages/MenuPlannerPage'
import { ProfilePage } from '../pages/ProfilePage'
import { NotFoundPage } from '../pages/NotFoundPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes/new" element={<RecipeFormPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/recipes/:id/edit" element={<RecipeFormPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/menu-planner" element={<MenuPlannerPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
