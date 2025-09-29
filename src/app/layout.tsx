import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://mars-weather-dashboard.vercel.app'
      : 'http://localhost:3000'
  ),
  title: 'Mars Weather Dashboard',
  description:
    "Real-time Martian time and planetary data using NASA's Mars24 algorithm",
  keywords:
    'mars, weather, nasa, space, planetary science, real-time dashboard',
  authors: [{ name: 'Jim McQuillan', url: 'https://github.com/jimmcq' }],
  openGraph: {
    title: 'Mars Weather Dashboard',
    description:
      "Real-time Martian time and planetary data using NASA's Mars24 algorithm",
    url: 'https://mars-weather-dashboard.vercel.app',
    siteName: 'Mars Weather Dashboard',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mars Weather Dashboard - Real-time Martian time and weather data',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mars Weather Dashboard',
    description:
      "Real-time Martian time and planetary data using NASA's Mars24 algorithm",
    images: ['/og-image.png'],
    creator: '@jimmcq',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
