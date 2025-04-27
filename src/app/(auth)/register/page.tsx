
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useForm, Controller } from 'react-hook-form'; // Import react-hook-form
import { zodResolver } from '@hookform/resolvers/zod'; // Import zod resolver
import * as z from 'zod'; // Import zod
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { useToast } from '@/hooks/use-toast'; // Import useToast for feedback

// Define Zod schema for registration form validation
const registerSchema = z.object({
  email: z.string().email({ message: "Пожалуйста, введите действительный email." }),
  password: z.string().min(6, { message: "Пароль должен содержать не менее 6 символов." }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают.",
  path: ["confirmPassword"], // Set the error path to the confirm password field
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Inline SVG for VK Icon
const VkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.125 10.082v4.82h2.505c.196 0 .39-.02.582-.058 1.735-.35 2.938-1.444 2.938-3.034 0-1.41-.87-2.436-2.544-2.786a4.36 4.36 0 0 0-.976-.142h-2.505zm-2.06 6.712H8.63c-.486 0-.88-.394-.88-.88V8.177c0-.486.394-.88.88-.88h4.656c2.63 0 4.053.85 4.613 2.04.47.998.516 2.18.108 3.39-.56 1.677-2.28 2.81-4.9 2.955v.006h-.16c-.16.01-.322.015-.484.015zm6.56-12.386c.39-.204.63-.59.63-.994 0-.74-.6-1.34-1.34-1.34h-1.794c-.44 0-.8.36-.8.8s.36.8.8.8h1.618c.1 0 .18.08.18.18s-.08.18-.18.18h-1.618c-.44 0-.8.36-.8.8s.36.8.8.8h1.794c.74 0 1.34-.6 1.34-1.34zm-14.136.268c0-.486.394-.88.88-.88h1.78c.486 0 .88.394.88.88v8.832c0 .486-.394.88-.88.88h-1.78c-.486 0-.88-.394-.88-.88V4.676z"/>
    </svg>
);
// Placeholder icon for Yandex - replace with actual SVG or component if available
const YandexIcon = () => <Image src="/yandex-favicon.png" alt="Yandex" width={20} height={20} />; // Use local path


export default function RegisterPage() {
    const router = useRouter(); // Initialize useRouter
    const { register, isLoading, isAuthenticated } = useAuth(); // Use register from useAuth
    const { toast } = useToast(); // Initialize toast

    const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: ''
        }
    });

     // Redirect if already authenticated
    React.useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/admin/history'); // Redirect logged-in users
        }
    }, [isLoading, isAuthenticated, router]);


    const handleRegisterSubmit = async (data: RegisterFormData) => {
        await register(data.email, data.password, 'email');
        // The register function in useAuth will handle redirection on success/failure
    };

    const handleOAuthRegister = async (provider: 'vk' | 'yandex') => {
        // TODO: Implement actual OAuth registration initiation here
        console.log(`Initiating OAuth registration with ${provider}`);
        // Example: Redirect to backend or OAuth provider URL
        // window.location.href = `/api/auth/${provider}/register`; // Example backend route

        // Placeholder for demo purposes:
        if (provider === 'vk' || provider === 'yandex') {
            await register(provider, '', provider); // Pass provider name as 'email' for OAuth
        }
    };

     // Optionally, show loading state while auth is being checked
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="text-primary animate-pulse">Загрузка...</p>
            </div>
        );
    }

    // Prevent rendering register page if already logged in
    if (isAuthenticated) {
        return null; // Or a loading indicator while redirecting
    }

    return (
        <div className="container mx-auto flex min-h-screen items-center justify-center p-4 md:p-8">
            <Card className="w-full max-w-md shadow-lg rounded-lg bg-card"> {/* Use bg-card */}
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-primary">Регистрация</CardTitle>
                    <CardDescription>Создайте новый аккаунт utmKA</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                         {/* VK Register Button */}
                        <Button
                            variant="outline"
                            className="w-full rounded-md shadow-sm" // Use rounded-md
                            onClick={() => handleOAuthRegister('vk')}
                            type="button" // Ensure it doesn't submit the form
                        >
                            <VkIcon />
                            <span className="ml-2">Зарегистрироваться через VK ID</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full rounded-md shadow-sm" // Use rounded-md
                            onClick={() => handleOAuthRegister('yandex')}
                            type="button" // Ensure it doesn't submit the form
                        >
                           <YandexIcon />
                            <span className="ml-2">Зарегистрироваться через Яндекс</span>
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" /> {/* Use border-border */}
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                             <span className="bg-card px-2 text-muted-foreground"> {/* Use bg-card */}
                                Или зарегистрируйтесь через email
                            </span>
                        </div>
                    </div>

                    {/* Updated form to use react-hook-form */}
                    <form onSubmit={handleSubmit(handleRegisterSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <Input id="email" type="email" placeholder="m@example.com" {...field} className="pl-10 rounded-md shadow-sm" />
                                    )}
                                />
                            </div>
                             {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Пароль</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                 <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <Input id="password" type="password" {...field} className="pl-10 rounded-md shadow-sm" />
                                    )}
                                />
                            </div>
                             {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Подтвердите Пароль</Label>
                             <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Controller
                                    name="confirmPassword"
                                    control={control}
                                    render={({ field }) => (
                                        <Input id="confirmPassword" type="password" {...field} className="pl-10 rounded-md shadow-sm" />
                                    )}
                                />
                            </div>
                             {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>}
                        </div>
                        <Button type="submit" className="w-full rounded-md shadow-md hover:shadow-lg transition-shadow"> {/* Use rounded-md */}
                             <UserPlus className="mr-2 h-4 w-4" /> Зарегистрироваться
                        </Button>
                    </form>
                     <p className="text-center text-sm text-muted-foreground">
                        Уже есть аккаунт?{' '}
                        <a href="/login" className="underline text-primary hover:text-primary/80">
                            Войти
                        </a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
