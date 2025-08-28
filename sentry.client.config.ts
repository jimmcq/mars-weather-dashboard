/**
 * Sentry client-side configuration
 * This file configures error monitoring and performance tracking for the browser
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% sampling in production, 100% in development
  
  // Session Replay
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1, // 1% in production, 10% in development
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions
  
  // Environment and release information
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'mars-weather-dashboard@0.1.0',
  
  // Configure what gets sent to Sentry
  beforeSend(event, hint) {
    // Filter out development errors in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Event:', event, hint);
    }
    
    // Don't send events if no DSN is configured
    if (!SENTRY_DSN) {
      return null;
    }
    
    return event;
  },
  
  // Configure error filtering
  ignoreErrors: [
    // Ignore common browser extension errors
    'Non-Error promise rejection captured',
    'ResizeObserver loop limit exceeded',
    'Script error.',
    'Network request failed',
    
    // Ignore NASA API rate limiting (these are expected)
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
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask all text and input content
      maskAllText: true,
      maskAllInputs: true,
    }),
  ],
  });
}