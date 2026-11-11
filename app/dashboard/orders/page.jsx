"use client";

import useSWR from "swr";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ClipboardList, Receipt, Loader2, CheckCircle2, ChefHat, Bell, PackageCheck, History, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API Error");
    return res.json();
};

const COLUMNS = [
    { status: "placed", label: "Placed", icon: CheckCircle2, next: "preparing", nextLabel: "Start Preparing" },
    { status: "preparing", label: "Preparing", icon: ChefHat, next: "ready", nextLabel: "Mark Ready" },
    { status: "ready", label: "Ready", icon: Bell, next: "served", nextLabel: "Mark Served" },
    { status: "served", label: "Served", icon: Receipt, next: "paid", nextLabel: "Mark Paid" },
];

function elapsed(createdAt) {
    const mins = Math.max(0, Math.round((Date.now() - new Date(createdAt).getTime()) / 60000));
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.round(mins / 60)}h ago`;
}

function formatDateTime(date) {
    return new Date(date).toLocaleString(undefined, {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });
}

function isToday(date) {
    const d = new Date(date);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export default function OrdersPage() {
    const [view, setView] = useState("active");
    const { data, mutate } = useSWR(view === "history" ? "/api/orders?view=history" : "/api/orders", fetcher, {
        refreshInterval: view === "active" ? 4000 : 0,
    });
    const [advancingId, setAdvancingId] = useState(null);

    const orders = data?.orders || [];

    const handleAdvance = async (order, nextStatus) => {
        setAdvancingId(order._id);
        try {
            await fetch(`/api/orders/${order._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus }),
            });
            mutate();
        } finally {
            setAdvancingId(null);
        }
    };

    const todaysOrders = orders.filter((o) => isToday(o.statusUpdatedAt));
    const todaysTotal = todaysOrders.reduce((sum, o) => sum + o.total, 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold font-display tracking-tight flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-primary" />
                        {view === "history" ? "Order History" : "Kitchen Board"}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {view === "history"
                            ? "Every paid order, most recent first."
                            : "Live orders from your tables. Tap a card to move it to the next stage."}
                    </p>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-zinc-100 rounded-2xl w-fit">
                    <button
                        onClick={() => setView("active")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
                            view === "active" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                        )}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" /> Active
                    </button>
                    <button
                        onClick={() => setView("history")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
                            view === "history" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                        )}
                    >
                        <History className="w-3.5 h-3.5" /> History
                    </button>
                </div>
            </div>

            {view === "history" && data && (
                <Card className="p-5 bg-primary/5 border-primary/10 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-sm font-medium">
                        <span className="font-black">{todaysOrders.length}</span> order{todaysOrders.length === 1 ? "" : "s"} paid today
                    </p>
                    <p className="text-lg font-black">${todaysTotal.toFixed(2)} today</p>
                </Card>
            )}

            {!data ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : (
                <div className="grid md:grid-cols-4 gap-4">
                    {COLUMNS.map((col) => {
                        const Icon = col.icon;
                        const colOrders = orders.filter((o) => o.status === col.status);
                        return (
                            <div key={col.status} className="space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                    <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{col.label}</h2>
                                    <span className="text-xs font-bold bg-zinc-100 text-zinc-500 rounded-full px-2 py-0.5">{colOrders.length}</span>
                                </div>

                                <div className="space-y-3 min-h-[100px]">
                                    {colOrders.length === 0 && (
                                        <div className="rounded-2xl border-2 border-dashed border-zinc-100 p-6 text-center text-xs text-muted-foreground">
                                            No orders
                                        </div>
                                    )}
                                    {colOrders.map((order) => (
                                        <Card key={order._id} className={cn("relative", order.billRequested && "ring-2 ring-amber-400")}>
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base">{order.table?.label || "Table"}</CardTitle>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{elapsed(order.createdAt)}</span>
                                                </div>
                                                {order.billRequested && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-600 mt-1">
                                                        <PackageCheck className="w-3 h-3" /> Bill requested
                                                    </span>
                                                )}
                                            </CardHeader>
                                            <CardContent className="space-y-3 pt-0">
                                                <div className="space-y-1">
                                                    {order.items.map((line, i) => (
                                                        <div key={i} className="flex justify-between text-xs">
                                                            <span className="font-medium">{line.qty}x {line.name}{line.variantName ? ` (${line.variantName})` : ""}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t">
                                                    <span className="text-sm font-black">${order.total.toFixed(2)}</span>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAdvance(order, col.next)}
                                                        disabled={advancingId === order._id}
                                                    >
                                                        {advancingId === order._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : col.nextLabel}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
