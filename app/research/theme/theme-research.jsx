"use client";
import { useEffect } from 'react';
import { DesignStudio } from '@/components/dashboard/design-studio/DesignStudio';
import { LivePreview } from '@/components/settings/LivePreview';
import { useRestaurantStore } from '@/hooks/use-restaurant-store';

// Local experimental shell. The editor, transport, API and public menu are the
// application components; only the surrounding layout differs from the dashboard.
export default function ThemeResearch() {
  const { restaurant, previewData, fetchRestaurant } = useRestaurantStore();
  useEffect(() => { fetchRestaurant(); }, [fetchRestaurant]);
  const data = previewData || restaurant;
  return <main>
    <h1 className="text-sm p-2">Local synthetic theme comparison</h1>
    <div style={{ height: 220, overflow: 'auto' }}><DesignStudio /></div>
    <div style={{ height: 650, width: '100%' }}><LivePreview restaurant={data} minimal branding={data} /></div>
  </main>;
}
