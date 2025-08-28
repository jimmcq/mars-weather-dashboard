/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree and displays fallback UI
 */

'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import * as Sentry from '@sentry/react';

/**
 * Error boundary state interface
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary props interface
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

/**
 * Error Boundary Class Component
 * Provides graceful error handling and recovery options
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Static method to update state when an error occurs
   * @param error - The error that was thrown
   * @returns Updated state
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Called when component catches an error
   * @param error - The error that was thrown
   * @param errorInfo - Additional information about the error
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log error for monitoring
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Report to error monitoring service (e.g., Sentry)
    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'production'
    ) {
      // In production, you would integrate with your error monitoring service
      this.reportError(error, errorInfo);
    }
  }

  /**
   * Clean up timers on unmount
   */
  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  /**
   * Report error to monitoring service
   * @param error - The error to report
   * @param errorInfo - Additional error context
   */
  private reportError(error: Error, errorInfo: ErrorInfo): void {
    // Report to Sentry with additional context
    Sentry.withScope((scope) => {
      // Add React component stack trace
      scope.setContext('errorInfo', {
        componentStack: errorInfo.componentStack,
      });
      
      // Add error boundary context
      scope.setTag('errorBoundary', 'ReactErrorBoundary');
      scope.setLevel('error');
      
      // Add user context if available
      scope.setContext('component', {
        name: this.constructor.name,
        props: Object.keys(this.props),
      });
      
      // Capture the exception
      Sentry.captureException(error);
    });

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Reported error to Sentry:', {
        error: error.message,
        stack: error.stack,
        errorInfo,
      });
    }
  }

  /**
   * Handle retry button click
   */
  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Handle automatic retry after delay
   */
  private handleAutoRetry = (): void => {
    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, 5000);
  };

  /**
   * Handle navigation to home page
   */
  private handleGoHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  /**
   * Render error fallback UI
   * @returns Error fallback JSX
   */
  private renderErrorFallback(): ReactNode {
    const { error, errorInfo } = this.state;
    const { showDetails = false } = this.props;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-red-800 bg-red-950/20 p-8 text-center backdrop-blur"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-6"
        >
          <AlertTriangle className="h-16 w-16 text-red-400" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4 text-2xl font-bold text-red-300"
        >
          Something went wrong
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6 max-w-md text-slate-300"
        >
          We encountered an unexpected error while loading this section.
          Don&apos;t worry, this is likely a temporary issue.
        </motion.p>

        {showDetails && error && (
          <motion.details
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6 max-w-2xl text-left"
          >
            <summary className="cursor-pointer text-sm font-medium text-slate-400 hover:text-slate-300">
              Technical Details
            </summary>
            <div className="mt-4 rounded bg-slate-900/50 p-4 font-mono text-xs text-red-300">
              <div className="mb-2">
                <strong>Error:</strong> {error.name}
              </div>
              <div className="mb-2">
                <strong>Message:</strong> {error.message}
              </div>
              {errorInfo?.componentStack && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </motion.details>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-4"
        >
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
            type="button"
            aria-label="Retry loading the component"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <button
            onClick={this.handleGoHome}
            className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-6 py-3 text-slate-300 transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
            type="button"
            aria-label="Go to home page"
          >
            <Home className="h-4 w-4" />
            Go Home
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-sm text-slate-500"
        >
          If this problem persists, please{' '}
          <a
            href="https://github.com/jimmcq/mars-weather-dashboard/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 underline hover:text-red-300"
          >
            report the issue
          </a>
        </motion.p>
      </motion.div>
    );
  }

  /**
   * Render component
   */
  render(): ReactNode {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return fallback || this.renderErrorFallback();
    }

    return children;
  }
}

/**
 * Hook-based Error Boundary wrapper for functional components
 * @param props - Component props including children and error handler
 * @returns Error boundary wrapper component
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
  const WithErrorBoundaryComponent = (props: P): React.ReactElement => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithErrorBoundaryComponent;
}

/**
 * Simple error fallback for minor components
 * @param error - Optional error to display
 * @returns Simple error fallback JSX
 */
export function SimpleErrorFallback({
  error,
  onRetry,
}: {
  error?: Error;
  onRetry?: () => void;
}): ReactNode {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-800 bg-red-950/10 p-6 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-red-400" />
      <p className="mb-2 text-sm font-medium text-red-300">
        {error?.message || 'Something went wrong'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded bg-red-600 px-4 py-2 text-xs text-white hover:bg-red-700"
          type="button"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
