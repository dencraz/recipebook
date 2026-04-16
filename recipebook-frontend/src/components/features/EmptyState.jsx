// SVG-иллюстрации для разных пустых состояний
function IllustrationRecipes() {
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="80" cy="120" rx="60" ry="12" fill="currentColor" className="text-stone-200 dark:text-stone-700" />
      {/* Тарелка */}
      <ellipse cx="80" cy="75" rx="52" ry="14" fill="currentColor" className="text-stone-300 dark:text-stone-600" />
      <ellipse cx="80" cy="75" rx="40" ry="10" fill="currentColor" className="text-white dark:text-stone-800" />
      {/* Купол крышки */}
      <path d="M40 75 Q40 38 80 38 Q120 38 120 75Z" fill="currentColor" className="text-orange-100 dark:text-orange-900/40" />
      <path d="M40 75 Q40 38 80 38 Q120 38 120 75" stroke="currentColor" strokeWidth="2" className="text-orange-300 dark:text-orange-600" fill="none" />
      {/* Ручка крышки */}
      <rect x="74" y="30" width="12" height="10" rx="5" fill="currentColor" className="text-orange-400 dark:text-orange-500" />
      {/* Вилка */}
      <rect x="24" y="50" width="3" height="40" rx="1.5" fill="currentColor" className="text-stone-400 dark:text-stone-500" />
      <rect x="22" y="50" width="1.5" height="12" rx="0.75" fill="currentColor" className="text-stone-400 dark:text-stone-500" />
      <rect x="26.5" y="50" width="1.5" height="12" rx="0.75" fill="currentColor" className="text-stone-400 dark:text-stone-500" />
      {/* Нож */}
      <rect x="134" y="50" width="3" height="40" rx="1.5" fill="currentColor" className="text-stone-400 dark:text-stone-500" />
      <path d="M134 50 Q137 55 137 62 L134 62Z" fill="currentColor" className="text-stone-400 dark:text-stone-500" />
      {/* Звёздочки */}
      <circle cx="58" cy="25" r="3" fill="currentColor" className="text-orange-300 dark:text-orange-600" />
      <circle cx="105" cy="20" r="2" fill="currentColor" className="text-amber-300 dark:text-amber-600" />
      <circle cx="130" cy="35" r="2.5" fill="currentColor" className="text-orange-200 dark:text-orange-700" />
    </svg>
  )
}

function IllustrationFavorites() {
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="80" cy="122" rx="55" ry="10" fill="currentColor" className="text-stone-200 dark:text-stone-700" />
      {/* Сердце большое */}
      <path d="M80 105 C80 105 30 72 30 48 C30 34 42 26 55 30 C64 33 72 40 80 50 C88 40 96 33 105 30 C118 26 130 34 130 48 C130 72 80 105 80 105Z"
        fill="currentColor" className="text-rose-200 dark:text-rose-900/50" />
      <path d="M80 105 C80 105 30 72 30 48 C30 34 42 26 55 30 C64 33 72 40 80 50 C88 40 96 33 105 30 C118 26 130 34 130 48 C130 72 80 105 80 105Z"
        stroke="currentColor" strokeWidth="2.5" className="text-rose-400 dark:text-rose-500" fill="none" />
      {/* Маленькие сердечки */}
      <path d="M35 25 C35 25 25 18 25 12 C25 8 29 6 32 8 C33.5 8.8 34.5 10 35 11.5 C35.5 10 36.5 8.8 38 8 C41 6 45 8 45 12 C45 18 35 25 35 25Z"
        fill="currentColor" className="text-pink-300 dark:text-pink-600" />
      <path d="M125 30 C125 30 118 24 118 19 C118 16 121 14 123.5 15.5 C124.5 16 125.2 17 125 18 C124.8 17 125.5 16 126.5 15.5 C129 14 132 16 132 19 C132 24 125 30 125 30Z"
        fill="currentColor" className="text-rose-300 dark:text-rose-600" />
      {/* Блеск */}
      <circle cx="60" cy="45" r="5" fill="white" opacity="0.5" />
      <circle cx="55" cy="40" r="2.5" fill="white" opacity="0.4" />
    </svg>
  )
}

function IllustrationCategories() {
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="80" cy="122" rx="55" ry="10" fill="currentColor" className="text-stone-200 dark:text-stone-700" />
      {/* Папки */}
      <rect x="55" y="60" width="70" height="50" rx="6" fill="currentColor" className="text-amber-100 dark:text-amber-900/40" />
      <rect x="55" y="60" width="70" height="50" rx="6" stroke="currentColor" strokeWidth="1.5" className="text-amber-300 dark:text-amber-600" fill="none" />
      <path d="M55 72 L125 72" stroke="currentColor" strokeWidth="1.5" className="text-amber-300 dark:text-amber-600" />
      <path d="M55 68 L75 68 L80 60 L55 60Z" fill="currentColor" className="text-amber-200 dark:text-amber-800/60" />

      <rect x="40" y="65" width="65" height="48" rx="6" fill="currentColor" className="text-orange-100 dark:text-orange-900/40" />
      <rect x="40" y="65" width="65" height="48" rx="6" stroke="currentColor" strokeWidth="1.5" className="text-orange-300 dark:text-orange-600" fill="none" />
      <path d="M40 77 L105 77" stroke="currentColor" strokeWidth="1.5" className="text-orange-300 dark:text-orange-600" />
      <path d="M40 73 L60 73 L65 65 L40 65Z" fill="currentColor" className="text-orange-200 dark:text-orange-800/60" />

      <rect x="28" y="70" width="60" height="45" rx="6" fill="currentColor" className="text-rose-100 dark:text-rose-900/40" />
      <rect x="28" y="70" width="60" height="45" rx="6" stroke="currentColor" strokeWidth="1.5" className="text-rose-300 dark:text-rose-600" fill="none" />
      <path d="M28 82 L88 82" stroke="currentColor" strokeWidth="1.5" className="text-rose-300 dark:text-rose-600" />
      <path d="M28 78 L48 78 L53 70 L28 70Z" fill="currentColor" className="text-rose-200 dark:text-rose-800/60" />

      {/* Плюс */}
      <circle cx="110" cy="42" r="18" fill="currentColor" className="text-orange-500" />
      <rect x="109" y="32" width="2" height="20" rx="1" fill="white" />
      <rect x="100" y="41" width="20" height="2" rx="1" fill="white" />
    </svg>
  )
}

function IllustrationSearch() {
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="80" cy="122" rx="55" ry="10" fill="currentColor" className="text-stone-200 dark:text-stone-700" />
      {/* Лупа */}
      <circle cx="70" cy="65" r="32" fill="currentColor" className="text-stone-100 dark:text-stone-700" />
      <circle cx="70" cy="65" r="32" stroke="currentColor" strokeWidth="5" className="text-stone-300 dark:text-stone-500" fill="none" />
      <circle cx="70" cy="65" r="24" fill="currentColor" className="text-white dark:text-stone-800" />
      {/* Ручка лупы */}
      <line x1="94" y1="89" x2="118" y2="113" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-stone-400 dark:text-stone-500" />
      {/* Вопросительный знак внутри */}
      <text x="62" y="78" fontFamily="system-ui" fontSize="28" fontWeight="bold" fill="currentColor" className="text-stone-300 dark:text-stone-600">?</text>
    </svg>
  )
}

const ILLUSTRATIONS = {
  recipes: IllustrationRecipes,
  favorites: IllustrationFavorites,
  categories: IllustrationCategories,
  search: IllustrationSearch,
}

export function EmptyState({ type = 'recipes', title, description, action }) {
  const Illustration = ILLUSTRATIONS[type] ?? ILLUSTRATIONS.recipes
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div className="mb-5 opacity-90">
        <Illustration />
      </div>
      <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-5 max-w-xs">{description}</p>
      )}
      {action}
    </div>
  )
}
