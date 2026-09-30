import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { RealtimeProvider } from '@/context/realtime-context';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'SocietyStage • Residential Housing Cultural Event & Stage Platform',
  description: 'Multi-tenant cultural-event management platform for residential housing societies: from participant registration through live event-day stage operations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0b0d14] text-slate-100">
        <AuthProvider>
          <RealtimeProvider>
            <AppShell>
              {children}
            </AppShell>
            <Toaster
              position="top-right"
              richColors
              theme="dark"
              toastOptions={{
                style: {
                  background: 'rgba(24, 27, 38, 0.95)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  color: '#ffffff',
                },
              }}
            />
          </RealtimeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
