import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home } from 'lucide-react'
import { Button } from '../components/ui/Button'

function Illustration404() {
  return (
    <svg width="280" height="200" viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Тень */}
      <ellipse cx="140" cy="185" rx="90" ry="10" fill="currentColor" className="text-stone-200 dark:text-stone-700" />

      {/* Цифра 4 левая */}
      <path d="M30 60 L30 120 L75 120 L75 140 L95 140 L95 120 L110 120 L110 100 L95 100 L95 60Z"
        fill="currentColor" className="text-orange-100 dark:text-orange-900/40"
        stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <line x1="30" y1="100" x2="95" y2="100" stroke="currentColor" strokeWidth="3" className="text-orange-300 dark:text-orange-600" />

      {/* Цифра 0 центр */}
      <ellipse cx="150" cy="100" rx="38" ry="42"
        fill="currentColor" className="text-amber-100 dark:text-amber-900/40"
        stroke="currentColor" strokeWidth="3" />
      <ellipse cx="150" cy="100" rx="22" ry="26"
        fill="currentColor" className="text-amber-50 dark:text-stone-900" />
      {/* Лицо внутри нуля */}
      <circle cx="143" cy="94" r="3" fill="currentColor" className="text-amber-400 dark:text-amber-500" />
      <circle cx="157" cy="94" r="3" fill="currentColor" className="text-amber-400 dark:text-amber-500" />
      <path d="M143 106 Q150 112 157 106" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-amber-400 dark:text-amber-500" fill="none" />

      {/* Цифра 4 правая */}
      <path d="M185 60 L185 120 L230 120 L230 140 L250 140 L250 120 L265 120 L265 100 L250 100 L250 60Z"
        fill="currentColor" className="text-orange-100 dark:text-orange-900/40"
        stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <line x1="185" y1="100" x2="250" y2="100" stroke="currentColor" strokeWidth="3" className="text-orange-300 dark:text-orange-600" />

      {/* Звёздочки */}
      <circle cx="20" cy="40" r="4" fill="currentColor" className="text-orange-300 dark:text-orange-600" />
      <circle cx="140" cy="22" r="3" fill="currentColor" className="text-amber-300 dark:text-amber-600" />
      <circle cx="265" cy="45" r="4" fill="currentColor" className="text-rose-300 dark:text-rose-600" />
      <circle cx="30" cy="155" r="2.5" fill="currentColor" className="text-orange-200 dark:text-orange-700" />
      <circle cx="255" cy="155" r="2.5" fill="currentColor" className="text-amber-200 dark:text-amber-700" />

      {/* Кометки */}
      <line x1="50" y1="25" x2="70" y2="35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-orange-200 dark:text-orange-700" />
      <line x1="220" y1="28" x2="240" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-amber-200 dark:text-amber-700" />
    </svg>
  )
}

export function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-stone-900 flex items-center justify-center p-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="mb-6">
          <Illustration404 />
        </div>

        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-3">
          {t('notFound.title')}
        </h1>
        <p className="text-stone-500 dark:text-stone-400 mb-8 leading-relaxed">
          {t('notFound.description')}
        </p>

        <Button size="lg" onClick={() => navigate('/')}>
          <Home size={18} />
          {t('notFound.goHome')}
        </Button>
      </div>
    </div>
  )
}
