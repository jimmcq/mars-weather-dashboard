/**
 * Client-side instrumentation file
 * This file configures error monitoring and performance tracking for the browser
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

// Export router transition hook for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release:
      process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'mars-weather-dashboard@0.1.0',

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate:
      process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Configure error filtering
    ignoreErrors: [
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'Script error.',
      'Network request failed',
      /Rate limit exceeded/,
      /429/,
    ],

    // User context
    initialScope: {
      tags: {
        component: 'mars-weather-dashboard',
      },
      contexts: {
        app: {
          name: 'Mars Weather Dashboard',
          version: '0.1.0',
        },
      },
    },

    // Debug mode disabled to reduce console spam
    debug: false,
  });
}
