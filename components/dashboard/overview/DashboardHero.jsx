"use client";

import { useState } from 'react';
import { Sparkles, ArrowRight, ExternalLink, QrCode, Utensils, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/store/useTranslation';
import Link from 'next/link';
import Image from 'next/image';

export function DashboardHero({ restaurantName, restaurantId, menuItems }) {
    const { t } = useTranslation();
    const available = menuItems.filter(item => item.isAvailable !== false);
    const [pageIndex, setPageIndex] = useState(0);
    const pageCount = Math.ceil(available.length / 2);
    const page = Math.min(pageIndex, Math.max(0, pageCount - 1));
    const dishes = available.slice(page * 2, page * 2 + 2);
    function turnPage(step) {
        setPageIndex(index => (Math.min(index, pageCount - 1) + pageCount + step) % pageCount);
    }
    return (
        <div className="dt-staff-hero">
            <div className="dt-staff-grid">
                <div className="min-w-0">
                    <h1 className="dt-staff-title">
                        Welcome back to<br />
                        <span className="text-indigo-300">{restaurantName}</span>
                    </h1>
                    <p className="dt-staff-copy">Manage your menu, adjust its appearance and share it with your guests.</p>
                    <div className="dt-staff-actions">
                        <Link href={`/menu/${restaurantId}`} target="_blank" className="dt-action dt-action-primary">
                            <ExternalLink aria-hidden="true" className="size-4" /> Launch live menu
                        </Link>
                        <Link href="/dashboard/qr" className="dt-action dt-action-on-dark">
                            <QrCode aria-hidden="true" className="size-4" /> Get QR codes
                        </Link>
                    </div>
                </div>
                <div className="min-w-0">
                    <div className="dt-menu-preview rounded-3xl border border-white/20 p-4 text-white shadow-xl">
                      <div className="dt-dish-toolbar">
                        <span className="flex items-center gap-2 text-sm font-semibold"><Sparkles aria-hidden="true" className="size-4 text-indigo-300" /> Menu preview</span>
                        {pageCount > 1 && <div className="dt-dish-pager">
                            <button type="button" aria-label={t('dashboard.preview.previous')} onClick={() => turnPage(-1)}>
                                <ChevronLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
                            </button>
                            <span aria-hidden="true">{page + 1} / {pageCount}</span>
                            <button type="button" aria-label={t('dashboard.preview.next')} onClick={() => turnPage(1)}>
                                <ChevronRight aria-hidden="true" className="size-4 rtl:rotate-180" />
                            </button>
                        </div>}
                      </div>
                      <Link href="/dashboard/settings" className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300">
                        {dishes.length ? (
                            <div key={page} className="dt-dish-spread mt-3 grid grid-cols-2 gap-3">
                                {dishes.map(dish => (
                                    <div key={dish._id}>
                                        <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-zinc-700">
                                            {dish.imageUrl ? (
                                                <Image src={dish.imageUrl} alt="" fill sizes="160px" className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105 motion-safe:group-focus-visible:scale-105" />
                                            ) : <Utensils aria-hidden="true" className="absolute inset-0 m-auto size-6 text-zinc-300" />}
                                        </div>
                                        <span className="dt-dish-name mt-2 block text-sm font-medium">{dish.name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="my-6 text-sm text-zinc-300">Available dishes will appear here when you add them to your menu.</p>}
                        <span className="mt-4 flex items-center justify-between border-t border-white/15 pt-3 text-sm font-semibold">
                            Enter Design Studio <span className="dt-studio-arrow"><ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" /></span>
                        </span>
                      </Link>
                      <span className="sr-only" role="status">{dishes.map(dish => dish.name).join(', ')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
