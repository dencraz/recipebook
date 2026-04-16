export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
