export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-400',
    secondary: 'bg-stone-100 text-stone-800 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-100 dark:hover:bg-stone-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700',
    outline: 'border border-stone-300 text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
    icon: 'p-2',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
