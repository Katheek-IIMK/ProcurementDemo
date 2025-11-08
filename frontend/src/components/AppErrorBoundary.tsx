import React from 'react'

type AppErrorBoundaryProps = {
  children?: React.ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
  message?: string
}

class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    const message = error instanceof Error ? error.message : String(error)
    return { hasError: true, message }
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error('Uncaught UI error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <div className="card" style={{ borderLeft: '4px solid #dc3545' }}>
            <h2 style={{ color: '#dc3545', marginBottom: '0.75rem' }}>Something went wrong</h2>
            <p style={{ marginBottom: '1rem', color: '#555' }}>
              The interface encountered an unexpected error and can’t display the data right now.
            </p>
            {this.state.message && (
              <p style={{ fontSize: '0.9rem', color: '#6c757d', wordBreak: 'break-word', marginBottom: '1rem' }}>
                Details: {this.state.message}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn" onClick={this.handleReset}>
                Try Again
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary


