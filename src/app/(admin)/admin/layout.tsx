
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { History, Settings, LogOut, LayoutGrid, User } from 'lucide-react'; // Import icons

import { cn } from '@/lib/utils';
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
} from '@/components/ui/sidebar'; // Assuming sidebar component exists
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const adminNavItems = [
  { href: '/admin/history', label: 'История ссылок', icon: History },
  { href: '/admin/templates', label: 'Шаблоны', icon: Settings }, // Placeholder for templates
];

const accountNavItem = { href: '/account', label: 'Аккаунт', icon: User }; // Placeholder for account page

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const handleLogout = () => {
      // TODO: Implement actual logout logic
      console.log('Logging out...');
      // Redirect to login page after logout
      window.location.href = '/login'; // Using window.location for simplicity
  };

  return (
    <SidebarProvider defaultOpen={!isMobile} >
       <Sidebar collapsible="icon" variant="sidebar" side="left">
           <SidebarHeader className="items-center gap-2 border-b p-3 group-data-[collapsible=icon]:justify-center">
                <Link href="/generator" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                    <LayoutGrid className="h-6 w-6 text-primary" />
                    <span className="font-bold text-primary">utmKA</span>
                 </Link>
                <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" />
           </SidebarHeader>
           <SidebarContent className="flex-1 overflow-y-auto p-2">
                <SidebarMenu>
                    {adminNavItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                             <SidebarMenuButton
                                asChild
                                isActive={pathname === item.href}
                                tooltip={{ children: item.label}}
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
           <SidebarFooter className="border-t p-2">
                <SidebarMenu>
                    {/* Account Link */}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === accountNavItem.href}
                            tooltip={{ children: accountNavItem.label}}
                            >
                             <Link href={accountNavItem.href}>
                                <accountNavItem.icon />
                                <span>{accountNavItem.label}</span>
                             </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     {/* Logout Button */}
                    <SidebarMenuItem>
                         <SidebarMenuButton onClick={handleLogout} tooltip={{ children: 'Выйти'}}>
                             <LogOut />
                             <span>Выйти</span>
                         </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
           </SidebarFooter>
       </Sidebar>
        <SidebarInset>
            <div className="container mx-auto p-4 md:p-8">
                 {/* Dynamic Title based on current page */}
                <h1 className="text-3xl font-bold mb-6 text-primary">
                    {adminNavItems.find(item => item.href === pathname)?.label ||
                     (pathname === accountNavItem.href ? accountNavItem.label : 'Админ Панель')}
                </h1>
                {children}
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
