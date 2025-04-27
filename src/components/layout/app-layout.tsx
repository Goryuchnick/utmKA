
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WandSparkles, LayoutGrid, LogIn, UserPlus, UserCog } from 'lucide-react'; // Added LogIn, UserPlus, UserCog

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Assuming a simple check for authentication status (replace with actual auth state)
const useAuth = () => {
    // Replace with your actual authentication context or state management
    const [isAuthenticated, setIsAuthenticated] = React.useState(false); // Default to not logged in

     // Example: Check localStorage or a cookie on mount (very basic)
     React.useEffect(() => {
        // In a real app, you'd verify a token with a backend or use an auth provider SDK
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        setIsAuthenticated(loggedIn);

        // Add simple login/logout functions for testing
        (window as any).mockLogin = () => {
            localStorage.setItem('isLoggedIn', 'true');
            setIsAuthenticated(true);
            window.location.reload(); // Reload to reflect changes in layout
        };
        (window as any).mockLogout = () => {
            localStorage.removeItem('isLoggedIn');
            setIsAuthenticated(false);
            window.location.reload();
        };

     }, []);


    return { isAuthenticated };
};


const publicNavItems = [
  { href: '/generator', label: 'Генератор', icon: WandSparkles },
];

const authNavItems = [
    { href: '/login', label: 'Войти', icon: LogIn },
    { href: '/register', label: 'Регистрация', icon: UserPlus },
];

const adminNavItem = { href: '/admin/history', label: 'Админ панель', icon: UserCog };


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth(); // Get auth status

  const navItems = isAuthenticated ? [...publicNavItems, adminNavItem] : [...publicNavItems];
  const mobileNavItems = isAuthenticated ? [...publicNavItems, adminNavItem] : [...publicNavItems, ...authNavItems]; // Mobile shows auth buttons if not logged in

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {!isMobile && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <div className="container flex h-14 items-center">
            <Link href="/generator" className="mr-6 flex items-center space-x-2">
              <LayoutGrid className="h-6 w-6 text-primary" />
              <span className="font-bold text-primary">utmKA</span>
            </Link>
            <nav className="flex items-center space-x-1 lg:space-x-2 flex-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md', // Added padding and rounded
                    pathname.startsWith(item.href) ? 'text-primary bg-accent' : 'text-muted-foreground' // Highlight active section
                  )}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </nav>
             {/* Auth buttons for desktop */}
            <div className="flex items-center space-x-2">
                 {!isAuthenticated ? (
                     authNavItems.map((item) => (
                        <Button
                          key={item.href}
                          variant={pathname === item.href ? "default" : "outline"} // Style based on active
                          size="sm"
                          asChild
                          className="rounded-md shadow-sm hover:shadow transition-shadow"
                        >
                            <Link href={item.href}>
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </Link>
                        </Button>
                     ))
                 ) : (
                     // Optional: Show a logout button or user menu on desktop when logged in
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (window as any).mockLogout()} // Use mock logout for testing
                        className="rounded-md shadow-sm hover:shadow transition-shadow"
                        >
                        <LogOut className="mr-2 h-4 w-4" /> Выйти
                    </Button>
                 )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">{children}</main>

      {isMobile && (
        <footer className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-inner">
          <nav className="container flex h-16 items-center justify-around">
            {mobileNavItems.map((item) => (
              <Link key={item.href} href={item.href} legacyBehavior>
                <a className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105", // Added animation
                  pathname.startsWith(item.href) ? 'text-primary scale-110 font-semibold' : 'text-muted-foreground hover:text-primary/80' // Animation for active state
                )}>
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </a>
              </Link>
            ))}
             {/* Logout button on mobile if authenticated */}
            {isAuthenticated && (
                 <button onClick={() => (window as any).mockLogout()} className={cn( // Use mock logout
                  "flex flex-col items-center justify-center p-2 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 text-muted-foreground hover:text-destructive"
                )}>
                    <LogOut className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">Выйти</span>
                 </button>
            )}
          </nav>
        </footer>
      )}
    </div>
  );
}
