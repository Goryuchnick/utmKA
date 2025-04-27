
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WandSparkles, LayoutGrid, LogIn, UserPlus, UserCog, History, Settings, User, LogOut } from 'lucide-react'; // Added more icons

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar'; // Import sidebar components

// Assuming a simple check for authentication status (replace with actual auth state)
const useAuth = () => {
    // Replace with your actual authentication context or state management
    const [isAuthenticated, setIsAuthenticated] = React.useState(false); // Default to not logged in
    const [isLoading, setIsLoading] = React.useState(true); // Add loading state

     // Example: Check localStorage or a cookie on mount (very basic)
     React.useEffect(() => {
        try {
             // In a real app, you'd verify a token with a backend or use an auth provider SDK
            const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
            setIsAuthenticated(loggedIn);
        } catch (error) {
            console.error("Error accessing localStorage:", error);
             // Handle potential errors (e.g., localStorage disabled)
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false); // Set loading to false after checking
        }


        // Add simple login/logout functions for testing
        (window as any).mockLogin = () => {
            try {
                localStorage.setItem('isLoggedIn', 'true');
                setIsAuthenticated(true);
                // Use history push or router push instead of reload for better SPA experience
                window.location.href = '/admin/history'; // Simple redirect for now
            } catch (error) {
                console.error("Error setting localStorage:", error);
            }
        };
        (window as any).mockLogout = () => {
            try {
                localStorage.removeItem('isLoggedIn');
                setIsAuthenticated(false);
                window.location.href = '/login'; // Redirect to login after logout
            } catch (error) {
                console.error("Error removing localStorage:", error);
            }
        };

     }, []);


    return { isAuthenticated, isLoading };
};


const publicNavItems = [
  { href: '/generator', label: 'Генератор', icon: WandSparkles },
];

// Define admin navigation items separately
const adminNavItems = [
  { href: '/admin/history', label: 'История ссылок', icon: History },
  { href: '/admin/templates', label: 'Шаблоны', icon: Settings },
];
const accountNavItem = { href: '/account', label: 'Аккаунт', icon: User }; // Placeholder for account page

// Define auth navigation items for unauthenticated users
const authNavItems = [
    { href: '/login', label: 'Войти', icon: LogIn },
    { href: '/register', label: 'Регистрация', icon: UserPlus },
];


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { isAuthenticated, isLoading } = useAuth(); // Get auth status and loading state

  const handleLogout = () => {
    // Use the mock logout function if available, otherwise log
    if ((window as any).mockLogout) {
        (window as any).mockLogout();
    } else {
        console.log('Logging out...');
        // Fallback redirect
        window.location.href = '/login';
    }
  };

   // Display loading state or skeleton if auth status is not yet determined
   if (isLoading) {
        // Basic loading indicator - replace with a proper Skeleton component if desired
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="text-primary animate-pulse">Загрузка...</p>
            </div>
        );
    }


  // Determine the title based on the current path
    const getTitle = () => {
        // Combine all possible nav items for title lookup
        const allNavItems = [...publicNavItems, ...adminNavItems, accountNavItem, ...authNavItems];
        const currentItem = allNavItems.find(item => pathname.startsWith(item.href)); // Use startsWith for nested routes

        if (currentItem) {
            return currentItem.label;
        }
        // Fallback titles for specific paths if needed
        if (pathname === '/') return 'Главная'; // Example for root path
        // Special case for account page if not in nav items explicitly checked
        if (pathname === '/account') return 'Аккаунт';
        return 'utmKA'; // Default title
    };

   const currentPageTitle = getTitle();

  return (
    <SidebarProvider defaultOpen={!isMobile} >
       {/* Use 'sidebar' variant for Metrika-like styling, remove default border */}
       <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border">
           <SidebarHeader className="items-center gap-2 border-b border-sidebar-border p-3 group-data-[collapsible=icon]:justify-center">
                <Link href="/generator" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                    {/* Consider adding your logo/icon here */}
                    <LayoutGrid className="h-6 w-6 text-primary" />
                    <span className="font-bold text-primary text-lg">utmKA</span>
                 </Link>
                <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" />
           </SidebarHeader>
           {/* Adjust padding to match Metrika style */}
           <SidebarContent className="flex-1 overflow-y-auto p-2">
                <SidebarMenu>
                    {/* Public Items */}
                    {publicNavItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                             <SidebarMenuButton
                                asChild
                                isActive={pathname.startsWith(item.href)}
                                tooltip={{ children: item.label}}
                                className="rounded-md" // Use rounded-md for buttons
                             >
                                <Link href={item.href}>
                                     <item.icon />
                                     <span>{item.label}</span>
                                </Link>
                             </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}

                     {/* Admin Items (conditionally rendered) */}
                     {isAuthenticated && adminNavItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                             <SidebarMenuButton
                                asChild
                                isActive={pathname.startsWith(item.href)}
                                tooltip={{ children: item.label}}
                                className="rounded-md" // Use rounded-md for buttons
                             >
                                <Link href={item.href}>
                                     <item.icon />
                                     <span>{item.label}</span>
                                </Link>
                             </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
           </SidebarContent>
           <SidebarFooter className="border-t border-sidebar-border p-2">
                <SidebarMenu>
                     {/* Auth Links (Unauthenticated) */}
                    {!isAuthenticated && authNavItems.map((item) => (
                         <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname.startsWith(item.href)}
                                tooltip={{ children: item.label}}
                                className="rounded-md" // Use rounded-md for buttons
                            >
                                <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}

                    {/* Account Link & Logout (Authenticated) */}
                    {isAuthenticated && (
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === accountNavItem.href}
                                    tooltip={{ children: accountNavItem.label}}
                                    className="rounded-md" // Use rounded-md for buttons
                                >
                                     <Link href={accountNavItem.href}>
                                        <accountNavItem.icon />
                                        <span>{accountNavItem.label}</span>
                                     </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                 <SidebarMenuButton onClick={handleLogout} tooltip={{ children: 'Выйти'}} className="rounded-md"> {/* Use rounded-md for buttons */}
                                     <LogOut />
                                     <span>Выйти</span>
                                 </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    )}
                </SidebarMenu>
           </SidebarFooter>
       </Sidebar>
        {/* Remove rounded-lg from SidebarInset if using 'sidebar' variant to avoid double rounding/border */}
        <SidebarInset>
            <main className="flex-1 container mx-auto p-4 md:p-8">
                 <h1 className="text-3xl font-bold mb-6 text-primary">
                     {currentPageTitle}
                 </h1>
                 {children}
             </main>
        </SidebarInset>
    </SidebarProvider>
  );
}

    