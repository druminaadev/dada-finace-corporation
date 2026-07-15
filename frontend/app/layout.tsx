import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Inter } from 'next/font/google'
import { ToastContainer } from '@/components/ui/Toast'
import './globals.css'
import './dark-theme.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Dada Finance & Corporation',
  description: 'Dada Finance & Corporation',
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/LOGO.png', type: 'image/png' }],
    shortcut: '/LOGO.png',
    apple: '/LOGO.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/LOGO.png" type="image/png" />
        <link rel="apple-touch-icon" href="/LOGO.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  )
}
