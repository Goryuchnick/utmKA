
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WandSparkles, LayoutGrid, LogIn, UserPlus, UserCog, History, Settings, User, LogOut } from 'lucide-react'; // Added more icons

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/use-auth'; // Import the dedicated auth hook
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
  const { isAuthenticated, isLoading, logout } = useAuth(); // Use the dedicated hook

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
        // Special case for admin routes if not explicitly matched above
        if (pathname.startsWith('/admin')) {
             if (pathname === '/admin/history') return 'История ссылок';
             if (pathname === '/admin/templates') return 'Шаблоны';
        }
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
                                     {/* TODO: Create /account page */}
                                     <Link href="#">
                                        <accountNavItem.icon />
                                        <span>{accountNavItem.label}</span>
                                     </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                 <SidebarMenuButton onClick={logout} tooltip={{ children: 'Выйти'}} className="rounded-md"> {/* Use rounded-md for buttons */}
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
                 {/* Conditionally render title only if not on login/register page */}
                 {currentPageTitle !== 'Войти' && currentPageTitle !== 'Регистрация' && (
                     <h1 className="text-3xl font-bold mb-6 text-primary">
                         {currentPageTitle}
                     </h1>
                 )}
                 {children}
             </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
