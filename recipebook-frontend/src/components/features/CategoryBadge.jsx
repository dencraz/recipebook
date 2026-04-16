import { getCategoryColor } from '../../utils/categoryColor'

export function CategoryBadge({ name, color }) {
  if (!name) return null
  const c = getCategoryColor(color, name)
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {name}
    </span>
  )
}
