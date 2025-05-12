
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const APP_NAME = "Viandas Express Admin";
const APP_DESCRIPTION = "Gestión de operaciones de entrega y optimización de rutas para Viandas Express en Mar del Plata, Argentina.";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; // Fallback for local dev

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
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
  alternates: {
    canonical: '/',
    languages: {
      'es-AR': '/es-AR', // Example, adjust if you have other languages
    },
  },
  openGraph: {
    url: APP_URL,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    locale: 'es_AR',
    siteName: APP_NAME,
    type: 'website',
    images: [
      {
        url: `${APP_URL}/og-image.png`, // Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: `Logo de ${APP_NAME}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/twitter-image.png`], // Replace with your actual Twitter image URL
    // creator: '@yourtwitterhandle', // Add if you have a Twitter handle
  },
  // Favicons are typically handled by placing files in the /app directory (favicon.ico, apple-touch-icon.png, etc.)
  // Or you can specify them here if needed:
  // icons: {
  //   icon: '/favicon.ico',
  //   shortcut: '/favicon-16x16.png',
  //   apple: '/apple-touch-icon.png',
  // },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Optional: consider if zooming is desired
  // userScalable: false, // Optional: consider if user scaling should be disabled
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00296B' }, // Royal Blue for light scheme
    { media: '(prefers-color-scheme: dark)', color: '#00102b' },  // Darker Royal Blue for dark scheme
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 
          The main H1 tag should be on individual pages to describe their specific content.
          The layout provides the overall structure.
          Semantic elements like <header>, <nav>, <main>, <footer> should be used within page components
          and the (app) layout.tsx as appropriate.
        */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}

