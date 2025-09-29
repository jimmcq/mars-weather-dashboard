/**
 * Custom 404 Not Found page for App Router
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="max-w-md rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center backdrop-blur">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-blue-400">404</h1>
        </div>

        <h2 className="mb-4 text-2xl font-bold text-white">Page Not Found</h2>

        <p className="mb-6 text-slate-300">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-6 py-3 text-slate-300 transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
