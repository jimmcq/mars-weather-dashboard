// import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mars.nasa.gov',
        port: '',
        pathname: '/msl-raw-images/**',
      },
      {
        protocol: 'https',
        hostname: 'mars.nasa.gov',
        port: '',
        pathname: '/mars2020-raw-images/**',
      },
      {
        protocol: 'https',
        hostname: 'mars.jpl.nasa.gov',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'mars.jpl.nasa.gov',
        port: '',
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },

  // Optimize for CI environments
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
  },

  // Ensure environment variables have defaults
  env: {
    NASA_API_KEY: process.env.NASA_API_KEY || 'DEMO_KEY',
  },
};

// Sentry options (currently unused, see note below)
/* eslint-disable @typescript-eslint/no-unused-vars */
const sentryOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,

  // Disable automatic error page injection (we use custom global-error.tsx)
  autoInstrumentServerFunctions: false,
  autoInstrumentMiddleware: false,

  // Only include if all required values are present
  ...(process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT &&
    process.env.SENTRY_AUTH_TOKEN && {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),

  // Always dry run in CI or when not in production to prevent upload failures
  dryRun: process.env.CI || process.env.NODE_ENV !== 'production',

  // Additional CI-friendly settings
  ...(process.env.CI && {
    // Skip source map validation in CI to prevent build failures
    validate: false,
    // Disable telemetry in CI
    telemetry: false,
  }),
};
/* eslint-enable @typescript-eslint/no-unused-vars */

// Export configuration
// NOTE: Sentry withSentryConfig wrapper temporarily disabled due to Next.js 15 compatibility issue
// The Sentry SDK (v10.16.0) generates Pages Router error pages that use `<Html>` component
// which is not compatible with App Router in Next.js 15.
// Issue: https://github.com/getsentry/sentry-javascript/issues/14526
// Tracking: We've implemented custom instrumentation files and global-error.tsx
// Once Sentry releases a fix, re-enable with:
// export default process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
//   ? withSentryConfig(nextConfig, sentryOptions)
//   : nextConfig;
export default nextConfig;
