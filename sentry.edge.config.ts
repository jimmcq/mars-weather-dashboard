/**
 * Sentry Edge Runtime configuration
 * This file configures error monitoring for Edge Runtime functions
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Environment and release information
  environment: process.env.NODE_ENV || 'development',
  release: process.env.SENTRY_RELEASE || 'mars-weather-dashboard@0.1.0',
  
  // Configure what gets sent to Sentry
  beforeSend(event, hint) {
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