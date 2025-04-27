
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WandSparkles, History, LogIn, Settings, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export default function BottomNavigation() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const unauthenticatedNavItems = [
    { href: '/generator', label: 'Генератор', icon: WandSparkles },
    { href: '/history', label: 'История', icon: History }, // Public history page
    { href: '/login', label: 'Вход', icon: LogIn }, // Combine login/register icon
  ];

  const authenticatedNavItems = [
    { href: '/generator', label: 'Генератор', icon: WandSparkles },
    { href: '/admin/history', label: 'История', icon: History }, // Admin history page
    { href: '/admin/templates', label: 'Шаблоны', icon: Settings },
    { href: '/account', label: 'Кабинет', icon: User },
  ];

  const navItems = isAuthenticated ? authenticatedNavItems : unauthenticatedNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background shadow-md md:hidden">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full text-center transition-colors duration-200',
                isActive
                  ? 'text-primary font-medium' // Active state color
                  : 'text-muted-foreground hover:text-primary/80' // Inactive state color
              )}
            >
              <item.icon className={cn('h-6 w-6 mb-1', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80 transition-colors duration-200')} />
              <span className="text-xs truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
