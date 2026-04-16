import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useUiStore } from './store/uiStore'
import { AppRouter } from './router/index'
import { ErrorBoundary } from './components/ErrorBoundary'
import './i18n'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
    },
  },
})

function ThemeSync() {
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const stored = JSON.parse(localStorage.getItem('ui-storage') ?? '{}')
    if (stored?.state?.theme) return
    const handler = (e) => setTheme(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setTheme])

  return null
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeSync />
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
          <Toaster
            position="top-right"
            toastOptions={{ duration: 3000 }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
