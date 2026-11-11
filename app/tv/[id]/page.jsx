"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { Loader2, Tv } from "lucide-react";
import { TVCarousel } from "@/components/tv/TVCarousel";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function TVPage() {
    const { id } = useParams();
    // Poll slower for TV (every 60s is fine)
    const { data, error, isLoading } = useSWR(`/api/public/menu/${id}`, fetcher, {
        refreshInterval: 60000,
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
            <h1 className="text-3xl font-light animate-pulse">Loading Digital Menu...</h1>
        </div>
    );

    if (error || data?.error) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8 text-center">
            <Tv className="w-24 h-24 text-muted-foreground mb-4 opacity-20" />
            <h1 className="text-4xl font-bold mb-4">Display Not Available</h1>
            <p className="text-xl text-muted-foreground">Please check the URL or restaurant subscription.</p>
        </div>
    );

    const { restaurant, menu } = data;

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col">
            {/* TV Header */}
            <header className="h-24 bg-card/80 backdrop-blur border-b flex items-center px-8 shrink-0 justify-between">
                <div className="flex items-center gap-6">
                    {restaurant.logoUrl && (
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 border-2 border-primary/20">
                            <img src={restaurant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">{restaurant.name}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Placeholder for future weather widget or clock */}
                    <span className="text-2xl font-mono opacity-60">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </header>

            {/* Main Carousel Area */}
            <main className="flex-1 relative">
                <TVCarousel menu={menu} brandColor={restaurant.brandColor} />
            </main>
        </div>
    );
}
