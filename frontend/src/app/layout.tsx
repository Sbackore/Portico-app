import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Pórtico — Tu banco inteligente',
  description: 'Gestiona tu dinero de manera segura con tecnología bancaria de próxima generación.',
  keywords: ['banco', 'fintech', 'seguridad', 'transacciones', 'colombia'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0A0A0F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#13152B',
                color: '#fff',
                border: '1px solid rgba(108,71,255,0.3)',
                borderRadius: '16px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500',
                padding: '14px 18px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              },
              success: {
                iconTheme: { primary: '#00FF85', secondary: '#000' },
              },
              error: {
                iconTheme: { primary: '#FF4444', secondary: '#fff' },
              },
              duration: 4000,
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
