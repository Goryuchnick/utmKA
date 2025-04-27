
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation'; // Use useRouter for navigation

// Simple hook to manage authentication state (replace with actual auth implementation)
export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const router = useRouter();

    // Example: Check localStorage or a cookie on mount (very basic)
    React.useEffect(() => {
        let loggedIn = false;
        try {
            // In a real app, you'd verify a token with a backend or use an auth provider SDK
            loggedIn = localStorage.getItem('isLoggedIn') === 'true';
            setIsAuthenticated(loggedIn);
        } catch (error) {
            console.error("Error accessing localStorage:", error);
            // Handle potential errors (e.g., localStorage disabled)
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false); // Set loading to false after checking
        }

        // Define mock login/logout globally for easy testing during development
        if (typeof window !== 'undefined') {
             (window as any).mockLogin = () => {
                try {
                    localStorage.setItem('isLoggedIn', 'true');
                    setIsAuthenticated(true);
                    router.push('/admin/history'); // Use router push for better SPA experience
                } catch (error) {
                    console.error("Error setting localStorage:", error);
                    alert("Не удалось сохранить статус входа.");
                }
            };

             (window as any).mockLogout = () => {
                 try {
                    localStorage.removeItem('isLoggedIn');
                    setIsAuthenticated(false);
                    router.push('/login'); // Redirect to login after logout
                } catch (error) {
                    console.error("Error removing localStorage:", error);
                    alert("Не удалось выполнить выход.");
                }
            };
        }


    }, [router]); // Add router to dependency array


    const logout = () => {
        // Use the mock logout function if available, otherwise log
        if (typeof window !== 'undefined' && (window as any).mockLogout) {
            (window as any).mockLogout();
        } else {
            console.log('Logging out...');
            // Fallback redirect if window function not available (should not happen in browser)
             try {
                localStorage.removeItem('isLoggedIn');
                setIsAuthenticated(false);
                router.push('/login');
            } catch (error) {
                 console.error("Error during fallback logout:", error);
            }
        }
    };

    return { isAuthenticated, isLoading, logout };
};
