
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
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://gestionenviospruebas.netlify.app";

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
      'es-AR': '/es-AR',
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
        url: `${APP_URL}/og-image.png`, // Ensure full URL for OG images
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
    images: [`${APP_URL}/twitter-image.png`], // Ensure full URL for Twitter images
    // creator: '@yourtwitterhandle',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Added for consistency, though initialScale=1 often implies this.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00296B' }, // Primary color for light mode
    { media: '(prefers-color-scheme: dark)', color: '#00102b' },  // Darker shade for dark mode
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      {/* Ensure no whitespace characters are rendered directly here */}
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
