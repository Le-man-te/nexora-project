import { Component } from 'react'
import ErrorState from '../components/ErrorState.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(previousProps) {
    const { resetKeys = [] } = this.props
    const previousResetKeys = previousProps.resetKeys ?? []
    const resetKeysChanged =
      resetKeys.length !== previousResetKeys.length ||
      resetKeys.some((key, index) => !Object.is(key, previousResetKeys[index]))

    if (this.state.error && resetKeysChanged) {
      this.resetErrorBoundary()
    }
  }

  resetErrorBoundary() {
    this.props.onReset?.()
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    const { children, fallback } = this.props

    if (!error) return children

    if (typeof fallback === 'function') {
      return fallback({
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      })
    }

    if (fallback) return fallback

    return (
      <ErrorState
        message="An unexpected error occurred. Please try again."
        onRetry={this.resetErrorBoundary}
        title="Something went wrong"
      />
    )
  }
}

export default ErrorBoundary