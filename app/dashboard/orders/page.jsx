"use client";

import useSWR from "swr";
import { useState, useEffect, useRef } from "react";
import { pendingStaffActions, sendStaffAction } from '@/lib/staff-action';
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

export default function OrdersPage() {
    const [view, setView] = useState("active");
    const { data, mutate } = useSWR(view === "history" ? "/api/orders?view=history" : "/api/orders", fetcher, {
        refreshInterval: view === "active" ? 4000 : 0,
    });
    const [advancingId, setAdvancingId] = useState(null);
    const [pending, setPending] = useState({});
    const [actionError, setActionError] = useState('');
    const busy = useRef(false);
    useEffect(() => { try { setPending(pendingStaffActions()); } catch { setActionError('Action storage is unavailable. Contact staff before updating orders.'); } }, []);

    const orders = data?.orders || [];

    const handleAdvance = async (order, nextStatus) => {
        if (busy.current) return;
        busy.current = true;
        setAdvancingId(order._id);
        setActionError('');
        try {
            await sendStaffAction(order, nextStatus);
        } catch (error) {
            setActionError(error instanceof TypeError || error.name === 'TimeoutError' ? 'The update was not confirmed. Retry the saved action to check its outcome.' : error.message);
        } finally {
            try { setPending(pendingStaffActions()); } catch {}
            try { await mutate(); } catch { /* The board will retry its read; never replay a stale command. */ }
            busy.current = false;
            setAdvancingId(null);
        }
    };

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

            {actionError && <p role="alert" className="text-red-700">{actionError}</p>}
            {Object.entries(pending).map(([id, command]) => <div key={id} className="rounded-xl border border-amber-600 p-4 space-y-2">
                <p role="status">An update to {command.status} is waiting for confirmation. Check this saved action before making another decision on the order.</p>
                <Button disabled={!!advancingId} onClick={() => handleAdvance({ _id: id }, command.status)}>Retry saved action</Button>
            </div>)}

            {view === "history" && data && (
                <Card className="p-5 bg-primary/5 border-primary/10 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-sm font-medium">
                        <span className="font-black">{data.summary?.paidCount || 0}</span> paid orders in total
                    </p>
                    <p className="text-lg font-black">${((data.summary?.totalPence || 0) / 100).toFixed(2)} recorded</p>
                </Card>
            )}

            {!data ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : view === 'history' ? (
                <div className="space-y-3">
                    {orders.length === 0 && <p>No paid orders.</p>}
                    {orders.map(order => <Card key={order._id} data-order-id={order._id} data-version={order.workflowVersion} className="p-4 flex justify-between gap-4">
                        <div><h2 className="font-bold">{order.table?.label || 'Table'} — Paid</h2><p className="text-sm">{formatDateTime(order.statusUpdatedAt)}</p></div>
                        <p className="font-bold">${order.total.toFixed(2)}</p>
                    </Card>)}
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
                                        <Card key={order._id} data-order-id={order._id} data-version={order.workflowVersion} className={cn("relative", order.billRequested && "ring-2 ring-amber-400")}>
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
                                                        disabled={!!advancingId || !!pending[order._id]}
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
