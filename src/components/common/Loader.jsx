import { cn } from '@/utils/classNames'

const spinnerSizes = {
  xs: 'h-3.5 w-3.5 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
}

export function Spinner({ size = 'md', className = '', color = 'text-slate-800' }) {
  return (
    <div
      role="status"
      aria-label="Chargement"
      className={cn(
        'inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]',
        spinnerSizes[size] || spinnerSizes.md,
        color,
        className
      )}
    >
      <span className="sr-only">Chargement...</span>
    </div>
  )
}

export function Loader({ size = 'md', text, className = '' }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-4 text-slate-500',
        className
      )}
    >
      <Spinner size={size} />
      {text && <span className="text-2xs font-medium text-slate-500">{text}</span>}
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={cn('animate-pulse rounded bg-slate-200/80', className)} />
}

export function PageLoader({ message = 'Chargement en cours...' }) {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8">
      <Spinner size="lg" />
      <p className="mt-3 text-xs font-medium text-slate-600">{message}</p>
    </div>
  )
}

export default Loader
