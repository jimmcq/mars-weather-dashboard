/**
 * Sentry server-side configuration
 * This file configures error monitoring and performance tracking for the server/API routes
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% sampling in production, 100% in development
  
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
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0, // Profiling in production only
});