"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShoppingCart, X, Plus, Minus, Trash2, Loader2, CheckCircle2, ChefHat, Bell, Receipt } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useCartStore, pendingPurchaseFor } from "@/hooks/use-cart-store";
import { sendCustomerOrder, cancelPendingPurchase, startNewCustomerOrder } from "@/lib/customer-order";
import { purchaseKey, syncPurchaseJournal } from "@/lib/purchase-journal";

const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API Error");
    return res.json();
};

const STATUS_STEPS = [
    { key: "placed", label: "Placed", icon: CheckCircle2 },
    { key: "preparing", label: "Preparing", icon: ChefHat },
    { key: "ready", label: "Ready", icon: Bell },
    { key: "served", label: "Served", icon: Receipt },
];

export function CartFAB({ restaurantId, tables, brandColor }) {
    const [isOpen, setIsOpen] = useState(false);
    const closeCart = useCallback(() => setIsOpen(false), []);
    const reduceMotion = useReducedMotion();
    const cartCount = useCartStore((s) => s.cartCount());
    const orderId = useCartStore((s) => s.orderId);

    useEffect(() => {
        const sync = (event) => {
            if (event?.key && event.key !== purchaseKey(restaurantId)) return;
            try { syncPurchaseJournal(restaurantId, useCartStore); } catch { /* Submission will show a storage error without sending. */ }
        };
        sync();
        window.addEventListener("storage", sync);
        window.addEventListener("focus", sync);
        return () => { window.removeEventListener("storage", sync); window.removeEventListener("focus", sync); };
    }, [restaurantId]);

    const showBadge = orderId ? true : cartCount > 0;

    return (
        <>
            <motion.button
                aria-label="Open cart and order status"
                initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileTap={reduceMotion ? undefined : { scale: 0.92 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-[130] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white"
                style={{ backgroundColor: brandColor || "#18181b" }}
            >
                <ShoppingCart className="w-6 h-6" />
                {showBadge && (
                    <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center">
                        {orderId ? "•" : cartCount}
                    </span>
                )}
            </motion.button>

            <CartDrawer restaurantId={restaurantId} tables={tables} isOpen={isOpen} onClose={closeCart} brandColor={brandColor} />
        </>
    );
}

function CartDrawer({ restaurantId, tables, isOpen, onClose, brandColor }) {
    const orderId = useCartStore((s) => s.orderId);
    const reduceMotion = useReducedMotion();
    const pending = useCartStore((s) => !!pendingPurchaseFor(s, restaurantId));
    const dialog = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const previous = document.activeElement;
        const handleKey = (event) => {
            if (event.key === "Escape") onClose();
            if (event.key !== "Tab") return;
            const controls = [...(dialog.current?.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]') || [])];
            const first = controls[0], last = controls[controls.length - 1];
            if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("keydown", handleKey);
            if (previous?.isConnected) previous.focus();
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) dialog.current?.focus();
    }, [isOpen, orderId, pending]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={reduceMotion ? { duration: 0 } : undefined}
                        className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        ref={dialog}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Cart and order status"
                        tabIndex={-1}
                        initial={reduceMotion ? false : { y: "100%" }}
                        animate={{ y: 0 }}
                        exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
                        transition={reduceMotion ? { duration: 0 } : { type: "spring", damping: 28, stiffness: 240 }}
                        className="fixed inset-x-0 bottom-0 z-[150] bg-white rounded-t-[2.5rem] shadow-2xl max-w-xl mx-auto max-h-[85vh] flex flex-col outline-none"
                    >
                        <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mt-4" />
                        <button
                            aria-label="Close cart"
                            onClick={onClose}
                            className="absolute top-5 right-5 rtl:right-auto rtl:left-5 w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="overflow-y-auto p-6 md:p-8">
                            {orderId ? (
                                <OrderStatusPanel restaurantId={restaurantId} orderId={orderId} brandColor={brandColor} onClose={onClose} />
                            ) : (
                                <CartPanel restaurantId={restaurantId} tables={tables} brandColor={brandColor} onClose={onClose} />
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function CartPanel({ restaurantId, tables, brandColor, onClose }) {
    const items = useCartStore((s) => s.items);
    const tableId = useCartStore((s) => s.tableId);
    const updateQty = useCartStore((s) => s.updateQty);
    const setTable = useCartStore((s) => s.setTable);
    const needsPriceConfirmation = useCartStore((s) => s.needsPriceConfirmation);
    const pending = useCartStore((s) => pendingPurchaseFor(s, restaurantId));
    const submitting = useRef(false);
    const [isPlacing, setIsPlacing] = useState(false);
    const [error, setError] = useState("");

    const total = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

    const handlePlaceOrder = async () => {
        if (submitting.current) return;
        if (!pending && !tableId) {
            setError("Please select your table first.");
            return;
        }
        submitting.current = true;
        setIsPlacing(true);
        setError("");
        try {
            const result = await sendCustomerOrder({ restaurantId, tableId, items, store: useCartStore });
            if (result.outcome) setError(`${result.message} No order was placed. Check your cart before trying again.`);
        } catch (failure) {
            setError(failure.name === "TimeoutError" || failure instanceof TypeError
                ? "Confirmation has not arrived. Check the connection, then retry this same purchase."
                : failure.message);
        } finally {
            submitting.current = false;
            setIsPlacing(false);
        }
    };

    const handleCancel = async () => {
        if (submitting.current) return;
        submitting.current = true;
        setIsPlacing(true);
        setError("");
        try {
            const result = await cancelPendingPurchase({ restaurantId, store: useCartStore });
            if (result.outcome) setError(result.message);
            else toast("The restaurant already accepted this purchase. Its confirmation is shown here.");
        } catch (failure) { setError(failure.message); }
        finally { submitting.current = false; setIsPlacing(false); }
    };

    if (pending) {
        return (
            <div className="space-y-5">
                <h2 className="text-2xl font-black">Check your purchase</h2>
                <p className="text-sm text-zinc-700" role="status">We have kept the details of your submitted purchase. Retry to confirm its status before placing another order.</p>
                {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                <Button onClick={handlePlaceOrder} disabled={isPlacing} className="w-full h-14 rounded-2xl">
                    {isPlacing ? "Checking purchase…" : "Retry same purchase"}
                </Button>
                <button onClick={handleCancel} disabled={isPlacing} className="w-full rounded-2xl border border-zinc-300 p-3 text-sm font-semibold text-zinc-800 disabled:opacity-50">Cancel pending purchase</button>
                <p className="text-sm text-zinc-600">Cancellation only stops a purchase that has not been accepted. If it is already placed, we will show its confirmation. If your browser session is lost, ask staff to check the order.</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <ShoppingCart className="w-10 h-10 text-zinc-300 mx-auto mb-4" />
                <p className="font-bold text-lg">Your cart is empty</p>
                <p className="text-zinc-400 text-sm mt-1">Add a dish to start your order.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black italic tracking-tighter">Your Order</h2>
            {needsPriceConfirmation && <p role="status" className="text-sm text-zinc-700">Your selected prices have changed. Review the amounts below, then confirm if you want to continue.</p>}

            <div className="space-y-3">
                {items.map((line) => (
                    <div key={line.key} className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50">
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{line.name}</p>
                            {(line.variantName || line.modifierNames?.length > 0) && (
                                <p className="text-xs text-zinc-400 truncate">
                                    {[line.variantName, ...(line.modifierNames || [])].filter(Boolean).join(", ")}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-xl px-1.5">
                            <button aria-label={`Remove one ${line.name}`} onClick={() => updateQty(line.key, line.qty - 1)} className="w-7 h-7 flex items-center justify-center">
                                {line.qty === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5" />}
                            </button>
                            <span className="w-5 text-center text-sm font-bold">{line.qty}</span>
                            <button aria-label={`Add one ${line.name}`} onClick={() => updateQty(line.key, line.qty + 1)} className="w-7 h-7 flex items-center justify-center">
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <span className="font-bold text-sm w-16 text-right">${(line.unitPrice * line.qty).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">Which table are you at?</label>
                <div className="flex flex-wrap gap-2">
                    {tables.map((tbl) => (
                        <button
                            key={tbl._id}
                            aria-pressed={tableId === tbl._id}
                            onClick={() => setTable(tbl._id)}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all",
                                tableId === tbl._id ? "text-white border-transparent" : "border-zinc-100 bg-zinc-50 text-zinc-600"
                            )}
                            style={tableId === tbl._id ? { backgroundColor: brandColor || "#18181b" } : undefined}
                        >
                            {tbl.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && <p role="alert" className="text-sm text-red-700 font-medium">{error}</p>}

            <Button
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                className="w-full h-16 rounded-2xl font-black uppercase tracking-wider text-base"
                style={{ backgroundColor: brandColor || undefined }}
            >
                {isPlacing ? <Loader2 className="w-5 h-5 animate-spin" /> : `${needsPriceConfirmation ? "Confirm updated prices" : "Place Order"} - $${total.toFixed(2)}`}
            </Button>
        </div>
    );
}

function OrderStatusPanel({ restaurantId, orderId, brandColor, onClose }) {
    const { data, error, mutate } = useSWR(`/p/orders/${orderId}`, fetcher, { refreshInterval: 4000 });
    const [requestingBill, setRequestingBill] = useState(false);
    const prevStatus = useRef(null);

    const order = data?.order;
    const status = order?.status;

    useEffect(() => {
        if (!status) return;
        if (prevStatus.current && prevStatus.current !== "ready" && status === "ready") {
            toast.success("Your order is ready!", { icon: "🔔", duration: 6000 });
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
        prevStatus.current = status;
    }, [status]);

    if (!order && error) {
        return <div className="space-y-4"><p role="alert">This order cannot be shown in this browser right now. Check your connection or ask staff to find the order.</p><Button onClick={() => mutate()}>Try again</Button></div>;
    }
    if (!order) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

    const handleRequestBill = async () => {
        setRequestingBill(true);
        try {
            const response = await fetch(`/p/orders/${orderId}/request-bill`, { method: "POST" });
            if (!response.ok) throw new Error("Bill request was not confirmed. Please try again or ask staff.");
            mutate();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setRequestingBill(false);
        }
    };

    const handleStartNewOrder = async () => {
        try {
            await startNewCustomerOrder({ restaurantId, store: useCartStore });
            onClose();
        } catch (error) { toast.error(error.message); }
    };

    return (
        <div className="space-y-8">
            <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">{order.table?.label}</p>
                <h2 className="text-2xl font-black italic tracking-tighter">Order Status</h2>
            </div>

            <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isDone = i <= currentStepIndex;
                    return (
                        <div key={step.key} className="flex-1 flex flex-col items-center gap-2 relative">
                            {i > 0 && (
                                <div
                                    className="absolute top-5 right-1/2 w-full h-0.5 -z-10"
                                    style={{ backgroundColor: i <= currentStepIndex ? (brandColor || "#18181b") : "#e4e4e7" }}
                                />
                            )}
                            <div
                                className={cn("w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all", isDone ? "text-white border-transparent" : "bg-zinc-50 border-zinc-100 text-zinc-300")}
                                style={isDone ? { backgroundColor: brandColor || "#18181b" } : undefined}
                            >
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", isDone ? "text-zinc-900" : "text-zinc-300")}>{step.label}</span>
                        </div>
                    );
                })}
            </div>

            <div className="space-y-2">
                {order.items.map((line, i) => (
                    <div key={i} className="flex justify-between text-sm">
                        <span className="font-medium">{line.qty}x {line.name}{line.variantName ? ` (${line.variantName})` : ""}</span>
                        <span className="font-bold">${line.lineTotal.toFixed(2)}</span>
                    </div>
                ))}
                <div className="flex justify-between pt-3 border-t font-black">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                </div>
            </div>

            {order.status === "served" && !order.billRequested && (
                <Button onClick={handleRequestBill} disabled={requestingBill} className="w-full h-14 rounded-2xl font-bold uppercase tracking-wider">
                    {requestingBill ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Bill"}
                </Button>
            )}
            {order.billRequested && order.status !== "paid" && (
                <p className="text-center text-sm font-bold text-zinc-500">Bill requested - your server is on the way.</p>
            )}
            {order.status === "paid" && (
                <Button onClick={handleStartNewOrder} className="w-full h-14 rounded-2xl font-bold uppercase tracking-wider">
                    Start a New Order
                </Button>
            )}
        </div>
    );
}
