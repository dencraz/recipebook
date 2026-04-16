export function Badge({ children, color = 'orange', className = '' }) {
  const colors = {
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    stone: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
