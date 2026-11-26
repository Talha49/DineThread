import useSWR from "swr";
import { useRestaurantStore } from "@/hooks/use-restaurant-store";

async function readOrders([url]) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Could not load kitchen orders");
    return response.json();
}

export function useStaffOrders(view = "active", refreshInterval = 0) {
    const restaurantId = useRestaurantStore(state => state.restaurant?.restaurantId);
    const url = view === "history" ? "/api/orders?view=history" : "/api/orders";
    return useSWR(restaurantId ? [url, restaurantId] : null, readOrders, { refreshInterval });
}
