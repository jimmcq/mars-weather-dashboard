import { withSentryConfig } from '@sentry/nextjs';
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
};

// Sentry options
const sentryOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,

  // Only include if all required values are present
  ...(process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT &&
    process.env.SENTRY_AUTH_TOKEN && {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),

  // Only upload source maps in production
  dryRun: process.env.NODE_ENV !== 'production',
};

// Export with Sentry configuration if auth token is provided
export default process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, sentryOptions)
  : nextConfig;
