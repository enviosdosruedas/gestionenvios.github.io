
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
  manifest: "/manifest.json", // Ensure this file exists in /public
  robots: { // Corrected directives
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
    languages: { // Example, assuming Spanish (Argentina) is primary
      'es-AR': '/es-AR', // If you have a dedicated Spanish version at this path
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
        url: `/og-image.png`, // Assumes og-image.png is in /public
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
    images: [`/twitter-image.png`], // Assumes twitter-image.png is in /public
    // creator: '@yourtwitterhandle', // Uncomment if you have a Twitter handle
  },
  icons: { // Standard way to declare favicons
    icon: '/favicon.ico',
    shortcut: '/favicon.svg', // or /favicon-16x16.png etc.
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, 
  // userScalable: false, // Generally better to allow user scaling for accessibility
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00296B' }, 
    { media: '(prefers-color-scheme: dark)', color: '#00102b' },  
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning> {/* suppressHydrationWarning on html is often sufficient */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

