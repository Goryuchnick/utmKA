import type { Metadata } from 'next';
// Using Roboto_Mono as a replacement due to issues resolving Droid_Sans_Mono with next/font/google
import { Roboto_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppLayout from '@/components/layout/app-layout'; // Import AppLayout

const robotoMono = Roboto_Mono({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-roboto-mono', // Updated variable name
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
      {/* Updated className to use the new font variable */}
      <body className={`${robotoMono.variable} font-mono antialiased`}>
         {/* Wrap children with AppLayout */}
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
