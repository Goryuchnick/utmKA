
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, LogIn } from 'lucide-react'; // Import LogIn icon
import Image from 'next/image'; // Import next/image

// Placeholder icons for Google and Yandex - replace with actual SVGs or components if available
const GoogleIcon = () => <Image src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} />;
const YandexIcon = () => <Image src="https://yandex.ru/favicon.ico" alt="Yandex" width={20} height={20} />;

export default function LoginPage() {
  const handleLogin = (provider: 'google' | 'yandex' | 'email') => {
    // TODO: Implement actual authentication logic here
    console.log(`Logging in with ${provider}`);
    // For now, redirect to admin panel on any login attempt
    window.location.href = '/admin/history'; // Using window.location for simplicity, replace with router.push in a real app
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md shadow-lg rounded-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Вход</CardTitle>
          <CardDescription>Войдите в свой аккаунт utmKA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full rounded-md shadow-sm"
              onClick={() => handleLogin('google')}
            >
              <GoogleIcon />
              <span className="ml-2">Войти через Google</span>
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-md shadow-sm"
              onClick={() => handleLogin('yandex')}
            >
              <YandexIcon />
              <span className="ml-2">Войти через Яндекс</span>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Или войдите через email
              </span>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleLogin('email'); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="m@example.com" required className="pl-10 rounded-md shadow-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" required className="pl-10 rounded-md shadow-sm" />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-md shadow-md hover:shadow-lg transition-shadow">
              <LogIn className="mr-2 h-4 w-4" /> Войти
            </Button>
          </form>
           <p className="text-center text-sm text-muted-foreground">
                Нет аккаунта?{' '}
                {/* Link to Register page (create later) */}
                <a href="/register" className="underline text-primary hover:text-primary/80">
                    Зарегистрироваться
                </a>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
