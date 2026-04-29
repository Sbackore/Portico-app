import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Pórtico — Tu banco inteligente',
  description: 'Gestiona tu dinero de manera segura con tecnología bancaria de próxima generación.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: { background: '#13152B', color: '#fff', border: '1px solid #1E2040', borderRadius: '12px', fontSize: '14px' },
              success: { iconTheme: { primary: '#00FF85', secondary: '#000' } },
              error: { iconTheme: { primary: '#FF2D55', secondary: '#fff' } },
              duration: 4000,
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
