
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
    const { logout, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated and not loading
    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) {
        // Show loading or let the redirect happen
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="text-primary animate-pulse">Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Title is handled by AppLayout */}
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">Настройки аккаунта</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">Здесь будут настройки вашего аккаунта.</p>
                    {/* Placeholder for future settings */}
                    <div>
                         <p>Email: user@example.com (Placeholder)</p>
                         {/* Add more user details or settings forms here */}
                    </div>
                    <Button
                        variant="destructive"
                        onClick={logout}
                        className="rounded-md shadow-md hover:shadow-lg transition-shadow"
                    >
                        Выйти из аккаунта
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
