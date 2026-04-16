// Палитра цветов для категорий
export const CATEGORY_COLORS = [
  { id: 'orange',  label: 'Оранжевый', labelEn: 'Orange',  bg: 'bg-orange-100 dark:bg-orange-900/30',  text: 'text-orange-700 dark:text-orange-300',  dot: 'bg-orange-500',  ring: 'ring-orange-400' },
  { id: 'rose',    label: 'Розовый',   labelEn: 'Rose',    bg: 'bg-rose-100 dark:bg-rose-900/30',      text: 'text-rose-700 dark:text-rose-300',      dot: 'bg-rose-500',    ring: 'ring-rose-400' },
  { id: 'violet',  label: 'Фиолетовый',labelEn: 'Violet',  bg: 'bg-violet-100 dark:bg-violet-900/30',  text: 'text-violet-700 dark:text-violet-300',  dot: 'bg-violet-500',  ring: 'ring-violet-400' },
  { id: 'blue',    label: 'Синий',     labelEn: 'Blue',    bg: 'bg-blue-100 dark:bg-blue-900/30',      text: 'text-blue-700 dark:text-blue-300',      dot: 'bg-blue-500',    ring: 'ring-blue-400' },
  { id: 'cyan',    label: 'Голубой',   labelEn: 'Cyan',    bg: 'bg-cyan-100 dark:bg-cyan-900/30',      text: 'text-cyan-700 dark:text-cyan-300',      dot: 'bg-cyan-500',    ring: 'ring-cyan-400' },
  { id: 'teal',    label: 'Бирюзовый', labelEn: 'Teal',    bg: 'bg-teal-100 dark:bg-teal-900/30',      text: 'text-teal-700 dark:text-teal-300',      dot: 'bg-teal-500',    ring: 'ring-teal-400' },
  { id: 'green',   label: 'Зелёный',   labelEn: 'Green',   bg: 'bg-green-100 dark:bg-green-900/30',    text: 'text-green-700 dark:text-green-300',    dot: 'bg-green-500',   ring: 'ring-green-400' },
  { id: 'lime',    label: 'Лаймовый',  labelEn: 'Lime',    bg: 'bg-lime-100 dark:bg-lime-900/30',      text: 'text-lime-700 dark:text-lime-300',      dot: 'bg-lime-500',    ring: 'ring-lime-400' },
  { id: 'yellow',  label: 'Жёлтый',    labelEn: 'Yellow',  bg: 'bg-yellow-100 dark:bg-yellow-900/30',  text: 'text-yellow-700 dark:text-yellow-300',  dot: 'bg-yellow-500',  ring: 'ring-yellow-400' },
  { id: 'amber',   label: 'Янтарный',  labelEn: 'Amber',   bg: 'bg-amber-100 dark:bg-amber-900/30',    text: 'text-amber-700 dark:text-amber-300',    dot: 'bg-amber-500',   ring: 'ring-amber-400' },
  { id: 'pink',    label: 'Малиновый', labelEn: 'Pink',    bg: 'bg-pink-100 dark:bg-pink-900/30',      text: 'text-pink-700 dark:text-pink-300',      dot: 'bg-pink-500',    ring: 'ring-pink-400' },
  { id: 'indigo',  label: 'Индиго',    labelEn: 'Indigo',  bg: 'bg-indigo-100 dark:bg-indigo-900/30',  text: 'text-indigo-700 dark:text-indigo-300',  dot: 'bg-indigo-500',  ring: 'ring-indigo-400' },
]

/** Возвращает объект цвета по его id, либо по хэшу строки */
export function getCategoryColor(colorId, fallbackName = '') {
  if (colorId) {
    const found = CATEGORY_COLORS.find((c) => c.id === colorId)
    if (found) return found
  }
  // Авто-цвет по хэшу названия
  let hash = 0
  for (let i = 0; i < fallbackName.length; i++) {
    hash = fallbackName.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
}
