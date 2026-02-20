import React from 'react'
import Link from '@/components/Link'

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-start justify-start md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6">
          <div className="space-x-2 pb-8 pt-6 md:space-y-5">
            <h1 className="text-6xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 md:border-r-2 md:px-6 md:text-8xl md:leading-14">
              500
            </h1>
          </div>
          <div className="max-w-md">
            <p className="mb-4 text-xl font-bold leading-normal md:text-2xl">
              Something went wrong.
            </p>
            <p className="mb-8">
              An unexpected error occurred. Please try again or head back to the
              homepage.
            </p>
            <Link
              href="/"
              className="focus:shadow-outline-orange inline rounded-lg border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium leading-5 text-white shadow transition-colors duration-150 hover:bg-orange-700 focus:outline-none dark:hover:bg-orange-500"
            >
              Back to homepage
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
