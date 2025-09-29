/**
 * Global Error Handler for Next.js App Router
 * Catches React rendering errors and reports them to Sentry
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
 */

'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps): React.ReactElement {
  useEffect(() => {
    // Report error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
          <div className="max-w-md rounded-lg border border-red-800 bg-red-950/20 p-8 text-center backdrop-blur">
            <div className="mb-6 flex justify-center">
              <AlertTriangle className="h-16 w-16 text-red-400" />
            </div>

            <h2 className="mb-4 text-2xl font-bold text-red-300">
              Something went wrong
            </h2>

            <p className="mb-6 text-slate-300">
              We encountered an unexpected error. This has been reported and
              we&apos;ll look into it.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="mb-6 text-left">
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
                  {error.digest && (
                    <div className="mb-2">
                      <strong>Digest:</strong> {error.digest}
                    </div>
                  )}
                  {error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => reset()}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
                type="button"
                aria-label="Try again"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>

              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-6 py-3 text-slate-300 transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
                aria-label="Go to home page"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              If this problem persists, please{' '}
              <a
                href="https://github.com/jimmcq/mars-weather-dashboard/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 underline hover:text-red-300"
              >
                report the issue
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
