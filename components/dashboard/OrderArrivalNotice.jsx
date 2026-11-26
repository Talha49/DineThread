"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";
import { useStaffOrders } from "@/hooks/use-staff-orders";

export function OrderArrivalNotice({ onBoard }) {
    const { data } = useStaffOrders("active", onBoard ? 4000 : 15000);
    const previousIds = useRef(null);
    const [arrivals, setArrivals] = useState([]);

    useEffect(() => {
        if (!data?.orders) return;
        // The first read establishes the backlog. Only later arrivals should alert staff.
        if (previousIds.current) {
            const added = data.orders.filter(order => order.status === "placed" && !previousIds.current.has(order._id));
            if (added.length) setArrivals(current => [...current, ...added.map(order => order.table?.label || "")]);
        }
        previousIds.current = new Set(data.orders.map(order => order._id));
    }, [data]);

    const message = arrivals.length === 1
        ? ["New order", arrivals[0]].filter(Boolean).join(" · ")
        : arrivals.length ? arrivals.length + " new orders" : "";
    return (
        <div className={arrivals.length ? "flex flex-wrap items-center gap-3 border-b border-indigo-300 bg-indigo-50 px-4 py-2 text-indigo-950" : ""}>
            {message && <Bell aria-hidden="true" className="size-4" />}
            <span role="status" aria-atomic="true" className="text-sm font-semibold">{message}</span>
            {message && <>
                {!onBoard && <Link href="/dashboard/orders" className="text-sm font-medium underline">View orders</Link>}
                <button type="button" aria-label="Dismiss new order notice" onClick={() => setArrivals([])} className="ms-auto grid size-11 place-items-center rounded-lg hover:bg-indigo-100">
                    <X aria-hidden="true" className="size-4" />
                </button>
            </>}
        </div>
    );
}
