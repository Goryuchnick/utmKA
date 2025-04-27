'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WandSparkles, History, LayoutGrid } from 'lucide-react'; // Using LayoutGrid as placeholder for App icon

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { href: '/generator', label: 'Генератор', icon: WandSparkles },
  { href: '/history', label: 'История', icon: History },
  // Add other future pages like Login/Register here if needed
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen">
      {!isMobile && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <LayoutGrid className="h-6 w-6 text-primary" />
              <span className="font-bold text-primary">utmKA</span>
            </Link>
            <nav className="flex items-center space-x-4 lg:space-x-6">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </nav>
            {/* Add Auth buttons here if needed */}
          </div>
        </header>
      )}

      <main className="flex-1">{children}</main>

      {isMobile && (
        <footer className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="container flex h-16 items-center justify-around">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} legacyBehavior>
                <a className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-md transition-colors",
                  pathname === item.href ? 'text-primary' : 'text-muted-foreground hover:text-primary/80'
                )}>
                  <item.icon className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </a>
              </Link>
            ))}
          </nav>
        </footer>
      )}
    </div>
  );
}
