import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Если пользователь ещё не выбирал тему вручную — читаем системную
function getInitialTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export const useUiStore = create(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      language: 'ru',
      recipeView: 'grid',

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setRecipeView: (view) => set({ recipeView: view }),
    }),
    {
      name: 'ui-storage',
      // Восстанавливаем только сохранённые поля, НЕ перезаписываем тему при первом визите
      merge: (persisted, current) => {
        // Если в localStorage уже есть сохранённая тема — используем её
        // Иначе оставляем системную (getInitialTheme), которая уже в current
        return {
          ...current,
          ...persisted,
          // Если тема ещё не сохранялась (null/undefined) — берём системную
          theme: persisted?.theme ?? current.theme,
        }
      },
    }
  )
)
