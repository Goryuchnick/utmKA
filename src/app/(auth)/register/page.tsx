
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

// Placeholder icons for Google and Yandex - replace with actual SVGs or components if available
const GoogleIcon = () => <Image src="/google-favicon.png" alt="Google" width={20} height={20} />; // Use local path
const YandexIcon = () => <Image src="/yandex-favicon.png" alt="Yandex" width={20} height={20} />; // Use local path


export default function RegisterPage() {
    const router = useRouter(); // Initialize useRouter
    const { isLoading } = useAuth(); // Get loading state

    const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: ''
        }
    });

    const handleRegisterSubmit = (data: RegisterFormData) => {
        // This function is called when the form is valid
        console.log('Registering with email:', data.email);
        // TODO: Implement actual registration logic here for email/password
        try {
            localStorage.setItem('isLoggedIn', 'true');
            // Use router push for navigation
            router.push('/admin/history');
        } catch (error) {
            console.error("Error setting localStorage:", error);
             // Handle potential errors (e.g., localStorage disabled)
            alert("Не удалось сохранить статус входа. Пожалуйста, убедитесь, что ваше хранилище не отключено.");
        }
    };

    const handleOAuthRegister = (provider: 'google' | 'yandex') => {
        // TODO: Implement actual OAuth registration logic here
        console.log(`Registering with ${provider}`);
        try {
            localStorage.setItem('isLoggedIn', 'true');
            router.push('/admin/history');
        } catch (error) {
            console.error("Error setting localStorage:", error);
            alert("Не удалось сохранить статус входа.");
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

    return (
        <div className="container mx-auto flex min-h-screen items-center justify-center p-4 md:p-8">
            <Card className="w-full max-w-md shadow-lg rounded-lg bg-card"> {/* Use bg-card */}
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-primary">Регистрация</CardTitle>
                    <CardDescription>Создайте новый аккаунт utmKA</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full rounded-md shadow-sm" // Use rounded-md
                            onClick={() => handleOAuthRegister('google')}
                        >
                            <GoogleIcon />
                            <span className="ml-2">Зарегистрироваться через Google</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full rounded-md shadow-sm" // Use rounded-md
                            onClick={() => handleOAuthRegister('yandex')}
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

