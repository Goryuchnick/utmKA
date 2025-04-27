import type { Metadata } from 'next';
import { Droid_Sans_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppLayout from '@/components/layout/app-layout';

const droidSansMono = Droid_Sans_Mono({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-droid-sans-mono',
});

export const metadata: Metadata = {
  title: 'utmKA - UTM Generator',
  description: 'Generate and manage UTM links easily.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${droidSansMono.variable} font-mono antialiased`}>
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
