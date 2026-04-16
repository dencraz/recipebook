export function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`bg-white dark:bg-stone-800 rounded-2xl shadow-md overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
