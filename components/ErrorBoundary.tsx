import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white px-4 py-16 dark:bg-gray-900 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
          <div className="mx-auto max-w-max">
            <main className="sm:flex">
              <p className="text-4xl font-bold tracking-tight text-orange-500 sm:text-5xl">
                Oops!
              </p>
              <div className="sm:ml-6">
                <div className="dark:border-gray-700 sm:border-l sm:border-gray-200 sm:pl-6">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                    Something went wrong
                  </h1>
                  <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
                    {this.state.error?.message ||
                      'An unexpected error occurred'}
                  </p>
                  <div className="mt-6 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center rounded-md border border-transparent bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      Try again
                    </button>
                    <button
                      onClick={() => (window.location.href = '/')}
                      className="inline-flex items-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Go back home
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
