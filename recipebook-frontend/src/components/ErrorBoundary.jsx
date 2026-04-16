import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-amber-50 dark:bg-stone-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-md p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
              Что-то пошло не так
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
              {this.state.error?.message ?? 'Неизвестная ошибка'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
