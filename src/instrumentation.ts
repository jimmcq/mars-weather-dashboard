/**
 * Next.js Instrumentation File
 * This file is used to initialize Sentry for server-side and edge runtime
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

// Export request error handler for nested React Server Components
export const onRequestError = Sentry.captureRequestError;

export function register(): void {
  if (process.env.NEXT_RUNTIME === 'nodejs' && SENTRY_DSN) {
    // Server-side initialization
    Sentry.init({
      dsn: SENTRY_DSN,

      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Environment and release information
      environment: process.env.NODE_ENV || 'development',
      release: process.env.SENTRY_RELEASE || 'mars-weather-dashboard@0.1.0',

      // Configure what gets sent to Sentry
      beforeSend(event, hint) {
        // Filter out development errors in production
        if (process.env.NODE_ENV === 'development') {
          console.error('Sentry Server Event:', event, hint);
        }

        // Don't send events if no DSN is configured
        if (!SENTRY_DSN) {
          return null;
        }

        return event;
      },

      // Configure error filtering
      ignoreErrors: [
        // Ignore NASA API rate limiting (these are expected)
        /Rate limit exceeded/,
        /429/,
        /NASA API responded with 500/,

        // Ignore network timeouts (common with external APIs)
        /timeout/,
        /ECONNRESET/,
        /ETIMEDOUT/,

        // Ignore demo key limitations
        /DEMO_KEY/,
      ],

      // User context
      initialScope: {
        tags: {
          component: 'mars-weather-dashboard-server',
        },
        contexts: {
          app: {
            name: 'Mars Weather Dashboard Server',
            version: '0.1.0',
          },
          runtime: {
            name: 'Node.js',
            version: process.version,
          },
        },
      },

      // Debug mode
      debug: process.env.NODE_ENV === 'development',

      // Server-specific settings
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge' && SENTRY_DSN) {
    // Edge runtime initialization
    Sentry.init({
      dsn: SENTRY_DSN,

      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Environment and release information
      environment: process.env.NODE_ENV || 'development',
      release: process.env.SENTRY_RELEASE || 'mars-weather-dashboard@0.1.0',

      // Configure what gets sent to Sentry
      beforeSend(event) {
        // Don't send events if no DSN is configured
        if (!SENTRY_DSN) {
          return null;
        }

        return event;
      },

      // Configure error filtering
      ignoreErrors: [
        // Ignore NASA API rate limiting (these are expected)
        /Rate limit exceeded/,
        /429/,

        // Ignore network timeouts
        /timeout/,
      ],

      // User context
      initialScope: {
        tags: {
          component: 'mars-weather-dashboard-edge',
        },
        contexts: {
          app: {
            name: 'Mars Weather Dashboard Edge',
            version: '0.1.0',
          },
          runtime: {
            name: 'Edge Runtime',
          },
        },
      },

      // Debug mode
      debug: process.env.NODE_ENV === 'development',
    });
  }
}
