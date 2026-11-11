"use client";

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                className: 'glass text-sm font-medium text-foreground border-border shadow-lg',
                style: {
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    padding: '12px 16px',
                },
                success: {
                    iconTheme: {
                        primary: 'var(--primary)',
                        secondary: 'var(--primary-foreground)',
                    },
                },
                error: {
                    iconTheme: {
                        primary: 'var(--destructive)',
                        secondary: 'var(--destructive-foreground)',
                    },
                },
            }}
        />
    );
}
