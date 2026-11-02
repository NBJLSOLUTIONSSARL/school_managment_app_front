import { Component } from 'react'

/**
 * Top-level error boundary. Catches rendering errors in the application tree
 * and displays a recoverable fallback instead of a blank screen.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
    this.handleReload = this.handleReload.bind(this)
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error', error, info)
    this.props.onError?.(error, info)
  }

  handleReload() {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const {
      title = 'Une erreur inattendue est survenue',
      message = 'Impossible d’afficher ce contenu. Vous pouvez recharger la page ou revenir au tableau de bord.',
      reloadLabel = 'Recharger la page',
      homeLabel = 'Tableau de bord',
      homeHref = '/dashboard',
    } = this.props

    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center"
      >
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl font-bold text-rose-600">
          !
        </div>

        <h1 className="mt-4 text-base font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-500">{message}</p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={this.handleReload}
            className="inline-flex h-8 items-center rounded bg-slate-900 px-3 text-xs font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
          >
            {reloadLabel}
          </button>
          <a
            href={homeHref}
            className="inline-flex h-8 items-center rounded border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
          >
            {homeLabel}
          </a>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
